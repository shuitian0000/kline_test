import Taro from '@tarojs/taro'

// 常量定义（优化魔法数字）
const REGION_SIZE = 20
const EDGE_THRESHOLD = 50
const CONTRAST_THRESHOLD = 30
const MAX_CANVAS_WIDTH = 600
const MAX_CANVAS_HEIGHT = 800
const TILT_THRESHOLD = 30 // 头部倾斜最大允许角度

export interface LocalEvaluationResult {
  total_score: number
  composition_score: number
  pose_score: number | null
  angle_score: number
  distance_score: number
  height_score: number
  suggestions: {
    composition?: string
    pose?: string
    angle?: string
    distance?: string
    height?: string
  }
  scene_type: string
}

/* 工具函数 */
const clamp = (v: number, min = 0, max = 1) => Math.max(min, Math.min(max, v))
const rad2deg = (r: number) => (r * 180) / Math.PI

/* 人脸检测结构 */
interface FaceInfo {
  box: { x: number; y: number; w: number; h: number }
  landmarks: {
    leftEye: { x: number; y: number }
    rightEye: { x: number; y: number }
    nose: { x: number; y: number }
    chin: { x: number; y: number }
  }
}

/* 人脸检测（轻量） */
async function detectFace(imagePath: string): Promise<FaceInfo | null> {
  try {
    const res: any = await Taro.faceDetect({ src: imagePath, mode: 'fast' })
    if (!res?.faceInfo?.length) return null
    const f = res.faceInfo[0]
    return {
      box: { x: f.x, y: f.y, w: f.width, h: f.height },
      landmarks: {
        leftEye: f.landmark.leftEye,
        rightEye: f.landmark.rightEye,
        nose: f.landmark.nose,
        chin: f.landmark.chin
      }
    }
  } catch (error) {
    console.error('人脸检测失败:', error)
    return null
  }
}

/**
 * 分析图片的亮度分布
 * 返回：{mean: 平均亮度, histogram: 亮度直方图, darkRatio: 暗部比例, brightRatio: 亮部比例}
 */
function analyzeBrightnessDistribution(imageData: ImageData): {
  mean: number
  histogram: number[]
  darkRatio: number
  brightRatio: number
} {
  const data = imageData.data
  const histogram = new Array(256).fill(0)
  let totalBrightness = 0
  const pixelCount = data.length / 4

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i]
    const g = data[i + 1]
    const b = data[i + 2]
    const brightness = Math.round(0.299 * r + 0.587 * g + 0.114 * b)
    histogram[brightness]++
    totalBrightness += brightness
  }

  const mean = totalBrightness / pixelCount
  const normalizedMean = mean / 255

  // 动态调整暗部/亮部阈值（基于整体亮度）
  const darkThreshold = normalizedMean < 0.4 ? 60 : 85
  const brightThreshold = normalizedMean > 0.6 ? 190 : 170

  // 计算暗部和亮部比例
  let darkPixels = 0
  let brightPixels = 0
  for (let i = 0; i < 256; i++) {
    if (i < darkThreshold) darkPixels += histogram[i]
    if (i > brightThreshold) brightPixels += histogram[i]
  }

  return {
    mean: normalizedMean,
    histogram,
    darkRatio: darkPixels / pixelCount,
    brightRatio: brightPixels / pixelCount
  }
}

/**
 * 分析图片的色彩饱和度
 */
function analyzeColorSaturation(imageData: ImageData): number {
  const data = imageData.data
  let totalSaturation = 0
  const pixelCount = data.length / 4

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i]
    const g = data[i + 1]
    const b = data[i + 2]

    const max = Math.max(r, g, b)
    const min = Math.min(r, g, b)
    const saturation = max === 0 ? 0 : (max - min) / max

    totalSaturation += saturation
  }

  return totalSaturation / pixelCount
}

/**
 * 检测边缘和细节
 * 使用Sobel算子检测边缘
 */
function analyzeEdgeAndDetail(imageData: ImageData): {
  edgeStrength: number
  detailRichness: number
} {
  const { width, height, data } = imageData
  const gray: number[] = []

  // 转换为灰度
  for (let i = 0; i < data.length; i += 4) {
    const r = data[i]
    const g = data[i + 1]
    const b = data[i + 2]
    gray.push(0.299 * r + 0.587 * g + 0.114 * b)
  }

  let totalEdge = 0
  let edgePixels = 0

  // Sobel算子
  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      const idx = y * width + x

      // Gx (水平方向)
      const gx =
        -gray[idx - width - 1] +
        gray[idx - width + 1] -
        2 * gray[idx - 1] +
        2 * gray[idx + 1] -
        gray[idx + width - 1] +
        gray[idx + width + 1]

      // Gy (垂直方向)
      const gy =
        -gray[idx - width - 1] -
        2 * gray[idx - width] -
        gray[idx - width + 1] +
        gray[idx + width - 1] +
        2 * gray[idx + width] +
        gray[idx + width + 1]

      const magnitude = Math.sqrt(gx * gx + gy * gy)
      totalEdge += magnitude
      if (magnitude > EDGE_THRESHOLD) edgePixels++
    }
  }

  const validPixelCount = (width - 2) * (height - 2)
  const avgEdge = validPixelCount > 0 ? totalEdge / validPixelCount : 0
  const edgeRatio = validPixelCount > 0 ? edgePixels / validPixelCount : 0

  return {
    edgeStrength: Math.min(avgEdge / 500, 1),
    detailRichness: Math.min(edgeRatio * 2, 1)
  }
}

/**
 * 分析图片的对比度
 */
function analyzeContrast(imageData: ImageData): number {
  const data = imageData.data
  const brightnesses: number[] = []

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i]
    const g = data[i + 1]
    const b = data[i + 2]
    const brightness = 0.299 * r + 0.587 * g + 0.114 * b
    brightnesses.push(brightness)
  }

  if (brightnesses.length === 0) return 0

  // 计算标准差作为对比度指标
  const mean = brightnesses.reduce((sum, val) => sum + val, 0) / brightnesses.length
  const variance = brightnesses.reduce((sum, val) => sum + (val - mean) ** 2, 0) / brightnesses.length
  const stdDev = Math.sqrt(variance)

  return Math.min(stdDev / 128, 1) // 归一化到0-1
}

/**
 * 分析三分法构图
 */
function analyzeRuleOfThirds(imageData: ImageData): number {
  const { width, height, data } = imageData
  const thirdW = Math.floor(width / 3)
  const thirdH = Math.floor(height / 3)

  // 计算四个交叉点区域的兴趣度
  const points = [
    { x: thirdW, y: thirdH },
    { x: thirdW * 2, y: thirdH },
    { x: thirdW, y: thirdH * 2 },
    { x: thirdW * 2, y: thirdH * 2 }
  ]

  let totalInterest = 0
  let totalValidPixels = 0

  points.forEach((point) => {
    let regionInterest = 0
    let pixelCount = 0

    for (let dy = -REGION_SIZE; dy < REGION_SIZE; dy++) {
      for (let dx = -REGION_SIZE; dx < REGION_SIZE; dx++) {
        const x = point.x + dx
        const y = point.y + dy

        if (x >= 0 && x < width && y >= 0 && y < height) {
          const idx = (y * width + x) * 4
          const r = data[idx]
          const g = data[idx + 1]
          const b = data[idx + 2]

          // 计算该像素的"兴趣度"（对比度）
          const brightness = 0.299 * r + 0.587 * g + 0.114 * b
          regionInterest += Math.abs(brightness - 128)
          pixelCount++
        }
      }
    }

    if (pixelCount > 0) {
      totalInterest += regionInterest / pixelCount
      totalValidPixels++
    }
  })

  return totalValidPixels > 0 ? Math.min(totalInterest / (totalValidPixels * 128), 1) : 0
}

/**
 * 分析主体大小占比（用于距离评估）
 */
function analyzeSubjectSize(imageData: ImageData): {
  subjectRatio: number // 主体占画面的比例
  centerDensity: number // 中心密度
} {
  const { width, height, data } = imageData
  const centerX = Math.floor(width / 2)
  const centerY = Math.floor(height / 2)

  // 计算中心区域大小（1/3画面）
  const centerWidth = Math.floor(width / 3)
  const centerHeight = Math.floor(height / 3)

  let centerHighContrastPixels = 0
  let totalCenterPixels = 0
  let totalHighContrastPixels = 0

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * 4
      const r = data[idx]
      const g = data[idx + 1]
      const b = data[idx + 2]

      // 计算对比度（边缘强度）
      let contrast = 0
      if (x > 0 && x < width - 1 && y > 0 && y < height - 1) {
        const idx_left = (y * width + (x - 1)) * 4
        const idx_right = (y * width + (x + 1)) * 4
        const r_diff = Math.abs(r - data[idx_left]) + Math.abs(r - data[idx_right])
        const g_diff = Math.abs(g - data[idx_left + 1]) + Math.abs(g - data[idx_right + 1])
        const b_diff = Math.abs(b - data[idx_left + 2]) + Math.abs(b - data[idx_right + 2])
        contrast = (r_diff + g_diff + b_diff) / 3
      }

      const isHighContrast = contrast > CONTRAST_THRESHOLD
      if (isHighContrast) {
        totalHighContrastPixels++
      }

      // 检查是否在中心区域
      const inCenterX = Math.abs(x - centerX) < centerWidth / 2
      const inCenterY = Math.abs(y - centerY) < centerHeight / 2
      if (inCenterX && inCenterY) {
        totalCenterPixels++
        if (isHighContrast) {
          centerHighContrastPixels++
        }
      }
    }
  }

  const totalPixels = width * height
  const centerDensity = totalCenterPixels > 0 ? centerHighContrastPixels / totalCenterPixels : 0
  const subjectRatio = totalPixels > 0 ? totalHighContrastPixels / totalPixels : 0

  // 优化归一化系数：主体占比30%左右时达到1
  return {
    subjectRatio: Math.min(subjectRatio * 3, 1),
    centerDensity: Math.min(centerDensity * 2, 1)
  }
}

/**
 * 检测图片中心区域的内容密度
 */
function analyzeCenterFocus(imageData: ImageData): number {
  const { width, height, data } = imageData
  const centerX = Math.floor(width / 2)
  const centerY = Math.floor(height / 2)
  const regionSize = Math.min(width, height) / 4

  let centerInterest = 0
  let edgeInterest = 0
  let centerPixels = 0
  let edgePixels = 0

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * 4
      const r = data[idx]
      const g = data[idx + 1]
      const b = data[idx + 2]
      const brightness = 0.299 * r + 0.587 * g + 0.114 * b

      const distFromCenter = Math.sqrt((x - centerX) ** 2 + (y - centerY) ** 2)

      if (distFromCenter < regionSize) {
        centerInterest += Math.abs(brightness - 128)
        centerPixels++
      } else if (distFromCenter > regionSize * 2) {
        edgeInterest += Math.abs(brightness - 128)
        edgePixels++
      }
    }
  }

  const centerAvg = centerPixels > 0 ? centerInterest / centerPixels : 0
  const edgeAvg = edgePixels > 0 ? edgeInterest / edgePixels : 0

  // 中心区域应该比边缘更有"兴趣"
  return centerAvg > edgeAvg ? Math.min(centerAvg / 128, 1) : 0.5
}

/**
 * 本地评估照片 - 优化版（无人像分支）
 * @param imageData 图片像素数据
 * @param canvasWidth canvas宽度（原始比例）
 * @param canvasHeight canvas高度（原始比例）
 */
function evaluateOriginalAlgorithm(
  imageData: ImageData,
  canvasWidth: number,
  canvasHeight: number
): LocalEvaluationResult {
  console.log('获取图片数据成功，像素数:', imageData.data.length)
  
  // === 专业摄影评估指标分析 ===
  const brightnessInfo = analyzeBrightnessDistribution(imageData)
  const contrast = analyzeContrast(imageData)
  const saturation = analyzeColorSaturation(imageData)
  const edgeInfo = analyzeEdgeAndDetail(imageData)
  const ruleOfThirds = analyzeRuleOfThirds(imageData)
  const centerFocus = analyzeCenterFocus(imageData)
  const subjectSize = analyzeSubjectSize(imageData)

  console.log('图片分析完成:', {
    brightness: brightnessInfo.mean,
    contrast,
    saturation,
    edgeStrength: edgeInfo.edgeStrength,
    detailRichness: edgeInfo.detailRichness,
    ruleOfThirds,
    centerFocus,
    subjectRatio: subjectSize.subjectRatio,
    centerDensity: subjectSize.centerDensity
  })

  // === 计算各维度得分（借鉴专业评估模型）===
  // 1. 构图得分 (30分)
  const compositionBase = ruleOfThirds * 0.5 + centerFocus * 0.3 + edgeInfo.detailRichness * 0.2
  let compositionScore = Math.round(compositionBase * 30)
  // 构图加分项：细节丰富度（限制上限30）
  if (edgeInfo.detailRichness > 0.6) {
    compositionScore = Math.min(compositionScore + 2, 30)
  }

  // 2. 角度得分 (20分)
  const angleBase = contrast * 0.5 + edgeInfo.edgeStrength * 0.5
  let angleScore = Math.round(angleBase * 20)
  // 角度加分项：高对比度（限制上限20）
  if (contrast > 0.6) {
    angleScore = Math.min(angleScore + 2, 20)
  }

  // 3. 距离得分 (10分)
  let distanceScore = 0
  if (subjectSize.subjectRatio >= 0.4 && subjectSize.subjectRatio <= 0.6) {
    distanceScore = 10
  } else if (subjectSize.subjectRatio >= 0.3 && subjectSize.subjectRatio <= 0.7) {
    distanceScore = 8
  } else if (subjectSize.subjectRatio >= 0.2 && subjectSize.subjectRatio <= 0.8) {
    distanceScore = 6
  } else if (subjectSize.subjectRatio < 0.2) {
    distanceScore = 4
  } else {
    distanceScore = 5
  }

  // 4. 光线得分 (10分)
  let heightScore = 0
  if (brightnessInfo.mean >= 0.35 && brightnessInfo.mean <= 0.65) {
    heightScore = 10
  } else if (brightnessInfo.mean >= 0.25 && brightnessInfo.mean <= 0.75) {
    heightScore = 8
  } else if (brightnessInfo.mean >= 0.15 && brightnessInfo.mean <= 0.85) {
    heightScore = 6
  } else {
    heightScore = 4
  }
  // 光线加分项：色彩饱和度适中（限制上限10）
  if (saturation >= 0.3 && saturation <= 0.7) {
    heightScore = Math.min(heightScore + 1, 10)
  }
  // 光线减分项：过度曝光或欠曝（限制下限0）
  if (brightnessInfo.darkRatio > 0.4 || brightnessInfo.brightRatio > 0.4) {
    heightScore = Math.max(heightScore - 2, 0)
  }

  // 5. 姿态得分 (30分) - 本地无法准确判断，给基础分
  const poseScore = null
  let poseBaseScore = 18 // 默认60%
  if (centerFocus > 0.7 && edgeInfo.detailRichness > 0.5) {
    poseBaseScore = 20
  } else if (centerFocus < 0.4 && ruleOfThirds > 0.6) {
    poseBaseScore = 22
  }

  // 总分计算（限制0-100）
  const totalScore = Math.min(
    compositionScore + angleScore + distanceScore + heightScore + poseBaseScore,
    100
  )

  // === 生成专业建议 ===
  const suggestions: LocalEvaluationResult['suggestions'] = {}
  const imageAspectRatio = canvasWidth / canvasHeight
  const isPortrait = imageAspectRatio < 1 // 竖屏
  const isLandscape = imageAspectRatio > 1.3 // 横屏

  // 构图建议
  if (compositionScore < 18) {
    if (ruleOfThirds < 0.4) {
      if (centerFocus > 0.6) {
        suggestions.composition = '主体过于居中，建议向左或向右移动1/3画面，使构图更有张力'
      } else {
        suggestions.composition = '主体位置分散，建议将主体移至画面右侧1/3处，突出视觉焦点'
      }
    } else if (centerFocus < 0.4) {
      suggestions.composition = '主体不够突出，建议靠近2-3步，让主体占据画面50-60%'
    } else {
      suggestions.composition = '构图较平淡，建议尝试对角线构图或引导线构图增加动感'
    }
  } else if (compositionScore < 24) {
    if (edgeInfo.detailRichness < 0.5) {
      suggestions.composition = '画面细节不足，建议靠近主体1-2步，或选择背景更丰富的位置'
    } else {
      suggestions.composition = '构图良好，可微调主体位置至黄金分割点（画面左侧或右侧约38%处）'
    }
  } else if (compositionScore < 28) {
    suggestions.composition = '构图优秀，画面平衡感强，保持当前构图'
  }

  // 角度建议
  if (angleScore < 12) {
    if (contrast < 0.3) {
      if (centerFocus > 0.6) {
        suggestions.angle = '角度平视缺乏变化，建议从斜上方45度拍摄，显脸小、腿长，提升人物气质'
      } else {
        suggestions.angle = '角度平淡，建议降低机位从下往上拍，或升高机位俯拍，增加视觉冲击'
      }
    } else if (edgeInfo.edgeStrength < 0.3) {
      suggestions.angle = '缺乏立体感，建议侧身45度角拍摄，突出身材曲线和轮廓线条'
    } else {
      suggestions.angle = '角度常规，尝试从侧面或斜后方拍摄，展现人物侧脸轮廓和身材比例'
    }
  } else if (angleScore < 16) {
    if (centerFocus > 0.6) {
      suggestions.angle = '角度合理，可尝试微微仰拍（相机低于眼睛10-15cm），拉长腿部线条'
    } else {
      suggestions.angle = '角度不错，可尝试从对角线方向拍摄，增加画面纵深感'
    }
  } else if (angleScore < 19) {
    suggestions.angle = '拍摄角度出色，很好地展现了主体特点和空间感'
  }

  // 距离建议
  if (distanceScore < 5) {
    if (subjectSize.subjectRatio < 0.2) {
      suggestions.distance = '距离过远，主体太小，建议靠近3-5步，让主体占据画面40-60%'
    } else if (subjectSize.subjectRatio > 0.8) {
      suggestions.distance = '距离过近，画面局促，建议后退2-3步，留出适当呼吸空间'
    } else {
      suggestions.distance = '主体位置不佳，建议调整拍摄距离使主体更突出'
    }
  } else if (distanceScore < 7) {
    if (subjectSize.subjectRatio < 0.3) {
      suggestions.distance = '距离稍远，建议靠近1-2步，突出人物面部表情和细节'
    } else if (subjectSize.subjectRatio > 0.7) {
      suggestions.distance = '距离稍近，建议后退1步，拍摄全身或七分身，展现完整身材比例'
    } else {
      suggestions.distance = '距离基本合适，可微调以获得更好的景深效果'
    }
  } else if (distanceScore < 9) {
    suggestions.distance = '距离恰当，主体突出且背景协调，保持当前距离'
  }

  // 机位高度建议
  if (heightScore < 6) {
    if (brightnessInfo.mean < 0.3) {
      suggestions.height = '光线不足，建议提高机位10-20cm，利用自然光从上方照亮面部，提升肤色'
    } else if (brightnessInfo.mean > 0.7) {
      suggestions.height = '曝光过度，建议降低机位15-20cm，避免顶光造成面部阴影，柔化光线'
    } else if (brightnessInfo.darkRatio > 0.5) {
      suggestions.height = '暗部过多，建议升高机位20-30cm，从斜上方拍摄，增加面部受光面积'
    } else if (brightnessInfo.brightRatio > 0.5) {
      suggestions.height = '高光过曝，建议降低机位至胸部高度，避免强光直射，保留细节'
    } else {
      suggestions.height = '光线欠佳，建议调整机位高度：升高10-15cm或降低10-15cm改善光线'
    }
  } else if (heightScore < 9) {
    if (saturation < 0.3) {
      suggestions.height = '色彩平淡，建议升高机位至眼睛上方10cm，俯拍显脸小、眼睛大'
    } else if (saturation > 0.7) {
      suggestions.height = '色彩过饱和，建议降低机位至腰部高度，仰拍拉长身材、显腿长'
    } else {
      if (subjectSize.subjectRatio > 0.5) {
        suggestions.height = '机位可优化：升高5-10cm俯拍显脸小，或降低5-10cm仰拍显腿长'
      } else {
        suggestions.height = '机位基本合适，可微调：升高10cm增加视野，降低10cm增加气势'
      }
    }
  } else if (heightScore < 10) {
    if (subjectSize.subjectRatio > 0.6) {
      suggestions.height = '光线良好，可微调机位：升高5cm显气质，降低5cm显亲和'
    }
  }

  // 人物姿态建议（针对人像场景）
  if (centerFocus > 0.6 && edgeInfo.detailRichness > 0.4 && !suggestions.pose) {
    if (isPortrait) {
      suggestions.pose = '建议：身体微侧45度，一腿在前显腿长，手臂不要紧贴身体，营造空间感'
    } else if (isLandscape) {
      suggestions.pose = '建议：采用S型曲线姿势，重心放一侧，头部微倾，展现身材曲线'
    } else {
      suggestions.pose = '建议：上半身微转向侧面，下巴微抬，眼神看向镜头上方，显脸小有气质'
    }
  }

  // 场景类型判断
  let sceneType = 'other'
  if (centerFocus > 0.7 && edgeInfo.detailRichness > 0.5) {
    sceneType = 'portrait'
  } else if (centerFocus < 0.4 && ruleOfThirds > 0.6) {
    sceneType = 'landscape'
  } else if (centerFocus > 0.5 && ruleOfThirds > 0.5) {
    sceneType = 'group'
  }

  console.log('评估完成，总分:', totalScore, '场景类型:', sceneType)

  return {
    total_score: Math.max(totalScore, 0), // 确保不小于0
    composition_score: compositionScore,
    pose_score: poseScore,
    angle_score: angleScore,
    distance_score: distanceScore,
    height_score: heightScore,
    suggestions,
    scene_type: sceneType
  }
}

/**
 * 路线3增强算法 - 有人像分支
 */
function evaluatePortrait(face: FaceInfo, width: number, height: number): LocalEvaluationResult {
  const suggestions: LocalEvaluationResult['suggestions'] = {}

  /* 构图 */
  const cx = face.box.x + face.box.w / 2
  const cy = face.box.y + face.box.h / 2
  const dx = Math.abs(cx - width / 2) / width
  const dy = Math.abs(cy - height / 2) / height
  const compositionScore = Math.round(clamp(1 - (dx + dy)) * 30)
  if (dx > 0.1) {
    suggestions.composition = cx > width / 2 ? '人物偏右，请向左移动' : '人物偏左，请向右移动'
  }

  /* 姿态分析（优化倾斜度计算） */
  const { leftEye, rightEye } = face.landmarks
  const tilt = Math.abs(
    rad2deg(Math.atan2(rightEye.y - leftEye.y, rightEye.x - leftEye.x)) % 180
  )
  const poseScore = Math.round(clamp(1 - tilt / TILT_THRESHOLD) * 30)
  if (tilt > 6) {
    suggestions.pose = rightEye.y > leftEye.y
      ? `头部向右倾斜约 ${tilt.toFixed(1)}°，请向左调整`
      : `头部向左倾斜约 ${tilt.toFixed(1)}°，请向右调整`
  }

  /* 拍摄角度 */
  const eyeY = (leftEye.y + rightEye.y) / 2
  const angleScore = Math.round(clamp(1 - Math.abs(eyeY - height / 2) / (height / 2)) * 20)
  if (eyeY < height * 0.4) {
    suggestions.angle = '拍摄角度偏高，可降低机位'
  } else if (eyeY > height * 0.6) {
    suggestions.angle = '拍摄角度偏低，可抬高机位'
  }

  /* 距离 */
  const faceArea = face.box.w * face.box.h
  const totalArea = width * height
  const faceAreaRatio = totalArea > 0 ? faceArea / totalArea : 0
  const distanceScore = Math.round(clamp(faceAreaRatio / 0.2) * 10)
  if (faceAreaRatio < 0.15) {
    suggestions.distance = '主体较小，请靠近'
  } else if (faceAreaRatio > 0.3) {
    suggestions.distance = '主体过大，请后退'
  }

  /* 光线/高度 */
  const heightScore = 10

  /* 总分（限制0-100） */
  const totalScore = Math.min(
    compositionScore + poseScore + angleScore + distanceScore + heightScore,
    100
  )

  return {
    total_score: totalScore,
    composition_score: compositionScore,
    pose_score: poseScore, // 修复未定义问题
    angle_score: angleScore,
    distance_score: distanceScore,
    height_score: heightScore,
    suggestions,
    scene_type: 'portrait'
  }
}

/**
 * 主函数（优化异步逻辑和Canvas尺寸）
 */
export async function evaluatePhotoLocally(imagePath: string): Promise<LocalEvaluationResult> {
  try {
    const canvas = Taro.createOffscreenCanvas({ type: '2d' })
    const ctx = canvas.getContext('2d') as CanvasRenderingContext2D
    if (!ctx) {
      throw new Error('无法创建Canvas上下文')
    }

    // 加载图片并获取原始尺寸
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const image = canvas.createImage()
      image.onload = () => resolve(image)
      image.onerror = () => reject(new Error('图片加载失败'))
      image.src = imagePath
    })

    // 计算等比例缩放后的尺寸
    const scaleX = MAX_CANVAS_WIDTH / img.width
    const scaleY = MAX_CANVAS_HEIGHT / img.height
    const scale = Math.min(scaleX, scaleY, 1) // 不放大图片
    const canvasWidth = Math.floor(img.width * scale)
    const canvasHeight = Math.floor(img.height * scale)

    // 设置Canvas尺寸并绘制图片
    canvas.width = canvasWidth
    canvas.height = canvasHeight
    ctx.drawImage(img, 0, 0, canvasWidth, canvasHeight)

    const imageData = ctx.getImageData(0, 0, canvasWidth, canvasHeight)

    // 尝试检测人像
    const face = await detectFace(imagePath)
    if (face) {
      // 有人像 → 路线3增强算法
      return evaluatePortrait(face, canvasWidth, canvasHeight)
    } else {
      // 无人像 → 原算法
      return evaluateOriginalAlgorithm(imageData, canvasWidth, canvasHeight)
    }
  } catch (error) {
    console.error('图片评估失败:', error)
    throw error
  }
}

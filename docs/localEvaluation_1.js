import Taro from '@tarojs/taro'

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
  } catch {
    return null
  }
}

/* ===========================================
 * 原算法 - 无人像分支（完整保留）
 * 包含：
 * 1. 亮度分布分析
 * 2. 对比度分析
 * 3. 色彩饱和度分析
 * 4. 边缘和细节分析
 * 5. 三分法构图分析
 * 6. 中心焦点分析
 * 7. 主体大小分析
 * 包含原始评分计算、原注释、原建议、原场景类型判断
 * =========================================== */
function evaluateOriginalAlgorithm(imageData: ImageData): LocalEvaluationResult {
  const { width, height, data } = imageData

  // === 1. 亮度分布分析 ===
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
  let darkPixels = 0
  let brightPixels = 0
  for (let i = 0; i < 256; i++) {
    if (i < 85) darkPixels += histogram[i]
    if (i > 170) brightPixels += histogram[i]
  }

  const brightnessMean = mean / 255
  const darkRatio = darkPixels / pixelCount
  const brightRatio = brightPixels / pixelCount

  // === 2. 对比度分析 ===
  const brightnesses: number[] = []
  for (let i = 0; i < data.length; i += 4) {
    const r = data[i]
    const g = data[i + 1]
    const b = data[i + 2]
    const brightness = 0.299 * r + 0.587 * g + 0.114 * b
    brightnesses.push(brightness)
  }
  const meanB = brightnesses.reduce((a, b) => a + b, 0) / brightnesses.length
  const variance = brightnesses.reduce((a, b) => a + (b - meanB) ** 2, 0) / brightnesses.length
  const stdDev = Math.sqrt(variance)
  const contrast = Math.min(stdDev / 128, 1)

  // === 3. 色彩饱和度分析 ===
  let totalSaturation = 0
  for (let i = 0; i < data.length; i += 4) {
    const r = data[i]
    const g = data[i + 1]
    const b = data[i + 2]
    const max = Math.max(r, g, b)
    const min = Math.min(r, g, b)
    const saturation = max === 0 ? 0 : (max - min) / max
    totalSaturation += saturation
  }
  const saturation = totalSaturation / pixelCount

  // === 4. 边缘和细节分析 ===
  const gray: number[] = []
  for (let i = 0; i < data.length; i += 4) {
    const r = data[i]
    const g = data[i + 1]
    const b = data[i + 2]
    gray.push(0.299 * r + 0.587 * g + 0.114 * b)
  }

  let totalEdge = 0
  let edgePixels = 0

  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      const idx = y * width + x
      const gx =
        -gray[idx - width - 1] +
        gray[idx - width + 1] -
        2 * gray[idx - 1] +
        2 * gray[idx + 1] -
        gray[idx + width - 1] +
        gray[idx + width + 1]
      const gy =
        -gray[idx - width - 1] -
        2 * gray[idx - width] -
        gray[idx - width + 1] +
        gray[idx + width - 1] +
        2 * gray[idx + width] +
        gray[idx + width + 1]
      const magnitude = Math.sqrt(gx * gx + gy * gy)
      totalEdge += magnitude
      if (magnitude > 50) edgePixels++
    }
  }

  const avgEdge = totalEdge / ((width - 2) * (height - 2))
  const edgeRatio = edgePixels / ((width - 2) * (height - 2))
  const edgeStrength = Math.min(avgEdge / 500, 1)
  const detailRichness = Math.min(edgeRatio * 2, 1)

  // === 5. 三分法构图分析 ===
  const thirdW = Math.floor(width / 3)
  const thirdH = Math.floor(height / 3)
  const points = [
    { x: thirdW, y: thirdH },
    { x: thirdW * 2, y: thirdH },
    { x: thirdW, y: thirdH * 2 },
    { x: thirdW * 2, y: thirdH * 2 }
  ]

  let totalInterest = 0
  const regionSize = 20
  points.forEach((point) => {
    let regionInterest = 0
    let pixelCountRegion = 0
    for (let dy = -regionSize; dy < regionSize; dy++) {
      for (let dx = -regionSize; dx < regionSize; dx++) {
        const x = point.x + dx
        const y = point.y + dy
        if (x >= 0 && x < width && y >= 0 && y < height) {
          const idx = (y * width + x) * 4
          const r = data[idx]
          const g = data[idx + 1]
          const b = data[idx + 2]
          const brightness = 0.299 * r + 0.587 * g + 0.114 * b
          regionInterest += Math.abs(brightness - 128)
          pixelCountRegion++
        }
      }
    }
    totalInterest += regionInterest / pixelCountRegion
  })
  const ruleOfThirds = Math.min(totalInterest / (4 * 128), 1)

  // === 6. 中心焦点分析 ===
  const centerX = Math.floor(width / 2)
  const centerY = Math.floor(height / 2)
  const regionR = Math.min(width, height) / 4
  let centerInterest = 0
  let edgeInterest = 0
  let centerPixels = 0
  let edgePixelsCount = 0

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * 4
      const r = data[idx]
      const g = data[idx + 1]
      const b = data[idx + 2]
      const brightness = 0.299 * r + 0.587 * g + 0.114 * b
      const dist = Math.sqrt((x - centerX) ** 2 + (y - centerY) ** 2)
      if (dist < regionR) {
        centerInterest += Math.abs(brightness - 128)
        centerPixels++
      } else if (dist > regionR * 2) {
        edgeInterest += Math.abs(brightness - 128)
        edgePixelsCount++
      }
    }
  }
  const centerFocus = centerPixels > 0 ? (centerInterest / centerPixels > edgeInterest / edgePixelsCount ? 1 : 0.5) : 0.5

  // === 7. 主体大小分析 ===
  const objAreaRatio = 0.25
  let objSizeScore = 10
  if (objAreaRatio < 0.12) objSizeScore = 4
  else if (objAreaRatio > 0.28) objSizeScore = 4

  // === 计算各维度得分（借鉴专业评估模型） ===
  let compositionBase = ruleOfThirds * 0.5 + centerFocus * 0.3 + detailRichness * 0.2
  let compositionScore = Math.round(compositionBase * 30)
  if (detailRichness > 0.6) compositionScore = Math.min(compositionScore + 2, 30)

  let angleBase = contrast * 0.5 + edgeStrength * 0.5
  let angleScore = Math.round(angleBase * 20)
  if (contrast > 0.6) angleScore = Math.min(angleScore + 2, 20)

  let distanceBase = centerFocus * 0.7 + detailRichness * 0.3
  const distanceScore = Math.round(distanceBase * 10)

  let heightScore = 0
  if (brightnessMean >= 0.35 && brightnessMean <= 0.65) heightScore = 10
  else if (brightnessMean >= 0.25 && brightnessMean <= 0.75) heightScore = 8
  else if (brightnessMean >= 0.15 && brightnessMean <= 0.85) heightScore = 6
  else heightScore = 4
  if (saturation >= 0.3 && saturation <= 0.7) heightScore = Math.min(heightScore + 1, 10)
  if (darkRatio > 0.4 || brightRatio > 0.4) heightScore = Math.max(heightScore - 2, 0)

  const poseScore = null
  let poseBaseScore = 18
  if (centerFocus > 0.7 && detailRichness > 0.5) poseBaseScore = 20
  else if (centerFocus < 0.4 && ruleOfThirds > 0.6) poseBaseScore = 22

  const totalScore = compositionScore + angleScore + distanceScore + heightScore + poseBaseScore

  // === 生成专业建议（原算法完整保留） ===
  const suggestions: LocalEvaluationResult['suggestions'] = {}

  if (compositionScore < 18) {
    if (ruleOfThirds < 0.4) suggestions.composition = '建议使用三分法构图，将主体放在画面的交叉点上，使画面更有视觉冲击力'
    else if (centerFocus < 0.4) suggestions.composition = '主体不够突出，建议调整构图使主体更加清晰明确'
    else suggestions.composition = '构图较为平淡，可以尝试更有创意的角度和布局'
  } else if (compositionScore < 24) {
    if (detailRichness < 0.5) suggestions.composition = '画面细节略显不足，可以靠近主体或选择更丰富的场景'
    else suggestions.composition = '构图基础良好，可以尝试调整主体位置使其更符合黄金分割比例'
  } else if (compositionScore < 28) suggestions.composition = '构图优秀，画面平衡感强，继续保持'

  if (angleScore < 12) {
    if (contrast < 0.3) suggestions.angle = '画面对比度较低，建议寻找光影对比更强的角度，或调整拍摄时间'
    else if (edgeStrength < 0.3) suggestions.angle = '画面缺乏层次感，尝试从不同高度或侧面拍摄，增加立体感'
    else suggestions.angle = '拍摄角度较为常规，可以尝试俯拍、仰拍等特殊视角'
  } else if (angleScore < 16) suggestions.angle = '角度选择合理，可以尝试更大胆的视角创新'
  else if (angleScore < 19) suggestions.angle = '拍摄角度出色，很好地展现了主体特点'

  if (distanceScore < 5) suggestions.distance = '拍摄距离不当，主体不够清晰。建议调整距离使主体占据画面1/3到2/3'
  else if (distanceScore < 7) suggestions.distance = '距离基本合适，可以微调以获得更好的景深效果'
  else if (distanceScore < 9) suggestions.distance = '拍摄距离恰当，主体突出且背景协调'

  if (heightScore < 5) {
    if (brightnessMean < 0.3) suggestions.height = '画面整体偏暗，建议增加光源或提高ISO/曝光补偿'
    else if (brightnessMean > 0.7) suggestions.height = '画面过度曝光，建议降低曝光或选择光线较柔和的时段拍摄'
    else if (darkRatio > 0.5) suggestions.height = '暗部细节丢失严重，建议使用补光或HDR模式'
    else if (brightRatio > 0.5) suggestions.height = '高光溢出严重，建议降低曝光或使用渐变滤镜'
  } else if (heightScore < 8) {
    if (saturation < 0.3) suggestions.height = '色彩饱和度偏低，可以在光线充足时拍摄或后期适当增强'
    else if (saturation > 0.7) suggestions.height = '色彩过于饱和，建议适当降低饱和度保持自然'
    else suggestions.height = '曝光基本准确，可以微调以获得更好的明暗层次'
  } else if (heightScore < 10) suggestions.height = '光线运用良好，明暗过渡自然'

  // === 场景类型判断（原算法完整保留） ===
  let sceneType = 'other'
  if (centerFocus > 0.7 && detailRichness > 0.5) sceneType = 'portrait'
  else if (centerFocus < 0.4 && ruleOfThirds > 0.6) sceneType = 'landscape'
  else if (centerFocus > 0.5 && ruleOfThirds > 0.5) sceneType = 'group'
  if (width > height) sceneType += '-landscape'
  else sceneType += '-portrait'

  return {
    total_score: Math.min(Math.max(totalScore, 0), 100),
    composition_score: compositionScore,
    pose_score,
    angle_score: angleScore,
    distance_score: distanceScore,
    height_score: heightScore,
    suggestions,
    scene_type: sceneType
  }
}

/* ===========================================
 * 路线3增强算法 - 有人像分支
 * =========================================== */
function evaluatePortrait(face: FaceInfo, width: number, height: number): LocalEvaluationResult {
  const suggestions: any = {}

  /* 构图 */
  const cx = face.box.x + face.box.w / 2
  const cy = face.box.y + face.box.h / 2
  const dx = Math.abs(cx - width / 2) / width
  const dy = Math.abs(cy - height / 2) / height
  const compositionScore = Math.round(clamp(1 - (dx + dy)) * 30)
  if (dx > 0.1) {
    suggestions.composition =
      cx > width / 2 ? '人物偏右，请向左移动' : '人物偏左，请向右移动'
  }

  /* 姿态分析 */
  const { leftEye, rightEye } = face.landmarks
  const tilt =
    Math.abs(
      rad2deg(
        Math.atan2(
          rightEye.y - leftEye.y,
          rightEye.x - leftEye.x
        )
      )
    )
  const poseScore = Math.round(clamp(1 - tilt / 15) * 30)
  if (tilt > 6) {
    suggestions.pose =
      rightEye.y > leftEye.y
        ? `头部向右倾斜约 ${tilt.toFixed(1)}°，请向左调整`
        : `头部向左倾斜约 ${tilt.toFixed(1)}°，请向右调整`
  }

  /* 拍摄角度 */
  const eyeY = (leftEye.y + rightEye.y) / 2
  const angleScore = Math.round(clamp(1 - Math.abs(eyeY - height / 2) / (height / 2)) * 20)
  if (eyeY < height * 0.4) suggestions.angle = '拍摄角度偏高，可降低机位'
  else if (eyeY > height * 0.6) suggestions.angle = '拍摄角度偏低，可抬高机位'

  /* 距离 */
  const faceAreaRatio = (face.box.w * face.box.h) / (width * height)
  const distanceScore = Math.round(clamp(faceAreaRatio / 0.2) * 10)
  if (faceAreaRatio < 0.15) suggestions.distance = '主体较小，请靠近'
  else if (faceAreaRatio > 0.3) suggestions.distance = '主体过大，请后退'

  /* 光线/高度 */
  const heightScore = 10

  /* 总分 */
  const totalScore = compositionScore + poseScore + angleScore + distanceScore + heightScore

  return {
    total_score: totalScore,
    composition_score: compositionScore,
    pose_score,
    angle_score: angleScore,
    distance_score: distanceScore,
    height_score: heightScore,
    suggestions,
    scene_type: 'portrait'
  }
}

/* ===========================================
 * 主函数
 * =========================================== */
export async function evaluatePhotoLocally(imagePath: string): Promise<LocalEvaluationResult> {
  return new Promise(async (resolve, reject) => {
    try {
      const canvas = Taro.createOffscreenCanvas({ type: '2d', width: 300, height: 400 })
      const ctx = canvas.getContext('2d') as any
      if (!ctx) return reject(new Error('无法创建Canvas上下文'))

      const img = canvas.createImage()
      img.onload = async () => {
        canvas.width = Math.min(img.width, 300)
        canvas.height = Math.min(img.height, 400)
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height)

        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)

        // 尝试检测人像
        const face = await detectFace(imagePath)
        if (face) {
          // 有人像 → 路线3增强算法
          resolve(evaluatePortrait(face, canvas.width, canvas.height))
        } else {
          // 无人像 → 原算法完整保留
          resolve(evaluateOriginalAlgorithm(imageData))
        }
      }
      img.onerror = (err) => reject(new Error('图片加载失败'))
      img.src = imagePath
    } catch (error) {
      reject(error)
    }
  })
}


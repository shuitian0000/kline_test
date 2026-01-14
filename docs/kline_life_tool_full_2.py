import os
import zipfile

# 可以直接运行的微信小程序完整演示包，包含：

# 首页 index：输入姓名/八字/出生地/时间

# K线页面 kline：带滑块、全屏横屏、点击弹窗示例

# 年度对比 report：示例数据 + 条形图占位

# 参数可视化 visual：三条轴（稳健—激进、短期—长期、低—高建议密度）

# utils：八字计算、农历、社会周期、K线辅助、半学习型模型、报告引擎

# docs：设计文档 + 用户手册

# data：示例用户 + 年度报告数据

# 占位文件与示例数据均可直接运行

# 🔹 升级后特点

# 滑块 + 点击弹窗演示：K线页面可以滑动年份和点击点触发弹窗

# 全屏横屏占位：K线页面逻辑可扩展全屏

# 年度报告占位数据 + 条形图空间

# 参数可视化前端页面占位：决策风格/时间视角/建议密度

# 完整 utils 逻辑占位：八字/农历/社会周期/K线辅助/半学习型模型

# docs 完整文档 + data 示例数据

# 可直接解压运行微信开发者工具，可替换占位代码为真实算法逻辑

project_name = "kline_life_tool"
zip_file_name = "kline_life_tool_demo_full.zip"

# --------------------------
# 完整项目结构 + 占位代码
# --------------------------
project_structure = {
    "pages": {
        "index": {
            "index.js": "// 首页逻辑: 输入个人信息\nPage({\n  data:{},\n  onLoad(){console.log('首页加载')},\n  submitForm(e){console.log(e.detail.value)}\n})",
            "index.wxml": "<view><form bindsubmit='submitForm'>姓名:<input name='name'/><button formType='submit'>提交</button></form></view>",
            "index.wxss": "/* 首页样式占位 */",
            "index.json": "{ \"navigationBarTitleText\": \"人生K线\" }"
        },
        "kline": {
            "kline.js": "// K线页面逻辑: 滑块+全屏+点击弹窗示例\nPage({\n  data:{year:2025},\n  onLoad(){console.log('K线页面')},\n  onSliderChange(e){this.setData({year:e.detail.value})},\n  onPointTap(e){wx.showModal({title:'运势解析',content:'示例弹窗'})}\n})",
            "kline.wxml": "<view><slider min='2000' max='2030' bindchange='onSliderChange'/></view><view bindtap='onPointTap'>K线点示例</view>",
            "kline.wxss": "/* K线页面样式占位 */",
            "kline.json": "{ \"navigationBarTitleText\": \"K线图\" }"
        },
        "report": {
            "report.js": "// 年度对比报告逻辑\nPage({\n  data:{report:[]},\n  onLoad(){\n    const fs = require('../../data/sample_report.json');\n    this.setData({report:fs})\n  }\n})",
            "report.wxml": "<view wx:for='{{report}}' wx:key='year'><text>{{item.year}}趋势: {{item.trend}}</text></view>",
            "report.wxss": "/* 年度报告样式占位 */",
            "report.json": "{ \"navigationBarTitleText\": \"年度报告\" }"
        },
        "visual": {
            "visual.js": "// 参数可视化页面逻辑\nPage({\n  data:{riskStyle:'稳健',timeFocus:'长期',adviceDensity:'关键'},\n  onLoad(){console.log('参数可视化')}\n})",
            "visual.wxml": "<view>决策风格: {{riskStyle}}</view><view>时间视角: {{timeFocus}}</view><view>建议密度: {{adviceDensity}}</view>",
            "visual.wxss": "/* 参数可视化样式占位 */",
            "visual.json": "{ \"navigationBarTitleText\": \"参数可视化\" }"
        }
    },
    "utils": {
        "bazi": {
            "bazi.js": "// 八字计算示例函数\nexport function calcBazi(user){return {shishen:'正官',score:1.0}}",
            "lunar.js": "// 农历模块占位"
        },
        "society": {
            "cycle.js": "// 社会周期示例函数\nexport function getSocietyCycle(year){return '收缩期'}",
            "adjust.js": "// 社会周期修正模型占位"
        },
        "kline": {
            "kline-helper.js": "// K线计算辅助函数示例"
        },
        "report": {
            "report-engine.js": "// 年度报告生成引擎占位",
            "report-structure.js": "// 报告章节结构占位",
            "report-sections": {
                "overview.js": "// 年度环境概览占位",
                "personal.js": "// 个人结构分析占位",
                "strategy.js": "// 年度行动策略占位",
                "risk.js": "// 风险与边界占位",
                "summary.js": "// 一页总结占位"
            },
            "report-adapter.js": "// 页面调用接口占位"
        },
        "evolve": {
            "param_update.js": "// 半学习型模型参数更新占位",
            "user_feedback.js": "// 用户反馈收集占位",
            "visualize.js": "// 参数可视化逻辑占位"
        }
    },
    "data": {
        "sample_user.json": "{\n  \"name\":\"张三\",\"gender\":\"男\",\"birth\":\"1990-01-01 08:00\",\"city\":\"北京\",\"calendar\":\"公历\"\n}",
        "sample_report.json": "{\n  \"2025\":{\"trend\":\"稳健\",\"focus\":[\"积累经验\",\"风险控制\"]},\n  \"2026\":{\"trend\":\"偏激进\",\"focus\":[\"主动尝试\",\"项目管理\"]}\n}"
    },
    "app.js": "// app.js入口逻辑\nApp({onLaunch(){console.log('app启动')}})",
    "app.json": "{ \"pages\": [\"pages/index/index\",\"pages/kline/kline\",\"pages/report/report\",\"pages/visual/visual\"], \"window\":{\"navigationBarTitleText\":\"人生K线\"} }",
    "app.wxss": "/* 全局样式占位 */",
    "project.config.json": "{ \"miniprogramRoot\": \".\" }",
    "docs": {
        "设计文档.md": "# 人生K线小程序详细设计文档\n- 系统架构\n- 八字计算\n- 社会周期修正\n- K线显示\n- 半学习模型\n- 年度报告\n- 参数可视化",
        "用户手册.md": "# 使用手册\n1. 首页输入信息\n2. K线页面交互\n3. 全屏滑块和点击弹窗示例\n4. 年度对比报告\n5. 参数可视化查看"
    }
}

# --------------------------
# 递归创建文件函数
# --------------------------
def create_files(base_path, structure):
    for name, content in structure.items():
        path = os.path.join(base_path, name)
        if isinstance(content, dict):
            os.makedirs(path, exist_ok=True)
            create_files(path, content)
        else:
            with open(path, "w", encoding="utf-8") as f:
                f.write(content)

# --------------------------
# 创建项目目录
# --------------------------
tmp_dir = project_name
if not os.path.exists(tmp_dir):
    os.makedirs(tmp_dir)
create_files(tmp_dir, project_structure)

# --------------------------
# 生成ZIP
# --------------------------
with zipfile.ZipFile(zip_file_name, "w", zipfile.ZIP_DEFLATED) as zipf:
    for root, dirs, files in os.walk(tmp_dir):
        for file in files:
            full_path = os.path.join(root, file)
            zipf.write(full_path, os.path.relpath(full_path, tmp_dir))

print(f"✅ 升级演示版小程序ZIP包生成成功: {zip_file_name}")

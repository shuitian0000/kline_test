import os
import zipfile

# --------------------------
# 配置
# --------------------------
project_name = "kline_life_tool"
zip_file_name = "kline_life_tool_full.zip"

# --------------------------
# 升级后项目目录结构
# --------------------------
project_structure = {
    "pages": {
        "index": {
            "index.js": "// index.js: 入口页面逻辑，输入姓名、八字信息\nconsole.log('index page loaded');",
            "index.wxml": "<!-- index.wxml: 输入表单 -->\n<form>姓名：<input/></form>",
            "index.wxss": "/* index.wxss */",
            "index.json": "{ \"navigationBarTitleText\": \"人生K线\" }"
        },
        "kline": {
            "kline.js": "// kline.js: K线展示 + 滑块 + 全屏 + 点击弹窗逻辑\nconsole.log('K线页面');",
            "kline.wxml": "<!-- K线界面示例 -->\n<view>人生K线图区域</view>",
            "kline.wxss": "/* 样式 */",
            "kline.json": "{ \"navigationBarTitleText\": \"K线图\" }"
        },
        "report": {
            "report.js": "// report.js: 年度对比报告逻辑\nconsole.log('年度报告页面');",
            "report.wxml": "<!-- report.wxml -->\n<view>年度对比报告区域</view>",
            "report.wxss": "/* 样式 */",
            "report.json": "{ \"navigationBarTitleText\": \"年度报告\" }"
        },
        "visual": {
            "visual.js": "// visual.js: 参数可视化逻辑示例\nconsole.log('参数可视化');",
            "visual.wxml": "<view>决策风格: ▓▓▓▓░░░░░░ 稳健</view>",
            "visual.wxss": "/* 样式 */",
            "visual.json": "{ \"navigationBarTitleText\": \"参数可视化\" }"
        }
    },
    "utils": {
        "bazi": {
            "bazi.js": "// 八字计算逻辑示例",
            "lunar.js": "// 农历模块示例"
        },
        "society": {
            "cycle.js": "// 社会周期计算逻辑示例",
            "adjust.js": "// 社会周期修正模型示例"
        },
        "kline": {
            "kline-helper.js": "// K线计算与可视化辅助函数示例"
        },
        "report": {
            "report-engine.js": "// 年度策略报告生成引擎",
            "report-structure.js": "// 报告章节结构",
            "report-sections": {
                "overview.js": "// 年度环境概览",
                "personal.js": "// 个人结构分析",
                "strategy.js": "// 年度行动策略",
                "risk.js": "// 风险与边界",
                "summary.js": "// 一页总结"
            },
            "report-adapter.js": "// 页面调用接口"
        },
        "evolve": {
            "param_update.js": "// 半学习型模型参数更新示例",
            "user_feedback.js": "// 用户反馈收集与权重调整",
            "visualize.js": "// 参数可视化逻辑"
        }
    },
    "data": {
        "sample_user.json": "{\n  \"name\": \"张三\",\n  \"gender\": \"男\",\n  \"birth\": \"1990-01-01 08:00\",\n  \"city\": \"北京\",\n  \"calendar\": \"公历\"\n}",
        "sample_report.json": "{\n  \"2025\": {\"trend\":\"稳健\",\"focus\":[\"积累经验\",\"风险控制\"]},\n  \"2026\": {\"trend\":\"偏激进\",\"focus\":[\"主动尝试\",\"项目管理\"]}\n}"
    },
    "app.js": "// app.js: 小程序入口逻辑",
    "app.json": "{ \"pages\": [\"pages/index/index\",\"pages/kline/kline\",\"pages/report/report\",\"pages/visual/visual\"], \"window\": {\"navigationBarTitleText\": \"人生K线\"} }",
    "app.wxss": "/* app.wxss: 全局样式 */",
    "project.config.json": "{ \"miniprogramRoot\": \".\" }",
    "docs": {
        "设计文档.md": "# 人生K线小程序详细设计文档\n\n包含系统架构、模块说明、算法、半学习模型、年度对比报告等",
        "用户手册.md": "# 使用手册\n\n输入、K线界面、全屏、滑块、点击弹窗、年度报告、参数可视化说明"
    }
}

# --------------------------
# 递归创建目录和文件
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
# 创建临时目录
# --------------------------
tmp_dir = project_name
if not os.path.exists(tmp_dir):
    os.makedirs(tmp_dir)

# 创建文件
create_files(tmp_dir, project_structure)

# --------------------------
# 生成 ZIP
# --------------------------
with zipfile.ZipFile(zip_file_name, "w", zipfile.ZIP_DEFLATED) as zipf:
    for root, dirs, files in os.walk(tmp_dir):
        for file in files:
            full_path = os.path.join(root, file)
            zipf.write(full_path, os.path.relpath(full_path, tmp_dir))

print(f"✅ 完整小程序ZIP包生成成功: {zip_file_name}")

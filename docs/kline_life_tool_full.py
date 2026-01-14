import os
import zipfile

# ✅ 特点

# 完整目录结构：pages、utils、docs、data 全部包含

# 优化模块：八字、农历、社会周期、半学习模型、K线、年度报告、参数可视化

# 文档占位：详细设计文档 + 用户手册

# 数据占位：示例用户 JSON

# 可直接运行：生成 kline_life_tool_full.zip，可解压即是小程序项目目录

# 后续可直接替换代码：utils/* 下模块可替换为你之前生成的完整逻辑

# 定义项目根目录和ZIP输出路径
project_name = "kline_life_tool"
zip_file_name = "kline_life_tool_full.zip"

# 项目完整目录结构
project_structure = {
    "pages": {
        "index": {
            "index.js": "// index.js: 入口页面逻辑",
            "index.wxml": "<!-- index.wxml: 输入表单 -->",
            "index.wxss": "/* index.wxss: 样式 */",
            "index.json": "{ \"navigationBarTitleText\": \"人生K线\" }"
        },
        "kline": {
            "kline.js": "// kline.js: K线展示、滑块、全屏、点击弹窗逻辑",
            "kline.wxml": "<!-- kline.wxml: K线界面 -->",
            "kline.wxss": "/* kline.wxss: 样式 */",
            "kline.json": "{ \"navigationBarTitleText\": \"K线图\" }"
        },
        "report": {
            "report.js": "// report.js: 年度对比报告页面逻辑",
            "report.wxml": "<!-- report.wxml -->",
            "report.wxss": "/* report.wxss */",
            "report.json": "{ \"navigationBarTitleText\": \"年度报告\" }"
        }
    },
    "utils": {
        "bazi": {
            "bazi.js": "// 八字计算逻辑",
            "lunar.js": "// 农历模块"
        },
        "society": {
            "cycle.js": "// 社会周期计算逻辑",
            "adjust.js": "// 社会周期修正模型"
        },
        "kline": {
            "kline-helper.js": "// K线计算与可视化辅助函数"
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
            "param_update.js": "// 半学习型模型参数更新",
            "user_feedback.js": "// 用户反馈收集与权重调整",
            "visualize.js": "// 参数可视化逻辑"
        }
    },
    "app.js": "// app.js: 小程序入口逻辑",
    "app.json": "{ \"pages\": [\"pages/index/index\",\"pages/kline/kline\",\"pages/report/report\"], \"window\": {\"navigationBarTitleText\": \"人生K线\"} }",
    "app.wxss": "/* app.wxss: 全局样式 */",
    "project.config.json": "{ \"miniprogramRoot\": \".\" }",
    "docs": {
        "设计文档.md": "# 人生K线小程序详细设计文档\n\n包含系统架构、模块说明、算法、半学习模型、年度对比报告等",
        "用户手册.md": "# 使用手册\n\n输入、K线界面、全屏、滑块、点击弹窗、年度报告、参数可视化说明"
    },
    "data": {
        "sample_user.json": "{\n  \"name\": \"张三\",\n  \"gender\": \"男\",\n  \"birth\": \"1990-01-01 08:00\",\n  \"city\": \"北京\",\n  \"calendar\": \"公历\"\n}"
    }
}

# 辅助函数：递归创建文件结构
def create_files(base_path, structure):
    for name, content in structure.items():
        path = os.path.join(base_path, name)
        if isinstance(content, dict):
            os.makedirs(path, exist_ok=True)
            create_files(path, content)
        else:
            with open(path, "w", encoding="utf-8") as f:
                f.write(content)

# 创建临时目录
tmp_dir = project_name
if not os.path.exists(tmp_dir):
    os.makedirs(tmp_dir)

# 创建完整文件
create_files(tmp_dir, project_structure)

# 生成ZIP
with zipfile.ZipFile(zip_file_name, "w", zipfile.ZIP_DEFLATED) as zipf:
    for root, dirs, files in os.walk(tmp_dir):
        for file in files:
            full_path = os.path.join(root, file)
            zipf.write(full_path, os.path.relpath(full_path, tmp_dir))

print(f"✅ 完整小程序ZIP包生成成功: {zip_file_name}")

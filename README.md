# VideoTranscriber

视频转台词工具 — 上传本地视频，自动提取音频并使用 OpenAI Whisper 识别中文台词，支持在线预览与 TXT 下载。

## 功能特性

- 拖拽或点击上传视频文件（MP4 / MOV / AVI / MKV 等）
- 视频预览，确认后再处理
- 使用 Whisper 模型进行中文语音转文字（简体中文 + 标点）
- 台词在线预览
- 一键下载 TXT 台词文件
- 启动时自动清理 7 天前的临时残留文件

## 技术栈

| 层级 | 技术 |
|------|------|
| 前端 | React 17, 原生 CSS |
| 后端 | Flask, Flask-CORS, Gunicorn |
| 语音识别 | OpenAI Whisper (base) |
| 音频处理 | FFmpeg |
| 部署 | systemd |

## 项目结构

```
VideoTranscriber/
├── backend/
│   ├── core.py           # 核心处理：音频提取、语音识别、文件保存
│   ├── server.py         # Flask API 服务
│   └── data/
│       ├── temp/         # 临时文件目录
│       └── outputs/      # 台词输出目录
├── frontend/
│   ├── index.html        # 前端页面
│   ├── app.js            # React 应用逻辑
│   └── styles.css        # 样式表
└── requirements.txt      # Python 依赖
```

## 快速开始

### 环境要求

- Python 3.10+
- FFmpeg

### 安装

```bash
# 克隆仓库
git clone https://github.com/Pawn95/VideoTranscriber.git
cd VideoTranscriber

# 创建虚拟环境
python3 -m venv venv
source venv/bin/activate

# 安装依赖
pip install -r requirements.txt gunicorn
```

### 开发模式运行

```bash
cd backend
python server.py
# 访问 http://localhost:5001
```

### 生产部署

```bash
# 使用 Gunicorn 启动
cd backend
gunicorn -w 1 --preload --timeout 300 -b 0.0.0.0:5001 server:app
```

#### systemd 服务配置

```ini
[Unit]
Description=Video Transcribe Flask App
After=network.target

[Service]
User=root
WorkingDirectory=/path/to/VideoTranscriber/backend
ExecStart=/path/to/VideoTranscriber/venv/bin/gunicorn -w 1 --preload --timeout 300 --graceful-timeout 30 -b 0.0.0.0:5001 server:app
Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
```

```bash
sudo systemctl daemon-reload
sudo systemctl enable --now video-transcribe
```

### 更新部署

```bash
cd /path/to/VideoTranscriber
git pull
sudo systemctl restart video-transcribe
```

## API

### `POST /api/process`

上传视频并提取台词。

- Content-Type: `multipart/form-data`
- Body: `file` — 视频文件

成功响应：

```json
{
  "success": true,
  "transcript": "识别出的台词文本...",
  "download_url": "/api/download/台词结果.txt"
}
```

### `GET /api/download/<filename>`

下载生成的台词 TXT 文件。

## License

MIT

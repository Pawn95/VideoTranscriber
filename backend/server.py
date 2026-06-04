from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import os
import uuid
from core import ensure_dirs, cleanup_old_temp_files, extract_audio, transcribe_audio, save_transcript, cleanup_temp_files

app = Flask(__name__)
CORS(app)
ensure_dirs()
cleanup_old_temp_files(days=7)

# 🔥 关键修复：获取项目根目录的绝对路径
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
FRONTEND_DIR = os.path.join(BASE_DIR, 'frontend')

@app.route('/')
def index():
    """返回前端页面"""
    return send_from_directory(FRONTEND_DIR, 'index.html')

@app.route('/<path:filename>')
def static_files(filename):
    """返回前端静态文件（JS/CSS）"""
    return send_from_directory(FRONTEND_DIR, filename)

@app.route('/api/process', methods=['POST'])
def process_video():
    """处理视频上传和转台词"""
    if 'file' not in request.files:
        return jsonify({'error': '请上传视频文件'}), 400
    
    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': '未选择文件'}), 400

    # 保存上传的视频到临时文件夹
    video_ext = os.path.splitext(file.filename)[1]
    video_filename = f"{uuid.uuid4().hex}{video_ext}"
    video_path = os.path.join("data/temp", video_filename)
    file.save(video_path)

    try:
        # 执行转台词流程
        audio_path = extract_audio(video_path)
        transcript = transcribe_audio(audio_path)
        output_path = save_transcript(transcript)
        
        # 清理临时文件
        cleanup_temp_files()
        if os.path.exists(video_path):
            os.remove(video_path)
        
        return jsonify({
            'success': True,
            'transcript': transcript,
            'download_url': f'/api/download/{os.path.basename(output_path)}'
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/download/<filename>')
def download_file(filename):
    """下载生成的TXT文件"""
    return send_from_directory('data/outputs', filename, as_attachment=True)

if __name__ == '__main__':
    # 关键修复：允许所有本地地址访问，关闭debug模式的安全限制
    app.run(host='0.0.0.0', port=5001, debug=True, threaded=True)
import os
import subprocess
import warnings
import whisper

# 配置
warnings.filterwarnings("ignore", message="FP16 is not supported on CPU; using FP32 instead")
MODEL_SIZE = "small"

def ensure_dirs():
    """确保必要的文件夹存在"""
    os.makedirs("data/temp", exist_ok=True)
    os.makedirs("data/outputs", exist_ok=True)

def extract_audio(video_path):
    """从视频提取音频"""
    audio_path = "data/temp/temp_audio.wav"
    cmd = [
        "ffmpeg", "-i", video_path,
        "-ar", "16000", "-ac", "1",
        "-y", audio_path
    ]
    subprocess.run(cmd, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    return audio_path

def transcribe_audio(audio_path):
    """识别音频为台词（简体+标点）"""
    model = whisper.load_model(MODEL_SIZE)
    result = model.transcribe(
        audio_path,
        language="zh",
        fp16=False,
        initial_prompt="这是一段中文对话，请用简体中文输出，并加上合适的标点符号。"
    )
    return result["text"]

def save_transcript(text, filename="台词结果.txt"):
    """保存台词到文件"""
    output_path = os.path.join("data/outputs", filename)
    with open(output_path, "w", encoding="utf-8") as f:
        f.write(text)
    return output_path

def cleanup_temp_files():
    """清理临时文件"""
    temp_audio = "data/temp/temp_audio.wav"
    if os.path.exists(temp_audio):
        os.remove(temp_audio)
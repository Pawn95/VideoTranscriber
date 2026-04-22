from flask import Flask

app = Flask(__name__)

@app.route('/')
def hello():
    return "服务器正常运行！如果你能看到这句话，说明路径配置有问题。"

if __name__ == '__main__':
    app.run(port=5000, debug=True)
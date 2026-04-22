const { useState, useRef, useEffect, createElement: h } = React;

const App = () => {
    const [selectedFile, setSelectedFile] = useState(null);
    const [videoPreviewUrl, setVideoPreviewUrl] = useState('');
    const [transcript, setTranscript] = useState('');
    const [downloadUrl, setDownloadUrl] = useState('');
    const [processing, setProcessing] = useState(false);
    const [processed, setProcessed] = useState(false);
    const [isDragging, setIsDragging] = useState(false);
    const fileInputRef = useRef(null);

    // 清理视频预览URL，避免内存泄漏
    useEffect(() => {
        return () => {
            if (videoPreviewUrl) {
                URL.revokeObjectURL(videoPreviewUrl);
            }
        };
    }, [videoPreviewUrl]);

    // 处理文件选择
    const handleFileSelect = (e) => {
        const file = e.target.files[0];
        if (file) {
            setSelectedFile(file);
            // 创建视频预览URL
            const url = URL.createObjectURL(file);
            setVideoPreviewUrl(url);
        }
    };

    // 处理拖拽
    const handleDragOver = (e) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = () => {
        setIsDragging(false);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragging(false);
        const file = e.dataTransfer.files[0];
        if (file && file.type.startsWith('video/')) {
            setSelectedFile(file);
            // 创建视频预览URL
            const url = URL.createObjectURL(file);
            setVideoPreviewUrl(url);
        }
    };

    // 点击上传区域触发文件选择
    const handleUploadClick = () => {
        fileInputRef.current.click();
    };

    // 开始处理
    const handleProcess = async () => {
        if (!selectedFile) return;

        setProcessing(true);
        setProcessed(false);
        setTranscript('');
        setDownloadUrl('');

        const formData = new FormData();
        formData.append('file', selectedFile);

        try {
            const response = await fetch('/api/process', {
                method: 'POST',
                body: formData
            });

            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.error || '处理失败');
            }

            setTranscript(data.transcript);
            setDownloadUrl(data.download_url);
            setProcessed(true);
            alert('台词提取成功！');
        } catch (error) {
            alert('错误：' + error.message);
        } finally {
            setProcessing(false);
        }
    };

    // 构建UI
    return h('div', { className: 'container' },
        // Header
        h('div', { className: 'header' },
            h('h1', null, '🎬 视频转台词工具'),
            h('p', null, '上传本地视频，预览确认后一键提取台词')
        ),

        // 上传区域
        h('div', { className: 'section' },
            h('div', { className: 'section-title' }, '上传视频文件'),
            
            !selectedFile && h('div', {
                className: `upload-area ${isDragging ? 'dragover' : ''}`,
                onClick: handleUploadClick,
                onDragOver: handleDragOver,
                onDragLeave: handleDragLeave,
                onDrop: handleDrop
            },
                h('div', { className: 'upload-text' }, '点击或拖拽视频文件到此区域上传'),
                h('div', { className: 'upload-hint' }, '支持 MP4, MOV, AVI, MKV 等常见视频格式')
            ),
            
            h('input', {
                type: 'file',
                ref: fileInputRef,
                accept: 'video/*',
                style: { display: 'none' },
                onChange: handleFileSelect
            }),
            
            selectedFile && h('div', { className: 'file-info' },
                '✅ 已选择文件：' + selectedFile.name
            )
        ),

        // 视频预览区域（新增）
        selectedFile && h('div', { className: 'section' },
            h('div', { className: 'section-title' }, '视频预览'),
            h('div', { className: 'video-preview-container' },
                h('video', {
                    src: videoPreviewUrl,
                    controls: true,
                    className: 'video-player'
                })
            ),
            h('button', {
                className: 'btn btn-primary',
                onClick: handleProcess,
                disabled: processing,
                style: { marginTop: 16 }
            },
                processing ? [
                    h('span', { className: 'spinner' }),
                    ' 正在提取台词...'
                ] : '开始提取台词'
            )
        ),

        // 加载状态
        processing && h('div', { className: 'loading' },
            '⏳ 正在处理中... 正在提取音频并识别台词，请稍候...'
        ),

        // 预览和下载
        processed && h('div', { className: 'section' },
            h('div', { className: 'section-title' }, '台词预览'),
            
            h('div', { className: 'preview-area' },
                h('div', { className: 'preview-text' }, transcript)
            ),

            h('div', { className: 'download-section' },
                h('a', {
                    className: 'btn btn-success',
                    href: downloadUrl,
                    download: '台词结果.txt'
                }, '📥 下载 TXT 文件')
            )
        )
    );
};

// 渲染应用
ReactDOM.render(h(App), document.getElementById('root'));
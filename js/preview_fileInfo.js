
/**
 * 预览文件（目前仅支持图片和PDF格式）
 * @param file
 */
var preview_fileInfo = function(file){
    let suffix = file.fileName.substring(file.fileName.lastIndexOf(".")+1);
    switch (suffix) {
        case 'pdf':
            window.open(requestUrl+file.filePath);
            break;
        default:
            let img = new Image();
            img.src = requestUrl+file.filePath;
            img.onload = function(){
                let idx = layer.open({
                    title: file.fileName
                    , type: 1
                    , offset: '20px'
                    , moveOut: true
                    , shadeClose: true //点击遮罩关闭
                    , area: [img.width, img.height] //使用图片真实宽高初始化组件
                    , content: '<div class="layui-upload-list"><img src="'+requestUrl+file.filePath +'"></div>'
                    ,  success: function(layero, index){
                        // layer.msg('加载成功', {time : 3000, offset: '100px'});
                    }
                    ,end:function () {
                        layer.close(idx);
                    }
                });
            };

    }
};
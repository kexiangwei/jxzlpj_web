
/**
 * 预览文件（目前仅支持图片和PDF格式）
 * @param file
 */
var previewFileInfo = function(file){
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
                    title: false //如果你不想显示标题栏，你可以title: false
                    , type: 1
                    , area: [img.width, img.height] //使用图片真实宽高初始化组件
                    // , area: 'auto'
                    // ,maxWidth: 900
                    // ,maxHeight : 500
                    , offset: '30px'
                    , moveOut: true
                    , shadeClose: true //点击遮罩关闭
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
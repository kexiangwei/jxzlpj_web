/**
 * 全局变量声明文件
 **/

var requestUrl="http://127.0.0.1:8080/jxzlpj";

//生成随机字符
var randomChar = function(){
    return 'xxxxxxxxxxxxxxxx'.replace(/[x]/g, function(c) {
        var r = Math.random()*16|0
            , v = c == 'x' ? r : (r&0x3|0x8);
        return v.toString(16);
    });
};

//判断对象是否为空
var isEmpty = function(obj) {
    for (var prop in obj) {
        // Inlude null properties as empty.
        if (obj[prop] !== null) {
            return false;
        }
    }
    return true;
};

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
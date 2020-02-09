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

/**
 * 查看审核流程
 * @param rowData
 */
var detail_shenheProcess = function (title,rowData) {
    layer.open({
        title : title
        ,type : 1
        ,area : [ '1175px', '535px' ]
        ,offset : '10px' //只定义top坐标，水平保持居中
        ,shadeClose : true //点击遮罩关闭
        ,btn : ['关闭']
        ,content : $('#detail_shenheProcess_container')
        ,success: function(layero, index){
            $.get(requestUrl+"/getShenheProcess.do" , {
                "relationCode": function () {
                    return rowData.code;
                }
            } ,  function(data){
                if(data.code == 200){
                    var data = data.data;
                    if(data.length>0){
                        var htmlStr = '';
                        for (var i = 0; i < data.length; i++) {
                            htmlStr += '<fieldset class="layui-elem-field" style="margin-top: 10px;" >' +
                                '<legend>开始</legend>\n' +
                                '               <div>' +
                                '                   <table class="layui-table">\n' +
                                '                        <tbody>\n' +
                                '                            <tr>' +
                                '                           <td style="width: 80px; text-align: center">提交人员</td><td style="width: 120px; text-align: center">'+data[i].userName+'</td>' +
                                '                           <td style="width: 80px; text-align: center">提交时间</td><td style="width: 120px; text-align: center">'+data[i].createDate+'</td>' +
                                '                       </tr>\n' +
                                '                       </tbody>\n' +
                                '                  </table>\n' +
                                '               </div>';
                            if(data[i].shenHeItemList.length>0){
                                for (let j = 0; j < data[i].shenHeItemList.length; j++) {
                                    let item = data[i].shenHeItemList[j];
                                    htmlStr += '<h4 style="margin-left: 30px;">'+item.nodeName+'</h4>\n' +
                                        '               <div>' +
                                        '                   <table class="layui-table">\n' +
                                        '                        <tbody>\n' +
                                        '                            <tr>' +
                                        '                           <td style="width: 80px; text-align: center">审核人员</td><td style="width: 120px; text-align: center">'+item.userName+'</td>' +
                                        '                           <td style="width: 80px; text-align: center">审核时间</td><td style="width: 120px; text-align: center">'+item.createDate+'</td>' +
                                        '                       </tr>\n' +
                                        '                            <tr>' +
                                        '                           <td style="width: 80px; text-align: center">审核状态</td><td style="width: 120px; text-align: center">'
                                        +(item.status=='通过'?'<span style="color: green;font-weight: bold;">'+item.status+'</span>':'<span style="color: red;font-weight: bold;">'+item.status+'</span>')+'</td>' +
                                        '                           <td style="width: 80px; text-align: center">审核意见</td><td style="width: 120px; text-align: center">'+item.opinion+'</td>' +
                                        '                       </tr>\n' +
                                        '                       </tbody>\n' +
                                        '                  </table>\n' +
                                        '               </div>';
                                }
                            }
                            htmlStr +=  '</fieldset>';
                        }
                        if(rowData.status =='通过' || rowData.status =='未通过'){
                            htmlStr +=  '<h2 style="margin-left: 30px;">结束</h2>';
                        }
                        $("#detail_shenheProcess_container").html(htmlStr);
                    }else{
                        layer.msg('暂无审核数据', {time : 3000, offset: '100px'});
                    }
                }else{
                    layer.msg('获取数据出错', {time : 3000, offset: '100px'});
                }
            }, "json");
        }
        ,end:function () {
            $("#detail_shenheProcess_container .layui-elem-field").empty();
        }
    });
};
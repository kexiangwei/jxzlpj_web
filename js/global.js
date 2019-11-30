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

//给String对象增加一个原型方法,用于匹配指定字符结尾的字符串
String.prototype.endWith=function(endStr){
    var d=this.length-endStr.length;
    return (d>=0&&this.lastIndexOf(endStr)==d);
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
        ,content : $('#shenheProcessContainer')
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
                                        +(item.status=='通过'?'<span style="color: green;font-weight: bold;">通过</span>':'<span style="color: red;font-weight: bold;">退回</span>')+'</td>' +
                                        '                           <td style="width: 80px; text-align: center">审核意见</td><td style="width: 120px; text-align: center">'+item.opinion+'</td>' +
                                        '                       </tr>\n' +
                                        '                       </tbody>\n' +
                                        '                  </table>\n' +
                                        '               </div>';
                                }
                            }
                            htmlStr +=  '</fieldset>';
                        }
                        if(rowData.status =='通过'){
                            htmlStr +=  '<h2 style="margin-left: 30px;">结束</h2>';
                        }
                        $("#shenheProcessContainer").html(htmlStr);
                    }else{
                        layer.msg('暂无审核数据', {time : 3000, offset: '100px'});
                    }
                }else{
                    layer.msg('获取数据出错', {time : 3000, offset: '100px'});
                }
            }, "json");
        }
        ,end:function () {
            $("#shenheProcessContainer .layui-elem-field").empty();
        }
    });
};
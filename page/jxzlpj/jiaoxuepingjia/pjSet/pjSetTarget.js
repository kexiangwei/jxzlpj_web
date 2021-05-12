/**
 *教学评价-评教设置-指标
 */
layui.use(['layer','element','table','form'], function(){
    var $ = layui.$,layer = layui.layer,element = layui.element,table = layui.table,form = layui.form;

    //指标设置
    var target_dataTable = table.render({
        id: "target_dataTable"
        ,elem : '#target_dataTable'
        ,height : 480
        ,url: requestUrl+'/getPjSetTargetList.do'
        ,response: {
            statusCode: 200 //规定成功的状态码，默认：0
        }
        ,parseData: function(res){ //res 即为原始返回的数据
            return {
                "code": res.code, //解析接口状态
                "msg": res.msg, //解析提示文本
                "data": res.data //解析数据列表
            };
        }
        ,defaultToolbar: []
        ,toolbar: '#target_toolbar'
        ,cols : [[ //表头
            {type:'numbers', title:'序号', width:80, fixed: 'left'}
            // ,{field: 'targetCode', title: '编号', width:120}
            ,{field: 'targetType', title: '类型', width:150, sort: true}
            ,{field: 'targetName', title: '名称', width:150, sort: true}
            ,{field: 'targetContent', title: '内容', width:470, sort: true}
            ,{field: 'targetScore', title: '分值', width:150, sort: true, templet: function(data){ // 函数返回一个参数 data，包含接口返回的所有字段和数据
                    let html = '<a class="layui-btn layui-btn-primary layui-btn-xs" lay-event="detail"><i class="layui-icon layui-icon-read"></i>查看</a>';
                    if(data.isBindTemplate == 1){ //已绑定模板
                        html += '<a class="layui-btn layui-btn-disabled layui-btn-xs" lay-event="update"><i class="layui-icon layui-icon-edit"></i>编辑</a>\n' +
                            '<a class="layui-btn layui-btn-disabled layui-btn-xs" lay-event="delete"><i class="layui-icon layui-icon-delete"></i>删除</a>';
                    }else{
                        html += '<a class="layui-btn layui-btn-warm layui-btn-xs" lay-event="update"><i class="layui-icon layui-icon-edit"></i>编辑</a>\n' +
                            '<a class="layui-btn layui-btn-danger layui-btn-xs" lay-event="delete"><i class="layui-icon layui-icon-delete"></i>删除</a>';
                    }
                    $('#target_bar').html(html);
                    return data.targetScore;
                }
            }
            // ,{field: 'createDate', title: '创建日期', width:180, sort: true}
            ,{fixed: 'right', width:220, align:'center', toolbar: '#target_bar'}
        ]]
        ,done : function(res, curr, count) {

            //监听头工具栏事件
            table.on('toolbar(target_dataTable)', function(obj){
                switch(obj.event){
                    case 'insert':
                        //
                        layer.open({
                            title : '教学评价-评教设置-新增指标'
                            ,type : 1
                            ,area : [ '700px', '450px' ]
                            ,offset : '100px'
                            ,shadeClose : true //点击遮罩关闭
                            ,content : $('#target_editForm_container')
                            ,success: function(layero, index){

                                //监听提交
                                form.on('submit(toSubmitEidtForm)', function(data){
                                    $.post(requestUrl+'/insertOrUpdateTarget.do' ,data.field ,function(result_data){
                                        layer.msg(result_data.msg, { offset: '100px'}, function () {
                                            if(result_data.code == 200){
                                                target_dataTable.reload();//重新加载表格数据
                                            }
                                            layer.close(index);
                                        });
                                    },'json');
                                });

                            }
                        });
                        break;
                }
            });

            //监听工具条
            table.on('tool(target_dataTable)', function(obj){
                var data = obj.data;
                if (obj.event === 'detail') {
                    //
                    let layIndex = layer.open({
                        title : '教学评价-评教设置-查看指标'
                        ,type : 1
                        ,area : [ '700px', '300px' ]
                        ,offset : '100px'
                        ,shadeClose : true //点击遮罩关闭
                        ,content : $('#target_dataInfo_container')
                        ,success: function(layero, index){
                            //
                            let html = '<table class="layui-table">\n' +
                                '        <tbody>\n' +
                                '              <tr>' +
                                '                <td style="width: 80px; text-align: right">指标类别：</td><td>'+data.targetType+'</td>' +
                                '              </tr>\n' +
                                '              <tr>' +
                                '                <td style="width: 80px; text-align: right">指标名称：</td><td>'+data.targetName+'</td>' +
                                '              </tr>\n' +
                                '              <tr>' +
                                '                <td style="width: 80px; text-align: right">指标内容：</td><td>'+data.targetContent+'</td>' +
                                '              </tr>\n' +
                                '              <tr>' +
                                '                <td style="width: 80px; text-align: right">预设分值：</td><td>'+data.targetScore+'</td>' +
                                '              </tr>\n' +
                                '              <tr>' +
                                '                <td style="width: 80px; text-align: right">创建时间：</td><td>'+data.createDate+'</td>' +
                                '              </tr>\n' +
                                '        </tbody>\n' +
                                '    </table>';
                            $("#target_dataInfo_container").html(html);

                        },end:function () {
                            $("#target_dataInfo_container").empty();
                        }
                    });
                } else if (obj.event === 'update') {
                    if(data.isBindTemplate == 1){
                        return;
                    }
                    //执行编辑
                    layer.open({
                        title : '教学评价-评教设置-修改指标'
                        ,type : 1
                        ,area : [ '700px', '450px' ]
                        ,offset : '100px'
                        ,shadeClose : true //点击遮罩关闭
                        ,content : $('#target_editForm_container')
                        ,success: function(layero, index){
                            //所有编辑页面，均增加取消按钮，不保存当前修改的内容。
                            let cancelBtn = $('<button class="layui-btn layui-btn-primary">取消</button>');
                            $("#target_editForm .layui-btn-container").append(cancelBtn);
                            cancelBtn.click(function (event) {
                                layer.close(index);
                            });

                            //初始化表单
                            form.val("target_editForm",{
                                'targetCode' : data.targetCode
                                ,'targetType' : data.targetType
                                ,'targetName' : data.targetName
                                ,'targetContent' : data.targetContent
                                ,'targetScore' : data.targetScore
                            });

                            //监听提交
                            form.on('submit(toSubmitEidtForm)', function(data){
                                $.post(requestUrl+'/insertOrUpdateTarget.do' ,data.field ,function(result_data){
                                    layer.msg(result_data.msg, { offset: '100px'}, function () {
                                        if(result_data.code == 200){
                                            target_dataTable.reload();//重新加载表格数据
                                        }
                                        layer.close(index);
                                    });
                                },'json');
                            });
                        }
                        ,end:function () {
                            $("#target_editForm .layui-btn-container .layui-btn:last").remove();
                        }
                    });
                } else if (obj.event === 'delete') {
                    if(data.isBindTemplate == 1){
                        return;
                    }
                    layer.confirm('删除后不可恢复，真的要删除么？', {icon: 3, title:'提示', offset: '100px'}, function(index) {
                        $.post(requestUrl+'/deleteTarget.do', { 'targetCode': data.targetCode},function(result_data){
                            layer.msg(result_data.msg, {time : 3000, offset: '100px'},function () {
                                if(result_data.code == 200){
                                    target_dataTable.reload();//重新加载表格数据
                                }
                                layer.close(index);
                            });
                        }, "json");
                    });
                }
            });
        }
    });
});
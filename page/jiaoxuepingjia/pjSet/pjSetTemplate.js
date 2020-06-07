/**
 *教学评价-评教设置
 */
layui.use(['layer','element','table','form','laydate'], function(){
    let $ = layui.$,layer = layui.layer,element = layui.element,table = layui.table,form = layui.form,laydate = layui.laydate;

    //模板设置
    let template_dataTable = table.render({
        id: "template_dataTable"
        ,elem : '#template_dataTable'
        ,height : 470
        ,url: requestUrl+'/getPjSetTemplateList.do'
        ,where:{
        }
        ,request: {
            pageName: 'pageIndex'
            ,limitName: 'pageSize'
        }
        ,response: {
            statusCode: 200 //规定成功的状态码，默认：0
        }
        ,parseData: function(res){ //res 即为原始返回的数据
            return {
                "code": res.code, //解析接口状态
                "msg": res.msg, //解析提示文本
                "count": res.data.totalNum, //解析数据长度
                "data": res.data.pageList //解析数据列表
            };
        }
        ,defaultToolbar: []
        ,toolbar: '#template_toolbar'
        ,cols : [[ //表头
            {type:'numbers', title:'序号', width:80, fixed: 'left'}
            // ,{field: 'templateCode', title: '编号', width:150}
            ,{field: 'templateType', title: '类型', width:150}
            ,{field: 'templateName', title: '名称'}
            ,{field: 'startDate', title: '开始时间', width:200}
            ,{field: 'endDate', title: '结束时间', width:200, templet: function(data){ // 函数返回一个参数 data，包含接口返回的所有字段和数据
                    let html = '<a class="layui-btn layui-btn-primary layui-btn-xs" lay-event="detail"><i class="layui-icon layui-icon-read"></i>查看</a>';
                    if(data.isExec == 1){ //模板已启用
                        html += '<a class="layui-btn layui-btn-disabled layui-btn-xs" lay-event="update"><i class="layui-icon layui-icon-edit"></i>编辑</a>\n' +
                            '<a class="layui-btn layui-btn-disabled layui-btn-xs" lay-event="delete"><i class="layui-icon layui-icon-delete"></i>删除</a>';
                    }else{
                        html += '<a class="layui-btn layui-btn-warm layui-btn-xs" lay-event="update"><i class="layui-icon layui-icon-edit"></i>编辑</a>\n' +
                            '<a class="layui-btn layui-btn-danger layui-btn-xs" lay-event="delete"><i class="layui-icon layui-icon-delete"></i>删除</a>';
                    }
                    $('#template_bar').html(html);
                    return data.endDate;
                }
            }
            // ,{field: 'createDate', title: '创建日期', width:150}
            ,{fixed: 'right', width:220, align:'center', toolbar: '#template_bar'}
        ]]
        ,even: true //隔行背景
        ,limit: 10
        ,page: {
            layout: ['count', 'prev', 'page', 'next', 'limit', 'refresh', 'skip']//自定义分页布局
            ,limits: [10,20,50,100]
        }
        ,done : function(res, curr, count) {

            //监听头工具栏事件
            table.on('toolbar(template_dataTable)', function(obj){
                switch(obj.event){
                    case 'insert':
                        //
                        let layIndex = layer.open({
                            title : '教学评价-评教设置-模板'
                            ,type : 1
                            ,area : [ '900px', '450px' ]
                            ,offset : '50px'
                            ,shadeClose : true //点击遮罩关闭
                            ,content : $('#template_editForm_container')
                            ,success: function(layero, index){
                                initEditForm();
                            }
                        });
                     break;
                }
            });

            //监听工具条
            table.on('tool(template_dataTable)', function(obj){
                var data = obj.data;
                if (obj.event === 'detail') {
                    let layIndex = layer.open({
                        title : '教学评价-评教设置-模板'
                        ,type : 1
                        ,area : [ '700px', '300px' ]
                        ,offset : '50px'
                        ,shadeClose : true //点击遮罩关闭
                        ,content : $('#template_dataInfo_container')
                        ,success: function(layero, index){
                            //
                            let html = '<table class="layui-table">\n' +
                                '        <tbody>\n' +
                                '              <tr>' +
                                '                <td style="width: 80px; text-align: right">模板类别：</td><td>'+data.templateType+'</td>' +
                                '              </tr>\n' +
                                '              <tr>' +
                                '                <td style="width: 80px; text-align: right">模板名称：</td><td>'+data.templateName+'</td>' +
                                '              </tr>\n' +
                                '              <tr>' +
                                '                <td style="width: 80px; text-align: right">开始时间：</td><td>'+data.startDate+'</td>' +
                                '              </tr>\n' +
                                '              <tr>' +
                                '                <td style="width: 80px; text-align: right">结束时间：</td><td>'+data.endDate+'</td>' +
                                '              </tr>\n' +
                                '        </tbody>\n' +
                                '    </table>';
                            $("#template_dataInfo_container").html(html);

                        },end:function () {
                            $("#template_dataInfo_container").empty();
                        }
                    });
                } else if (obj.event === 'update') {
                    if(data.isExec == 1){
                        return;
                    }
                    //执行编辑
                    let layIndex = layer.open({
                        title : '教学评价-评教设置-模板'
                        ,type : 1
                        ,area : [ '900px', '450px' ]
                        ,offset : '50px'
                        ,shadeClose : true //点击遮罩关闭
                        ,content : $('#template_editForm_container')
                        ,success: function(layero, index){
                            //所有编辑页面，均增加取消按钮，不保存当前修改的内容。
                            let cancelBtn = $('<button class="layui-btn layui-btn-primary">取消</button>');
                            $("#template_editForm .layui-btn-container").append(cancelBtn);
                            cancelBtn.click(function (event) {
                                layer.close(index);
                            });
                            //初始化表单数据
                            form.val("template_editForm",{
                                'templateCode' : data.templateCode
                                ,'templateType' : data.templateType
                                ,'templateName' : data.templateName
                                ,'startDate' : data.startDate
                                ,'endDate' : data.endDate
                            });
                            //
                            initEditForm();
                            initDatatable(data.templateType);
                        },end:function () {
                            window.location.reload();//刷新页面，清空上传弹窗上传的文件内容
                        }
                    });
                } else if (obj.event === 'delete') {
                    if(data.isExec == 1){
                        return;
                    }
                    layer.confirm('删除后不可恢复，真的要删除么？', {icon: 3, title:'提示', offset: '100px'}, function(index) {
                        $.post(requestUrl+'/deleteTemplate.do', { 'templateCode': data.templateCode},function(result_data){
                            layer.msg(result_data.msg, {time : 3000, offset: '100px'},function () {
                                if(result_data.code == 200){
                                    template_dataTable.reload();//重新加载表格数据
                                }
                                layer.close(index);
                            });
                        }, "json");
                    });
                }
            });

            var initEditForm = function () {

                //时间选择器
                laydate.render({
                    elem: '#startDate'
                    ,type: 'datetime'
                });
                laydate.render({
                    elem: '#endDate'
                    ,type: 'datetime'
                });

                form.on('select(templateType)', function(data){
                    /*console.log(data.elem); //得到select原始DOM对象
                    console.log(data.value); //得到被选中的值*/
                    initDatatable(data.value);
                });

                //监听提交
                form.on('submit(toSubmitEidtForm)', function(data){
                    $.post(requestUrl+'/insertOrUpdateTemplate.do' ,{
                        'templateCode': data.field.templateCode,
                        'templateType': data.field.templateType,
                        'templateName': data.field.templateName,
                        'startDate': data.field.startDate,
                        'endDate': data.field.endDate,
                        'targetCodes': layui.getSelectedTargetCodes()
                    } ,function(result_data){
                        layer.msg(result_data.msg, { offset: '100px'}, function () {
                            if(result_data.code == 200){
                                template_dataTable.reload();//重新加载表格数据
                            }
                            layer.close(layIndex);
                        });
                    },'json');
                });
            };

            var initDatatable = function (data) {
                //指标设置
                var datatable = table.render({
                    id: guid()
                    ,elem : '#datatable'
                    ,url: requestUrl+'/getPjSetTargetList.do'
                    ,where: {
                        "targetType":data
                    }
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
                    ,cols : [[ //表头
                        {type:'checkbox', fixed: 'left'}
                        ,{type:'numbers', title:'序号', width:80, fixed: 'left'}
                        ,{field: 'targetContent', title: '内容'}
                        ,{field: 'targetScore', title: '分值', width:80}
                    ]]
                    ,done : function(res, curr, count) {
                        // alert(JSON.stringify(res.data));
                        //自定义数组
                        var table_data = res.data;
                        var targetCodes = new Array();
                        table.on('checkbox(datatable)', function(obj){
                            if(obj.checked==true){
                                if(obj.type=='one'){
                                    targetCodes.push(obj.data.targetCode);
                                }else{
                                    for(var i=0;i<table_data.length;i++){
                                        targetCodes.push(table_data[i].targetCode);
                                    }
                                }
                            }else{
                                if(obj.type=='one'){
                                    for(var i=0;i<targetCodes.length;i++){
                                        if(targetCodes[i] == obj.data.targetCode){
                                            targetCodes.splice(i,1);
                                        }
                                    }
                                } else{
                                    for(var i=0;i<targetCodes.length;i++){
                                        for(var j=0;j<table_data.length;j++){
                                            if(targetCodes[i]==table_data[j].targetCode){
                                                targetCodes.splice(i,1);
                                            }
                                        }
                                    }
                                }
                            }
                        });
                        //返回已选择的指标项编号
                        layui.getSelectedTargetCodes = function () {
                            return targetCodes;
                        }
                    }
                });
            }
        }
    });
});
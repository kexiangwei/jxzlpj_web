/**
 *教学评价-评教设置
 */
layui.use(['layer','element','table','form','laydate'], function(){
    let $ = layui.$,layer = layui.layer,element = layui.element,table = layui.table,form = layui.form,laydate = layui.laydate;

    //模板设置
    let template_dataTable = table.render({
        id: "template_dataTable"
        ,elem : '#template_dataTable'
        ,height : 520
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
            ,{field: 'templateName', title: '名称'}
            ,{field: 'templateType', title: '类型', width:150}
            ,{field: 'startDate', title: '开始时间', width:200}
            ,{field: 'endDate', title: '结束时间', width:200, templet: function(data){ // 函数返回一个参数 data，包含接口返回的所有字段和数据
                    let html = '<a class="layui-btn layui-btn-primary layui-btn-xs" lay-event="detail"><i class="layui-icon layui-icon-read"></i>查看</a>' +
                        '<a class="layui-btn layui-btn-warm layui-btn-xs" lay-event="update"><i class="layui-icon layui-icon-edit"></i>编辑</a>';
                    if(data.isUse == 1){ //模板是否启用
                        html += '<a class="layui-btn layui-btn-disabled layui-btn-xs" lay-event="delete"><i class="layui-icon layui-icon-delete"></i>删除</a>';
                    }else{
                        html += '<a class="layui-btn layui-btn-danger layui-btn-xs" lay-event="delete"><i class="layui-icon layui-icon-delete"></i>删除</a>';
                    }
                    $('#template_bar').html(html);
                    return data.endDate;
                }
            }
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
                        layer.open({
                            title : '教学评价-评教设置-新增模板'
                            ,type : 1
                            ,area : [ '900px', '450px' ]
                            ,offset : '75px'
                            ,shadeClose : true //点击遮罩关闭
                            ,content : $('#template_editForm_container')
                            ,success: function(layero, index){
                                initEditForm(index);
                            }
                            ,end: function () {
                                window.location.reload();
                            }
                        });
                     break;
                }
            });

            //监听工具条
            table.on('tool(template_dataTable)', function(obj){
                var data = obj.data;
                if (obj.event === 'detail') {
                    layer.open({
                        title : '教学评价-评教设置-查看模板'
                        ,type : 1
                        ,area : [ '700px', '300px' ]
                        ,offset : '100px'
                        ,shadeClose : true //点击遮罩关闭
                        ,content : $('#template_dataInfo_container')
                        ,success: function(layero, index){
                            //
                            let html = '<table class="layui-table">\n' +
                                '        <tbody>\n' +
                                '              <tr>' +
                                '                <td style="width: 80px; text-align: right">模板编号：</td><td>'+data.templateCode+'</td>' +
                                '              </tr>\n' +
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
                                '              <tr>' +
                                '                <td style="width: 80px; text-align: right">创建时间：</td><td>'+data.createDate+'</td>' +
                                '              </tr>\n' +
                                '        </tbody>\n' +
                                '    </table>';
                            $("#template_dataInfo_container").html(html);

                        },end:function () {
                            $("#template_dataInfo_container").empty();
                        }
                    });
                } else if (obj.event === 'update') {
                    /*if(data.isUse == 1){
                        return;
                    }*/
                    //执行编辑
                    layer.open({
                        title : '教学评价-评教设置-修改模板'
                        ,type : 1
                        ,area : [ '900px', '450px' ]
                        ,offset : '75px'
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
                            initEditForm(index);
                            initDatatable(data.templateType,data.templateCode);
                            //
                        }
                        ,end: function () {
                            window.location.reload();
                        }
                    });
                } else if (obj.event === 'delete') {
                    if(data.isUse == 1){
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

            var initEditForm = function (layIndex) {

                //时间选择器
                laydate.render({
                    elem: '#startDate'
                    ,type: 'datetime'
                });
                laydate.render({
                    elem: '#endDate'
                    ,type: 'datetime'
                });

                //根据模板类型初始化表格数据
                form.on('select(templateType)', function(data){
                    initDatatable(data.value);
                });

                //监听提交
                form.on('submit(toSubmitEidtForm)', function(data){
                    //一些逻辑校验
                    if(totalScore > 100){
                        layer.msg('当前总分值为'+totalScore+'，超出预设分值100！', { offset: '100px'});
                    } else if(totalScore < 100){
                        layer.msg('当前总分值为'+totalScore+'，未达到预设分值100！', { offset: '100px'});
                    } else {
                        $.post(requestUrl+'/insertOrUpdateTemplate.do' ,{
                            'templateCode': data.field.templateCode,
                            'templateType': data.field.templateType,
                            'templateName': data.field.templateName,
                            'startDate': data.field.startDate,
                            'endDate': data.field.endDate,
                            'targetCodes': Array.from(new Set(targetCodes))
                        } ,function(result_data){
                            layer.msg(result_data.msg, { offset: '100px'}, function () {
                                if(result_data.code == 200){
                                    template_dataTable.reload();//重新加载表格数据
                                }
                                layer.close(layIndex);
                            });
                        },'json');
                    }
                });
            };

            /**
             * 根据模板类型初始化表格数据
             * @param data 模板类型，可选值[同行评教，学生评教]
             */
            var targetCodes = [] //勾选的复选框
                ,totalScore = 0; //勾选的总分值
            var initDatatable = function (data,templateCode) {

                //指标设置
                var datatable = table.render({
                    // id: guid()
                    elem : '#datatable'
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
                    // ,totalRow: true //开启合计行
                    ,cols : [[ //表头
                        {type:'checkbox', fixed: 'left'}
                        ,{type:'numbers', title:'序号', width:80, fixed: 'left', totalRowText: '已选合计：'}
                        ,{field: 'targetName', title: '名称',width:150}
                        ,{field: 'targetContent', title: '内容'}
                        ,{field: 'targetScore', title: '分值', width:80, totalRow:true}
                    ]]
                    ,done : function(res, curr, count) {
                        let table_data = res.data;
                        // this.elem.next().find('.layui-table-total td[data-field="targetScore"] .layui-table-cell').text(totalScore); //自定义合计行的数值

                        //设置已选指标
                        if(templateCode != null){
                            $.get(requestUrl+'/getPjSetTargetCodes.do',{"templateCode":templateCode},function (result_data) {
                                if(result_data.code == 200){
                                    targetCodes = result_data.data;
                                    //设置选择状态
                                    for (let i = 0; i < res.data.length; i++) {
                                        let index = res.data[i]['LAY_TABLE_INDEX'];
                                        $('tr[data-index=' + index + '] input[type="checkbox"]').prop('checked', false);
                                        $('tr[data-index=' + index + '] input[type="checkbox"]').next().removeClass('layui-form-checked');
                                        for (let j = 0; j < result_data.data.length; j++) {
                                            if(result_data.data[j] == res.data[i]['targetCode']){ //设置复选框选中
                                                $('tr[data-index=' + index + '] input[type="checkbox"]').prop('checked', true);
                                                $('tr[data-index=' + index + '] input[type="checkbox"]').next().addClass('layui-form-checked');
                                                totalScore += res.data[i]['targetScore'];
                                            }
                                        }
                                    }
                                }
                            },'json');
                        }

                        //监听复选框选择事件
                        table.on('checkbox(datatable)', function(obj){
                            if(obj.checked == true){ //勾选
                                if(obj.type == 'one'){ //单选
                                    if(!targetCodes.includes(obj.data.targetCode)){ //不存在则添加
                                        targetCodes.push(obj.data.targetCode);
                                        totalScore += obj.data.targetScore;
                                    }
                                }else{ //全选
                                    targetCodes = [];
                                    totalScore = 0;
                                    for(var i=0;i<table_data.length;i++){
                                        targetCodes.push(table_data[i].targetCode);
                                        totalScore += table_data[i].targetScore;
                                    }
                                }
                            }else{ //取消勾选
                                if(obj.type == 'one'){
                                    for(var i=0;i<targetCodes.length;i++){
                                        if(targetCodes[i] == obj.data.targetCode){
                                            targetCodes.splice(i,1);
                                            totalScore -= obj.data.targetScore;
                                        }
                                    }
                                } else{ //全不选
                                    targetCodes = [];
                                    totalScore = 0;
                                }
                            }
                        });
                    }
                });
            }
        }
    });
});
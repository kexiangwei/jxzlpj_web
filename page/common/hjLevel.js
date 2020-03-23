/**
 * 获奖等级设置
 */
layui.use(['layer','table','form','util'], function(){
    var $ = layui.$,layer = layui.layer,table = layui.table,form = layui.form,util = layui.util;

    // 加载数据表格
    var datatable = table.render({
        id: guid()
        ,elem : '#datatable'
        ,height : 450
        ,url: requestUrl+'/hjLevel/getHjLevelList.do'
        ,response: {
            statusCode: 200 //规定成功的状态码，默认：0
        }
        ,parseData: function(res){ //res 即为原始返回的数据
            return {
                "code": res.code, //解析接口状态
                "msg": "", //解析提示文本
                "data": res.data //解析数据列表
            };
        }
        ,toolbar: '#datatable_toolbar' //指向自定义工具栏模板选择器
        ,even: true //隔行背景
        ,cols : [[ //表头
            {type:'checkbox', fixed: 'left'}
            ,{type:'numbers', title:'序号', width:80, fixed: 'left'}
            // ,{field: 'CODE', title: '选项编号'}
            ,{field: 'NAME', title: '选项名称'}
            ,{fixed: 'right', width:120, align:'center', toolbar: '#datatable_bar'}
        ]]
        ,done : function(res, curr, count) {

            // 初始化一级菜单项
            $.get(requestUrl+'/hjLevel/getParentMenuList.do',function(result_data){
                if(result_data.code == 200){
                    if(result_data.data.length >0){
                        initSelect('请选择一级菜单','parentMenu',result_data.data);
                    }
                }
            },'json');
            // 监听一级菜单项
            form.on('select(parentMenu)', function(selected_data) {
                $.get(requestUrl+'/hjLevel/getMenuListByPid.do',{
                    'pid': selected_data.value
                },function(result_data){
                    if(result_data.code == 200){
                        if(result_data.data.length >0){
                            initSelect('请选择二级菜单','menu',result_data.data);
                        }
                    }
                },'json');
            });
            // 监听二级菜单项
            form.on('select(menu)', function(selected_data) {
                $.get(requestUrl+'/hjLevel/getHjLevelSet.do',{
                    'menuId': selected_data.value
                },function(result_data){
                    if(result_data.code == 200){
                        //
                        for (let i = 0; i < res.data.length; i++) {
                            let index = res.data[i]['LAY_TABLE_INDEX'];
                            $('tr[data-index=' + index + '] input[type="checkbox"]').prop('checked', false);
                            $('tr[data-index=' + index + '] input[type="checkbox"]').next().removeClass('layui-form-checked');
                            for (let j = 0; j < result_data.data.length; j++) {
                                if(result_data.data[j]['CODE'] == res.data[i]['CODE']){ //设置复选框选中
                                    $('tr[data-index=' + index + '] input[type="checkbox"]').prop('checked', true);
                                    $('tr[data-index=' + index + '] input[type="checkbox"]').next().addClass('layui-form-checked');
                                }
                            }
                        }
                        //监听复选框选择事件
                        table.on('checkbox(datatable)', function(obj){
                            if(obj.type === 'all'){ //如果触发的是全选，则为：all，如果触发的是单选，则为：one
                                return;
                            }
                            if(obj.checked){ //当前是否选中状态
                                $.post(requestUrl+'/hjLevel/addHjLevelSet.do',{
                                    'menuId':selected_data.value,
                                    'hjLevelCode':obj.data.CODE
                                });
                            } else {
                                $.post(requestUrl+'/hjLevel/delHjLevelSet.do',{
                                    'menuId':selected_data.value,
                                    'hjLevelCode':obj.data.CODE
                                });
                            }
                        });
                    }
                },'json');
            });

            //监听头工具栏事件
            table.on('toolbar(datatable)', function(obj){
                var layEvt = obj.event
                    ,data = table.checkStatus(obj.config.id).data; //获取选中的数据
                switch(layEvt){
                    case 'insert':
                        layer.open({
                            title : '获奖等级设置-新增选项'
                            ,type : 1
                            ,area : [ '500px', '200px' ] //宽高
                            ,offset : '100px'
                            // ,shadeClose : true //点击遮罩关闭
                            // ,btn : ['关闭']
                            ,content : $('#insertOrUpdate_container')
                            ,success: function(layero, index){

                                //监听表单提交
                                form.on('submit(toSubmit)', function(formData){
                                    $.post(requestUrl+'/hjLevel/insertHjLevel.do',{
                                        "name":formData.field.name
                                    },function (resultData) {
                                        layer.msg(resultData.msg, {offset: '100px'},function () {
                                            if(resultData.code==200){
                                                datatable.reload(); //重新加载表格数据
                                            }
                                        });
                                    },'json');
                                });
                            }
                        });
                     break;
                }
            });

            //监听右侧工具条
            table.on('tool(datatable)', function(obj){
                var layEvt = obj.event
                    ,rowData = obj.data;
                if (layEvt === 'update') {

                    layer.open({
                        title : '获奖等级设置-修改选项'
                        ,type : 1
                        ,area : [ '500px', '200px' ] //宽高
                        ,offset : '100px'
                        // ,shadeClose : true //点击遮罩关闭
                        // ,btn : ['关闭']
                        ,content : $('#insertOrUpdate_container')
                        ,success: function(layero, index){

                            // 初始化表单数据
                            form.val("insertOrUpdate_form",{
                                "name":rowData.NAME
                            });

                            //监听表单提交
                            form.on('submit(toSubmit)', function(formData){
                                $.post(requestUrl+'/hjLevel/updateHjLevel.do',{
                                    "code":rowData.CODE,
                                    "name":formData.field.name
                                },function (resultData) {
                                    layer.msg(resultData.msg, {offset: '100px'},function () {
                                        if(resultData.code==200){
                                            datatable.reload(); //重新加载表格数据
                                        }
                                    });
                                },'json');
                            });
                        }
                    });
                } else if (layEvt === 'delete') {
                    //执行删除
                    layer.confirm('删除后不可恢复，确认要删除么？', {icon: 3, title:'获奖等级设置-删除选项', offset: '100px'}, function(index) {
                        $.post(requestUrl+'/hjLevel/deleteHjLevel.do', { "code": rowData.CODE},function(resultData){
                            layer.msg(resultData.msg, {offset: '100px'},function () {
                                if(resultData.code === 200){
                                    datatable.reload();//重新加载表格数据
                                }
                                layer.close(index);
                            });
                        }, "json");
                    });
                }
            });
        }
    });

    /**
     * 加载下拉选项
     * @param defaultOptionVal
     * @param inputName
     * @param data
     */
    var initSelect = function(defaultOptionVal, inputName, data){
        //
        $("select[name='"+inputName+"']").empty(); //移除下拉框所有选项option
        //
        let html = '<option value="">'+defaultOptionVal+'</option>';
        for (let i = 0; i < data.length; i++) {
            html += '<option value="' + data[i].MENU_ID + '" >' + data[i].MENU_NAME + '</option>';
        }
        $("select[name='"+inputName+"']").append(html);
        form.render('select');
    };
});
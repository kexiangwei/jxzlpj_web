/**
 * 系统设置-菜单管理
 */
layui.use(['layer','table','form'], function(){
    let $ = layui.$,layer = layui.layer,table = layui.table,form = layui.form;
    //数据表格
    let dataTable = table.render({
        id: "dataTable_id"
        ,elem : '#dataTable'
        ,height : 540
        ,url: requestUrl+'/getMenuList.do'
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
        ,toolbar: '#dataTable_toolbar'
        ,cols : [[ //表头
            {type:'numbers', title:'序号', width:80, fixed: 'left'}
            ,{field: 'menuId', title: '编号', width:200, sort: true}
            ,{field: 'menuName', title: '名称'}
            ,{fixed: 'right', width:220, align:'center', toolbar: '#dataTable_bar'}
        ]]
        ,even: true //隔行背景
        ,limit: 10
        ,page: {
            layout: ['count', 'prev', 'page', 'next', 'limit', 'refresh', 'skip']//自定义分页布局
            ,limits: [10,20,50,100]
        }
        ,done : function(res, curr, count) {

            //监听头工具栏事件
            table.on('toolbar(dataTable)', function(obj){
                layer.open({
                    title : '系统设置-菜单管理-新增'
                    ,type : 1
                    ,area : [ '700px', '200px' ]
                    // ,btn:'关闭'
                    ,offset : '30px'
                    ,content : '<form class="layui-form" action="">\n' +
                            '        <div class="layui-form-item" style="margin-top: 30px;">\n' +
                            '            <label class="layui-form-label">名称</label>\n' +
                            '            <div class="layui-input-inline">\n' +
                            '                <input type="text" name="menuName" autocomplete="off" class="layui-input">\n' +
                            '            </div>\n' +
                            '            <div class="layui-input-inline">\n' +
                            '                <button class="layui-btn layui-btn-normal" lay-submit lay-filter="insertForm">提交</button>\n' +
                            '                <button type="reset" class="layui-btn layui-btn-primary">重置</button>\n' +
                            '            </div>\n' +
                            '        </div>\n' +
                            '    </form>'
                    ,success: function(layero, index){
                        //监听提交
                        form.on('submit(insertForm)', function(data){
                            // layer.msg(JSON.stringify(data.field));
                            $.post(requestUrl+'/insertMenu.do',{'menuName':data.field.menuName},function (data) {
                                if(data.code == 200){
                                    dataTable.reload();//重新加载表格数据
                                    layer.msg('新增成功', {time : 3000, offset: '100px'});
                                }else{
                                    layer.msg('新增失败', {time : 3000, offset: '100px'});
                                }
                            },'json');
                        });
                    }
                });
            });

            //监听右侧工具条
            table.on('tool(dataTable)', function(obj){
                let rowData = obj.data;
                if (obj.event === 'detail') {
                    layer.msg('查看', {time : 3000, offset: '100px'});
                } else if (obj.event === 'update') {
                    layer.open({
                        title : '系统菜单配置'
                        ,type : 1
                        ,area : [ '1175px', '535px' ] //宽高
                        ,offset : '10px'
                        ,content : $('#editContainer')
                        ,success: function(layero, index){
                            setBtn(rowData.menuId);
                        }
                    });
                } else if (obj.event === 'delete') {
                    layer.confirm('您将删除菜单项【'+rowData.menuName+'】，是否继续提交', {icon: 3, title:'提示', offset: '100px'}, function(index) {
                        layer.close(index);
                        $.post(requestUrl+'/deleteMenu.do',{'menuId':rowData.menuId},function (data) {
                            if(data.code === 200){
                                dataTable.reload();//重新加载表格数据
                            }
                            layer.msg(data.msg, {time : 3000, offset: '100px'});
                        },'json');
                    });
                }
            });
        }
    });

    /**
     * 初始化信息类按钮
     * @param menuId 主页菜单编号
     * @param menuId 新增菜单编号
     */
    let setBtn = function (rowData_menuId,insertData_menuId) {
        $.get(requestUrl+'/getMenuList.do',{'pid':rowData_menuId,'pageSize':99999},function (resultData) {
            if(resultData.code == 200){
                let htmlStr = '';
                if(resultData.data.totalNum>0){
                    if(insertData_menuId!=null){
                        $.each(resultData.data.pageList,function(idx,obj){
                            if(obj.menuId == insertData_menuId){
                                initEditDataTable(insertData_menuId);
                                htmlStr += '<button class="layui-btn layui-btn-radius layui-btn-normal layui-btn-sm" data-method="get" data-param="'+obj.menuId+'">'+obj.menuName+'</button>';
                            }else{
                                htmlStr += '<button class="layui-btn layui-btn-radius layui-btn-primary layui-btn-sm" data-method="get" data-param="'+obj.menuId+'">'+obj.menuName+'</button>';
                            }
                        });
                    }else{
                        $.each(resultData.data.pageList,function(idx,obj){
                            if(idx === 0){
                                initEditDataTable(obj.menuId);
                                htmlStr += '<button class="layui-btn layui-btn-radius layui-btn-normal layui-btn-sm" data-method="get" data-param="'+obj.menuId+'">'+obj.menuName+'</button>';
                            }else{
                                htmlStr += '<button class="layui-btn layui-btn-radius layui-btn-primary layui-btn-sm" data-method="get" data-param="'+obj.menuId+'">'+obj.menuName+'</button>';
                            }
                        });
                    }
                }
                htmlStr +='<button class="layui-btn layui-btn-radius layui-btn-primary layui-btn-sm" data-method="add"><i class="layui-icon">&#xe654;</i>新增信息类</button>';
                $('#btnContainer').html(htmlStr);
                //
                let active = {
                    get: function(obj){
                        $('#btnContainer .layui-btn-normal').removeClass("layui-btn-normal").addClass("layui-btn-primary");
                        obj.removeClass("layui-btn-primary").addClass("layui-btn-normal");
                        let menuId = obj.attr('data-param');
                        initEditDataTable(menuId);
                    }
                    ,add: function () {
                        let idx = layer.open({
                            title : '系统菜单配置-新增信息类'
                            ,type : 1
                            ,area : [ '700px', '235px' ]
                            ,offset : '10px'
                            ,content : $('#tabForm')
                            ,success: function(layero, index){
                                //监听表单提交
                                form.on('submit(tabForm)', function(formData){
                                    $.post(requestUrl+'/insertMenuTab.do',{
                                        'pid':rowData_menuId,
                                        'menuName':formData.field.menuName,
                                        'tabName':formData.field.tabName
                                    },function (data) {
                                        if(data.code == 200){
                                            setBtn(rowData_menuId,data.data);
                                        }
                                    },'json');
                                    layer.close(idx);//关闭当前弹窗
                                    return false;
                                });
                            },end:function () {
                                document.getElementById("tabForm").reset(); //清空表单数据
                            }
                        });
                    }
                };
                $('#btnContainer .layui-btn').on('click', function(){
                    let othis = $(this)
                        , method = othis.data('method');
                    active[method] ? active[method].call(this, othis) : '';
                });
            }else{
                layer.msg('获取信息失败', {time : 3000, offset: '100px'});
            }
        },'json');
    };

    /**
     * 初始化数据表格
     * @param menuId 当前点击的菜单按钮
     */
    let initEditDataTable = function (menuId) {
        // alert(menuId);
        //数据表格
        let editDataTable = table.render({
            id: "editDataTable_Id"
            ,elem : '#editDataTable'
            ,height : 360
            ,url: requestUrl+'/getMenuColInfo.do'
            ,where: {
                "menuId":menuId
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
            ,toolbar: '#editDataTable_toolbar' //指向自定义工具栏模板选择器
            ,defaultToolbar:[]
            ,cols : [[ //表头
                {type:'numbers', title:'序号', width:80, fixed: 'left'}
                ,{field: 'tabName', title: '信息类名称', width:120, align:'center'}
                // {field:'colIdx', title: '序号', width:80, align:'center'}
                ,{field: 'colName', title: '字段名称', width:120, align:'center'}
                ,{field: 'dataType', title: '字段类型', width:120, align:'center'}
                ,{field: 'dataLength', title: '字段长度', width:120, align:'center'}
                ,{field: 'isNull', title: '可为空', width:120, align:'center'}
                ,{field: 'isEdit', title: '可编辑', width:120, align:'center'}
                ,{field: 'isShow', title: '可显示', width:120, align:'center'}
                ,{field: 'comm', title: '字段描述', align:'center'}
                ,{fixed: 'right', title: '操作', width:120, align:'center', toolbar: '#editDataTable_bar'}
            ]]
            ,even: true //隔行背景
            ,done : function(res, curr, count) {
                let data = res.data;

                //监听头工具栏事件
                table.on('toolbar(editDataTable)', function(obj){
                    var nodeContainer = layer.open({
                        title : '系统菜单配置-新增信息类属性'
                        ,type : 1
                        ,area : [ '700px', '379px' ] //宽高
                        ,offset : '30px'
                        // ,btn : ['关闭']
                        ,content : $('#editForm')
                        ,success: function(layero, index){
                            //监听表单提交
                            form.on('submit(toSubmitEidtForm)', function(data){
                                layer.msg(JSON.stringify(data.field));
                                return false;
                            });
                        },end:function () {
                            document.getElementById("editForm").reset(); //清空表单数据
                        }
                    });
                });

                //监听右侧工具条
                table.on('tool(editDataTable)', function(obj){
                    var rowData = obj.data;
                    if (obj.event === 'update') {
                        if(isDelete == 1 || rowData.execLevel == 1){
                            return;
                        }
                        $.post(requestUrl+'/updateShenHeNodeByCode.do', {
                            "shenheCode": rowData.shenheCode,
                            "nodeCode": rowData.nodeCode,
                            "execLevel": rowData.execLevel,
                            "sortType": 'up'
                        },function(data) {
                            if (data.code === 200) {
                                nodeDataTable.reload();//重新加载表格数据
                            }
                        });
                    } else if (obj.event === 'delete') {
                        if(isDelete == 1){
                            return;
                        }
                        //执行删除
                        layer.confirm('删除后不可恢复，真的要删除么？', {icon: 3, title:'提示', offset: '100px'}, function(index) {
                            layer.close(index);
                            $.post(requestUrl+'/deleteShenHeNodeByCode.do', { "nodeCode": rowData.nodeCode},function(data){
                                if(data.code === 200){
                                    nodeDataTable.reload();//重新加载表格数据
                                    layer.msg('删除成功', {time : 3000, offset: '100px'});
                                }else{
                                    layer.msg('删除失败', {time : 3000, offset: '100px'});
                                }
                            }, "json");
                        });
                    }
                });
            }
        });
    }
});
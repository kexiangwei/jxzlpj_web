/**
 * 审核流程
 */
layui.config({
    base: "../../../js/layui/lay/treeselect/module/" //你存放新模块的目录，注意，不是layui的模块目录
}).extend({
    treeSelect: "treeSelect/treeSelect"
});
layui.use(['layer','table','form','util',"treeSelect"], function(){
    var $ = layui.$,layer = layui.layer,table = layui.table,form = layui.form,util = layui.util,treeSelect = layui.treeSelect;

    // 加载菜单选项
    var reloadSelect = function(inputName,defaultOptionVal,data,defaultSelectedMenuId){
        $("select[name='"+inputName+"']").empty(); //移除下拉框所有选项option
        let htmlstr = '<option value="">'+defaultOptionVal+'</option>';
        for (var i = 0; i < data.length; i++) {
            if(arguments.length===4 && data[i].menuId == defaultSelectedMenuId){
                htmlstr = '<option value="' + data[i].menuId + '" selected="">' + data[i].menuName + '</option>';
                break;//跳出循环
            }else{
                htmlstr += '<option value="' + data[i].menuId + '" >' + data[i].menuName + '</option>';
            }
        }
        $("select[name='"+inputName+"']").append(htmlstr);
        form.render('select');
    };

    // 初始化一级菜单项
    var parentMenuData;
    $.get(requestUrl+'/getParentMenuList.do',{},function(data){
        if(data.code == 200){
            parentMenuData =  data.data;
            if(parentMenuData.length > 0){
                reloadSelect('parentMenuList','请选择一级模块',parentMenuData);
            }
        }
    },'json');

    // 初始化二级菜单项
    var childMenuData;
    $.get(requestUrl+'/getChildMenuList.do',{},function(data){
        if(data.code == 200){
            childMenuData =  data.data;
            if(childMenuData.length > 0){
                reloadSelect('childMenuList','请选择二级模块',childMenuData);
            }
        }
    },'json');

    // 监听一级菜单
    form.on('select(parentMenuList)', function(data) {
        let parentMenuId = data.value;
        if(parentMenuId == ''){
            dataTable.reload({
                done: function(res, curr, count){
                    reloadSelect('childMenuList','请选择二级模块',childMenuData);
                }
            });
        }else{
            $.get(requestUrl+'/getParentMenuList.do',{"menuId":parentMenuId},function(data){
                if(data.code == 200){
                    dataTable.reload({
                        where: {
                            "parentMenuId":parentMenuId
                        },
                        done: function(res, curr, count){
                            reloadSelect('childMenuList','请选择二级模块',data.data);
                        }
                    });
                }
            },'json');
        }
    });

    // 监听二级菜单
    form.on('select(childMenuList)', function(data) {
        let menuId = data.value;
        if(menuId == ''){
            dataTable.reload({
                done: function(res, curr, count){
                    reloadSelect('childMenuList','请选择二级模块',childMenuData);
                }
            });
        } else {
            dataTable.reload({
                where: {
                    "menuId":menuId
                }
                ,page: {
                    curr: 1 //重新从第 1 页开始
                }
            });
        }
    });

    // 加载数据表格
    var dataTable = table.render({
        id: guid()
        ,elem : '#dataTable'
        ,height : 520
        ,url: requestUrl+'/getShenHeSetPageList.do'
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
                "msg": "", //解析提示文本
                "count": res.data.totalNum, //解析数据长度
                "data": res.data.pageList //解析数据列表
            };
        }
        ,toolbar: '#dataTable_toolbar' //指向自定义工具栏模板选择器
        ,cols : [[ //表头
            {type:'checkbox', fixed: 'left'}
            ,{type:'numbers', title:'序号', width:80, fixed: 'left'}
            ,{field: 'menuName', title: '业务模块', width:150}
            ,{field: 'shenheName', title: '审核名称', width:150}
            ,{field: 'shenheDesc', title: '审核描述', width:150}
            ,{field: 'shenheProcess', title: '审核流程'}
            ,{field: 'status', title: '状态', width:120,templet: function(data){ // 函数返回一个参数 data，包含接口返回的所有字段和数据
                        //
                        let html = '<a class="layui-btn layui-btn-primary layui-btn-xs" lay-event="detail">查看</a>\n' +
                            '       <a class="layui-btn layui-btn-warm layui-btn-xs" lay-event="update">编辑</a>';
                        if(data.isDelete===0){ //当流程有审核数据时，列表的删除按钮置为灰色，即为不可删除状态
                            html += '<a class="layui-btn layui-btn-disabled layui-btn-xs" lay-event="delete">删除</a>';
                        }
                        if(data.isDelete===1){
                            html += '<a class="layui-btn layui-btn-danger layui-btn-xs" lay-event="delete">删除</a>';
                        }
                        $('#dataTable_bar').html(html);
                        //
                        if(data.status==1){
                            return '<span style="color: green;font-weight: bold;">已启用</span>';
                        }
                        return '<span style="color: gray;font-weight: bold;">已禁用</span>';
                    }
             }
            ,{fixed: 'right', width:166, align:'center', toolbar: '#dataTable_bar'}
        ]]
        ,even: true //隔行背景
        ,limit: 20
        ,page: {
            layout: ['count', 'prev', 'page', 'next', 'limit', 'refresh', 'skip']//自定义分页布局
            ,limits: [20,50,100]
        }
        ,done : function(res, curr, count) {

            //监听头工具栏事件
            table.on('toolbar(dataTable)', function(obj){
                var checkStatus = table.checkStatus(obj.config.id)
                    ,data = checkStatus.data; //获取选中的数据
                switch(obj.event){
                    case 'insert':
                        layer.open({
                            title : '通用设置-审核流程-新增'
                            ,type : 1
                            ,area : [ '1200px', '450px' ] //宽高
                            ,offset : '100px'
                            ,shadeClose : true //点击遮罩关闭
                            ,btn : ['关闭']
                            ,content : $('#editContainer')
                            ,success: function(layero, index){
                                // 初始化菜单选项
                                /*reloadSelect('editFormMenu','请选择',childMenuData);*/
                                // 监听菜单选项
                                /*var menuId;
                                form.on('select(editFormMenu)', function(data) {
                                    menuId = data.value;
                                });*/
                                var menuId;
                                treeSelect.render({
                                    elem: '#editFormMenu', // 选择器
                                    data: requestUrl+'/getShenHeSetEditFormMenuTree.do', // 数据
                                    type: 'get', // 异步加载方式：get/post，默认get
                                    placeholder: '请选择', // 修改默认提示信息
                                    search: true, // 是否开启搜索功能：true/false，默认false
                                    style: {  // 一些可定制的样式
                                        line: {
                                            enable: true
                                        }
                                    },
                                    click: function(d){ // 点击回调
                                        menuId = d.current.id;
                                    },
                                    success: function (d) { // 加载完成后的回调函数

                                    }
                                });

                                //初始化审核流程编号
                                var shenheCode = guid();
                                //监听表单提交
                                var isSubmit = true;
                                form.on('submit(toSubmitEidtForm)', function(data){
                                    if(!isSubmit){
                                        return false;
                                    }
                                    var data = data.field; //表单数据
                                    var btn = $(this);//提交按钮
                                    $.post(requestUrl+'/addShenheSet.do',{
                                        "menuId":menuId,
                                        "shenheCode":shenheCode,
                                        "shenheName":data.shenheName,
                                        "shenheDesc":data.shenheDesc
                                    },function (data) {
                                        if(data.code==200){
                                            isSubmit = false;
                                            btn.removeClass("layui-btn-normal").addClass("layui-btn-disabled"); //禁用提交按钮
                                            initNodeContainer(menuId,shenheCode);
                                        }else{
                                            layer.msg('网络连接失败！', {time : 3000, offset: '100px'});
                                        }
                                    },'json');
                                    return false;
                                });
                            },end:function () {
                                window.location.reload();//重载页面
                            }
                        });
                        break;
                    case 'delete':
                        if(data.length === 0){
                            layer.msg('请选择需要删除的信息', {time : 3000, offset: '100px'});
                        } else {
                            let shenheCodes = [], isDelete = true;
                            $.each(data,function(idx,obj){
                                shenheCodes.push(obj.shenheCode);
                                if(obj.isDelete === 0){
                                    isDelete = false;
                                    return false;//跳出循环
                                }
                            });
                            if(!isDelete){
                                layer.msg('您选择了审核中的信息', {time : 3000, offset: '100px'});
                                return;
                            }
                            //执行删除
                            layer.confirm('删除后不可恢复，真的要删除么？', {icon: 3, title:'提示', offset: '100px'}, function(index) {
                                $.post(requestUrl+'/batchDeleteShenHeSet.do', { "shenheCodes": shenheCodes.join(",")},function(data){
                                    if(data.code === 200){
                                        dataTable.reload();//重新加载表格数据
                                        layer.msg('删除成功', {time : 3000, offset: '100px'});
                                    }else{
                                        layer.msg('删除失败', {time : 3000, offset: '100px'});
                                    }
                                    layer.close(index);
                                }, "json");
                            });
                        }
                        break;
                }
            });

            //监听右侧工具条
            table.on('tool(dataTable)', function(obj){
                var rowData = obj.data;
                if (obj.event === 'detail') {
                    layer.open({
                        title : '系统管理-通用设置-审核流程设置'
                        ,type : 1
                        ,area : [ '900px', '450px' ]
                        ,offset : '50px' //只定义top坐标，水平保持居中
                        ,shadeClose : true //点击遮罩关闭
                        ,btn : ['关闭']
                        ,content : $('#view_container')
                        ,success: function(layero, index){
                            //
                            let html = '<table class="layui-table">\n' +
                                '        <tbody>\n' +
                                '              <tr>' +
                                '                   <td style="width: 80px; text-align: right">流程名称：</td><td style="width: 120px;">'+rowData.shenheName+'</td>' +
                                '                   <td style="width: 80px; text-align: right">业务模块：</td><td style="width: 120px;">'+rowData.menuName+'</td>' +
                                '              </tr>\n' +
                                '              <tr>' +
                                '                   <td style="width: 80px; text-align: right">流程描述：</td><td style="width: 120px;" colspan="3">'+rowData.shenheDesc+'</td>' +
                                '              </tr>\n' +
                                '              <tr>' +
                                '                   <td style="width: 80px; text-align: right">流程名称：</td><td style="width: 120px;" colspan="3">'+rowData.shenheProcess+'</td>' +
                                '              </tr>\n' +
                                '       </tbody>\n' +
                                '    </table>';
                            $("#view_container").html(html);
                        }
                        ,end:function () {
                            $("#view_container").empty();
                        }
                    });
                } else if (obj.event === 'update') {
                    //
                    layer.open({
                        title : '通用设置-审核流程-编辑'
                        ,type : 1
                        ,area : [ '1200px', '450px' ] //宽高
                        ,offset : '100px'
                        ,shadeClose : true //点击遮罩关闭
                        ,btn : ['关闭']
                        ,content : $('#editContainer')
                        ,success: function(layero, index){
                            // 初始化菜单选项
                            // reloadSelect('editFormMenu','请选择',childMenuData,rowData.menuId);
                            var menuId;
                            treeSelect.render({
                                elem: '#editFormMenu', // 选择器
                                data: requestUrl+'/getShenHeSetEditFormMenuTree.do', // 数据
                                type: 'get', // 异步加载方式：get/post，默认get
                                // placeholder: rowData.menuName, // 修改默认提示信息
                                search: true, // 是否开启搜索功能：true/false，默认false
                                style: {  // 一些可定制的样式
                                    line: {
                                        enable: true
                                    }
                                },
                                click: function(d){ // 点击回调
                                    menuId = d.current.id;
                                },
                                success: function (d) { // 加载完成后的回调函数
                                    treeSelect.checkNode('tree', rowData.menuId); //选中节点，根据id筛选
                                }
                            });

                            // 初始化表单数据
                            form.val("editForm",{
                                "shenheCode":rowData.shenheCode,
                                "shenheName":rowData.shenheName,
                                "shenheDesc":rowData.shenheDesc
                            });
                            //监听表单提交
                            form.on('submit(toSubmitEidtForm)', function(data){
                                var data = data.field;
                                $.post(requestUrl+'/updateShenheSetByCode.do',{
                                    "shenheCode":data.shenheCode,
                                    "shenheName":data.shenheName,
                                    "shenheDesc":data.shenheDesc
                                },function (data) {
                                    if(data.code==200){
                                        layer.msg('修改成功', {time : 3000, offset: '100px'});
                                    }else{
                                        layer.msg('修改失败', {time : 3000, offset: '100px'});
                                    }
                                },'json');
                                return false;
                            });

                            //初始化节点数据
                            initNodeContainer(rowData.menuId,rowData.shenheCode,rowData.isDelete);
                        },end:function () {
                            window.location.reload();//刷新页面
                        }
                    });
                } else if (obj.event === 'delete') {
                    if(rowData.isDelete === 0){
                        return;
                    }
                    //执行删除
                    layer.confirm('删除后不可恢复，真的要删除么？', {icon: 3, title:'提示', offset: '100px'}, function(index) {
                        $.post(requestUrl+'/batchDeleteShenHeSet.do', { "shenheCodes": rowData.shenheCode},function(data){
                            if(data.code === 200){
                                dataTable.reload();//重新加载表格数据
                                layer.msg('删除成功', {time : 3000, offset: '100px'});
                            }else{
                                layer.msg('删除失败', {time : 3000, offset: '100px'});
                            }
                            layer.close(index);
                        }, "json");
                    });
                }
            });
        }
    });

    // 新增或编辑节点信息
    var initNodeContainer = function (menuId,shenheCode,isDelete) {

        //数据表格
        let nodeDataTable = table.render({
            id: guid()
            ,elem : '#nodeDataTable'
            ,url: requestUrl+'/getShenHeNodeList.do'
            ,where: {
                "shenheCode":shenheCode
            }
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
            ,toolbar: '#nodeDataTable_toolbar' //指向自定义工具栏模板选择器
            ,defaultToolbar:[]
            ,cols : [[ //表头
                {field:'execLevel', width:120, align:'center'}
                ,{field: 'nodeName', title: '节点名称', width:200, align:'center', edit: 'text'}
                ,{field: 'nodeTask', title: '节点任务', width:200, align:'center', edit: 'text'}
                ,{field: 'roleName', title: '用户组', align:'center'}
                ,{fixed: 'right', title: '操作', width:166, align:'center', toolbar: '#nodeDataTable_bar'}
            ]]
            ,even: true //隔行背景
            ,done : function(res, curr, count) {
                var data = res.data;
                //根据执行级别设置首列文本值
                $("[data-field='execLevel']").children().each(function(){
                    var val = $(this).text();
                    if(val==1){
                        $(this).text("起始节点");
                    } else if(val>1 && val<data.length){
                        $(this).text("中间节点");
                    } else if(val==data.length){
                        $(this).text("结束节点");
                    }
                });
                //页面按钮控制
                $('.layui-table-body tr').each(function() {
                    //
                    if(isDelete == 0){ // 0-不可删除
                        $('#editContainer').find(".layui-table-tool").remove();//删除头工具栏
                        $(this).find('a').removeClass("layui-btn-primary").addClass("layui-btn-disabled"); //隐藏数据表格右侧按钮
                    } else { //1可以删除
                        var dataindex = $(this).attr('data-index');
                        if (dataindex == 0) { //如果是第一行数据
                            $(this).find('a').eq(0).remove(); //隐藏“上移”按钮
                            if(data.length == 1){ //并且就有一条数据
                                $(this).find('a').eq(0).remove(); //隐藏“下移”按钮
                            }
                        } else if(dataindex == (data.length-1)){
                            // $(this).find('a').eq(1).removeClass("layui-btn-primary").addClass("layui-btn-disabled");
                            $(this).find('a').eq(1).remove();
                        }
                    }
                });

                //监听单元格编辑
                table.on('edit(nodeDataTable)', function(obj){
                    var data = obj.data //得到所在行所有键值
                        ,field = obj.field //得到字段
                        ,value = obj.value; //得到修改后的值
                    // layer.msg('[nodeCode: '+ data.nodeCode +'] ' + field + ' 字段更改为：'+ value);
                    $.post(requestUrl+'/updateShenHeNodeByCode.do'
                        , {
                            "nodeCode": data.nodeCode,
                            "nodeName": data.nodeName,
                            "nodeTask": data.nodeTask
                        },function(data){
                        if(data.code === 200){
                            // nodeDataTable.reload();//重新加载表格数据
                            layer.msg('修改成功', {time : 3000, offset: '100px'});
                        }else{
                            layer.msg('修改失败', {time : 3000, offset: '100px'});
                        }
                    }, "json");
                });

                //监听头工具栏事件
                table.on('toolbar(nodeDataTable)', function(obj){
                    var nodeContainer = layer.open({
                        title : '通用设置-审核流程-增加节点'
                        ,type : 1
                        ,area : [ '700px', '350px' ] //宽高
                        ,offset : '100px'
                        ,btn : ['关闭']
                        ,content : $('#nodeContainer')
                        ,success: function(layero, index){
                            //筛选出拥有当前菜单审核权限的角色
                            $.get(requestUrl+'/getRoleListByMenuId.do',{ "menuId" : menuId}
                                ,function(data){
                                    if(data.code == 200){
                                        data = data.data;
                                        //提取已选择的角色编号
                                        var roleIdArr = [];
                                        $.each(res.data,function(idx,obj){
                                            roleIdArr.push(obj.roleId);
                                        });
                                        if(roleIdArr.length == data.length){
                                            layer.msg('已无角色可选', {time : 3000, offset: '100px'});
                                        }
                                        //

                                        $("select[name='userGroup']").empty(); //移除下拉框所有选项option
                                        var html = '<option value="">请选择</option>';
                                        for (var i = 0; i < data.length; i++) {
                                            /*if(!roleIdArr.includes(data[i].roleId)){//判断数组中是否存在某个值
                                                html += '<option value="' + data[i].roleId + '">' + data[i].roleName + '</option>';
                                            }*/
                                            if(roleIdArr.includes(data[i].roleId)){//上面的方式效果不友好，有的用户会以为数据没有加载出来
                                                html += '<option value="' + data[i].roleId + '" disabled="disabled">' + data[i].roleName + '</option>';
                                            }else{
                                                html += '<option value="' + data[i].roleId + '">' + data[i].roleName + '</option>';
                                            }
                                        }
                                        $("select[name='userGroup']").append(html);
                                        form.render('select');

                                        //监听表单提交
                                        form.on('submit(nodeFormSubmitBtn)', function(data){
                                            var data = data.field;
                                            $.post(requestUrl+'/addShenHeNode.do',{
                                                "shenheCode":shenheCode,
                                                "nodeName":data.name,
                                                "nodeTask":data.task,
                                                "roleId":data.userGroup
                                            },function (data) {
                                                if(data.code == 200){
                                                    nodeDataTable.reload();//重新加载数据
                                                }
                                            },'json');
                                            layer.close(nodeContainer);
                                            return false;
                                        });
                                    }else{
                                        layer.msg('网络连接失败！', {time : 3000, offset: '100px'});
                                    }
                                },'json');
                        },end:function () {
                            document.getElementById("nodeForm").reset(); //清空表单数据
                        }
                    });
                });

                //监听右侧工具条
                table.on('tool(nodeDataTable)', function(obj){
                    var rowData = obj.data;
                    if (obj.event === 'up') {
                        if(isDelete == 0 || rowData.execLevel == 1){
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
                    } else if (obj.event === 'down') {
                        if(isDelete == 0 || rowData.execLevel == data.length){
                            return;
                        }
                        $.post(requestUrl+'/updateShenHeNodeByCode.do', {
                            "shenheCode": rowData.shenheCode,
                            "nodeCode": rowData.nodeCode,
                            "execLevel": rowData.execLevel,
                            "sortType": 'down'
                        },function(data) {
                            if (data.code === 200) {
                                nodeDataTable.reload();//重新加载表格数据
                            }
                        });
                    } else if (obj.event === 'delete') {
                        if(isDelete == 0){
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
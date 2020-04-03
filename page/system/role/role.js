
layui.use(['layer','table','form','tree','util'], function(){
    let $ = layui.$,layer = layui.layer,table = layui.table,form = layui.form,tree = layui.tree,util = layui.util;

    //数据表格
    let dataTable = table.render({
        id: "dataTable_id"
        ,elem : '#dataTable'
        ,height : 540
        ,url: requestUrl+'/getRoleList.do'
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
            ,{field: 'roleId', title: '编号', width:200, sort: true}
            ,{field: 'roleName', title: '名称'}
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
                let idx = layer.open({
                    title : '角色管理-新增'
                    ,type : 1
                    ,area : [ '700px', '535px' ]
                    ,offset : '10px'
                    ,shadeClose : true //点击遮罩关闭
                    ,content : $('#role_container')
                    ,success: function(layero, index){
                        $('#roleName').val("");//重置角色名称
                        //获取菜单数据
                        $.get(requestUrl+'/getMenuTree.do', {},function(data){
                            //初始化菜单树
                            tree.render({
                                id: 'menuTreeId'
                                ,elem: '#menuTree'
                                ,data: data.data
                                ,showCheckbox: true  //是否显示复选框
                            });
                            //按钮事件
                            let exec_flag = false; //设置一个对象来控制是否进入AJAX过程
                            util.event('lay-event', {
                                commit: function(othis){ //提交
                                    if(exec_flag){
                                        return; //如果正在提交则直接返回，停止执行
                                    }else{
                                        exec_flag = true;
                                        let menuIdArr = [];
                                        let selectDataArr = tree.getChecked('menuTreeId');//选择的节点数据
                                        $.each(selectDataArr,function(index,item){
                                            menuIdArr.push(item.id);
                                            $.each(item.children,function(index,item){
                                                menuIdArr.push(item.id);
                                                $.each(item.children,function(index,item){
                                                    menuIdArr.push(item.id);
                                                    if(item.children.length > 0){
                                                        $.each(item.children,function(index,item){
                                                            menuIdArr.push(item.id);
                                                        });
                                                    }
                                                });
                                            });
                                        });
                                        //持久化选择的节点数据
                                        $.ajax({
                                            type: "POST",
                                            url: requestUrl+'/insertOrUodateRoleMenu.do',
                                            data: {
                                                "roleName":$('#roleName').val(),
                                                "menuIdArr":menuIdArr
                                            },
                                            dataType: "json",
                                            traditional:true ,
                                            success: function(data){
                                                exec_flag = false; //在提交成功之后将标志标记为可提交状态
                                                layer.close(idx);
                                                layer.msg('设置成功', {time : 3000, offset: '100px'});
                                                dataTable.reload({});//重新加载数据
                                            },
                                            error:function () {
                                                exec_flag =false; //AJAX失败也需要将标志标记为可提交状态
                                                layer.msg('设置失败', {time : 3000, offset: '100px'});
                                            }
                                        });
                                    }
                                }
                                ,reset: function(){//重置
                                    $('#roleName').val("");//重置角色名称
                                    tree.reload('menuTreeId');//重载菜单树实例
                                }
                            });
                        },'json');
                    },end:function () {
                    }
                });
            });

            //监听右侧工具条
            table.on('tool(dataTable)', function(obj){
                var rowData = obj.data;
                if (obj.event === 'detail') {
                    layer.msg('查看', {time : 3000, offset: '100px'});
                } else if (obj.event === 'update') {
                    var idx = layer.open({
                        title : '角色管理-编辑'
                        ,type : 1
                        ,area : [ '700px', '535px' ]
                        ,offset : '10px'
                        ,shadeClose : true //点击遮罩关闭
                        ,content : $('#role_container')
                        ,success: function(layero, index){
                            //
                            $("input[name='roleId']").val(rowData.roleId);
                            $('#roleName').val(rowData.roleName);
                            //
                            var menuIdArr = [];
                            $.each(rowData.menuList,function(index,item){ //一级节点 [{id:'',children:[{id:'',children:[{id:'',children:[]}]}]}]教学研究
                                //选择父节点会把所有子节点都勾选
                                if(item.children.length > 0){
                                    $.each(item.children,function(index,item){ //二级节点 [{id:'',children:[{id:'',children:[]}]}]教学团队
                                        if(item.children.length > 0){
                                            $.each(item.children,function(index,item){ //三级节点 [{id:'',children:[]}]申报
                                                if(item.children.length > 0){
                                                    $.each(item.children,function(index,item){ //三级节点 [{id:'',children:[]}]提交&审核
                                                        menuIdArr.push(item.menuId);
                                                    });
                                                }else{
                                                    menuIdArr.push(item.menuId);
                                                }
                                            });
                                        }else{
                                            menuIdArr.push(item.menuId);
                                        }
                                    });
                                }else{
                                    menuIdArr.push(item.menuId);
                                }
                            });
                            // alert(menuIdArr);
                            //获取菜单数据
                            $.get(requestUrl+'/getMenuTree.do', {},function(data){
                                //初始化菜单树
                                tree.render({
                                    id: 'menuTreeId'
                                    ,elem: '#menuTree'
                                    ,data: data.data
                                    ,showCheckbox: true  //是否显示复选框
                                });
                                //勾选角色拥有的菜单节点
                                tree.setChecked('menuTreeId', menuIdArr);
                                //按钮事件
                                util.event('lay-event', {
                                    commit: function(othis){//提交
                                        menuIdArr = [];
                                        var selectDataArr = tree.getChecked('menuTreeId');//选择的节点数据  alert(JSON.stringify(item));

                                        $.each(selectDataArr,function(index,item){
                                            menuIdArr.push(item.id);
                                            $.each(item.children,function(index,item){
                                                menuIdArr.push(item.id);
                                                $.each(item.children,function(index,item){
                                                    menuIdArr.push(item.id);
                                                    if(item.children.length > 0){
                                                        $.each(item.children,function(index,item){
                                                            menuIdArr.push(item.id);
                                                        });
                                                    }
                                                });
                                            });
                                        });
                                        //持久化选择的节点数据

                                        $.ajax({
                                            type: "POST",
                                            url: requestUrl+'/insertOrUodateRoleMenu.do',
                                            data: {
                                                "roleId":rowData.roleId,
                                                "roleName":$('#roleName').val(),
                                                "menuIdArr":menuIdArr
                                            },
                                            dataType: "json",
                                            traditional:true ,
                                            success: function(data){
                                                layer.close(idx);
                                                layer.msg('设置成功', {time : 3000, offset: '100px'});
                                                dataTable.reload({});//重新加载数据
                                            }
                                        });
                                    }
                                    ,reset: function(){//重置
                                        $('#roleName').val(rowData.roleName);//重置角色名称
                                        //重载菜单树实例
                                        tree.reload('menuTreeId');
                                        tree.setChecked('menuTreeId', menuIdArr); //重置选中的节点数据
                                    }
                                });
                            },'json');
                        },end:function () {
                        }
                    });
                } else if (obj.event === 'delete') {
                    layer.msg('删除', {time : 3000, offset: '100px'});
                }
            });
        }
    });
});
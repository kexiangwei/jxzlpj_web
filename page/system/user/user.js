
layui.use(['layer','table','form','transfer','util'], function(){
    let $ = layui.$,layer = layui.layer,table = layui.table,form = layui.form,transfer = layui.transfer,util = layui.util;

    //数据表格
    let dataTable = table.render({
        id: guid()
        ,elem : '#dataTable'
        ,height : 500
        ,url: requestUrl+'/getUserPageList.do'
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
        // ,toolbar: '#dataTable_toolbar'
        ,cols : [[ //表头
            {type:'checkbox', fixed: 'left'}
            ,{type:'numbers', title:'序号', width:80, fixed: 'left'}
            ,{field: 'userId', title: '工号(学号)', width:150, sort: true}
            ,{field: 'userName', title: '姓名', width:150, sort: true}
            ,{field: 'userGroup', title: '用户组', sort: true}
            ,{field: 'phone', title: '电话', width:150, sort: true}
            ,{fixed: 'right', width:210, align:'center', toolbar: '#dataTable_bar'}
        ]]
        ,even: true //隔行背景
        ,limit: 10
        ,page: {
            layout: ['count', 'prev', 'page', 'next', 'limit', 'refresh', 'skip']//自定义分页布局
            ,limits: [10,20,50,100]
        }
        ,done : function(res, curr, count) {
            let data = res.data;

            //监听搜索框
            $('.search-container .layui-btn').on('click', function(){
                let type = $(this).data('type');
                active[type] ? active[type].call(this) : '';
            });
            let active = {
                search: function(){
                    dataTable.reload({
                        where: { //设定异步数据接口的额外参数，任意设
                            'userId': $(".search-container input[ name='userId' ] ").val()
                            ,'userName': $(".search-container input[ name='userName' ] ").val()
                            ,'userGroup': $(".search-container input[ name='userGroup' ] ").val()
                        }
                        ,page: {
                            curr: 1 //重新从第 1 页开始
                        }
                    });
                }
                ,reset: function () {
                    $(".search-container input").val('');
                }
            };

            /*//监听头工具栏事件
            table.on('toolbar(dataTable)', function(obj){
                switch(obj.event){
                    case 'insert':
                        layer.msg('新增', {time : 3000, offset: '100px'});
                        break;
                }
            });*/

            //监听右侧工具条
            table.on('tool(dataTable)', function(obj){
                var rowData = obj.data;
                if (obj.event === 'detail') {
                    layer.msg('查看', {time : 3000, offset: '100px'});
                } else if (obj.event === 'grant') {
                    var layIndex = layer.open({
                        title : '系统管理-用户-授权'
                        ,type : 1
                        ,area : [ '700px', '480px' ]
                        ,offset : '20px'
                        ,shadeClose : true //点击遮罩关闭
                        ,content : '<div class="layui-container" style="width: 90%;">\n' +
                            '           <div class="demo-transfer" style="margin-top: 10px; margin-left: 20px;" id="grant"></div>\n' +
                            '           <div class="layui-btn-container" style="margin-top: 10px; margin-left: 20px;">\n' +
                            '               <button type="button" class="layui-btn" lay-event="submit">确认</button>\n' +
                            '                <button type="button" class="layui-btn" lay-event="reload">重置</button>\n' +
                            '           </div>\n' +
                            '       </div>'
                        ,success: function(layero, index){
                            //
                            $.get(requestUrl+'/toGrant.do', {"userId":rowData.userId}, function(data){
                                    let roleArr = data.data.roleArr,
                                     userRoleIdArr = data.data.userRoleIdArr;

                                    //实例调用
                                    transfer.render({
                                        id: 'grantId' //定义唯一索引
                                        ,elem: '#grant'
                                        ,title: ['待选用户组列表', '已选用户组列表']
                                        ,data: roleArr
                                        ,value: userRoleIdArr
                                        ,showSearch: true
                                    });

                                    //批量办法定事件

                                        util.event('lay-event', {
                                            submit: function(othis){
                                                // alert(111);
                                                //
                                                $.post(requestUrl+'/grant.do',{
                                                    "userId":rowData.userId,
                                                    "roleIdArr":function (){
                                                        let arr=[],roleIdArr = [];
                                                        //获取选择的角色id
                                                        $.each(transfer.getData('grantId'),function(index,item){
                                                            arr.push(item.value);
                                                        });
                                                        //去重
                                                        for (var i = 0; i < arr.length; i++) {
                                                            for (var j = i+1; j < arr.length; j++) {
                                                                if(arr[i]===arr[j]){
                                                                    ++i;
                                                                }
                                                            }
                                                            roleIdArr.push(arr[i]);
                                                        }
                                                        return roleIdArr;
                                                    }
                                                },function (result_data) {
                                                    if(result_data.code == 200){
                                                        // dataTable.reload({});//重新加载数据
                                                        layer.msg('授权成功', {time : 3000, offset: '100px'});
                                                    }else{
                                                        layer.msg('授权失败', {time : 3000, offset: '100px'});
                                                    }
                                                    layer.close(layIndex);
                                                },'json');
                                            }
                                            ,reload:function(){
                                                //实例重载
                                                transfer.reload('grantId', {
                                                    value: userRoleIdArr
                                                })
                                            }
                                        });

                                },'json');

                        },end:function () {
                            window.location.reload();
                        }
                    });
                } else if (obj.event === 'update') {
                    layer.msg('编辑', {time : 3000, offset: '100px'});
                } else if (obj.event === 'delete') {
                    layer.msg('删除', {time : 3000, offset: '100px'});
                }
            });
        }
    });
});
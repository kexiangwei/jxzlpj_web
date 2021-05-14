
layui.use(['layer','table','form','transfer','util'], function(){
    let $ = layui.$,layer = layui.layer,table = layui.table,form = layui.form,transfer = layui.transfer,util = layui.util;

    //初始化学院下拉选项
    $.get(requestUrl+'/getXyList.do',{},function(result_data){
        if(result_data.code == 200){
            let data = result_data.data;
            let html = '<option value="">请选择</option>';
            if(data.length > 0){
                for (let i = 0; i < data.length; i++) {
                    html += '<option value="' + data[i]['name'] + '" >' + data[i]['name'] + '</option>';
                }
            }
            $("select[name='xyName']").append(html);
            form.render('select');
        }
    },'json');
    //初始化用户组下拉选项
    $.get(requestUrl+'/getRoleList.do',{},function(result_data){
        if(result_data.code == 200){
            let data = result_data.data;
            let html = '<option value="">请选择</option>';
            if(data.length > 0){
                for (let i = 0; i < data.length; i++) {
                    html += '<option value="' + data[i]['roleName'] + '" >' + data[i]['roleName'] + '</option>';
                }
            }
            $("select[name='userGroup']").append(html);
            form.render('select');
        }
    },'json');

    //数据表格
    let dataTable = table.render({
        id: guid()
        ,elem : '#dataTable'
        ,height : 468
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
        ,cols : [[ //表头
            {type:'checkbox', fixed: 'left'}
            ,{type:'numbers', title:'序号', width:80, fixed: 'left'}
            ,{field: 'xyName', title: '学院（部）', width:150, sort: true}
            ,{field: 'userId', title: '工号(学号)', width:150, sort: true}
            ,{field: 'userName', title: '姓名', width:150, sort: true}
            ,{field: 'userGroup', title: '用户组', sort: true}
            ,{fixed: 'right', width:150, align:'center', toolbar: '#dataTable_bar'}
        ]]
        ,even: true //隔行背景
        ,limit: 10
        ,page: {
            layout: ['count', 'prev', 'page', 'next', 'limit', 'refresh', 'skip']//自定义分页布局
            ,limits: [10,20,50,100]
        }
        ,done : function(res, curr, count) {
            let data = res.data;

        }
    });

    //监听搜索框
    let active = {
        search: function(){
            dataTable.reload({
                where: { //设定异步数据接口的额外参数，任意设
                    'xyName': $("#xyName option:selected").val() //获取选中的值
                    ,'userId': $(".search-container input[ name='userId' ] ").val()
                    ,'userName': $(".search-container input[ name='userName' ] ").val()
                    ,'userGroup': $("#userGroup option:selected").val() //获取选中的值
                }
                ,page: {
                    curr: 1 //重新从第 1 页开始
                }
            });
        }
        ,reset: function () {
            $(".search-container input").val('');
            //清除选中状态
            $("#xyName").val("");
            $("#userGroup").val("");
            form.render("select");
        }
    };
    $('.search-container .layui-btn').on('click', function(){
        let type = $(this).data('type');
        active[type] ? active[type].call(this) : '';
    });

    //监听右侧工具条
    table.on('tool(dataTable)', function(obj){
        var row_data = obj.data;
        if (obj.event === 'detail') {
            layer.open({
                title : '系统管理-用户-查看详情'
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
                        '                <td style="width: 80px; text-align: right">姓名：</td><td style="width: 120px;">'+row_data.userName+'</td>' +
                        '                <td style="width: 80px; text-align: right">工号/学号：</td><td style="width: 120px;">'+row_data.userId+'</td>' +
                        '              </tr>\n' +
                        '              <tr>' +
                        '                <td style="width: 80px; text-align: right">性别：</td><td style="width: 120px;">'+(row_data.sex == null?"":row_data.sex)+'</td>' +
                        '                <td style="width: 80px; text-align: right">年龄：</td><td style="width: 120px;">'+(row_data.age == null?"":row_data.age)+'</td>' +
                        '              </tr>\n' +
                        '              <tr>' +
                        '                <td style="width: 80px; text-align: right">学院：</td><td style="width: 120px;">'+(row_data.xyName == null?"":row_data.xyName)+'</td>' +
                        '                <td style="width: 80px; text-align: right">专业：</td><td style="width: 120px;">'+(row_data.zyName == null?"":row_data.zyName)+'</td>' +
                        '              </tr>';
                    if(row_data.accountType == 'teacher'){
                        html += '<tr>' +
                            '       <td style="width: 80px; text-align: right">单位：</td><td style="width: 120px;">'+(row_data.userUnit == null?"":row_data.userUnit)+'</td>' +
                            '       <td style="width: 80px; text-align: right">职称：</td><td style="width: 120px;">'+(row_data.title == null?"":row_data.title)+'</td>' +
                            '   </tr>';
                    } else if(row_data.accountType == 'student'){
                        html += '<tr>' +
                            '       <td style="width: 80px; text-align: right">年级：</td><td style="width: 120px;">'+(row_data.nj == null?"":row_data.nj)+'</td>' +
                            '       <td style="width: 80px; text-align: right">班级：</td><td style="width: 120px;">'+(row_data.bj == null?"":row_data.bj)+'</td>' +
                            '   </tr>';
                    }
                    html +=  '  </tbody>\n' +
                        '    </table>';
                    $("#view_container").html(html);
                }
                ,end:function () {
                    $("#view_container").empty();
                }
            });
        } else if (obj.event === 'grant') {
            var layIndex = layer.open({
                title : '系统管理-用户-授权'
                ,type : 1
                ,area : [ '900px', '480px' ]
                ,offset : '50px'
                ,shadeClose : true //点击遮罩关闭
                ,content : '<div class="layui-container" style="width: 90%;">\n' +
                    '           <div class="demo-transfer" style="margin-top: 10px; margin-left: 20px;" id="grant"></div>\n' +
                    '           <div class="layui-btn-container" style="margin-top: 10px; margin-left: 20px;">\n' +
                    '               <button type="button" class="layui-btn layui-btn-normal" lay-event="submit">确认</button>\n' +
                    '                <button type="button" class="layui-btn layui-btn-primary" lay-event="reload">重置</button>\n' +
                    '           </div>\n' +
                    '       </div>'
                ,success: function(layero, index){
                    //
                    $.get(requestUrl+'/toGrant.do', {"userId":row_data.userId}, function(data){
                        let transferData = data.data.transferData,
                            selectedRoleIdList = data.data.selectedRoleIdList;

                        //实例调用
                        transfer.render({
                            id: 'grantId' //定义唯一索引
                            ,elem: '#grant'
                            ,title: ['待选用户组列表', '已选用户组列表']
                            ,data: transferData
                            ,value: selectedRoleIdList
                            ,showSearch: true
                        });

                        //
                        util.event('lay-event', {
                            submit: function(othis){
                                //
                                $.post(requestUrl+'/grant.do',{
                                    "userId":row_data.userId,
                                    "roleIds":function (){
                                        let arr=[],roleIds = [];
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
                                            roleIds.push(arr[i]);
                                        }
                                        return roleIds;
                                    }
                                },function (result_data) {
                                    layer.msg(result_data.msg, {offset: '100px'}, function () {
                                        if(result_data.code == 200){
                                            dataTable.reload();
                                        }
                                    });
                                    layer.close(layIndex);
                                },'json');
                            }
                            ,reload:function(){
                                //实例重载
                                transfer.reload('grantId', {
                                    value: selectedRoleIdList
                                })
                            }
                        });

                    },'json');

                },end:function () {

                }
            });
        }
    });

});
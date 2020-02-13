/*
教学设计-教案
 */
layui.use(['layer','element','table','form','laydate'], function(){
    var $ = layui.$,layer = layui.layer,element = layui.element,table = layui.table,form = layui.form,laydate = layui.laydate;

    //验证用户是否有继续教育的提交、审核权限
    $.ajax({
        type: "get",
        url: requestUrl+'/getAuthority.do', //根据menuId,userId 查询用户是否拥有菜单的提交、审核权限
        data: {
            "menuId":function () {
                return $.cookie('currentMenuId');
            },
            "userId":function () {
                return $.cookie('userId');
            }
        }
        ,dataType:'json'
        ,success:function(data) {
            var data = data.data;
            if(data.isSubmit > 0){ //拥有提交权限
                $('#other').removeClass();
                $('#other_item').css('class','layui-tab-item');
                //初始化数据表格
                let myself_table = table.render({
                    elem : '#myself_table'
                    ,height : 440
                    ,url: requestUrl+'/jiaoAn/getPageList.do'
                    ,where:{
                        "userId":function () {
                            return $.cookie('userId');
                        }
                    }
                    ,request: {//用于对分页请求的参数：page、limit重新设定名称
                        pageName: 'pageIndex' //页码的参数名称，默认：page
                        ,limitName: 'pageSize' //每页数据量的参数名，默认：limit
                    }
                    ,response: { //重新规定返回的数据格式
                        statusCode: 200 //规定成功的状态码，默认：0
                    }
                    //数据格式解析的回调函数，用于将返回的任意数据格式解析成 table 组件规定的数据格式
                    ,parseData: function(res){ //res 即为原始返回的数据
                        return {
                            "code": res.code, //解析接口状态
                            "msg": "", //解析提示文本
                            "count": res.data.totalNum, //解析数据长度
                            "data": res.data.pageList //解析数据列表
                        };
                    }
                    ,page: { //支持传入 laypage 组件的所有参数（某些参数除外，如：jump/elem） - 详见文档
                        layout: ['count', 'prev', 'page', 'next', 'limit', 'refresh', 'skip']//自定义分页布局
                        ,limits: [10,20,50,100]
                        ,first: true //不显示首页
                        ,last: true //不显示尾页
                    }
                    ,limit: 10
                    ,even: true //隔行背景
                    ,toolbar: '#myself_toolbar' //指向自定义工具栏模板选择器
                    ,cols : [[ //表头
                        {type:'checkbox', fixed: 'left'}
                        ,{type:'numbers', title:'序号', width:80, fixed: 'left'}
                        ,{field: 'courseCode', title: '课程编号', width:120}
                        ,{field: 'courseName', title: '课程名称', width:120}
                        ,{field:'teachDate', title:'授课时间', width:120}
                        ,{field:'teachNum', title:'节次', width:120}
                        ,{field:'teachTopic', title:'课题', width:120}
                        ,{field:'teachHour', title:'学时', width:120}
                        ,{field: 'isSubmit', title: '提交状态', width:120,templet: function(data){
                                let htmlstr='';
                                if(data.isSubmit=='已提交'){
                                    htmlstr = ' <a class="layui-btn layui-btn-primary layui-btn-xs" lay-event="view_data">查看信息</a>\n' +
                                        '           <a class="layui-btn layui-btn-normal layui-btn-xs" lay-event="detail_shenheProcess">查看流程</a>\n' +
                                        '           <a class="layui-btn layui-btn-disabled layui-btn-xs" lay-event="update">编辑</a>' +
                                        '           <a class="layui-btn layui-btn-disabled layui-btn-xs" lay-event="delete">删除</a>';
                                    $('#myself_bar').html(htmlstr);
                                    return '<span style="color: blue;font-weight: bold;">'+data.isSubmit+'</span>';
                                }else{
                                    if(data.isSubmit=='未提交' && data.status ==='退回'){
                                        htmlstr =
                                            ' <a class="layui-btn layui-btn-primary layui-btn-xs" lay-event="view_data">查看信息</a>\n' +
                                            ' <a class="layui-btn layui-btn-normal layui-btn-xs" lay-event="detail_shenheProcess">查看流程</a>\n' +
                                            ' <a class="layui-btn layui-btn-warm layui-btn-xs" lay-event="update">编辑</a>\n' +
                                            ' <a class="layui-btn layui-btn-danger layui-btn-xs" lay-event="delete">删除</a>';
                                        $('#myself_bar').html(htmlstr);
                                        return '<span style="font-weight: bold;">'+data.isSubmit+'</span>';
                                    }
                                }
                                htmlstr =
                                    ' <a class="layui-btn layui-btn-primary layui-btn-xs" lay-event="view_data">查看信息</a>\n' +
                                    ' <a class="layui-btn layui-btn-disabled layui-btn-xs" lay-event="detail_shenheProcess">查看流程</a>\n' +
                                    ' <a class="layui-btn layui-btn-warm layui-btn-xs" lay-event="update">编辑</a>\n' +
                                    ' <a class="layui-btn layui-btn-danger layui-btn-xs" lay-event="delete">删除</a>';
                                $('#myself_bar').html(htmlstr);
                                return '<span style="font-weight: bold;">'+data.isSubmit+'</span>';
                            }
                        }
                        ,{field: 'status', title: '审核状态', width:120,templet: function(data){
                                if(data.status==='退回'){
                                    return '<span style="color: red;font-weight: bold;">'+data.status+'</span>';
                                }
                                return '<span style="color: blue;font-weight: bold;">'+(data.status != null ? data.status : '')+'</span>';
                            }
                        }
                        ,{fixed: 'right', width:268, align:'center', toolbar: '#myself_bar'} //这里的toolbar值是模板元素的选择器
                    ]]
                    ,done: function(res, curr, count){ //数据渲染完的回调

                        //监听搜索框事件
                        $('.myself_search .layui-btn').on('click', function(){
                            let type = $(this).data('type');
                            active[type] ? active[type].call(this) : '';
                        });
                        let active = {
                            search: function(){
                                myself_table.reload({
                                    where: {
                                        'courseCode': $("input[name='myself_courseCode']").val()
                                        ,'courseName': $("input[ name='myself_courseName']").val()
                                        ,'isSubmit': $("input[ name='isSubmit']").val()
                                        // ,status: $("input[ name='status']").val()
                                    }
                                    ,page: {
                                        curr: 1 //重新从第 1 页开始
                                    }
                                });
                            }
                            ,reset: function () {
                                $("input").val('');
                            }
                        };

                        //监听头工具栏事件
                        table.on('toolbar(myself_table)', function(obj){
                            let dataArr = table.checkStatus(obj.config.id).data; //获取选中的数据
                            switch(obj.event){
                                case 'insert':
                                    document.getElementById("editForm").reset(); //清空表单数据
                                    //
                                    $("#editForm input[ name='code' ] ").val(new Date().getTime());
                                    //日期
                                    laydate.render({
                                        elem: '#teachDate'
                                    });
                                    //
                                    layer.open({
                                        title : '教学设计-教案-新增'
                                        ,type : 1
                                        ,offset : '10px'
                                        ,area : [ '700px', '500px' ]
                                        ,content : $('#insertOrUpdateContainer')
                                        ,success: function(layero, index){
                                            //监听表单提交
                                            form.on('submit(toSubmit)', function(form_data){
                                                $.ajax({
                                                    type: "post",
                                                    url: requestUrl+'/jiaoAn/insert.do',
                                                    data: {
                                                        "code":form_data.field.code
                                                        ,"courseCode" : form_data.field.courseCode
                                                        ,"courseName" : form_data.field.courseName
                                                        ,"teachDate" : form_data.field.teachDate
                                                        ,"teachNum" : form_data.field.teachNum
                                                        ,"teachTopic" : form_data.field.teachTopic
                                                        ,"teachHour" : form_data.field.teachHour
                                                        ,"teachGoal" : form_data.field.teachGoal
                                                        ,"teachContent" : form_data.field.teachContent
                                                        ,"teachKeyAndDifficult" : form_data.field.teachKeyAndDifficult
                                                        ,"teachWay" : form_data.field.teachWay
                                                        ,"teachProcess" : form_data.field.teachProcess
                                                        ,"remark" : form_data.field.remark
                                                        ,"userId":function () {
                                                            return $.cookie('userId');
                                                        }
                                                        ,"userName":function () {
                                                            return $.cookie('userName');
                                                        }
                                                    },dataType:'json'
                                                    ,success:function(data) {
                                                        if(data.code === 200){
                                                            myself_table.reload();//重新加载表格数据
                                                            layer.msg('添加成功', {time : 3000, offset: '100px'});
                                                        }else{
                                                            layer.msg('添加失败', {time : 3000, offset: '100px'});
                                                        }
                                                    }
                                                    ,error:function() {

                                                    }
                                                });
                                            });
                                        },end:function () {
                                            // window.location.reload();//刷新页面，清空上传弹窗上传的文件内容
                                        }
                                    });
                                    break;
                                case 'submit':
                                    if(dataArr.length === 0){
                                        layer.msg('请选择需要提交的信息', {time : 3000, offset: '100px'});
                                    } else {
                                        //
                                        let isSubmit = false;
                                        $.each(dataArr,function(idx,obj){
                                            if(obj.isSubmit== '已提交'){
                                                isSubmit = true;
                                                return false;//跳出循环
                                            }
                                        });
                                        if(isSubmit){
                                            layer.msg('您选择了已提交的信息！', {time : 3000, offset: '100px'});
                                            return;
                                        }
                                        //
                                        layer.confirm('信息提交后不可进行编辑、删除操作，是否继续提交？', {icon: 3, title:'提示', offset: '100px'}, function(index) {
                                            layer.close(index);
                                            $.post(requestUrl+'/jiaoAn/toSubimt.do',{
                                                "menuId":$.cookie('currentMenuId'),
                                                "jsonStr":JSON.stringify(dataArr)
                                            },function (result_data) {
                                                if(result_data.code === 200){
                                                    // myself_table.reload();//重新加载表格数据
                                                    window.location.reload();//刷新页面,审核页面审核状态未改变
                                                }
                                                layer.msg(result_data.msg, {time : 3000, offset: '100px'});
                                            },'json');
                                        });
                                    }
                                    break;
                            }
                        });

                        //监听工具条
                        table.on('tool(myself_table)', function(obj){
                            let row_data = obj.data;
                            if (obj.event === 'view_data') {
                                view_data(row_data);
                            } else if (obj.event === 'detail_shenheProcess') {
                                if(row_data.isSubmit=='未提交' && row_data.status !='退回'){
                                    return;
                                }
                                detail_shenheProcess('教学设计-教案-查看审核流程',row_data);
                            } else if (obj.event === 'update') {
                                if(row_data.isSubmit== '已提交'){
                                    return;
                                }

                                //执行编辑
                                layer.open({
                                    title : '教学设计-教案-编辑'
                                    ,type : 1
                                    ,area : [ '700px', '535px' ]
                                    // ,area : '500px'//只想定义宽度时，你可以area: '500px'，高度仍然是自适应的
                                    ,offset : '10px'
                                    ,shadeClose : true //点击遮罩关闭
                                    ,content : $('#insertOrUpdateContainer')
                                    ,success: function(layero, index){
                                        //日期
                                        laydate.render({
                                            elem: '#teachDate'
                                        });
                                        //
                                        form.val("editForm",{
                                            "code":row_data.code
                                            ,"courseCode" : row_data.courseCode
                                            ,"courseName" : row_data.courseName
                                            ,"teachDate" : row_data.teachDate
                                            ,"teachNum" : row_data.teachNum
                                            ,"teachTopic" : row_data.teachTopic
                                            ,"teachHour" : row_data.teachHour
                                            ,"teachGoal" : row_data.teachGoal
                                            ,"teachContent" : row_data.teachContent
                                            ,"teachKeyAndDifficult" : row_data.teachKeyAndDifficult
                                            ,"teachWay" : row_data.teachWay
                                            ,"teachProcess" : row_data.teachProcess
                                            ,"remark" : row_data.remark
                                            ,"userId":row_data.userId
                                            ,"userName":row_data.userName
                                        });

                                        //监听表单提交
                                        form.on('submit(toSubmit)', function(form_data){
                                            $.ajax({
                                                type: "post",
                                                url: requestUrl+'/jiaoAn/update.do',
                                                data: {
                                                    "code":form_data.field.code
                                                    ,"courseCode" : form_data.field.courseCode
                                                    ,"courseName" : form_data.field.courseName
                                                    ,"teachDate" : form_data.field.teachDate
                                                    ,"teachNum" : form_data.field.teachNum
                                                    ,"teachTopic" : form_data.field.teachTopic
                                                    ,"teachHour" : form_data.field.teachHour
                                                    ,"teachGoal" : form_data.field.teachGoal
                                                    ,"teachContent" : form_data.field.teachContent
                                                    ,"teachKeyAndDifficult" : form_data.field.teachKeyAndDifficult
                                                    ,"teachWay" : form_data.field.teachWay
                                                    ,"teachProcess" : form_data.field.teachProcess
                                                    ,"remark" : form_data.field.remark
                                                    ,"userId":function () {
                                                        return $.cookie('userId');
                                                    }
                                                    ,"userName":function () {
                                                        return $.cookie('userName');
                                                    }
                                                },
                                                dataType:'json'
                                                ,success:function(result_data) {
                                                    if(result_data.code === 200){
                                                        myself_table.reload();//重新加载表格数据
                                                        layer.msg('修改成功', {time : 3000, offset: '100px'});
                                                    }else{
                                                        layer.msg('修改失败', {time : 3000, offset: '100px'});
                                                    }
                                                }
                                                ,error:function() {
                                                    layer.msg('网络连接失败', {time : 3000, offset: '100px'});
                                                }
                                            });
                                        });
                                    },end:function () {
                                        // window.location.reload();//刷新页面，清空上传弹窗上传的文件内容
                                    }
                                });
                            } else if (obj.event === 'delete') {
                                if(row_data.isSubmit== '已提交'){
                                    return;
                                }
                                layer.confirm('删除后不可恢复，真的要删除么？', {icon: 3, title:'提示', offset: '100px'}, function(index) {
                                    layer.close(index);
                                    $.post(requestUrl+'/jiaoAn/delete.do', { code: row_data.code},function(data){
                                        if(data.code === 200){
                                            myself_table.reload();//重新加载表格数据
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
            } else{
                $('#myself').remove();
                $('#myself_item').remove();
            }
            if(data.isShenhe > 0){ //拥有审核权限
                var other_table = table.render({//数据表格
                    elem : '#other_table'
                    ,height : 440
                    ,url: requestUrl+'/jiaoAn/getPageList.do'
                    ,where:{
                        "shenHeUserId":function () {
                            return $.cookie('userId');
                        }
                    }
                    ,request: {
                        pageName: 'pageIndex'
                        ,limitName: 'pageSize'
                    }
                    ,response: {
                        statusCode: 200
                    }
                    ,parseData: function(res){
                        return {
                            "code": res.code,
                            "msg": "",
                            "count": res.data.totalNum,
                            "data": res.data.pageList,
                            "unShenHeNum": res.data.unShenHeNum
                        };
                    }
                    ,page: {
                        layout: ['count', 'prev', 'page', 'next', 'limit', 'refresh', 'skip']
                        ,limits: [10,20,50,100]
                        ,first: true
                        ,last: true
                    }
                    ,limit: 10
                    ,even: true
                    ,toolbar: '#other_toolbar'
                    ,cols : [[ //表头
                        {type:'checkbox', fixed: 'left'}
                        ,{type:'numbers', title:'序号', width:80, fixed: 'left'}
                        ,{field: 'courseCode', title: '课程编号', width:160}
                        ,{field: 'courseName', title: '课程名称', width:160}
                        ,{field:'teachTopic', title:'课题', width:160}
                        ,{field:'teachHour', title:'学时', width:120}
                        ,{field:'teachNum', title:'节次', width:120}
                        ,{field:'teachDate', title:'授课时间', width:120}
                        ,{field: 'shenheStatus', title: '审核状态', width:120,templet: function(data){ // 函数返回一个参数 data，包含接口返回的所有字段和数据
                                var val = data.shenheStatus;
                                if(val=='已审核'){
                                    return '<span style="color: blue;font-weight: bold;">'+val+'</span>';
                                }
                                return '<span style="color: red;font-weight: bold;">'+val+'</span>';
                            }
                        } //【已审核 | 待审核 | 退回】
                        ,{fixed: 'right', width:166, align:'center', toolbar: '#other_bar'} //这里的toolbar值是模板元素的选择器
                    ]]
                    ,done: function(res, curr, count){
                        $('#other').find('span').html(res.unShenHeNum);
                    }
                });//table end.

                //监听搜索框事件
                $('.other_search .layui-btn').on('click', function(){
                    let type = $(this).data('type');
                    active[type] ? active[type].call(this) : '';
                });
                let active = {
                    search: function(){
                        other_table.reload({
                            where: {
                                'userId': $(" input[ name='other_userId' ] ").val()
                                ,'userName': $(" input[ name='other_userName' ] ").val()
                                ,'courseCode': $(" input[ name='other_courseCode' ] ").val()
                                ,'courseName': $(" input[ name='other_courseName' ] ").val()
                                ,'shenheStatus': $(" input[ name='shenheStatus' ] ").val()
                            }
                            ,page: {
                                curr: 1 //重新从第 1 页开始
                            }
                        });
                    }
                    ,reset: function () {
                        $("input").val('');
                    }
                };

                //监听头工具栏事件
                table.on('toolbar(other_table)', function(obj){
                    let dataArr = table.checkStatus(obj.config.id).data; //获取选中的数据
                    switch(obj.event){
                        case 'submit':
                            if(dataArr.length === 0){
                                layer.msg('请选择需要审核的数据', {time : 3000, offset: '100px'});
                                return;
                            } else {
                                let isSubmit = false;
                                $.each(dataArr,function(idx,obj){
                                    if(obj.shenheStatus!= '未审核'){
                                        isSubmit = true;
                                        return false;//跳出循环
                                    }
                                });
                                if(isSubmit){
                                    layer.msg('您选择了已审核的信息！', {time : 3000, offset: '100px'});
                                    return;
                                }
                                //添加审核意见
                                layer.open({
                                    title : '教学设计-教案-添加审核意见'
                                    ,type : 1
                                    ,area : [ '700px', '450px' ]
                                    // ,area : '500px'//只想定义宽度时，你可以area: '500px'，高度仍然是自适应的
                                    ,offset : '20px' //只定义top坐标，水平保持居中
                                    ,shadeClose : true //点击遮罩关闭
                                    ,btn : ['关闭']
                                    ,content : $('#shenheContainer')
                                    ,success: function(layero, index){
                                        //
                                        form.on('select(status)', function(formData) {
                                            if(formData.value == '通过'){
                                                $('#opinion').html('通过');
                                            }
                                            if(formData.value == '退回'){
                                                $('#opinion').empty();
                                            }
                                        });
                                        //
                                        form.on('submit(toSubmit)', function(formData){
                                            $.post(requestUrl+'/jiaoAn/toShenhe.do',{
                                                "jsonStr":JSON.stringify(dataArr)
                                                ,"status":formData.field.status
                                                ,"opinion":formData.field.opinion
                                                ,"userId":function () {
                                                    return $.cookie('userId');
                                                }
                                                ,"userName":function () {
                                                    return $.cookie('userName');
                                                }
                                            },function (data) {
                                                if(data.code === 200){
                                                    other_table.reload();//重新加载表格数据
                                                    window.location.reload();//刷新页面，审核后页面状态未改变
                                                    layer.msg('审核成功', {time : 3000, offset: '100px'});
                                                }else{
                                                    layer.msg('审核失败', {time : 3000, offset: '100px'});
                                                }
                                            },'json');
                                        });
                                    }
                                    ,end:function () {

                                    }
                                });
                            }
                            break;
                    }
                });

                //监听工具条
                table.on('tool(other_table)', function(obj){
                    let row_data = obj.data;
                    if (obj.event === 'view_data') {
                        view_data(row_data);
                    } else if (obj.event === 'detail_shenheProcess') {
                        detail_shenheProcess('教学设计-教案-查看审核流程',row_data);
                    }
                });
            } else{
                $('#other').remove();
                $('#other_item').remove();
            }

            /**
             * 查看详情
             * @param data
             */
            let view_data = function (rowData) {
                layer.open({
                    title : '教学设计-教案-查看详情'
                    ,type : 1
                    ,area : [ '1175px', '535px' ]
                    ,offset : '10px' //只定义top坐标，水平保持居中
                    ,shadeClose : true //点击遮罩关闭
                    ,btn : ['关闭']
                    ,content : $('#viewContainer')
                    ,success: function(layero, index){
                        let htmlStr = '';
                        htmlStr += '<fieldset class="layui-elem-field" style="margin-top: 10px;" >' +
                            '       <table class="layui-table">\n' +
                            '           <tbody>\n' +
                            '               <tr>' +
                            '                   <td style="width: 120px; text-align: right">课程编号：</td><td>'+rowData.courseCode+'</td>' +
                            '                   <td style="width: 120px; text-align: right">课程名称：</td><td>'+rowData.courseName+'</td>' +
                            '               </tr>\n' +
                            '               <tr>' +
                            '                   <td style="width: 120px; text-align: right">授课时间：</td><td>'+rowData.teachDate+'</td>' +
                            '                   <td style="width: 120px; text-align: right">节次：</td><td>'+rowData.teachNum+'</td>' +
                            '               </tr>\n' +
                            '               <tr>' +
                            '                   <td style="width: 120px; text-align: right">课题：</td><td>'+rowData.teachTopic+'</td>' +
                            '                   <td style="width: 120px; text-align: right">学时：</td><td>'+rowData.teachHour+'</td>' +
                            '               </tr>\n' +
                            '               <tr>' +
                            '                   <td style="width: 120px; text-align: right">教学目的及要求：</td><td colspan="3">'+rowData.teachGoal+'</td>' +
                            '               </tr>\n' +
                            '               <tr>' +
                            '                   <td style="width: 120px; text-align: right">教学内容要点：</td><td colspan="3">'+rowData.teachContent+'</td>' +
                            '               </tr>\n' +
                            '               <tr>' +
                            '                   <td style="width: 120px; text-align: right">教学重点难点：</td><td colspan="3">'+rowData.teachKeyAndDifficult+'</td>' +
                            '               </tr>\n' +
                            '               <tr>' +
                            '                   <td style="width: 120px; text-align: right">教学方法及教具：</td><td colspan="3">'+rowData.teachWay+'</td>' +
                            '               </tr>\n' +
                            '               <tr>' +
                            '                   <td style="width: 120px; text-align: right">教学进程：</td><td colspan="3">'+rowData.teachProcess+'</td>' +
                            '               </tr>\n' +
                            '               <tr>' +
                            '                   <td style="width: 120px; text-align: right">备注：</td><td colspan="3">'+rowData.remark+'</td>' +
                            '               </tr>\n' +
                            '           </tbody>\n' +
                            '       </table>' +
                            '   </fieldset>';
                        $("#viewContainer").html(htmlStr);
                    }
                    ,end:function () {
                        $("#viewContainer .layui-elem-field").empty();
                    }
                });
            };
        }
        ,error:function() {
            layer.msg('网络连接失败', {icon:7, time : 3000, offset: '100px'});
        }
    });
});
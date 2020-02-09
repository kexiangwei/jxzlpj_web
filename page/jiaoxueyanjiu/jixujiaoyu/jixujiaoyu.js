/*
教学研究-继续教育
 */
layui.use(['layer','element','table','form','laydate','upload'], function(){
    var $ = layui.$,layer = layui.layer,element = layui.element,table = layui.table,form = layui.form,laydate = layui.laydate,upload = layui.upload;

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
        },
        dataType:'json'
        ,success:function(data) {
            var data = data.data;
            if(data.isSubmit > 0){ //拥有提交权限
                $('#other').removeClass();
                $('#other_item').css('class','layui-tab-item');
                //数据表格
                var myself_table = table.render({
                    elem : '#myself_table'
                    ,height : 440
                    ,id: "myself_table_id"
                    ,url: requestUrl+'/jiXuJiaoYu/getPageList.do'
                    ,where:{
                        "userId":function () {
                            return  $.cookie('userId');
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
                    ,totalRow: true //开启合计行
                    ,toolbar: '#myself_toolbar' //指向自定义工具栏模板选择器
                    ,cols : [[ //表头
                        {type:'checkbox', fixed: 'left'}
                        ,{type:'numbers', title:'序号', width:80, fixed: 'left', totalRowText: '合计：'}
                        // ,{field:'code', title:'编号', width:120, sort: true}
                        ,{field: 'peixunName', title: '培训名称', width:150}
                        ,{field: 'peixunStyle', title: '培训形式', width:150}
                        ,{field: 'peixunStartTime', title: '培训开始时间', width:120,hide:true}
                        ,{field: 'peixunEndTime', title: '培训结束时间', width:120,hide:true}
                        ,{field: 'peixunClassHour', title: '学时', width:120, sort:true, totalRow:true}
                        ,{field: 'peixunContent', title: '培训内容', width:120,hide:true}
                        ,{field: 'peixunAddress', title: '培训地点', width:120,hide:true}
                        ,{field: 'peixunDept', title: '培训机构', width:120}
                        ,{field: 'isSubmit', title: '提交状态', width:120,templet: function(data){ // 函数返回一个参数 data，包含接口返回的所有字段和数据
                                var val = data.isSubmit;
                                if(val=='已提交'){
                                    var htmlstr = ' <a class="layui-btn layui-btn-primary layui-btn-xs" lay-event="detail">查看信息</a>\n' +
                                        '           <a class="layui-btn layui-btn-normal layui-btn-xs" lay-event="detail-file">查看附件</a>\n' +
                                        '           <a class="layui-btn layui-btn-normal layui-btn-xs" lay-event="detail-shenheProcess">查看流程</a>';
                                    if(data.status == '退回'){
                                        htmlstr+= '           <a class="layui-btn layui-btn-warm layui-btn-xs" lay-event="update">编辑</a>\n' +
                                            '           <a class="layui-btn layui-btn-danger layui-btn-xs" lay-event="delete">删除</a>';
                                    }else{
                                        htmlstr+= '           <a class="layui-btn layui-btn-disabled layui-btn-xs" lay-event="update">编辑</a>\n' +
                                            '           <a class="layui-btn layui-btn-disabled layui-btn-xs" lay-event="delete">删除</a>';
                                    }
                                    $('#myself_bar').html(htmlstr);
                                    return '<span style="color: blue;font-weight: bold;">'+val+'</span>';
                                }
                                var htmlstr = ' <a class="layui-btn layui-btn-primary layui-btn-xs" lay-event="detail">查看信息</a>\n' +
                                    '                    <a class="layui-btn layui-btn-normal layui-btn-xs" lay-event="detail-file">查看附件</a>\n' +
                                    '                    <a class="layui-btn layui-btn-disabled layui-btn-xs" lay-event="detail-shenheProcess">查看流程</a>\n' +
                                    '                    <a class="layui-btn layui-btn-warm layui-btn-xs" lay-event="update">编辑</a>\n' +
                                    '                    <a class="layui-btn layui-btn-danger layui-btn-xs" lay-event="delete">删除</a>';
                                $('#myself_bar').html(htmlstr);
                                return '<span style="font-weight: bold;">'+val+'</span>';
                            }
                        }
                        ,{field: 'status', title: '审核状态', width:120, sort: true,templet: function(data){ // 函数返回一个参数 data，包含接口返回的所有字段和数据
                                var val = data.status;
                                if(val=='审核中' || val=='通过'){
                                    return '<span style="color: blue;font-weight: bold;">'+val+'</span>';
                                }
                                if(val=='退回'){
                                    return '<span style="color: red;font-weight: bold;">'+val+'</span>';
                                }
                                return '';
                            }
                        }
                        ,{fixed: 'right', width:340, align:'center', toolbar: '#myself_bar'} //这里的toolbar值是模板元素的选择器
                    ]]
                });//table end.

                //监听搜索框事件
                let active = {
                    search: function(){
                        myself_table.reload({
                            where: {
                                peixunName: $("input[name='myself_peixunName']").val()
                                ,peixunDept: $("input[ name='myself_peixunDept']").val()
                                ,isSubmit: $("input[ name='myself_isSubmit']").val()
                                // ,status: $("input[ name='myself_status']").val()
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
                $('.myself_search .layui-btn').on('click', function(){
                    let type = $(this).data('type');
                    active[type] ? active[type].call(this) : '';
                });


                //监听头工具栏事件
                table.on('toolbar(myself_table)', function(obj){
                    var checkStatus = table.checkStatus(obj.config.id)
                        ,data = checkStatus.data; //获取选中的数据
                    switch(obj.event){
                        case 'insert':
                            /*$('#editForm').reset();//清空表单数据
                            form.render();*/
                            document.getElementById("editForm").reset(); //清空表单数据
                            $(" input[ name='code' ] ").val(randomChar());//每次进入新增页面生成一个新的编号供表单code字段和文件上传字段relationCode使用
                            //
                            layer.open({
                                title : '继续教育-新增'
                                ,type : 1
                                ,offset : '10px'
                                // ,shadeClose : true //防止不小心点到遮罩关闭弹窗，禁用此功能
                                ,area : [ '700px', '535px' ]
                                ,content : $('#editForm')
                                ,success: function(layero, index){
                                    //初始化laydate实例
                                    laydate.render({
                                        elem: '#startDate' //指定元素
                                    });
                                    laydate.render({
                                        elem: '#endDate' //指定元素
                                    });
                                    //监听编辑页submit按钮提交
                                    form.on('submit(editFormSubmitBtn)', function(data){
                                        let peixunStyleArr = new Array();
                                        if(data.field.peixunStyle_xxxx == "on"){
                                            peixunStyleArr.push('线下学习');
                                        }
                                        if(data.field.peixunStyle_xsxx == "on"){
                                            peixunStyleArr.push('线上学习');
                                        }
                                        let peixunStyle = peixunStyleArr.join(',');
                                        $.ajax({
                                            type: "post",
                                            url: requestUrl+'/jiXuJiaoYu/insert.do',
                                            data: {
                                                "code":data.field.code
                                                ,"peixunName": data.field.peixunName
                                                // ,"peixunStyle" : (data.field.peixunStyle_xxxx == "on"?"线下学习":"线上学习")
                                                ,'peixunStyle':peixunStyle
                                                ,"peixunStartTime" : data.field.peixunStartTime
                                                ,"peixunEndTime" : data.field.peixunEndTime
                                                ,"peixunClassHour" : data.field.peixunClassHour
                                                ,"peixunContent" : data.field.peixunContent
                                                ,"peixunAddress" : data.field.peixunAddress
                                                ,"peixunDept" : data.field.peixunDept
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
                                    window.location.reload();//刷新页面，清空上传弹窗上传的文件内容
                                }
                            });
                            break;
                        case 'submit':
                            if(data.length === 0){
                                layer.msg('请选择需要提交的信息', {time : 3000, offset: '100px'});
                            } else {
                                if(data.length === 1&&data[0].isSubmit == '已提交' &&  data[0].status != '退回'){
                                    layer.msg('您选择了已提交的信息！', {time : 3000, offset: '100px'});
                                    return;
                                }else{
                                    var isSubmit = false;
                                    $.each(data,function(index,item){
                                        if(item.isSubmit== '已提交' &&  item.status != '退回'){
                                            isSubmit = true;
                                            return false;//跳出循环
                                        }
                                    });
                                    if(isSubmit){
                                        layer.msg('您选择了已提交的信息！', {time : 3000, offset: '100px'});
                                        return;
                                    }
                                }
                                layer.confirm('信息提交后不可进行编辑、删除操作，是否继续提交？', {icon: 3, title:'提示', offset: '100px'}, function(index) {
                                    layer.close(index);
                                    $.post(requestUrl+'/jiXuJiaoYu/toSubimt.do',{
                                        "menuId":$.cookie('currentMenuId'),
                                        "jsonStr":JSON.stringify(data)
                                    },function (data) {
                                        if(data.code === 200){
                                            myself_table.reload();//重新加载表格数据
                                            window.location.reload();//刷新页面
                                            layer.msg('提交成功', {time : 3000, offset: '100px'});
                                        }else{
                                            layer.msg('提交失败', {time : 3000, offset: '100px'});
                                        }
                                    },'json');
                                });
                            }
                            break;
                    }
                });

                //监听工具条
                table.on('tool(myself_table)', function(obj){
                    var data = obj.data;
                    if (obj.event === 'detail') {
                        detail(data);
                    } else if (obj.event === 'detail-file') {
                        detail_file(data);
                    } else if (obj.event === 'detail-shenheProcess') {
                        if(data.isSubmit=='未提交'){
                            return;
                        }
                        detail_shenheProcess('教学研究-继续教育-查看审核流程',data);
                    } else if (obj.event === 'update') {
                        if(data.isSubmit== '已提交' &&  data.status != '退回'){
                            // layer.msg('信息已提交，不可编辑', {icon:7, time : 3000, offset: '100px'});
                            return;
                        }
                        //执行编辑
                        operationType = "edit";
                        let editForm_idx= layer.open({
                            title : data.peixunName + '-编辑'
                            ,type : 1
                            ,area : [ '700px', '535px' ]
                            // ,area : '500px'//只想定义宽度时，你可以area: '500px'，高度仍然是自适应的
                            ,offset : '10px'
                            ,shadeClose : true //点击遮罩关闭
                            ,content : $('#editForm')
                            ,success: function(layero, index){
                                //所有编辑页面，均增加取消按钮，不保存当前修改的内容。
                                let cancelBtn = $('<button class="layui-btn layui-btn-primary">取消</button>');
                                $("#editForm .layui-btn-container").append(cancelBtn);
                                cancelBtn.click(function (event) {
                                    // event.preventDefault();
                                    layer.close(editForm_idx);
                                });

                                //初始化laydate实例
                                laydate.render({
                                    elem: '#startDate' //指定元素
                                });
                                laydate.render({
                                    elem: '#endDate' //指定元素
                                });
                                let peixunStyleArr = data.peixunStyle.split(',');
                                let peixunStyle_xxxx=false,peixunStyle_xsxx=false;
                                for (let i = 0; i < peixunStyleArr.length; i++) {
                                    if(peixunStyleArr[i] == '线上学习'){
                                        peixunStyle_xsxx = true;
                                    }else if(peixunStyleArr[i] == '线下学习'){
                                        peixunStyle_xxxx = true;
                                    }
                                }
                                form.val("editForm",{
                                    "code":data.code,
                                    "peixunName":data.peixunName,
                                    "peixunStyle_xsxx":peixunStyle_xsxx,
                                    "peixunStyle_xxxx":peixunStyle_xxxx,
                                    "peixunStartTime":data.peixunStartTime,
                                    "peixunEndTime":data.peixunEndTime,
                                    "peixunClassHour":data.peixunClassHour,
                                    "peixunContent":data.peixunContent,
                                    "peixunAddress":data.peixunAddress,
                                    "peixunDept":data.peixunDept,
                                    "userId":data.userId,
                                    "userName":data.userName
                                });
                                //监听编辑页submit按钮提交
                                form.on('submit(editFormSubmitBtn)', function(data){
                                    let peixunStyleArr = new Array();
                                    if(data.field.peixunStyle_xxxx == "on"){
                                        peixunStyleArr.push('线下学习');
                                    }
                                    if(data.field.peixunStyle_xsxx == "on"){
                                        peixunStyleArr.push('线上学习');
                                    }
                                    let peixunStyle = peixunStyleArr.join(',');
                                    $.ajax({
                                        type: "post",
                                        url: requestUrl+'/jiXuJiaoYu/update.do',
                                        data: {
                                            "code" : data.field.code
                                            ,"peixunName" : data.field.peixunName
                                            ,"peixunStyle" : peixunStyle
                                            ,"peixunStartTime" : data.field.peixunStartTime
                                            ,"peixunEndTime" : data.field.peixunEndTime
                                            ,"peixunClassHour" : data.field.peixunClassHour
                                            ,"peixunContent" : data.field.peixunContent
                                            ,"peixunAddress" : data.field.peixunAddress
                                            ,"peixunDept" : data.field.peixunDept
                                            ,"userId":function () {
                                                return $.cookie('userId');
                                            }
                                            ,"userName":function () {
                                                return $.cookie('userName');
                                            }
                                        },
                                        dataType:'json'
                                        ,success:function(data) {
                                            if(data.code === 200){
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
                                $("#demo1").empty();
                                $("#demo2").empty();
                                $("#demo3").empty();
                                operationType=="";
                                window.location.reload();//刷新页面，清空上传弹窗上传的文件内容
                            }
                        });
                    } else if (obj.event === 'delete') {
                        if(data.isSubmit== '已提交' &&  data.status != '退回'){
                            // layer.msg('信息已提交，不可删除', {icon:7, time : 3000, offset: '100px'});
                            return;
                        }
                        layer.confirm('删除后不可恢复，真的要删除么？', {icon: 3, title:'提示', offset: '100px'}, function(index) {
                            layer.close(index);
                            $.post(requestUrl+'/jiXuJiaoYu/delete.do', { code: data.code},function(data){
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
            } else{
                $('#myself').remove();
                $('#myself_item').remove();
            }
            if(data.isShenhe > 0){ //拥有审核权限
                var other_table = table.render({ //数据表格
                    elem : '#other_table'
                    ,height : 440
                    ,id: "other_table_id"
                    ,url: requestUrl+'/jiXuJiaoYu/getPageList.do'
                    ,where:{
                        "shenHeUserId":function () {//用于区分是当前登录用户还是查询参数中的用户
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
                    ,totalRow: true
                    ,toolbar: '#other_toolbar'
                    ,cols : [[ //表头
                        {type:'checkbox', fixed: 'left'}
                        ,{type:'numbers', title:'序号', width:80, fixed: 'left', totalRowText: '合计：'}
                        // ,{field:'code', title:'编号', width:120, sort: true}
                        ,{field: 'userId', title: '工号', width:120, sort: true}
                        ,{field: 'userName', title: '姓名', width:120}
                        ,{field: 'peixunName', title: '培训名称', width:150}
                        ,{field: 'peixunStyle', title: '培训形式', width:150}
                        ,{field: 'peixunStartTime', title: '培训开始时间', width:120,hide:true}
                        ,{field: 'peixunEndTime', title: '培训结束时间', width:120,hide:true}
                        ,{field: 'peixunClassHour', title: '学时', width:120, sort: true, totalRow: true}
                        ,{field: 'peixunContent', title: '培训内容', width:120,hide:true}
                        ,{field: 'peixunAddress', title: '培训地点', width:120,hide:true}
                        ,{field: 'peixunDept', title: '培训机构', width:120}
                        ,{field: 'shenheStatus', title: '审核状态', width:120,templet: function(data){ // 函数返回一个参数 data，包含接口返回的所有字段和数据
                                var val = data.shenheStatus;
                                if(val=='已审核'){
                                    return '<span style="color: blue;font-weight: bold;">'+val+'</span>';
                                }
                                return '<span style="color: red;font-weight: bold;">'+val+'</span>';
                            }
                        } //【已审核 | 待审核 | 退回】
                        ,{fixed: 'right', width:240, align:'center', toolbar: '#other_bar'} //这里的toolbar值是模板元素的选择器
                    ]]
                    ,done: function(res, curr, count){
                        $('#other').find('span').html(res.unShenHeNum);
                    }
                });//table end.

                //监听搜索框事件
                let active = {
                    search: function(){
                        other_table.reload({
                            where: {
                                userId: $(" input[ name='other_userId' ] ").val()
                                ,userName: $(" input[ name='other_userName' ] ").val()
                                ,peixunName: $(" input[ name='other_peixunName' ] ").val()
                                ,peixunDept: $(" input[ name='other_peixunDept' ] ").val()
                                ,shenheStatus: $(" input[ name='other_shenheStatus' ] ").val()
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
                $('.other_search .layui-btn').on('click', function(){
                    let type = $(this).data('type');
                    active[type] ? active[type].call(this) : '';
                });


                //监听头工具栏事件
                table.on('toolbar(other_table)', function(obj){
                    var checkStatus = table.checkStatus(obj.config.id)
                        ,data = checkStatus.data; //获取选中的数据
                    switch(obj.event){
                        case 'submit':
                            if(data.length === 0){
                                layer.msg('请选择需要审核的数据', {time : 3000, offset: '100px'});
                                return;
                            } else {
                                if(data.length === 1&&data[0].shenheStatus == '已审核'){
                                    layer.msg('您选择了已审核的信息！', {time : 3000, offset: '100px'});
                                    return;
                                }else{
                                    let isSubmit = false;
                                    $.each(data,function(index,item){
                                        if(item.shenheStatus== '已审核'){
                                            isSubmit = true;
                                            return false;//跳出循环
                                        }
                                    });
                                    if(isSubmit){
                                        layer.msg('您选择了已审核的信息！', {time : 3000, offset: '100px'});
                                        return;
                                    }
                                }
                                //添加审核意见
                                layer.open({
                                    title : '添加审核意见'
                                    ,type : 1
                                    ,area : [ '700px', '450px' ]
                                    // ,area : '500px'//只想定义宽度时，你可以area: '500px'，高度仍然是自适应的
                                    ,offset : '10px' //只定义top坐标，水平保持居中
                                    ,shadeClose : true //点击遮罩关闭
                                    ,btn : ['关闭']
                                    ,content : $('#shenHeForm')
                                    ,success: function(layero, index){
                                        //
                                        form.on('select(status)', function(data) {
                                            if(data.value == '通过'){
                                                $('#opinion').html('通过');
                                            }
                                            if(data.value == '退回'){
                                                $('#opinion').empty();
                                            }
                                        });
                                        //
                                        form.on('submit(shenHeFormSubmitBtn)', function(formData){
                                            $.post(requestUrl+'/jiXuJiaoYu/toShenhe.do',{
                                                "jsonStr":JSON.stringify(data)
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
                                                    // window.location.reload();//刷新页面，审核后页面状态未改变
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
                    var data = obj.data;
                    if (obj.event === 'detail') {
                        detail(data);
                    } else if (obj.event === 'detail-file') {
                        detail_file(data);
                    } else if (obj.event === 'detail-shenheProcess') {
                        detail_shenheProcess('教学研究-继续教育-查看审核流程',data);
                    }
                });
            } else{
                $('#other').remove();
                $('#other_item').remove();
            }

            let detail = function (data) {
                if(isOpen){
                    return;
                }
                var isOpen = false;
                layer.open({
                    title : data.peixunName + '-详情'
                    ,type : 1
                    ,area : [ '700px', '535px' ]
                    // ,area : '500px'//只想定义宽度时，你可以area: '500px'，高度仍然是自适应的
                    ,offset : '10px' //只定义top坐标，水平保持居中
                    ,shadeClose : true //点击遮罩关闭
                    ,btn : ['关闭']
                    ,content : '<table class="layui-table">\n' +
                        '        <tbody>\n' +
                        '            <tr><td style="width: 150px; text-align: center">工号</td><td>'+data.userId+'</td></tr>\n' +
                        '            <tr><td style="width: 150px; text-align: center">姓名</td><td>'+data.userName+'</td></tr>\n' +
                        '            <tr><td style="width: 150px; text-align: center">培训名称</td><td>'+data.peixunName+'</td></tr>\n' +
                        '            <tr><td style="width: 150px; text-align: center">培训形式</td><td>'+data.peixunStyle+'</td></tr>\n' +
                        '            <tr><td style="width: 150px; text-align: center">培训开始时间</td><td>'+data.peixunStartTime+'</td></tr>\n' +
                        '            <tr><td style="width: 150px; text-align: center">培训结束时间</td><td>'+data.peixunEndTime+'</td></tr>\n' +
                        '            <tr><td style="width: 150px; text-align: center">学时</td><td>'+data.peixunClassHour+'</td></tr>\n' +
                        '            <tr><td style="width: 150px; text-align: center">培训内容</td><td>'+data.peixunContent+'</td></tr>\n' +
                        '            <tr><td style="width: 150px; text-align: center">培训地点</td><td>'+data.peixunAddress+'</td></tr>\n' +
                        '            <tr><td style="width: 150px; text-align: center">培训组织机构</td><td>'+data.peixunDept+'</td></tr>\n' +
                        '        </tbody>\n' +
                        '    </table>'
                    ,success: function(layero, index){
                        isOpen = true;
                    }
                    ,end:function () {
                        isOpen = false;
                    }
                });
            };

            let detail_file = function (data) {
                layer.open({
                    title : '继续教育-附件'
                    ,type : 1
                    ,offset : '10px'
                    ,moveOut:true
                    ,shadeClose : true //点击遮罩关闭
                    ,area : [ '1175px', '535px' ]
                    ,content : $('#viewFileContainer')
                    ,success: function(layero, index){
                        $.get(requestUrl+"/getFileListByRelationCode.do" , {
                            "relationCode": function () {
                                return data.code;
                            }
                        } ,  function(data){
                            if(data.data.length==0){
                                layer.msg('还没有上传文件哦', {time : 3000, offset: '100px'});
                                let tr = '<tr><td colspan="5" style="text-align: center;">无数据</td></tr>';
                                $('#file_xdth').append(tr);
                                $('#file_qtwj').append(tr);
                                return;
                            }
                            let xdthNum=0,qtwjNum = 0;
                            $.each(data.data,function(index,file){
                                switch (file.fileType) {
                                    case "jyzs":
                                        $('#file_jyzs').append('<img id="'+file.code+'" src="'+requestUrl+file.filePath +'" alt="结业证书" style="width: 150px; margin:5px; cursor: pointer;">');
                                        $("#"+file.code).dblclick(function() {
                                            preview_fileInfo(file);
                                        });
                                        break;
                                    case "chzp":
                                        $('#file_chzp').append('<img id="'+file.code+'" src="'+requestUrl+file.filePath +'" alt="参会照片" style="width: 150px; margin:5px; cursor: pointer;">');
                                        $("#"+file.code).dblclick(function() {
                                            preview_fileInfo(file);
                                        });
                                        break;
                                    case "xdth":
                                        xdthNum++;
                                        let xdthtr = $(['<tr id="'+ file.code +'">'
                                            ,'<td>	<a href="javascript:void(0)">'+ file.fileName +'</a></td>'
                                            ,'<td>'+ file.fileName.split('.').pop() +'</td>' //pop() 方法用于删除并返回数组的最后一个元素
                                            ,'<td>'+ file.fileSize +'kb</td>'
                                            ,'<td>'+ file.createDate +'</td>'
                                            ,'<td>' +
                                            '<button class="layui-btn layui-btn-xs layui-btn-normal demo-view">预览</button>' +
                                            '<button class="layui-btn layui-btn-xs layui-btn-normal demo-download">下载</button>' +
                                            '</td>'
                                            ,'</tr>'].join(''));
                                        //预览
                                        xdthtr.find('a').on('click', function(){
                                            preview_fileInfo(file);
                                        });
                                        xdthtr.find('.demo-view').on('click', function(){
                                            preview_fileInfo(file);
                                        });
                                        xdthtr.find('.demo-download').on('click', function(){
                                            let downloadForm = $("<form action='"+requestUrl+"/downloadFileInfo.do' method='post'></form>");
                                            downloadForm.append("<input type='hidden' name='fileName' value='"+file.fileName+"'/>");
                                            downloadForm.append("<input type='hidden' name='filePath' value='"+file.filePath+"'/>");
                                            $(document.body).append(downloadForm);
                                            // alert(downloadForm.serialize());
                                            downloadForm.submit();
                                            downloadForm.remove();
                                        });
                                        $('#file_xdth').append(xdthtr);
                                                    break;
                                    case "qtwj":
                                        qtwjNum++;
                                        let qtwjtr = $(['<tr id="'+ file.code +'">'
                                            ,'<td>	<a href="javascript:void(0)">'+ file.fileName +'</a></td>'
                                            ,'<td>'+ file.fileName.split('.').pop() +'</td>' //pop() 方法用于删除并返回数组的最后一个元素
                                            ,'<td>'+ file.fileSize +'kb</td>'
                                            ,'<td>'+ file.createDate +'</td>'
                                            ,'<td>' +
                                                '<button class="layui-btn layui-btn-xs layui-btn-normal demo-view">预览</button>' +
                                                '<button class="layui-btn layui-btn-xs layui-btn-normal demo-download">下载</button>' +
                                            '</td>'
                                            ,'</tr>'].join(''));
                                        //预览
                                        qtwjtr.find('a').on('click', function(){
                                            preview_fileInfo(file);
                                        });
                                        qtwjtr.find('.demo-view').on('click', function(){
                                            preview_fileInfo(file);
                                        });
                                        qtwjtr.find('.demo-download').on('click', function(){
                                            let downloadForm = $("<form action='"+requestUrl+"/downloadFileInfo.do' method='post'></form>");
                                            downloadForm.append("<input type='hidden' name='fileName' value='"+file.fileName+"'/>");
                                            downloadForm.append("<input type='hidden' name='filePath' value='"+file.filePath+"'/>");
                                            $(document.body).append(downloadForm);
                                            // alert(downloadForm.serialize());
                                            downloadForm.submit();
                                            downloadForm.remove();
                                        });
                                        $('#file_qtwj').append(qtwjtr);
                                        break;
                                }
                            });
                            if(xdthNum == 0){
                                let tr = '<tr><td colspan="5" style="text-align: center;">无数据</td></tr>';
                                $('#file_xdth').append(tr);
                            }
                            if(qtwjNum == 0){
                                let tr = '<tr><td colspan="5" style="text-align: center;">无数据</td></tr>';
                                $('#file_qtwj').append(tr);
                            }
                        }, "json");
                    }
                    ,end:function () {
                        $('#file_jyzs').empty();
                        $('#file_chzp').empty();
                        $('#file_xdth').empty();
                        $('#file_qtwj').empty();
                    }
                });
            };

            var operationType="" //操作类别
                ,uploadTest1 //结业证书
                ,uploadTest2 //参会照片
                ,uploadTest3; //其他文件
            $(document).on('click','#upload',function(data){
                // alert(JSON.stringify(data));
                layer.open({
                    title : '继续教育-附件'
                    ,type : 1
                    ,area : [ '1175px', '535px' ]
                    // ,area : '500px'//只想定义宽度时，你可以area: '500px'，高度仍然是自适应的
                    ,offset : '10px'
                    ,moveOut:true
                    ,shadeClose : true //点击遮罩关闭
                    ,content : $('#uploadFileContainer')
                    ,success: function(layero, index){
                        if(operationType =="edit"){
                            $.get(requestUrl+"/getFileListByRelationCode.do" , {
                                "relationCode": $(" input[ name='code' ] ").val()
                            } ,  function(data){
                                if(data.data.length>0){
                                    $.each(data.data,function(index,file){
                                        let imgDiv = '<div id="imgDiv_'+file.code+'" class="imgDiv">' +
                                            '              <a href="javascript:void(0)"><img src="../../../layui/images/icon/delete.jpg" class="delete" /></a>\n' +
                                            '              <img id="'+file.code+'" data-id="'+file.code+'" src="'+requestUrl+file.filePath +'" alt="继续教育-附件" style="width: 150px; margin:5px;">\n' +
                                            '         </div>';
                                        switch (file.fileType) {
                                            case "jyzs":
                                                $('#demo1').append(imgDiv);
                                                break;
                                            case "chzp":
                                                $('#demo2').append(imgDiv);
                                                break;
                                            case "xdth":
                                                var tr = $(['<tr id="'+ file.code +'">'
                                                    ,'<td>	<a href="javascript:void(0)">'+ file.fileName +'</a></td>'
                                                    ,'<td>'+ file.fileSize +'kb</td>'
                                                    ,'<td>已上传</td>'
                                                    ,'<td>' +
                                                    '   <button class="layui-btn layui-btn-xs layui-btn-normal preview_fileInfo">预览</button>' +
                                                    '   <button class="layui-btn layui-btn-xs layui-btn-danger demo-delete">删除</button>' +
                                                    '</td>'
                                                    ,'</tr>'].join(''));
                                                $('#xdthList').append(tr);
                                                //预览
                                                tr.find('a').on('click', function(){
                                                    preview_fileInfo(file);
                                                });
                                                tr.find('.preview_fileInfo').on('click', function(){
                                                    preview_fileInfo(file);
                                                });
                                                //删除
                                                tr.find('.demo-delete').on('click', function(){
                                                    $.post(requestUrl+"/deleteFileInfo.do" , {
                                                        "code": tr.attr("id")
                                                    } ,  function(data){
                                                        tr.remove();
                                                    }, "json");
                                                });
                                                break;
                                            case "qtwj":
                                                var tr = $(['<tr id="'+ file.code +'">'
                                                    ,'<td>	<a href="javascript:void(0)">'+ file.fileName +'</a></td>'
                                                    ,'<td>'+ file.fileSize +'kb</td>'
                                                    ,'<td>已上传</td>'
                                                    ,'<td>' +
                                                    '   <button class="layui-btn layui-btn-xs layui-btn-normal preview_fileInfo">预览</button>' +
                                                    '   <button class="layui-btn layui-btn-xs layui-btn-danger demo-delete">删除</button>' +
                                                    '</td>'
                                                    ,'</tr>'].join(''));
                                                $('#demoList').append(tr);
                                                //预览
                                                tr.find('a').on('click', function(){
                                                    preview_fileInfo(file);
                                                });
                                                tr.find('.preview_fileInfo').on('click', function(){
                                                    preview_fileInfo(file);
                                                });
                                                //删除
                                                tr.find('.demo-delete').on('click', function(){
                                                    $.post(requestUrl+"/deleteFileInfo.do" , {
                                                        "code": tr.attr("id")
                                                    } ,  function(data){
                                                        tr.remove();
                                                    }, "json");
                                                });
                                                break;
                                        }
                                        //
                                        $("#imgDiv_"+file.code).mouseenter(function () {
                                            $(this).find(".delete").show();
                                        });
                                        //
                                        $("#imgDiv_"+file.code).mouseleave(function () {
                                            $(this).find(".delete").hide();
                                        });
                                        //
                                        $("#imgDiv_"+file.code).find("a").click(function (event) {
                                            $.post(requestUrl+"/deleteFileInfo.do" , {
                                                "code": file.code
                                            } ,  function(data){
                                                layer.msg(data.msg);
                                            }, "json");
                                            $(this).parent().remove();
                                        });
                                        //
                                        $("#"+file.code).dblclick(function() {
                                            preview_fileInfo(file);
                                        });
                                    });
                                }
                            }, "json");
                        }

//结业证书
                        uploadTest1 = upload.render({
                            elem: '#test1' //指向容器选择器，如：elem: '#id'。也可以是DOM对象
                            ,url: requestUrl+'/uploadFileInfo.do' // 	服务端上传接口
                            ,data:{ //请求上传接口的额外参数。如：data: {id: 'xxx'}
                                "relationCode":function () {return $(" input[ name='code' ] ").val();}
                                ,"fileCategory":"JXYJ_JXJY" // 固定值
                                ,"fileType":"jyzs" // 固定值
                                ,"userId":function () {return $.cookie('userId');}
                                ,"userName":function () {return $.cookie('userName');}
                            }
                            ,field:"file" //设定文件域的字段名
                            ,accept:"file" //指定允许上传时校验的文件类型，可选值有：images（图片）、file（所有文件）、video（视频）、audio（音频）
                            ,exts:'jpg|png|gif|bmp|jpeg|pdf'
                            ,before: function(obj){
                                obj.preview(function(index, file, result){
                                    let imgDiv = '<div id="imgDiv_'+index+'" class="imgDiv">' +
                                        '              <a href="javascript:void(0)"><img src="../../../layui/images/icon/delete.jpg" class="delete" /></a>\n' +
                                        '              <img src="'+result+'" style="width: 150px; margin:5px;">\n' +
                                        '         </div>';
                                    $('#demo1').append(imgDiv);
                                });
                            }
                            ,done: function(res, index, upload){ //执行上传请求后的回调。返回三个参数，分别为：res（服务端响应信息）、index（当前文件的索引）、upload（重新上传的方法，一般在文件上传失败后使用）
                                //
                                $("#imgDiv_"+index).mouseenter(function () {
                                    $(this).find(".delete").show();
                                });
                                //
                                $("#imgDiv_"+index).mouseleave(function () {
                                    $(this).find(".delete").hide();
                                });
                                //
                                $("#imgDiv_"+index).find("a").click(function (event) {
                                    $.post(requestUrl+"/deleteFileInfo.do" , {
                                        "code": res.data.code
                                    } ,  function(result_data){
                                        layer.msg(result_data.msg);
                                    }, "json");
                                    $(this).parent().remove();
                                });
                                //
                                $("#imgDiv_"+index).dblclick(function() {
                                    preview_fileInfo(res.data);
                                });
                                //
                                return layer.msg(res.msg);
                            }
                            ,error: function(){
                            }
                        });

//参会照片
                        var test2Files;
                        uploadTest2=upload.render({
                            elem: '#test2'
                            ,url: requestUrl+'/uploadFileInfo.do' // 	服务端上传接口
                            ,data:{ //请求上传接口的额外参数。如：data: {id: 'xxx'}
                                "relationCode":function () { return $(" input[ name='code' ] ").val();}
                                ,"fileCategory":"JXYJ_JXJY" // 固定值
                                ,"fileType":"chzp" // 固定值
                                ,"userId":function () {
                                    return $.cookie('userId');
                                }
                                ,"userName":function () {
                                    return $.cookie('userName');
                                }
                            }
                            ,field:"file"
                            ,multiple: true
                            ,accept:"images"
                            ,acceptMime: 'image/*' //（只显示图片文件）
                    ,choose: function(obj){
                                test2Files = obj.pushFile();
                            }
                            ,before: function(obj){
                                layer.load();
                                obj.preview(function(index, file, result){
                                    let imgDiv = '<div id="imgDiv_'+index+'" class="imgDiv">' +
                                        '              <a href="javascript:void(0)"><img src="../../../layui/images/icon/delete.jpg" class="delete" /></a>\n' +
                                        '              <img src="'+result+'" style="width: 150px; margin:5px;">\n' +
                                        '         </div>';
                                    $('#demo2').append(imgDiv);
                                });
                            }
                            ,done: function(res, index, upload){
                                layer.closeAll('loading');
                                //
                                $("#imgDiv_"+index).mouseenter(function () {
                                    $(this).find(".delete").show();
                                });
                                //
                                $("#imgDiv_"+index).mouseleave(function () {
                                    $(this).find(".delete").hide();
                                });
                                //
                                $("#imgDiv_"+index).find("a").click(function (event) {
                                    $.post(requestUrl+"/deleteFileInfo.do" , {
                                        "code": res.data.code
                                    } ,  function(result_data){
                                        layer.msg(result_data.msg);
                                    }, "json");
                                    $(this).parent().remove();
                                });
                                //
                                $("#imgDiv_"+index).dblclick(function() {
                                    preview_fileInfo(res.data);
                                });
                            }
                            ,allDone: function(obj){
                                layer.closeAll('loading');
                            }
                            ,error: function(index, upload){
                                layer.closeAll('loading');
                            }
                        });

                        //心得体会
                        let xdthListView = $('#xdthList')
                            ,upload_xdth = upload.render({
                            elem: '#upload_xdth'
                            ,url: requestUrl+'/uploadFileInfo.do' // 	服务端上传接口
                            ,data:{ //请求上传接口的额外参数。如：data: {id: 'xxx'}
                                "relationCode":function () {
                                    return $(" input[ name='code' ] ").val();
                                }
                                ,"fileCategory":"JXYJ_JXJY" // 固定值
                                ,"fileType":"xdth" // 固定值
                                ,"userId":function () {
                                    return $.cookie('userId');
                                }
                                ,"userName":function () {
                                    return $.cookie('userName');
                                }
                            }
                            ,field:"file" //设定文件域的字段名
                            ,multiple: true // 	是否允许多文件上传
                            ,accept: 'file'//指定允许上传时校验的文件类型，可选值有：images（图片）、file（所有文件）、video（视频）、audio（音频）
                            ,exts:'jpg|png|gif|bmp|jpeg|pdf'
                            ,choose: function(obj){
                                let files = this.files = obj.pushFile(); //将每次选择的文件追加到文件队列
                                //读取本地文件
                                obj.preview(function(index, file, result){
                                    var tr = $(['<tr id="upload-'+ index +'">'
                                        ,'<td>	<a href="javascript:void(0)">'+ file.name +'</a></td>'
                                        ,'<td>'+ (file.size/1024).toFixed(1) +'kb</td>'
                                        ,'<td>待上传</td>'
                                        ,'<td>' +
                                        '   <button class="layui-btn layui-btn-xs layui-btn-normal preview_fileInfo">预览</button>' +
                                        '   <button class="layui-btn layui-btn-xs layui-btn-danger demo-delete">删除</button>' +
                                        '</td>'
                                        ,'</tr>'].join(''));
                                    xdthListView.append(tr);
                                    //删除
                                    tr.find('.demo-delete').on('click', function(){
                                        $.post(requestUrl+"/deleteFileInfo.do" , {
                                            "code": $('#upload-'+index).attr("data-id")
                                        } ,  function(data){
                                            delete files[index]; //删除对应的文件
                                            tr.remove();
                                            upload_xdth.config.elem.next()[0].value = '';
                                        }, "json");
                                    });
                                });
                            }
                            ,done: function(res, index, upload){
                                if(res.code == 200){ //上传成功
                                    let tr = xdthListView.find('tr#upload-'+ index)
                                        ,tds = tr.children();
                                    tr.attr("data-id",res.data.code);//
                                    tds.eq(2).html('<span style="color: #5FB878;">已上传</span>');
                                    // tds.eq(3).html(''); //清空操作

                                    //预览
                                    let fileInfo = res.data;
                                    tr.find('a').on('click', function(){
                                        preview_fileInfo(fileInfo);
                                    });
                                    tr.find('.preview_fileInfo').on('click', function(){
                                        preview_fileInfo(fileInfo);
                                    });

                                    return delete this.files[index]; //删除文件队列已经上传成功的文件
                                }
                                this.error(index, upload);
                            }
                            ,error: function(index, upload){
                                let tr = xdthListView.find('tr#upload-'+ index)
                                    ,tds = tr.children();
                                tds.eq(2).html('<span style="color: #FF5722;">上传失败</span>');
                                // tds.eq(3).find('.demo-reload').removeClass('layui-hide'); //显示重传
                            }
                        });
                        //其他文件
                        var demoListView = $('#demoList')
                            ,uploadListIns = upload.render({
                            elem: '#testList'
                            ,url: requestUrl+'/uploadFileInfo.do' // 	服务端上传接口
                            ,data:{ //请求上传接口的额外参数。如：data: {id: 'xxx'}
                                "relationCode":function () {
                                    return $(" input[ name='code' ] ").val();
                                }
                                ,"fileCategory":"JXYJ_JXJY" // 固定值
                                ,"fileType":"qtwj" // 固定值
                                ,"userId":function () {
                                    return $.cookie('userId');
                                }
                                ,"userName":function () {
                                    return $.cookie('userName');
                                }
                            }
                            ,field:"file" //设定文件域的字段名
                            ,multiple: true // 	是否允许多文件上传
                            ,accept: 'file'//指定允许上传时校验的文件类型，可选值有：images（图片）、file（所有文件）、video（视频）、audio（音频）
                            ,exts:'jpg|png|gif|bmp|jpeg|pdf'
                            // ,auto: false //是否选完文件后自动上传。如果设定 false，那么需要设置 bindAction 参数来指向一个其它按钮提交上传
                            // ,bindAction: '#testListAction' //指向一个按钮触发上传，一般配合 auto: false 来使用。值为选择器或DOM对象，如：bindAction: '#btn'
                            ,choose: function(obj){
                                var files = this.files = obj.pushFile(); //将每次选择的文件追加到文件队列
                                //读取本地文件
                                obj.preview(function(index, file, result){
                                    // alert(JSON.stringify(file));
                                    var tr = $(['<tr id="upload-'+ index +'">'
                                        ,'<td>	<a href="javascript:void(0)">'+ file.name +'</a></td>'
                                        ,'<td>'+ (file.size/1024).toFixed(1) +'kb</td>'
                                        ,'<td>待上传</td>'
                                        ,'<td>' +
                                        '   <button class="layui-btn layui-btn-xs layui-btn-normal preview_fileInfo">预览</button>' +
                                        '   <button class="layui-btn layui-btn-xs layui-btn-danger demo-delete">删除</button>' +
                                        '</td>'
                                        ,'</tr>'].join(''));
                                    demoListView.append(tr);
                                    //删除
                                    tr.find('.demo-delete').on('click', function(){
                                        $.post(requestUrl+"/deleteFileInfo.do" , {
                                            "code": $('#upload-'+index).attr("data-id")
                                        } ,  function(data){
                                            // layer.msg(data.msg);
                                            delete files[index]; //删除对应的文件
                                            tr.remove();
                                            uploadListIns.config.elem.next()[0].value = ''; //清空 input file 值，以免删除后出现同名文件不可选
                                        }, "json");
                                    });
                                });
                            }
                            ,done: function(res, index, upload){
                                // alert(JSON.stringify(res));
                                if(res.code == 200){ //上传成功
                                    var tr = demoListView.find('tr#upload-'+ index)
                                        ,tds = tr.children();
                                    tr.attr("data-id",res.data.code);//
                                    tds.eq(2).html('<span style="color: #5FB878;">已上传</span>');
                                    // tds.eq(3).html(''); //清空操作

                                    //预览
                                    let fileInfo = res.data;
                                    tr.find('a').on('click', function(){
                                        preview_fileInfo(fileInfo);
                                    });
                                    tr.find('.preview_fileInfo').on('click', function(){
                                        preview_fileInfo(fileInfo);
                                    });

                                    return delete this.files[index]; //删除文件队列已经上传成功的文件
                                }
                                this.error(index, upload);
                            }
                            ,error: function(index, upload){
                                var tr = demoListView.find('tr#upload-'+ index)
                                    ,tds = tr.children();
                                tds.eq(2).html('<span style="color: #FF5722;">上传失败</span>');
                                // tds.eq(3).find('.demo-reload').removeClass('layui-hide'); //显示重传
                            }
                        });
                    },end:function () {
                        //重载所有上传实例
                        // uploadTest1.reload();
                        // uploadTest2.reload();
                        // uploadTest3.reload();
                        if(operationType=="edit"){
                            $("#demo1").empty();
                            $("#demo2").empty();
                            $("#demo3").empty();
                        }
                    }
                });
            });
        }
        ,error:function() {
            layer.msg('网络连接失败', {icon:7, time : 3000, offset: '100px'});
        }
    });
});
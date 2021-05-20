/*
双创教育-文、体类比赛
 */
layui.use(['layer','element','table','form','laydate','upload'], function(){
    let $ = layui.$,layer = layui.layer,element = layui.element,table = layui.table,form = layui.form,laydate = layui.laydate,upload = layui.upload;

    const currentMenuId = $.cookie('currentMenuId');

    //验证用户是否拥有提交、审核权限
    $.ajax({
        type: "get",
        url: requestUrl+'/getUserAuth.do', //查询用户是否拥有当前菜单的提交、审核权限
        data: {
            "menuId":function () {
                return currentMenuId;
            },
            "userId":function () {
                return $.cookie('userId');
            }
        },
        dataType:'json'
        ,success:function(data) {
            var data = data.data;

            // 初始化获得奖项下拉选项
            $.get(requestUrl+'/optionset/getOptionSetList.do',{
                'menuId':function () {
                    return currentMenuId;
                },
                'attr': 'level2'
            },function(result_data){
                if(result_data.code == 200){
                    if(result_data.data.length >0){
                        initSelect('请选择','level2',result_data.data);
                        form.render('select');
                    }
                }
            },'json');

            if(data.isAuthSubmit > 0){

                laydate.render({
                    elem: "#myself_search_zsGrantDateStart" //指定元素
                });
                laydate.render({
                    elem: "#myself_search_zsGrantDateEnd" //指定元素
                });

                //数据表格
                var myself_table = table.render({
                    id: "myself_table"
                    ,elem : '#myself_table'
                    ,height : 435
                    ,url: requestUrl+'/scjy_wtbs/getPageList.do'
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
                        , limits: [10,20,50,100]
                        , first: '首页' //不显示首页
                        , prev: '上一页'
                        , next: '下一页'
                        , last: '尾页' //不显示尾页
                    }
                    ,limit: 10
                    ,even: true //隔行背景
                    ,toolbar: '#myself_toolbar' //指向自定义工具栏模板选择器
                    ,cols : [[ //表头
                        {type:'checkbox', fixed: 'left'}
                        ,{type:'numbers', title:'序号', width:80, fixed: 'left'}
                        ,{field: 'name', title: '赛事名称', width:200, sort:true}
                        ,{field: 'type', title: '赛事类型', width:200, sort:true}
                        ,{field: 'level1', title: '获奖级别', width:150, sort:true}
                        ,{field: 'level2', title: '获得奖项', width:150, sort:true}
                        ,{field: 'zsNum', title: '证书编号', width:150, sort:true}
                        ,{field: 'zsGrantUnit', title: '证书授予单位', width:150, sort:true}
                        ,{field: 'zsGrantDate', title: '证书授予日期', width:150, sort:true}
                        ,{field: 'userId', title: '第一指导教师工号', width:160, sort:true, hide:true}
                        ,{field: 'userName', title: '第一指导教师姓名', width:160, sort:true, hide:true}
                        ,{field: 'userUnit', title: '第一指导教师单位', width:160, sort:true, hide:true}
                        ,{field: 'isSubmit', title: '提交状态', width:120, sort:true, templet: function(data){ // 函数返回一个参数 data，包含接口返回的所有字段和数据
                                var val = data.isSubmit;
                                var html = '        <a class="layui-btn layui-btn-primary layui-btn-xs" lay-event="detail_dataInfo">查看信息</a>';
                                if(val=='已提交'){
                                    html += '       <a class="layui-btn layui-btn-normal layui-btn-xs" lay-event="detail_shenheProcess">查看流程</a>\n' +
                                        '           <a class="layui-btn layui-btn-disabled layui-btn-xs" lay-event="update">编辑</a>\n' +
                                        '           <a class="layui-btn layui-btn-disabled layui-btn-xs" lay-event="delete">删除</a>';
                                    $('#myself_bar').html(html);
                                    return '<span style="color: blue;font-weight: bold;">'+val+'</span>';
                                }else{
                                    if(data.status == '退回'){
                                        html+= '    <a class="layui-btn layui-btn-normal layui-btn-xs" lay-event="detail_shenheProcess">查看流程</a>';
                                    }else{
                                        html+= '    <a class="layui-btn layui-btn-disabled layui-btn-xs" lay-event="detail_shenheProcess">查看流程</a>';
                                    }
                                    html += '       <a class="layui-btn layui-btn-warm layui-btn-xs" lay-event="update">编辑</a>\n' +
                                        '           <a class="layui-btn layui-btn-danger layui-btn-xs" lay-event="delete">删除</a>';
                                    $('#myself_bar').html(html);
                                    return '<span style="font-weight: bold;">'+val+'</span>';
                                }
                            }
                        }
                        ,{field: 'status', title: '审核状态', width:120, sort:true,templet: function(data){ // 函数返回一个参数 data，包含接口返回的所有字段和数据
                                var val = data.status;
                                if(val=='审核中'){
                                    return '<span style="color: blue;font-weight: bold;">'+val+'</span>';
                                } else if(val=='通过'){
                                    return '<span style="color: green;font-weight: bold;">'+val+'</span>';
                                } else if(val=='未通过' || val=='退回'){
                                    return '<span style="color: red;font-weight: bold;">'+val+'</span>';
                                } else {
                                    return '<span style="color: gray;font-weight: bold;">待审核</span>';
                                }
                            }
                        }
                        ,{field: 'createDate', title: '创建时间', width:150, sort:true}
                        ,{fixed: 'right', width:268, align:'center', toolbar: '#myself_bar'} //这里的toolbar值是模板元素的选择器
                    ]]
                    ,done: function(res, curr, count){ //数据渲染完的回调

                        //监听行双击事件
                        table.on('rowDouble(myself_table)', function(obj){
                            detail_dataInfo(obj.data,true);
                        });
                    }
                });//table end.

                //监听搜索框事件
                let active = {
                    search: function(){
                        myself_table.reload({
                            where: {
                                'name': $(".myself_search input[name='name']").val()
                                // ,'type': $(".myself_search select[name='type']").val()
                                ,'level1': $(".myself_search select[name='level1']").val()
                                ,'level2': $(".myself_search select[name='level2']").val()
                                ,'zsGrantDateStart': $(".myself_search input[name='zsGrantDateStart']").val()
                                ,'zsGrantDateEnd': $(".myself_search input[name='zsGrantDateEnd']").val()
                                ,'status': $("#status option:selected").val() //获取选中的值
                            }
                            ,page: {
                                curr: 1 //重新从第 1 页开始
                            }
                        });
                    }
                    ,reset: function () {
                        $(".myself_search input").val('');
                        //清除选中状态
                        // $(".myself_search select[name='type']").val("");
                        $(".myself_search select[name='level1']").val("");
                        $(".myself_search select[name='level2']").val("");
                        $("#status").val("");
                        form.render("select");
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
                            let objCode = new Date().getTime(); //初始化业务数据编号
                            layer.open({
                                title : '双创教育-文、体类比赛-新增'
                                ,type : 1
                                ,area : [ '900px', '500px' ]
                                ,offset : '50px'
                                ,content : $('#editForm_container')
                                ,success: function(layero, index){

                                    //初始化表单
                                    initEditForm({
                                        'code': objCode
                                        ,'userId':$.cookie('userId')
                                        ,'userName':$.cookie('userName')
                                        ,'userUnit':$.cookie('userUnit')
                                    });

                                    //监听表单提交
                                    form.on('submit(toSubmitEidtForm)', function(data){
                                        let formData = data.field;
                                        $.post(requestUrl+'/scjy_wtbs/insert.do' ,formData ,function(result_data){
                                            layer.msg(result_data.msg, { offset: '100px'}, function () {
                                                /*if(result_data.code == 200){
                                                    myself_table.reload();//重新加载表格数据
                                                }*/
                                                layer.close(index);
                                            });
                                        },'json');
                                    });
                                }
                                ,cancel: function(index, layero){
                                    layer.confirm('表单未提交，填写的信息将会清空？', {icon: 3, title:'提示', offset: '100px'}, function(index) {
                                        $.post(requestUrl+'/deleteFileInfo.do', { "relationCode": objCode});
                                        layer.closeAll();
                                    });
                                    return false;
                                }
                                ,end: function () {
                                    window.location.reload();
                                }
                            });
                            break;
                        case 'submit':
                            if(data.length === 0){
                                layer.msg('请选择需要提交的信息', {time : 3000, offset: '100px'});
                            } else {
                                let isSubmit = false;
                                $.each(data,function(idx,obj){
                                    if(obj.isSubmit== '已提交'){
                                        isSubmit = true;
                                        return false;//跳出循环
                                    }
                                });
                                if(isSubmit){
                                    layer.msg('您选择了已提交的信息', {time : 3000, offset: '100px'});
                                    return;
                                }else{
                                    toSubmit(data);
                                }
                            }
                            break;
                    }
                });

                //监听工具条
                table.on('tool(myself_table)', function(obj){
                    var data = obj.data;

                    if (obj.event === 'detail_dataInfo') {
                        detail_dataInfo(data,true);
                    } else if (obj.event === 'detail_shenheProcess') {
                        if(data.isSubmit=='未提交' && data.status !='退回'){
                            return;
                        }
                        detail_shenheProcess('双创教育-文、体类比赛-查看审核流程',data);
                    } else if (obj.event === 'update') {
                        if(data.isSubmit== '已提交'){
                            return;
                        }
                        //执行编辑
                        layer.open({
                            title : '双创教育-文、体类比赛-编辑'
                            ,type : 1
                            ,area : [ '900px', '500px' ]
                            ,offset : '50px'
                            ,shadeClose : true //点击遮罩关闭
                            ,content : $('#editForm_container')
                            ,success: function(layero, index){
                                //所有编辑页面，均增加取消按钮，不保存当前修改的内容。
                                let cancelBtn = $('<button class="layui-btn layui-btn-primary">取消</button>');
                                $("#editForm .layui-btn-container").append(cancelBtn);
                                cancelBtn.click(function (event) {
                                    layer.close(index);
                                });

                                //初始化表单
                                initEditForm(data);

                                //监听表单提交
                                form.on('submit(toSubmitEidtForm)', function(data){
                                    let formData = data.field;
                                    $.post(requestUrl+'/scjy_wtbs/update.do' ,formData ,function(result_data){
                                        layer.msg(result_data.msg, { offset: '100px'}, function () {
                                            /*if(result_data.code == 200){
                                                myself_table.reload();//重新加载表格数据
                                            }*/
                                            layer.close(index);
                                        });
                                    },'json');
                                });
                            }
                            ,end: function () {
                                window.location.reload();
                            }
                        });
                    } else if (obj.event === 'delete') {
                        if(data.isSubmit== '已提交'){
                            // layer.msg('信息已提交，不可删除', {icon:7, time : 3000, offset: '100px'});
                            return;
                        }
                        layer.confirm('删除后不可恢复，真的要删除么？', {icon: 3, title:'提示', offset: '100px'}, function(index) {
                            $.post(requestUrl+'/scjy_wtbs/delete.do', { "code": data.code},function(result_data){
                                layer.msg(result_data.msg, { offset: '100px'}, function () {
                                    if(result_data.code == 200){
                                        myself_table.reload();//重新加载表格数据
                                    }
                                    layer.close(index);
                                });
                            }, "json");
                        });
                    }
                });

            } else{
                $('#myself').remove();
                $('#myself_item').remove();
                $('#other').removeClass().addClass("layui-this");
                $('#other_item').removeClass().addClass("layui-tab-item layui-show");
            }
            if(data.isAuthShenhe > 0){ //拥有审核权限

                laydate.render({
                    elem: "#other_search_zsGrantDateStart" //指定元素
                });
                laydate.render({
                    elem: "#other_search_zsGrantDateEnd" //指定元素
                });

                var other_table = table.render({//数据表格
                    id: "other_table"
                    ,elem : '#other_table'
                    ,height : 435
                    ,url: requestUrl+'/scjy_wtbs/getPageList.do'
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
                        , first: '首页'
                        , prev: '上一页'
                        , next: '下一页'
                        , last: '尾页'
                    }
                    ,limit: 10
                    ,even: true
                    ,toolbar: '#other_toolbar'
                    ,cols : [[ //表头
                        {type:'checkbox', fixed: 'left'}
                        ,{type:'numbers', title:'序号', width:80, fixed: 'left'}
                        ,{field: 'name', title: '赛事名称', width:200, sort:true}
                        ,{field: 'type', title: '赛事类型', width:200, sort:true}
                        ,{field: 'level1', title: '获奖级别', width:150, sort:true}
                        ,{field: 'level2', title: '获得奖项', width:150, sort:true}
                        ,{field: 'zsNum', title: '证书编号', width:150, sort:true}
                        ,{field: 'zsGrantUnit', title: '证书授予单位', width:150, sort:true}
                        ,{field: 'zsGrantDate', title: '证书授予日期', width:150, sort:true}
                        ,{field: 'userId', title: '第一指导教师工号', width:160, sort:true, hide:true}
                        ,{field: 'userName', title: '第一指导教师姓名', width:160, sort:true, hide:true}
                        ,{field: 'userUnit', title: '第一指导教师单位', width:160, sort:true, hide:true}
                        ,{field: 'shenheStatus', title: '审核状态', width:120, sort:true,templet: function(data){
                                var val = data.shenheStatus;
                                if(val=='已审核'){
                                    return '<span style="color: blue;font-weight: bold;">'+val+'</span>';
                                }
                                return '<span style="color: red;font-weight: bold;">'+val+'</span>';
                            }
                        }
                        ,{field: 'createDate', title: '创建时间', width:150, sort:true}
                        ,{fixed: 'right', width:180, align:'center', toolbar: '#other_bar'} //这里的toolbar值是模板元素的选择器
                    ]]
                    ,done: function(res, curr, count){
                        $('#other').find('span').html(res.unShenHeNum); //提示未审核数

                        //监听行双击事件
                        table.on('rowDouble(other_table)', function(obj){
                            detail_dataInfo(obj.data,false,true); //标识是从审核列表进入详情页面
                        });
                    }
                });

                //监听搜索框事件
                let active = {
                    search: function(){
                        other_table.reload({
                            where: {
                                'name': $(".other_search input[name='name']").val()
                                // ,'type': $(".other_search select[name='type']").val()
                                ,'level1': $(".other_search select[name='level1']").val()
                                ,'level2': $(".other_search select[name='level2']").val()
                                ,'zsGrantDateStart': $(".other_search input[name='zsGrantDateStart']").val()
                                ,'zsGrantDateEnd': $(".other_search input[name='zsGrantDateEnd']").val()
                                ,'shenheStatus': $("#shenheStatus").val()
                            }
                            ,page: {
                                curr: 1 //重新从第 1 页开始
                            }
                        });
                    }
                    ,reset: function () {
                        $(".other_search input").val("");
                        //清除选中状态
                        // $(".other_search select[name='type']").val("");
                        $(".other_search select[name='level1']").val("");
                        $(".other_search select[name='level2']").val("");
                        $("#shenheStatus").val("");
                        form.render("select");
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
                                let isSubmit = false;
                                $.each(data,function(index,item){
                                    if(item.shenheStatus== '已审核'){
                                        isSubmit = true;
                                        return false;//跳出循环
                                    }
                                });
                                if(isSubmit){
                                    layer.msg('您选择了已审核的信息', {time : 3000, offset: '100px'});
                                    return;
                                } else {
                                    toShenHe(data); //添加审核意见
                                }
                            }
                            break;
                    }
                });

                //监听工具条
                table.on('tool(other_table)', function(obj){
                    let layEvent = obj.event
                        ,rowData = obj.data;
                    if (layEvent === 'detail_dataInfo') {
                        detail_dataInfo(rowData,false,true); //标识是从审核列表进入详情页面
                    } else if (layEvent === 'detail_shenheProcess') {
                        detail_shenheProcess('双创教育-文、体类比赛-查看审核流程',rowData);
                    }
                });

                /*//监听Tab切换
                element.on('tab(layTab)', function(data){
                    if(data.index == 1){ //
                        other_table.reload(); //重新加载表格数据
                    }
                });*/
            } else{
                $('#other').remove();
                $('#other_item').remove();
            }

            //初始化表单
            var initEditForm = function (data) {

                //其他指导教师数据表格
                let teacher_datatable = table.render({
                    id: "teacher_datatable"
                    ,elem : '#teacher_datatable'
                    ,width: 750
                    // ,height : 200
                    ,url: requestUrl+'/common/getTeacherInfo.do'
                    ,where: {
                        "relationCode":data.code
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
                    ,toolbar: '#teacher_datatable_toolbar' //指向自定义工具栏模板选择器
                    ,defaultToolbar:[]
                    ,cols : [[ //表头
                        {type:'numbers', title:'序号', width:80, fixed: 'left'}
                        ,{field: 'teacherCode', title: '工号', width:120, align:'center'}
                        ,{field: 'teacherName', title: '姓名', width:120, align:'center'}
                        ,{field: 'teacherUnit', title: '单位', align:'center'}
                        ,{fixed: 'right', title: '操作', width:120, align:'center', toolbar: '#teacher_datatable_bar'}
                    ]]
                    ,even: true //隔行背景
                    ,done : function(res, curr, count) {

                        //监听头工具栏事件
                        table.on('toolbar(teacher_datatable)', function(obj){

                            //
                            layer.open({
                                title : '其他指导教师信息'
                                ,type : 1
                                ,area : [ '900px', '300px' ]
                                ,offset : '100px'
                                // ,btn : ['关闭']
                                ,content : $('#teacher_container')
                                ,success: function(layero, index){

                                    //监听表单提交
                                    form.on('submit(toSubmitTeacherForm)', function(form_data){
                                        $.post(requestUrl+'/common/addTeacherInfo.do',{
                                            "relationCode":data.code,
                                            "teacherCode":form_data.field.teacherCode,
                                            "teacherName":form_data.field.teacherName,
                                            "teacherUnit":form_data.field.teacherUnit
                                        },function (result_data) {
                                            layer.msg(result_data.msg, { offset: '100px'},function () {
                                                if(result_data.code == 200){
                                                    teacher_datatable.reload();//重新加载数据
                                                }
                                                layer.close(index);
                                            });
                                        },'json');
                                        return false;
                                    });
                                },end:function () {
                                    $("#teacher_form input").val("");
                                }
                            });
                        });

                        //监听右侧工具条
                        table.on('tool(teacher_datatable)', function(obj){
                            if (obj.event === 'delete') {
                                $.post(parent.requestUrl+'/common/delTeacherInfo.do', {
                                    "relationCode": obj.data.relationCode
                                    ,"teacherCode": obj.data.teacherCode
                                },function(result_data){
                                    layer.msg(result_data.msg, { offset: '100px'},function () {
                                        if(result_data.code == 200){
                                            teacher_datatable.reload();//重新加载数据
                                        }
                                        layer.close(index);
                                    });
                                }, "json");
                            }
                        });
                    }
                });

                //参赛学生信息数据表格
                let student_datatable = table.render({
                    id: "student_datatable"
                    ,elem : '#student_datatable'
                    ,width: 750
                    // ,height : 200
                    ,url: requestUrl+'/common/getStudentInfo.do'
                    ,where: {
                        "relationCode":data.code
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
                    ,toolbar: '#student_datatable_toolbar' //指向自定义工具栏模板选择器
                    ,defaultToolbar:[]
                    ,cols : [[ //表头
                        {type:'numbers', title:'序号', width:80, fixed: 'left'}
                        ,{field: 'studentCode', title: '学号', width:120, align:'center'}
                        ,{field: 'studentName', title: '姓名', width:120, align:'center'}
                        ,{field: 'college', title: '学院', width:150, align:'center'}
                        ,{field: 'major', title: '专业', width:150, align:'center'}
                        ,{field: 'sorted', title: '排名', width:120, align:'center'}
                        ,{fixed: 'right', title: '操作', width:120, align:'center', toolbar: '#student_datatable_bar'}
                    ]]
                    ,even: true //隔行背景
                    ,done : function(res, curr, count) {

                        //监听头工具栏事件
                        table.on('toolbar(student_datatable)', function(obj){

                            //
                            layer.open({
                                title : '参赛学生信息'
                                ,type : 1
                                ,area : [ '900px', '300px' ]
                                ,offset : '100px'
                                // ,btn : ['关闭']
                                ,content : $('#stu_container')
                                ,success: function(layero, index){

                                    //
                                    $.get(requestUrl+'/getXyList.do',function(result_data){
                                        if(result_data.code == 200){
                                            // alert(JSON.stringify(result_data.data));
                                            // 加载下拉选项
                                            $("select[name='college']").empty(); //移除下拉选项
                                            let html = '<option value="">请选择</option>';
                                            for (let i = 0; i < result_data.data.length; i++) {
                                                html += '<option value="' + result_data.data[i].code + '" >' + result_data.data[i].name + '</option>';
                                            }
                                            $("select[name='college']").append(html);
                                            form.render('select');
                                        }
                                    },'json');
                                    // 监听学院下拉选项
                                    form.on('select(college)', function(data) {
                                        $.get(requestUrl+'/getZyList.do',{
                                            'xyCode': data.value
                                        },function(result_data){
                                            if(result_data.code == 200){
                                                // 加载下拉选项
                                                $("select[name='major']").empty(); //移除下拉选项
                                                let html = '<option value="">请选择</option>';
                                                for (let i = 0; i < result_data.data.length; i++) {
                                                    html += '<option value="' + result_data.data[i].code + '" >' + result_data.data[i].name + '</option>';
                                                }
                                                $("select[name='major']").append(html);
                                                form.render('select');
                                            }
                                        },'json');
                                    });

                                    //监听表单提交
                                    form.on('submit(toSubmitStuForm)', function(form_data){
                                        $.post(requestUrl+'/common/addStudentInfo.do',{
                                            "relationCode":data.code,
                                            "studentCode":form_data.field.studentCode,
                                            "studentName":form_data.field.studentName,
                                            "college":form_data.field.college,
                                            "major":form_data.field.major,
                                            'sorted':form_data.field.sorted
                                        },function (result_data) {
                                            layer.msg(result_data.msg, { offset: '100px'},function () {
                                                if(result_data.code == 200){
                                                    student_datatable.reload();//重新加载数据
                                                }
                                                layer.close(index);
                                            });
                                        },'json');
                                        return false;
                                    });
                                },end:function () {
                                    $("#stuForm input").val("");
                                    //清除选中状态
                                    $("#college").val("");
                                    $("#major").val("");
                                    form.render("select");
                                }
                            });
                        });

                        //监听右侧工具条
                        table.on('tool(student_datatable)', function(obj){
                            if (obj.event === 'delete') {
                                $.post(parent.requestUrl+'/common/delStudentInfo.do', {
                                    "relationCode": obj.data.relationCode
                                    ,"studentCode": obj.data.studentCode
                                },function(result_data){
                                    layer.msg(result_data.msg, { offset: '100px'},function () {
                                        if(result_data.code == 200){
                                            student_datatable.reload();//重新加载数据
                                        }
                                        layer.close(index);
                                    });
                                }, "json");
                            }
                        });
                    }
                });

                //初始化laydate实例
                laydate.render({
                    elem: "#zsGrantDate" //指定元素
                    ,trigger: 'click' //解决layDate 时间控件一闪而过问题
                    ,ready: function(date){
                        $('.layui-laydate').css('top','42px');
                    }
                });

                //自定义验证规则
                form.verify({
                    name: function(value){
                        if(value.length > 64){
                            return '当前字符长度'+value.length+'（最大值64）';
                        }
                    }
                });

                //表单赋值
                form.val("editForm",{
                    "code":data.code
                    ,"name" : data.name
                    ,"type" : data.type
                    ,"level1" : data.level1
                    ,"level2" : data.level2
                    ,"zsNum" : data.zsNum
                    ,"zsGrantUnit" : data.zsGrantUnit
                    ,"zsGrantDate" : data.zsGrantDate
                    ,"userId":data.userId
                    ,"userName":data.userName
                    ,"userUnit": data.userUnit != "null" ? data.userUnit : ""
                });
            };

            //查看详情
            var detail_dataInfo = function (data,isSubmit,isShenHe) {
                //
                let options = {
                    title : '双创教育-文、体类比赛-查看详情'
                    ,type : 1
                    ,area : [ '900px', '500px' ]
                    ,offset : '50px'
                    ,shadeClose : true //点击遮罩关闭
                    ,btn : ['关闭']
                    ,content :  $('#dataInfo_container')
                    ,success: function(layero, index){
                        isOpen = true;

                        //第一指导教师信息
                        let htmlStr = '<table class="layui-table">\n' +
                            '            <tbody>\n' +
                            '              <tr>' +
                            '                <td style="width: 80px; text-align: right">工号：</td><td style="width: 120px;">'+data.userId+'</td>' +
                            '                <td style="width: 80px; text-align: right">姓名：</td><td style="width: 120px;">'+data.userName+'</td>' +
                            '              </tr>\n' +
                            '              <tr>' +
                            '                <td style="width: 80px; text-align: right">单位：</td><td colspan="3">'+data.userUnit+'</td>' +
                            '              </tr>\n' +
                            '            </tbody>\n' +
                            '         </table>';
                        $("#teacherInfo").html(htmlStr);

                        //其他指导教师信息
                        $.get(requestUrl+'/common/getTeacherInfo.do',{
                            "relationCode":data.code
                        },function (result_data) {
                            if(result_data.code = 200){
                                if(result_data.data.length > 0){
                                    let html = '';
                                    $.each(result_data.data,function(idx,obj){
                                        html += '<tr><td style="text-align: center;">'+parseInt(idx+1)+'</td>' +
                                            '<td style="text-align: center;">'+result_data.data[idx].teacherCode+'</td>' +
                                            '<td style="text-align: center;">'+result_data.data[idx].teacherName+'</td>' +
                                            '<td style="text-align: center;">'+result_data.data[idx].teacherUnit+'</td></tr>';
                                    });
                                    $("#teacherList").html(html);
                                }
                            }
                        },'json');

                        //参赛学生信息
                        $.get(requestUrl+'/common/getStudentInfo.do',{
                            "relationCode":data.code
                        },function (result_data) {
                            if(result_data.code = 200){
                                if(result_data.data.length > 0){
                                    let html = '';
                                    $.each(result_data.data,function(idx,obj){
                                        html += '<tr><td style="text-align: center;">'+parseInt(idx+1)+'</td>' +
                                            '<td style="text-align: center;">'+result_data.data[idx].studentCode+'</td>' +
                                            '<td style="text-align: center;">'+result_data.data[idx].studentName+'</td>' +
                                            '<td style="text-align: center;">'+result_data.data[idx].college+'</td>' +
                                            '<td style="text-align: center;">'+result_data.data[idx].major+'</td>' +
                                            '<td style="text-align: center;">'+result_data.data[idx].sorted+'</td></tr>';
                                    });
                                    $("#studentList").html(html);
                                }
                            }
                        },'json');

                        //赛事信息
                        htmlStr = '<table class="layui-table">\n' +
                            '           <tbody>\n' +
                            '              <tr>' +
                            '                 <td style="width: 80px; text-align: right">赛事名称：</td><td style="width: 120px;" colspan="3">'+data.name+'</td>' +
                            '              </tr>\n' +
                            '              <tr>' +
                            '                 <td style="width: 80px; text-align: right">赛事类型：</td><td style="width: 120px;" colspan="3">'+data.type+'</td>' +
                            '              </tr>\n' +
                            '              <tr>' +
                            '                <td style="width: 80px; text-align: right">获奖级别：</td><td style="width: 120px;">'+data.level1+'</td>' +
                            '                <td style="width: 80px; text-align: right">获得奖项：</td><td style="width: 120px;">'+data.level2+'</td>' +
                            '              </tr>\n' +
                            '              <tr>' +
                            '                <td style="width: 80px; text-align: right">证书编号：</td><td style="width: 120px;">'+data.zsNum+'</td>' +
                            '                <td style="width: 80px; text-align: right">证书授予时间：</td><td style="width: 120px;">'+data.zsGrantDate+'</td>' +
                            '              </tr>\n' +
                            '              <tr>' +
                            '                 <td style="width: 80px; text-align: right">证书授予单位：</td><td style="width: 120px;" colspan="3">'+data.zsGrantUnit+'</td>' +
                            '              </tr>\n' +
                            '              <tr>' +
                            '                 <td style="width: 80px; text-align: right">数据录入时间：</td><td style="width: 120px;" colspan="3">'+data.createDate+'</td>' +
                            '              </tr>\n' +
                            '            </tbody>\n' +
                            '         </table>';
                        $("#baseInfo").html(htmlStr);

                        //附件列表
                        let fileList = $("#fileList");
                        $.get(requestUrl+"/getFileListByRelationCode.do" , {
                            "relationCode": function () {
                                return data.code;
                            }
                        } ,  function(result_data){
                            if(result_data.data.length ===0){
                                let tr = '<tr><td colspan="3" style="text-align: center;">无数据</td></tr>';
                                fileList.append(tr);
                            } else {
                                $.each(result_data.data,function(index,fileInfo){
                                    let tr = $(['<tr id="'+ fileInfo.code +'">'
                                        ,'<td style="text-align: center;">	<a href="javascript:void(0)">'+ fileInfo.fileName +'</a></td>'
                                        ,'<td style="text-align: center;">'+ fileInfo.createDate +'</td>'
                                        ,'<td style="text-align: center;">' +
                                        '   <button class="layui-btn layui-btn-xs layui-btn-normal upfile_preview">预览</button>' +
                                        '   <button class="layui-btn layui-btn-xs layui-btn-primary upfile_download">下载</button>' +
                                        '</td>'
                                        ,'</tr>'].join(''));
                                    //预览
                                    tr.find('a').on('click', function(){
                                        previewFileInfo(fileInfo);
                                    });
                                    tr.find('.upfile_preview').on('click', function(){
                                        previewFileInfo(fileInfo);
                                    });
                                    //下载
                                    tr.find('.upfile_download').on('click', function(){
                                        let downloadForm = $("<form action='"+requestUrl+"/downloadFileInfo.do' method='post'></form>");
                                        downloadForm.append("<input type='hidden' name='fileName' value='"+fileInfo.fileName+"'/>");
                                        downloadForm.append("<input type='hidden' name='filePath' value='"+fileInfo.filePath+"'/>");
                                        $(document.body).append(downloadForm);
                                        // alert(downloadForm.serialize());
                                        downloadForm.submit();
                                        downloadForm.remove();
                                    });
                                    fileList.append(tr);
                                });
                            }
                        }, "json");
                    }
                    ,end:function () {
                        $("#fileList").empty();
                    }
                };
                if(isSubmit && data.isSubmit == '未提交'){
                    options.btn = ['提交','关闭'];
                    options.yes = function(index, layero){
                        toSubmit(new Array(data));
                    };
                    options.btn2 = function(index, layero){
                        layer.close(index); //如果设定了yes回调，需进行手工关闭
                    };
                }
                if(isShenHe && data.shenheStatus == '未审核'){
                    options.btn = ['审核','关闭'];
                    options.yes = function(index, layero){
                        toShenHe(new Array(data));
                    };
                    options.btn2 = function(index, layero){
                        layer.close(index); //如果设定了yes回调，需进行手工关闭
                    };
                }
                layer.open(options); //返回一个当前层索引
            };

            //提交
            var toSubmit = function (row_datas){
                // alert($.cookie('currentMenuId'));
                layer.confirm('信息提交后不可进行编辑、删除操作，是否继续提交？', {icon: 3, title:'提示', offset: '100px'}, function(index) {
                    $.post(requestUrl+'/toSubimt.do',{
                        "menuId":currentMenuId,
                        "jsonString":JSON.stringify(row_datas)
                    },function (result_data) {
                        layer.msg(result_data.msg, {time : 3000, offset: '100px'},function () {
                            if(result_data.code === 200){
                                myself_table.reload();//重新加载表格数据
                            }
                            layer.closeAll();
                        });
                    },'json');
                });
            };

            //审核
            var toShenHe = function (row_datas) {
                layer.open({
                    title : '教学研究-文、体类比赛-审核'
                    ,type : 1
                    ,area : [ '700px', '350px' ]
                    ,offset : '100px'
                    ,shadeClose : true //点击遮罩关闭
                    // ,btn : ['关闭']
                    ,content : $('#shenHeForm_container')
                    ,success: function(layero, index){
                        //
                        form.on('select(status)', function(data) {
                            if(data.value == '通过'){
                                $('#opinion').html('通过');
                            }else{
                                $('#opinion').empty();
                            }
                        });
                        //
                        form.on('submit(toSubmitShenHeForm)', function(formData){
                            $.post(requestUrl+'/toShenhe.do',{
                                'viewName':'V_SCJY_WTBS_SHENHE'
                                ,'jsonString':JSON.stringify(row_datas)
                                ,"status":formData.field.status
                                ,"opinion":formData.field.opinion
                                ,"userId":function () {
                                    return $.cookie('userId');
                                }
                                ,"userName":function () {
                                    return $.cookie('userName');
                                }
                            },function (result_data) {
                                layer.msg(result_data.msg, { offset: '100px'},function () {
                                    if(result_data.code === 200){
                                        other_table.reload();//重新加载表格数据
                                    }
                                    layer.closeAll();
                                });
                            },'json');
                        });
                    }
                });
            };
        }
        ,error:function() {
            layer.msg('网络连接失败', {icon:7, time : 3000, offset: '100px'});
        }
    });
});
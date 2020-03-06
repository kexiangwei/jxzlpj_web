/*
教学设计-授课计划
 */
layui.use(['layer','element','table','form'], function(){
    var $ = layui.$,layer = layui.layer,element = layui.element,table = layui.table,form = layui.form;

    $.ajax({
        type: "get",
        url: requestUrl+'/getAuthority.do',
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

            if(data.isSubmit > 0){
                //初始化数据表格
                var myself_table = table.render({
                    id : guid()
                    ,elem : '#myself_table'
                    ,height : 440
                    ,url: requestUrl+'/skjh/getPageList.do'
                    ,where:{
                        "userId":function () {
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
                            "data": res.data.pageList
                        };
                    }
                    ,page: {
                        layout: ['count', 'prev', 'page', 'next', 'limit', 'refresh', 'skip']
                        ,limits: [10,20,50,100]
                        ,first: '首页'
                        ,last: '尾页'
                    }
                    ,limit: 10
                    ,even: true //隔行背景
                    ,toolbar: '#myself_toolbar' //指向自定义工具栏模板选择器
                    ,cols : [[ //表头
                        {type:'checkbox', fixed: 'left'}
                        ,{type:'numbers', title:'序号', width:80, fixed: 'left'}
                        ,{field:'stuYear', title:'学年', width:120, hide:true}
                        ,{field:'stuTerm', title:'学期', width:120, hide:true}
                        ,{field:'college', title:'学院', width:120, hide:true}
                        ,{field:'major', title:'专业', width:120, hide:true}
                        ,{field: 'courseCode', title: '课程编号', width:120}
                        ,{field: 'courseName', title: '课程名称', width:120}
                        ,{field: 'teachClass', title: '授课班级', width:120}
                        ,{field: 'stuNum', title: '学生人数', width:120}
                        ,{field: 'totalHours', title: '总学时', width:120}
                        ,{field: 'theoryHours', title: '理论学时', width:120}
                        ,{field: 'testHours', title: '实验学时', width:120}
                        ,{field: 'days', title: '实习天数', width:120}
                        ,{field: 'isSubmit', title: '提交状态', width:120,templet: function(data){
                                let html='';
                                if(data.isSubmit=='已提交'){
                                    html = ' <a class="layui-btn layui-btn-primary layui-btn-xs" lay-event="detail_dataInfo">查看信息</a>\n' +
                                        ' <a class="layui-btn layui-btn-normal layui-btn-xs" lay-event="detail_shenheProcess">查看流程</a>\n' +
                                        ' <a class="layui-btn layui-btn-disabled layui-btn-xs" lay-event="update">编辑</a>' +
                                        ' <a class="layui-btn layui-btn-disabled layui-btn-xs" lay-event="delete">删除</a>';
                                    $('#myself_bar').html(html);
                                    return '<span style="color: blue;font-weight: bold;">'+data.isSubmit+'</span>';
                                }else{
                                    if(data.isSubmit=='未提交' && data.status ==='退回'){
                                        html =' <a class="layui-btn layui-btn-primary layui-btn-xs" lay-event="detail_dataInfo">查看信息</a>\n' +
                                            ' <a class="layui-btn layui-btn-normal layui-btn-xs" lay-event="detail_shenheProcess">查看流程</a>\n' +
                                            ' <a class="layui-btn layui-btn-warm layui-btn-xs" lay-event="update">编辑</a>\n' +
                                            ' <a class="layui-btn layui-btn-danger layui-btn-xs" lay-event="delete">删除</a>';
                                        $('#myself_bar').html(html);
                                        return '<span style="font-weight: bold;">'+data.isSubmit+'</span>';
                                    }
                                }
                                html =
                                    ' <a class="layui-btn layui-btn-primary layui-btn-xs" lay-event="detail_dataInfo">查看信息</a>\n' +
                                    ' <a class="layui-btn layui-btn-disabled layui-btn-xs" lay-event="detail_shenheProcess">查看流程</a>\n' +
                                    ' <a class="layui-btn layui-btn-warm layui-btn-xs" lay-event="update">编辑</a>\n' +
                                    ' <a class="layui-btn layui-btn-danger layui-btn-xs" lay-event="delete">删除</a>';
                                $('#myself_bar').html(html);
                                return '<span style="font-weight: bold;">'+data.isSubmit+'</span>';
                            }
                        }
                        ,{field: 'status', title: '审核状态', width:120,templet: function(data){
                                if(data.status != null){
                                    if(data.status==='退回'){
                                        return '<span style="color: red;font-weight: bold;">'+data.status+'</span>';
                                    }
                                    return '<span style="color: blue;font-weight: bold;">'+data.status+'</span>';
                                }
                                return '<span style="font-weight: bold;">待审核</span>';
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
                                        'courseCode': $(".myself_search input[name='courseCode']").val()
                                        ,'courseName': $(".myself_search input[ name='courseName']").val()
                                        ,'isSubmit': $(".myself_search input[ name='isSubmit']").val()
                                        ,'status': $(".myself_search input[ name='status']").val()
                                    }
                                    ,page: {
                                        curr: 1 //重新从第 1 页开始
                                    }
                                });
                            }
                            ,reset: function () {
                                $(".myself_search input").val('');
                                //清除选中状态
                                $("#isSubmit").val("");
                                $("#status").val("");
                                form.render("select");
                            }
                        };

                        //监听头工具栏事件
                        table.on('toolbar(myself_table)', function(obj){
                            let rowDatas = table.checkStatus(obj.config.id).data; //获取选中的数据

                            switch(obj.event){
                                case 'insert':
                                    //
                                    var objCode = new Date().getTime(); //初始化业务数据编号
                                    //
                                    layer.open({
                                        id : guid()
                                        ,title : '教学设计-授课计划-新增'
                                        ,type : 1
                                        ,area : [ '1100px', '500px' ]
                                        ,offset : '50px'
                                        ,content : $('#editForm_container')
                                        ,success: function(layero, index){

                                            //初始化表单
                                            initEditForm({
                                                'code': objCode
                                                ,'userId':$.cookie('userId')
                                                ,'userName':$.cookie('userName')
                                            });

                                            //监听表单提交
                                            form.on('submit(toSubmitEidtForm)', function(data){
                                                $.post(requestUrl+'/skjh/insert.do', data.field, function (resultData) {
                                                    if(resultData.code === 200){
                                                        myself_table.reload();//重新加载表格数据
                                                    }
                                                    layer.msg(resultData.msg, {offset: '100px'},function () {
                                                        layer.close(index);
                                                    });
                                                },'json');
                                            });
                                        }
                                        ,cancel: function(index, layero){
                                            layer.confirm('表单未提交，填写的信息将会清空？', {icon: 3, title:'提示', offset: '100px'}, function(index) {
                                                layer.closeAll();
                                            });
                                            return false;
                                        }
                                        ,end:function () {

                                        }
                                    });
                                    break;
                                case 'submit':
                                    if(rowDatas.length === 0){
                                        layer.msg('请选择需要提交的信息', {time : 3000, offset: '100px'});
                                    } else {
                                        //
                                        let isSubmit = false;
                                        $.each(rowDatas,function(idx,obj){
                                            if(obj.isSubmit== '已提交'){
                                                isSubmit = true;
                                                return false;//跳出循环
                                            }
                                        });
                                        if(isSubmit){
                                            layer.msg('您选择了已提交的信息！', {time : 3000, offset: '100px'});
                                            return;
                                        } else {
                                            toSubmit(rowDatas);
                                        }
                                    }
                                    break;
                            }
                        });

                        //监听工具条
                        table.on('tool(myself_table)', function(obj){
                            let rowData = obj.data;
                            if (obj.event === 'detail_dataInfo') {
                                detail_dataInfo(rowData,true);
                            } else if (obj.event === 'detail_shenheProcess') {
                                if(rowData.isSubmit=='未提交' && row_data.status !='退回'){
                                    return;
                                }
                                detail_shenheProcess('教学设计-授课计划-查看审核流程',rowData);
                            } else if (obj.event === 'update') {
                                if(rowData.isSubmit== '已提交'){
                                    layer.confirm('已提交的数据不可修改，如需修改需提交申请？', {icon: 3, title:'提示', offset: '100px'}, function(index) {
                                        $.post(requestUrl+'/skjh/toUpdate.do', {
                                            code: rowData.code //待修改的数据编号
                                            ,desc: '' //修改说明
                                        },function(resultData){
                                            layer.msg('提交成功', {offset: '100px'},function () {
                                                layer.close(index);
                                            });
                                        }, "json");
                                    });
                                    return;
                                }

                                //执行编辑
                                layer.open({
                                    id : guid()
                                    ,title : '教学设计-授课计划-编辑'
                                    ,type : 1
                                    ,area : [ '1100px', '500px' ] // ,area : '500px'//只想定义宽度时，你可以area: '500px'，高度仍然是自适应的
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
                                        initEditForm(rowData);
                                        //监听表单提交
                                        form.on('submit(toSubmitEidtForm)', function(formData){
                                            $.post(requestUrl+'/skjh/update.do', formData.field, function (resultData) {
                                                if(resultData.code === 200){
                                                    myself_table.reload();//重新加载表格数据
                                                }
                                                layer.msg(resultData.msg, {offset: '100px'},function () {
                                                    layer.close(index);
                                                });
                                            },'json');
                                        });
                                    },end:function () {
                                        location.reload();
                                    }
                                });
                            } else if (obj.event === 'delete') {
                                if(rowData.isSubmit== '已提交'){
                                    return;
                                }
                                layer.confirm('删除后不可恢复，真的要删除么？', {icon: 3, title:'提示', offset: '100px'}, function(index) {
                                    $.post(requestUrl+'/skjh/delete.do', { code: rowData.code},function(resultData){
                                        if(resultData.code === 200){
                                            myself_table.reload();//重新加载表格数据
                                        }
                                        layer.msg(resultData.msg, {offset: '100px'},function () {
                                            layer.close(index);
                                        });
                                    }, "json");
                                });
                            }
                        });
                    }
                });
            } else{
                $('#myself').remove();
                $('#myself_item').remove();
                $('#other').removeClass().addClass("layui-this");
                $('#other_item').removeClass().addClass("layui-tab-item layui-show");
            }

            if(data.isShenhe > 0){ //拥有审核权限

                //监听Tab切换
                element.on('tab(layuiTab)', function(data){
                    if(data.index == 1){ //
                        other_table.reload(); //重新加载表格数据
                    }
                });

                //数据表格
                var other_table = table.render({
                    id : guid()
                    ,elem : '#other_table'
                    ,height : 440
                    ,url: requestUrl+'/skjh/getPageList.do'
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
                            "unShenHeNum": res.data.unShenHeNum //未审核数
                        };
                    }
                    ,page: {
                        layout: ['count', 'prev', 'page', 'next', 'limit', 'refresh', 'skip']
                        ,limits: [10,20,50,100]
                        ,first: '首页'
                        ,last: '尾页'
                    }
                    ,limit: 10
                    ,even: true
                    ,toolbar: '#other_toolbar'
                    ,cols : [[ //表头
                        {type:'checkbox', fixed: 'left'}
                        ,{type:'numbers', title:'序号', width:80, fixed: 'left'}
                        ,{field:'stuYear', title:'学年', width:120, hide:true}
                        ,{field:'stuTerm', title:'学期', width:120, hide:true}
                        ,{field:'college', title:'学院', width:120, hide:true}
                        ,{field:'major', title:'专业', width:120, hide:true}
                        ,{field: 'courseCode', title: '课程编号', width:120}
                        ,{field: 'courseName', title: '课程名称', width:120}
                        ,{field: 'teachClass', title: '授课班级', width:120}
                        ,{field: 'stuNum', title: '学生人数', width:120}
                        ,{field: 'totalHours', title: '总学时', width:120}
                        ,{field: 'theoryHours', title: '理论学时', width:120}
                        ,{field: 'testHours', title: '实验学时', width:120}
                        ,{field: 'days', title: '实习天数', width:120}
                        ,{field: 'shenheStatus', title: '审核状态', width:120,templet: function(data){ // 函数返回一个参数 data，包含接口返回的所有字段和数据
                                var val = data.shenheStatus;
                                if(val=='已审核'){
                                    return '<span style="color: blue;font-weight: bold;">'+val+'</span>';
                                }
                                return '<span style="color: red;font-weight: bold;">'+val+'</span>';
                            }
                        }
                        ,{fixed: 'right', width:166, align:'center', toolbar: '#other_bar'}
                    ]]
                    ,done: function(res, curr, count){
                        $('#other').find('span').html(res.unShenHeNum); //设置未审核数

                        //监听搜索框事件
                        $('.other_search .layui-btn').on('click', function(){
                            let type = $(this).data('type');
                            active[type] ? active[type].call(this) : '';
                        });
                        let active = {
                            search: function(){
                                other_table.reload({
                                    where: {
                                        'userId': $(".other_search input[ name='userId' ] ").val()
                                        ,'userName': $(".other_search input[ name='userName' ] ").val()
                                        ,'courseCode': $(".other_search input[ name='courseCode' ] ").val()
                                        ,'courseName': $(".other_search input[ name='courseName' ] ").val()
                                        ,'shenheStatus': $(".other_search input[ name='shenheStatus' ] ").val()
                                    }
                                    ,page: {
                                        curr: 1 //重新从第 1 页开始
                                    }
                                });
                            }
                            ,reset: function () {
                                $(".other_search input").val("");
                                //清除选中状态
                                $("#shenheStatus").val("");
                                form.render("select");
                            }
                        };

                        //监听头工具栏事件
                        table.on('toolbar(other_table)', function(obj){
                            let rowDatas = table.checkStatus(obj.config.id).data; //获取选中的数据
                            switch(obj.event){
                                case 'submit':
                                    if(rowDatas.length === 0){
                                        layer.msg('请选择需要审核的数据', {time : 3000, offset: '100px'});
                                        return;
                                    } else {
                                        let isSubmit = false;
                                        $.each(rowDatas,function(idx,obj){
                                            if(obj.shenheStatus!= '未审核'){
                                                isSubmit = true;
                                                return false;//跳出循环
                                            }
                                        });
                                        if(isSubmit){
                                            layer.msg('您选择了已审核的信息！', {time : 3000, offset: '100px'});
                                            return;
                                        } else {
                                            toShenHe(rowDatas); //添加审核意见
                                        }
                                    }
                                    break;
                            }
                        });

                        //监听工具条
                        table.on('tool(other_table)', function(obj){
                            let layEvt = obj.event
                                ,rowData = obj.data;
                            if (layEvt === 'detail_dataInfo') {
                                detail_dataInfo(rowData,false,true);
                            } else if (layEvt === 'detail_shenheProcess') {
                                detail_shenheProcess('教学设计-授课计划-查看审核流程',rowData);
                            }
                        });
                    }
                });
            } else{
                $('#other').remove();
                $('#other_item').remove();
            }

            //初始化表单
            var initEditForm = function (data) {
                //
                $.get(requestUrl+'/getCollege.do',function(result_data){
                    if(result_data.code == 200){
                        // alert(JSON.stringify(result_data.data));
                        // 加载下拉选项
                        $("select[name='college']").empty(); //移除下拉选项
                        let html = '<option value="">请选择</option>';
                        for (let i = 0; i < result_data.data.length; i++) {
                            if(data.college == result_data.data[i].CODE ){
                                html += '<option value="' + result_data.data[i].CODE + '" selected="">' + result_data.data[i].NAME + '</option>';
                            }else{
                                html += '<option value="' + result_data.data[i].CODE + '" >' + result_data.data[i].NAME + '</option>';
                            }
                        }
                        $("select[name='college']").append(html);
                        form.render('select');
                    }
                },'json');
                // 监听学院下拉选项
                form.on('select(college)', function(data) {
                    $.get(requestUrl+'/getMajor.do',{
                        'collegeCode': data.value
                    },function(result_data){
                        if(result_data.code == 200){
                            // 加载下拉选项
                            $("select[name='major']").empty(); //移除下拉选项
                            let html = '<option value="">请选择</option>';
                            for (let i = 0; i < result_data.data.length; i++) {
                                html += '<option value="' + result_data.data[i].CODE + '" >' + result_data.data[i].NAME + '</option>';
                            }
                            $("select[name='major']").append(html);
                            form.render('select');
                        }
                    },'json');
                });
                //
                $.get(requestUrl+'/getMajor.do',{
                    'collegeCode': data.college !== undefined?data.college:null
                },function(result_data){
                    if(result_data.code == 200){
                        // 加载下拉选项
                        $("select[name='major']").empty(); //移除下拉选项
                        let html = '<option value="">请选择</option>';
                        for (let i = 0; i < result_data.data.length; i++) {
                            if(data.major == result_data.data[i].CODE ){
                                html += '<option value="' + result_data.data[i].CODE + '" selected="">' + result_data.data[i].NAME + '</option>';
                            }else{
                                html += '<option value="' + result_data.data[i].CODE + '" >' + result_data.data[i].NAME + '</option>';
                            }
                        }
                        $("select[name='major']").append(html);
                        form.render('select');
                    }
                },'json');

                //数据表格
                let tableIns = table.render({
                    id: guid()
                    ,elem : '#datatable'
                    ,width: $('#editForm_container').width()
                    // ,height : 默认不填写,高度随数据列表而适应，表格容器不会出现纵向滚动条
                    ,url: requestUrl+'/xkzybs/getStuInfo.do'
                    ,where: {
                        "relationCode":'1582989725273'
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
                    ,totalRow: true //开启合计行
                    ,even: true //隔行背景
                    ,toolbar: '#datatable_toolbar' //指向自定义工具栏模板选择器
                    ,defaultToolbar:[]
                    ,cols : [[ //表头
                        {type:'numbers', title:'序号', width:80, align:'center', rowspan:2, totalRowText: '学时总计：', fixed: 'left'}
                        ,{field: 'stuCode', title: '周次', width:120, align:'center', rowspan:2}
                        ,{field: 'stuCode', title: '日期', width:120, align:'center', rowspan:2}
                        ,{field: 'stuCode', title: '星期', width:120, align:'center', rowspan:2}
                        ,{field: 'stuCode', title: '节次', width:120, align:'center', rowspan:2}
                        ,{field: 'stuCode', title: '上课地点', width:150, align:'center', rowspan:2}
                        ,{field: 'stuCode', title: '学时', width:120, align:'center', rowspan:2, sort:true, totalRow:true}
                        ,{title: '课程设计', align:'center',colspan:4}
                        ,{field: 'stuCode', title: '任课老师', width:120, align:'center',rowspan:2}
                        ,{fixed: 'right', title: '操作', width:120, align:'center',rowspan:2, toolbar: '#datatable_bar'}
                    ],[ //表头
                        {field: 'stuCode', title: '内容', width:150, align:'center'}
                        ,{field: 'stuCode', title: '授课类型', width:120, align:'center'}
                        ,{field: 'stuCode', title: '教学方式', width:120, align:'center'}
                        ,{field: 'stuCode', title: '考核方式', width:120, align:'center'}
                    ]]
                    ,done : function(res, curr, count) {

                        //监听头工具栏事件
                        table.on('toolbar(datatable)', function(obj){
                            //
                            layer.open({
                                title : '参赛学生信息'
                                ,type : 1
                                ,area : [ '900px', '350px' ]
                                ,offset : '50px'
                                ,btn : ['关闭']
                                ,content : $('#stu_container')
                                ,success: function(layero, index){

                                    //
                                    $.get(requestUrl+'/getCollege.do',function(result_data){
                                        if(result_data.code == 200){
                                            // alert(JSON.stringify(result_data.data));
                                            // 加载下拉选项
                                            $("select[name='college']").empty(); //移除下拉选项
                                            let html = '<option value="">请选择</option>';
                                            for (let i = 0; i < result_data.data.length; i++) {
                                                html += '<option value="' + result_data.data[i].CODE + '" >' + result_data.data[i].NAME + '</option>';
                                            }
                                            $("select[name='college']").append(html);
                                            form.render('select');
                                        }
                                    },'json');
                                    // 监听学院下拉选项
                                    form.on('select(college)', function(data) {
                                        $.get(requestUrl+'/getMajor.do',{
                                            'collegeCode': data.value
                                        },function(result_data){
                                            if(result_data.code == 200){
                                                // 加载下拉选项
                                                $("select[name='major']").empty(); //移除下拉选项
                                                let html = '<option value="">请选择</option>';
                                                for (let i = 0; i < result_data.data.length; i++) {
                                                    html += '<option value="' + result_data.data[i].CODE + '" >' + result_data.data[i].NAME + '</option>';
                                                }
                                                $("select[name='major']").append(html);
                                                form.render('select');
                                            }
                                        },'json');
                                    });

                                    //监听表单提交
                                    form.on('submit(toSubmitStuForm)', function(form_data){
                                        $.post(requestUrl+'/xkzybs/addStuInfo.do',{
                                            "relationCode":data.code,
                                            "stuCode":form_data.field.stuCode,
                                            "stuName":form_data.field.stuName,
                                            "college":form_data.field.college,
                                            "major":form_data.field.major
                                        },function (result_data) {
                                            if(result_data.code == 200){
                                                tableIns.reload();//重新加载数据
                                            }
                                            layer.msg(result_data.msg, { offset: '100px'},function () {
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
                        table.on('tool(datatable)', function(obj){
                            if (obj.event === 'delete') {
                                $.post(parent.requestUrl+'/xkzybs/delStuInfo.do', {
                                    "relationCode": obj.data.relationCode
                                    ,"stuCode": obj.data.stuCode
                                },function(result_data){
                                    if(result_data.code === 200){
                                        tableIns.reload();//重新加载表格数据
                                    }
                                    layer.msg(result_data.msg, { offset: '100px'});
                                }, "json");
                            }
                        });
                    }
                });

                //表单验证
                form.verify({
                    theoryHours: function(value){
                        if(value > 128){
                            return '当前字符长度'+value.length+'（最大值64）';
                        }
                    }
                    ,testHours: function(value){
                        if(value > 128){
                            return '当前字符长度'+value.length+'（最大值64）';
                        }
                    }
                    ,totalHours: function(value){
                        if(value > 128){
                            return '当前字符长度'+value.length+'（最大值64）';
                        }
                    }
                });

                //初始化表单数据
                form.val("editForm",{
                    "code":data.code
                    ,"stuYear": data.stuYear
                    ,"stuTerm" : data.stuTerm
                    ,"college" : data.college
                    ,"major" : data.major
                    ,"courseCode" : data.courseCode
                    ,"courseName" : data.courseName
                    ,"teachClass" : data.teachClass
                    ,"stuNum" : data.stuNum
                    ,"totalHours" : data.totalHours
                    ,"theoryHours" : data.theoryHours
                    ,"testHours" : data.testHours
                    ,"days" : data.days
                    ,"userId":data.userId
                    ,"userName":data.userName
                });
            };

            /**
             * 查看信息
             * @param rowData 数据行
             * @param isSubmit
             * @param isShenHe
             */
            var detail_dataInfo = function (rowData,isSubmit,isShenHe) {
                let options = {
                    id :guid() //弹层唯一标识,一般用于页面层和iframe层模式,设置该值后，不管是什么类型的层，都只允许同时弹出一个。
                    ,title : '教学设计-授课计划-查看信息'
                    ,type : 1
                    ,area : [ '900px', '500px' ]
                    ,offset : '50px' //只定义top坐标，水平保持居中
                    ,shadeClose : true //点击遮罩关闭
                    ,btn : ['关闭']
                    ,content : '<table class="layui-table">\n' +
                        '        <tbody>\n' +
                        '              <tr>' +
                        '                <td style="width: 80px; text-align: right">学年：</td><td style="width: 120px;">'+rowData.stuYear+'</td>' +
                        '                <td style="width: 80px; text-align: right">学期：</td><td style="width: 120px;">'+rowData.stuTerm+'</td>' +
                        '              </tr>\n' +
                        '              <tr>' +
                        '                <td style="width: 80px; text-align: right">学院：</td><td style="width: 120px;">'+rowData.college+'</td>' +
                        '                <td style="width: 80px; text-align: right">专业：</td><td style="width: 120px;">'+rowData.major+'</td>' +
                        '              </tr>\n' +
                        '              <tr>' +
                        '                <td style="width: 80px; text-align: right">课程编号：</td><td style="width: 120px;">'+rowData.courseCode+'</td>' +
                        '                <td style="width: 80px; text-align: right">课程名称：</td><td style="width: 120px;">'+rowData.courseName+'</td>' +
                        '              </tr>\n' +
                        '              <tr>' +
                        '                <td style="width: 80px; text-align: right">授课班级：</td><td style="width: 120px;">'+rowData.teachClass+'</td>' +
                        '                <td style="width: 80px; text-align: right">学生人数：</td><td style="width: 120px;">'+rowData.stuNum+'</td>' +
                        '              </tr>\n' +
                        '              <tr>' +
                        '                <td style="width: 80px; text-align: right">总学时：</td><td style="width: 120px;">'+rowData.totalHours+'</td>' +
                        '                <td style="width: 80px; text-align: right">理论学时：</td><td style="width: 120px;">'+rowData.theoryHours+'</td>' +
                        '              </tr>\n' +
                        '              <tr>' +
                        '                <td style="width: 80px; text-align: right">实验学时：</td><td style="width: 120px;">'+rowData.testHours+'</td>' +
                        '                <td style="width: 80px; text-align: right">实习天数：</td><td style="width: 120px;">'+rowData.days+'</td>' +
                        '              </tr>\n' +
                        '              <tr>' +
                        '                <td style="width: 80px; text-align: right">教师工号：</td><td style="width: 120px;">'+rowData.userId+'</td>' +
                        '                <td style="width: 80px; text-align: right">教师姓名：</td><td style="width: 120px;">'+rowData.userName+'</td>' +
                        '              </tr>\n' +
                        '              <tr>' +
                        '                <td style="width: 80px; text-align: right">数据录入时间：</td><td style="width: 120px;" colspan="3">'+rowData.createDate+'</td>' +
                        '              </tr>\n' +
                        '        </tbody>\n' +
                        '    </table>'
                    ,success: function(layero, index){}
                    ,end:function () {}
                };
                //
                if(isSubmit && rowData.isSubmit == '未提交'){
                    options.btn = ['提交','关闭'];
                    options.yes = function(index, layero){
                        toSubmit(new Array(rowData));
                    };
                    options.btn2 = function(index, layero){
                        layer.close(index); //如果设定了yes回调，需进行手工关闭
                    };
                }
                //
                if(isShenHe && rowData.shenheStatus == '未审核'){
                    options.btn = ['审核','关闭'];
                    options.yes = function(index, layero){
                        toShenHe(new Array(rowData));
                    };
                    options.btn2 = function(index, layero){
                        layer.close(index); //如果设定了yes回调，需进行手工关闭
                    };
                }
                //
                layer.open(options);
            };

            //提交
            var toSubmit = function (rowDatas){
                layer.confirm('信息提交后不可进行编辑、删除操作，是否继续提交？', {icon: 3, title:'提示', offset: '100px'}, function(index) {
                    $.post(requestUrl+'/skjh/toSubimt.do',{
                        "menuId":$.cookie('currentMenuId'),
                        "jsonStr":JSON.stringify(rowDatas)
                    },function (resultData) {
                        if(resultData.code === 200){
                            myself_table.reload();//重新加载表格数据
                        }
                        layer.msg(resultData.msg, {time : 3000, offset: '100px'},function () {
                            layer.closeAll();
                        });
                    },'json');
                });
            };

            //审核
            var toShenHe = function (rowDatas) {
                layer.open({
                    id: guid()
                    ,title : '教学设计-授课计划-添加审核意见'
                    ,type : 2
                    ,area : [ '700px', '300px' ]
                    ,offset : '100px' //只定义top坐标，水平保持居中
                    ,shadeClose : true //点击遮罩关闭
                    // ,btn: ['关闭']
                    ,content : '../../common/common_shenHe.html'
                    ,success: function(layero, index){
                        //
                        var body = layer.getChildFrame('body', index);
                        var iframeWin = window[layero.find('iframe')[0]['name']];
                        iframeWin.params = {
                            module : 'skjh'
                            ,userId: $.cookie('userId')
                            ,userName: $.cookie('userName')
                            ,rowDatas : rowDatas
                        };
                    }
                    ,end:function () {
                        other_table.reload();//重新加载表格数据
                    }
                });
            };
        }
        ,error:function() {
            layer.msg('网络连接失败', {icon:7, time : 3000, offset: '100px'});
        }
    });
});
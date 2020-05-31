/*
教学设计-课程实施计划
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
                        ,{field: 'courseName', title: '课程名称', width:150, event: 'courseName', templet: function (data) {
                                if(data.isSubmit=='已提交'){
                                    return '<span style="font-weight: bold;">'+data.courseName+'</span>';
                                }
                                return '<span style="font-weight: bold; cursor: pointer;">'+data.courseName+'</span>';
                         }}
                        ,{field: 'courseCode', title: '课程编号', width:150}
                        ,{field: 'courseType', title: '课程性质', width:150}
                        ,{field: 'stuHour', title: '学时', width:120}
                        ,{field: 'stuScore', title: '学分', width:120}
                        ,{field: 'college', title:'开课学院（部）', width:150}
                        ,{field: 'isSubmit', title: '提交状态', width:120, templet: function(data){
                                let html='';
                                if(data.isSubmit=='已提交'){
                                    html = ' <a class="layui-btn layui-btn-primary layui-btn-xs" lay-event="detail_dataInfo">查看信息</a>\n' +
                                        ' <a class="layui-btn layui-btn-normal layui-btn-xs" lay-event="detail_shenheProcess">查看流程</a>';
                                    $('#myself_bar').html(html);
                                    return '<span style="color: blue;font-weight: bold;">'+data.isSubmit+'</span>';
                                }
                                if(data.isSubmit=='未提交' && data.status ==='退回'){
                                    html =' <a class="layui-btn layui-btn-primary layui-btn-xs" lay-event="detail_dataInfo">查看信息</a>\n' +
                                        ' <a class="layui-btn layui-btn-normal layui-btn-xs" lay-event="detail_shenheProcess">查看流程</a>';
                                    $('#myself_bar').html(html);
                                    return '<span style="font-weight: bold;">'+data.isSubmit+'</span>';
                                }
                                html =
                                    ' <a class="layui-btn layui-btn-primary layui-btn-xs" lay-event="detail_dataInfo">查看信息</a>\n' +
                                    ' <a class="layui-btn layui-btn-disabled layui-btn-xs" lay-event="detail_shenheProcess">查看流程</a>';
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
                        ,{fixed: 'right', width:268, align:'center', toolbar: '#myself_bar'}
                    ]]
                    ,done: function(res, curr, count){ //数据渲染完的回调

                        //监听搜索框事件
                        let active = {
                            search: function(){
                                myself_table.reload({
                                    where: {
                                        'courseName': $(".myself_search input[name='courseName']").val()
                                        ,'status': $("#status option:selected").val()
                                    }
                                    ,page: {
                                        curr: 1 //重新从第 1 页开始
                                    }
                                });
                            }
                            ,reset: function () {
                                $(".myself_search input").val('');
                                //清除选中状态
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
                            let rowDatas = table.checkStatus(obj.config.id).data; //获取选中的数据

                            switch(obj.event){
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
                                detail_shenheProcess('教学设计-课程实施计划-查看审核流程',rowData);
                            } else if (obj.event === 'update') {

                                //
                                if(rowData.isSubmit== '已提交'){
                                    return;
                                }

                                //执行编辑
                                let layIndex = layer.open({
                                    id : guid()
                                    ,title : '教学设计-课程实施计划-编辑'
                                    ,type : 1
                                    ,area : [ '900px', '500px' ] // ,area : '500px'//只想定义宽度时，你可以area: '500px'，高度仍然是自适应的
                                    ,offset : '30px'
                                    ,shadeClose : true //点击遮罩关闭
                                    ,btn: ['关闭']
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
                                                layer.msg(resultData.msg, {offset: '100px'},function () {
                                                    if(resultData.code === 200){
                                                        myself_table.reload();//重新加载表格数据
                                                    }
                                                    layer.close(index);
                                                });
                                            },'json');
                                        });
                                    },end:function () {
                                        // window.location.reload();
                                    }
                                });
                            } else if (obj.event === 'delete') {
                                if(rowData.isSubmit== '已提交'){
                                    return;
                                }
                                layer.confirm('删除后不可恢复，真的要删除么？', {icon: 3, title:'提示', offset: '100px'}, function(index) {
                                    $.post(requestUrl+'/skjh/delete.do', { code: rowData.code},function(resultData){
                                        layer.msg(resultData.msg, {offset: '100px'},function () {
                                            if(resultData.code === 200){
                                                myself_table.reload();//重新加载表格数据
                                            }
                                            layer.close(index);
                                        });
                                    }, "json");
                                });
                            } else if (obj.event === 'courseName') {
                                if(rowData.isSubmit == '已提交'){
                                    return;
                                } else {
                                    // layer.msg('显示课程实施计划填写表', { offset: '100px'});
                                    let layIndex = layer.open({
                                        id : guid()
                                        ,title : '教学设计-实施计划-新增'
                                        ,type : 1
                                        ,area : [ '1175px', '500px' ]
                                        ,offset : '30px'
                                        // ,maxmin: true
                                        ,content : $('#editForm_container')
                                        ,success: function(layero, index){

                                            let ue_jxDesign = UE.getEditor("jxDesign") //课堂设计
                                                ,ue_szElement = UE.getEditor("szElement"); //思政元素

                                            //初始化表单
                                            initEditForm({
                                                'code': new Date().getTime() //初始化业务数据编号
                                                ,'userId':$.cookie('userId')
                                                ,'userName':$.cookie('userName')
                                            });

                                            //监听表单提交
                                            form.on('submit(toSubmitEidtForm)', function(data){
                                                $.post(requestUrl+'/skjh/insert.do', data.field, function (resultData) {
                                                    layer.msg(resultData.msg, {offset: '100px'},function () {
                                                        if(resultData.code === 200){
                                                            myself_table.reload();//重新加载表格数据
                                                        }
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
                                    layer.full(layIndex); //默认以最大化方式打开
                                }
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
                                detail_shenheProcess('教学设计-课程实施计划-查看审核流程',rowData);
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

                //初始化表单数据
                form.val("editForm",{
                    "code":data.code
                    ,"courseCode" : data.courseCode
                    ,"mainTeacher" : data.mainTeacher
                    ,"teachClass" : data.teachClass
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
                //
                let options = {
                    id :guid() //弹层唯一标识,一般用于页面层和iframe层模式,设置该值后，不管是什么类型的层，都只允许同时弹出一个。
                    ,title : '教学设计-课程实施计划-查看信息'
                    ,type : 1
                    ,area : [ '900px', '500px' ]
                    ,offset : '30px' //只定义top坐标，水平保持居中
                    ,shadeClose : true //点击遮罩关闭
                    ,btn : ['关闭']
                    ,content : '<table class="layui-table">\n' +
                        '        <tbody>\n' +
                        '              <tr>' +
                        '                <td style="width: 80px; text-align: right">课程编号：</td><td style="width: 120px;">'+rowData.courseCode+'</td>' +
                        '                <td style="width: 80px; text-align: right">课程名称：</td><td style="width: 120px;">'+rowData.courseName+'</td>' +
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
                        layer.msg(resultData.msg, {time : 3000, offset: '100px'},function () {
                            if(resultData.code === 200){
                                myself_table.reload();//重新加载表格数据
                            }
                            layer.closeAll();
                        });
                    },'json');
                });
            };

            //审核
            var toShenHe = function (row_dataArr) {
                //
                layer.open({
                    title : '教学设计-课程实施计划-审核'
                    ,type : 1
                    ,area : [ '900px', '450px' ]
                    ,offset : '50px' //只定义top坐标，水平保持居中
                    ,shadeClose : true //点击遮罩关闭
                    ,btn : ['关闭']
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
                            $.post(requestUrl+'/skjh/toShenhe.do',{
                                "jsonStr":JSON.stringify(row_dataArr)
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
                                    layer.close(index);
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
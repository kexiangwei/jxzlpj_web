/*
教学研究-教学团队
 */
layui.use(['layer','element','table','form','laydate'], function(){
    var $ = layui.$,layer = layui.layer,element = layui.element,table = layui.table,form = layui.form,laydate = layui.laydate;

    const currentMenuId = $.cookie('currentMenuId');

    //验证用户是否拥有提交、审核权限
    $.ajax({
        type: "get",
        url: requestUrl+'/getUserAuth.do', //查询用户是否拥有菜单的提交、审核权限
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

            if(data.isAuthSubmit > 0){ //拥有提交权限

                //数据表格
                var myself_table = table.render({
                    id: guid()
                    ,elem : '#myself_table'
                    ,height : 440
                    ,url: requestUrl+'/jiaoXueTuanDui/getPageList.do'
                    ,where:{
                        "userId":function () {
                            return  $.cookie('userId');
                        },
                        'type':'report'
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
                        ,limits: [10,20,50,100]
                        ,first: '首页' //不显示首页
                        ,last: '尾页' //不显示尾页
                    }
                    ,limit: 10
                    ,even: true //隔行背景
                    ,toolbar: '#myself_toolbar' //指向自定义工具栏模板选择器
                    ,cols : [[ //表头
                        {type:'checkbox', fixed: 'left'}
                        ,{type:'numbers', title:'序号', width:80, fixed: 'left'}
                        ,{field: 'teamName', title: '团队名称', width:150, sort:true}
                        ,{field: 'registDate', title: '建立时间', width:150, sort:true}
                        ,{field: 'userId', title: '负责人', width:150, sort:true}
                        ,{field: 'declareOrReport', title: '年度报告', width:150, sort:true}
                        ,{field: 'reportResult', title: '考核结果', width:150, sort:true, event: 'reportResult', templet: function (data) {
                                if(data.reportResult == '已审核'){
                                    return '<span style="font-weight: bold; cursor: pointer;">已审核</span>';
                                }
                                return '<span style="font-weight: bold;">未审核</span>';
                         }}
                        ,{field: 'isSubmit', title: '提交状态', width:120, sort:true, templet: function(data){ // 函数返回一个参数 data，包含接口返回的所有字段和数据
                                let html='';
                                if(data.isSubmit=='未提交'){
                                    if(data.status ==='退回'){
                                        html =
                                            ' <a class="layui-btn layui-btn-primary layui-btn-xs" lay-event="detail_dataInfo">查看信息</a>\n' +
                                            ' <a class="layui-btn layui-btn-normal layui-btn-xs" lay-event="detail_shenheProcess">查看流程</a>\n' +
                                            ' <a class="layui-btn layui-btn-warm layui-btn-xs" lay-event="update">编辑</a>\n' +
                                            ' <a class="layui-btn layui-btn-danger layui-btn-xs" lay-event="delete">删除</a>';
                                        $('#myself_bar').html(html);
                                        return '<span style="font-weight: bold;">'+data.isSubmit+'</span>';
                                    }
                                    html =
                                        ' <a class="layui-btn layui-btn-primary layui-btn-xs" lay-event="detail_dataInfo">查看信息</a>\n' +
                                        ' <a class="layui-btn layui-btn-disabled layui-btn-xs" lay-event="detail_shenheProcess">查看流程</a>\n' +
                                        ' <a class="layui-btn layui-btn-warm layui-btn-xs" lay-event="update">编辑</a>\n' +
                                        ' <a class="layui-btn layui-btn-danger layui-btn-xs" lay-event="delete">删除</a>';
                                    $('#myself_bar').html(html);
                                    return '<span style="font-weight: bold;">'+data.isSubmit+'</span>';
                                } else if(data.isSubmit=='已提交'){
                                    html = ' <a class="layui-btn layui-btn-primary layui-btn-xs" lay-event="detail_dataInfo">查看信息</a>\n' +
                                        '           <a class="layui-btn layui-btn-normal layui-btn-xs" lay-event="detail_shenheProcess">查看流程</a>\n' +
                                        '           <a class="layui-btn layui-btn-disabled layui-btn-xs" lay-event="update">编辑</a>' +
                                        '           <a class="layui-btn layui-btn-disabled layui-btn-xs" lay-event="delete">删除</a>';
                                    $('#myself_bar').html(html);
                                    return '<span style="color: blue;font-weight: bold;">'+data.isSubmit+'</span>';
                                }
                            }
                        }
                        ,{field: 'status', title: '审核状态', width:120, sort:true,templet: function(data){ // 函数返回一个参数 data，包含接口返回的所有字段和数据
                                let status = data.status;
                                if(status =='审核中' || status =='通过'){
                                    return '<span style="color: blue;font-weight: bold;">'+status+'</span>';
                                }else if(status =='未通过' || status =='退回'){
                                    return '<span style="color: red;font-weight: bold;">'+status+'</span>';
                                }else{
                                    return '<span style="font-weight: bold;">待审核</span>';
                                }
                            }
                        }
                        ,{fixed: 'right', width:268, align:'center', toolbar: '#myself_bar'} //这里的toolbar值是模板元素的选择器
                    ]]
                    ,done: function(res, curr, count){

                        //监听搜索框事件
                        let active = {
                            search: function(){
                                myself_table.reload({
                                    where: {
                                        'teamName': $(".myself_search input[name='teamName']").val()
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

                                    //初始化弹窗
                                    layer.open({
                                        title : '教学研究-教学团队-新增'
                                        ,type : 1
                                        ,area : [ '1100px', '500px' ]
                                        ,offset : '30px'
                                        ,content : $('#editForm_container')
                                        ,success: function(layero, index){

                                            //初始化表单
                                            initEditForm({
                                                'code': new Date().getTime()
                                                ,'userId':$.cookie('userId')
                                                ,'userName':$.cookie('userName')
                                                ,'userUnit':'农学院'
                                            });

                                            //监听表单提交
                                            form.on('submit(toSubmitEidtForm)', function(data){
                                                $.post(requestUrl+'/jiaoXueTuanDui/insert.do' ,data.field ,function(result_data){
                                                    layer.msg(result_data.msg, { offset: '100px'}, function () {
                                                        if(result_data.code == 200){
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
                                            layer.msg('您选择了已提交的信息！', {time : 3000, offset: '100px'});
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
                                if(data.isSubmit=='未提交'){
                                    return;
                                }
                                detail_shenheProcess('教学研究-教学团队-查看审核流程',data);
                            } else if (obj.event === 'update') {
                                if(data.isSubmit== '已提交'){
                                    return;
                                }
                                //执行编辑
                                layer.open({
                                    title : '教学研究-教学团队-编辑'
                                    ,type : 1
                                    ,area : [ '1100px', '500px' ]
                                    ,offset : '30px'
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
                                            $.post(requestUrl+'/jiaoXueTuanDui/update.do' ,data.field ,function(result_data){
                                                layer.msg(result_data.msg, { offset: '100px'}, function () {
                                                    if(result_data.code == 200){
                                                        myself_table.reload();//重新加载表格数据
                                                    }
                                                    layer.close(index);
                                                });
                                            },'json');
                                        });
                                    },end:function () {
                                        // window.location.reload();//重新加载页面
                                    }
                                });
                            } else if (obj.event === 'delete') {
                                if(data.isSubmit== '已提交'){
                                    return;
                                }
                                layer.confirm('删除后不可恢复，真的要删除么？', {icon: 3, title:'提示', offset: '100px'}, function(index) {
                                    $.post(requestUrl+'/jiaoXueTuanDui/delete.do', { 'code': data.code}, function(result_data){
                                        layer.msg(result_data.msg, {time : 3000, offset: '100px'},function () {
                                            if(result_data.code == 200){
                                                myself_table.reload();//重新加载表格数据
                                            }
                                            layer.close(index);
                                        });
                                    }, "json");
                                });
                            } else if (obj.event === 'reportResult') {
                                if(data.reportResult == '未审核'){
                                    // layer.msg('未审核', { offset: '100px'});
                                    return;
                                } else {
                                    let layIndex = layer.open({
                                        title : '教学研究-教学团队-专家评审结果'
                                        ,type : 1
                                        ,area : [ '1175px', '500px' ]
                                        ,offset : '30px'
                                        ,shadeClose : true
                                        ,content : $('#resultContainer')
                                        ,success: function(layero, index){
                                            $.get(requestUrl+'/jiaoXueTuanDui/getPingShenInfo.do',{
                                                'relationCode':data.code
                                                ,'batchNum':data.batchNum
                                            },function (resultData) {
                                                if(resultData.code == 200){
                                                    if(resultData.data.length>0){
                                                        let html = '';
                                                        $.each(resultData.data,function (idx,obj) {
                                                            html += '<tr><td style="text-align: center">'+(idx+1)+'&nbsp;号评委</td>' +
                                                                '<td style="text-align: center">'+obj.targetTeamBuildingPlan+'</td>' +
                                                                '<td style="text-align: center">'+obj.targetTeamCompose+'</td>' +
                                                                '<td style="text-align: center">'+obj.targetTeamLeader+'</td>' +
                                                                '<td style="text-align: center">'+obj.targetTeachingWork+'</td>' +
                                                                '<td style="text-align: center">'+obj.targetTeachingResearch+'</td>' +
                                                                '<td style="text-align: center">'+obj.targetInnovationAndEntrepre+'</td>' +
                                                                '<td style="text-align: center">'+obj.targetTeacherTraining+'</td>' +
                                                                '<td style="text-align: center">'+obj.totalScore+'</td>' +
                                                                '<td style="text-align: center">'+obj.pingshenOpinion+'</td></tr>\n';
                                                        });
                                                        $("#pingshenResult").html(html);
                                                    }
                                                }
                                            },'json');
                                        },end:function () {
                                            $("#pingshenResult").empty();
                                        }
                                    });
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

            if(data.isAuthShenhe > 0){ //拥有审核权限

                var isJwcGly  //是否教务处管理员
                    ,isZjshAccount //是否专家评审账号
                    ,other_table = table.render({ //数据表格
                    id: guid()
                    ,elem : '#other_table'
                    ,height : 440
                    ,url: requestUrl+'/jiaoXueTuanDui/getPageList.do'
                    ,where:{
                        "shenHeUserId":function () {
                            return $.cookie('userId');
                        },
                        'type':'report'
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
                            "unShenHeNum": res.data.unShenHeNum,
                            "isJwcGly": res.data.isJwcGly,
                            "isZjshAccount": res.data.isZjshAccount
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
                        ,{field: 'teamName', title: '团队名称', width:150, sort:true}
                        ,{field: 'registDate', title: '建立时间', width:150, sort:true}
                        ,{field: 'userId', title: '负责人', width:150, sort:true}
                        ,{field: 'declareOrReport', title: '年度报告', width:270, sort:true}
                        ,{field: 'reportResult', title: '考核结果', width:120, sort:true, event: 'reportResult', templet: function (data) {
                                if(data.reportResult == '已审核' || data.reportResult == '已填写' ){
                                    return '<span style="font-weight: bold; cursor: pointer;">'+data.reportResult+'</span>';
                                }
                                return '<span style="font-weight: bold;">'+data.reportResult+'</span>';
                            }}
                        ,{field: 'shenheStatus', title: '审核状态', width:120, sort:true, templet: function(data){ // 函数返回一个参数 data，包含接口返回的所有字段和数据
                                var val = data.shenheStatus;
                                if(val=='已审核'){
                                    return '<span style="color: blue;font-weight: bold;">'+val+'</span>';
                                }
                                return '<span style="color: red;font-weight: bold;">'+val+'</span>';
                            }
                        }
                        ,{field: 'shenheStatusFirst', title: '初审状态', width:120,templet: function(data){ // 函数返回一个参数 data，包含接口返回的所有字段和数据
                                var val = data.shenheStatusFirst;
                                if(val=='已审核'){
                                    return '<span style="color: blue;font-weight: bold;">'+val+'</span>';
                                }
                                return '<span style="color: red;font-weight: bold;">'+val+'</span>';
                            }
                        }
                        ,{field: 'shenheStatusFinal', title: '终审状态', width:120,templet: function(data){ // 函数返回一个参数 data，包含接口返回的所有字段和数据
                                var val = data.shenheStatusFinal;
                                if(val=='已审核'){
                                    return '<span style="color: blue;font-weight: bold;">'+val+'</span>';
                                }else if(val=='待审核'){
                                    return '<span style="color: gray;font-weight: bold;">'+val+'</span>';
                                }else{
                                    return '<span style="color: red;font-weight: bold;">'+val+'</span>';
                                }
                            }
                        }
                        ,{field: 'isJwcGly_0',fixed: 'right', width:168, align:'center',templet: function(data){
                                return '<a class="layui-btn layui-btn-primary layui-btn-xs" lay-event="detail_dataInfo">查看信息</a>' +
                                    '<a class="layui-btn layui-btn-normal layui-btn-xs" lay-event="detail_shenheProcess">查看流程</a>';
                            }
                        }
                        ,{field: 'isJwcGly_1',fixed: 'right', width:288, align:'center',templet: function(data){
                                let html = '<a class="layui-btn layui-btn-primary layui-btn-xs" lay-event="detail_dataInfo">查看信息</a>' +
                                    '<a class="layui-btn layui-btn-normal layui-btn-xs" lay-event="detail_shenheProcess">查看流程</a>';
                                if(data.zjshItemList.length>0){
                                    html += '<a class="layui-btn layui-btn-normal layui-btn-xs" lay-event="detail-zjsh">查看专家审核意见</a>';
                                }else{
                                    html += '<a class="layui-btn layui-btn-disabled layui-btn-xs" lay-event="detail-zjsh">查看专家审核意见</a>';
                                }
                                return html;
                            }
                        }
                    ]]
                    ,done: function(res, curr, count){
                        $('#other').find('span').html(res.unShenHeNum);

                        isJwcGly = res.isJwcGly; //是否教务处管理员
                        isZjshAccount = res.isZjshAccount; //是否专家评审账号

                        let html='';
                        // alert(isJwcGly);
                        if(isJwcGly==1){ //当前登录用户为教务处管理员
                            $("[data-field='userId']").css('display','none'); //关键代码
                            $("[data-field='userName']").css('display','none'); //关键代码
                            $("[data-field='shenheStatus']").css('display','none'); //关键代码
                            $("[data-field='isJwcGly_0']").css('display','none'); //关键代码
                            //
                            html = '&nbsp;&nbsp;初审状态：\n' +
                                '                        <div class="layui-inline" style="width: 180px">\n' +
                                '                            <select name="shenheStatusFirst" id="shenheStatusFirst">\n' +
                                '                                <option value="">请选择</option>\n' +
                                '                                <option value="已审核">已审核</option>\n' +
                                '                                <option value="未审核">未审核</option>\n' +
                                '                            </select>\n' +
                                '                        </div>\n' +
                                '                        &nbsp;&nbsp;终审状态：\n' +
                                '                        <div class="layui-inline" style="width: 180px">\n' +
                                '                            <select name="shenheStatusFinal" id="shenheStatusFinal">\n' +
                                '                                <option value="">请选择</option>\n' +
                                '                                <option value="已审核">已审核</option>\n' +
                                '                                <option value="未审核">未审核</option>\n' +
                                '                                <option value="待审核">待审核</option>\n' +
                                '                            </select>\n' +
                                '                        </div>';

                        }else{
                            $("[data-field='shenheStatusFirst']").css('display','none'); //关键代码
                            $("[data-field='shenheStatusFinal']").css('display','none'); //关键代码
                            $("[data-field='isJwcGly_1']").css('display','none'); //关键代码
                            //
                            html = '&nbsp;&nbsp;审核状态：\n' +
                                '                            <div class="layui-inline">\n' +
                                '                                <select name="shenheStatus" id="shenheStatus">\n' +
                                '                                    <option value="">请选择</option>\n' +
                                '                                    <option value="已审核">已审核</option>\n' +
                                '                                    <option value="未审核">未审核</option>\n' +
                                '                                </select>\n' +
                                '                            </div>';
                        }

                        if($('.other_search div').length == 2){

                            $('.other_search div:last').before(html);
                            form.render("select");

                        }

                        //监听搜索框事件
                        let active = {
                            search: function(){
                                other_table.reload({
                                    where: {
                                        'teamName': $(".other_search input[name='teamName']").val()
                                        ,'shenheStatus': $("#shenheStatus").val()
                                        ,'shenheStatusFirst': $("#shenheStatusFirst").val()
                                        ,'shenheStatusFinal': $("#shenheStatusFinal").val()
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
                                $("#shenheStatusFirst").val("");
                                $("#shenheStatusFinal").val("");
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
                                        let flag = false
                                            ,msg=''
                                            ,shenheStatusFirst = null;
                                        $.each(data,function(index,item){
                                            if(isJwcGly==1){ //当前登录用户为教务处管理员
                                                if(item.shenheStatusFirst== '已审核' && item.shenheStatusFinal== '已审核'){
                                                    flag = true;
                                                    msg = '您选择了已审核的信息';
                                                    return false;//跳出循环
                                                } else if(item.shenheStatusFirst== '已审核' && isEmpty(item.zjshItemList)){
                                                    flag = true;
                                                    msg = '您选择了专家未审核的信息';
                                                    return false;//跳出循环
                                                } else if(item.shenheStatusFirst== '已审核' && item.isZjshAll !=1){
                                                    flag = true;
                                                    msg = '您选择了专家未审核的信息';
                                                    return false;//跳出循环
                                                } else{
                                                    if(index===0){
                                                        shenheStatusFirst = item.shenheStatusFirst;
                                                    }else{
                                                        if(shenheStatusFirst != item.shenheStatusFirst){
                                                            flag = true;
                                                            msg = '您选择了不同审核类别的信息';
                                                            return false;//跳出循环
                                                        }
                                                    }
                                                }
                                            } else{
                                                if(isZjshAccount == 1 && item.reportResult == '未填写'){
                                                    flag = true;
                                                    msg = '考核信息未填写';
                                                    return false;
                                                }
                                                if(item.shenheStatus== '已审核'){
                                                    flag = true;
                                                    msg = '您选择了已审核的信息';
                                                    return false;//跳出循环
                                                }
                                            }
                                        });
                                        if(flag){
                                            layer.msg(msg, {time : 3000, offset: '100px'});
                                            return;
                                        } else {
                                            toShenHe(data,shenheStatusFirst); //添加审核意见
                                        }
                                    }
                                    break;
                            }
                        });

                        //监听工具条
                        table.on('tool(other_table)', function(obj){
                            var data = obj.data;
                            if (obj.event === 'detail_dataInfo') {
                                detail_dataInfo(data,false,true);
                            }  else if (obj.event === 'detail_shenheProcess') {
                                detail_shenheProcess('教学研究-教学团队-查看审核流程',data);
                            }  else if (obj.event === 'detail-zjsh') {
                                detail_zjsh(data);
                            } else if (obj.event === 'reportResult') {
                                if(data.reportResult == '未审核'){
                                    return;
                                } else {
                                    if(isZjshAccount == 1){
                                        toPingshen(data);
                                    }else{
                                        let layIndex = layer.open({
                                            title : '教学研究-教学团队-专家评审结果'
                                            ,type : 1
                                            ,area : [ '1175px', '500px' ]
                                            ,offset : '30px'
                                            ,shadeClose : true
                                            ,content : $('#resultContainer')
                                            ,success: function(layero, index){
                                                $.get(requestUrl+'/jiaoXueTuanDui/getPingShenInfo.do',{
                                                    'relationCode':data.code
                                                    ,'batchNum':data.batchNum
                                                },function (resultData) {
                                                    if(resultData.code == 200){
                                                        if(resultData.data.length>0){
                                                            // alert(JSON.stringify(resultData.data));
                                                            let html = '';
                                                            $.each(resultData.data,function (idx,obj) {
                                                                html += '<tr><td style="text-align: center">'+obj.userName+'</td>' +
                                                                '<td style="text-align: center">'+obj.targetTeamBuildingPlan+'</td>' +
                                                                '<td style="text-align: center">'+obj.targetTeamCompose+'</td>' +
                                                                '<td style="text-align: center">'+obj.targetTeamLeader+'</td>' +
                                                                '<td style="text-align: center">'+obj.targetTeachingWork+'</td>' +
                                                                '<td style="text-align: center">'+obj.targetTeachingResearch+'</td>' +
                                                                '<td style="text-align: center">'+obj.targetInnovationAndEntrepre+'</td>' +
                                                                '<td style="text-align: center">'+obj.targetTeacherTraining+'</td>' +
                                                                '<td style="text-align: center">'+obj.totalScore+'</td>' +
                                                                '<td style="text-align: center">'+obj.pingshenOpinion+'</td></tr>\n';
                                                            });
                                                            $("#pingshenResult").html(html);
                                                        }
                                                    }
                                                },'json');
                                            },end:function () {
                                                $("#pingshenResult").empty();
                                            }
                                        });
                                    }
                                }
                            }
                        });
                    }
                });

                //监听Tab切换
                element.on('tab(layTab)', function(data){
                    if(data.index == 1){ //
                        other_table.reload(); //重新加载表格数据
                    }
                });
            } else{
                $('#other').remove();
                $('#other_item').remove();
            }

            //初始化业务表单
            var initEditForm = function(data){

                //清空表单数据
                document.getElementById("editForm").reset();

                //初始化laydate实例
                laydate.render({
                    elem: '#registDate' //指定元素
                    // ,type: 'datetime'
                });

                //
                form.val("editForm",{
                    "code":data.code
                    ,"teamName": data.teamName
                    ,"registDate" : data.registDate
                    ,"declareOrReport" : data.declareOrReport
                    ,"userId":data.userId
                    ,"userName":data.userName
                    ,"userUnit":data.userUnit
                });

                //参与人员列表
                initMemberDataTable(data.code);

            };

            /**
             * 初始化团队成员列表
             * @param xmCode 项目编号
             */
            var initMemberDataTable = function (relationCode) {

                let teacher_datatable = table.render({
                    id: guid()
                    ,elem : '#teacher_datatable'
                    ,url: requestUrl+'/common/getTeacherInfo.do'
                    ,where: {
                        "relationCode": relationCode
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
                        ,{field: 'teacherCode', title: '工号', width:150, align:'center'}
                        ,{field: 'teacherName', title: '姓名', width:150, align:'center'}
                        ,{field: 'teacherUnit', title: '单位', align:'center'}
                        ,{fixed: 'right', title: '操作', width:120, align:'center', toolbar: '#teacher_datatable_bar'}
                    ]]
                    ,even: true //隔行背景
                    ,done : function(res, curr, count) {

                        //监听头工具栏事件
                        table.on('toolbar(teacher_datatable)', function(obj){

                            //
                            layer.open({
                                title : '教学研究-教学团队-新增团队成员信息'
                                ,type : 1
                                ,area : [ '900px', '300px' ]
                                ,offset : '100px'
                                ,btn : ['关闭']
                                ,content : $('#teacher_container')
                                ,success: function(layero, index){

                                    //监听表单提交
                                    form.on('submit(toSubmitTeacherForm)', function(data){
                                        let form_data = data.field;
                                        form_data.relationCode = relationCode;
                                        $.post(requestUrl+'/common/addTeacherInfo.do', form_data, function (result_data) {
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
                                    $("#teacherForm input").val('');
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
                                        if(result_data.code === 200){
                                            teacher_datatable.reload();//重新加载表格数据
                                        }
                                    });
                                }, "json");
                            }
                        });
                    }
                });
            };

            //查看详情
            var detail_dataInfo = function (data,isSubmit,isShenHe) {

                let options = {
                    title : '教学研究-教学团队-查看详情'
                    ,type : 1
                    ,area : [ '1100px', '500px' ]
                    ,offset : '30px'
                    ,shadeClose : true //点击遮罩关闭
                    ,btn : ['关闭']
                    ,content : $('#dataInfo_container')
                    ,success: function(layero, index){

                        //团队基本信息
                        let html = '<table class="layui-table">\n' +
                            '            <tbody>\n' +
                            '               <tr>' +
                            '                   <td style="width: 182px; text-align: right">团队名称：</td><td>'+data.teamName+'</td>' +
                            '               </tr>\n' +
                            '               <tr>' +
                            '                    <td style="width: 182px; text-align: right">建立时间：</td><td>'+data.registDate+'</td>' +
                            '               </tr>\n' +
                            '            </tbody>\n' +
                            '         </table>';
                        $("#teamBaseInfo").html(html);

                        //团队负责人信息
                        html = '<table class="layui-table">\n' +
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
                        $("#teamLeaderInfo").html(html);

                        //团队成员信息
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
                                    $("#teamMemberInfo").html(html);
                                }
                            }
                        },'json');

                        //年度报告
                        html = '<table class="layui-table">\n' +
                            '           <tbody>\n' +
                            '               <tr>' +
                            '                   <td>'+data.declareOrReport+'</td>' +
                            '               </tr>\n' +
                            '           </tbody>\n' +
                            '       </table>';
                        $("#declareOrReportInfo").html(html);
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
                if(isShenHe && (data.shenheStatus == '未审核' || (data.shenheStatusFinal == '未审核' && data.isZjshAll == 1))){
                    options.btn = ['审核','关闭'];
                    options.yes = function(index, layero){
                        if(isZjshAccount == 1 && data.reportResult == '未填写'){
                            layer.msg('考核信息未填写', {time : 3000, offset: '100px'});
                            return false;
                        }
                        toShenHe(new Array(data),data.shenheStatusFirst);
                    };
                    options.btn2 = function(index, layero){
                        layer.close(index); //如果设定了yes回调，需进行手工关闭
                    };
                }
                layer.open(options);
            };

            //提交
            var toSubmit = function (row_dataArr){
                layer.confirm('信息提交后不可进行编辑、删除操作，是否继续提交？', {icon: 3, title:'提示', offset: '100px'}, function(index) {
                    $.post(requestUrl+'/jiaoXueTuanDui/toSubimt.do',{
                        "menuId":currentMenuId,
                        "jsonStr":JSON.stringify(row_dataArr)
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
            var toShenHe = function (row_dataArr,shenheStatusFirst) {
                layer.open({
                    title : '教学研究-教学团队-审核'
                    ,type : 1
                    ,area : [ '900px', '450px' ]
                    // ,area : '500px'//只想定义宽度时，你可以area: '500px'，高度仍然是自适应的
                    ,offset : '50px' //只定义top坐标，水平保持居中
                    ,shadeClose : true //点击遮罩关闭
                    ,btn : ['关闭']
                    ,content : $('#shenHeForm_container')
                    ,success: function(layero, index){
                        //
                        if(isJwcGly==1){ //当前登录用户为教务处管理员
                            $("#shenheType").css('display','block'); //关键代码
                            form.val("shenHeForm",{
                                "shenheType":shenheStatusFirst == '未审核'?'初审':'终审'
                            });
                        }
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
                            $.post(requestUrl+'/jiaoXueTuanDui/toShenhe.do',{
                                'isZjshAccount':isZjshAccount
                                ,"jsonStr":JSON.stringify(row_dataArr)
                                ,"shenheType":isJwcGly==1?formData.field.shenheType:null
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
                                    layer.close(layIndex);
                                });
                            },'json');
                        });
                    }
                });
            };

            /**
             * 查看审核流程
             * @param rowData
             */
            var detail_shenheProcess = function (title,rowData) {
                layer.open({
                    title : title
                    ,type : 1
                    ,area : [ '1175px', '535px' ]
                    ,offset : '10px' //只定义top坐标，水平保持居中
                    ,shadeClose : true //点击遮罩关闭
                    ,btn : ['关闭']
                    ,content : $('#shenheProcess_container')
                    ,success: function(layero, index){
                        $.get(requestUrl+"/getShenheProcess.do" , {
                            "relationCode": function () {
                                return rowData.code;
                            }
                        } ,  function(data){
                            if(data.code == 200){
                                var data = data.data;
                                if(data.length>0){
                                    var htmlStr = '';
                                    for (var i = 0; i < data.length; i++) {
                                        htmlStr += '<fieldset class="layui-elem-field" style="margin-top: 10px;" >' +
                                            '<legend>开始</legend>\n' +
                                            '               <div>' +
                                            '                   <table class="layui-table">\n' +
                                            '                        <tbody>\n' +
                                            '                            <tr>' +
                                            '                           <td style="width: 80px; text-align: center">提交人员</td><td style="width: 120px; text-align: center">'+data[i].userName+'</td>' +
                                            '                           <td style="width: 80px; text-align: center">提交时间</td><td style="width: 120px; text-align: center">'+data[i].createDate+'</td>' +
                                            '                       </tr>\n' +
                                            '                       </tbody>\n' +
                                            '                  </table>\n' +
                                            '               </div>';
                                        if(data[i].shenHeItemList.length>0){
                                            for (let j = 0; j < data[i].shenHeItemList.length; j++) {
                                                let item = data[i].shenHeItemList[j];
                                                if(item.shenheType=='初审' || item.shenheType =='终审'){
                                                    htmlStr += '<h4 style="margin-left: 30px;">'+item.nodeName+'</h4>\n' +
                                                        '               <div>' +
                                                        '                   <table class="layui-table">\n' +
                                                        '                        <tbody>\n' +
                                                        '                            <tr>' +
                                                        '                           <td style="width: 80px; text-align: center">审核人员</td><td style="width: 120px; text-align: center">'+item.userName+'</td>' +
                                                        '                           <td style="width: 80px; text-align: center">审核时间</td><td style="width: 120px; text-align: center">'+item.createDate+'</td>' +
                                                        '                       </tr>\n' +
                                                        '                            <tr>' +
                                                        '                           <td style="width: 80px; text-align: center">审核类别</td><td style="width: 120px; text-align: center">'+item.shenheType+'</td>' +
                                                        '                           <td style="width: 80px; text-align: center">审核状态</td><td style="width: 120px; text-align: center">'
                                                        +(item.status=='通过'?'<span style="color: green;font-weight: bold;">通过</span>':'<span style="color: red;font-weight: bold;">退回</span>')+'</td>' +
                                                        '                       </tr>\n' +
                                                        '                            <tr>' +
                                                        '                           <td style="width: 80px; text-align: center">审核意见</td><td style="width: 120px; text-align: center" colspan="3">'+item.opinion+'</td>' +
                                                        '                       </tr>\n' +
                                                        '                       </tbody>\n' +
                                                        '                  </table>\n' +
                                                        '               </div>';
                                                }else{
                                                    htmlStr += '<h4 style="margin-left: 30px;">'+item.nodeName+'</h4>\n' +
                                                        '               <div>' +
                                                        '                   <table class="layui-table">\n' +
                                                        '                        <tbody>\n' +
                                                        '                            <tr>' +
                                                        '                           <td style="width: 80px; text-align: center">审核人员</td><td style="width: 120px; text-align: center">'+item.userName+'</td>' +
                                                        '                           <td style="width: 80px; text-align: center">审核时间</td><td style="width: 120px; text-align: center">'+item.createDate+'</td>' +
                                                        '                       </tr>\n' +
                                                        '                            <tr>' +
                                                        '                           <td style="width: 80px; text-align: center">审核状态</td><td style="width: 120px; text-align: center">'
                                                        +(item.status=='通过'?'<span style="color: green;font-weight: bold;">通过</span>':'<span style="color: red;font-weight: bold;">退回</span>')+'</td>' +
                                                        '                           <td style="width: 80px; text-align: center">审核意见</td><td style="width: 120px; text-align: center">'+item.opinion+'</td>' +
                                                        '                       </tr>\n' +
                                                        '                       </tbody>\n' +
                                                        '                  </table>\n' +
                                                        '               </div>';
                                                }
                                            }
                                        }
                                        htmlStr +=  '</fieldset>';
                                    }
                                    if(rowData.status =='通过'){
                                        htmlStr +=  '<h2 style="margin-left: 30px;">结束</h2>';
                                    }
                                    $("#shenheProcess_container").html(htmlStr);
                                }else{
                                    layer.msg('暂无审核数据', {time : 3000, offset: '100px'});
                                }
                            }else{
                                layer.msg('获取数据出错', {time : 3000, offset: '100px'});
                            }
                        }, "json");
                    }
                    ,end:function () {
                        $("#shenheProcess_container .layui-elem-field").empty();
                    }
                });
            };

            /**
             * 查看专家审核意见
             * @param rowData
             */
            var detail_zjsh = function (row_data) {
                let zjshItemList = row_data.zjshItemList;
                if(isEmpty(zjshItemList)){
                    return;
                }
                layer.open({
                    title : '教学研究-教改项目-查看专家审核意见'
                    ,type : 1
                    ,area : [ '1175px', '535px' ]
                    ,offset : '10px' //只定义top坐标，水平保持居中
                    ,shadeClose : true //点击遮罩关闭
                    ,btn : ['导出专家评审结果','关闭']
                    ,yes: function(){
                        // alert(JSON.stringify(row_data));
                        let sheetData = new Array();
                        $.each(zjshItemList,function (idx,obj) {
                            let item = {
                                xmName : row_data.xmName,
                                leader : row_data.leader,
                                userName : obj.userName,
                                status : obj.status,
                                opinion : obj.opinion,
                                createDate : obj.createDate
                            };
                            sheetData[idx] = item;
                        });
                        let option={};
                        option.fileName = row_data.xmName+'校外专家审核意见';
                        option.datas=[
                            {
                                sheetHeader:['项目名称','主持人','专家','评审结果','评审意见','评审时间'],
                                sheetData:sheetData
                            }
                        ];
                        let toExcel=new ExportJsonExcel(option);
                        toExcel.saveExcel();
                    }
                    ,btn2: function(){
                        layer.closeAll();
                    }
                    ,content : $('#zjshContainer')
                    ,success: function(layero, index){
                        let html = '';
                        for (let i = 0; i < zjshItemList.length; i++) {
                            html += '<fieldset class="layui-elem-field" style="margin-top: 10px;" >' +
                                '       <legend>'+zjshItemList[i].userName+'</legend>\n' +
                                '               <div>' +
                                '                   <table class="layui-table">\n' +
                                '                        <tbody>\n' +
                                '                            <tr>' +
                                '                           <td style="width: 80px; text-align: center">审核状态：</td><td style="width: 120px; text-align: center">'+zjshItemList[i].status+'</td>' +
                                '                           <td style="width: 80px; text-align: center">审核意见：</td><td style="width: 120px; text-align: center">'+zjshItemList[i].opinion+'</td>' +
                                '                       </tr>\n' +
                                '                       </tbody>\n' +
                                '                  </table>\n' +
                                '               </div>';
                            html +=  '</fieldset>';
                        }
                        if(row_data.isZjshAll == 1){
                            html +=  '<h2 style="margin-left: 30px;">专家评审完毕</h2>';
                        }
                        $("#zjshContainer").html(html);
                    }
                    ,end:function () {
                        $("#zjshContainer .layui-elem-field").empty();
                    }
                });
            };

            var toPingshen = function (row_data) {
                layer.open({
                    title : '教学研究-教学团队-专家评审'
                    ,type : 1
                    ,area : [ '1175px', '500px' ]
                    ,offset : '30px'
                    ,shadeClose : true
                    ,btn: ['关闭']
                    ,content : $('#pingshenContainer')
                    ,success: function(layero, index){
                        //
                        if(row_data.shenheStatus == '已审核'){
                            $('#pingshenFormBtn').css("display","none");
                        }
                        //
                        $("#cancel").click(function (event) {
                            layer.close(index);
                        });
                        //
                        $.get(requestUrl+'/jiaoXueTuanDui/getPingShenTemplate.do',{},function (resultData) {
                            if(resultData.code == 200){
                                //
                                let html = '';
                                $.each(resultData.data,function (idx,obj) {
                                    html += '<tr><td style="text-align: center">'+obj.targetName+'</td>' +
                                        '       <td style="text-align: center">'+obj.targetElement+'</td>' +
                                        '       <td>'+obj.targetContent+'</td>' +
                                        '       <td style="text-align: center">'+obj.targetScore+'</td>' +
                                        '       <td style="text-align: center"><input type="text" id="'+idx+'" name="'+obj.target+'" required  lay-verify="required|score" autocomplete="off" class="layui-input score"></td></tr>\n';
                                });
                                html += '<tr><td colspan="3">总分</td>' +
                                    '<td style="text-align: center">100</td>' +
                                    '<td style="text-align: center"><input type="text" name="totalScore" class="layui-input" style="cursor:not-allowed" disabled></td></tr>';
                                html += '<tr><td colspan="5"><textarea name="pingshenOpinion" placeholder="评审意见：（不少于100字）" class="layui-textarea"></textarea></td></tr>';
                                $('#pingshenContent').html(html);

                                //
                                if(row_data.reportResult == '已填写'){
                                    $.get(requestUrl+'/jiaoXueTuanDui/getPingShenInfo.do',{
                                        'relationCode':row_data.code
                                        ,'batchNum':row_data.batchNum
                                        ,"userId":function () {
                                            return $.cookie('userId');
                                        }
                                    },function (resultData) {
                                        if(resultData.code == 200){
                                            let pingshenObj = resultData.data[0];
                                            form.val("pingshenForm",{
                                                "targetTeamBuildingPlan" : pingshenObj.targetTeamBuildingPlan
                                                ,"targetTeamCompose" : pingshenObj.targetTeamCompose
                                                ,"targetTeamLeader" : pingshenObj.targetTeamLeader
                                                ,"targetTeachingWork" : pingshenObj.targetTeachingWork
                                                ,"targetTeachingResearch" : pingshenObj.targetTeachingResearch
                                                ,"targetInnovationAndEntrepre" : pingshenObj.targetInnovationAndEntrepre
                                                ,"targetTeacherTraining" : pingshenObj.targetTeacherTraining
                                                ,"totalScore" : pingshenObj.totalScore
                                                ,"pingshenOpinion" : pingshenObj.pingshenOpinion
                                            });
                                        }
                                    },'json');
                                }
                                //
                                let $inputs = $('.score');
                                $inputs.keyup(function() {
                                    let totalScore = 0;
                                    $inputs.each(function(){
                                        totalScore += parseInt($(this).val());
                                    });
                                    $("input[name='totalScore']").val(totalScore);
                                });

                                /**
                                 * 验证表单数据
                                 */
                                form.verify({
                                    score: function(value,item){ //value：表单的值、item：表单的DOM对象
                                        //alert(item) 出现[object HTMLInputElement],获取dom对象的属性值item.getAttribute('id') 或者 $(item).attr('id')
                                        let dataIndex = $(item).attr('id'); //获取input[id]属性值，值为resultData 的下标
                                        let targetScore = parseInt(resultData.data[dataIndex].targetScore); //通过下标获取预设分值，获取的值为字符串，使用parseInt 函数转为int 类型的值
                                        // alert(targetScore+"------"+value)
                                        if(targetScore < value || value < 0){ //如果输入值大于预设分值或者小于0，给出提示
                                            return '超出预设分值范围';
                                        }
                                    }
                                });

                                //监听表单提交
                                form.on('submit(pingshenFormSubmitBtn)', function(form_data){
                                    $.post(requestUrl+'/jiaoXueTuanDui/insertPingShenInfo.do',{
                                        "relationCode":row_data.code
                                        ,"batchNum": row_data.batchNum
                                        ,"targetTeamBuildingPlan" : form_data.field.targetTeamBuildingPlan
                                        ,"targetTeamCompose" : form_data.field.targetTeamCompose
                                        ,"targetTeamLeader" : form_data.field.targetTeamLeader
                                        ,"targetTeachingWork" : form_data.field.targetTeachingWork
                                        ,"targetTeachingResearch" : form_data.field.targetTeachingResearch
                                        ,"targetInnovationAndEntrepre" : form_data.field.targetInnovationAndEntrepre
                                        ,"targetTeacherTraining" : form_data.field.targetTeacherTraining
                                        ,"totalScore" : form_data.field.totalScore
                                        ,"pingshenOpinion" : form_data.field.pingshenOpinion
                                        ,"userId":function () {
                                            return $.cookie('userId');
                                        }
                                        ,"userName":function () {
                                            return $.cookie('userName');
                                        }
                                    },function(result_data){
                                        layer.msg(result_data.msg, {time : 3000, offset: '100px'});
                                    },'json');
                                });
                            }
                        },'json');
                    },end:function () {
                        $("#pingshenContent").empty();
                        $('#pingshenFormBtn').css("display","block");
                    }
                });
            }

        }
        ,error:function() {
            layer.msg('网络连接失败', {icon:7, time : 3000, offset: '100px'});
        }
    });
});
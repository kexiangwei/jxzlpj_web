/*
教学研究-教学团队
 */
layui.use(['layer','element','table','form','laydate','upload'], function(){
    var $ = layui.$,layer = layui.layer,element = layui.element,table = layui.table,form = layui.form,laydate = layui.laydate,upload = layui.upload;

    //验证用户是否拥有提交、审核权限
    $.ajax({
        type: "get",
        url: requestUrl+'/getAuthority.do', //查询用户是否拥有菜单的提交、审核权限
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

                //数据表格
                let myself_table = table.render({
                    elem : '#myself_table'
                    ,height : 440
                    ,id: "myself_table_id"
                    ,url: requestUrl+'/jiaoXueTuanDui/getPageList.do'
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
                        ,{field: 'registDate', title: '团队建立时间', width:150, sort:true}
                        ,{field: 'teamLeaderId', title: '负责人工号', width:150, sort:true, hide:true}
                        ,{field: 'teamLeader', title: '负责人', width:150, sort:true}
                        ,{field: 'teamLeaderUnit', title: '负责人单位', width:150, sort:true, hide:true}
                        ,{field: 'sbs', title: '申报书', width:150, sort:true}
                        ,{field: 'middleReport', title: '中期报告', width:150, sort:true}
                        ,{field: 'middleResult', title: '中期考核结果', width:150, sort:true, event: 'middleResult',templet: function(data){
                                if(data.middleResult == '已评审'){
                                    return '<span style="font-weight: bold; cursor: pointer;">已评审</span>';
                                }
                                return '<span style="font-weight: bold;">未评审</span>';
                            }
                        }
                        ,{field: 'finalReport', title: '总结报告', width:150, sort:true}
                        ,{field: 'finalResult', title: '最终考核结果', width:150, sort:true, event: 'finalResult',templet: function(data){
                                if(data.finalResult == '已评审'){
                                    return '<span style="font-weight: bold; cursor: pointer;">已评审</span>';
                                }
                                return '<span style="font-weight: bold;">未评审</span>';
                            }
                        }
                        ,{field: 'isSubmit', title: '提交状态', width:120, sort:true,templet: function(data){ // 函数返回一个参数 data，包含接口返回的所有字段和数据
                                let htmlstr='';
                                if(data.isSubmit=='未提交'){
                                    if(data.status ==='退回'){
                                        htmlstr =
                                            ' <a class="layui-btn layui-btn-primary layui-btn-xs" lay-event="detail_dataInfo">查看信息</a>\n' +
                                            ' <a class="layui-btn layui-btn-normal layui-btn-xs" lay-event="detail_shenheProcess">查看流程</a>\n' +
                                            ' <a class="layui-btn layui-btn-warm layui-btn-xs" lay-event="update">编辑</a>\n' +
                                            ' <a class="layui-btn layui-btn-danger layui-btn-xs" lay-event="delete">删除</a>';
                                        $('#myself_bar').html(htmlstr);
                                        return '<span style="font-weight: bold;">'+data.isSubmit+'</span>';
                                    }
                                    htmlstr =
                                        ' <a class="layui-btn layui-btn-primary layui-btn-xs" lay-event="detail_dataInfo">查看信息</a>\n' +
                                        ' <a class="layui-btn layui-btn-disabled layui-btn-xs" lay-event="detail_shenheProcess">查看流程</a>\n' +
                                        ' <a class="layui-btn layui-btn-warm layui-btn-xs" lay-event="update">编辑</a>\n' +
                                        ' <a class="layui-btn layui-btn-danger layui-btn-xs" lay-event="delete">删除</a>';
                                    $('#myself_bar').html(htmlstr);
                                    return '<span style="font-weight: bold;">'+data.isSubmit+'</span>';
                                } else if(data.isSubmit=='已提交'){
                                    htmlstr = ' <a class="layui-btn layui-btn-primary layui-btn-xs" lay-event="detail_dataInfo">查看信息</a>\n' +
                                        '           <a class="layui-btn layui-btn-normal layui-btn-xs" lay-event="detail_shenheProcess">查看流程</a>\n' +
                                        '           <a class="layui-btn layui-btn-disabled layui-btn-xs" lay-event="update">编辑</a>' +
                                        '           <a class="layui-btn layui-btn-disabled layui-btn-xs" lay-event="delete">删除</a>';
                                    $('#myself_bar').html(htmlstr);
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
                        $('.myself_search .layui-btn').on('click', function(){
                            let type = $(this).data('type');
                            active[type] ? active[type].call(this) : '';
                        });
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

                        //监听头工具栏事件
                        table.on('toolbar(myself_table)', function(obj){
                            var checkStatus = table.checkStatus(obj.config.id)
                                ,data = checkStatus.data; //获取选中的数据
                            switch(obj.event){
                                case 'insert':
                                    let initAddForm = function(){
                                        //初始化业务数据编号
                                        let objCode = new Date().getTime();
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
                                                    'code': objCode
                                                    ,'userId':$.cookie('userId')
                                                    ,'userName':$.cookie('userName')
                                                });

                                                //监听表单提交
                                                form.on('submit(toSubmitEidtForm)', function(data){
                                                    $.post(requestUrl+'/jiaoXueTuanDui/insert.do' ,data.field ,function(result_data){
                                                        if(result_data.code == 200){
                                                            myself_table.reload();//重新加载表格数据
                                                        }
                                                        layer.msg(result_data.msg, { offset: '100px'}, function () {
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
                                            ,end:function () {
                                                window.location.reload();//刷新页面，清空上传弹窗上传的文件内容
                                            }
                                        });
                                    };
                                    //
                                    let idx = layer.confirm('请选择提交的材料?',{
                                        skin: 'confirm-btn-skin'
                                        ,btn: ['申报','年度报告']
                                        , btn1:function(){
                                            $('#shenbao').css('display','block');
                                            $('#zhengMingCaiLiao').css('display','block');
                                            initAddForm();
                                            layer.close(idx);
                                        }, btn2:function(){
                                            $('#zqbg').css('display','block');
                                            $('#zjbg').css('display','block');
                                            initAddForm();
                                            layer.close(idx);
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
                                    ,area : [ '1175px', '535px' ]
                                    ,offset : '10px'
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
                                        $('#shenbao').css('display','block');
                                        $('#zhengMingCaiLiao').css('display','block');
                                        $('#zqbg').css('display','block');
                                        $('#zjbg').css('display','block');
                                        //监听表单提交
                                        form.on('submit(toSubmitEidtForm)', function(data){
                                            $.post(requestUrl+'/jiaoXueTuanDui/update.do' ,data.field ,function(result_data){
                                                if(result_data.code == 200){
                                                    myself_table.reload();//重新加载表格数据
                                                }
                                                layer.msg(result_data.msg, { offset: '100px'}, function () {
                                                    layer.close(index);
                                                });
                                            },'json');
                                        });
                                    },end:function () {
                                        window.location.reload();//刷新页面，清空上传弹窗上传的文件内容
                                    }
                                });
                            } else if (obj.event === 'delete') {
                                if(data.isSubmit== '已提交'){
                                    return;
                                }
                                layer.confirm('删除后不可恢复，真的要删除么？', {icon: 3, title:'提示', offset: '100px'}, function(index) {
                                    $.post(requestUrl+'/jiaoXueTuanDui/delete.do', { "objCode": data.code},function(result_data){
                                        if(result_data.code == 200){
                                            myself_table.reload();//重新加载表格数据
                                        }
                                        layer.msg(result_data.msg, {time : 3000, offset: '100px'});
                                        layer.close(index);
                                    }, "json");
                                });
                            } else if (obj.event === 'middleResult') {
                                if(data.middleResult == '未评审'){
                                    return;
                                } else {
                                    layer.open({
                                        title : '教学研究-教学团队-中期考核结果'
                                        ,type : 1
                                        ,offset : '20px'
                                        ,shadeClose : true
                                        ,area : [ '1175px', '500px' ]
                                        ,content : $('#resultContainer')
                                        ,success: function(layero, index){
                                            $.get(requestUrl+'/jiaoXueTuanDui/getPingShenInfo.do',{
                                                'relationCode':data.code
                                                ,'batchNum':data.batchNum
                                                ,'pingshenType':'中期考核'
                                            },function (resultData) {
                                                if(resultData.code == 200){
                                                    // layer.alert(JSON.stringify(resultData.data));
                                                    if(resultData.data.length>0){
                                                        let htmlStr = '';
                                                        $.each(resultData.data,function (idx,obj) {
                                                            if(data.userId == $.cookie('userId')){
                                                                htmlStr += '<tr><td style="text-align: center">'+(idx+1)+'&nbsp;号评委</td>';
                                                            }else{
                                                                htmlStr += '<tr><td style="text-align: center">'+obj.userName+'</td>';
                                                            }
                                                            htmlStr += '<td style="text-align: center">'+obj.targetTeamBuildingPlan+'</td>' +
                                                                '<td style="text-align: center">'+obj.targetTeamCompose+'</td>' +
                                                                '<td style="text-align: center">'+obj.targetTeamLeader+'</td>' +
                                                                '<td style="text-align: center">'+obj.targetTeachingWork+'</td>' +
                                                                '<td style="text-align: center">'+obj.targetTeachingResearch+'</td>' +
                                                                '<td style="text-align: center">'+obj.targetInnovationAndEntrepre+'</td>' +
                                                                '<td style="text-align: center">'+obj.targetTeacherTraining+'</td>' +
                                                                '<td style="text-align: center">'+obj.totalScore+'</td>' +
                                                                '<td style="text-align: center">'+obj.pingshenOpinion+'</td></tr>\n';
                                                        });
                                                        $("#pingshenResult").html(htmlStr);
                                                    }
                                                }
                                            },'json');
                                        },end:function () {
                                            $("#pingshenResult").empty();
                                        }
                                    });
                                }
                            } else if (obj.event === 'finalResult') {
                                if(data.middleResult == '未评审'){
                                    return;
                                } else {
                                    layer.open({
                                        title : '教学研究-教学团队-最终考核结果'
                                        ,type : 1
                                        ,offset : '20px'
                                        ,shadeClose : true
                                        ,area : [ '1175px', '500px' ]
                                        ,content : $('#resultContainer')
                                        ,success: function(layero, index){
                                            $.get(requestUrl+'/jiaoXueTuanDui/getPingShenInfo.do',{
                                                'relationCode':data.code
                                                ,'batchNum':data.batchNum
                                                ,'pingshenType':'最终考核'
                                            },function (resultData) {
                                                if(resultData.code == 200){
                                                    // layer.alert(JSON.stringify(resultData.data));
                                                    if(resultData.data.length>0){
                                                        let htmlStr = '';
                                                        $.each(resultData.data,function (idx,obj) {
                                                            if(data.userId == $.cookie('userId')){
                                                                htmlStr += '<tr><td style="text-align: center">'+(idx+1)+'&nbsp;号评委</td>';
                                                            }else{
                                                                htmlStr += '<tr><td style="text-align: center">'+obj.userName+'</td>';
                                                            }
                                                            htmlStr += '<td style="text-align: center">'+obj.targetTeamBuildingPlan+'</td>' +
                                                                '<td style="text-align: center">'+obj.targetTeamCompose+'</td>' +
                                                                '<td style="text-align: center">'+obj.targetTeamLeader+'</td>' +
                                                                '<td style="text-align: center">'+obj.targetTeachingWork+'</td>' +
                                                                '<td style="text-align: center">'+obj.targetTeachingResearch+'</td>' +
                                                                '<td style="text-align: center">'+obj.targetInnovationAndEntrepre+'</td>' +
                                                                '<td style="text-align: center">'+obj.targetTeacherTraining+'</td>' +
                                                                '<td style="text-align: center">'+obj.totalScore+'</td>' +
                                                                '<td style="text-align: center">'+obj.pingshenOpinion+'</td></tr>\n';
                                                        });
                                                        $("#pingshenResult").html(htmlStr);
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

            if(data.isShenhe > 0){ //拥有审核权限
                let isPsAccount
                    , other_table = table.render({//数据表格
                    elem : '#other_table'
                    ,height : 440
                    ,id: "other_table_id"
                    ,url: requestUrl+'/jiaoXueTuanDui/getPageList.do'
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
                            "unShenHeNum": res.data.unShenHeNum,
                            'isPsAccount':res.data.isPsAccount
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
                        ,{field: 'registDate', title: '团队建立时间', width:150, sort:true}
                        ,{field: 'teamLeaderId', title: '负责人工号', width:150, sort:true, hide:true}
                        ,{field: 'teamLeader', title: '负责人', width:150, sort:true, event: 'teamLeader',style:'font-weight: bold; cursor: pointer;'}
                        ,{field: 'teamLeaderUnit', title: '负责人单位', width:150, sort:true, hide:true}
                        ,{field: 'sbs', title: '申报书', width:150, sort:true}
                        ,{field: 'middleReport', title: '中期报告', width:150, sort:true}
                        ,{field: 'middleResult', title: '中期考核结果', width:150, sort:true, event: 'middleResult',templet: function(data){
                                if(data.middleResult == '未评审'){
                                    return '<span style="font-weight: bold;">'+data.middleResult+'</span>';
                                }
                                return '<span style="font-weight: bold; cursor: pointer;">'+data.middleResult+'</span>';
                            }
                        }
                        ,{field: 'finalReport', title: '总结报告', width:150, sort:true}
                        ,{field: 'finalResult', title: '最终考核结果', width:150, sort:true, event: 'finalResult',templet: function(data){
                                if(data.finalResult == '未评审'){
                                    return '<span style="font-weight: bold;">'+data.finalResult+'</span>';
                                }
                                return '<span style="font-weight: bold; cursor: pointer;">'+data.finalResult+'</span>';
                            }
                        }
                        ,{field: 'shenheStatus', title: '审核状态', width:120, sort:true,templet: function(data){ // 函数返回一个参数 data，包含接口返回的所有字段和数据
                                let val = data.shenheStatus;
                                if(val=='已审核'){
                                    return '<span style="color: blue;font-weight: bold;">'+val+'</span>';
                                }
                                return '<span style="color: red;font-weight: bold;">'+val+'</span>';
                            }
                        }
                        ,{fixed: 'right', width:240, align:'center', toolbar: '#other_bar'} //这里的toolbar值是模板元素的选择器
                    ]]
                    ,done: function(res, curr, count){
                        isPsAccount = res.isPsAccount;
                        $('#other').find('span').html(res.unShenHeNum);

                        //监听搜索框事件
                        $('.other_search .layui-btn').on('click', function(){
                            let type = $(this).data('type');
                            active[type] ? active[type].call(this) : '';
                        });
                        let active = {
                            search: function(){
                                other_table.reload({
                                    where: {
                                        'teamName': $(".other_search input[name='teamName']").val()
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
                                $("#shenheStatus").val("");
                                form.render("select");
                            }
                        };

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
                                            ,msg='';
                                        $.each(data,function(idx,obj){
                                            if(obj.middleResult == '未填写' || obj.finalResult == '未填写' || obj.middleResult == '未评审' || obj.finalResult == '未评审'){
                                                flag = true;
                                                msg = '您选择了未评审的信息！';
                                                return false;
                                            } else if(obj.shenheStatus == '已审核'){
                                                flag = true;
                                                msg = '您选择了已审核的信息！';
                                                return false;//跳出循环
                                            }
                                        });
                                        if(flag){
                                            layer.msg(msg, {time : 3000, offset: '100px'});
                                            return;
                                        }
                                    }
                                    //添加审核意见
                                    layer.open({
                                        title : '教学研究-教学团队-审核'
                                        ,type : 1
                                        ,area : [ '700px', '450px' ]
                                        // ,area : '500px'//只想定义宽度时，你可以area: '500px'，高度仍然是自适应的
                                        ,offset : '10px' //只定义top坐标，水平保持居中
                                        ,shadeClose : true //点击遮罩关闭
                                        ,btn : ['关闭']
                                        ,content : $('#shenHeForm_container')
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
                                            form.on('submit(toSubmitShenHeForm)', function(formData){
                                                $.post(requestUrl+'/jiaoXueTuanDui/toShenhe.do',{
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
                            } else if (obj.event === 'detail_shenheProcess') {
                                detail_shenheProcess('教学研究-教学团队-查看审核流程',data);
                            }  else if (obj.event === 'teamLeader') {
                                layer.open({
                                    title : '教学研究-教学团队-团队负责人'
                                    ,type : 1
                                    ,offset : '20px'
                                    ,shadeClose : true
                                    ,area : [ '1175px', '500px' ]
                                    ,content : $('#teamLeaderContainer')
                                    ,success: function(layero, index){

                                    }
                                });
                            } else if (obj.event === 'middleResult') {
                                if(data.middleResult == '未评审'){
                                    return;
                                } else {
                                    if(isPsAccount == 1){
                                        data.pingshenType = '中期考核';
                                        pingshen('教学研究-教学团队-中期考核',data);
                                    }else{
                                        layer.open({
                                            title : '教学研究-教学团队-中期考核结果'
                                            ,type : 1
                                            ,offset : '20px'
                                            ,shadeClose : true
                                            ,area : [ '1175px', '500px' ]
                                            ,content : $('#resultContainer')
                                            ,success: function(layero, index){
                                                $.get(requestUrl+'/jiaoXueTuanDui/getPingShenInfo.do',{
                                                    'relationCode':data.code
                                                    ,'batchNum':data.batchNum
                                                    ,'pingshenType':'中期考核'
                                                },function (resultData) {
                                                    if(resultData.code == 200){
                                                        // layer.alert(JSON.stringify(resultData.data));
                                                        if(resultData.data.length>0){
                                                            let htmlStr = '';
                                                            $.each(resultData.data,function (idx,obj) {
                                                                if(data.userId == $.cookie('userId')){
                                                                    htmlStr += '<tr><td style="text-align: center">'+(idx+1)+'&nbsp;号评委</td>';
                                                                }else{
                                                                    htmlStr += '<tr><td style="text-align: center">'+obj.userName+'</td>';
                                                                }
                                                                htmlStr += '<td style="text-align: center">'+obj.targetTeamBuildingPlan+'</td>' +
                                                                    '<td style="text-align: center">'+obj.targetTeamCompose+'</td>' +
                                                                    '<td style="text-align: center">'+obj.targetTeamLeader+'</td>' +
                                                                    '<td style="text-align: center">'+obj.targetTeachingWork+'</td>' +
                                                                    '<td style="text-align: center">'+obj.targetTeachingResearch+'</td>' +
                                                                    '<td style="text-align: center">'+obj.targetInnovationAndEntrepre+'</td>' +
                                                                    '<td style="text-align: center">'+obj.targetTeacherTraining+'</td>' +
                                                                    '<td style="text-align: center">'+obj.totalScore+'</td>' +
                                                                    '<td style="text-align: center">'+obj.pingshenOpinion+'</td></tr>\n';
                                                            });
                                                            $("#pingshenResult").html(htmlStr);
                                                        }
                                                    }
                                                },'json');
                                            },end:function () {
                                                $("#pingshenResult").empty();
                                            }
                                        });
                                    }

                                }
                            } else if (obj.event === 'finalResult') {
                                if(data.middleResult == '未评审'){
                                    return;
                                } else {
                                    if(isPsAccount == 1){
                                        data.pingshenType = '最终考核';
                                        pingshen('教学研究-教学团队-最终考核',data);
                                    }else{
                                        layer.open({
                                            title : '教学研究-教学团队-最终考核结果'
                                            ,type : 1
                                            ,offset : '20px'
                                            ,shadeClose : true
                                            ,area : [ '1175px', '500px' ]
                                            ,content : $('#resultContainer')
                                            ,success: function(layero, index){
                                                $.get(requestUrl+'/jiaoXueTuanDui/getPingShenInfo.do',{
                                                    'relationCode':data.code
                                                    ,'batchNum':data.batchNum
                                                    ,'pingshenType':'最终考核'
                                                },function (resultData) {
                                                    if(resultData.code == 200){
                                                        // layer.alert(JSON.stringify(resultData.data));
                                                        if(resultData.data.length>0){
                                                            let htmlStr = '';
                                                            $.each(resultData.data,function (idx,obj) {
                                                                if(data.userId == $.cookie('userId')){
                                                                    htmlStr += '<tr><td style="text-align: center">'+(idx+1)+'&nbsp;号评委</td>';
                                                                }else{
                                                                    htmlStr += '<tr><td style="text-align: center">'+obj.userName+'</td>';
                                                                }
                                                                htmlStr += '<td style="text-align: center">'+obj.targetTeamBuildingPlan+'</td>' +
                                                                    '<td style="text-align: center">'+obj.targetTeamCompose+'</td>' +
                                                                    '<td style="text-align: center">'+obj.targetTeamLeader+'</td>' +
                                                                    '<td style="text-align: center">'+obj.targetTeachingWork+'</td>' +
                                                                    '<td style="text-align: center">'+obj.targetTeachingResearch+'</td>' +
                                                                    '<td style="text-align: center">'+obj.targetInnovationAndEntrepre+'</td>' +
                                                                    '<td style="text-align: center">'+obj.targetTeacherTraining+'</td>' +
                                                                    '<td style="text-align: center">'+obj.totalScore+'</td>' +
                                                                    '<td style="text-align: center">'+obj.pingshenOpinion+'</td></tr>\n';
                                                            });
                                                            $("#pingshenResult").html(htmlStr);
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

            let initEditForm = function(data){
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
                    ,"teamLeader" : data.teamLeader
                    ,"teamLeaderId" : data.teamLeaderId
                    ,"teamLeaderUnit" : data.teamLeaderUnit
                    ,"sbs" : data.sbs
                    ,"middleReport" : data.middleReport
                    ,"finalReport" : data.finalReport
                    ,"userId":data.userId
                    ,"userName":data.userName
                });

                //参与人员列表
                initMemberDataTable(data.code);

                //上传证明材料
                //
                let upfileList = $('#upfileList');
                $.get(requestUrl+"/getFileListByRelationCode.do" , {
                    "relationCode": data.code
                } ,  function(data){
                    if(data.data.length > 0){
                        //
                        upfileList.empty();
                        //
                        $.each(data.data,function(index,fileInfo){
                            let tr = $(['<tr id="'+ fileInfo.code +'">'
                                ,'<td style="text-align: center;">	<a href="javascript:void(0)">'+ fileInfo.fileName +'</a></td>'
                                ,'<td style="text-align: center;">已上传</td>'
                                ,'<td style="text-align: center;">' +
                                '   <button class="layui-btn layui-btn-xs layui-btn-normal upfile_preview">预览</button>' +
                                '   <button class="layui-btn layui-btn-xs layui-btn-danger upfile_delete">删除</button>' +
                                '</td>'
                                ,'</tr>'].join(''));
                            upfileList.append(tr);
                            //预览
                            tr.find('a').on('click', function(){//点击文件名
                                previewFileInfo(fileInfo);
                            });
                            tr.find('.upfile_preview').on('click', function(){//点击预览按钮
                                previewFileInfo(fileInfo);
                            });
                            //删除
                            tr.find('.upfile_delete').on('click', function(){
                                $.post(requestUrl+"/deleteFileInfo.do" , {
                                    "code": tr.attr("id")
                                } ,  function(data){
                                    tr.remove();
                                }, "json");
                            });
                        });
                    }
                }, "json");
                //执行上传操作
                let upfileIns = upload.render({
                    elem: $('#upfileIns')
                    ,url: requestUrl+'/uploadFileInfo.do'
                    ,data:{
                        "relationCode": data.code
                        ,"fileCategory":"JXYJ_JXTD" // 固定值
                        ,"fileType":"证明材料" // 固定值
                        ,"userId":data.userId
                        ,"userName":data.userName
                    }
                    ,field:"file" //设定文件域的字段名
                    // ,multiple: true // 	是否允许多文件上传
                    ,accept: 'file'//指定允许上传时校验的文件类型，可选值有：file（所有文件）、images（图片）、video（视频）、audio（音频）
                    ,exts:'pdf'
                    ,choose: function(obj){
                        $('#noData').empty();
                        let files = this.files = obj.pushFile(); //将每次选择的文件追加到文件队列
                        //读取本地文件
                        obj.preview(function(index, file, result){
                            let tr = $(['<tr id="upfile_'+ index +'">'
                                ,'<td style="text-align: center;">	<a href="javascript:void(0)">'+ file.name +'</a></td>'
                                ,'<td style="text-align: center;">正在上传</td>'
                                ,'<td style="text-align: center;">'
                                // ,'<button class="layui-btn layui-btn-xs demo-reload layui-hide">重传</button>'
                                ,'<button class="layui-btn layui-btn-xs layui-btn-normal upfile_preview">预览</button>' +
                                '<button class="layui-btn layui-btn-xs layui-btn-danger upfile_delete">删除</button>'
                                ,'</td>'
                                ,'</tr>'].join(''));
                            upfileList.append(tr);

                            //删除
                            tr.find('.upfile_delete').on('click', function(){
                                $.post(requestUrl+"/deleteFileInfo.do" , {
                                    "code": $('#upfile_'+index).attr("data-id")
                                } ,  function(data){
                                    // layer.msg(data.msg);
                                    delete files[index]; //删除对应的文件
                                    tr.remove();
                                    upfileIns.config.elem.next()[0].value = ''; //清空 input file 值，以免删除后出现同名文件不可选
                                }, "json");
                            });
                        });
                    }
                    ,done: function(res, index, upload){
                        if(res.code == 200){ //上传成功
                            let tr =  upfileList.find('tr#upfile_'+ index)
                                ,tds = tr.children();
                            tr.attr("data-id",res.data.code);//
                            tds.eq(1).html('<span style="color: #5FB878;">已上传</span>');
                            // tds.eq(2).html(''); //清空操作

                            //预览
                            let fileInfo = res.data;
                            tr.find('a').on('click', function(){//点击文件名
                                previewFileInfo(fileInfo);
                            });
                            tr.find('.upfile_preview').on('click', function(){//点击预览按钮
                                previewFileInfo(fileInfo);
                            });
                            //
                            return delete this.files[index]; //删除文件队列已经上传成功的文件
                        }
                        this.error(index, upload);
                    }
                    ,error: function(index, upload){
                        let tr =  upfileList.find('tr#upfile_'+ index)
                            ,tds = tr.children();
                        tds.eq(1).html('<span style="color: #FF5722;">上传失败</span>');
                    }
                });
            };

            /**
             * 初始化项目成员列表
             * @param xmCode 项目编号
             */
            let initMemberDataTable = function (relationCode) {

                let teacher_datatable = table.render({
                    id: "teacher_datatable"
                    ,elem : '#teacher_datatable'
                    ,url: requestUrl+'/scjx/getTeacherInfo.do'
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
                                title : '项目成员信息'
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
                                        $.post(requestUrl+'/scjx/addTeacherInfo.do', form_data, function (result_data) {
                                            if(result_data.code == 200){
                                                teacher_datatable.reload();//重新加载数据
                                            }
                                            layer.msg(result_data.msg, { offset: '100px'});
                                            layer.close(index);
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
                                $.post(parent.requestUrl+'/scjx/delTeacherInfo.do', {
                                    "relationCode": obj.data.relationCode
                                    ,"teacherCode": obj.data.teacherCode
                                },function(result_data){
                                    if(result_data.code === 200){
                                        teacher_datatable.reload();//重新加载表格数据
                                    }
                                    layer.msg(result_data.msg, { offset: '100px'});
                                }, "json");
                            }
                        });
                    }
                });
            };

            let pingshen = function (title,row_data) {
                layer.open({
                    title : title
                    ,type : 1
                    ,offset : '20px'
                    ,shadeClose : true
                    ,area : [ '1175px', '500px' ]
                    ,content : $('#pingshenContainer')
                    ,success: function(layero, index){
                        $.get(requestUrl+'/jiaoXueTuanDui/getPingShenTemplate.do',{},function (resultData) {
                            if(resultData.code == 200){
                                //
                                let htmlStr = '';
                                $.each(resultData.data,function (idx,obj) {
                                    htmlStr += '<tr><td style="text-align: center">'+obj.targetName+'</td>' +
                                        '       <td style="text-align: center">'+obj.targetElement+'</td>' +
                                        '       <td>'+obj.targetContent+'</td>' +
                                        '       <td style="text-align: center">'+obj.targetScore+'</td>' +
                                        '       <td style="text-align: center"><input type="text" name="'+obj.target+'" required  lay-verify="required" autocomplete="off" class="layui-input score"></td></tr>\n';
                                });
                                htmlStr += '<tr><td colspan="3">总分</td>' +
                                    '<td style="text-align: center">100</td>' +
                                    '<td style="text-align: center"><input type="text" name="totalScore" class="layui-input" style="cursor:not-allowed" disabled></td></tr>';
                                htmlStr += '<tr><td colspan="5"><textarea name="pingshenOpinion" placeholder="评审意见：（不少于100字）" class="layui-textarea"></textarea></td></tr>';
                                $('#pingshenContent').html(htmlStr);
                                //
                                if(row_data.middleResult == '已填写'){
                                    $.get(requestUrl+'/jiaoXueTuanDui/getPingShenInfo.do',{
                                        'relationCode':row_data.code
                                        ,'batchNum':row_data.batchNum
                                        ,'pingshenType':row_data.pingshenType
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
                                /* $("input[name='targetTeacherTraining']").keyup(function() {
                                     $("input[name='totalScore']").val($(this).val());
                                 });*/
                                let $inputs = $('.score');
                                $inputs.keyup(function() {
                                    let totalScore = 0;
                                    $inputs.each(function(){
                                        totalScore += (1*$(this).val());
                                        $("input[name='totalScore']").val(totalScore);
                                    });
                                });
                                //
                                //监听表单提交
                                form.on('submit(pingshenFormSubmitBtn)', function(form_data){
                                    /*layer.alert(JSON.stringify(data.field), {
                                        title: '最终的提交信息'
                                    });
                                    return false;*/
                                    $.post(requestUrl+'/jiaoXueTuanDui/insertPingShenInfo.do',{
                                        "relationCode":row_data.code
                                        ,"batchNum": row_data.batchNum
                                        ,"pingshenType" : row_data.pingshenType
                                        ,"teamName" : row_data.teamName
                                        ,"teamLeader" : row_data.teamLeader
                                        ,"teamLeaderId" : row_data.teamLeaderId
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
                                        if(result_data.code == 200){
                                            layer.msg('保存成功', {time : 3000, offset: '100px'});
                                        }else{
                                            layer.msg('保存失败', {time : 3000, offset: '100px'});
                                        }
                                    },'json');
                                });
                            }
                        },'json');
                    },end:function () {
                        $("#pingshenContent").empty();
                    }
                });
            }

            //查看详情
            let detail_dataInfo = function (rowData) {
                layer.open({
                    title : '教学研究-教改项目-查看详情'
                    ,type : 1
                    ,area : [ '1175px', '535px' ]
                    ,offset : '10px' //只定义top坐标，水平保持居中
                    ,shadeClose : true //点击遮罩关闭
                    ,btn : ['关闭']
                    ,content : $('#dataInfo_container')
                    ,success: function(layero, index){
                        let htmlStr = '';
                        htmlStr += '<fieldset class="layui-elem-field" style="margin-top: 10px;" >' +
                            '       <legend>团队基本信息</legend>\n' +
                            '       <table class="layui-table">\n' +
                            '           <tbody>\n' +
                            '               <tr>' +
                            '                   <td style="width: 100px; text-align: right">团队名称：</td><td>'+rowData.teamName+'</td>' +
                            '               </tr>\n' +
                            '               <tr>' +
                            '                    <td style="width: 100px; text-align: right">建立时间：</td><td>'+rowData.registDate+'</td>' +
                            '               </tr>\n' +
                            '           </tbody>\n' +
                            '       </table>' +
                            '   </fieldset>';
                        htmlStr += '<fieldset class="layui-elem-field" style="margin-top: 10px;" >' +
                            '       <legend>团队负责人信息</legend>\n' +
                            '       <table class="layui-table">\n' +
                            '           <tbody>\n' +
                            '               <tr>' +
                            '                   <td style="width: 100px; text-align: right">工号：</td><td>'+rowData.teamLeaderId+'</td>' +
                            '               </tr>\n' +
                            '               <tr>' +
                            '                   <td style="width: 100px; text-align: right">姓名：</td><td>'+rowData.teamLeader+'</td>' +
                            '               </tr>\n' +
                            '           </tbody>\n' +
                            '       </table>' +
                            '   </fieldset>';
                        htmlStr += '<fieldset class="layui-elem-field" style="margin-top: 10px;" >' +
                            '       <legend>团队成员信息</legend>\n' +
                            '       <table class="layui-table">\n' +
                            '           <tbody>' +
                            '               <tr>\n' +
                            '                      <th style="width: 100px; text-align: right" rowspan="'+(rowData.memberList.length>0?rowData.memberList.length+1:2)+'">成员信息：</th>' +
                            '                      <th style="width: 250px; text-align: center">序号</th>\n' +
                            '                      <th style="width: 350px; text-align: center">工号</th>\n' +
                            '                      <th style="width: 350px; text-align: center">姓名</th>\n' +
                            '                 </tr>';
                        if(rowData.memberList.length>0){
                            layui.each(rowData.memberList,function (idx,obj) {
                                htmlStr += '<tr><td style="text-align: center">'+(idx+1)
                                    +'</td><td style="text-align: center">'+obj.USER_ID
                                    +'</td><td style="text-align: center">'+obj.USER_NAME
                                    +'</td></tr>\n';
                            });
                        }else{
                            htmlStr += '<tr>' +
                                '      <td style="text-align: center" colspan="4">暂无相关数据</td>' +
                                '  </tr>\n';
                        }
                        htmlStr +='</tbody>\n' +
                            '   </table>' +
                            '</fieldset>';
                        htmlStr += '<fieldset class="layui-elem-field" style="margin-top: 10px;" >' +
                            '       <table class="layui-table">\n' +
                            '           <tbody>\n' +
                            '               <tr>' +
                            '                   <td style="width: 100px; text-align: right">申报书：</td><td>'+rowData.sbs+'</td>' +
                            '               </tr>\n' +
                            '           </tbody>\n' +
                            '       </table>' +
                            '   </fieldset>';
                        htmlStr += '<fieldset class="layui-elem-field" style="margin-top: 10px;" >' +
                            '       <table class="layui-table">\n' +
                            '           <tbody>\n' +
                            '               <tr>' +
                            '                   <td style="width: 100px; text-align: right">中期报告：</td><td>'+rowData.middleReport+'</td>' +
                            '               </tr>\n' +
                            '           </tbody>\n' +
                            '       </table>' +
                            '   </fieldset>';
                        htmlStr += '<fieldset class="layui-elem-field" style="margin-top: 10px;" >' +
                            '       <table class="layui-table">\n' +
                            '           <tbody>\n' +
                            '               <tr>' +
                            '                   <td style="width: 100px; text-align: right">总结报告：</td><td>'+rowData.finalReport+'</td>' +
                            '               </tr>\n' +
                            '           </tbody>\n' +
                            '       </table>' +
                            '   </fieldset>';
                        $("#dataInfo_container").html(htmlStr);
                    }
                    ,end:function () {
                        $("#dataInfo_container .layui-elem-field").empty();
                    }
                });
            };

        }
        ,error:function() {
            layer.msg('网络连接失败', {icon:7, time : 3000, offset: '100px'});
        }
    });
});
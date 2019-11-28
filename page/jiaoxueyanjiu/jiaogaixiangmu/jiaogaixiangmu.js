/*
教学研究-教改项目
 */
layui.use(['layer','element','table','form'], function(){
    var $ = layui.$,layer = layui.layer,element = layui.element,table = layui.table,form = layui.form;

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
                $('#other').removeClass();
                $('#other_item').css('class','layui-tab-item');
                //数据表格
                let myself_table = table.render({
                    elem : '#myself_table'
                    ,height : 440
                    ,url: requestUrl+'/jiaoGaiXiangMu/getPageList.do'
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
                        ,first: true //不显示首页
                        ,last: true //不显示尾页
                    }
                    ,limit: 10
                    ,even: true //隔行背景
                    ,toolbar: '#myself_toolbar' //指向自定义工具栏模板选择器
                    ,cols : [[ //表头
                        {type:'checkbox', fixed: 'left'}
                        ,{type:'numbers', title:'序号', width:80, fixed: 'left'}
                        ,{field: 'xmName', title: '项目名称', width:120}
                        ,{field: 'xmType', title: '项目类型', width:120}
                        ,{field: 'leader', title: '主持人', width:120}
                        ,{field: 'leaderId', title: '主持人工号', width:120,hide:true}
                        ,{field: 'title', title: '职称', width:120}
                        ,{field: 'collegeOrDept', title: '学院（部门）', width:120}
                        ,{field: 'major', title: '专业', width:120,hide:true}
                        ,{field: 'mainTeachWork', title: '主要教学工作简历', width:120,hide:true}
                        ,{field: 'mainTeachAchievement', title: '主要教育教学研究领域及成果', width:120,hide:true}
                        ,{field: 'currentAndBackground', title: '现状与背景分析（包括已有研究实践基础）', width:120,hide:true}
                        ,{field: 'questionAndTarget', title: '研究内容、目标、要解决的问题和主要特色', width:120,hide:true}
                        ,{field: 'expectAndResult', title: '预期效果与具体成果', width:120,hide:true}
                        ,{field: 'planAndProcess', title: '具体安排及进度', width:120,hide:true}
                        ,{field: 'fundBudgetEstimate', title: '经费概算', width:120,hide:true}
                        ,{field: 'createDate', title: '创建时间', width:120,hide:true}
                        ,{field: 'isSubmit', title: '提交状态', width:120,templet: function(data){ // 函数返回一个参数 data，包含接口返回的所有字段和数据
                                var val = data.isSubmit;
                                if(val=='已提交'){
                                    var htmlstr = ' <a class="layui-btn layui-btn-primary layui-btn-xs" lay-event="detail">查看信息</a>\n' +
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
                                    '                    <a class="layui-btn layui-btn-disabled layui-btn-xs" lay-event="detail-shenheProcess">查看流程</a>\n' +
                                    '                    <a class="layui-btn layui-btn-warm layui-btn-xs" lay-event="update">编辑</a>\n' +
                                    '                    <a class="layui-btn layui-btn-danger layui-btn-xs" lay-event="delete">删除</a>';
                                $('#myself_bar').html(htmlstr);
                                return '<span style="font-weight: bold;">'+val+'</span>';
                            }
                        }
                        ,{field: 'status', title: '审核状态', width:120,templet: function(data){ // 函数返回一个参数 data，包含接口返回的所有字段和数据
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
                                'xmName': $("input[name='myself_search_xmName']").val()
                                ,'xmType': $("input[ name='myself_search_xmType']").val()
                                ,'leader': $("input[ name='myself_search_leader']").val()
                                ,'isSubmit': $("input[ name='myself_search_isSubmit']").val()
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
                            //清空表单数据
                            document.getElementById("editForm").reset();
                            //每次进入新增页面生成一个新的编号
                            let xmCode = new Date().getTime();
                            $(" input[ name='code' ] ").val(xmCode);
                            //
                            layer.open({
                                title : '教学研究-教改项目-新增'
                                ,type : 1
                                ,area : [ '1175px', '535px' ]
                                ,offset : '10px'
                                // ,shadeClose : true //禁用点击遮罩关闭弹窗
                                ,content : $('#editForm')
                                ,success: function(layero, index){
                                    let ue_mainTeachWork = UE.getEditor("mainTeachWork") //主要教学工作简历
                                        ,ue_mainTeachAchievement = UE.getEditor("mainTeachAchievement") //主要教育教学研究领域及成果
                                        ,ue_currentAndBackground = UE.getEditor("currentAndBackground") //现状与背景分析（包括已有研究实践基础）
                                        ,ue_questionAndTarget = UE.getEditor("questionAndTarget") //研究内容、目标、要解决的问题和主要特色
                                        ,ue_expectAndResult = UE.getEditor("expectAndResult") //预期效果与具体成果
                                        ,ue_planAndProcess = UE.getEditor("planAndProcess") //具体安排及进度
                                        ,ue_fundBudgetEstimate = UE.getEditor("fundBudgetEstimate"); //经费概算
                                    initMemberDataTable(xmCode);//主要成员情况
                                    initFundBudgetDataTable(xmCode);//经费预算
                                    //监听表单提交
                                    form.on('submit(editFormSubmitBtn)', function(data){
                                        $.post(requestUrl+'/jiaoGaiXiangMu/insert.do',{
                                            "code":data.field.code
                                            ,"xmName": data.field.xmName
                                            ,"xmType" : data.field.xmType
                                            ,"leader" : data.field.leader
                                            ,"leaderId" : data.field.leaderId
                                            ,"title" : data.field.title
                                            ,"collegeOrDept" : data.field.collegeOrDept
                                            ,"major" : data.field.major
                                            ,"mainTeachWork" : data.field.mainTeachWork
                                            ,"mainTeachAchievement" : data.field.mainTeachAchievement
                                            ,"currentAndBackground" : data.field.currentAndBackground
                                            ,"questionAndTarget" : data.field.questionAndTarget
                                            ,"expectAndResult" : data.field.expectAndResult
                                            ,"planAndProcess" : data.field.planAndProcess
                                            ,"fundBudgetEstimate" : data.field.fundBudgetEstimate
                                            ,"userId":function () {
                                                return $.cookie('userId');
                                            }
                                            ,"userName":function () {
                                                return $.cookie('userName');
                                            }
                                        },function(resultData){
                                            if(resultData.code == 200){
                                                myself_table.reload();//重新加载表格数据
                                                layer.msg('添加成功', {time : 3000, offset: '100px'});
                                            }else{
                                                layer.msg('添加失败', {time : 3000, offset: '100px'});
                                            }
                                        },'json');
                                    });
                                }
                                ,cancel: function(index, layero){
                                    layer.confirm('填写的信息将会清空，确定要关闭吗', {icon: 3, title:'提示', offset: '100px'}, function() {
                                        layer.close(index);
                                    });
                                    return false;
                                }
                                ,end:function () {
                                    window.location.reload();//刷新页面
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
                                    let isSubmit = false;
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
                                    $.post(requestUrl+'/jiaoGaiXiangMu/toSubimt.do',{
                                        "menuId":$.cookie('currentMenuId'),
                                        "jsonStr":JSON.stringify(data)
                                    },function (resultData) {
                                        if(resultData.code === 200){
                                            myself_table.reload();//重新加载表格数据
                                        }
                                        layer.msg(resultData.msg, {time : 3000, offset: '100px'});
                                    },'json');
                                });
                            }
                            break;
                    }
                });

                //监听工具条
                table.on('tool(myself_table)', function(obj){
                    let rowData = obj.data;
                    if (obj.event === 'detail') {
                        detail(rowData);
                    } else if (obj.event === 'detail-shenheProcess') {
                        if(rowData.isSubmit=='未提交'){
                            return;
                        }
                        detail_shenheProcess(rowData);
                    } else if (obj.event === 'update') {
                        if(rowData.isSubmit== '已提交' &&  rowData.status != '退回'){
                            return;
                        }
                        //执行编辑
                        layer.open({
                            title : '教学研究-教改项目-编辑'
                            ,type : 1
                            ,area : [ '1175px', '535px' ]
                            ,offset : '10px'
                            ,shadeClose : true //禁用点击遮罩关闭弹窗
                            ,content : $('#editForm')
                            ,success: function(layero, index){
                                let ue_mainTeachWork = UE.getEditor("mainTeachWork") //主要教学工作简历
                                    ,ue_mainTeachAchievement = UE.getEditor("mainTeachAchievement") //主要教育教学研究领域及成果
                                    ,ue_currentAndBackground = UE.getEditor("currentAndBackground") //现状与背景分析（包括已有研究实践基础）
                                    ,ue_questionAndTarget = UE.getEditor("questionAndTarget") //研究内容、目标、要解决的问题和主要特色
                                    ,ue_expectAndResult = UE.getEditor("expectAndResult") //预期效果与具体成果
                                    ,ue_planAndProcess = UE.getEditor("planAndProcess") //具体安排及进度
                                    ,ue_fundBudgetEstimate = UE.getEditor("fundBudgetEstimate"); //经费概算
                                //填充数据
                                ue_mainTeachWork.ready(function () {
                                    ue_mainTeachWork.setContent(rowData.mainTeachWork);
                                });
                                ue_mainTeachAchievement.ready(function () {
                                    ue_mainTeachAchievement.setContent(rowData.mainTeachAchievement);
                                });
                                ue_currentAndBackground.ready(function () {
                                    ue_currentAndBackground.setContent(rowData.currentAndBackground);
                                });
                                ue_questionAndTarget.ready(function () {
                                    ue_questionAndTarget.setContent(rowData.questionAndTarget);
                                });
                                ue_expectAndResult.ready(function () {
                                    ue_expectAndResult.setContent(rowData.expectAndResult);
                                });
                                ue_planAndProcess.ready(function () {
                                    ue_planAndProcess.setContent(rowData.planAndProcess);
                                });
                                ue_fundBudgetEstimate.ready(function () {
                                    ue_fundBudgetEstimate.setContent(rowData.fundBudgetEstimate);
                                });
                                //
                                initMemberDataTable(rowData.code);//主要成员情况
                                initFundBudgetDataTable(rowData.code);//经费预算
                                //填充表单数据
                                form.val("editForm",{
                                    "code":rowData.code
                                    ,"xmName": rowData.xmName
                                    ,"xmType" : rowData.xmType
                                    ,"leader" : rowData.leader
                                    ,"leaderId" : rowData.leaderId
                                    ,"title" : rowData.title
                                    ,"collegeOrDept" : rowData.collegeOrDept
                                    ,"major" : rowData.major
                                    ,"userId":rowData.userId
                                    ,"userName":rowData.userName
                                });
                                //监听表单提交
                                form.on('submit(editFormSubmitBtn)', function(data){
                                    $.post(requestUrl+'/jiaoGaiXiangMu/update.do',{
                                        "code":data.field.code
                                        ,"xmName": data.field.xmName
                                        ,"xmType" : data.field.xmType
                                        ,"leader" : data.field.leader
                                        ,"leaderId" : data.field.leaderId
                                        ,"title" : data.field.title
                                        ,"collegeOrDept" : data.field.collegeOrDept
                                        ,"major" : data.field.major
                                        ,"mainTeachWork" : data.field.mainTeachWork
                                        ,"mainTeachAchievement" : data.field.mainTeachAchievement
                                        ,"currentAndBackground" : data.field.currentAndBackground
                                        ,"questionAndTarget" : data.field.questionAndTarget
                                        ,"expectAndResult" : data.field.expectAndResult
                                        ,"planAndProcess" : data.field.planAndProcess
                                        ,"fundBudgetEstimate" : data.field.fundBudgetEstimate
                                        ,"userId":function () {
                                            return $.cookie('userId');
                                        }
                                        ,"userName":function () {
                                            return $.cookie('userName');
                                        }
                                    },function(resultData){
                                        if(resultData.code == 200){
                                            myself_table.reload();//重新加载表格数据
                                            layer.msg('修改成功', {time : 3000, offset: '100px'});
                                        }else{
                                            layer.msg('修改失败', {time : 3000, offset: '100px'});
                                        }
                                    },'json');
                                });
                            },end:function () {
                                window.location.reload();//刷新页面
                            }
                        });
                    } else if (obj.event === 'delete') {
                        if(rowData.isSubmit== '已提交' &&  rowData.status != '退回'){
                            return;
                        }
                        layer.confirm('删除后不可恢复，真的要删除么？', {icon: 3, title:'提示', offset: '100px'}, function(index) {
                            layer.close(index);
                            $.post(requestUrl+'/jiaoGaiXiangMu/delete.do', { code: rowData.code},function(resultData){
                                if(resultData.code === 200){
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
                var other_table = table.render({//数据表格
                    elem : '#other_table'
                    ,height : 440
                    ,id: "other_table_id"
                    ,url: requestUrl+'/jiaoGaiXiangMu/getPageList.do'
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
                        ,{field: 'userId', title: '工号', width:120, sort: true}
                        ,{field: 'userName', title: '姓名', width:120}
                        ,{field: 'xmName', title: '项目名称', width:120}
                        ,{field: 'xmType', title: '项目类型', width:120}
                        ,{field: 'leader', title: '主持人', width:120}
                        ,{field: 'leaderId', title: '主持人工号', width:120}
                        ,{field: 'title', title: '职称', width:120}
                        ,{field: 'collegeOrDept', title: '学院（部门）', width:120,hide:true}
                        ,{field: 'major', title: '专业', width:120,hide:true}
                        ,{field: 'mainTeachWork', title: '主要教学工作简历', width:120,hide:true}
                        ,{field: 'mainTeachAchievement', title: '主要教育教学研究领域及成果', width:120,hide:true}
                        ,{field: 'currentAndBackground', title: '现状与背景分析（包括已有研究实践基础）', width:120,hide:true}
                        ,{field: 'questionAndTarget', title: '研究内容、目标、要解决的问题和主要特色', width:120,hide:true}
                        ,{field: 'expectAndResult', title: '预期效果与具体成果', width:120,hide:true}
                        ,{field: 'planAndProcess', title: '具体安排及进度', width:120,hide:true}
                        ,{field: 'fundBudgetEstimate', title: '经费概算', width:120,hide:true}
                        ,{field: 'createDate', title: '创建时间', width:120,hide:true}
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
                                'userId': $(" input[ name='other_search_userId' ] ").val()
                                ,'userName': $(" input[ name='other_search_userName' ] ").val()
                                , 'xmName': $("input[name='other_search_xmName']").val()
                                ,'xmType': $("input[ name='other_search_xmType']").val()
                                ,'leader': $("input[ name='other_search_leader']").val()
                                ,'shenheStatus': $(" input[ name='other_search_shenheStatus' ] ").val()
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
                                    title : '教学研究-教改项目-审核'
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
                                            $.post(requestUrl+'/jiaoGaiXiangMu/toShenhe.do',{
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
                        detail_shenheProcess(data);
                    }
                });
            } else{
                $('#other').remove();
                $('#other_item').remove();
            }

            /**
             * 初始化成员列表
             * @param xmCode 项目编号
             */
            let initMemberDataTable = function (xmCode) {
                let memberDataTable = table.render({
                    elem : '#memberDataTable'
                    ,url: requestUrl+'/jiaoGaiXiangMu/getMemberList.do'
                    ,where: {
                        "xmCode":xmCode
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
                    ,toolbar: '#dataTable_toolbar' //指向自定义工具栏模板选择器
                    ,defaultToolbar:[]
                    ,cols : [[ //表头
                        {type:'numbers', title:'序号', width:100, fixed: 'left'}
                        // ,{field: 'xmCode', title: '项目编号', width:200, align:'center'}
                        ,{field: 'userName', title: '姓名', width:200, align:'center'}
                        ,{field: 'userId', title: '工号', width:200, align:'center'}
                        ,{field: 'task', title: '任务分工', align:'center'}
                        ,{fixed: 'right', title: '操作', width:120, align:'center', toolbar: '#dataTable_bar'}
                    ]]
                    ,text: {
                        none: '暂无相关数据' //默认：无数据。注：该属性为 layui 2.2.5 开始新增
                    }
                    ,even: true //隔行背景
                    ,done : function(res, curr, count) {

                        //监听头工具栏事件
                        table.on('toolbar(memberDataTable)', function(obj){
                            let memberFormCntainer = layer.open({
                                title : '项目主要参加人员'
                                ,type : 1
                                ,area : [ '700px', '350px' ] //宽高
                                ,offset : '30px'
                                ,content : $('#memberForm')
                                ,success: function(layero, index){
                                    //监听表单提交
                                    form.on('submit(memberFormSubmitBtn)', function(data){
                                        let formData = data.field;
                                        $.post(requestUrl+'/jiaoGaiXiangMu/insertMember.do',{
                                            "xmCode":xmCode,
                                            "userName":formData.userName,
                                            "userId":formData.userId,
                                            "task":formData.task
                                        },function (resultData) {
                                            if(resultData.code == 200){
                                                memberDataTable.reload();//重新加载数据
                                                layer.msg('添加成功', {time : 3000, offset: '100px'});
                                            }else{
                                                layer.msg('添加失败', {time : 3000, offset: '100px'});
                                            }
                                        },'json');
                                        layer.close(memberFormCntainer);
                                        return false;
                                    });
                                },end:function () {
                                    document.getElementById("memberForm").reset(); //清空表单数据
                                }
                            });
                        });

                        //监听右侧工具条
                        table.on('tool(memberDataTable)', function(obj){
                            let rowData = obj.data;
                            if (obj.event === 'delete') {
                                //执行删除
                                $.post(requestUrl+'/jiaoGaiXiangMu/deleteMember.do'
                                    , {
                                        "xmCode": rowData.xmCode
                                        ,"userId": rowData.userId
                                    }
                                    ,function(resultData){
                                    if(resultData.code === 200){
                                        memberDataTable.reload();//重新加载表格数据
                                        layer.msg('删除成功', {time : 3000, offset: '100px'});
                                    }else{
                                        layer.msg('删除失败', {time : 3000, offset: '100px'});
                                    }
                                }, "json");
                            }
                        });
                    }
                });
            };

            /**
             * 初始化预算列表
             * @param xmCode 项目编号
             */
            let initFundBudgetDataTable = function (xmCode) {
                let fundBudgetDataTable = table.render({
                    elem : '#fundBudgetDataTable'
                    ,url: requestUrl+'/jiaoGaiXiangMu/getFundBudgetList.do'
                    ,where: {
                        "xmCode":xmCode
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
                    ,toolbar: '#dataTable_toolbar' //指向自定义工具栏模板选择器
                    ,defaultToolbar:[]
                    ,cols : [[ //表头
                        {type:'numbers', title:'序号', width:100, fixed: 'left'}
                        // ,{field: 'xmCode', title: '项目编号', width:200, align:'center'}
                        ,{field: 'subject', title: '科目', align:'center'}
                        ,{field: 'budgetAmount', title: '预算金额（元）', width:200, align:'center'}
                        ,{fixed: 'right', title: '操作', width:120, align:'center', toolbar: '#dataTable_bar'}
                    ]]
                    ,text: {
                        none: '暂无相关数据' //默认：无数据。注：该属性为 layui 2.2.5 开始新增
                    }
                    ,even: true //隔行背景
                    ,done : function(res, curr, count) {

                        //监听头工具栏事件
                        table.on('toolbar(fundBudgetDataTable)', function(obj){
                            let fundBudgetFormCntainer = layer.open({
                                title : '经费预算'
                                ,type : 1
                                ,area : [ '700px', '350px' ] //宽高
                                ,offset : '30px'
                                ,content : $('#fundBudgetForm')
                                ,success: function(layero, index){
                                    //监听表单提交
                                    form.on('submit(fundBudgetFormSubmitBtn)', function(data){
                                        let formData = data.field;
                                        $.post(requestUrl+'/jiaoGaiXiangMu/insertFundBudget.do',{
                                            "xmCode":xmCode,
                                            "subject":formData.subject,
                                            "budgetAmount":formData.budgetAmount,
                                        },function (resultData) {
                                            if(resultData.code == 200){
                                                fundBudgetDataTable.reload();//重新加载数据
                                                layer.msg('添加成功', {time : 3000, offset: '100px'});
                                            }else{
                                                layer.msg('添加失败', {time : 3000, offset: '100px'});
                                            }
                                        },'json');
                                        layer.close(fundBudgetFormCntainer);
                                        return false;
                                    });
                                },end:function () {
                                    document.getElementById("fundBudgetForm").reset(); //清空表单数据
                                }
                            });
                        });

                        //监听右侧工具条
                        table.on('tool(fundBudgetDataTable)', function(obj){
                            let rowData = obj.data;
                            if (obj.event === 'delete') {
                                //执行删除
                                $.post(requestUrl+'/jiaoGaiXiangMu/deleteFundBudget.do'
                                    , {
                                        "xmCode": rowData.xmCode
                                        ,"subject": rowData.subject
                                    }
                                    ,function(resultData){
                                        if(resultData.code === 200){
                                            fundBudgetDataTable.reload();//重新加载表格数据
                                            layer.msg('删除成功', {time : 3000, offset: '100px'});
                                        }else{
                                            layer.msg('删除失败', {time : 3000, offset: '100px'});
                                        }
                                    }, "json");
                            }
                        });
                    }
                });
            };

            /**
             *
             * @param data
             */
            let detail = function (rowData) {
                layer.open({
                    title : '教学研究-教改项目-查看详情'
                    ,type : 1
                    ,area : [ '1175px', '535px' ]
                    ,offset : '10px' //只定义top坐标，水平保持居中
                    ,shadeClose : true //点击遮罩关闭
                    ,btn : ['关闭']
                    ,content : $('#viewContainer')
                    ,success: function(layero, index){
                        let htmlStr = '';
                        htmlStr += '<fieldset class="layui-elem-field" style="margin-top: 10px;" >' +
                                '       <legend>一、项目基本信息</legend>\n' +
                                '       <table class="layui-table">\n' +
                                '           <tbody>\n' +
                                '               <tr>' +
                                '                   <td style="width: 100px; text-align: right">项目名称：</td><td style="width: 436px;">'+rowData.xmName+'</td>' +
                                '                    <td style="width: 100px; text-align: right">项目类型：</td><td style="width: 436px;">'+rowData.xmType+'</td>' +
                                '               </tr>\n' +
                                '           </tbody>\n' +
                                '       </table>' +
                                '   </fieldset>';
                        htmlStr += '<fieldset class="layui-elem-field" style="margin-top: 10px;" >' +
                            '       <legend>二、项目主持人信息</legend>\n' +
                            '       <table class="layui-table">\n' +
                            '           <tbody>\n' +
                            '               <tr>' +
                            '                   <td style="width: 100px; text-align: right">姓名：</td><td style="width: 436px;">'+rowData.leader+'</td>' +
                            '                   <td style="width: 100px; text-align: right">工号：</td><td style="width: 436px;">'+rowData.leaderId+'</td>' +
                            '               </tr>\n' +
                            '               <tr>' +
                            '                   <td style="width: 100px; text-align: right">二级单位：</td><td style="width: 436px;">'+rowData.collegeOrDept+'</td>' +
                            '                    <td style="width: 100px; text-align: right">专业：</td><td style="width: 436px;">'+rowData.major+'</td>' +
                            '               </tr>\n' +
                            '               <tr>' +
                            '                    <td style="width: 100px; text-align: right">职称：</td><td colspan="3">'+rowData.title+'</td>' +
                            '               </tr>\n' +
                            '               <tr>' +
                            '                    <td style="width: 100px; text-align: right">主要教学工作简历：</td><td colspan="3">'+rowData.mainTeachWork+'</td>' +
                            '               </tr>\n' +
                            '               <tr>' +
                            '                    <td style="width: 100px; text-align: right">主要教育教学研究领域及成果：</td><td colspan="3">'+rowData.mainTeachAchievement+'</td>' +
                            '               </tr>\n' +
                            '           </tbody>\n' +
                            '       </table>' +
                            '   </fieldset>';
                        htmlStr += '<fieldset class="layui-elem-field" style="margin-top: 10px;" >' +
                            '       <legend>三、项目主要参加人员情况</legend>\n' +
                            '       <table class="layui-table">\n' +
                            '           <tbody>\n' +
                            '               <tr>' +
                            '                   <td style="width: 100px; text-align: right">主要成员情况：</td><td>主要成员情况主要成员情况主要成员情况主要成员情况主要成员情况主要成员情况</td>' +
                            '               </tr>\n' +
                            '           </tbody>\n' +
                            '       </table>' +
                            '   </fieldset>';
                        htmlStr += '<fieldset class="layui-elem-field" style="margin-top: 10px;" >' +
                            '       <legend>四、项目的研究背景与研究基础</legend>\n' +
                            '       <table class="layui-table">\n' +
                            '           <tbody>\n' +
                            '               <tr>' +
                            '                   <td style="width: 100px; text-align: right">现状与背景分析（包括已有研究实践基础）：</td><td>'+rowData.currentAndBackground+'</td>' +
                            '               </tr>\n' +
                            '               <tr>' +
                            '                   <td style="width: 100px; text-align: right">研究内容、目标、要解决的问题和主要特色：</td><td>'+rowData.questionAndTarget+'</td>' +
                            '               </tr>\n' +
                            '           </tbody>\n' +
                            '       </table>' +
                            '   </fieldset>';
                        htmlStr += '<fieldset class="layui-elem-field" style="margin-top: 10px;" >' +
                            '       <legend>五、项目的预期效果、具体成果和进度安排</legend>\n' +
                            '       <table class="layui-table">\n' +
                            '           <tbody>\n' +
                            '               <tr>' +
                            '                   <td style="width: 100px; text-align: right">预期效果与具体成果：</td><td>'+rowData.expectAndResult+'</td>' +
                            '               </tr>\n' +
                            '               <tr>' +
                            '                   <td style="width: 100px; text-align: right">具体安排及进度：</td><td>'+rowData.planAndProcess+'</td>' +
                            '               </tr>\n' +
                            '           </tbody>\n' +
                            '       </table>' +
                            '   </fieldset>';
                        htmlStr += '<fieldset class="layui-elem-field" style="margin-top: 10px;" >' +
                            '       <legend>六、项目经费预算</legend>\n' +
                            '       <table class="layui-table">\n' +
                            '           <tbody>\n' +
                            '               <tr>' +
                            '                   <td style="width: 100px; text-align: right">经费预算：</td><td>经费预算经费预算经费预算经费预算经费预算经费预算</td>' +
                            '               </tr>\n' +
                            '               <tr>' +
                            '                   <td style="width: 100px; text-align: right">经费概算：</td><td>'+rowData.fundBudgetEstimate+'</td>' +
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

            /**
             *
             * @param rowData
             */
            let detail_shenheProcess = function (rowData) {
                layer.open({
                    title : '教学研究-教改项目-查看审核流程'
                    ,type : 1
                    ,area : [ '1175px', '535px' ]
                    ,offset : '10px' //只定义top坐标，水平保持居中
                    ,shadeClose : true //点击遮罩关闭
                    ,btn : ['关闭']
                    ,content : $('#shenheProcessContainer')
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
                                        htmlStr +=  '</fieldset>';
                                    }
                                    if(rowData.status =='通过'){
                                        htmlStr +=  '<h2 style="margin-left: 30px;">结束</h2>';
                                    }
                                    $("#shenheProcessContainer").html(htmlStr);
                                }else{
                                    layer.msg('暂无审核数据', {time : 3000, offset: '100px'});
                                }
                            }else{
                                layer.msg('获取数据出错', {time : 3000, offset: '100px'});
                            }
                        }, "json");
                    }
                    ,end:function () {
                        $("#shenheProcessContainer .layui-elem-field").empty();
                    }
                });
            };
        }
        ,error:function() {
            layer.msg('网络连接失败', {icon:7, time : 3000, offset: '100px'});
        }
    });
});
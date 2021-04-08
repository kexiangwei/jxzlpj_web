/*
教学研究-教学团队-国家级团队
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

            // 初始化获得奖项下拉选项
            $.get(requestUrl+'/optionset/getOptionSetList.do',{
                'menuId':function () {
                    return currentMenuId;
                },
                'attr': 'batch'
            },function(result_data){
                if(result_data.code == 200){
                    if(result_data.data.length >0){
                        initSelect('请选择','batch',result_data.data);
                        form.render('select');
                    }
                }
            },'json');

            if(data.isAuthSubmit > 0){ //拥有提交权限

                //数据表格
                var myself_table = table.render({
                    id: guid()
                    ,elem : '#myself_table'
                    ,height : 500
                    ,url: requestUrl+'/jxyj_jxtd_country/getPageList.do'
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
                        ,{field: 'teamName', title: '团队名称', width:150}
                        ,{field: 'teamLeader', title: '团队负责人', width:150}
                        ,{field: 'leaderUnit', title: '单位', width:150}
                        ,{field: 'cycle', title: '建设周期', width:150}
                        ,{field: 'batch', title: '批次', width:150}
                        ,{field: 'commonDate', title: '获批时间', width:150}
                        ,{field: 'isSubmit', title: '提交状态', width:120,templet: function(data){ // 函数返回一个参数 data，包含接口返回的所有字段和数据
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
                        ,{field: 'status', title: '审核状态', width:120,templet: function(data){ // 函数返回一个参数 data，包含接口返回的所有字段和数据
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
                        ,{field: 'createDate', title: '创建时间', width:120, sort:true}
                        ,{fixed: 'right', width:288, align:'center', toolbar: '#myself_bar'} //这里的toolbar值是模板元素的选择器
                    ]]
                });//table end.

                //监听搜索框事件
                let active = {
                    search: function(){
                        myself_table.reload({
                            where: {
                                'teamName': $(".myself_search input[name='teamName']").val()
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
                    var checkStatus = table.checkStatus(obj.config.id)
                        ,data = checkStatus.data; //获取选中的数据
                    switch(obj.event){
                        case 'insert':
                            var objCode = new Date().getTime(); //初始化业务数据编号
                            layer.open({
                                title : '教学研究-教学团队-国家级团队-新增'
                                ,type : 1
                                ,area : [ '900px', '450px' ]
                                ,offset : '50px'
                                // ,shadeClose : true //禁用点击遮罩关闭弹窗
                                ,content : $('#editForm_container')
                                ,success: function(layero, index){

                                    //初始化表单
                                    initEditForm({
                                        'code': objCode
                                        ,'userId':$.cookie('userId')
                                        ,'userName':$.cookie('userName')
                                        ,"userUnit" : $.cookie('userUnit')
                                    });

                                    //监听表单提交
                                    form.on('submit(toSubmitEidtForm)', function(data){
                                        let formData = data.field;
                                        // alert(JSON.stringify(formData));
                                        $.post(requestUrl+'/jxyj_jxtd_country/insert.do',formData,function(result_data){
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
                                    layer.confirm('表单未提交，填写的信息将会清空', {icon: 3, title:'提示', offset: '100px'}, function(index) {
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
                    let rowData = obj.data;
                    if (obj.event === 'detail_dataInfo') {
                        detail_dataInfo(rowData,true);
                    } else if (obj.event === 'detail_shenheProcess') {
                        if(data.isSubmit=='未提交' && data.status !='退回'){
                            return;
                        }
                        detail_shenheProcess('教学研究-教学团队-国家级团队-查看审核流程',rowData);
                    } else if (obj.event === 'update') {
                        if(data.isSubmit== '已提交'){
                            return;
                        }
                        //执行编辑
                        layer.open({
                            title : '教学研究-教学团队-国家级团队-编辑'
                            ,type : 1
                            ,area : [ '900px', '450px' ]
                            ,offset : '50px'
                            ,shadeClose : true //禁用点击遮罩关闭弹窗
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
                                form.on('submit(toSubmitEidtForm)', function(data){
                                    let formData = data.field;
                                    // alert(JSON.stringify(formData));
                                    $.post(requestUrl+'/jxyj_jxtd_country/update.do', formData, function(resultData){
                                        layer.msg(result_data.msg, { offset: '100px'}, function () {
                                            if(result_data.code == 200){
                                                myself_table.reload();//重新加载表格数据
                                            }
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
                        if(rowData.isSubmit== '已提交'){
                            return;
                        }
                        layer.confirm('删除后不可恢复，真的要删除么？', {icon: 3, title:'提示', offset: '100px'}, function(index) {
                            $.post(requestUrl+'/jxyj_jxtd_country/delete.do', { code: rowData.code},function(result_data){
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

                var isJwcGly  //是否教务处管理员
                    ,isZjshAccount //是否专家评审账号
                    ,other_table = table.render({ //数据表格
                    id: guid()
                    ,elem : '#other_table'
                    ,height : 500
                    ,id: "other_table_id"
                    ,url: requestUrl+'/jxyj_jxtd_country/getPageList.do'
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
                    ,totalRow: true
                    ,toolbar: '#other_toolbar'
                    ,cols : [[ //表头
                        {type:'checkbox', fixed: 'left'}
                        ,{type:'numbers', title:'序号', width:80, fixed: 'left', totalRowText: '合计：'}
                        ,{field: 'userId', title: '教师工号', width:150, sort: true}
                        ,{field: 'userName', title: '教师姓名', width:150, sort: true}
                        ,{field: 'teamName', title: '团队名称', width:150}
                        ,{field: 'teamLeader', title: '团队负责人', width:150}
                        ,{field: 'leaderUnit', title: '单位', width:150}
                        ,{field: 'cycle', title: '建设周期', width:150}
                        ,{field: 'batch', title: '批次', width:150}
                        ,{field: 'commonDate', title: '获批时间', width:150}
                        ,{field: 'shenheStatus', title: '审核状态', width:120,templet: function(data){ // 函数返回一个参数 data，包含接口返回的所有字段和数据
                                let val = data.shenheStatus;
                                if(val=='已审核'){
                                    return '<span style="color: blue;font-weight: bold;">'+val+'</span>';
                                }
                                return '<span style="color: red;font-weight: bold;">'+val+'</span>';
                            }
                        }
                        ,{field: 'shenheStatusFirst', title: '初审状态', width:120,templet: function(data){ // 函数返回一个参数 data，包含接口返回的所有字段和数据
                                let val = data.shenheStatusFirst;
                                if(val=='通过'){
                                    return '<span style="color: green;font-weight: bold;">'+val+'</span>';
                                } else {
                                    return '<span style="color: red;font-weight: bold;">'+val+'</span>';
                                }
                            }
                        }
                        ,{field: 'shenheStatusFinal', title: '终审状态', width:120,templet: function(data){ // 函数返回一个参数 data，包含接口返回的所有字段和数据
                                let val = data.shenheStatusFinal;
                                if(val=='通过'){
                                    return '<span style="color: green;font-weight: bold;">'+val+'</span>';
                                }else if(val=='待审核'){
                                    return '<span style="color: gray;font-weight: bold;">'+val+'</span>';
                                }else{
                                    return '<span style="color: red;font-weight: bold;">'+(val != null ? val : '')+'</span>';
                                }
                            }
                        }
                        ,{field: 'createDate', title: '创建时间', width:120, sort:true}
                        ,{field: 'isJwcGly_0',fixed: 'right', width:168, align:'center',templet: function(data){
                                return '<a class="layui-btn layui-btn-primary layui-btn-xs" lay-event="detail_dataInfo">查看信息</a>' +
                                    '<a class="layui-btn layui-btn-normal layui-btn-xs" lay-event="detail_shenheProcess">查看流程</a>';
                            }
                        }
                        ,{field: 'isJwcGly_1',fixed: 'right', width:288, align:'center',templet: function(data){
                                let html = '<a class="layui-btn layui-btn-primary layui-btn-xs" lay-event="detail_dataInfo">查看信息</a>' +
                                    '<a class="layui-btn layui-btn-normal layui-btn-xs" lay-event="detail_shenheProcess">查看流程</a>';
                                if(isNotEmpty(data.zjshItemList)){
                                    html += '<a class="layui-btn layui-btn-normal layui-btn-xs" lay-event="detail-zjsh">查看专家审核意见</a>';
                                }else{
                                    html += '<a class="layui-btn layui-btn-disabled layui-btn-xs" lay-event="detail-zjsh">查看专家审核意见</a>';
                                }
                                return html;
                            }
                        }
                    ]]
                    ,done: function(res, curr, count){
                        $('#other').find('span').html(res.unShenHeNum); //设置未审核数

                        isJwcGly = res.isJwcGly; //是否教务处管理员
                        isZjshAccount = res.isZjshAccount; //是否专家评审账号

                        let html;
                        if(isJwcGly==1){ //当前登录用户为教务处管理员
                            $("[data-field='shenheStatus']").css('display','none'); //关键代码
                            $("[data-field='isJwcGly_0']").css('display','none'); //关键代码
                            //
                            html = '&nbsp;&nbsp;初审状态：\n' +
                                '                        <div class="layui-inline" style="width: 180px">\n' +
                                '                            <select name="shenheStatusFirst" id="shenheStatusFirst">\n' +
                                '                                <option value="">请选择</option>\n' +
                                '                                <option value="通过">通过</option>\n' +
                                '                                <option value="未通过">未通过</option>\n' +
                                '                                <option value="退回">退回</option>\n' +
                                '                                <option value="未审核">未审核</option>\n' +
                                '                            </select>\n' +
                                '                        </div>\n' +
                                '                        &nbsp;&nbsp;终审状态：\n' +
                                '                        <div class="layui-inline" style="width: 180px">\n' +
                                '                            <select name="shenheStatusFinal" id="shenheStatusFinal">\n' +
                                '                                <option value="">请选择</option>\n' +
                                '                                <option value="通过">通过</option>\n' +
                                '                                <option value="未通过">未通过</option>\n' +
                                '                                <option value="退回">退回</option>\n' +
                                '                                <option value="未审核">未审核</option>\n' +
                                '                                <option value="待审核">待审核</option>\n' +
                                '                            </select>\n' +
                                '                        </div>';

                        }else{
                            $("[data-field='shenheStatusFirst']").css('display','none'); //关键代码jm  mkm mkiokm mk90ok,0
                            $("[data-field='shenheStatusFinal']").css('display','none'); //关键代码
                            $("[data-field='isJwcGly_1']").css('display','none'); //关键代码
                            //
                            html = '&nbsp;&nbsp;审核状态：\n' +
                                '                        <div class="layui-inline">\n' +
                                '                            <select name="shenheStatus" id="shenheStatus">\n' +
                                '                                <option value="">请选择</option>\n' +
                                '                                <option value="已审核">已审核</option>\n' +
                                '                                <option value="未审核">未审核</option>\n' +
                                '                            </select>\n' +
                                '                        </div>';
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
                                                if(item.status != '审核中'){
                                                    flag = true;
                                                    msg = '您选择了已审核的信息';
                                                    return false;//跳出循环
                                                } /*else if(item.shenheStatusFirst== '通过' && isEmpty(item.zjshItemList)){
                                                    flag = true;
                                                    msg = '您选择了校外专家未审核的信息';
                                                    return false;//跳出循环
                                                } */else if(item.shenheStatusFirst== '通过' && item.isZjshAll !=1){
                                                    flag = true;
                                                    msg = '您选择了校外专家未审核的信息';
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
                                            toShenHe(data); //添加审核意见
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
                            } else if (obj.event === 'detail_shenheProcess') {
                                detail_shenheProcess('教学研究-教学团队-国家级团队-查看审核流程',data);
                            } else if (obj.event === 'detail-zjsh') {
                                detail_zjsh(data);
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

            //初始化表单
            var initEditForm = function (data) {

                //初始化laydate实例
                laydate.render({
                    elem: '#commonDate' //指定元素
                });
                //
                form.val("editForm",{
                    "code":data.code
                    ,"teamName": data.teamName
                    ,"teamLeader" : data.teamLeader
                    ,"leaderUnit" : data.leaderUnit
                    ,"cycle" : data.cycle
                    ,"batch" : data.batch
                    ,"commonDate" : data.commonDate
                    ,"userId":data.userId
                    ,"userName":data.userName
                    ,"userUnit":data.userUnit
                });
            };

            let detail_dataInfo = function (data,isSubmit,isShenHe) {
                //
                let options = {
                    title : '教学研究-教学团队-国家级团队-查看详情'
                    ,type : 1
                    ,area : [ '900px', '450px' ]
                    ,offset : '50px' //只定义top坐标，水平保持居中
                    ,shadeClose : true //点击遮罩关闭
                    ,btn : ['关闭']
                    ,content : $('#dataInfo_container')
                    ,success: function(layero, index){
                        //
                        let html = '<table class="layui-table">\n' +
                            '        <tbody>\n' +
                            '              <tr>' +
                            '                <td style="width: 80px; text-align: right">团队名称：</td><td colspan="3">'+data.teamName+'</td>' +
                            '              </tr>\n' +
                            '              <tr>' +
                            '                <td style="width: 80px; text-align: right">团队负责人：</td><td style="width: 120px;">'+data.teamLeader+'</td>' +
                            '                <td style="width: 80px; text-align: right">单位：</td><td style="width: 120px;">'+data.leaderUnit+'</td>' +
                            '              </tr>\n' +
                            '              <tr>' +
                            '                <td style="width: 80px; text-align: right">建设周期：</td><td style="width: 120px;">'+data.cycle+'</td>' +
                            '                <td style="width: 80px; text-align: right">批次：</td><td style="width: 120px;">'+data.batch+'</td>' +
                            '              </tr>\n' +
                            '              <tr>' +
                            '                <td style="width: 80px; text-align: right">获批时间：</td><td colspan="3">'+data.commonDate+'</td>' +
                            '              </tr>\n' +
                            '              <tr>' +
                            '                <td style="width: 80px; text-align: right">录入时间：</td><td colspan="3">'+data.createDate+'</td>' +
                            '              </tr>\n' +
                            '        </tbody>\n' +
                            '    </table>';
                        $("#baseInfo").html(html);

                        //申报书
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
                if(isShenHe && (data.shenheStatus == '未审核' || data.shenheStatusFirst == '未审核' ||　data.shenheStatusFinal == '未审核')){
                    options.btn = ['审核','关闭'];
                    options.yes = function(index, layero){
                        toShenHe(new Array(data));
                    };
                    options.btn2 = function(index, layero){
                        layer.close(index); //如果设定了yes回调，需进行手工关闭
                    };
                }
                layer.open(options);
            };

            //提交
            var toSubmit = function (row_datas){
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
                //添加审核意见
                layer.open({
                    title : '教学研究-教学团队-国家级团队-审核'
                    ,type : 1
                    ,area : [ '700px', '350px' ]
                    ,offset : '100px'
                    ,shadeClose : true //点击遮罩关闭
                    // ,btn : ['关闭']
                    ,content : $('#shenHeForm_container')
                    ,success: function(layero, index){
                        //
                        if(isZjshAccount == 1){
                            $("#shenHeFormStatus option:last").remove();  //删除Select中索引值最大Option(最后一个)
                            form.render("select");
                        } else if(isJwcGly==1){
                            $("#shenheType").css('display','block'); //关键代码
                            form.val("shenHeForm",{
                                "shenheType":row_datas[0].shenheStatusFirst == '未审核'?'初审':'终审'
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
                            $.post(requestUrl+'/toShenhe.do',{
                                'viewName':'v_jxyj_jxtd_country_shenhe'
                                , 'isZjshAccount':isZjshAccount
                                ,"jsonString":JSON.stringify(row_datas)
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
                                layer.msg(result_data.msg, {time : 3000, offset: '100px'},function () {
                                    if(result_data.code === 200){
                                        other_table.reload();//重新加载表格数据
                                    }
                                    layer.closeAll();
                                });
                            },'json');
                        });
                    }
                    ,end:function () {

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
                    ,area : [ '1100px', '500px' ]
                    ,offset : '50px' //只定义top坐标，水平保持居中
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
                                            '<legend style="font-weight: bold">开始</legend>\n' +
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
                                                        +(item.status=='通过'?'<span style="color: green;font-weight: bold;">通过</span>':'<span style="color: red;font-weight: bold;">'+item.status+'</span>')+'</td>' +
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
                                                        +(item.status=='通过'?'<span style="color: green;font-weight: bold;">通过</span>':'<span style="color: red;font-weight: bold;">'+item.status+'</span>')+'</td>' +
                                                        '                           <td style="width: 80px; text-align: center">审核意见</td><td style="width: 120px; text-align: center">'+item.opinion+'</td>' +
                                                        '                       </tr>\n' +
                                                        '                       </tbody>\n' +
                                                        '                  </table>\n' +
                                                        '               </div>';
                                                }
                                            }
                                        }
                                        htmlStr +=  '</fieldset>';
                                        if(data[i].status =='通过' || data[i].status =='未通过' || data[i].status =='退回'){
                                            htmlStr +=  '<h2 style="margin-left: 33px; font-weight: bold">结束</h2>';
                                        }
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
            let detail_zjsh = function (row_data) {
                let zjshItemList = row_data.zjshItemList;
                if(isEmpty(zjshItemList)){
                    return;
                }
                layer.open({
                    title : '教学研究-教学团队-国家级团队-查看专家审核意见'
                    ,type : 1
                    ,area : [ '900px', '450px' ]
                    ,offset : '100px' //只定义top坐标，水平保持居中
                    ,shadeClose : true //点击遮罩关闭
                    ,btn : ['导出专家评审结果','关闭']
                    ,yes: function(){
                        // alert(JSON.stringify(row_data));
                        let sheetData = new Array();
                        $.each(zjshItemList,function (idx,obj) {
                            let item = {
                                'userName' : obj.userName
                                ,'status' : obj.status
                                ,'opinion' : obj.opinion
                                ,'createDate' : obj.createDate
                            };
                            sheetData[idx] = item;
                        });
                        let option={};
                        option.fileName = row_data.teamName+'校外专家审核意见';
                        option.datas=[
                            {
                                sheetHeader:['专家','评审结果','评审意见','评审时间'],
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

        }
        ,error:function() {
            layer.msg('网络连接失败', {icon:7, time : 3000, offset: '100px'});
        }
    });
});
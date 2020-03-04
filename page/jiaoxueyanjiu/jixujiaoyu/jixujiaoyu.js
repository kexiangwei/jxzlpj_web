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
                        ,first: '首页' //不显示首页
                        ,last: '尾页' //不显示尾页
                    }
                    ,limit: 10
                    ,even: true //隔行背景
                    ,totalRow: true //开启合计行
                    ,toolbar: '#myself_toolbar' //指向自定义工具栏模板选择器
                    ,cols : [[ //表头
                        {type:'checkbox', fixed: 'left'}
                        ,{type:'numbers', title:'序号', width:80, fixed: 'left', totalRowText: '合计：'}
                        ,{field: 'peixunName', title: '培训名称', width:200}
                        ,{field: 'peixunStyle', title: '培训形式', width:150}
                        ,{field: 'peixunStartTime', title: '培训开始时间', width:120,hide:true}
                        ,{field: 'peixunEndTime', title: '培训结束时间', width:120,hide:true}
                        ,{field: 'peixunClassHour', title: '学时', width:120, sort: true, totalRow:true}
                        ,{field: 'peixunContent', title: '培训内容', width:120,hide:true}
                        ,{field: 'peixunAddress', title: '培训地点', width:120,hide:true}
                        ,{field: 'peixunDept', title: '培训机构', width:120}
                        ,{field: 'isSubmit', title: '提交状态', width:120,templet: function(data){ // 函数返回一个参数 data，包含接口返回的所有字段和数据
                                var val = data.isSubmit;
                                if(val=='已提交'){
                                    var htmlstr = ' <a class="layui-btn layui-btn-primary layui-btn-xs" lay-event="detail_dataInfo">查看信息</a>\n' +
                                        '           <a class="layui-btn layui-btn-normal layui-btn-xs" lay-event="detail_fileInfo">查看附件</a>\n' +
                                        '           <a class="layui-btn layui-btn-normal layui-btn-xs" lay-event="detail_shenheProcess">查看流程</a>';
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
                                var htmlstr = ' <a class="layui-btn layui-btn-primary layui-btn-xs" lay-event="detail_dataInfo">查看信息</a>\n' +
                                    '                    <a class="layui-btn layui-btn-normal layui-btn-xs" lay-event="detail_fileInfo">查看附件</a>\n' +
                                    '                    <a class="layui-btn layui-btn-disabled layui-btn-xs" lay-event="detail_shenheProcess">查看流程</a>\n' +
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
                                return '<span style="font-weight: bold;">待审核</span>';
                            }
                        }
                        ,{fixed: 'right', width:340, align:'center', toolbar: '#myself_bar'} //这里的toolbar值是模板元素的选择器
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
                                        'peixunName': $("input[name='myself_peixunName']").val()
                                        ,'peixunDept': $("input[ name='myself_peixunDept']").val()
                                        ,'isSubmit': $("input[ name='myself_isSubmit']").val()
                                        ,'status': $("input[ name='myself_status']").val()
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
                                        title : '教学研究-继续教育-新增'
                                        ,type : 1
                                        // ,shadeClose : true //防止不小心点到遮罩关闭弹窗，禁用此功能
                                        ,area : [ '900px', '520px' ]
                                        ,offset : '20px'
                                        ,content : $('#editForm_container')
                                        ,success: function(layero, index){
                                            //初始化laydate实例
                                            laydate.render({
                                                elem: '#startDate' //指定元素
                                            });
                                            laydate.render({
                                                elem: '#endDate' //指定元素
                                            });
                                            //监听编辑页submit按钮提交
                                            form.on('submit(toSubmitEidtForm)', function(data){
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
                            if (obj.event === 'detail_dataInfo') {
                                detail_dataInfo(data);
                            } else if (obj.event === 'detail_fileInfo') {
                                detail_fileInfo(data);
                            } else if (obj.event === 'detail_shenheProcess') {
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
                                let editForm_idx= layer.open({
                                    title :  '教学研究-继续教育-编辑'
                                    ,type : 1
                                    ,area : [ '900px', '520px' ]
                                    // ,area : '500px'//只想定义宽度时，你可以area: '500px'，高度仍然是自适应的
                                    ,offset : '20px'
                                    ,shadeClose : true //点击遮罩关闭
                                    ,content : $('#editForm_container')
                                    ,success: function(layero, index){
                                        //所有编辑页面，均增加取消按钮，不保存当前修改的内容。
                                        let cancelBtn = $('<button class="layui-btn layui-btn-primary">取消</button>');
                                        $("#editForm .layui-btn-container").append(cancelBtn);
                                        cancelBtn.click(function (event) {
                                            layer.close(index);
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
                                        form.on('submit(toSubmitEidtForm)', function(data){
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
                element.on('tab(layTab)', function(data){
                    if(data.index == 1){ //
                        other_table.reload(); //重新加载表格数据
                    }
                });

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
                        // ,{field:'code', title:'编号', width:120, sort: true}
                        ,{field: 'userId', title: '工号', width:120, sort: true}
                        ,{field: 'userName', title: '姓名', width:120}
                        ,{field: 'peixunName', title: '培训名称', width:200}
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

                        //监听搜索框事件
                        $('.other_search .layui-btn').on('click', function(){
                            let type = $(this).data('type');
                            active[type] ? active[type].call(this) : '';
                        });
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
                                            ,area : [ '900px', '450px' ] // ,area : '500px'//只想定义宽度时，你可以area: '500px'，高度仍然是自适应的
                                            ,offset : '50px' //只定义top坐标，水平保持居中
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
                            if (obj.event === 'detail_dataInfo') {
                                detail_dataInfo(data);
                            } else if (obj.event === 'detail_fileInfo') {
                                detail_fileInfo(data);
                            } else if (obj.event === 'detail_shenheProcess') {
                                detail_shenheProcess('教学研究-继续教育-查看审核流程',data);
                            }
                        });

                    }
                });
            } else{
                $('#other').remove();
                $('#other_item').remove();
            }

            let detail_dataInfo = function (data) {
                if(isOpen){
                    return;
                }
                var isOpen = false;
                layer.open({
                    title : '教学研究-继续教育-查看详情'
                    ,type : 1
                    ,area : [ '900px', '520px' ]
                    // ,area : '500px'//只想定义宽度时，你可以area: '500px'，高度仍然是自适应的
                    ,offset : '20px' //只定义top坐标，水平保持居中
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

            let detail_fileInfo = function (data) {
                layer.open({
                    title : '继续教育-附件'
                    ,type : 1
                    ,offset : '20px'
                    ,moveOut:true
                    ,shadeClose : true //点击遮罩关闭
                    ,area : [ '900px', '520px' ]
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
                                            previewFileInfo(file);
                                        });
                                        break;
                                    case "chzp":
                                        $('#file_chzp').append('<img id="'+file.code+'" src="'+requestUrl+file.filePath +'" alt="参会照片" style="width: 150px; margin:5px; cursor: pointer;">');
                                        $("#"+file.code).dblclick(function() {
                                            previewFileInfo(file);
                                        });
                                        break;
                                    case "xdth":
                                        xdthNum++;
                                        let xdthtr = $(['<tr id="'+ file.code +'">'
                                            ,'<td>	<a href="javascript:void(0)">'+ file.fileName +'</a></td>'
                                            // ,'<td>'+ file.fileName.split('.').pop() +'</td>' //pop() 方法用于删除并返回数组的最后一个元素
                                            ,'<td>'+ file.fileSize +'kb</td>'
                                            ,'<td>'+ file.createDate +'</td>'
                                            ,'<td>' +
                                            '<button class="layui-btn layui-btn-xs layui-btn-normal demo-view">预览</button>' +
                                            '<button class="layui-btn layui-btn-xs layui-btn-normal demo-download">下载</button>' +
                                            '</td>'
                                            ,'</tr>'].join(''));
                                        //预览
                                        xdthtr.find('a').on('click', function(){
                                            previewFileInfo(file);
                                        });
                                        xdthtr.find('.demo-view').on('click', function(){
                                            previewFileInfo(file);
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
                                            // ,'<td>'+ file.fileName.split('.').pop() +'</td>' //pop() 方法用于删除并返回数组的最后一个元素
                                            ,'<td>'+ file.fileSize +'kb</td>'
                                            ,'<td>'+ file.createDate +'</td>'
                                            ,'<td>' +
                                                '<button class="layui-btn layui-btn-xs layui-btn-normal demo-view">预览</button>' +
                                                '<button class="layui-btn layui-btn-xs layui-btn-normal demo-download">下载</button>' +
                                            '</td>'
                                            ,'</tr>'].join(''));
                                        //预览
                                        qtwjtr.find('a').on('click', function(){
                                            previewFileInfo(file);
                                        });
                                        qtwjtr.find('.demo-view').on('click', function(){
                                            previewFileInfo(file);
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
        }
        ,error:function() {
            layer.msg('网络连接失败', {icon:7, time : 3000, offset: '100px'});
        }
    });
});
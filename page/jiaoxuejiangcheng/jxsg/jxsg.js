/**
 * 教学奖惩-教学事故
 */
layui.use(['layer','laytpl','table','form'], function(){
    let $ = layui.$,layer = layui.layer,laytpl = layui.laytpl,table = layui.table,form = layui.form;
    let isAdmin;
    $.get(requestUrl+'/jxsg/isAdmin.do'
    ,{
        "userId":function () {
            return $.cookie('userId');
        }
    },function (result_data) {
        isAdmin = result_data.data;
        let getTpl  = datatable_toolbar.innerHTML;
        laytpl(getTpl).render({"isAdmin": isAdmin},function (html) {
            $("#datatable_toolbar").html(html);
        });
        getTpl  = datatable_bar.innerHTML;
        laytpl(getTpl).render({"isAdmin": isAdmin},function (html) {
            $("#datatable_bar").html(html);
        });
        init_datatable();
    });

    //数据表格
    let init_datatable = function(){
        let datatable = table.render({
                id: "datatable"
                ,elem : '#datatable'
                ,height : 500
                ,url: requestUrl+'/jxsg/getPageList.do'
                ,where: {
                    "userId":function () {
                        return $.cookie('userId');
                    }
                }
                ,request: {
                    pageName: 'pageIndex'
                    ,limitName: 'pageSize'
                }
                ,response: {
                    statusCode: 200 //规定成功的状态码，默认：0
                }
                ,parseData: function(res){ //res 即为原始返回的数据
                    return {
                        "code": res.code, //解析接口状态
                        "msg": res.msg, //解析提示文本
                        "count": res.data.totalNum, //解析数据长度
                        "data": res.data.pageList, //解析数据列表
                    };
                }
                ,toolbar: '#datatable_toolbar'
                ,cols : [[ //表头
                    {type:'checkbox', fixed: 'left'}
                    ,{type:'numbers', title:'序号', width:80, fixed: 'left'}
                    ,{field: 'teacherCollege', title: '教师信息-学院', width:150}
                    ,{field: 'teacherMajor', title: '教师信息-专业', width:150}
                    ,{field: 'teacherId', title: '教师信息-工号', width:120}
                    ,{field: 'teacherName', title: '教师信息-姓名', width:120}
                    ,{field: 'event', title: '事件', width:180}
                    ,{field: 'eventLevel', title: '事故认定级别', width:180}
                    ,{field: 'happenTime', title: '时间', width:180}
                    ,{fixed: 'right', width: (isAdmin == 1 ? 180 : 80), align:'center', toolbar: '#datatable_bar'}
                ]]
                ,even: true //隔行背景
                ,limit: 10
                ,page: {
                    layout: ['count', 'prev', 'page', 'next', 'limit', 'refresh', 'skip']//自定义分页布局
                    ,limits: [10,20,50,100]
                }
                ,done : function(res, curr, count) {
                    //双击查看详情
                    var data = res.data;
                    $('.layui-table-body tr').each(function() {
                        var dataindex = $(this).attr('data-index');
                        var idx = 0;
                        for ( var item in data) {
                            if (dataindex == idx) {
                                $(this).dblclick(function() {//双击某一行事件
                                    detail_dataInfo(data[dataindex]);
                                });
                                break;
                            }
                            idx++;
                        }
                    });

                    //监听搜索框
                    $('.search-container .layui-btn').on('click', function(){
                        let type = $(this).data('type');
                        active[type] ? active[type].call(this) : '';
                    });
                    let active = {
                        search: function(){
                            datatable.reload({
                                where: { //设定异步数据接口的额外参数，任意设
                                    'event': $(".search input[ name='event' ] ").val()
                                    ,'eventLevel': $(".search input[ name='eventLevel' ] ").val()
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

                    //监听头部工具栏
                    table.on('toolbar(datatable)', function(obj){
                        switch(obj.event){
                            case 'insert':
                                let layerIndex = layer.open({
                                    title : '教学奖惩-教学事故-新增'
                                    ,type : 1
                                    ,area : [ '900px', '400px' ]
                                    ,offset : '50px'
                                    ,content : $("#insertOrUpdate_container")
                                    ,success: function(layero, index){
                                        //业务数据编号
                                        $("#editForm input[ name='code' ] ").val(new Date().getTime());

                                        //监听表单提交
                                        form.on('submit(editFormSubmitBtn)', function(data){
                                            $.post(requestUrl+'/jxsg/insert.do',{
                                                "code":data.field.code
                                                ,"teacherCollege" : data.field.teacherCollege
                                                ,"teacherMajor" : data.field.teacherMajor
                                                ,"teacherId" : data.field.teacherId
                                                ,"teacherName" : data.field.teacherName
                                                ,"event" : data.field.event
                                                ,"eventLevel" : data.field.eventLevel
                                                ,"happenTime" : data.field.happenTime
                                                , "userId":function () {
                                                    return $.cookie('userId');
                                                }
                                                ,"userName": function () {
                                                    return $.cookie('userName');
                                                }
                                            },function(result_data){
                                                if(result_data.code == 200){
                                                    datatable.reload();//重新加载表格数据
                                                }
                                                layer.msg(result_data.msg, {time : 3000, offset: '100px'});
                                            },'json');
                                        });
                                    }
                                    ,cancel: function(index, layero){
                                        layer.confirm('表单未提交，填写的信息将会清空', {icon: 3, title:'提示', offset: '100px'}, function(index) {
                                            layer.closeAll();
                                        });
                                        return false;
                                    }
                                    ,end:function () {

                                    }
                                });
                                break;
                        }
                    });

                    //监听右侧工具条
                    table.on('tool(datatable)', function(obj){
                        let layEvent = obj.event
                            , rowData = obj.data;
                        if (layEvent === 'detail') {
                            detail_dataInfo(rowData);
                        } else if (layEvent === 'update') {
                            let layIndex = layer.open({
                                title : '教学奖惩-教学事故-编辑'
                                ,type : 1
                                ,area : [ '900px', '400px' ]
                                ,offset : '50px'
                                ,shadeClose : true //点击遮罩关闭
                                ,content : $('#insertOrUpdate_container')
                                ,success: function(layero, index){
                                    //所有编辑页面，均增加取消按钮，不保存当前修改的内容。
                                    let cancelBtn = $('<button class="layui-btn layui-btn-primary">取消</button>');
                                    $("#editForm .layui-btn-container").append(cancelBtn);
                                    cancelBtn.click(function (event) {
                                        layer.close(layIndex);
                                    });

                                    //表单赋值
                                    form.val("editForm",{
                                        "code":rowData.code
                                        ,"teacherCollege" : rowData.teacherCollege
                                        ,"teacherMajor" : rowData.teacherMajor
                                        ,"teacherId" : rowData.teacherId
                                        ,"teacherName" : rowData.teacherName
                                        ,"event" : rowData.event
                                        ,"eventLevel" : rowData.eventLevel
                                        ,"happenTime" : rowData.happenTime
                                    });

                                    //监听表单提交
                                    form.on('submit(editFormSubmitBtn)', function(data){
                                        $.post(requestUrl+'/jxsg/update.do',{
                                            "code":data.field.code
                                            ,"teacherCollege" : data.field.teacherCollege
                                            ,"teacherMajor" : data.field.teacherMajor
                                            ,"teacherId" : data.field.teacherId
                                            ,"teacherName" : data.field.teacherName
                                            ,"event" : data.field.event
                                            ,"eventLevel" : data.field.eventLevel
                                            ,"happenTime" : data.field.happenTime
                                        },function(resultData){
                                            if(resultData.code == 200){
                                                datatable.reload();//重新加载表格数据
                                            }
                                            layer.msg(resultData.msg, {time : 3000, offset: '100px'});
                                        },'json');
                                    });
                                }
                            });
                        } else if (layEvent === 'delete') {
                            layer.confirm('删除后不可恢复，确定要删除么？', {icon: 3, title:'提示', offset: '100px'}, function(index) {
                                layer.close(index);
                                $.post(requestUrl+'/jxsg/delete.do', { "objCode": rowData.code},function(resultData){
                                    if(resultData.code == 200){
                                        datatable.reload();//重新加载表格数据
                                    }
                                    layer.msg(resultData.msg, {time : 3000, offset: '100px'});
                                }, "json");
                            });
                        }
                    });
                }
            });
    };

    let detail_dataInfo = function (data) {
        layer.open({
            title : '教学奖惩-教学事故-查看详情'
            ,type : 1
            ,area : [ '900px', '400px' ]
            ,offset : '50px'
            ,shadeClose : true
            ,btn : ['关闭']
            ,content : '<table class="layui-table">\n' +
                '        <tbody>\n' +
                '            <tr><td style="width: 150px; text-align: right">教师信息-学院</td><td>'+data.teacherCollege+'</td></tr>\n' +
                '            <tr><td style="width: 150px; text-align: right">教师信息-专业</td><td>'+data.teacherMajor+'</td></tr>\n' +
                '            <tr><td style="width: 150px; text-align: right">教师信息-工号</td><td>'+data.teacherId+'</td></tr>\n' +
                '            <tr><td style="width: 150px; text-align: right">教师信息-姓名</td><td>'+data.teacherName+'</td></tr>\n' +
                '            <tr><td style="width: 150px; text-align: right">事件</td><td>'+data.event+'</td></tr>\n' +
                '            <tr><td style="width: 150px; text-align: right">事故认定级别</td><td>'+data.eventLevel+'</td></tr>\n' +
                '            <tr><td style="width: 150px; text-align: right">时间</td><td>'+data.happenTime+'</td></tr>\n' +
                '        </tbody>\n' +
                '    </table>'
        });
    }
});
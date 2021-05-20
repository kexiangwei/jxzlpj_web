/**
 * 教学奖惩-教学事故
 */
layui.use(['layer','laytpl','table','form','laydate'], function(){
    let $ = layui.$,layer = layui.layer,laytpl = layui.laytpl,table = layui.table,form = layui.form,laydate = layui.laydate;

    const currentMenuId = $.cookie('currentMenuId');

    var isAdmin;
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
        laydate.render({
            elem: "#datetimeStart" //指定元素
            ,type: 'datetime'
        });
        laydate.render({
            elem: "#datetimeEnd" //指定元素
            ,type: 'datetime'
        });

        let datatable = table.render({
            id: "datatable"
            ,elem : '#datatable'
            ,height : 520
            ,url: requestUrl+'/jxsg/getPageList.do'
            ,where: {
                "userId":function () {
                    return $.cookie('userId');
                }
                ,'isAdmin':isAdmin
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
                ,{field: 'collegeName', title: '教师学院', width:150, sort:true}
                ,{field: 'majorName', title: '教师专业', width:150, sort:true}
                ,{field: 'teacherId', title: '教师工号', width:150, sort:true}
                ,{field: 'teacherName', title: '教师姓名', width:150, sort:true}
                ,{field: 'teacherUnit', title: '教师单位', width:150, sort:true}
                ,{field: 'event', title: '事件', width:150, sort:true}
                ,{field: 'eventLevel', title: '事故认定级别', width:150, sort:true}
                ,{field: 'happenTime', title: '事故认定时间', width:150, sort:true}
                ,{fixed: 'right', width: (isAdmin == 1 ? 180 : 80), align:'center', toolbar: '#datatable_bar'}
            ]]
            ,even: true //隔行背景
            ,limit: 10
            ,page: {
                layout: ['count', 'prev', 'page', 'next', 'limit', 'refresh', 'skip']//自定义分页布局
                ,limits: [10,20,50,100]
                , first: '首页'
                , last: '尾页'
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
            }
        });

        //监听搜索框
        let active = {
            search: function(){
                datatable.reload({
                    where: { //设定异步数据接口的额外参数，任意设
                        'event': $(".search-container input[ name='event' ] ").val()
                        ,'eventLevel': $(".search-container select[ name='eventLevel' ] ").val()
                        ,'datetimeStart': $(".search-container input[name='datetimeStart']").val()
                        ,'datetimeEnd': $(".search-container input[name='datetimeEnd']").val()
                    }
                    ,page: {
                        curr: 1 //重新从第 1 页开始
                    }
                });
            }
            ,reset: function () {
                $("input").val('');
                //清除选中状态
                $(".search-container select[name='eventLevel']").val("");
                form.render("select");
            }
        };
        $('.search-container .layui-btn').on('click', function(){
            let type = $(this).data('type');
            active[type] ? active[type].call(this) : '';
        });

        //监听头部工具栏
        table.on('toolbar(datatable)', function(obj){
            switch(obj.event){
                case 'insert':
                    let layerIndex = layer.open({
                        title : '教学奖惩-教学事故-新增'
                        ,type : 1
                        ,area : [ '900px', '500px' ]
                        ,offset : '50px'
                        ,content : $("#editForm_container")
                        ,success: function(layero, index){
                            //初始化表单
                            initEditForm({
                                'code': new Date().getTime()
                                ,'userId':$.cookie('userId')
                                ,'userName':$.cookie('userName')
                            });

                            //监听表单提交
                            form.on('submit(toSubmitEidtForm)', function(data){
                                $.post(requestUrl+'/jxsg/insert.do',data.field,function(result_data){
                                    layer.msg(result_data.msg, { offset: '100px'}, function () {
                                        layer.close(index);
                                    });
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
                            window.location.reload();//刷新页面
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
                    ,area : [ '900px', '500px' ]
                    ,offset : '50px'
                    ,shadeClose : true //点击遮罩关闭
                    ,content : $('#editForm_container')
                    ,success: function(layero, index){
                        //所有编辑页面，均增加取消按钮，不保存当前修改的内容。
                        let cancelBtn = $('<button class="layui-btn layui-btn-primary">取消</button>');
                        $("#editForm .layui-btn-container").append(cancelBtn);
                        cancelBtn.click(function (event) {
                            layer.close(layIndex);
                        });

                        //初始化表单
                        initEditForm(rowData);

                        //监听表单提交
                        form.on('submit(toSubmitEidtForm)', function(data){
                            $.post(requestUrl+'/jxsg/update.do',data.field,function(result_data){
                                layer.msg(result_data.msg, { offset: '100px'}, function () {
                                    layer.close(index);
                                });
                            },'json');
                        });
                    }
                    ,end:function () {
                        window.location.reload();//刷新页面
                    }
                });
            } else if (layEvent === 'delete') {
                layer.confirm('删除后不可恢复，确定要删除么？', {icon: 3, title:'提示', offset: '100px'}, function(index) {
                    $.post(requestUrl+'/jxsg/delete.do', { "objCode": rowData.code},function(result_data){
                        if(result_data.code == 200){
                            datatable.reload();//重新加载表格数据
                        }
                        layer.msg(result_data.msg, { offset: '100px'}, function () {
                            layer.close(index);
                        });
                    }, "json");
                });
            }
        });

    };

    var detail_dataInfo = function (data) {
        layer.open({
            title : '教学奖惩-教学事故-查看详情'
            ,type : 1
            ,area : [ '900px', '500px' ]
            ,offset : '50px'
            ,shadeClose : true
            ,btn : ['关闭']
            ,content : $('#dataInfo_container')
            ,success: function(layero, index){

                let html = '<table class="layui-table">\n' +
                    '        <tbody>\n' +
                    '            <tr><td style="width: 150px; text-align: right">教师信息-学院</td><td>'+data.collegeName+'</td></tr>\n' +
                    '            <tr><td style="width: 150px; text-align: right">教师信息-专业</td><td>'+data.majorName+'</td></tr>\n' +
                    '            <tr><td style="width: 150px; text-align: right">教师信息-工号</td><td>'+data.teacherId+'</td></tr>\n' +
                    '            <tr><td style="width: 150px; text-align: right">教师信息-姓名</td><td>'+data.teacherName+'</td></tr>\n' +
                    '            <tr><td style="width: 150px; text-align: right">教师信息-单位</td><td>'+data.teacherUnit+'</td></tr>\n' +
                    '            <tr><td style="width: 150px; text-align: right">事件</td><td>'+data.event+'</td></tr>\n' +
                    '            <tr><td style="width: 150px; text-align: right">事故认定级别</td><td>'+data.eventLevel+'</td></tr>\n' +
                    '            <tr><td style="width: 150px; text-align: right">事故认定时间</td><td>'+data.happenTime+'</td></tr>\n' +
                    '        </tbody>\n' +
                    '    </table>';
                $("#baseInfo").html(html);

                //附件列表
                $.get(requestUrl+"/getFileListByRelationCode.do" , {
                    "relationCode": function () {
                        return data.code;
                    }
                } ,  function(result_data){
                    if(result_data.data.length ===0){
                        let tr = '<tr><td colspan="3" style="text-align: center;">无数据</td></tr>';
                        $('#fileList').append(tr);
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
                            tr.find('.upfile_download').on('click', function(){
                                let downloadForm = $("<form action='"+requestUrl+"/downloadFileInfo.do' method='post'></form>");
                                downloadForm.append("<input type='hidden' name='fileName' value='"+fileInfo.fileName+"'/>");
                                downloadForm.append("<input type='hidden' name='filePath' value='"+fileInfo.filePath+"'/>");
                                $(document.body).append(downloadForm);
                                // alert(downloadForm.serialize());
                                downloadForm.submit();
                                downloadForm.remove();
                            });
                            $('#fileList').append(tr);
                        });
                    }
                }, "json");
            }
            ,end:function () {
                $('#fileList').empty();
            }
        });
    };

    //初始化表单
    var initEditForm = function (data) {
        //初始化laydate实例
        laydate.render({
            elem : "#happenTime"
            ,type: 'datetime'
        });

        //
        $.get(requestUrl+'/getXyList.do',function(result_data){
            if(result_data.code == 200){
                // alert(JSON.stringify(result_data.data));
                // 加载下拉选项
                $("select[name='teacherCollege']").empty(); //移除下拉选项
                let html = '<option value="">请选择</option>';
                for (let i = 0; i < result_data.data.length; i++) {
                    if(data.teacherCollege == result_data.data[i].CODE ){
                        html += '<option value="' + result_data.data[i].code + '" selected="">' + result_data.data[i].name + '</option>';
                    }else{
                        html += '<option value="' + result_data.data[i].code + '" >' + result_data.data[i].name + '</option>';
                    }
                }
                $("select[name='teacherCollege']").append(html);
                form.render('select');
            }
        },'json');
        // 监听学院下拉选项
        form.on('select(teacherCollege)', function(data) {
            $.get(requestUrl+'/getZyList.do',{
                'xyCode': data.value
            },function(result_data){
                if(result_data.code == 200){
                    // 加载下拉选项
                    $("select[name='teacherMajor']").empty(); //移除下拉选项
                    let html = '<option value="">请选择</option>';
                    for (let i = 0; i < result_data.data.length; i++) {
                        html += '<option value="' + result_data.data[i].code + '" >' + result_data.data[i].name + '</option>';
                    }
                    $("select[name='teacherMajor']").append(html);
                    form.render('select');
                }
            },'json');
        });
        //
        $.get(requestUrl+'/getZyList.do',{
            'collegeCode': data.teacherCollege !== undefined?data.teacherCollege:null
        },function(result_data){
            if(result_data.code == 200){
                // 加载下拉选项
                $("select[name='teacherMajor']").empty(); //移除下拉选项
                let html = '<option value="">请选择</option>';
                for (let i = 0; i < result_data.data.length; i++) {
                    if(data.teacherMajor == result_data.data[i].CODE ){
                        html += '<option value="' + result_data.data[i].CODE + '" selected="">' + result_data.data[i].NAME + '</option>';
                    }else{
                        html += '<option value="' + result_data.data[i].CODE + '" >' + result_data.data[i].NAME + '</option>';
                    }
                }
                $("select[name='teacherMajor']").append(html);
                form.render('select');
            }
        },'json');

        /*//input:teacherId 失去焦点事件
        $("#editForm input[ name='teacherId']").blur(function(){
            $.get(requestUrl+'/getUserDetail.do',{
                'userId': $(this).val()
            },function(result_data){
                if(result_data.code == 200){
                    if(result_data.data != null){
                        $("#editForm input[ name='teacherName']").val(result_data.data.NAME);
                    }else{
                        layer.msg('教师工号输入错误！', { offset: '100px'});
                    }
                }
            },'json');
        });*/

        //自定义验证规则
        form.verify({
            event: function(value){
                if(value.length > 64){
                    return '当前字符长度'+value.length+'（最大值64）';
                }
            }
        });

        //表单赋值
        form.val("editForm",{
            "code":data.code
            ,"teacherCollege" : data.teacherCollege
            ,"teacherMajor" : data.teacherMajor
            ,"teacherId" : data.teacherId
            ,"teacherName" : data.teacherName
            ,"teacherUnit" : data.teacherUnit
            ,"event" : data.event
            ,"eventLevel" : data.eventLevel
            ,"happenTime" : data.happenTime
            ,"userId" : data.userId
            ,"userName" : data.userName
        });
    };
});
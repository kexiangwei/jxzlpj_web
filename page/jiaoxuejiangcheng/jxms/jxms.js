/*
教学奖惩-教学名师
 */
layui.use(['layer','element','table','form','laydate','upload'], function(){
    var $ = layui.$,layer = layui.layer,element = layui.element,table = layui.table,form = layui.form,laydate = layui.laydate,upload = layui.upload;

    //验证用户是否拥有提交、审核权限
    $.ajax({
        type: "get",
        url: requestUrl+'/getAuthority.do', //查询用户是否拥有当前菜单的提交、审核权限
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

                laydate.render({
                    elem: "#myself_datetimeYearStart" //指定元素
                    ,type: 'year'
                    ,max: new Date().getFullYear()+"-01-01"
                });
                laydate.render({
                    elem: "#myself_datetimeYearEnd" //指定元素
                    ,type: 'year'
                    ,max: new Date().getFullYear()+"-01-01"
                });

                //数据表格
                var myself_table = table.render({
                    id: "myself_table"
                    ,elem : '#myself_table'
                    ,height : 440
                    ,url: requestUrl+'/jxms/getPageList.do'
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
                        , first: '首页'
                        , last: '尾页'
                    }
                    ,limit: 10
                    ,even: true //隔行背景
                    ,toolbar: '#myself_toolbar' //指向自定义工具栏模板选择器
                    ,cols : [[ //表头
                        {type:'checkbox', fixed: 'left'}
                        ,{type:'numbers', title:'序号', width:80, fixed: 'left'}
                        ,{field: 'userId', title: '教师工号', width:150, sort:true}
                        ,{field: 'userName', title: '教师姓名', width:150, sort:true}
                        ,{field: 'userUnit', title: '教师单位', width:150, sort:true}
                        ,{field: 'level1', title: '获奖级别', width:150, sort:true}
                        ,{field: 'title', title: '称号', width:150, sort:true}
                        ,{field: 'grantUnit', title: '证书授予机构', width:150, sort:true}
                        ,{field: 'datetimeYear', title: '获奖日期', width:150, sort:true}
                        ,{field: 'isSubmit', title: '提交状态', width:120, sort:true,templet: function(data){
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
                        ,{field: 'status', title: '审核状态', width:120, sort:true,templet: function(data){
                                if(data.status==='退回'){
                                    return '<span style="color: red;font-weight: bold;">'+data.status+'</span>';
                                }
                                return '<span style="color: blue;font-weight: bold;">'+(data.status != null ? data.status : '待审核')+'</span>';
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
                                        'level1': $(".myself_search select[name='level1']").val()
                                        ,'datetimeYearStart': $(".myself_search input[name='datetimeYearStart']").val()
                                        ,'datetimeYearEnd': $(".myself_search input[name='datetimeYearEnd']").val()
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
                                $(".myself_search select[name='level1']").val("");
                                $(".myself_search select[name='level2']").val("");
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
                                    let objCode = new Date().getTime(); //业务数据编号
                                    let layerIndex = layer.open({
                                        title : '教学奖惩-教学名师-新增'
                                        ,type : 1
                                        ,area : [ '900px', '450px' ]
                                        ,offset : '50px'
                                        ,content : $("#editForm_container")
                                        ,success: function(layero, index){
                                            ///初始化表单
                                            initEditForm({
                                                'code': objCode
                                                ,'userId':$.cookie('userId')
                                                ,'userName':$.cookie('userName')
                                            });
                                            //监听表单提交
                                            form.on('submit(toSubmitEidtForm)', function(data){
                                                $.post(requestUrl+'/jxms/insert.do', data.field, function(result_data){
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
                                            layer.confirm('表单未提交，填写的信息将会清空？', {icon: 3, title:'提示', offset: '100px'}, function() {
                                                $.post(requestUrl+'/deleteFileInfo.do', { "relationCode": objCode});
                                                layer.closeAll();
                                            });
                                            return false;
                                        }
                                        ,end:function () {
                                            // window.location.reload();//刷新页面，清空上传的文件内容
                                        }
                                    });
                                    break;
                                case 'submit':
                                    if(data.length === 0){
                                        layer.msg('请选择需要提交的信息', {time : 3000, offset: '100px'});
                                    } else {
                                        let isSubmit = false;
                                        $.each(data,function(index,item){
                                            if(item.isSubmit== '已提交'){
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
                                if(data.isSubmit=='未提交' && data.status !='退回'){
                                    return;
                                }
                                detail_shenheProcess('教学奖惩-教学名师-查看审核流程',data);
                            } else if (obj.event === 'update') {
                                if(data.isSubmit== '已提交'){
                                    // layer.msg('信息已提交，不可编辑', {icon:7, time : 3000, offset: '100px'});
                                    return;
                                }
                                //执行编辑
                                let layerIndex = layer.open({
                                    title : '教学奖惩-教学名师-编辑'
                                    ,type : 1
                                    ,area : [ '900px', '450px' ]
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
                                            $.post(requestUrl+'/jxms/update.do',data.field,function(result_data){
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
                                    // layer.msg('信息已提交，不可删除', {icon:7, time : 3000, offset: '100px'});
                                    return;
                                }
                                layer.confirm('删除后不可恢复，真的要删除么？', {icon: 3, title:'提示', offset: '100px'}, function(index) {
                                    $.post(requestUrl+'/jxms/delete.do', { "objCode": data.code},function(result_data){
                                        if(result_data.code == 200){
                                            myself_table.reload();//重新加载表格数据
                                        }
                                        layer.msg(result_data.msg, { offset: '100px'},function () {
                                            layer.close(index);
                                        });
                                    }, "json");
                                });
                            }
                        });
                    }
                });//table end.

            } else{
                $('#myself').remove();
                $('#myself_item').remove();
                $('#other').removeClass().addClass("layui-this");
                $('#other_item').removeClass().addClass("layui-tab-item layui-show");
            }
            if(data.isShenhe > 0){ //拥有审核权限

                laydate.render({
                    elem: "#other_datetimeYearStart" //指定元素
                    ,type: 'year'
                    ,max: new Date().getFullYear()+"-01-01"
                });
                laydate.render({
                    elem: "#other_datetimeYearEnd" //指定元素
                    ,type: 'year'
                    ,max: new Date().getFullYear()+"-01-01"
                });

                var other_table = table.render({//数据表格
                    id: "other_table"
                    ,elem : '#other_table'
                    ,height : 440
                    ,url: requestUrl+'/jxms/getPageList.do'
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
                        , last: '尾页'
                    }
                    ,limit: 10
                    ,even: true
                    ,toolbar: '#other_toolbar'
                    ,cols : [[ //表头
                        {type:'checkbox', fixed: 'left'}
                        ,{type:'numbers', title:'序号', width:80, fixed: 'left'}
                        ,{field: 'userId', title: '教师工号', width:150, sort:true}
                        ,{field: 'userName', title: '教师姓名', width:150, sort:true}
                        ,{field: 'userUnit', title: '教师单位', width:150, sort:true}
                        ,{field: 'level1', title: '获奖级别', width:150, sort:true}
                        ,{field: 'title', title: '称号', width:150, sort:true}
                        ,{field: 'grantUnit', title: '证书授予机构', width:150, sort:true}
                        ,{field: 'datetimeYear', title: '获奖日期', width:150, sort:true}
                        ,{field: 'shenheStatus', title: '审核状态', width:120, sort:true,templet: function(data){ // 函数返回一个参数 data，包含接口返回的所有字段和数据
                                var val = data.shenheStatus;
                                if(val=='已审核'){
                                    return '<span style="color: #009688;font-weight: bold;">'+val+'</span>';
                                }
                                return '<span style="color: red;font-weight: bold;">'+val+'</span>';
                            }
                        }
                        ,{fixed: 'right', width:180, align:'center', toolbar: '#other_bar'} //这里的toolbar值是模板元素的选择器
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
                                        'level1': $(".other_search select[name='level1']").val()
                                        ,'datetimeYearStart': $(".other_search input[name='datetimeYearStart']").val()
                                        ,'datetimeYearEnd': $(".other_search input[name='datetimeYearEnd']").val()
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
                                $(".other_search select[name='level1']").val("");
                                $(".other_search select[name='level2']").val("");
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
                                        } else { //添加审核意见
                                            toShenHe(data);
                                        }
                                    }
                                    break;
                            }
                        });

                        //监听工具条
                        table.on('tool(other_table)', function(obj){
                            let row_data = obj.data;
                            if (obj.event === 'detail_dataInfo') {
                                detail_dataInfo(row_data,false,true); //标识是从审核列表进入详情页面
                            } else if (obj.event === 'detail_shenheProcess') {
                                detail_shenheProcess('教学奖惩-教学名师-查看审核流程',row_data);
                            }
                        });
                    }
                });//table end.

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
                    elem: "#datetimeYear" //指定元素
                    ,type: 'year'
                    // ,min: ''
                    ,max: new Date().getFullYear()+"-01-01" //直接设置年份还不行，格式“年-月-日”，参考链接：//https://www.layui.com/doc/modules/laydate.html#minmax
                });

                //自定义验证规则
                form.verify({
                    objName: function(value){
                        if(value.length > 64){
                            return '当前字符长度'+value.length+'（最大值64）';
                        }
                    }
                });

                //表单赋值
                form.val("editForm",{
                    "code":data.code
                    ,"level1" : data.level1
                    ,"title" : data.title
                    ,"grantUnit" : data.grantUnit
                    ,"datetimeYear" : data.datetimeYear
                    ,"userId":data.userId
                    ,"userName":data.userName
                    ,"userUnit":data.userUnit
                });
            };

            let detail_dataInfo = function (data,isSubmit,isShenHe) {
                if(isOpen){
                    return;
                }
                var isOpen = false;
                let options = {
                    title : '教学奖惩-教学名师-查看详情'
                    ,type : 1
                    ,area : [ '900px', '450px' ]
                    ,offset : '50px' //只定义top坐标，水平保持居中
                    ,shadeClose : true //点击遮罩关闭
                    ,btn : ['关闭']
                    ,content :  $('#dataInfo_container')
                    ,success: function(layero, index){
                        isOpen = true;

                        //基础信息
                        let html = '<table class="layui-table">\n' +
                            '           <tbody>\n' +
                            '              <tr>' +
                            '                <td style="width: 80px; text-align: right">教师工号：</td><td style="width: 120px;">'+data.userId+'</td>' +
                            '                <td style="width: 80px; text-align: right">教师姓名：</td><td style="width: 120px;">'+data.userName+'</td>' +
                            '              </tr>\n' +
                            '              <tr>' +
                            '                 <td style="width: 80px; text-align: right">教师单位：</td><td style="width: 120px;" colspan="3">'+data.userUnit+'</td>' +
                            '              </tr>\n' +
                            '              <tr>' +
                            '                <td style="width: 80px; text-align: right">等级：</td><td style="width: 120px;">'+data.level1+'</td>' +
                            '                <td style="width: 80px; text-align: right">称号：</td><td style="width: 120px;">'+data.title+'</td>' +
                            '              </tr>\n' +
                            '              <tr>' +
                            '                 <td style="width: 80px; text-align: right">证书授予机构：</td><td style="width: 120px;" colspan="3">'+data.grantUnit+'</td>' +
                            '              </tr>\n' +
                            '              <tr>' +
                            '                 <td style="width: 80px; text-align: right">获奖时间：</td><td style="width: 120px;" colspan="3">'+data.datetimeYear+'</td>' +
                            '              </tr>\n' +
                            '              <tr>' +
                            '                 <td style="width: 80px; text-align: right">数据录入时间：</td><td style="width: 120px;" colspan="3">'+data.createDate+'</td>' +
                            '              </tr>\n' +
                            '            </tbody>\n' +
                            '         </table>';
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
                        isOpen = false;
                        $('#fileList').empty();
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

            let toSubmit = function (row_dataArr){
                layer.confirm('信息提交后不可进行编辑、删除操作，是否继续提交？', {icon: 3, title:'提示', offset: '100px'}, function(index) {
                    $.post(requestUrl+'/jxms/toSubimt.do',{
                        "menuId":$.cookie('currentMenuId'),
                        "jsonStr":JSON.stringify(row_dataArr)
                    },function (result_data) {
                        if(result_data.code === 200){
                            myself_table.reload();//重新加载表格数据
                        }
                        layer.msg(result_data.msg, { offset: '100px'},function () {
                            layer.closeAll();
                        });
                    },'json');
                });
            };

            let toShenHe = function (row_dataArr) {
                let index = layer.open({
                    title : '教学奖惩-教学名师-审核'
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
                            $.post(requestUrl+'/jxms/toShenhe.do'
                                ,{
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
                                    if(result_data.code === 200){
                                        other_table.reload();//重新加载表格数据
                                    }
                                    layer.msg(result_data.msg, { offset: '100px'},function () {
                                        layer.closeAll();
                                    });
                                },'json');
                        });
                    }
                    ,end:function () {

                    }
                });
            };
        }
        ,error:function() {
            layer.msg('网络连接失败', {icon:7, time : 3000, offset: '100px'});
        }
    });
});
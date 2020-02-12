/*
教学奖惩-教育教学成果奖
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

                //数据表格
                var myself_table = table.render({
                    id: "myself_table"
                    ,elem : '#myself_table'
                    ,height : 440
                    ,url: requestUrl+'/jyjxcgj/getPageList.do'
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
                        ,{field: 'objName', title: '成果名称', width:120}
                        ,{field: 'personRank', title: '本人排名', width:120}
                        ,{field: 'unitRank', title: '完成单位排名', width:120}
                        ,{field: 'level_1', title: '级别', width:120}
                        ,{field: 'level_2', title: '奖项', width:120}
                        ,{field: 'prizeTime', title: '获奖时间', width:120}
                        ,{field: 'certificateCode', title: '获奖证书编号', width:120}
                        ,{field: 'grantUnit', title: '授予单位', width:120}
                        ,{field: 'isSubmit', title: '提交状态', width:120,templet: function(data){
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
                        ,{field: 'status', title: '审核状态', width:120,templet: function(data){
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
                                        'objName': $(".myself_search input[name='objName']").val()
                                        ,'isSubmit': $("#isSubmit option:selected").val() //获取选中的值
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
                                $("#isSubmit").val("");
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
                                    //清空表单数据
                                    document.getElementById("editForm").reset();
                                    //业务数据编号
                                    let code = new Date().getTime();
                                    $("#editForm input[ name='code' ] ").val(code);
                                    //
                                    layer.open({
                                        title : '教学奖惩-教育教学成果奖-新增'
                                        ,type : 1
                                        ,offset : '20px'
                                        // ,shadeClose : true //禁用点击遮罩关闭弹窗
                                        ,area : [ '900px', '500px' ]
                                        ,content : $('#insertOrUpdate_container')
                                        ,success: function(layero, index){
                                            //初始化laydate实例
                                            laydate.render({
                                                elem: '#prizeTime' //指定元素
                                                // ,type: 'datetime'
                                                // ,showBottom: false
                                            });

                                            //表单赋值
                                            form.val('editForm', {
                                                "userId":function () {
                                                    return $.cookie('userId');
                                                }
                                                ,"userName":function () {
                                                    return $.cookie('userName');
                                                }
                                            });

                                            //自定义验证规则
                                            form.verify({
                                                objName: function(value){
                                                    if(value.length > 64){
                                                        return '当前字符长度'+value.length+'（最大值64）';
                                                    }
                                                }
                                            });

                                            //监听表单提交
                                            form.on('submit(editFormSubmitBtn)', function(data){
                                                 /*layer.alert(JSON.stringify(data.field), {
                                                     title: '最终的提交信息'
                                                 });
                                                 return false;*/
                                                $.post(requestUrl+'/jyjxcgj/insert.do',{
                                                    "code":data.field.code
                                                    ,"userId": data.field.userId
                                                    ,"userName": data.field.userName
                                                    ,"objName": data.field.objName
                                                    ,"personRank" : data.field.personRank
                                                    ,"unitRank" : data.field.unitRank
                                                    ,"level_1" : data.field.level_1
                                                    ,"level_2" : data.field.level_2
                                                    ,"prizeTime" : data.field.prizeTime
                                                    ,"certificateCode" : data.field.certificateCode
                                                    ,"grantUnit" : data.field.grantUnit
                                                },function(result_data){
                                                    if(result_data.code == 200){
                                                        myself_table.reload();//重新加载表格数据
                                                    }
                                                    layer.msg(result_data.msg, {time : 3000, offset: '100px'});
                                                },'json');
                                            });
                                        }
                                        ,cancel: function(index, layero){
                                            layer.confirm('填写的信息将会清空，确定要关闭吗？', {icon: 3, title:'提示', offset: '100px'}, function() {
                                                $.post(requestUrl+'/deleteFileInfo.do', { "relationCode": code});
                                                layer.close(index);
                                            });
                                            return false;
                                        }
                                        ,end:function () {
                                            window.location.reload();//刷新页面，清空上传弹窗上传的文件内容
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
                                detail_shenheProcess('教学奖惩-教育教学成果奖-查看审核流程',data);
                            } else if (obj.event === 'update') {
                                if(data.isSubmit== '已提交'){
                                    // layer.msg('信息已提交，不可编辑', {icon:7, time : 3000, offset: '100px'});
                                    return;
                                }
                                //执行编辑
                                operationType = "update";
                                let editForm_idx = layer.open({
                                    title : '教学奖惩-教育教学成果奖-编辑'
                                    ,type : 1
                                    ,area : [ '900px', '500px' ]
                                    ,offset : '10px'
                                    ,shadeClose : true //点击遮罩关闭
                                    ,content : $('#insertOrUpdate_container')
                                    ,success: function(layero, index){
                                        //所有编辑页面，均增加取消按钮，不保存当前修改的内容。
                                        let cancelBtn = $('<button class="layui-btn layui-btn-primary">取消</button>');
                                        $("#editForm .layui-btn-container").append(cancelBtn);
                                        cancelBtn.click(function (event) {
                                            // event.preventDefault();
                                            layer.close(editForm_idx);
                                        });

                                        //初始化laydate实例
                                        laydate.render({
                                            elem: '#prizeTime' //指定元素
                                            // ,type: 'datetime'
                                            // ,showBottom: false
                                        });
                                        //表单赋值
                                        form.val("editForm",{
                                            "code":data.code
                                            ,"userId":data.userId
                                            ,"userName":data.userName
                                            ,"objName": data.objName
                                            ,"personRank" : data.personRank
                                            ,"unitRank" : data.unitRank
                                            ,"level_1" : data.level_1
                                            ,"level_2" : data.level_2
                                            ,"prizeTime" : data.prizeTime
                                            ,"certificateCode" : data.certificateCode
                                            ,"grantUnit" : data.grantUnit
                                        });
                                        //监听表单提交
                                        form.on('submit(editFormSubmitBtn)', function(data){
                                            $.post(requestUrl+'/jyjxcgj/update.do',{
                                                "code":data.field.code
                                                ,"userId": data.field.userId
                                                ,"userName": data.field.userName
                                                ,"objName": data.field.objName
                                                ,"personRank" : data.field.personRank
                                                ,"unitRank" : data.field.unitRank
                                                ,"level_1" : data.field.level_1
                                                ,"level_2" : data.field.level_2
                                                ,"prizeTime" : data.field.prizeTime
                                                ,"certificateCode" : data.field.certificateCode
                                                ,"grantUnit" : data.field.grantUnit
                                            },function(result_data){
                                                if(result_data.code == 200){
                                                    myself_table.reload();//重新加载表格数据
                                                }
                                                layer.msg(result_data.msg, {time : 3000, offset: '100px'});
                                            },'json');
                                        });
                                    },end:function () {
                                        operationType=="";
                                        window.location.reload();//刷新页面，清空上传弹窗上传的文件内容
                                    }
                                });
                            } else if (obj.event === 'delete') {
                                if(data.isSubmit== '已提交'){
                                    // layer.msg('信息已提交，不可删除', {icon:7, time : 3000, offset: '100px'});
                                    return;
                                }
                                layer.confirm('删除后不可恢复，真的要删除么？', {icon: 3, title:'提示', offset: '100px'}, function(index) {
                                    layer.close(index);
                                    $.post(requestUrl+'/jyjxcgj/delete.do', { "objCode": data.code},function(result_data){
                                        if(result_data.code == 200){
                                            myself_table.reload();//重新加载表格数据
                                        }
                                        layer.msg(result_data.msg, {time : 3000, offset: '100px'});
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
                var other_table = table.render({//数据表格
                    id: "other_table"
                    ,elem : '#other_table'
                    ,height : 440
                    ,url: requestUrl+'/jyjxcgj/getPageList.do'
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
                    ,toolbar: '#other_toolbar'
                    ,cols : [[ //表头
                        {type:'checkbox', fixed: 'left'}
                        ,{type:'numbers', title:'序号', width:80, fixed: 'left'}
                        ,{field: 'objName', title: '成果名称', width:120}
                        ,{field: 'personRank', title: '本人排名', width:120}
                        ,{field: 'unitRank', title: '完成单位排名', width:120}
                        ,{field: 'level_1', title: '级别', width:120}
                        ,{field: 'level_2', title: '奖项', width:120}
                        ,{field: 'prizeTime', title: '获奖时间', width:120}
                        ,{field: 'certificateCode', title: '获奖证书编号', width:120}
                        ,{field: 'grantUnit', title: '授予单位', width:120}
                        ,{field: 'shenheStatus', title: '审核状态', width:120,templet: function(data){ // 函数返回一个参数 data，包含接口返回的所有字段和数据
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
                                        'userId': $(".other_search input[name='userId']").val()
                                        ,'userName': $(".other_search input[name='userName']").val()
                                        ,'objName': $(".other_search input[name='objName']").val()
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
                                detail_shenheProcess('教学奖惩-教育教学成果奖-查看审核流程',row_data);
                            }
                        });
                    }
                });//table end.

            } else{
                $('#other').remove();
                $('#other_item').remove();
            }

            //上传附件
            let operationType=""; //当前操作类别
            $('#upfile').click(function(){
                layer.open({
                    title : '教学奖惩-教育教学成果奖-上传附件'
                    ,type : 1
                    ,area : [ '700px', '300px' ]
                    ,offset : '100px'
                    ,moveOut:true
                    ,shadeClose : true //点击遮罩关闭
                    ,content : $('#uploadFile_container')
                    ,success: function(layero, index){
                        if(operationType =="update"){
                            $.get(requestUrl+"/getFileListByRelationCode.do" , {
                                "relationCode": $("#editForm input[ name='code' ] ").val()
                            } ,  function(data){
                                if(data.data.length>0){
                                    $.each(data.data,function(index,fileInfo){
                                        let tr = $(['<tr id="'+ fileInfo.code +'">'
                                            ,'<td style="text-align: center;">	<a href="javascript:void(0)">'+ fileInfo.fileName +'</a></td>'
                                            ,'<td style="text-align: center;">已上传</td>'
                                            ,'<td style="text-align: center;">' +
                                            '   <button class="layui-btn layui-btn-xs layui-btn-normal upfile_preview">预览</button>' +
                                            '   <button class="layui-btn layui-btn-xs layui-btn-danger upfile_delete">删除</button>' +
                                            '</td>'
                                            ,'</tr>'].join(''));
                                        $('#upfileList').append(tr);
                                        //预览
                                        tr.find('a').on('click', function(){//点击文件名
                                            preview_fileInfo(fileInfo);
                                        });
                                        tr.find('.upfile_preview').on('click', function(){//点击预览按钮
                                            preview_fileInfo(fileInfo);
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
                        }
                        //上传附件
                        let upfileList = $('#upfileList')
                            ,upfileIns = upload.render({
                                                elem: '#upfileIns'
                                                ,url: requestUrl+'/uploadFileInfo.do' // 	服务端上传接口
                                                ,data:{ //请求上传接口的额外参数。如：data: {id: 'xxx'}
                                                    "relationCode":function () {
                                                        return $("#editForm input[ name='code' ] ").val();
                                                    }
                                                    ,"fileCategory":"JXJC_JYJXCGJ" // 固定值
                                                    ,"fileType":"附件" // 固定值
                                                    ,"userId":function () {
                                                        return $.cookie('userId');
                                                    }
                                                    ,"userName":function () {
                                                        return $.cookie('userName');
                                                    }
                                                }
                                                ,field:"file" //设定文件域的字段名
                                                ,multiple: true // 	是否允许多文件上传
                                                ,accept: 'file'//指定允许上传时校验的文件类型，可选值有：images（图片）、file（所有文件）、video（视频）、audio（音频）
                                                ,exts:'pdf'
                                                ,choose: function(obj){
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
                                                        let tr = upfileList.find('tr#upfile_'+ index)
                                                            ,tds = tr.children();
                                                        tr.attr("data-id",res.data.code);//
                                                        tds.eq(1).html('<span style="color: #5FB878;">已上传</span>');
                                                        // tds.eq(2).html(''); //清空操作

                                                        //预览
                                                        let fileInfo = res.data;
                                                        tr.find('a').on('click', function(){//点击文件名
                                                            preview_fileInfo(fileInfo);
                                                        });
                                                        tr.find('.upfile_preview').on('click', function(){//点击预览按钮
                                                            preview_fileInfo(fileInfo);
                                                        });
                                                        //
                                                        return delete this.files[index]; //删除文件队列已经上传成功的文件
                                                    }
                                                    this.error(index, upload);
                                                }
                                                ,error: function(index, upload){
                                                    let tr = upfileList.find('tr#upfile_'+ index)
                                                        ,tds = tr.children();
                                                    tds.eq(1).html('<span style="color: #FF5722;">上传失败</span>');
                                                }
                                            });
                    },end:function () {
                        //重载上传实例
                        if(operationType=="update"){
                            $("#upfileList").empty();
                        }
                    }
                });
            });

            let detail_dataInfo = function (data,isSubmit,isShenHe) {

                if(isOpen){
                    return;
                }
                var isOpen = false;
                let options = {
                    title : '教学奖惩-教育教学成果奖-查看详情'
                    ,type : 2
                    ,area : [ '900px', '500px' ]
                    // ,area : '500px'//只想定义宽度时，你可以area: '500px'，高度仍然是自适应的
                    ,offset : '10px' //只定义top坐标，水平保持居中
                    ,shadeClose : true //点击遮罩关闭
                    ,btn : ['关闭']
                    ,content :  '../common_dataInfo.html'
                    ,success: function(layero, index){
                        isOpen = true;
                        //基础信息
                        let htmlStr = '<table class="layui-table">\n' +
                            '           <tbody>\n' +
                            '              <tr>' +
                            '                <td style="width: 80px; text-align: right">工号：</td><td style="width: 120px;">'+data.userId+'</td>' +
                            '                <td style="width: 80px; text-align: right">姓名：</td><td style="width: 120px;">'+data.userName+'</td>' +
                            '              </tr>\n' +
                            '              <tr>' +
                            '                 <td style="width: 80px; text-align: right">成果名称：</td><td style="width: 120px;" colspan="3">'+data.objName+'</td>' +
                            '              </tr>\n' +
                            '              <tr>' +
                            '                 <td style="width: 80px; text-align: right">本人排名：</td><td style="width: 120px;" colspan="3">'+data.personRank+'</td>' +
                            '              </tr>\n' +
                            '              <tr>' +
                            '                 <td style="width: 80px; text-align: right">完成单位排名：</td><td style="width: 120px;" colspan="3">'+data.unitRank+'</td>' +
                            '              </tr>\n' +
                            '              <tr>' +
                            '                <td style="width: 80px; text-align: right">级别：</td><td style="width: 120px;">'+data.level_1+'</td>' +
                            '                <td style="width: 80px; text-align: right">奖项：</td><td style="width: 120px;">'+data.level_2+'</td>' +
                            '              </tr>\n' +
                            '              <tr>' +
                            '                 <td style="width: 80px; text-align: right">获奖时间：</td><td style="width: 120px;" colspan="3">'+data.prizeTime+'</td>' +
                            '              </tr>\n' +
                            '              <tr>' +
                            '                 <td style="width: 80px; text-align: right">获奖证书编号：</td><td style="width: 120px;" colspan="3">'+data.certificateCode+'</td>' +
                            '              </tr>\n' +
                            '              <tr>' +
                            '                 <td style="width: 80px; text-align: right">授予单位：</td><td style="width: 120px;" colspan="3">'+data.grantUnit+'</td>' +
                            '              </tr>\n' +
                            '              <tr>' +
                            '                 <td style="width: 80px; text-align: right">数据录入时间：</td><td style="width: 120px;" colspan="3">'+data.createDate+'</td>' +
                            '              </tr>\n' +
                            '            </tbody>\n' +
                            '         </table>';
                        // $("#baseInfo").html(htmlStr);
                        $("#layui-layer-iframe"+iframeIndex).contents().find("#baseInfo").html(htmlStr);
                        //附件列表
                        $.get(requestUrl+"/getFileListByRelationCode.do" , {
                            "relationCode": function () {
                                return data.code;
                            }
                        } ,  function(result_data){
                            if(result_data.data.length ===0){
                                let tr = '<tr><td colspan="3" style="text-align: center;">无数据</td></tr>';
                                $("#layui-layer-iframe"+iframeIndex).contents().find("#fileList").append(tr);
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
                                        preview_fileInfo(fileInfo);
                                    });
                                    tr.find('.upfile_preview').on('click', function(){
                                        preview_fileInfo(fileInfo);
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
                                    $("#layui-layer-iframe"+iframeIndex).contents().find("#fileList").append(tr);
                                });
                            }
                        }, "json");
                    }
                    ,end:function () {
                        isOpen = false;
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
                //返回一个当前层索引
                var iframeIndex = layer.open(options);
            };

            let toSubmit = function (row_dataArr){
                layer.confirm('信息提交后不可进行编辑、删除操作，是否继续提交？', {icon: 3, title:'提示', offset: '100px'}, function(index) {
                    $.post(requestUrl+'/jyjxcgj/toSubimt.do',{
                        "menuId":$.cookie('currentMenuId'),
                        "jsonStr":JSON.stringify(row_dataArr)
                    },function (result_data) {
                        if(result_data.code === 200){
                            myself_table.reload();//重新加载表格数据
                        }
                        layer.closeAll();
                        layer.msg(result_data.msg, {time : 3000, offset: '100px'});
                    },'json');
                });
            };

            let toShenHe = function (row_dataArr) {
                layer.open({
                    title : '教学奖惩-教育教学成果奖-审核'
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
                            }else{
                                $('#opinion').empty();
                            }

                        });
                        //
                        form.on('submit(shenHeFormSubmitBtn)', function(formData){
                            $.post(requestUrl+'/jyjxcgj/toShenhe.do'
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
                                    // window.location.reload();//刷新页面，审核后页面状态未改变
                                }
                                layer.msg(result_data.msg, {time : 3000, offset: '100px'});
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
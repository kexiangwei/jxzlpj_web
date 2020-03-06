/*
教学设计-教学大纲
 */
layui.use(['layer','element','table','form','upload'], function(){
    var $ = layui.$,layer = layui.layer,element = layui.element,table = layui.table,form = layui.form,upload = layui.upload;

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
                    id: guid()
                    ,elem : '#myself_table'
                    ,height : 440
                    ,url: requestUrl+'/jxdg/getCourseList.do'
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
                    ,toolbar: '#myself_toolbar' //指向自定义工具栏模板选择器
                    ,cols : [[ //表头
                        {type:'checkbox', fixed: 'left'}
                        ,{type:'numbers', title:'序号', width:80, fixed: 'left'}
                        ,{field: 'code', title: '课程编号', width:150}
                        ,{field: 'nameZh', title: '课程中文名称', width:150}
                        ,{field: 'nameEn', title: '课程英文名称', width:150, hide:true}
                        ,{field: 'type', title: '课程类别', width:150}
                        ,{field: 'score', title: '学分', width:120, sort:true}
                        ,{field: 'stuHour', title: '学时', width:120, sort:true}
                        ,{field: 'collegeName', title: '开课部门', width:150}
                        ,{field: 'isSubmit', title: '提交状态', width:120,templet: function(data){ // 函数返回一个参数 data，包含接口返回的所有字段和数据
                                var val = data.isSubmit;
                                if(val=='已提交'){
                                    var htmlstr = ' <a class="layui-btn layui-btn-primary layui-btn-xs" lay-event="detail_dataInfo">查看信息</a>\n' +
                                        '           <a class="layui-btn layui-btn-normal layui-btn-xs" lay-event="detail_shenheProcess">查看流程</a>\n' +
                                        '           <a class="layui-btn layui-btn-normal layui-btn-xs" lay-event="detail_fileInfo">预览</a>' +
                                        '           <a class="layui-btn layui-btn-disabled layui-btn-xs" lay-event="upload_fileInfo">上传</a>';
                                    $('#myself_bar').html(htmlstr);
                                    return '<span style="color: blue;font-weight: bold;">'+val+'</span>';
                                }
                                var htmlstr = ' <a class="layui-btn layui-btn-primary layui-btn-xs" lay-event="detail_dataInfo">查看信息</a>\n' +
                                    '           <a class="layui-btn layui-btn-disabled layui-btn-xs" lay-event="detail_shenheProcess">查看流程</a>\n' +
                                    '           <a class="layui-btn layui-btn-normal layui-btn-xs" lay-event="detail_fileInfo">预览</a>\n' +
                                    '           <a class="layui-btn layui-btn-warm layui-btn-xs" lay-event="upload_fileInfo">上传</a>';
                                $('#myself_bar').html(htmlstr);
                                return '<span style="font-weight: bold;">'+val+'</span>';
                            }
                        }
                        ,{field: 'status', title: '审核状态', width:120,templet: function(data){ // 函数返回一个参数 data，包含接口返回的所有字段和数据
                                var val = data.status;
                                if(val=='退回'){
                                    return '<span style="color: red;font-weight: bold;">'+val+'</span>';
                                }
                                return '<span style="color: blue;font-weight: bold;">'+(val != null ? val : '待审核')+'</span>';
                            }
                        }
                        ,{fixed: 'right', width:280, align:'center', toolbar: '#myself_bar'} //这里的toolbar值是模板元素的选择器
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
                                        'courseCode': $(".myself_search input[name='myself_courseCode']").val()
                                        ,'courseName': $(".myself_search input[ name='myself_courseName']").val()
                                        ,'isSubmit': $(".myself_search input[ name='myself_isSubmit']").val()
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
                                case 'submit':
                                    if(data.length === 0){
                                        layer.msg('请选择需要提交的信息', {time : 3000, offset: '100px'});
                                    } else {
                                        let isSubmit = false;
                                        $.each(data,function(idx,obj){
                                            if(obj.isSubmit == '已提交'){
                                                isSubmit = true;
                                                return false;//跳出循环
                                            }
                                        });
                                        if(isSubmit){
                                            layer.msg('您选择了已提交的信息！', {time : 3000, offset: '100px'});
                                            return;
                                        }
                                        //
                                        layer.confirm('信息提交后不可编辑，是否继续提交？', {icon: 3, title:'提示', offset: '100px'}, function(index) {
                                            layer.close(index);
                                            $.post(requestUrl+'/jxdg/toSubimt.do',{
                                                "menuId":$.cookie('currentMenuId'),
                                                "jsonStr":JSON.stringify(data)
                                            },function (result_data) {
                                                layer.msg(result_data.msg, {time : 3000, offset: '100px'});
                                                if(result_data.code === 200){
                                                    myself_table.reload();//重新加载表格数据
                                                }
                                            },'json');
                                        });
                                    }
                                    break;
                            }
                        });

                        //监听行工具条事件
                        table.on('tool(myself_table)', function(obj){
                            let row_data = obj.data;
                            if (obj.event === 'detail_dataInfo') {
                                detail_dataInfo(row_data);
                            } else if (obj.event === 'detail_shenheProcess') {
                                if(row_data.isSubmit=='未提交'){
                                    return;
                                }
                                detail_shenheProcess( '教学设计-教学大纲-查看审核流程',row_data);
                            } else if (obj.event === 'detail_fileInfo') {
                                detail_fileInfo(row_data);
                            } else if (obj.event === 'upload_fileInfo') {
                                if(row_data.isSubmit == '已提交'){
                                    return;
                                }
                                layer.open({
                                    id : guid()
                                    ,title : '教学设计-教学大纲-上传附件'
                                    ,type : 1
                                    ,area : [ '900px', '500px' ]
                                    ,offset : '50px'
                                    ,moveOut:true
                                    ,shadeClose : true //点击遮罩关闭
                                    ,btn : ['关闭']
                                    ,content : $('#uploadFile_ontainer')
                                    ,success: function(layero, index){
                                        //填充已上傳附件
                                        $.get(requestUrl+"/getFileListByRelationCode.do" , {
                                            "relationCode": row_data.code
                                        } ,  function(data){
                                            if(data.data.length>0){
                                                $.each(data.data,function(index,file){
                                                    let tr = $(['<tr id="'+ file.code +'">'
                                                        ,'<td>'+ file.fileName +'</td>'
                                                        ,'<td>已上传</td>'
                                                        ,'<td><button class="layui-btn layui-btn-xs layui-btn-danger demo-delete">删除</button></td>'
                                                        ,'</tr>'].join(''));
                                                    $('#demoList').append(tr);
                                                    //删除
                                                    tr.find('.demo-delete').on('click', function(){
                                                        $.post(requestUrl+"/deleteFileInfo.do" , {
                                                            "code": tr.attr("id")
                                                        } ,  function(data){
                                                            tr.remove();
                                                        }, "json");
                                                    });
                                                });
                                            }
                                        }, "json");

                                        //上传附件
                                        let demoListView = $('#demoList')
                                            ,uploadListIns = upload.render({
                                            elem: '#testList'
                                            ,url: requestUrl+'/uploadFileInfo.do' // 	服务端上传接口
                                            ,data:{ //请求上传接口的额外参数。如：data: {id: 'xxx'}
                                                "relationCode":row_data.code
                                                ,"fileCategory":"JXSJ_JXDG" // 固定值
                                                ,"fileType":"教学大纲" // 固定值
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
                                            ,exts:'doc|docx|pdf'
                                            ,choose: function(obj){
                                                var files = this.files = obj.pushFile(); //将每次选择的文件追加到文件队列
                                                //读取本地文件
                                                obj.preview(function(index, file, result){
                                                    var tr = $(['<tr id="upload-'+ index +'">'
                                                        ,'<td>'+ file.name +'</td>'
                                                        ,'<td>待上传</td>'
                                                        ,'<td>'
                                                        // ,'<button class="layui-btn layui-btn-xs demo-reload layui-hide">重传</button>'
                                                        ,'<button class="layui-btn layui-btn-xs layui-btn-danger demo-delete">删除</button>'
                                                        ,'</td>'
                                                        ,'</tr>'].join(''));
                                                    demoListView.append(tr);

                                                    //删除
                                                    tr.find('.demo-delete').on('click', function(){
                                                        $.post(requestUrl+"/deleteFileInfo.do" , {
                                                            "code": $('#upload-'+index).attr("data-id")
                                                        } ,  function(data){
                                                            // layer.msg(data.msg);
                                                            delete files[index]; //删除对应的文件
                                                            tr.remove();
                                                            uploadListIns.config.elem.next()[0].value = ''; //清空 input file 值，以免删除后出现同名文件不可选
                                                        }, "json");
                                                    });
                                                });
                                            }
                                            ,done: function(res, index, upload){
                                                if(res.code == 200){ //上传成功
                                                    var tr = demoListView.find('tr#upload-'+ index)
                                                        ,tds = tr.children();
                                                    tr.attr("data-id",res.data.code);//
                                                    tds.eq(1).html('<span style="color: #5FB878;">已上传</span>');
                                                    // tds.eq(3).html(''); //清空操作
                                                    return delete this.files[index]; //删除文件队列已经上传成功的文件
                                                }
                                                this.error(index, upload);
                                            }
                                            ,error: function(index, upload){
                                                let tr = demoListView.find('tr#upload-'+ index)
                                                    ,tds = tr.children();
                                                tds.eq(2).html('<span style="color: #FF5722;">上传失败</span>');
                                            }
                                        });
                                    },end:function () {
                                        window.location.reload();//刷新页面
                                    }
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
                element.on('tab(layui_tab)', function(data){
                    if(data.index == 1){ //
                        other_table.reload(); //重新加载表格数据
                    }
                });

                var other_table = table.render({//数据表格
                    id: guid()
                    ,elem : '#other_table'
                    ,height : 440
                    ,url: requestUrl+'/jxdg/getCourseList.do'
                    ,where:{
                        "shenHeUserId":function () { //用于区分是当前登录用户还是查询参数中的用户
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
                        ,{type:'numbers', title:'序号', width:80, fixed: 'left'}
                        ,{field: 'userId', title: '教师编号', width:150}
                        ,{field: 'userName', title: '教师姓名', width:150}
                        ,{field: 'code', title: '课程编号', width:150}
                        ,{field: 'nameZh', title: '课程中文名称', width:150}
                        ,{field: 'nameEn', title: '课程英文名称', width:150, hide:true}
                        ,{field: 'type', title: '课程类别', width:150}
                        ,{field: 'score', title: '学分', width:120, sort:true}
                        ,{field: 'stuHour', title: '学时', width:120, sort:true}
                        ,{field: 'collegeName', title: '开课部门', width:150}
                        ,{field: 'shenheStatus', title: '审核状态', width:120,templet: function(data){ // 函数返回一个参数 data，包含接口返回的所有字段和数据
                                let val = data.shenheStatus;
                                if(val=='已审核'){
                                    return '<span style="color: blue;font-weight: bold;">'+val+'</span>';
                                }
                                return '<span style="color: red;font-weight: bold;">'+val+'</span>';
                            }
                        } //【已审核 | 待审核 | 退回】
                        ,{fixed: 'right', width:260, align:'center', toolbar: '#other_bar'} //这里的toolbar值是模板元素的选择器
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
                                        'userId': $(".other_search input[ name='other_userId' ] ").val()
                                        ,'userName': $(".other_search input[ name='other_userName' ] ").val()
                                        ,'courseCode': $(".other_search input[ name='other_courseCode' ] ").val()
                                        ,'courseName': $(".other_search input[ name='other_courseName' ] ").val()
                                        ,'shenheStatus': $(".other_search input[ name='other_shenheStatus' ] ").val()
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
                                        let isSubmit = false;
                                        $.each(data,function(idx,obj){
                                            if(obj.shenheStatus== '已审核'){
                                                isSubmit = true;
                                                return false;//跳出循环
                                            }
                                        });
                                        if(isSubmit){
                                            layer.msg('您选择了已审核的信息！', {time : 3000, offset: '100px'});
                                            return;
                                        } else {
                                            //添加审核意见
                                            layer.open({
                                                id : guid()
                                                ,title : '教学设计-教学大纲-添加审核意见'
                                                ,type : 2
                                                ,area : [ '700px', '300px' ]
                                                ,offset : '100px' //只定义top坐标，水平保持居中
                                                ,shadeClose : true //点击遮罩关闭
                                                ,content : '../../common/common_shenHe.html'
                                                ,success: function(layero, index){
                                                    //
                                                    var body = layer.getChildFrame('body', index);
                                                    var iframeWin = window[layero.find('iframe')[0]['name']];
                                                    iframeWin.params = {
                                                        module : 'jxdg'
                                                        ,userId: $.cookie('userId')
                                                        ,userName: $.cookie('userName')
                                                        ,rowDatas : rowDatas
                                                    };
                                                }
                                                ,end:function () {
                                                    other_table.reload();//重新加载表格数据
                                                }
                                            });
                                        }
                                    }
                                    break;
                            }
                        });

                        //监听工具条
                        table.on('tool(other_table)', function(obj){
                            let row_data = obj.data;
                            if (obj.event === 'detail_dataInfo') {
                                detail_dataInfo(row_data);
                            } else if (obj.event === 'detail_fileInfo') {
                                detail_fileInfo(row_data);
                            } else if (obj.event === 'detail_shenheProcess') {
                                detail_shenheProcess( '教学设计-教学大纲-查看审核流程',row_data);
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
                    id: guid()
                    ,title : '教学设计-教学大纲-查看信息'
                    ,type : 1
                    ,area : [ '900px', '500px' ]
                    ,offset : '50px' //只定义top坐标，水平保持居中
                    ,shadeClose : true //点击遮罩关闭
                    ,btn : ['关闭']
                    ,content : '<table class="layui-table">\n' +
                        '        <tbody>\n' +
                        '            <tr><td style="width: 150px; text-align: center">教师工号</td><td>'+data.userId+'</td></tr>\n' +
                        '            <tr><td style="width: 150px; text-align: center">教师姓名</td><td>'+data.userName+'</td></tr>\n' +
                        '            <tr><td style="width: 150px; text-align: center">课程编号</td><td>'+data.code+'</td></tr>\n' +
                        '            <tr><td style="width: 150px; text-align: center">课程中文名称</td><td>'+data.nameZh+'</td></tr>\n' +
                        '            <tr><td style="width: 150px; text-align: center">课程英文名称</td><td>'+data.nameEn+'</td></tr>\n' +
                        '            <tr><td style="width: 150px; text-align: center">课程类别</td><td>'+data.type+'</td></tr>\n' +
                        '            <tr><td style="width: 150px; text-align: center">学分</td><td>'+data.score+'</td></tr>\n' +
                        '            <tr><td style="width: 150px; text-align: center">学时</td><td>'+data.stuHour+'</td></tr>\n' +
                        '            <tr><td style="width: 150px; text-align: center">开课部门</td><td>'+data.collegeName+'</td></tr>\n' +
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
                    id: guid()
                    ,title : '教学设计-教学大纲-查看附件'
                    ,type : 1
                    ,area : [ '900px', '500px' ]
                    ,offset : '50px'
                    ,moveOut:true
                    ,shadeClose : true //点击遮罩关闭
                    ,btn: ['关闭']
                    ,content : $('#fileInfo_container')
                    ,success: function(layero, index){
                        $.get(requestUrl+"/getFileListByRelationCode.do" , {
                            "relationCode": function () {
                                return data.code;
                            }
                        } ,  function(data){
                            if(data.data.length==0){
                                $('#fileList').append('<tr><td colspan="3" style="text-align: center;">无数据</td></tr>');
                                return;
                            }
                            $.each(data.data,function(index,file){
                                let tr = $(['<tr id="'+ file.code +'">'
                                    ,'<td>	<a href="'+requestUrl+file.filePath+'" target="_blank">'+ file.fileName +'</a></td>'
                                    ,'<td>'+ file.createDate +'</td>'
                                    ,'<td>' +
                                    '   <button class="layui-btn layui-btn-xs layui-btn-normal detail">预览</button>' +
                                    '   <button class="layui-btn layui-btn-xs layui-btn-normal download">下载</button>' +
                                    '</td>'
                                    ,'</tr>'].join(''));

                                //预览
                                tr.find('.detail').on('click', function(){
                                    window.open(requestUrl+file.filePath);
                                });
                                //下载
                                tr.find('.download').on('click', function(){
                                    let downloadForm = $("<form action='"+requestUrl+"/downloadFileInfo.do' method='post'></form>");
                                    downloadForm.append("<input type='hidden' name='fileName' value='"+file.fileName+"'/>");
                                    downloadForm.append("<input type='hidden' name='filePath' value='"+file.filePath+"'/>");
                                    $(document.body).append(downloadForm);
                                    downloadForm.submit();
                                    downloadForm.remove();
                                });
                                $('#fileList').append(tr);
                            });
                        }, "json");
                    }
                    ,end:function () {
                        $('#fileList').empty();
                    }
                });
            };
        }
        ,error:function() {
            layer.msg('网络连接失败', {icon:7, time : 3000, offset: '100px'});
        }
    });
});
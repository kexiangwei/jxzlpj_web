/**
 *教学评价-学生评教
 */
layui.use(['layer','table','form'], function(){
    let $ = layui.$,layer = layui.layer,table = layui.table,form = layui.form;

    var accountType = $.cookie('accountType');
    if(accountType == 'student'){
        //
        $.get(requestUrl+'/getExecTemplate.do',{'templateType':'学生评教'},function (result_data) {
            //系统可以设定评教时间段，非时间段内，学生进入不了评教模块
            if(result_data.code != 200){ //是否评教时间
                layer.msg('评教时间已过', {time : 3000, offset: '100px'});
                return;
            }

            //显示评教要求
            layer.open({
                id: guid() //设定一个id，防止重复弹出
                ,title: '评教说明'
                ,type: 1
                ,area : [ '700px', '400px' ]
                ,offset : '50px' //只定义top坐标，水平保持居中
                ,shade: 0.5
                ,btn: ['确定']
                ,btnAlign: 'c' //按钮居中显示
                ,skin: 'layer-btn-skin'
                ,closeBtn: false
                ,content: '<div style="padding: 50px; line-height: 50px; background-color: lightslategray; color: #fff; font-weight: 300;">' +
                    '1.您的评价对于提高老师的教学能力非常有帮助。<br/>' +
                    '2.您的评价结果占教师教学质量评价结果的40%。<br/>' +
                    '3.您的评价为匿名评价，请选择您认为最贴近实际情况的选项。<br/>' +
                    '4.谢谢您对学校教学工作的支持与配合。<br/>' +
                    '</div>'
            });

            //数据表格
            let datatable = table.render({
                id: guid() //设定一个id，防止重复弹出
                ,elem : '#datatable'
                ,height : 480
                ,url: requestUrl+'/xspj/getPageList.do'
                ,where:{
                    "accountType":accountType,
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
                        "data": res.data.pageList //解析数据列表
                    };
                }
                ,cols : [[ //表头
                    {type:'numbers', title:'序号', width:80, fixed: 'left'}
                    ,{field: 'courseCode', title: '课程编号', width:150, sort:true}
                    ,{field: 'courseName', title: '课程名称', width:150, sort:true}
                    ,{field: 'teacherNames', title: '任课教师', templet: function(data){
                            let html = '';
                            if(data.isPj == 1){
                                html = '<a class="layui-btn layui-btn-xs" lay-event="pj">评教</a>';
                            }else{
                                html = '<a class="layui-btn layui-btn-danger layui-btn-xs" lay-event="pj">评教</a>';
                            }
                            $('#toolbar').html(html);
                            return !data.teacherNames?'':data.teacherNames;
                        }
                    }
                    ,{fixed: 'right', width:80, align:'center', toolbar: '#toolbar'}
                ]]
                ,even: true //隔行背景
                ,limit: 10
                ,page: {
                    layout: ['count', 'prev', 'page', 'next', 'limit', 'refresh', 'skip']//自定义分页布局
                    ,limits: [10,20,50,100]
                    ,first: '首页'
                    ,last: '尾页'
                }
                ,done : function(res, curr, count) {

                    //监听右侧工具条
                    table.on('tool(datatable)', function(obj){
                        if (obj.event === 'pj') {
                            // alert(JSON.stringify(obj.data));
                            if(obj.data.isPj === 1){
                                // layer.msg('你已经评过了', {time : 3000, offset: '100px'});
                                return;
                            }
                            $.get(requestUrl+'/getExecTemplate.do',{'templateType':'学生评教'},function (result_data) {
                                if(result_data.code == 200){
                                    let layIndex = layer.open({
                                        id: guid()
                                        ,title : '教学评价-学生评教'
                                        ,type : 1
                                        ,area : [ '900px', '500px' ]
                                        ,offset : '30px'
                                        ,content : $('#editForm_container')
                                        ,success: function(layero, index){
                                            var templateCode;
                                            var html = '';
                                            $.each(result_data.data,function(idx,obj){
                                                templateCode = obj.templateCode;
                                                html += ' <div class="layui-form-item" style="margin-top: 20px" lay-verify="target">\n' +
                                                    (parseInt(idx)+1)+'，'+obj.targetContent+'<br/>' +
                                                    // '            <div class="layui-input-block">\n' +
                                                    '                <input type="radio" name="'+obj.targetCode+'" value="非常同意" title="非常同意">\n' +
                                                    '                <input type="radio" name="'+obj.targetCode+'" value="比较同意" title="比较同意">\n' +
                                                    '                <input type="radio" name="'+obj.targetCode+'" value="一般" title="一般">\n' +
                                                    '                <input type="radio" name="'+obj.targetCode+'" value="不太同意" title="不太同意">\n' +
                                                    '                <input type="radio" name="'+obj.targetCode+'" value="不同意" title="不同意">\n' +
                                                    // '            </div>\n' +
                                                    '        </div>';
                                            });
                                            html += '<textarea name="suggest" placeholder="您对本课程的建议" class="layui-textarea"></textarea>';
                                            html += '<div class="layui-btn-container" style="margin-top: 20px" align="center">\n' +
                                                '       <button class="layui-btn layui-btn-normal" lay-submit="" lay-filter="toSubmitEidtForm">保存</button>\n' +
                                                '       <button type="reset" class="layui-btn layui-btn-primary">重置</button>\n' +
                                                '    </div>';
                                            $("#editForm").html(html);
                                            form.render('radio'); //刷新radio单选框框渲染

                                            //自定义验证规则
                                            form.verify({
                                                target: function(value,element){
                                                    let num = 0;
                                                    if(!$(element).find(".layui-form-radio").hasClass("layui-form-radioed")){ //若有未选择的指标项
                                                        $.each(result_data.data,function(idx,obj){
                                                            if(!$("input[name="+obj.targetCode+"]").is(":checked")){ //则遍历出是哪一道题
                                                                num = (parseInt(idx)+1);
                                                                return false;//跳出循环
                                                            }
                                                        });
                                                        return '您第'+num+'个问题没有回答';
                                                    }
                                                }
                                            });

                                            //监听表单提交
                                            form.on('submit(toSubmitEidtForm)', function(data){
                                                /*layer.alert(JSON.stringify(data.field), {
                                                    title: '最终的提交信息'
                                                });
                                                return false;*/
                                                $.post(requestUrl+'/xspj/insert.do' ,{
                                                    "courseCode" : obj.data.courseCode,
                                                    "templateCode" : templateCode
                                                    ,'userId':$.cookie('userId')
                                                    ,'userName':$.cookie('userName')
                                                    ,'jsonStr':JSON.stringify(data.field)
                                                } ,function(result_data){
                                                    // alert(JSON.stringify(result_data));
                                                    layer.msg(result_data.msg, { offset: '100px'}, function () {
                                                        if(result_data.code == 200){
                                                            datatable.reload();//重新加载表格数据
                                                        }
                                                        layer.close(layIndex);
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
                                }
                            });
                        }
                    });
                }
            });

        },'json');
    } else{

        //数据表格
        let datatable = table.render({
            id: guid() //设定一个id，防止重复弹出
            ,elem : '#datatable'
            ,height : 480
            ,url: requestUrl+'/xspj/getPageList.do'
            ,where:{
                "accountType":accountType,
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
                    "data": res.data.pageList //解析数据列表
                };
            }
            ,cols : [[ //表头
                {type:'numbers', title:'序号', width:80, fixed: 'left'}
                ,{field: 'courseCode', title: '课程编号', width:150, sort:true}
                ,{field: 'courseName', title: '课程名称', width:150, sort:true}
                ,{field: 'courseType', title: '课程类型', width:150, sort:true}
                ,{field: 'stuHour', title: '学时', width:120, sort:true}
                ,{field: 'stuScore', title: '学分', width:120, sort:true}
                ,{field: 'majorName', title: '专业名称', width:150, sort:true}
                ,{field: 'collegeName', title: '学院名称', templet: function(data){
                        let html = '';
                        if(data.isPj == 1){
                            html = '<a class="layui-btn layui-btn-normal layui-btn-xs" lay-event="detail">已评</a>';
                        }else{
                            html = '<a class="layui-btn layui-btn-disabled layui-btn-xs">未评</a>'; //直接不添加响应事件就行了
                        }
                        $('#toolbar').html(html);
                        return data.collegeName;
                    }
                }
                ,{fixed: 'right', width:80, align:'center', toolbar: '#toolbar'}
            ]]
            ,even: true //隔行背景
            ,limit: 10
            ,page: {
                layout: ['count', 'prev', 'page', 'next', 'limit', 'refresh', 'skip']//自定义分页布局
                ,limits: [10,20,50,100]
                ,first: '首页'
                ,last: '尾页'
            }
            ,done : function(res, curr, count) {

                //监听右侧工具条
                table.on('tool(datatable)', function(obj){
                    if (obj.event === 'detail') { //因为未评按钮未添加事件，所以此处不用判断等于未评的情况
                        /*if(obj.data.isPj === 2){ //1已评2未评
                            layer.msg('未评');
                            return;
                        }*/
                        $.get(requestUrl+'/xspj/getPjInfo.do',{
                            'courseCode':obj.data.courseCode
                        },function (result_data) {
                            let layIndex = layer.open({
                                title : '教学评价-学生评教-评教详情'
                                ,type : 1
                                ,area : [ '900px', '450px' ]
                                ,offset : '50px'
                                ,shadeClose : true //点击遮罩关闭
                                ,btn: ['关闭']
                                ,content : $('#dataInfo_container')
                                ,success: function(layero, index){
                                    let data = result_data.data;
                                    let html = '';
                                    $.each(data.targetList,function (idx,obj) {
                                        html += '<tr>\n' +
                                            '<td>'+parseInt(idx+1)+'</td>\n' +
                                            '<td>'+obj.TARGET_CONTENT+'</td>\n' +
                                            '<td>'+obj.TARGET_SCORE+'</td>\n' +
                                            '<td>'+obj.AVG_SCORE+'</td>\n' +
                                            '</tr>';
                                    });

                                    html += '<tr><td colspan="3" style="text-align: right">总平均分</td><td>'+data.totalAvg+'</td></tr>';

                                    html += '<tr><td colspan="4" style="text-align: left">学生对本课程的建议：</td></tr>';
                                    $.each(data.suggestList,function (idx,item) {
                                        html += '<tr>\n' +
                                            '<td>'+parseInt(idx+1)+'</td>\n' +
                                            '<td colspan="3">'+item+'</td>\n' +
                                            '</tr>';
                                    });

                                    $('#pjInfo').html(html);
                                }
                            });
                        },'json');
                    }
                });
            }
        });

    }

});
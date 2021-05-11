/**
 *教学评价-学生评教
 */
layui.use(['layer','table','form','element'], function(){
    let $ = layui.$,layer = layui.layer,table = layui.table,form = layui.form,element = layui.element;

    var accountType = $.cookie('accountType');
    var datatable;
    if(accountType == 'student'){
        //
        $.get(requestUrl+'/getActiveTemplate.do',{'templateType':'学生评教'},function (result_data) {

            //系统可以设定评教时间段，非评教时间段内，学生进入不了评教模块
            if(result_data.code != 200){ //是否评教时间
                layer.msg('评教功能暂未开放！', {time : 3000, offset: '100px'});
                return;
            } else {
                //显示评教要求
                layer.open({
                    id: guid() //设定一个id，防止重复弹出
                    ,title: ['评教说明', 'font-size:26px; font-weight: bold; color:lightslategray;']
                    ,type: 1
                    ,area : [ '900px']
                    ,offset : '50px' //只定义top坐标，水平保持居中
                    ,shade: 0.5
                    ,btn: ['确定']
                    ,btnAlign: 'c' //按钮居中显示
                    ,skin: 'layer-btn-skin'
                    ,closeBtn: false
                    ,content: '<div style="padding: 50px; background-color: lightslategray; font: normal 400 22px/50px \'Microsoft YaHei\';  color: #fff; ">' +
                        '1.您的评价对于提高老师的教学能力非常有帮助。<br/>' +
                        '2.您的评价结果占教师教学质量评价结果的40%。<br/>' +
                        '3.您的评价为匿名评价，请选择您认为最贴近实际情况的选项。<br/>' +
                        '4.谢谢您对学校教学工作的支持与配合。<br/>' +
                        '</div>'
                });
            }

            //数据表格
            datatable = table.render({
                id: guid() //设定一个id，防止重复弹出
                ,elem : '#datatable'
                ,height : 466
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
                    ,{field:'xn', title:'学年', width:150, sort:true}
                    ,{field:'xq', title:'学期', width:150, sort:true, templet: function (data) {
                            let html = '<a class="layui-btn layui-btn-xs layui-btn-radius layui-btn-table layui-btn-normal" lay-event="isPj1">查看评教</a>';
                            if(data.isPj === 2){
                                html = '<a class="layui-btn layui-btn-xs layui-btn-radius layui-btn-table layui-btn-warm" lay-event="isPj2">未评</a>';
                            }
                            $('#datatable_bar').html(html);
                            return data.xq == '3'?'上学期':'下学期';
                        }
                    }
                    ,{field:'courseCode', title:'课程编号', width:150, sort:true}
                    ,{field:'courseName', title:'课程名称', sort:true}
                    // ,{field:'courseAttr', title:'课程性质', width:150, sort:true}
                    // ,{field:'skjsCode', title:'授课教师编号', width:150, sort:true}
                    // ,{field:'skjsName', title:'授课教师姓名', width:150, sort:true}
                    // ,{field:'skSj', title:'授课时间', width:150, sort:true}
                    // ,{field:'skDd', title:'授课地点', width:150, sort:true}
                    ,{fixed: 'right', width:120, align:'center', toolbar: '#datatable_bar'}
                ]]
                ,even: true //隔行背景
                ,limit: 10
                ,page: {
                    layout: ['count', 'prev', 'page', 'next', 'limit', 'refresh', 'skip']//自定义分页布局
                    ,limits: [10,20,50,100]
                    ,first: '首页'
                    ,last: '尾页'
                }
                ,done: function(res, curr, count){

                }
            });

            //监听右侧工具条
            table.on('tool(datatable)', function(obj){
                if (obj.event === 'isPj1') {
                    layer.open({
                        title : '查看评教'
                        ,type : 1
                        ,area : [ '900px']
                        ,offset : '50px'
                        ,shadeClose : true
                        ,btn : ['关闭']
                        ,content : '<table class="layui-table">\n' +
                            '            <tr><td style="width: 120px; text-align: right">学年：</td><td>'+obj.data.xn+'</td></tr>\n' +
                            '            <tr><td style="width: 120px; text-align: right">学期：</td><td>'+obj.data.xq+'</td></tr>\n' +
                            '            <tr><td style="width: 120px; text-align: right">课程编号：</td><td>'+obj.data.courseCode+'</td></tr>\n' +
                            '            <tr><td style="width: 120px; text-align: right">课程名称：</td><td>'+obj.data.courseName+'</td></tr>\n' +
                            // '            <tr><td style="width: 120px; text-align: right">课程性质：</td><td>'+obj.data.courseAttr+'</td></tr>\n' +
                            // '            <tr><td style="width: 120px; text-align: right">授课教师编号：</td><td>'+obj.data.skjsCode+'</td></tr>\n' +
                            // '            <tr><td style="width: 120px; text-align: right">授课教师名称：</td><td>'+obj.data.skjsName+'</td></tr>\n' +
                            // '            <tr><td style="width: 120px; text-align: right">授课时间：</td><td>'+obj.data.skSj+'</td></tr>\n' +
                            // '            <tr><td style="width: 120px; text-align: right">授课地点：</td><td>'+obj.data.skDd+'</td></tr>\n' +
                            '            <tr><td style="width: 120px; text-align: right">评教建议：</td><td>'+obj.data.pjSuggest+'</td></tr>\n' +
                            '    </table>'
                    });
                } else if (obj.event === 'isPj2') {
                    //
                    layer.open({
                        id: guid()
                        ,title : '教学评价-学生评教'
                        ,type : 1
                        ,area : [ '900px', '500px' ]
                        ,offset : '50px'
                        ,content : $('#editForm_container')
                        ,success: function(layero, index){
                            var html = '';
                            $.each(result_data.data,function(idx,obj){
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
                                '       <button type="button" class="layui-btn layui-btn-normal" lay-submit="" lay-filter="toSubmitEidtForm">保存</button>\n' +
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
                                        return '您第'+num+'个问题没有回答！';
                                    }
                                }
                            });

                            //监听表单提交
                            form.on('submit(toSubmitEidtForm)', function(data){
                                var pjSuggest = data.field.suggest;
                                delete data.field.suggest;
                                $.post(requestUrl+'/xspj/insert.do' ,{
                                    'xn' : obj.data.xn,
                                    'xq' : obj.data.xq,
                                    "courseCode" : obj.data.courseCode
                                    ,"skjsCode" : obj.data.skjsCode
                                    ,"templateCode" : result_data.data[0].templateCode
                                    ,'jsonString':JSON.stringify(data.field)
                                    ,'pjSuggest': pjSuggest
                                    ,'userId':$.cookie('userId')
                                    ,'userName':$.cookie('userName')
                                } ,function(result_data){
                                    layer.msg(result_data.msg, { offset: '100px'}, function () {
                                        if(result_data.code == 200){
                                            datatable.reload();//重新加载表格数据
                                        }
                                        layer.close(index);
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

        },'json');

    } else{

        //数据表格
        datatable = table.render({
            id: guid() //设定一个id，防止重复弹出
            ,elem : '#datatable'
            ,height : 466
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
                ,{field:'xn', title:'学年', width:150, sort:true}
                ,{field:'xq', title:'学期', width:150, sort:true, templet: function (data) {
                        let html = '<a class="layui-btn layui-btn-xs layui-btn-radius layui-btn-table layui-btn-normal" lay-event="isPj1">查看评教</a>';
                        if(data.isPj === 2){
                            html = '<a class="layui-btn layui-btn-xs layui-btn-radius layui-btn-table layui-btn-disabled">未评</a>';
                        }
                        $('#datatable_bar').html(html);
                        return data.xq == '3'?'上学期':'下学期';
                    }
                }
                ,{field:'courseCode', title:'课程编号', width:150, sort:true}
                ,{field:'courseName', title:'课程名称', sort:true}
                /*,{field:'courseAttr', title:'课程性质', width:150, sort:true}
                ,{field:'skjsCode', title:'授课教师编号', width:150, sort:true}
                ,{field:'skjsName', title:'授课教师姓名', width:150, sort:true}
                ,{field:'skSj', title:'授课时间', width:150, sort:true}
                ,{field:'skDd', title:'授课地点', width:150, sort:true}*/
                ,{fixed: 'right', width:120, align:'center', toolbar: '#datatable_bar'}
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

            }
        });

        //监听右侧工具条
        table.on('tool(datatable)', function(obj){
            if (obj.event === 'isPj1') {
                $.get(requestUrl+'/xspj/getPjInfo.do',{
                    'xn':obj.data.xn,
                    'xq':obj.data.xq,
                    'courseCode':obj.data.courseCode
                    ,'teacherCode': obj.data.skjsCode
                },function (result_data) {
                    //
                    layer.open({
                        title : '查看评价'
                        ,type : 1
                        ,area : [ '900px', '500px' ]
                        ,offset : '50px'
                        ,shadeClose : true //点击遮罩关闭
                        ,btn: ['关闭']
                        ,content : $('#dataInfo_container')
                        ,success: function(layero, index){
                            let data = result_data.data;
                            $('#pjInfo').html('<tr><td style="width:120px; font-size:18px;">总平均分：</td><td>'+data.totalAvgScore+'</td></tr>' +
                                '<tr><td style="width:120px; font-size:18px;">评教人次：</td><td>'+data.pjNum+'</td></tr>');
                            let html = '';
                            $.each(data.suggestList,function (idx,obj) {
                                html += '<div class="layui-panel">'+obj+'</div>';
                            });
                            $('#pjSuggest').html(html);
                        }
                    });
                },'json');
            }
        });

    }

    //监听搜索框事件
    var active = {
        search: function(){
            datatable.reload({
                where: {
                    'xn': $("#xn option:selected").val(), //获取选中的值,
                    'xq': $("#xq option:selected").val(),
                    'courseName': $(".search input[ name='courseName']").val(),
                    'isPj': $("#isPj option:selected").val()
                }
                ,page: {
                    curr: 1 //重新从第 1 页开始
                }
            });
        }
        ,reset: function () {
            $("#xn").val(""); //清除选中状态
            $("#xq").val("");
            $(".search input").val('');
            $("#isPj").val("");
            form.render("select");
        }
    };
    $('.search .layui-btn').on('click', function(){
        let type = $(this).data('type');
        active[type] ? active[type].call(this) : '';
    });

});
/**
 *教学评价-学生评教
 */
layui.use(['layer','table','form'], function(){
    let $ = layui.$,layer = layui.layer,table = layui.table,form = layui.form;

    //数据表格
    let datatable = table.render({
        id: guid() //设定一个id，防止重复弹出
        ,elem : '#datatable'
        ,height : 480
        ,url: requestUrl+'/xspj/getPageList.do'
        ,where:{
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
                        html = '<a class="layui-btn layui-btn-normal layui-btn-xs" lay-event="pj">评教</a>';
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
                    $.get(requestUrl+'/getCurrentTemplate.do',{'templateType':'学生评教'},function (result_data) {
                        if(result_data.code == 200){
                            // alert(JSON.stringify(result_data.data.targetList[0]));
                            let layIndex = layer.open({
                                id: guid()
                                ,title : '教学评价-学生评教'
                                ,type : 1
                                ,area : [ '900px', '500px' ]
                                ,offset : '30px'
                                ,content : $('#editForm_container')
                                ,success: function(layero, index){
                                    var html = /*'<input type="hidden" name="courseCode"/>\n' +
                                        '        <input type="hidden" name="userId"/>\n' +
                                        '        <input type="hidden" name="userName"/>';*/
                                        '';
                                    $.each(result_data.data.targetList,function(idx,obj){
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

                                    /*//表单赋值
                                    form.val("editForm",{
                                        "courseCode" : obj.data.courseCode
                                        ,'userId':$.cookie('userId')
                                        ,'userName':$.cookie('userName')
                                    });*/

                                    //自定义验证规则
                                    form.verify({
                                        target: function(value,element){
                                            let num = 0;
                                            if(!$(element).find(".layui-form-radio").hasClass("layui-form-radioed")){ //若有未选择的指标项
                                                $.each(result_data.data.targetList,function(idx,obj){
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
                                            "courseCode" : obj.data.courseCode
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

});
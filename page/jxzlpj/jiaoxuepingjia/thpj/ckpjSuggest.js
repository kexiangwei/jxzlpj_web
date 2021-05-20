/**
 *教学评价-学生评教
 */
layui.use(['layer','table','form','laydate','element'], function(){
    let $ = layui.$,layer = layui.layer,table = layui.table,form = layui.form,laydate = layui.laydate,element = layui.element;

    //日期范围选择
    laydate.render({
        elem: '#pjStartDate'
    });
    laydate.render({
        elem: '#pjEndDate'
    });

    //数据表格
    var datatable = table.render({
        id: guid() //设定一个id，防止重复弹出
        ,elem : '#datatable'
        ,height : 466
        ,url: requestUrl+'/thpj/getCkpjPageList.do'
        ,where:{
            "accountType":function () {
                return $.cookie('accountType');
            },
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
            ,{field:'courseCode', title:'课程编号', width:150, sort:true}
            ,{field:'courseName', title:'课程名称', sort:true}
            // ,{field:'courseAttr', title:'课程性质', width:150, sort:true}
            ,{field:'xn', title:'学年', width:150, sort:true}
            ,{field:'xq', title:'学期', width:150, sort:true, templet: function (data) {
                    let html = '<a class="layui-btn layui-btn-xs layui-btn-radius layui-btn-table layui-btn-normal" lay-event="isPj1">查看评教</a>';
                    if(data.isPj === 2){
                        html = '<a class="layui-btn layui-btn-xs layui-btn-radius layui-btn-table layui-btn-disabled">未评</a>';
                    }
                    $('#datatable_bar').html(html);
                    return data.xq == '3'?'第一学期':'第二学期';
                }
            }
            ,{field:'skjsCode', title:'授课教师编号', width:150, sort:true}
            ,{field:'skjsName', title:'授课教师姓名', width:150, sort:true}
            // ,{field:'skBj', title:'授课班级', width:150, sort:true}
            // ,{field:'xsrs', title:'学生人数', width:150, sort:true}
            // ,{field:'skSj', title:'上课时间', width:150, sort:true}
            // ,{field:'skDd', title:'上课地点', width:150, sort:true}
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
    });

    //监听搜索框事件
    $('.search .layui-btn').on('click', function(){
        let type = $(this).data('type');
        active[type] ? active[type].call(this) : '';
    });
    var active = {
        search: function(){
            datatable.reload({
                where: {
                    'xn': $("#xn option:selected").val(), //获取选中的值,
                    'xq': $("#xq option:selected").val(),
                    'pjStartDate': $(".search input[ name='pjStartDate']").val(),
                    'pjEndDate': $(".search input[ name='pjEndDate']").val(),
                    'courseCode': $(".search input[ name='courseCode']").val(),
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

    //监听右侧工具条
    table.on('tool(datatable)', function(obj){
        if (obj.event === 'isPj1') {
            $.get(requestUrl+'/thpj/getPjInfo.do',{
                'courseCode':obj.data.courseCode
                ,'skjsCode': obj.data.skjsCode
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
                        let html = '<table class="layui-table" style="margin-top: 20px;">' +
                            '<tr><td style="width:120px; font-size:18px;">总平均分：</td><td>'+data.totalAvgScore+'</td></tr>' +
                            '<tr><td style="width:120px; font-size:18px;">评教人次：</td><td>'+data.pjNum+'</td></tr></table>';
                        html += '<fieldset class="layui-elem-field layui-field-title" style="margin-top: 20px;"><legend>评教建议</legend></fieldset>' +
                            '<div class="layui-bg-gray" style="padding: 20px;">';
                        $.each(data.suggestList,function (idx,obj) {
                            html += '<table class="layui-table" style="margin: '+(idx >= 1 ? 20 : 0)+'px 0 0 0">' +
                                '<tr><td style="width: 100px;">得分：</td><td style="width: 200px;">'+obj.SCORE+'</td><td style="width: 100px;">评教时间：</td><td>'+obj.pjDate+'</td></tr>' +
                                '<tr><td colspan="4">教师教学水平点评</td></tr>' +
                                '<tr><td style="text-align: right;">肯定评价：</td><td colspan="3">'+obj.TEACHER_DP1+'</td></tr>' +
                                '<tr><td style="text-align: right;">不足与建议：</td><td colspan="3">'+obj.TEACHER_DP2+'</td></tr>' +
                                '<tr><td colspan="4">学生学习情况点评</td></tr>' +
                                '<tr><td style="text-align: right;">肯定评价：</td><td colspan="3">'+obj.STUDENT_DP1+'</td></tr>' +
                                '<tr><td style="text-align: right;">不足与建议：</td><td colspan="3">'+obj.STUDENT_DP2+'</td></tr>' +
                                '<tr><td colspan="4">听课人对教室及设施的评价及改进建议</td></tr>' +
                                '<tr><td colspan="4">'+obj.CLASSROOM_DP+'</td></tr>' +
                                '</table>';
                        });
                        html += '</div>';
                        $('#dataInfo_container').html(html);
                    }
                });
            },'json');
        }
    });
});
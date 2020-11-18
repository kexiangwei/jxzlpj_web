/*
教学评价-同行评教
 */
layui.use(['layer','element','table'], function(){
    var $ = layui.$,layer = layui.layer,element = layui.element,table = layui.table;

    //初始化数据表格
    var datatable = table.render({
        id: guid()
        ,elem : '#datatable'
        ,height : 580
        ,url: requestUrl+'/jxpj_thpj/getCkpjPageList.do'
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
        ,cols : [[ //表头
            {type:'checkbox', fixed: 'left'}
            ,{type:'numbers', title:'序号', width:80, fixed: 'left'}
            ,{field:'courseName', title:'课程名称', width:180, sort:true, templet: function (data) {
                    let html = '<a class="layui-btn layui-btn-primary layui-btn-xs" lay-event="detail"><i class="layui-icon layui-icon-read"></i>查看评教</a>';
                    if(data.isPj == 2){
                        html = '<a class="layui-btn layui-btn-disabled layui-btn-xs" lay-event="detail"><i class="layui-icon layui-icon-read"></i>查看评教</a>';
                    }
                    $('#datatable_bar').html(html);
                    return data.courseName;
             }}
            ,{field:'courseAttr', title:'课程性质', width:150, sort:true}
            ,{field:'stuScore', title:'学分', width:150, sort:true}
            ,{field:'stuHour', title:'学时', width:150, sort:true}
            ,{field:'majorName', title:'适用专业', width:180, sort:true}
            ,{field:'collegeName', title:'开课学院', width:180, sort:true}
            ,{fixed: 'right', width:120, align:'center', toolbar: '#datatable_bar'}
        ]]
        ,even: true //隔行背景
        ,limit: 10
        ,page: { //支持传入 laypage 组件的所有参数（某些参数除外，如：jump/elem） - 详见文档
            layout: ['count', 'prev', 'page', 'next', 'limit', 'refresh', 'skip']//自定义分页布局
            ,limits: [10,20,50,100]
            ,first: '首页' //不显示首页
            ,last: '尾页' //不显示尾页
        }
        ,done: function(res, curr, count){ //数据渲染完的回调

            //监听搜索框事件
            $('.search .layui-btn').on('click', function(){
                let type = $(this).data('type');
                active[type] ? active[type].call(this) : '';
            });
            let active = {
                search: function(){
                    datatable.reload({
                        where: {
                            'courseName': $(".search input[ name='courseName']").val()
                        }
                        ,page: {
                            curr: 1 //重新从第 1 页开始
                        }
                    });
                }
                ,reset: function () {
                    $(".search input").val('');
                }
            };

            //监听工具条
            table.on('tool(datatable)', function(obj){
                let row_data = obj.data;
                if (obj.event === 'detail') {
                    if(row_data.isPj == 2){ //1是2否（即未评价，查看按钮不可点击）
                        return;
                    }
                    //
                    layer.open({
                        id: guid() //设定一个id，防止重复弹出
                        ,title : ''
                        ,type : 1
                        ,area : [ '1100px', '500px' ]
                        ,offset : '30px' //只定义top坐标，水平保持居中
                        ,shadeClose : true //点击遮罩关闭
                        ,content : $('#view_container')
                        ,success: function(layero, index){
                            $.get(requestUrl+'/jxpj_thpj/getCkpjDetail.do'
                                ,{
                                    'userId': $.cookie('userId')
                                    ,'courseCode': row_data.courseCode
                                    ,'templateCode': row_data.templateCode

                                }
                                ,function (result_data) {
                                    if(result_data.code === 200){
                                        let data = result_data.data;
                                        let html = ''
                                            ,totalScore=0;
                                        for (let i = 0; i < data.length; i++) {
                                            html += '<tr><td rowspan="'+data[i].num+'">'+data[i].name+'（'+data[i].score+'分）</td>\n';
                                            for (let j = 0; j < data[i].num; j++) {
                                                let obj = data[i].targetList[j];
                                                html += '<td>' +parseInt(j+1)+'．'+obj.targetContent+'</td>\n' +
                                                    '<td>'+obj.targetScore+'</td>\n' +
                                                    '<td>'+obj.avgScore+'</td>' +
                                                    '</tr>';
                                                //累加总平均分
                                                totalScore+=obj.avgScore;
                                            }
                                        }
                                        html += '<tr><td colspan="3" style="text-align: right">合计</td>' +
                                            '<td style="text-align: center">'+totalScore+'</td></tr>';
                                        $('#target').html(html);
                                    }
                                },'json');
                        }
                    });
                }
            });
        }
    });
});
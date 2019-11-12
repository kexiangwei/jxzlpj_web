/**
 * 综合查询
 */
layui.use(['layer','table','form','util'], function(){
    let $ = layui.$,layer = layui.layer,table = layui.table,form = layui.form,util = layui.util;

    //数据表格
    let dataTable = table.render({
        id: "dataTable_id"
        ,elem : '#dataTable'
        ,height : 500
        ,url: requestUrl+'/jixujiaoyu/getList.do'
        ,where:{
            "userId":'112233'
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
        ,toolbar: true
        ,cols : [[ //表头
            {type:'checkbox', fixed: 'left'}
            ,{type:'numbers', title:'序号', width:80, fixed: 'left'}
            ,{field: 'menuName', title: '模块名称', width:200, templet: function(data){
                    return '继续教育';
            }}
            ,{field: 'peixunName', title: '信息名称', width:200}
            ,{field: 'userId', title: '教师工号', width:120, sort: true}
            ,{field: 'userName', title: '教师姓名', width:120}
            ,{field: 'createDate', title: '创建时间'}
            ,{fixed: 'right', width:120, align:'center', toolbar: '#dataTable_bar'}
        ]]
        ,even: true //隔行背景
        ,limit: 10
        ,page: {
            layout: ['count', 'prev', 'page', 'next', 'limit', 'refresh', 'skip']//自定义分页布局
            ,limits: [10,20,50,100]
        }
        ,done : function(res, curr, count) {
            let data = res.data;

            //监听搜索框
            let active = {
                search: function(){
                    dataTable.reload({
                        where: { //设定异步数据接口的额外参数，任意设
                            userId: $(" input[ name='userId' ] ").val()
                            ,userName: $(" input[ name='userName' ] ").val()
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
            $('.search-container .layui-btn').on('click', function(){
                let type = $(this).data('type');
                active[type] ? active[type].call(this) : '';
            });

            //监听右侧工具条
            table.on('tool(dataTable)', function(obj){
                let data = obj.data;
                layer.open({
                    title : '您当前位置 》综合查询 》详情页面'
                    ,type : 1
                    ,area : [ '700px', '535px' ]
                    ,offset : '10px' //只定义top坐标，水平保持居中
                    ,shadeClose : true //点击遮罩关闭
                    ,btn : ['关闭']
                    ,content : '<table class="layui-table">\n' +
                        '        <tbody>\n' +
                        '            <tr><td style="width: 150px; text-align: center">工号</td><td>'+data.userId+'</td></tr>\n' +
                        '            <tr><td style="width: 150px; text-align: center">姓名</td><td>'+data.userName+'</td></tr>\n' +
                        '            <tr><td style="width: 150px; text-align: center">培训名称</td><td>'+data.peixunName+'</td></tr>\n' +
                        '            <tr><td style="width: 150px; text-align: center">培训形式</td><td>'+data.peixunStyle+'</td></tr>\n' +
                        '            <tr><td style="width: 150px; text-align: center">培训开始时间</td><td>'+data.peixunStartTime+'</td></tr>\n' +
                        '            <tr><td style="width: 150px; text-align: center">培训结束时间</td><td>'+data.peixunEndTime+'</td></tr>\n' +
                        '            <tr><td style="width: 150px; text-align: center">学时</td><td>'+data.peixunClassHour+'</td></tr>\n' +
                        '            <tr><td style="width: 150px; text-align: center">培训内容</td><td>'+data.peixunContent+'</td></tr>\n' +
                        '            <tr><td style="width: 150px; text-align: center">培训地点</td><td>'+data.peixunAddress+'</td></tr>\n' +
                        '            <tr><td style="width: 150px; text-align: center">培训组织机构</td><td>'+data.peixunDept+'</td></tr>\n' +
                        '        </tbody>\n' +
                        '    </table>'
                });
            });
        }
    });
});
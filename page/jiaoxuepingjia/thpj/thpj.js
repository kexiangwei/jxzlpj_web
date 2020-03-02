/*
教学评价-同行评教
 */
layui.use(['layer','element','table','form'], function(){
    let $ = layui.$,layer = layui.layer,element = layui.element,table = layui.table,form = layui.form;

    //初始化数据表格
    let datatable = table.render({
        id: "datatable"
        ,elem : '#datatable'
        ,height : 468
        ,url: requestUrl+'/sjfx/getPageList.do'
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
        ,cols : [[ //表头
            {type:'checkbox', fixed: 'left'}
            ,{type:'numbers', title:'序号', width:80, fixed: 'left'}
            ,{field:'testName', title:'测试条目', width:120}
            ,{field:'testName', title:'测试条目', width:120}
            ,{field:'testName', title:'测试条目', width:120}
            ,{field:'testName', title:'测试条目', width:120}
            ,{field:'testName', title:'测试条目', width:120}
            ,{field:'testName', title:'测试条目', width:120}
            ,{field:'testName', title:'测试条目', width:120}
            ,{field:'remark', title:'备注'}
            ,{fixed: 'right', title:'操作', width:110, align:'center', toolbar: '#datatable_bar'} //这里的toolbar值是模板元素的选择器
        ]]
        ,done: function(res, curr, count){ //数据渲染完的回调

            //监听搜索框事件
            $('.layui-search .layui-btn').on('click', function(){
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
                let layEvent = obj.event
                    , rowData = obj.data;
                if (layEvent === 'kcpf') {
                    layer.open({
                        title : '教学评价-同行评教-课程评分'
                        ,type : 2
                        ,area : [ '1100px', '500px' ]
                        ,offset : '30px' //只定义top坐标，水平保持居中
                        ,shadeClose : true //点击遮罩关闭
                        ,btn : ['关闭']
                        ,content : 'thpj_kcpf.html'
                        ,success: function(layero, index){
                            //
                            form.on('submit(toSubmit)', function(formData){

                            });
                        }
                        ,end:function () {

                        }
                    });
                }
            });
        }
    });
});
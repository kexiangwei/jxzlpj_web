/*
教学评价-同行评教
 */
layui.use(['layer','element','table','form','laydate'], function(){
    var $ = layui.$,layer = layui.layer,element = layui.element,table = layui.table,form = layui.form,laydate = layui.laydate;
    laydate.render({
        elem: '#teachDate'
    });

    //初始化数据表格
    var datatable = table.render({
        id: guid()
        ,elem : '#datatable'
        ,height : 460
        ,url: requestUrl+'/thpj/getPageList.do'
        ,where:{}
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
            ,{field:'courseName', title:'课程名称', width:200, sort:true, event: 'courseName', templet: function (data) {
                    return '<span style="font-weight: bold; cursor: pointer;">'+data.courseName+'</span>';
             }}
            ,{field:'courseType', title:'课程性质', width:150, sort:true}
            ,{field:'teacher', title:'任课教师姓名', width:150, sort:true}
            ,{field:'teacherCollege', title:'教师所在学院', width:150, sort:true}
            ,{field:'teacherMajor', title:'教师所在专业', width:150, sort:true}
            ,{field:'teachDate', title:'上课时间', width:150, sort:true}
            ,{field:'teachAddr', title:'上课地点', sort:true}
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
            $('.layui-search .layui-btn').on('click', function(){
                let type = $(this).data('type');
                active[type] ? active[type].call(this) : '';
            });

            //监听工具条
            table.on('tool(datatable)', function(obj){
                let data = obj.data;
                if (obj.event === 'courseName') {


                    let layIndex = layer.open({
                        id: guid() //设定一个id，防止重复弹出
                        ,title : '教学评价-课程质量评价'
                        ,type : 1
                        ,area : [ '1100px', '500px' ]
                        ,offset : '30px' //只定义top坐标，水平保持居中
                        ,shadeClose : true //点击遮罩关闭
                        ,btn : ['教学研究','教学设计','教学效果','关闭']
                        ,yes: function(index, layero){
                            layer.msg('教学研究');
                            return false; //开启该代码可禁止点击该按钮关闭
                        }
                        ,btn2: function(index, layero){
                            layer.msg('教学设计');
                            return false; //开启该代码可禁止点击该按钮关闭
                        }
                        ,btn3: function(index, layero){
                            layer.msg('教学效果');
                            return false; //开启该代码可禁止点击该按钮关闭
                        }
                        ,skin: 'demo-class'
                        ,content : $('#editForm_container')
                        ,success: function(layero, index){

                        }
                        ,cancel: function(index, layero){
                            layer.confirm('表单未提交，填写的信息将会清空？', {icon: 3, title:'提示', offset: '100px'}, function(index) {
                                layer.closeAll();
                            });
                            return false;
                        }
                        ,end:function () {

                        }
                    });
                    // layer.full(layIndex); //默认以最大化方式打开
                }
            });
        }
    });
});
/*
教学效果-课程质量分析报告
 */
layui.use(['layer','table','form'], function(){
    var $ = layui.$,layer = layui.layer,table = layui.table,form = layui.form;

    //初始化数据表格
    var datatable = table.render({
        id : guid()
        ,elem : '#datatable'
        ,height : 580
        ,url: requestUrl+'/jxxg_kczlfxbg/getPageList.do'
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
            statusCode: 200
        }
        ,parseData: function(res){
            return {
                "code": res.code,
                "msg": "",
                "count": res.data.totalNum,
                "data": res.data.pageList
            };
        }
        ,cols : [[ //表头
            {type:'checkbox', fixed: 'left'}
            ,{type:'numbers', title:'序号', width:80, fixed: 'left'}
            // ,{field: 'courseCode', title: '课程编号', width:150, sort:true}
            ,{field: 'courseName', title: '课程名称', width:150, sort:true, event: 'courseName', templet: function (data) {
                    let html = '<a class="layui-btn layui-btn-disabled layui-btn-xs"><i class="layui-icon layui-icon-read"></i>查看信息</a>';
                    if(1==1){
                        html = '<a class="layui-btn layui-btn-normal layui-btn-xs" lay-event="dataInfo"><i class="layui-icon layui-icon-read"></i>查看信息</a>';
                    }
                    $('#datatable_tools').html(html);
                    return '<span style="font-weight: bold; cursor: pointer;">'+data.courseName+'</span>';
                }
            }
            ,{field: 'courseAttr', title: '课程性质', width:150, sort:true}
            ,{field: 'xyName', title: '开课学院（部）', width:150, sort:true}
            ,{field: 'zyName', title: '系（教研室）', width:150, sort:true}
            ,{field: 'xn', title:'学年', width:150, sort:true}
            ,{field: 'xq', title:'学期', width:150, sort:true}
            ,{field: 'skJs', title:'授课教师', width:150, sort:true}
            ,{field: 'skBj', title:'授课班级', width:150, sort:true}
            ,{fixed: 'right', width:110, align:'center', toolbar: '#datatable_tools'}
        ]]
        ,page: {
            layout: ['count', 'prev', 'page', 'next', 'limit', 'refresh', 'skip']
            ,limits: [10,20,50,100]
            ,first: '首页'
            ,last: '尾页'
        }
        ,limit: 10
        ,even: true //隔行背景
        ,done: function(res, curr, count){ //数据渲染完的回调

        }
    });

    //监听搜索框事件
    let active = {
        search: function(){
            datatable.reload({
                where: {
                    'courseName': $(".search input[name='courseName']").val()
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
    $('.search .layui-btn').on('click', function(){
        let type = $(this).data('type');
        active[type] ? active[type].call(this) : '';
    });

    //监听工具条
    table.on('tool(datatable)', function(obj){
        let row_data = obj.data;
        if (obj.event === 'dataInfo') {
            layer.msg('查看');
        }  else if (obj.event === 'courseName') {
            layer.open({
                id : guid()
                ,title : '课程质量分析报告'
                ,type : 1
                ,area : [ '1300px', '600px' ]
                ,offset : '50px'
                ,content : $('#editFormContainer')
                ,success: function(layero, index){
                    //
                    var objCode = new Date();
                    //初始化表单数据
                    $('#subTitle').html(row_data.courseName+'（'+row_data.courseCode+'）课程质量分析报告');
                    form.val("editForm",{
                        "code": objCode
                        ,"courseCode": row_data.courseCode
                        ,"courseName" : row_data.courseName
                        ,"courseAttr" : row_data.courseAttr
                        ,"xyName" : row_data.xyName
                        ,"zyName" : row_data.zyName
                        ,"xn" : row_data.xn
                        ,"xq" : row_data.xq
                        ,"skJs" : row_data.skJs
                        ,"skBj" : row_data.skBj
                        ,"userId": $.cookie('userId')
                        ,"userName": $.cookie('userName')
                    });
                    //监听表单提交
                    form.on('submit(toSubmitEidtForm)', function(_form_data){
                        _form_data.field.courseCode = row_data.courseCode;
                        _form_data.field.courseName = row_data.courseName;
                        $.post(requestUrl+'/jxxg_kczlfxbg/insert.do', _form_data.field, function (_result_data) {
                            layer.msg(_result_data.msg, {offset: '100px'},function () {
                                if(_result_data.code === 200){
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
                ,end:function () {

                }
            });
        }
    });

});
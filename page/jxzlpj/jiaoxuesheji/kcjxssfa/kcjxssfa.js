/*
教学设计-课程教学实施方案
 */
layui.use(['layer','table','form','laydate'], function(){
    var $ = layui.$,layer = layui.layer,table = layui.table,form = layui.form,laydate = layui.laydate;

    //初始化数据表格
    var myself_table = table.render({
        id : guid()
        ,elem : '#myself_table'
        ,height : 500
        ,url: requestUrl+'/jxsj_kcjxssfa/getPageList.do'
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
        ,page: {
            layout: ['count', 'prev', 'page', 'next', 'limit', 'refresh', 'skip']
            ,limits: [10,20,50,100]
            ,first: '首页'
            ,last: '尾页'
        }
        ,limit: 10
        ,even: true //隔行背景
        ,toolbar: '#myself_toolbar' //指向自定义工具栏模板选择器
        ,cols : [[ //表头
            {type:'checkbox', fixed: 'left'}
            ,{type:'numbers', title:'序号', width:80, fixed: 'left'}
            ,{field: 'courseName', title: '课程名称', width:150, sort:true, event: 'insert', templet: function (data) {
                    if(data.isSubmit=='已提交'){
                        return '<span style="font-weight: bold; color: #1E9FFF;">'+data.courseName+'</span>';
                    }
                    return '<span style="font-weight: bold; color: #1E9FFF; cursor: pointer;">'+data.courseName+'</span>';
                }
            }
            ,{field: 'courseCode', title: '课程编号', width:150, sort:true}
            ,{field: 'courseAttr', title: '课程性质', width:150, sort:true}
            ,{field: 'courseLeader', title: '课程负责人', width:150, sort:true}
            ,{field: 'teachClass', title: '授课班级', width:150, sort:true}
            ,{field: 'studentNum', title:'学生人数', width:150, sort:true}
            ,{field: 'classLocation', title:'上课地点', width:150, sort:true}
            ,{field: 'openCollege', title:'开课学院（部）', width:150, sort:true}
            // ,{field: 'isSubmit', title: '提交状态', width:150, sort:true}
            ,{fixed: 'right', width:110, align:'center', toolbar: '#myself_bar'}
        ]]
        ,done: function(res, curr, count){ //数据渲染完的回调

        }
    });

    //监听搜索框事件
    $('.myself_search .layui-btn').on('click', function(){
        let type = $(this).data('type');
        active[type] ? active[type].call(this) : '';
    });
    let active = {
        search: function(){
            myself_table.reload({
                where: {
                    'courseName': $(".myself_search input[name='courseName']").val()
                }
                ,page: {
                    curr: 1 //重新从第 1 页开始
                }
            });
        }
        ,reset: function () {
            $(".myself_search input").val('');
        }
    };

    //监听头工具栏事件
    table.on('toolbar(myself_table)', function(obj){
        let rowDatas = table.checkStatus(obj.config.id).data; //获取选中的数据
        //
        switch(obj.event){
            case 'insert':
                layer.open({
                    id : guid()
                    ,title : '教学设计-课程教学实施方案-新增'
                    ,type : 1
                    ,area : [ '1175px', '500px' ]
                    ,offset : '50px'
                    ,content : $('#editFormContainer')
                    ,success: function(layero, index){

                        //初始化laydate实例
                        laydate.render({
                            elem: '#commonDate' //指定元素
                        });
//
                        $.get(requestUrl+'/getCourseListByUserId.do', { 'userId': $.cookie('userId') },function(result_data){
                            if(result_data.code === 200){
                                //
                                $("select[name='courseInfo']").empty(); //移除下拉框所有选项option
                                //初始化下拉选项
                                if(result_data.data.length > 0){
                                    let html = '<option value="">请选择</option>';
                                    for (let i = 0; i < result_data.data.length; i++) {
                                        html += '<option value="' + result_data.data[i]['courseCode'] + '" >' + result_data.data[i]['courseName'] + '('+result_data.data[i]['courseCode']+')</option>';
                                    }
                                    $("select[name='courseInfo']").append(html);
                                    form.render('select');
                                    //
                                    form.on('select(courseInfo)', function(selected_data) {
                                        let courseCode = selected_data.value;
                                        result_data.data.some(function (item) {  //some() 方法用于检测数组中的元素是否满足指定条件
                                            if (item.courseCode == courseCode) {
                                                //
                                                form.val("editForm",{
                                                    // "code":obj.code
                                                    "courseCode": item.courseCode
                                                    ,"courseName" : item.courseName
                                                    ,"courseAttr" : item.courseAttr
                                                    ,"courseLeader" : item.skjsName
                                                    ,"teachClass" : item.skBj
                                                    ,"studentNum" : item.xsrs
                                                    ,"classLocation" : item.skDd
                                                    ,"openCollege" : item.xyName
                                                    ,"xn" : item.xn
                                                    ,"xq" : item.xq
                                                    ,"userId":$.cookie('userId')
                                                    ,"userName":$.cookie('userName')
                                                });
                                            }
                                        });
                                    });
                                }
                            } else {
                                layer.msg('加载数据失败！', {time : 3000, offset: '100px'});
                            }
                        }, "json");
                        //监听表单提交
                        form.on('submit(toSubmitEidtForm)', function(data){
                            $.post(requestUrl+'/jxsj_kcjxssfa/insert.do', data.field, function (result_data) {
                                layer.msg(result_data.msg, {offset: '100px'},function () {
                                    /*if(result_data.code === 200){
                                        myself_table.reload();//重新加载表格数据
                                    }*/
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
                        window.location.reload();
                    }
                });
                break;
        }
    });

    //监听工具条
    table.on('tool(myself_table)', function(obj){
        let row_data = obj.data;
        //
        if (obj.event === 'detail') {

            layer.open({
                id :guid() //弹层唯一标识,一般用于页面层和iframe层模式,设置该值后，不管是什么类型的层，都只允许同时弹出一个。
                ,title : '教学设计-课程教学实施方案-查看信息'
                ,type : 1
                ,area : [ '1175px', '500px' ]
                ,offset : '50px'
                ,shadeClose : true //点击遮罩关闭
                ,btn : ['关闭']
                ,content : $('#dataInfoContainer')
                ,success: function(layero, index){
                    //
                    var html = '<div style="margin-top: 20px;"><h2 style="font-weight: bold;" align="center">北京农学院</h2>' +
                        '<h3 style="font-weight: bold;" align="center">'+row_data.xn+'学年'+(row_data.xq == 3 ? "第一学期" : "第二学期")+'理论课教学实施计划</h3></div>' +
                        '<table class="layui-table" style="margin-top: 20px;">' +
                        '   <tr>' +
                        '       <td style="width:120px; text-align: right">课程名称：</td><td style="width: 150px;">'+row_data.courseName+'</td>' +
                        '       <td style="width:120px; text-align: right">课程编号：</td><td style="width: 150px;">'+row_data.courseCode+'</td>' +
                        '       <td style="width:120px; text-align: right">课程性质：</td><td style="width: 150px;">'+row_data.courseAttr+'</td>' +
                        '   </tr>' +
                        '   <tr>' +
                        '       <td style="text-align: right">授课班级：</td><td>'+row_data.teachClass+'</td>' +
                        '       <td style="text-align: right">学生人数：</td><td>'+row_data.studentNum+'</td>' +
                        '       <td style="text-align: right">上课地点：</td><td>'+row_data.classLocation+'</td>' +
                        '   </tr>' +
                        '   <tr>' +
                        '       <td style="text-align: right">课程负责人：</td><td>'+row_data.courseLeader+'</td>' +
                        '       <td style="text-align: right">开课学院（部）：</td><td colspan="3">'+row_data.openCollege+'</td>' +
                        '   </tr>' +
                        '</table>';

                    //
                    $.get(requestUrl+"/jxsj_kcjxssfa/getItemListByRelationCode.do", {
                        "relationCode": row_data.code
                    } ,  function(itemList){
                        if(itemList.data.length > 0){
                            $.each(itemList.data,function(idx,item){
                                html +=  '<table class="layui-table" style="margin-top: 20px;">' +
                                    '       <tr>' +
                                    '          <td style="width:120px; text-align: right">课次：</td><td style="width: 150px;">'+item.courseNum+'</td>' +
                                    '          <td style="width:120px; text-align: right">周次：</td><td style="width: 150px;">'+item.weekNum+'</td>' +
                                    '          <td style="width:120px; text-align: right">日期：</td><td style="width: 150px;">'+item.commonDate+'</td>' +
                                    '       </tr>' +
                                    '       <tr>' +
                                    '          <td style="text-align: right">星期：</td><td>'+item.week+'</td>' +
                                    '          <td style="text-align: right">节次：</td><td>'+item.lessonNum+'</td>' +
                                    '          <td style="text-align: right">学时：</td><td>'+item.lessonHour+'</td>' +
                                    '         </tr>' +
                                    '        <tr>' +
                                    '           <td style="text-align: right">授课教师：</td><td colspan="5">'+item.skjsName+'('+item.skjsCode+')</td>' +
                                    '        </tr>' +
                                    '        <tr>' +
                                    '           <td style="text-align: right">授课目标：</td><td colspan="5">'+item.teachTarget+'</td>' +
                                    '        </tr>' +
                                    '        <tr>' +
                                    '           <td style="text-align: right">教学组织：</td><td colspan="5">'+item.teachDesign+'</td>' +
                                    '        </tr>' +
                                    '        <tr>' +
                                    '           <td style="text-align: right">课程思政点：</td><td colspan="5">'+item.politicElement+'</td>' +
                                    '        </tr>' +
                                    '    </table>';
                            });
                            //后执行
                            $('#dataInfoContainer').html(html);
                        }
                    }, "json");
                    //先执行
                    $('#dataInfoContainer').html(html);
                }
                ,end:function () {
                    $('#dataInfoContainer').empty();
                }
            });

        }  else {
            if(row_data.isSubmit == '已提交'){
                return;
            }
            //
            if (obj.event === 'insert') {

                layer.open({
                    id : guid()
                    ,title : '教学设计-课程教学实施方案-新增'
                    ,type : 1
                    ,area : [ '1175px', '500px' ]
                    ,offset : '50px'
                    ,content : $('#editFormContainer')
                    ,success: function(layero, index){
                        //初始化laydate实例
                        laydate.render({
                            elem: '#commonDate' //指定元素
                        });
                        //
                        $("select[name='courseInfo']").append('<option value="' + row_data.courseName + '" >' + row_data.courseName + '</option>');
                        form.render('select');
                        //
                        form.val("editForm",{
                            "code":row_data.code
                            ,"courseCode": row_data.courseCode
                            ,"courseName" : row_data.courseName
                            ,"courseAttr" : row_data.courseAttr
                            ,"courseLeader" : row_data.courseLeader
                            ,"teachClass" : row_data.teachClass
                            ,"studentNum" : row_data.studentNum
                            ,"classLocation" : row_data.classLocation
                            ,"openCollege" : row_data.openCollege
                            ,"userId":row_data.userId
                            ,"userName":row_data.userName
                        });
                        //监听表单提交
                        form.on('submit(toSubmitEidtForm)', function(_form_data){
                            $.post(requestUrl+'/jxsj_kcjxssfa/insert.do', _form_data.field, function (_result_data) {
                                layer.msg(_result_data.msg, {offset: '100px'},function () {
                                    /*if(_result_data.code === 200){
                                        myself_table.reload();//重新加载表格数据
                                    }*/
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
                        window.location.reload();
                    }
                });

            }
        }
    });

});
/*
教学设计-课程教学实施方案
 */
layui.use(['layer','table','form','laydate'], function(){
    var $ = layui.$,layer = layui.layer,table = layui.table,form = layui.form,laydate = layui.laydate;

    var isThpjRequest = 2 //是否同行评教转发过来的请求，默认不是
        , skjscode = "";
    //location.href 跳转页面时传递参数并且在新页面接收参数
    var params = location.search; //获取url中"?"后的参数
    if(params != "") {
        isThpjRequest = 1;
        skjscode = params.split("=")[1];
        $("#goBackThpj").css("display","block");
    };

    //初始化数据表格
    var datatable = table.render({
        id : guid()
        ,elem : '#datatable'
        ,height : 500
        ,url: requestUrl+'/jxsj_kcjxssfa/getPageList.do'
        ,where:{
            "accountType":function () {
                return $.cookie('accountType');
            },
            "userId":function () {
                return skjscode != "" ? skjscode : $.cookie('userId'); //如果skjscode 不为空则是从教学评价中跳转过来的
            },
            'isThpjRequest': isThpjRequest
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
        ,cols : [[ //表头
            {type:'checkbox', fixed: 'left'}
            ,{type:'numbers', title:'序号', width:80, fixed: 'left'}
            ,{field: 'courseName', title: '课程名称', width:180, sort:true, event: 'insert', templet: function (data) {
                    var html = '<a class="layui-btn layui-btn-radius layui-btn-xs layui-btn-disabled layui-btn-table"><i class="layui-icon layui-icon-read"></i>查看</a>';
                    if(data.isTxfa == 1){
                        html = '<a class="layui-btn layui-btn-radius layui-btn-xs layui-btn-normal layui-btn-table" lay-event="detail"><i class="layui-icon layui-icon-read"></i>查看</a>';
                    }
                    $('#datatable_bar').html(html);
                    if(data.isMineCourse == 1 && isThpjRequest == 2){ //是我的课程并且不是同行评教转发过来的才允许编辑
                        return '<span style="font-weight: bold; color: #1E9FFF; cursor: pointer;">'+data.courseName+'</span>';
                    }
                    return data.courseName;
                }
            }
            ,{field: 'courseCode', title: '课程编号', width:150, sort:true}
            ,{field: 'courseAttr', title: '课程性质', width:150, sort:true}
            // ,{field: 'xyName', title:'开课学院', width:150, sort:true}
            // ,{field: 'zyName', title: '适用专业', width:150, sort:true}
            ,{field: 'skjsName', title: '课程负责人', width:150, sort:true}
            ,{field: 'skBj', title: '授课班级', width:150, sort:true}
            ,{field: 'xsrs', title:'学生人数', width:150, sort:true}
            // ,{field: 'skSj', title:'上课时间', width:180, sort:true}
            ,{field: 'skDd', title:'上课地点', width:180, sort:true}
            ,{fixed: 'right', width:110, align:'center', toolbar: '#datatable_bar'}
        ]]
    });

    //监听搜索框事件
    $('.search .layui-btn').on('click', function(){
        let type = $(this).data('type');
        active[type] ? active[type].call(this) : '';
    });
    let active = {
        search: function(){
            datatable.reload({
                where: {
                    'courseName': $(".search input[name='courseName']").val(),
                    'isTxfa': $("#isTxfa option:selected").val()
                }
                ,page: {
                    curr: 1 //重新从第 1 页开始
                }
            });
        }
        ,reset: function () {
            $(".search input").val('');
            $("#isTxfa").val("");
            form.render("select");
        }
    };

    //监听工具条
    table.on('tool(datatable)', function(obj){
        let row_data = obj.data;
        //
        if (obj.event === 'detail') {

            layer.open({
                id :guid() //弹层唯一标识,一般用于页面层和iframe层模式,设置该值后，不管是什么类型的层，都只允许同时弹出一个。
                ,title : '课程教学实施方案'
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
                        '       <td style="text-align: right">开课学院（部）：</td><td colspan="3">'+row_data.xyName+'</td>' +
                        '       <td style="text-align: right">课程负责人：</td><td>'+row_data.skjsName+'</td>' +
                        '   </tr>' +
                        '   <tr>' +
                        '       <td style="text-align: right">授课班级：</td><td>'+row_data.skBj+'</td>' +
                        '       <td style="text-align: right">学生人数：</td><td>'+row_data.xsrs+'</td>' +
                        '       <td style="text-align: right">上课地点：</td><td>'+row_data.skDd+'</td>' +
                        '   </tr>' +
                        '</table>';

                    //
                    $.get(requestUrl+"/jxsj_kcjxssfa/getItemList.do", {
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

            if (obj.event === 'insert') {
                if(data.isMineCourse != 1 && isThpjRequest != 2){
                    return;
                }
                layer.open({
                    id : guid()
                    ,title : '课程教学实施方案'
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
                        form.val("editForm",{
                            "code": row_data.code
                            ,"courseCode": row_data.courseCode
                            ,"courseName" : row_data.courseName
                            ,"courseAttr" : row_data.courseAttr
                            ,"xn" : row_data.xn
                            ,"xq" : row_data.xq
                            ,"xyName" : row_data.xyName
                            ,"skjsCode" : row_data.skjsCode
                            ,"skjsName" : row_data.skjsName
                            ,"skBj" : row_data.skBj
                            ,"xsrs" : row_data.xsrs
                            ,"skDd" : row_data.skDd
                            ,"userId": $.cookie('userId')
                            ,"userName": $.cookie('userName')
                        });
                        //监听表单提交
                        form.on('submit(toSubmitEidtForm)', function(_form_data){
                            $.post(requestUrl+'/jxsj_kcjxssfa/insert.do', _form_data.field, function (_result_data) {
                                layer.msg(_result_data.msg, {offset: '100px'},function () {
                                    /*if(_result_data.code === 200){
                                        datatable.reload();//重新加载表格数据
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
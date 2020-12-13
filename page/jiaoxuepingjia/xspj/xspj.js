/**
 *教学评价-学生评教
 */
layui.use(['layer','table','form'], function(){
    let $ = layui.$,layer = layui.layer,table = layui.table,form = layui.form;

    const accountType = $.cookie('accountType');

    if(accountType == 'student'){
        //
        $.get(requestUrl+'/getActiveTemplate.do',{'templateType':'学生评教'},function (result_data) {
            //系统可以设定评教时间段，非时间段内，学生进入不了评教模块
            if(result_data.code != 200){ //是否评教时间
                layer.msg('评教功能暂未开放', {time : 3000, offset: '100px'});
                return;
            } else {

                //显示评教要求
                layer.open({
                    id: guid() //设定一个id，防止重复弹出
                    ,title: '评教说明'
                    ,type: 1
                    ,area : [ '700px', '400px' ]
                    ,offset : '50px' //只定义top坐标，水平保持居中
                    ,shade: 0.5
                    ,btn: ['确定']
                    ,btnAlign: 'c' //按钮居中显示
                    ,skin: 'layer-btn-skin'
                    ,closeBtn: false
                    ,content: '<div style="padding: 50px; line-height: 50px; background-color: lightslategray; color: #fff; font-weight: 300;">' +
                        '1.您的评价对于提高老师的教学能力非常有帮助。<br/>' +
                        '2.您的评价结果占教师教学质量评价结果的40%。<br/>' +
                        '3.您的评价为匿名评价，请根据实际情况给课程排序。<br/>' +
                        '4.谢谢您对学校教学工作的支持与配合。<br/>' +
                        '</div>'
                });

                //数据表格
                let datatable = table.render({
                    id: guid() //设定一个id，防止重复弹出
                    ,elem : '#datatable'
                    ,height : 580
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
                        ,{field:'courseName', title:'课程名称', width:180, sort:true, templet: function (data) {
                                let html = '<a class="layui-btn layui-btn-normal layui-btn-xs" lay-event="view">查看</a>';
                                if(data.isPj === 2){
                                    html = '<a class="layui-btn layui-btn-primary layui-btn-xs" lay-event="pj">评教</a>';
                                }
                                $('#datatable_bar').html(html);
                                return data.courseName;
                            }}
                        ,{field:'courseAttr', title:'课程性质', width:150, sort:true}
                        ,{field:'stuScore', title:'学分', width:150, sort:true}
                        ,{field:'stuHour', title:'学时', width:150, sort:true}
                        ,{field:'majorName', title:'适用专业', width:180, sort:true}
                        ,{field:'collegeName', title:'开课学院', width:180, sort:true}
                        ,{fixed: 'right', width:80, align:'center', toolbar: '#datatable_bar'}
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

                        //监听右侧工具条
                        table.on('tool(datatable)', function(obj){
                            if (obj.event === 'view') {
                                layer.msg('查看评教', {time : 3000, offset: '100px'});
                            } else  if (obj.event === 'pj') {

                                var datas = result_data.data
                                    ,currentIndex = 0;
                                //
                                layer.open({
                                    id: guid()
                                    ,title : '教学评价-学生评教'
                                    ,type : 1
                                    ,area : [ '900px', '500px' ]
                                    ,offset : '50px'
                                    ,btn: ['上一步', '下一步']
                                    ,yes: function(){
                                        if(currentIndex > 0){
                                            currentIndex -= 1;
                                            layer.msg('上一步'+currentIndex);
                                            let html = ' <div class="layui-form-item" style="margin-top: 20px" lay-verify="target">\n' +
                                                '<h3 style="margin-top: 20px; font-weight: bold">'+datas.length+'/'+parseInt(currentIndex+1)+'，'+datas[currentIndex].targetContent+'</h3><br/>' +
                                                '</div>';
                                            $("#editForm").html(html);
                                        }
                                    }
                                    ,btn2: function(){
                                        if(currentIndex < datas.length - 1){
                                            currentIndex += 1;
                                            layer.msg('下一步'+currentIndex);
                                            let html = ' <div class="layui-form-item" style="margin-top: 20px" lay-verify="target">\n' +
                                                '<h3 style="margin-top: 20px; font-weight: bold">'+datas.length+'/'+parseInt(currentIndex+1)+'，'+datas[currentIndex].targetContent+'</h3><br/>' +
                                                '</div>';
                                            $("#editForm").html(html);
                                        } else if(currentIndex < datas.length){
                                            currentIndex += 1;
                                            //课程信息列表

                                            //最喜欢的教师
                                            let html = '<div class="layui-form-item" style="margin-top: 20px;">\n' +
                                                '          <div class="layui-inline">\n' +
                                                '             <label class="layui-form-label" style="width: 100px;">最喜欢的教师：</label>\n' +
                                                '             <div class="layui-input-inline">\n' +
                                                '                <select name="level2" lay-filter="level2"></select>\n' +
                                                '             </div>\n' +
                                                '           </div>\n' +
                                                '       </div>';
                                            // 初始化获得奖项下拉选项
                                            $.get(requestUrl+'/optionset/getOptionSetList.do',{
                                                'menuId': 62,
                                                'attr': 'level2'
                                            },function(result_data){
                                                if(result_data.code == 200){
                                                    if(result_data.data.length >0){
                                                        initSelect('请选择','level2',result_data.data);
                                                        form.render('select');
                                                    }
                                                }
                                            },'json');
                                            //
                                            html += '<div class="layui-btn-container" style="margin-top: 20px" align="center">\n' +
                                                '       <button class="layui-btn layui-btn-normal" lay-submit="" lay-filter="toSubmitEidtForm">保存</button>\n' +
                                                '    </div>';
                                            $("#editForm").html(html);
                                        }
                                        return false;
                                    }
                                    ,content : $('#editForm_container')
                                    ,success: function(layero, index){

                                        let html = ' <div class="layui-form-item" style="margin-top: 20px" lay-verify="target">\n' +
                                            '<h3 style="margin-top: 20px; font-weight: bold">'+datas.length+'/'+parseInt(currentIndex+1)+'，'+datas[currentIndex].targetContent+'</h3><br/>' +
                                            '</div>';
                                        $("#editForm").html(html);

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
        },'json');

    } else{
        //数据表格
        let datatable = table.render({
            id: guid() //设定一个id，防止重复弹出
            ,elem : '#datatable'
            ,height : 580
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
                ,{field:'courseName', title:'课程名称', width:180, sort:true, templet: function (data) {
                        let html = '<a class="layui-btn layui-btn-normal layui-btn-xs" lay-event="pj">已评</a>';
                        if(data.isPj === 2){
                            html = '<a class="layui-btn layui-btn-disabled layui-btn-xs">未评</a>';
                        }
                        $('#datatable_bar').html(html);
                        return data.courseName;
                    }}
                ,{field:'courseAttr', title:'课程性质', width:150, sort:true}
                ,{field:'stuScore', title:'学分', width:150, sort:true}
                ,{field:'stuHour', title:'学时', width:150, sort:true}
                ,{field:'majorName', title:'适用专业', width:180, sort:true}
                ,{field:'collegeName', title:'开课学院', width:180, sort:true}
                ,{fixed: 'right', width:80, align:'center', toolbar: '#datatable_bar'}
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
                        $.get(requestUrl+'/xspj/getPjInfo.do',{
                            'courseCode':obj.data.courseCode
                        },function (result_data) {
                            layer.open({
                                title : '教学评价-学生评教-评教详情'
                                ,type : 1
                                ,area : [ '900px', '450px' ]
                                ,offset : '50px'
                                ,shadeClose : true //点击遮罩关闭
                                ,btn: ['关闭']
                                ,content : $('#dataInfo_container')
                                ,success: function(layero, index){
                                    let data = result_data.data;
                                    let html = '';
                                    $.each(data.targetList,function (idx,obj) {
                                        html += '<tr>\n' +
                                            '<td>'+parseInt(idx+1)+'</td>\n' +
                                            '<td>'+obj.TARGET_CONTENT+'</td>\n' +
                                            '<td>'+obj.TARGET_SCORE+'</td>\n' +
                                            '<td>'+obj.AVG_SCORE+'</td>\n' +
                                            '</tr>';
                                    });
                                    html += '<tr><td colspan="3" style="text-align: right">总平均分</td><td>'+data.totalAvg+'</td></tr>';
                                    html += '<tr><td colspan="4" style="text-align: left">学生对本课程的建议：</td></tr>';
                                    $.each(data.suggestList,function (idx,item) {
                                        html += '<tr>\n' +
                                            '<td>'+parseInt(idx+1)+'</td>\n' +
                                            '<td colspan="3">'+item+'</td>\n' +
                                            '</tr>';
                                    });
                                    $('#pjInfo').html(html);
                                }
                            });
                        },'json');
                    }
                });
            }
        });

    }

});
/**
 *教学评价-学生评教
 */
layui.use(['layer','table','form','transfer'], function(){
    let $ = layui.$,layer = layui.layer,table = layui.table,form = layui.form,transfer = layui.transfer;

    const accountType = $.cookie('accountType');
    if(accountType == 'student'){
        //
        $.get(requestUrl+'/getActiveTemplate.do',{'templateType':'学生评教'},function (result_data) {
            //系统可以设定评教时间段，非时间段内，学生进入不了评教模块
            if(result_data.code != 200){ //是否评教时间
                layer.msg('评教功能暂未开放', {time : 3000, offset: '100px'});
                return;
            } /*else {
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
            }*/

            //数据表格
            let datatable = table.render({
                id: guid() //设定一个id，防止重复弹出
                ,elem : '#datatable'
                ,height : 600
                ,url: requestUrl+'/getPjSetTemplateList.do'
                ,where:{
                    "templateType": '学生评教'
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
                    ,{field: 'templateName', title: '名称'}
                    ,{field: 'startDate', title: '开始时间', width:200}
                    ,{field: 'endDate', title: '结束时间', width:200, templet: function(data){ // 函数返回一个参数 data，包含接口返回的所有字段和数据
                            let html = '';
                            if(data.isActive === 1){
                                html = '<a class="layui-btn layui-btn-normal layui-btn-xs" lay-event="pj">评教</a>';
                            } else {
                                html = '<a class="layui-btn layui-btn-disabled layui-btn-xs">评教</a>';
                            }
                            $('#datatable_bar').html(html);
                            return data.endDate;
                        }
                    }
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
                            //根据userId 获取本学期课程及授课教师信息
                            $.get(requestUrl+'/xspj/getPjInfoTransferData.do', { 'userId': $.cookie('userId') }, function(result_data2){
                                if(result_data2.code == 200){
                                    //提取穿梭框初始数据
                                    var transferData = new Array();
                                    $.each(result_data2.data,function (idx,obj) {
                                        transferData.push({
                                            "value": obj.courseCode //数据值
                                            ,"title": obj.courseName + ' - '+ obj.teacherName //数据标题
                                        })
                                    });
                                    //
                                    var datas = result_data.data
                                        ,currentIndex = 0;
                                    var transferDataArr = [] //待选列表集合
                                        ,transferSelectedData = [] //已选列表集合
                                        ,transferSelectedDataArr = []; //发送到后台的
                                    layer.open({
                                        id: guid()
                                        ,title : '教学评价-学生评教'
                                        ,type : 1
                                        ,area : [ '900px', '500px' ]
                                        ,offset : '50px'
                                        ,btn: ['上一步', '下一步']
                                        ,yes: function(){ layer.msg('上一步'+currentIndex);
                                            if(currentIndex >= 0 ){
                                                //
                                                if(currentIndex < datas.length){

                                                    let getData = transfer.getData('demo_'+currentIndex);
                                                    if (getData.length != transferData.length ){
                                                        layer.msg("本题您还没有完成！");
                                                        return false;
                                                    } else {
                                                        transferDataArr[currentIndex] = getData;
                                                        //
                                                        let tempArr = [];
                                                        getData.forEach(obj => {
                                                            tempArr.push(obj.value);
                                                        });
                                                        transferSelectedData[currentIndex] = tempArr;
                                                        let tempObj = {
                                                            'targetCode': datas[currentIndex].targetCode,
                                                            'targetScore': datas[currentIndex].targetScore,
                                                            'arr': tempArr
                                                        };
                                                        transferSelectedDataArr[currentIndex] = tempObj;
                                                    }

                                                    if(currentIndex > 0 ){
                                                        currentIndex -= 1;
                                                    }

                                                    let html = ' <div class="layui-form-item" style="margin-top: 20px" lay-verify="target">\n' +
                                                        '<h3 style="margin-top: 20px; font-weight: bold">'+datas.length+'/'+parseInt(currentIndex+1)+'，'+datas[currentIndex].targetContent+'</h3><br/>' +
                                                        '<div id="test_'+currentIndex+'" class="demo-transfer"></div></div>';
                                                    $("#editForm").html(html);

                                                    //
                                                    transfer.render({
                                                        id: 'demo_'+ currentIndex //定义索引
                                                        , elem: '#test_'+ currentIndex
                                                        ,title: ['初始排序', '已选排序']  //自定义标题
                                                        ,data: transferDataArr[currentIndex]
                                                        ,value: transferSelectedData[currentIndex]
                                                        ,width: 320 //定义宽度
                                                        ,height: 280 //定义高度
                                                    });

                                                } else if(currentIndex == datas.length){
                                                    currentIndex -= 1;
                                                    let getData = transfer.getData('demo_'+currentIndex);
                                                    if (getData.length != transferData.length ){
                                                        layer.msg("本题您还没有完成！");
                                                        return false;
                                                    } else {
                                                        transferDataArr[currentIndex] = getData;
                                                        //
                                                        let tempArr = [];
                                                        getData.forEach(obj => {
                                                            tempArr.push(obj.value);
                                                        });
                                                        transferSelectedData[currentIndex] = tempArr;
                                                        let tempObj = {
                                                            'targetCode': datas[currentIndex].targetCode,
                                                            'targetScore': datas[currentIndex].targetScore,
                                                            'arr': tempArr
                                                        };
                                                        transferSelectedDataArr[currentIndex] = tempObj;
                                                    }
                                                    let html = ' <div class="layui-form-item" style="margin-top: 20px" lay-verify="target">\n' +
                                                        '<h3 style="margin-top: 20px; font-weight: bold">'+datas.length+'/'+parseInt(currentIndex+1)+'，'+datas[currentIndex].targetContent+'</h3><br/>' +
                                                        '<div id="test_'+currentIndex+'" class="demo-transfer"></div></div>';
                                                    $("#editForm").html(html);

                                                    //
                                                    transfer.render({
                                                        id: 'demo_'+ currentIndex //定义索引
                                                        , elem: '#test_'+ currentIndex
                                                        ,title: ['初始排序', '已选排序']  //自定义标题
                                                        ,data: transferDataArr[currentIndex]
                                                        ,value: transferSelectedData[currentIndex]
                                                        ,width: 320 //定义宽度
                                                        ,height: 280 //定义高度
                                                    });

                                                } else {
                                                    currentIndex = datas.length;
                                                    $("#editForm").html('上一步'+currentIndex);
                                                }
                                            }
                                        }
                                        ,btn2: function(){ layer.msg('下一步'+currentIndex);
                                            let code = new Date().getTime(); //初始化业务数据编号
                                            //
                                            if(currentIndex < datas.length - 1){
                                                let getData = transfer.getData('demo_'+currentIndex);
                                                if (getData.length != transferData.length ){
                                                    layer.msg("本题您还没有完成！");
                                                    return false;
                                                } else {
                                                    transferDataArr[currentIndex] = getData;
                                                    //
                                                    let tempArr = [];
                                                    getData.forEach(obj => {
                                                        tempArr.push(obj.value);
                                                    });
                                                    transferSelectedData[currentIndex] = tempArr;
                                                    let tempObj = {
                                                        'targetCode': datas[currentIndex].targetCode,
                                                        'targetScore': datas[currentIndex].targetScore,
                                                        'arr': tempArr
                                                    };
                                                    transferSelectedDataArr[currentIndex] = tempObj;
                                                }
                                                currentIndex += 1;

                                                let html = ' <div class="layui-form-item" style="margin-top: 20px" lay-verify="target">\n' +
                                                    '<h3 style="margin-top: 20px; font-weight: bold">'+datas.length+'/'+parseInt(currentIndex+1)+'，'+datas[currentIndex].targetContent+'</h3><br/>' +
                                                    '<div id="test_'+currentIndex+'" class="demo-transfer"></div></div>';
                                                $("#editForm").html(html);
                                                //
                                                transfer.render({
                                                    id: 'demo_'+ currentIndex //定义索引
                                                    , elem: '#test_'+ currentIndex
                                                    ,title: ['初始排序', '已选排序']  //自定义标题
                                                    ,data: transferDataArr[currentIndex] != null ? transferDataArr[currentIndex] : transferData
                                                    ,value: transferSelectedData[currentIndex]
                                                    ,width: 320 //定义宽度
                                                    ,height: 280 //定义高度
                                                })
                                            } else if(currentIndex < datas.length){
                                                let getData = transfer.getData('demo_'+currentIndex);
                                                if (getData.length != transferData.length ){
                                                    layer.msg("本题您还没有完成！");
                                                    return false;
                                                } else {
                                                    transferDataArr[currentIndex] = getData;
                                                    //
                                                    let tempArr = [];
                                                    getData.forEach(obj => {
                                                        tempArr.push(obj.value);
                                                    });
                                                    transferSelectedData[currentIndex] = tempArr;
                                                    let tempObj = {
                                                        'targetCode': datas[currentIndex].targetCode,
                                                        'targetScore': datas[currentIndex].targetScore,
                                                        'arr': tempArr
                                                    };
                                                    transferSelectedDataArr[currentIndex] = tempObj;
                                                }
                                                currentIndex += 1;
                                                //课程信息列表
                                                let html = '<table class="layui-table" id="course_datatable" lay-filter="course_datatable">\n' +
                                                    '           <script type="text/html" id="course_datatable_bar">\n' +
                                                    '               <a class="layui-btn layui-btn-normal layui-btn-xs" lay-event="pjjy">评教建议</a>\n' +
                                                    '           </script>\n' +
                                                    '       </table>';
                                                $("#editForm").html(html);
                                                //数据表格
                                                let course_datatable = table.render({
                                                    id: "course_datatable_id"
                                                    ,elem : '#course_datatable'
                                                    ,data: result_data2.data
                                                    ,defaultToolbar:[]
                                                    ,cols : [[ //表头
                                                        {type:'numbers', title:'序号', width:80, fixed: 'left'}
                                                        ,{field: 'courseCode', title: '课程编号', width:150, align:'center'}
                                                        ,{field: 'courseName', title: '课程名称', width:150, align:'center'}
                                                        ,{field: 'teacherName', title: '授课教师', align:'center'}
                                                        ,{fixed: 'right', title: '操作', width:120, align:'center', toolbar: '#course_datatable_bar'}
                                                    ]]
                                                    ,even: true //隔行背景
                                                    ,done : function(res, curr, count) {
                                                        //监听右侧工具条
                                                        table.on('tool(course_datatable)', function(obj){
                                                            if (obj.event === 'pjjy') {
                                                                layer.msg(111);
                                                            }
                                                        });
                                                    }
                                                });
                                            } else {
                                                currentIndex += 1;
                                                //最喜欢的教师
                                                let html = '<div class="layui-form-item" style="margin-top: 20px;">\n' +
                                                    '          <div class="layui-inline">\n' +
                                                    '             <label class="layui-form-label" style="width: 100px;">最喜欢的教师：</label>\n' +
                                                    '             <div class="layui-input-inline">\n' +
                                                    '                <select id="preferTeacher" name="preferTeacher" lay-filter="preferTeacher"></select>\n' +
                                                    '             </div>\n' +
                                                    '           </div>\n' +
                                                    '       </div>';
                                                //
                                                html += '<div class="layui-btn-container" style="margin-top: 20px" align="center">\n' +
                                                    '       <button class="layui-btn layui-btn-normal" lay-submit="" lay-filter="toSubmitEidtForm">保存</button>\n' +
                                                    '    </div>';
                                                $("#editForm").html(html);

                                                // 初始化下拉选项
                                                let html2 = '<option value="">请选择</option>';
                                                $.each(result_data2.data,function (idx,obj) {
                                                    html2 += '<option value="' + obj.teacherCode + '" >' + obj.teacherName + '</option>';
                                                });
                                                $("select[name='preferTeacher']").empty().append(html2);
                                                form.render('select');

                                                //监听提交
                                                form.on('submit(toSubmitEidtForm)', function(formData){

                                                    $.ajax({
                                                        url: requestUrl+'/xspj/insertBjpj.do',
                                                        type: 'POST',
                                                        dataType: "json",
                                                        data: {
                                                            'code': code,
                                                            'templateCode': obj.data.templateCode,
                                                            'transferSelectedDataArr': JSON.stringify(transferSelectedDataArr),
                                                            'preferTeacher': $("#preferTeacher").val(),
                                                            'userId': $.cookie('userId'),
                                                            'userName': $.cookie('userName')
                                                        },
                                                        success: function (result_data) {
                                                            alert(result_data.msg);
                                                        },
                                                        error: function (result_data) {
                                                            alert(result_data.msg);
                                                        }
                                                    });

                                                });
                                            }
                                            return false;
                                        }
                                        ,content : $('#editForm_container')
                                        ,success: function(layero, index){

                                            let html = ' <div class="layui-form-item" style="margin-top: 20px" lay-verify="target">\n' +
                                                '<h3 style="margin-top: 20px; font-weight: bold">'+datas.length+'/1，'+datas[currentIndex].targetContent+'</h3><br/>' +
                                                '<div id="test_0" class="demo-transfer"></div></div>';
                                            $("#editForm").html(html);
                                            //
                                            transfer.render({
                                                id: 'demo_0' //定义索引
                                                , elem: '#test_0'
                                                ,title: ['初始排序', '已选排序']  //自定义标题
                                                ,data: transferData
                                                // ,value: ["1111110101", "1111110102"] 默认摆放顺序以data 属性值的顺序为依据
                                                ,width: 320 //定义宽度
                                                ,height: 280 //定义高度
                                            })
                                        }
                                        ,cancel: function(index, layero){
                                            layer.confirm('表单未提交，填写的信息将会清空？', {icon: 3, title:'提示', offset: '100px'}, function(index) {
                                                layer.closeAll();
                                            });
                                            return false;
                                        }
                                    });
                                } else {
                                    layer.msg("数据加载失败");
                                }
                            },'json');
                        }
                    });
                }
            });

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
/**
 *教学评价-学生评教
 */
layui.use(['layer','table','form','transfer'], function(){
    var $ = layui.$,layer = layui.layer,table = layui.table,form = layui.form,transfer = layui.transfer;

    var accountType = $.cookie('accountType');
    if(accountType == 'student'){ //学生视角

        //数据表格
        var datatable = table.render({
            id: guid() //设定一个id，防止重复弹出
            ,elem : '#datatable'
            ,height : 580
            ,url: requestUrl+'/getPjSetTemplateList.do'
            ,where:{
                "templateType": '学生评教',
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
                ,{field: 'templateName', title: '模板名称'}
                ,{field: 'startDate', title: '开始时间', width:200}
                ,{field: 'endDate', title: '结束时间', width:200, templet: function(data){ // 函数返回一个参数 data，包含接口返回的所有字段和数据
                        let html = '';
                        if(data.isActive == 1){
                            if(data.isPj == 1){
                                html = '<a class="layui-btn layui-btn-xs layui-btn-radius layui-btn-table layui-btn-normal" lay-event="isPj1">查看评教</a>';
                            } else {
                                html = '<a class="layui-btn layui-btn-xs layui-btn-radius layui-btn-table layui-btn-warm" lay-event="isPj2">未评</a>';
                            }
                        } else {
                            html = '<a class="layui-btn  layui-btn-xs layui-btn-radius layui-btn-table layui-btn-disabled">评教时间已过</a>';
                        }
                        $('#datatable_toolbar').html(html);
                        return data.endDate;
                    }
                }
                ,{fixed: 'right', width:132, align:'center', toolbar: '#datatable_toolbar'}
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

            }
        });

        //监听右侧工具条
        table.on('tool(datatable)', function(obj){
            if (obj.event === 'isPj1') {
                layer.msg("查看评教", {offset: '100px'});
            } else if (obj.event === 'isPj2') {
                //
                var targets = null;
                $.get(requestUrl+'/getActiveTemplate.do', {'templateType': '学生评教', 'templateCode': obj.data.templateCode}, function(result_data){
                        if(result_data.code == 200){
                            targets = result_data.data;
                        } else {
                            layer.msg("数据加载失败！", {offset: '100px'});
                            return;
                        }
                },'json');
                //根据userId 获取本学期课程及授课教师信息
                $.get(requestUrl+'/xspj/getBjpjTransferData.do', { 'userId': $.cookie('userId') }, function(result_data){
                    if(result_data.code == 200){
                        //提取穿梭框初始数据
                        var transferData = [];
                        $.each(result_data.data,function (idx,obj) {
                            transferData.push({
                                "value": obj.courseCode //数据值
                                ,"title": obj.courseName + ' - '+ obj.teacherNames //数据标题
                            })
                        });
                        //
                        var currentIndex = 0;
                        var transferLeftDatas = [] //待选列表数据集
                            ,transferRightDatas = [] //已选列表数据集
                            ,transferSelectedDatas = []; //发送到后台的数据集
                        //
                        layer.open({
                            id: guid()
                            ,title : ['学生评教', 'font-size:16px; font-weight: bold;']
                            ,type : 1
                            ,area : [ '900px', '505px' ]
                            ,offset : '50px'
                            ,btn: ['上一步', '下一步']
                            ,yes: function(){
                                if(currentIndex > 0 ){
                                    if (currentIndex < targets.length ){
                                        /*收集当前页面数据*/
                                        let getData = transfer.getData('demo_'+currentIndex);
                                        getData = getData.filter(function(item, index, arr) {
                                            return arr.indexOf(item, 0) === index; //当前元素，在原始数组中的第一个索引===当前索引值，否则返回当前元素
                                        });
                                        //
                                        if (getData.length != transferData.length ){
                                            layer.msg("本题您还没有完成！");
                                            return false;
                                        } else {
                                            //
                                            transferLeftDatas[currentIndex] = getData;
                                            //
                                            let courseCodes = [];
                                            getData.forEach(obj => {
                                                courseCodes.push(obj.value);
                                            });
                                            transferRightDatas[currentIndex] = courseCodes;
                                            //
                                            transferSelectedDatas[currentIndex] = {
                                                'targetCode': targets[currentIndex].targetCode,
                                                'targetScore': targets[currentIndex].targetScore,
                                                'arr': courseCodes
                                            };
                                        }
                                    } else {
                                        $('.layui-layer-btn1').css('background-color','#1E9FFF').css('border','1px solid #1E9FFF').css('color','#fff');
                                    }
                                    /*初始化上一个页面*/
                                    currentIndex--;
                                    let html = ' <div class="layui-form-item" style="margin-top: 20px" lay-verify="target">\n' +
                                        '<h3 style="margin-top: 20px; font-weight: bold">'+parseInt(currentIndex+1)+'/'+targets.length+'，'+targets[currentIndex].targetContent+'</h3><br/>' +
                                        '<div id="test_'+currentIndex+'" class="demo-transfer"></div></div>';
                                    $("#editForm").html(html);
                                    //
                                    transfer.render({
                                        id: 'demo_'+ currentIndex //定义索引
                                        , elem: '#test_'+ currentIndex
                                        ,title: ['课程列表', '我的排序']  //自定义标题
                                        ,data: transferLeftDatas[currentIndex]
                                        ,value: transferRightDatas[currentIndex]
                                        ,width: 320 //定义宽度
                                        ,height: 280 //定义高度
                                    });
                                    //
                                    if(currentIndex == 0){
                                        $('.layui-layer-btn0').css('background-color','#fff').css('border','1px solid #c9c9c9').css('color','#c9c9c9').css('cursor','not-allowed');
                                    }
                                }
                            }
                            ,btn2: function(){

                                /*收集当前页面数据*/
                                let getData = transfer.getData('demo_'+currentIndex);
                                getData = getData.filter(function(item, index, arr) {
                                    return arr.indexOf(item, 0) === index; //当前元素，在原始数组中的第一个索引===当前索引值，否则返回当前元素
                                });
                                //
                                if (getData.length != transferData.length ){
                                    layer.msg("本题您还没有完成！");
                                    return false;
                                } else {
                                    //
                                    transferLeftDatas[currentIndex] = getData;
                                    //
                                    let courseCodes = [];
                                    getData.forEach(obj => {
                                        courseCodes.push(obj.value);
                                    });
                                    transferRightDatas[currentIndex] = courseCodes;
                                    //
                                    transferSelectedDatas[currentIndex] = {
                                        'targetCode': targets[currentIndex].targetCode,
                                        'targetScore': targets[currentIndex].targetScore,
                                        'arr': courseCodes
                                    };
                                }

                                /*初始化下一个页面*/
                                if(currentIndex < targets.length - 1){
                                    currentIndex++;
                                    let html = ' <div class="layui-form-item" style="margin-top: 20px" lay-verify="target">\n' +
                                        '<h3 style="margin-top: 20px; font-weight: bold">'+parseInt(currentIndex+1)+'/'+targets.length+'，'+targets[currentIndex].targetContent+'</h3><br/>' +
                                        '<div id="test_'+currentIndex+'" class="demo-transfer"></div></div>';
                                    $("#editForm").html(html);
                                    //
                                    transfer.render({
                                        id: 'demo_'+ currentIndex //定义索引
                                        , elem: '#test_'+ currentIndex
                                        ,title: ['课程列表', '我的排序']  //自定义标题
                                        ,data: transferLeftDatas[currentIndex] != null && transferLeftDatas[currentIndex].length > 0 ? transferLeftDatas[currentIndex] : transferData
                                        ,value: transferRightDatas[currentIndex]
                                        ,width: 320 //定义宽度
                                        ,height: 280 //定义高度
                                    });
                                    //
                                } else if(currentIndex < targets.length){
                                    currentIndex++;
                                    //课程信息列表
                                    let html = '<table class="layui-table" id="course_datatable" lay-filter="course_datatable">\n' +
                                        '           <script type="text/html" id="course_datatable_bar">\n' +
                                        '               <a class="layui-btn layui-btn-xs layui-btn-radius layui-btn-table layui-btn-warm"  style="width: 150px" lay-event="suggest">填写评教意见或建议</a>\n' +
                                        '           </script>\n' +
                                        '       </table>';

                                    html += '<h3 style="color: gray;">您的评价对于提高老师的教学能力非常有帮助，请仔细核对评价信息。</h3>' +
                                        '        <div class="layui-btn-container" style="margin-top: 20px;" align="center">\n' +
                                        '            <button type="button" class="layui-btn layui-btn-radius layui-btn-normal" style="width: 80px;" lay-submit="" lay-filter="toSubmitEidtForm">保存</button>\n' +
                                        '        </div>';
                                    $("#editForm").html(html);
                                    //数据表格
                                    var course_datatable = table.render({
                                        id: "course_datatable_id"
                                        ,elem : '#course_datatable'
                                        ,data: result_data.data
                                        ,defaultToolbar:[]
                                        ,cols : [[ //表头
                                            {type:'numbers', title:'序号', width:80, fixed: 'left'}
                                            ,{field: 'courseCode', title: '课程编号', width:150, align:'center'}
                                            ,{field: 'courseName', title: '课程名称', align:'center'}
                                            // ,{field: 'teacherNames', title: '授课教师', width:150, align:'center'}
                                            ,{fixed: 'right', title: '操作', width:180, align:'center', toolbar: '#course_datatable_bar'}
                                        ]]
                                        ,even: true //隔行背景
                                        ,done : function(res, curr, count) {
                                            //监听右侧工具条
                                            table.on('tool(course_datatable)', function(obj){
                                                if (obj.event === 'suggest') {
                                                    layer.open({
                                                        title : '填写评教意见或建议'
                                                        ,type : 1
                                                        ,area : [ '700px', '300px' ]
                                                        ,offset : '100px'
                                                        ,content : $('#suggest_container')
                                                        ,success: function(layero, index){

                                                            //表单赋值
                                                            $.get(requestUrl+'/xspj/selectBjpjSuggest.do',{
                                                                "relationCode": code,
                                                                "courseCode": obj.data.courseCode
                                                            },function (result_data) {
                                                                if(result_data.code == 200){
                                                                    form.val("suggestForm",{
                                                                        "suggest":result_data.data
                                                                    });
                                                                }
                                                            },'json');

                                                            //监听表单提交
                                                            form.on('submit(toSubmitSuggestForm)', function(form_data){
                                                                $.post(requestUrl+'/xspj/insertBjpjSuggest.do',{
                                                                    "relationCode": code,
                                                                    "xn": obj.data.xn,
                                                                    "xq": obj.data.xq,
                                                                    "courseCode": obj.data.courseCode,
                                                                    "suggest": form_data.field.suggest
                                                                },function (result_data) {
                                                                    layer.msg(result_data.msg, { offset: '100px' },function () {
                                                                        layer.close(index);
                                                                    });
                                                                    // layer.close(index); //过程性新增不需要提示
                                                                },'json');
                                                                return false;
                                                            });

                                                        }
                                                        ,end:function () {
                                                            $("#suggest").val("");
                                                        }
                                                    });
                                                }
                                            });
                                        }
                                    });
                                    //
                                    $('.layui-layer-btn1').css('background-color','#fff').css('border','1px solid #c9c9c9').css('color','#c9c9c9').css('cursor','not-allowed');
                                }
                                $('.layui-layer-btn0').css('background-color','#1E9FFF').css('border','1px solid #1E9FFF').css('color','#fff').css('cursor','pointer');
                                return false;
                            }
                            ,content : $('#editForm_container')
                            ,success: function(layero, index){
                                //
                                let html = ' <div class="layui-form-item" style="margin-top: 20px" lay-verify="target">\n' +
                                    '<h3 style="margin-top: 20px; font-weight: bold">'+parseInt(currentIndex+1)+'/'+targets.length+'，'+targets[currentIndex].targetContent+'</h3><br/>' +
                                    '<div id="test_0" class="demo-transfer"></div></div>';
                                $("#editForm").html(html);
                                //
                                transfer.render({
                                    id: 'demo_0' //定义索引
                                    , elem: '#test_0'
                                    ,title: ['课程列表', '我的排序']  //自定义标题
                                    ,data: transferData
                                    // ,value: ["1111110101", "1111110102"] 默认摆放顺序以data 属性值的顺序为依据
                                    ,width: 320 //定义宽度
                                    ,height: 280 //定义高度
                                });
                                //
                                $('.layui-layer-btn0').css('background-color','#fff').css('border','1px solid #c9c9c9').css('color','#c9c9c9').css('cursor','not-allowed');
                                $('.layui-layer-btn1').css('background-color','#1E9FFF').css('border','1px solid #1E9FFF').css('color','#fff');
                            }
                            ,cancel: function(index, layero){
                                layer.confirm('表单未提交，填写的信息将会清空？', {icon: 3, title:'提示', offset: '100px'}, function(index) {
                                    layer.closeAll();
                                });
                                return false;
                            }
                        });
                    } else {
                        layer.msg("数据加载失败！");
                    }
                },'json');
            }
        });

    } else{ //教师视角

        //数据表格
        var datatable = table.render({
            id: guid() //设定一个id，防止重复弹出
            ,elem : '#datatable'
            ,height : 580
            ,url: requestUrl+'/xspj/getBjpjPageList.do'
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
                ,{field:'courseName', title:'课程名称', width:200, sort:true, templet: function (data) {
                        let html = '<a class="layui-btn layui-btn-normal layui-btn-xs" lay-event="pj">已评</a>';
                        if(data.isPj === 2){
                            html = '<a class="layui-btn layui-btn-disabled layui-btn-xs">未评</a>';
                        }
                        $('#datatable_toolbar').html(html);
                        return data.courseName;
                    }}
                ,{field:'courseAttr', title:'课程性质', width:150, sort:true}
                ,{field:'xs', title:'学时', width:150, sort:true}
                ,{field:'xf', title:'学分', width:150, sort:true}
                ,{field:'xn', title:'学年', width:150, sort:true}
                ,{field:'xq', title:'学期', width:150, sort:true}
                ,{field:'xyName', title:'学院', width:150, sort:true}
                ,{field:'zyName', title:'专业', width:150, sort:true}
                ,{fixed: 'right', width:120, align:'center', toolbar: '#datatable_toolbar'}
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

            }
        });

        //监听右侧工具条
        table.on('tool(datatable)', function(obj){
            if (obj.event === 'pj') {
                $.get(requestUrl+'/xspj/getBjpjPjInfo.do',{
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
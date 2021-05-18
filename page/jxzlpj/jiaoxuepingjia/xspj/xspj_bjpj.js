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
            ,height : 466
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
        });

        //监听右侧工具条
        table.on('tool(datatable)', function(obj){
            if (obj.event === 'isPj1') {
                $.get(requestUrl+'/xspj/getBjpjPjSuggestList.do', {'userId': $.cookie('userId'), 'templateCode': obj.data.templateCode}, function(result_data){
                    if(result_data.code == 200){
                        layer.open({
                            title : '查看评教'
                            ,type : 1
                            ,area : [ '900px','500px']
                            ,offset : '50px'
                            ,shadeClose : true
                            ,btn : ['关闭']
                            ,content : $('#pjSuggest_container')
                            ,success: function(layero, index){
                                var html = '';
                                $.each(result_data.data,function (idx,obj) {
                                    html += '<fieldset class="layui-elem-field" style="margin-top: 15px;">\n' +
                                        '\t<legend>'+obj.COURSE_NAME+'</legend>\n' +
                                        '\t<div class="layui-panel">'+obj.PJ_SUGGEST+'</div>\n' +
                                        '</fieldset>';
                                });
                                $('#pjSuggest_container').html(html);
                            }
                        });
                    } else {
                        layer.msg("数据加载失败！", {offset: '100px'});
                        return;
                    }
                },'json');
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
                        var tempPjsuggest = {}; //临时存储评教信息
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
                                        var data = $('#editForm').serializeArray(); //jquery获取form表单中的数据
                                        $.each(data, function() {
                                            tempPjsuggest[this.name] = this.value;
                                        });
                                        // layer.alert(JSON.stringify(tempPjsuggest));
                                        $('.layui-layer-btn1').css('background-color','#1E9FFF').css('border','1px solid #1E9FFF').css('color','#fff').css('cursor','pointer');
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
                                    //填写评教意见
                                    var html = '';
                                    $.each(result_data.data,function (idx,obj) {
                                        html += '<fieldset class="layui-elem-field">\n' +
                                            '\t<legend>'+obj.courseName+'</legend>\n' +
                                            '\t<textarea name="'+obj.courseCode+'" placeholder="请填写评教建议或意见" class="layui-textarea" style="border: 0; resize: none;"></textarea>\n' +
                                            '</fieldset>';
                                    });
                                    //保存
                                    html += '<h3 style="color: gray;">您的评价对于提高老师的教学能力非常有帮助，请仔细核对评价信息。</h3>' +
                                        '        <div class="layui-btn-container" style="margin-top: 20px;" align="center">\n' +
                                        '            <button type="button" class="layui-btn layui-btn-radius layui-btn-normal" style="width: 100px;" lay-submit="" lay-filter="toSubmitEidtForm">保存</button>\n' +
                                        '        </div>';
                                    $("#editForm").html(html);

                                    //表单赋值
                                    if(!$.isEmptyObject(tempPjsuggest)){
                                        form.val("editForm", tempPjsuggest);
                                    }
                                    //监听提交
                                    form.on('submit(toSubmitEidtForm)', function(data){

                                        /*layer.alert(JSON.stringify(data.field), {
                                            title: '最终的提交信息'
                                        });
                                        return false;*/

                                        $.post(requestUrl+'/xspj/insertBjpj.do',{
                                                'xn':result_data.data[0].XN,
                                                'xq':result_data.data[0].XQ,
                                                'templateCode': obj.data.templateCode,
                                                'transferDatas': JSON.stringify(transferSelectedDatas),
                                                'pjSuggestJsonString': JSON.stringify(data.field),
                                                'userId': $.cookie('userId'),
                                                'userName': $.cookie('userName')
                                            },function(result_data){
                                            layer.msg(result_data.msg, {offset: '100px'}, function () {
                                                if(result_data.code == 200){
                                                    datatable.reload();//重新加载表格数据
                                                }
                                                layer.closeAll();
                                            });
                                        },'json');

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
                        return;
                    }
                },'json');
            }
        });

    } else{ //教师视角

        //数据表格
        var datatable = table.render({
            id: guid() //设定一个id，防止重复弹出
            ,elem : '#datatable'
            ,height : 466
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
                ,{field:'xn', title:'学年', width:150, sort:true}
                ,{field:'xq', title:'学期', width:150, sort:true, templet: function (data) {
                        let html = '<a class="layui-btn layui-btn-xs layui-btn-radius layui-btn-table layui-btn-normal" lay-event="isPj1">查看评教</a>';
                        if(data.isPj === 2){
                            html = '<a class="layui-btn layui-btn-xs layui-btn-radius layui-btn-table layui-btn-disabled">未评</a>';
                        }
                        $('#datatable_toolbar').html(html);
                        return data.xq == '3'?'第一学期':'第二学期';
                    }
                }
                ,{field:'courseCode', title:'课程编号', width:150, sort:true}
                ,{field:'courseName', title:'课程名称', sort:true}
                /*,{field:'courseAttr', title:'课程性质', width:150, sort:true}
                ,{field:'skjsCode', title:'授课教师编号', width:150, sort:true}
                ,{field:'skjsName', title:'授课教师姓名', width:150, sort:true}
                ,{field:'skSj', title:'授课时间', width:150, sort:true}
                ,{field:'skDd', title:'授课地点', width:150, sort:true}*/
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
            ,done: function(res, curr, count){
                $('.search').css('display','block');
            }
        });

        //监听搜索框事件
        var active = {
            search: function(){
                datatable.reload({
                    where: {
                        'xn': $("#xn option:selected").val(), //获取选中的值,
                        'xq': $("#xq option:selected").val(),
                        'courseName': $(".search input[ name='courseName']").val(),
                        'isPj': $("#isPj option:selected").val()
                    }
                    ,page: {
                        curr: 1 //重新从第 1 页开始
                    }
                });
            }
            ,reset: function () {
                $("#xn").val(""); //清除选中状态
                $("#xq").val("");
                $(".search input").val('');
                $("#isPj").val("");
                form.render("select");
            }
        };
        $('.search .layui-btn').on('click', function(){
            let type = $(this).data('type');
            active[type] ? active[type].call(this) : '';
        });

        //监听右侧工具条
        table.on('tool(datatable)', function(obj){
            if (obj.event === 'isPj1') {
                $.get(requestUrl+'/xspj/getBjpjPjInfo.do',{
                    'xn':obj.data.xn,
                    'xq':obj.data.xq,
                    'courseCode':obj.data.courseCode
                    ,'teacherCode': obj.data.skjsCode
                },function (result_data) {
                    //
                    layer.open({
                        title : '查看评价'
                        ,type : 1
                        ,area : [ '900px', '500px' ]
                        ,offset : '50px'
                        ,shadeClose : true //点击遮罩关闭
                        ,btn: ['关闭']
                        ,content : $('#dataInfo_container')
                        ,success: function(layero, index){
                            let data = result_data.data;
                            $('#pjInfo').html('<tr><td style="width:120px; font-size:18px;">总平均分：</td><td>'+data.totalAvgScore+'</td></tr>' +
                                '<tr><td style="width:120px; font-size:18px;">评教人次：</td><td>'+data.pjNum+'</td></tr>');
                            let html = '';
                            $.each(data.suggestList,function (idx,obj) {
                                html += '<div class="layui-panel">'+obj+'</div>';
                            });
                            $('#pjSuggest').html(html);
                        }
                    });
                },'json');
            }
        });
    }
});
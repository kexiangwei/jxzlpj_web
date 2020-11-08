/*
教学评价-同行评教
 */
layui.use(['layer','element','table','form','laydate'], function(){
    var $ = layui.$,layer = layui.layer,element = layui.element,table = layui.table,form = layui.form,laydate = layui.laydate;

    //初始化学院下拉选项
    $.get(requestUrl+'/common/getCollege.do',{},function(data){
        if(data.code == 200){
            let teacherCollegeList =  data.data;
            if(teacherCollegeList.length > 0){
                reloadSelect('teacherCollege',teacherCollegeList);
            }
        }
    },'json');

    //初始化专业下拉选项
    var teacherMajorList;
    $.get(requestUrl+'/common/getMajor.do',{},function(data){
        if(data.code == 200){
            teacherMajorList =  data.data;
            if(teacherMajorList.length > 0){
                reloadSelect('teacherMajor',teacherMajorList);
            }
        }
    },'json');

    // 监听学院选项
    form.on('select(teacherCollege)', function(data) {
        let collegeCode = data.value;
        if(collegeCode == ''){
            reloadSelect('teacherMajor',teacherMajorList);
        }else{
            $.get(requestUrl+'/common/getMajor.do',{"collegeCode":collegeCode},function(data){
                if(data.code == 200){
                    reloadSelect('teacherMajor',data.data);
                }
            },'json');
        }
    });

    // 加载菜单选项
    var reloadSelect = function(inputName,data){
        $("select[name='"+inputName+"']").empty(); //移除下拉框所有选项option
        let htmlstr = '<option value="">请选择</option>';
        for (var i = 0; i < data.length; i++) {
            htmlstr += '<option value="' + data[i].CODE + '" >' + data[i].NAME + '</option>';
        }
        $("select[name='"+inputName+"']").append(htmlstr);
        form.render('select');
    };

    //初始化日期控件
    laydate.render({
        elem: '#teachDate'
    });

    //初始化数据表格
    var datatable = table.render({
        id: guid()
        ,elem : '#datatable'
        ,height : 460
        ,url: requestUrl+'/jxpj_thpj/getPageList.do'
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
                    let html = '<a class="layui-btn layui-btn-primary layui-btn-xs" lay-event="detail"><i class="layui-icon layui-icon-read"></i>查看</a>';
                    if(data.isPj == 2){
                        html = '<a class="layui-btn layui-btn-disabled layui-btn-xs" lay-event="detail"><i class="layui-icon layui-icon-read"></i>查看</a>';
                    }
                    $('#datatable_bar').html(html);
                    return '<span style="font-weight: bold; cursor: pointer;">'+data.courseName+'</span>';
             }}
            ,{field:'courseType', title:'课程性质', width:150, sort:true}
            ,{field:'teacher', title:'任课教师姓名', width:150, sort:true}
            ,{field:'teacherCollege', title:'教师所在学院', width:150, sort:true}
            ,{field:'teacherMajor', title:'教师所在专业', width:150, sort:true}
            ,{field:'teachDate', title:'上课时间', width:150, sort:true}
            ,{field:'teachAddr', title:'上课地点', sort:true}
            ,{fixed: 'right', width:100, align:'center', toolbar: '#datatable_bar'}
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
                    let teacherCollege = $("#teacherCollege option:selected").text()
                        ,teacherMajor = $("#teacherMajor option:selected").text();
                    datatable.reload({
                        where: {
                            'teacherCollege': teacherCollege != '请选择'? teacherCollege:null,
                            'teacherMajor':teacherMajor != '请选择'? teacherMajor:null,
                            'teacher': $(".search input[ name='teacher']").val(),
                            'teacherAge': $("#teacherAge option:selected").val(),
                            'teacherTitle': $("#teacherTitle option:selected").val(),
                            'courseName': $(".search input[ name='courseName']").val(),
                            'courseType': $("#courseType option:selected").val(),
                            'teachDate': $(".search input[ name='teachDate']").val()
                        }
                        ,page: {
                            curr: 1 //重新从第 1 页开始
                        }
                    });
                }
                ,reset: function () {
                    $(".search input").val('');
                    //清除选中状态
                    $("#teacherCollege").val("");
                    $("#teacherMajor").val("");
                    $("#teacherAge").val("");
                    $("#teacherTitle").val("");
                    $("#courseType").val("");
                    form.render("select");
                }
            };
            $('.search .layui-btn').on('click', function(){
                let type = $(this).data('type');
                active[type] ? active[type].call(this) : '';
            });

            //监听工具条
            table.on('tool(datatable)', function(obj){
                let rowData = obj.data;
                if (obj.event === 'detail') {
                    if(rowData.isPj == 2){
                        return;
                    }
                    $.get(requestUrl+'/jxpj_thpj/detail.do',{'pjCode':rowData.pjCode}, function (result_data) {
                        if(result_data.code == 200){
                            let data = result_data.data;
                            var thpjItemList = data.thpjItemList;
                            ////////////////////////////////////////////////////////////////////////////////////////////
                            $.get(requestUrl+'/jxpj_thpj/getThpjTargetList.do',{'pjCode':rowData.pjCode},function (result_data) {
                                let data = result_data.data;
                                let html = '';
                                for (let i = 0; i < data.length; i++) {
                                    html += '<tr><td rowspan="'+data[i].num+'">'+data[i].name+'（'+data[i].score+'分）</td>\n';
                                    for (let j = 0; j < data[i].num; j++) {
                                        let obj = data[i].targetList[j];
                                        html += '<td>\n' +parseInt(j+1)+'．'+obj.targetContent+'</td>\n' +
                                            '<td>'+obj.targetScore+'</td>\n' +
                                            '<td><input type="text" id="'+obj.targetCode+'" name="'+obj.targetCode+'" score="'+obj.targetScore+'" required  lay-verify="required|score" class="layui-form-input2 score"></td></tr>';
                                    }
                                }
                                html += '<tr><td colspan="3" style="text-align: right">评分合计</td>' +
                                    '<td style="text-align: center"><input type="text" name="totalScore" lay-verify="required|totalScore" class="layui-form-input2" style="cursor:not-allowed" readonly></td></tr>';
                                $('#target').html(html);
                                //
                                $.each(thpjItemList,function (idx,obj) {
                                    $('input[name="'+obj.targetCode+'"]').val(obj.answer);
                                });
                            },'json');
                            ////////////////////////////////////////////////////////////////////////////////////////////
                            let layIndex = layer.open({
                                id: guid() //设定一个id，防止重复弹出
                                ,title : '教学评价-课程质量评价'
                                ,type : 1
                                ,area : [ '1100px', '500px' ]
                                ,offset : '30px' //只定义top坐标，水平保持居中
                                ,shadeClose : true //点击遮罩关闭
                                ,btn : ['教学研究','教学设计','教学效果','关闭']
                                ,yes: function(index, layero){
                                    initTeacherBar('教学研究',rowData);
                                    return false;
                                }
                                ,btn2: function(index, layero){
                                    initTeacherBar('教学设计',rowData);
                                    return false;
                                }
                                ,btn3: function(index, layero){
                                    initTeacherBar('教学效果',rowData);
                                    return false;
                                }
                                ,skin: 'demo-class'
                                ,content : $('#editForm_container')
                                ,success: function(layero, index){
                                    //
                                    form.val("editForm",data);
                                    //
                                    $('#editForm .layui-btn-container').css('display','none');
                                }
                                ,end:function () {
                                    $('#editForm')[0].reset(); //清空表单数据
                                    form.render();
                                    $('#editForm .layui-btn-container').css('display','block');
                                }
                            });
                        }
                    },'json');

                } else if (obj.event === 'courseName') {
                    //
                    $.get(requestUrl+'/jxpj_thpj/getThpjTargetList.do',function (result_data) {
                        if(result_data.code == 200){
                            let data = result_data.data;

                            var templateCode = '';
                            let html = '';
                            for (let i = 0; i < data.length; i++) {
                                html += '<tr><td rowspan="'+data[i].num+'">'+data[i].name+'（'+data[i].score+'分）</td>\n';
                                for (let j = 0; j < data[i].num; j++) {
                                    let obj = data[i].targetList[j];
                                    templateCode = obj.templateCode;
                                    html += '<td>\n' +parseInt(j+1)+'．'+obj.targetContent+'</td>\n' +
                                        '<td>'+obj.targetScore+'</td>\n' +
                                        '<td><input type="text" name="'+obj.targetCode+'" score="'+obj.targetScore+'" required  lay-verify="required|score" class="layui-form-input2 score"></td></tr>';
                                }
                            }
                            html += '<tr><td colspan="3" style="text-align: right">评分合计</td>' +
                                '<td style="text-align: center"><input type="text" name="totalScore" lay-verify="required|totalScore" class="layui-form-input2" style="cursor:not-allowed" readonly></td></tr>';
                            $('#target').html(html);
                            //
                            let $inputs = $('.score');
                            $inputs.keyup(function() {
                                let totalScore = 0;
                                $inputs.each(function(){
                                    totalScore += parseInt($(this).val());
                                });
                                $("input[name='totalScore']").val(totalScore);
                            });
                            //
                            let layIndex = layer.open({
                                id: guid() //设定一个id，防止重复弹出
                                ,title : '教学评价-课程质量评价'
                                ,type : 1
                                ,area : [ '1100px', '500px' ]
                                ,offset : '30px' //只定义top坐标，水平保持居中
                                ,shadeClose : true //点击遮罩关闭
                                ,btn : ['教学研究','教学设计','教学效果','关闭']
                                ,yes: function(index, layero){
                                    initTeacherBar('教学研究',rowData);
                                    return false;
                                }
                                ,btn2: function(index, layero){
                                    initTeacherBar('教学设计',rowData);
                                    return false;
                                }
                                ,btn3: function(index, layero){
                                    initTeacherBar('教学效果',rowData);
                                    return false;
                                }
                                ,skin: 'demo-class'
                                ,content : $('#editForm_container')
                                ,success: function(layero, index){
                                    /**
                                     * 验证表单数据
                                     */
                                    form.verify({
                                        score: function(value,item){ //value：表单的值、item：表单的DOM对象
                                            if(parseInt($(item).attr('score')) < value || value < 0){ //如果输入值大于预设分值或者小于0，给出提示
                                                return '超出预设分值范围';
                                            }
                                        },
                                        totalScore: function(value,item){ //value：表单的值、item：表单的DOM对象
                                            if(100 < value || value < 0){ //如果输入值大于预设分值或者小于0，给出提示
                                                return '超出预设分值范围';
                                            }
                                        }
                                    });

                                    //
                                    form.val("editForm",{
                                        'code': new Date().getTime(),
                                        'teacherCode': rowData.teacherCode,
                                        'teacher': rowData.teacher,
                                        'teacherCollege': rowData.teacherCollege,
                                        'courseCode': rowData.courseCode,
                                        'courseName': rowData.courseName,
                                        'courseType': rowData.courseType,
                                        'userId': $.cookie('userId'),
                                        'userName':$.cookie('userName')
                                    });

                                    //监听表单提交
                                    form.on('submit(toSubmitEidtForm)', function(data){
                                        /*layer.alert(JSON.stringify(data.field), {
                                            title: '最终的提交信息'
                                        });
                                        return false;*/
                                        var formData = data.field;
                                        formData.templateCode = templateCode;
                                        formData.jsonStr = JSON.stringify(formData);
                                        $.post(requestUrl+'/jxpj_thpj/insert.do' ,formData ,function(result_data){
                                            layer.msg(result_data.msg, { offset: '100px'}, function () {
                                                if(result_data.code == 200){
                                                    datatable.reload();//重新加载表格数据
                                                }
                                                layer.close(layIndex);
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
                        } else {
                            layer.msg(result_data.msg, {time : 3000, offset: '100px'});
                            return;
                        }
                    },'json');
                }
            });
        }
    });

    //
    var initTeacherBar = function (title,rowData) {
        let layIdx = layer.open({
            title : title
            ,type : 1
            ,shadeClose : true
            ,area : [ '1100px']
            ,offset : '30px'
            // ,btn:['关闭']
            ,content : $('#teacherInfo_container')
            ,success: function () {
                //柱状图
                var xAxisData = new Array()
                    ,seriesData = new Array();
                $.get(requestUrl+'/jxpj_thpj/getTeacherBar.do',{
                    'menuName':title,
                    'userId':rowData.teacherCode
                }, function (data) {
                    if(data.code == 200){
                        $.each(data.data,function (idx,obj) {
                            xAxisData.push(obj.TAB_COMMENT);
                            seriesData.push(obj.NUM);
                        });
                        // 指定图表的配置项和数据
                        var option = {
                            title: {
                                text: title,
                                left: 'center'
                            },
                            tooltip: {},
                            grid: {
                                // left: '10%',
                                bottom:'35%'
                            },
                            legend: {
                                left: 'left',
                                data:['发布数量']
                            },
                            xAxis: {
                                axisLabel: {
                                    interval:0, //坐标轴刻度标签的显示间隔，默认会采用标签不重叠的方式显示标签（也就是默认会将部分文字显示不全）可以设置为0强制显示所有标签，如果设置为1，表示隔一个标签显示一个标签，如果为3，表示隔3个标签显示一个标签，以此类推
                                    rotate:40, //调整数值改变倾斜的幅度（范围-90到90）
                                },
                                data: xAxisData
                            },
                            yAxis: {},
                            series: [{
                                name: '发布数量',
                                type: 'bar',
                                data: seriesData
                            }]
                        };
                        var myChart = echarts.init(document.getElementById('teacherBar'));
                        myChart.setOption(option);
                        myChart.on('click', function (params) {
                            initTeacherPie(params.name);
                            initDatatable(params.name);
                        });
                        var menuName = '继续教育';
                        if(title == '教学设计'){
                            // menuName = '授课计划';
                            menuName = '课程实施计划';
                        }
                        if(title == '教学效果'){
                            menuName = '试卷分析';
                        }
                        initTeacherPie(menuName);
                        initDatatable(menuName);
                    }
                },'json');

                //饼图
                var initTeacherPie = function (menuName) {
                    var legendDate = new Array();
                    $.get(requestUrl+'/jxpj_thpj/getTeacherPie.do',{
                        'menuName':menuName,
                        'userId':rowData.teacherCode
                    },function (data) {
                        if(data.code == 200){
                            $.each(data.data,function (idx,obj) {
                                legendDate.push(obj.name);
                            });
                            var option2 = {
                                title: {
                                    text: menuName,
                                    left: 'center'
                                },
                                tooltip: {
                                    trigger: 'item',
                                    formatter: '{a} <br/>{b} : {c} ({d}%)'
                                },
                                grid: {
                                    left: '10%',
                                    bottom:'35%'
                                },
                                legend: {
                                    orient: 'vertical',
                                    left: 'left',
                                    data: legendDate
                                },
                                series: [
                                    {
                                        name: '审核状态',
                                        type: 'pie',
                                        radius: '55%',
                                        center: ['50%', '60%'],
                                        data: data.data,
                                        emphasis: {
                                            itemStyle: {
                                                shadowBlur: 10,
                                                shadowOffsetX: 0,
                                                shadowColor: 'rgba(0, 0, 0, 0.5)'
                                            }
                                        }
                                    }
                                ]
                            };
                            var myChart2 = echarts.init(document.getElementById('teacherPie'));
                            myChart2.setOption(option2);
                            myChart2.on('click', function (params) {
                                initDatatable(menuName,params.name);
                            });
                        }
                    },'json');
                };//teacherPie end.

                //数据表
                var initDatatable = function (menuName,status) {
                    $.get(requestUrl+'/jxpj_thpj/getTeacherTab.do',{
                        'menuName':menuName,
                        'userId':rowData.teacherCode
                    },function (data) {
                        var colArr = new Array({type:'numbers', title:'序号', width:80, fixed: 'left'});
                        if(data.code == 200){
                            $.each(data.data,function (idx,obj) {
                                colArr.push({field: obj.COLUMN_NAME, title: obj.COMMENTS, width:120});
                            });

                            // alert(JSON.stringify(colArr));
                            //
                            var teacherInfo_datatable = table.render({
                                id: guid()
                                ,elem : '#teacherInfo_datatable'
                                ,width: 900
                                ,height : 500
                                ,url: requestUrl+'/jxpj_thpj/getTeacherTabData.do'
                                ,where: {
                                    'menuName':menuName,
                                    'userId':rowData.teacherCode,
                                    'status':status
                                }
                                ,response: {
                                    statusCode: 200 //规定成功的状态码，默认：0
                                }
                                ,parseData: function(res){ //res 即为原始返回的数据
                                    return {
                                        "code": res.code, //解析接口状态
                                        "msg": res.code, //解析提示文本
                                        "data": res.data //解析数据列表
                                    };
                                }
                                ,cols : [colArr]
                                ,done : function(res, curr, count) {

                                }
                            });
                        };
                    },'json');
                }; //datatable end.
            }
        });
        layer.full(layIdx); //默认以最大化方式打开
    }
});
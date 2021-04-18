/*
教学评价-同行评教
 */
layui.use(['layer','element','table','form','laydate'], function(){
    var $ = layui.$,layer = layui.layer,element = layui.element,table = layui.table,form = layui.form,laydate = layui.laydate;

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

    //初始化学院下拉选项
    $.get(requestUrl+'/common/getXyList.do',{},function(data){
        if(data.code == 200){
            let teacherCollegeList =  data.data;
            if(teacherCollegeList.length > 0){
                reloadSelect('teacherCollege',teacherCollegeList);
            }
        }
    },'json');

    //初始化专业下拉选项
    var teacherMajorList;
    $.get(requestUrl+'/common/getZyList.do',{},function(data){
        if(data.code == 200){
            teacherMajorList =  data.data;
            if(teacherMajorList.length > 0){
                reloadSelect('teacherMajor',teacherMajorList);
            }
        }
    },'json');

    // 监听学院选项
    form.on('select(teacherCollege)', function(data) {
        let xyCode = data.value;
        if(xyCode == ''){
            reloadSelect('teacherMajor',teacherMajorList);
        }else{
            $.get(requestUrl+'/common/getZyList.do',{"xyCode":xyCode},function(data){
                if(data.code == 200){
                    reloadSelect('teacherMajor',data.data);
                }
            },'json');
        }
    });

    //初始化数据表格
    var datatable = table.render({
        id: guid()
        ,elem : '#datatable'
        ,height : 500
        ,url: requestUrl+'/jxpj_thpj/getPageList.do'
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
        ,cols : [[ //表头
            {type:'checkbox', fixed: 'left'}
            ,{type:'numbers', title:'序号', width:80, fixed: 'left'}

            ,{field:'courseName', title:'课程名称', width:180, sort:true, event: 'courseName', templet: function (data) {
                    let html = '';
                    if(data.isPj == 2){
                        html = '<a class="layui-btn layui-btn-disabled layui-btn-xs"><i class="layui-icon layui-icon-read"></i>查看</a>' +
                            '<a class="layui-btn layui-btn-disabled layui-btn-xs"><i class="layui-icon layui-icon-edit"></i>编辑</a>' +
                            '<a class="layui-btn layui-btn-disabled layui-btn-xs"><i class="layui-icon layui-icon-ok"></i>提交</a>';
                        $('#datatable_bar').html(html);
                        return '<span style="font-weight: bold; color: #1E9FFF; cursor: pointer;">'+data.courseName+'</span>';
                    } else {
                        html = '<a class="layui-btn layui-btn-normal layui-btn-xs" lay-event="detail"><i class="layui-icon layui-icon-read"></i>查看</a>' +
                            '<a class="layui-btn layui-btn-warm layui-btn-xs" lay-event="update"><i class="layui-icon layui-icon-edit"></i>编辑</a>';
                        if(data.isSubmit == 1){
                            html += '<a class="layui-btn layui-btn-disabled layui-btn-xs"><i class="layui-icon layui-icon-ok"></i>提交</a>';
                        } else {
                            html += '<a class="layui-btn layui-btn-primary layui-btn-xs" lay-event="submit"><i class="layui-icon layui-icon-ok"></i>提交</a>';
                        }
                        $('#datatable_bar').html(html);
                        return data.courseName;
                    }
                }}
            ,{field:'courseAttr', title:'课程性质', width:150, sort:true}
            ,{field:'teacher', title:'教师姓名', width:150, sort:true}
            ,{field:'teacherTitle', title:'教师职称', width:150, sort:true}
            ,{field:'teachDate', title:'上课时间', width:150, sort:true}
            ,{field:'teachAddr', title:'上课地点', width:150, sort:true}
            ,{field:'teacherCollege', title:'教师所在学院', width:150, sort:true}
            ,{field:'teacherMajor', title:'教师所在专业', width:150, sort:true}
            ,{fixed: 'right', title:'操作', width:210, align:'center', toolbar: '#datatable_bar'}
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

        }
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
                    'teacherCollege': $("#teacherCollege option:selected").val(),
                    'teacherMajor': $("#teacherMajor option:selected").val(),
                    'teacher': $(".search input[ name='teacher']").val(),
                    'teacherAge': $("#teacherAge option:selected").val(),
                    'teacherTitle': $("#teacherTitle option:selected").val(),
                    'courseName': $(".search input[ name='courseName']").val(),
                    'courseAttr': $("#courseAttr option:selected").val(),
                    'teachDate': $(".search input[ name='teachDate']").val(),
                    'teachAddr': $(".search input[ name='teachAddr']").val()
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
            $("#courseAttr").val("");
            form.render("select");
        }
    };

    //监听工具条
    table.on('tool(datatable)', function(obj){
        let rowData = obj.data;
        if (obj.event === 'detail') {
            $.get(requestUrl+'/jxpj_thpj/detail.do',{"code":rowData.pjCode}, function (result_data) {
                if(result_data.code == 200){
                    let data = result_data.data;
                    var thpjItemList = data.thpjItemList;
                    ////////////////////////////////////////////////////////////////////////////////////////////
                    $.get(requestUrl+'/jxpj_thpj/getThpjTargetList.do',{'code':rowData.pjCode},function (result_data) {
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
                    layer.open({
                        id: guid() //设定一个id，防止重复弹出
                        ,title : '教学评价-课程质量评价'
                        ,type : 1
                        ,area : [ '1100px', '500px' ]
                        ,offset : '30px' //只定义top坐标，水平保持居中
                        ,shadeClose : true //点击遮罩关闭
                        ,btn : ['关闭']
                        /*,btn : ['教学设计','教学效果','关闭']
                        ,yes: function(index, layero){
                            initRelationDatatable('教学设计',rowData);
                            return false;
                        }
                        ,btn2: function(index, layero){
                            initRelationDatatable('教学效果',rowData);
                            return false;
                        }
                        ,skin: 'demo-class'*/
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

        } else if (obj.event === 'update') {

            $.get(requestUrl+'/jxpj_thpj/detail.do',{"code":rowData.pjCode}, function (result_data) {
                if(result_data.code == 200){
                    let data = result_data.data;
                    var thpjItemList = data.thpjItemList;
                    ////////////////////////////////////////////////////////////////////////////////////////////
                    $.get(requestUrl+'/jxpj_thpj/getThpjTargetList.do',{'code':rowData.pjCode},function (result_data) {
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
                        //
                        let $inputs = $('.score');
                        $inputs.keyup(function() {
                            let totalScore = 0;
                            $inputs.each(function(){
                                let value = parseInt($(this).val());
                                if(value.toString() != "NaN"){
                                    totalScore += value;
                                }
                            });
                            $("input[name='totalScore']").val(totalScore);
                        });
                    },'json');
                    ////////////////////////////////////////////////////////////////////////////////////////////
                    layer.open({
                        id: guid() //设定一个id，防止重复弹出
                        ,title : '教学评价-课程质量评价'
                        ,type : 1
                        ,area : [ '1100px', '500px' ]
                        ,offset : '30px' //只定义top坐标，水平保持居中
                        ,shadeClose : true //点击遮罩关闭
                        ,btn : ['关闭']
                        /*,btn : ['教学设计','教学效果','关闭']
                        ,yes: function(index, layero){
                            initRelationDatatable('教学设计',rowData);
                            return false;
                        }
                        ,btn2: function(index, layero){
                            initRelationDatatable('教学效果',rowData);
                            return false;
                        }
                        ,skin: 'demo-class'*/
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
                            form.val("editForm",data);
                            //
                            //监听表单提交
                            form.on('submit(toSubmitEidtForm)', function(data){

                                //执行提交操作
                                var formData = data.field;
                                formData.jsonString = JSON.stringify(formData);
                                $.post(requestUrl+'/jxpj_thpj/update.do' ,formData ,function(result_data){
                                    layer.msg(result_data.msg, { offset: '100px'}, function () {
                                        if(result_data.code == 200){
                                            datatable.reload();//重新加载表格数据
                                        }
                                        layer.close(index);
                                    });
                                },'json');

                            });
                        }
                        ,end:function () {
                            $('#editForm')[0].reset(); //清空表单数据
                            form.render();
                        }
                    });
                }
            },'json');

        } else if (obj.event === 'submit') {
            //只有本次评分在90分及以上才进行优秀率校验
            if(rowData.isTop == 1){
                $.get(requestUrl+'/jxpj_thpj/isTopFull.do' , {'userId': $.cookie('userId')}, function(result_data){
                    if(result_data.code == 200 && result_data.data == 1){ //优秀名额已满
                        layer.msg('优秀率超过30%，需对本学期被评课程进行调整', {offset: '100px'});
                        return false;
                    } else {
                        //执行提交操作
                        $.get(requestUrl+'/jxpj_thpj/submit.do' , {'code': rowData.pjCode}, function(result_data){
                            layer.msg(result_data.msg, { offset: '100px'}, function () {
                                if(result_data.code == 200){
                                    datatable.reload();//重新加载表格数据
                                }
                            });
                        });
                    }
                });
            } else {
                //执行提交操作
                $.get(requestUrl+'/jxpj_thpj/submit.do' , {'code': rowData.pjCode}, function(result_data){
                    layer.msg(result_data.msg, { offset: '100px'}, function () {
                        if(result_data.code == 200){
                            datatable.reload();//重新加载表格数据
                        }
                    });
                });
            }

        } else if (obj.event === 'courseName') {
            if(rowData.isPj == 1){
                return false;
            }
            //
            $.get(requestUrl+'/jxpj_thpj/getThpjTargetList.do',function (result_data) {
                if(result_data.code == 200){
                    let data = result_data.data;
                    let templateCode = '';
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
                            let value = parseInt($(this).val());
                            if(value.toString() != "NaN"){
                                totalScore += value;
                            }
                        });
                        $("input[name='totalScore']").val(totalScore);
                    });

                    ///////////////////////////////////////////////////////////////////////////////////////////////

                    layer.open({
                        id: guid() //设定一个id，防止重复弹出
                        ,title : '教学评价-课程质量评价'
                        ,type : 1
                        ,area : [ '1100px', '500px' ]
                        ,offset : '50px' //只定义top坐标，水平保持居中
                        ,shadeClose : true //点击遮罩关闭
                        ,btn : ['关闭']
                        /*,btn : ['教学设计','教学效果','关闭']
                        ,yes: function(index, layero){
                            initRelationDatatable('教学设计',rowData);
                            return false;
                        }
                        ,btn2: function(index, layero){
                            initRelationDatatable('教学效果',rowData);
                            return false;
                        }
                        ,skin: 'demo-class'*/
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
                                'courseAttr': rowData.courseAttr,
                                'userId': $.cookie('userId'),
                                'userName':$.cookie('userName'),
                                'userUnit':$.cookie('userUnit')
                            });

                            //监听表单提交
                            form.on('submit(toSubmitEidtForm)', function(data){
                                //执行提交操作
                                var formData = data.field;
                                formData.templateCode = templateCode;
                                formData.jsonString = JSON.stringify(formData);
                                $.post(requestUrl+'/jxpj_thpj/insert.do' ,formData ,function(result_data){
                                    layer.msg(result_data.msg, { offset: '100px'}, function () {
                                        if(result_data.code == 200){
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
                } else {
                    layer.msg(result_data.msg, {time : 3000, offset: '100px'});
                    return;
                }
            },'json');
        }
    });
    
    var initRelationDatatable = function (menuName,rowData) {
        $.get(requestUrl+'/common/getTableCols.do',{
            'tableName':'JXSJ_KCJXDG'
        },function (result_data) {
            //
            if(result_data.code == 200){
                //
                let cols = new Array({type:'numbers', title:'序号', width:80, fixed: 'left'});
                $.each(result_data.data,function (idx,obj) {
                    let col = {field: obj.COLUMN_NAME, title: obj.COMMENTS, width:150, align:'center'};
                    if(obj.COLUMN_NAME == 'CREATE_DATE'){
                        col = {field:'CREATE_DATE', title:'录入时间', width:180, align:'center', sort:true, templet: function (data) {
                                return new Date(+new Date(new Date(data.CREATE_DATE).toJSON()) + 8 * 3600 * 1000).toISOString().replace(/T/g, ' ').replace(/\.[\d]{3}Z/, '');
                            }
                        }
                    }
                    cols.push(col);
                });
                //
                var layIdx = layer.open({
                    title : ''
                    ,type : 1
                    ,shadeClose : true
                    ,area : [ '1300px', '580px' ]
                    ,offset : '50px'
                    // ,btn:['关闭']
                    ,content : $('#relation_container')
                    ,success: function () {
                        table.render({
                            id: guid()
                            ,elem : '#relation_datatable'
                            ,height : 500
                            ,url: requestUrl+'/common/getTableDatas.do'
                            ,where: {
                                'viewName':'v_JXSJ_KCJXDG',
                                'userId':rowData.teacherCode
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
                            ,cols : [cols]
                            ,done : function(res, curr, count) {
                                //监听行双击事件
                                table.on('rowDouble(relation_datatable)', function(obj){
                                    layer.msg(JSON.stringify(obj.data));
                                });
                            }
                        });
                    }
                }); //layer.full(layIdx); //默认以最大化方式打开

            };
        },'json');
    };
});
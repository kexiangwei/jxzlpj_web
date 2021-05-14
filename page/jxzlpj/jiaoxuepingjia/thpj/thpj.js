/*
教学评价-同行评教
 */
layui.use(['layer','element','table','form','laydate','util'], function(){
    var $ = layui.$,layer = layui.layer,element = layui.element,table = layui.table,form = layui.form,laydate = layui.laydate,util = layui.util;

    // 加载菜单选项
    var reloadSelect = function(inputName,data,isOpenSearch){
        $("select[name='"+inputName+"']").empty(); //移除下拉框所有选项option
        let htmlstr = '<option value="">'+(isOpenSearch?'请选择或搜索':'请选择')+'</option>';
        for (var i = 0; i < data.length; i++) {
            htmlstr += '<option value="' + data[i].code + '" >' + data[i].name + '</option>';
        }
        $("select[name='"+inputName+"']").append(htmlstr);
        form.render('select');
    };

    //初始化学院下拉选项
    $.get(requestUrl+'/getXyList.do',{
        'dataType': 'kc'
    },function(result_data){
        if(result_data.code == 200){
            var xyList =  result_data.data;
            if(xyList.length > 0){
                reloadSelect('courseXy',xyList,true);
            }
        }
    },'json');
    // 监听学院选项
    form.on('select(courseXy)', function(selected_data) {
        var xyCode = selected_data.value;
        if(xyCode != ''){
            $.get(requestUrl+'/getZyList.do',{
                'xyCode': xyCode
            },function(result_data){
                if(result_data.code == 200){
                    var zyList =  result_data.data;
                    if(zyList.length > 0){
                        reloadSelect('courseZy',zyList);
                    }
                }
            },'json');
        }
    });

    //初始化学院下拉选项
    $.get(requestUrl+'/getXyList.do',{
        'dataType': 'js'
    },function(result_data){
        if(result_data.code == 200){
            var xyList =  result_data.data;
            if(xyList.length > 0){
                reloadSelect('skjsXy',xyList,true);
            }
        }
    },'json');
    // 监听学院选项
    form.on('select(skjsXy)', function(selected_data) {
        var xyCode = selected_data.value;
        if(xyCode != ''){
            $.get(requestUrl+'/getZyList.do',{
                'xyCode': xyCode
            },function(result_data){
                if(result_data.code == 200){
                    var zyList =  result_data.data;
                    if(zyList.length > 0){
                        reloadSelect('skjsZy',zyList);
                    }
                }
            },'json');
        }
    });

    //初始化数据表格
    var datatable = table.render({
        id: guid()
        ,elem : '#datatable'
        ,height : 450
        ,url: requestUrl+'/thpj/getPageList.do'
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
                        html = '<a class="layui-btn layui-btn-xs layui-btn-radius layui-btn-table layui-btn-disabled"><i class="layui-icon layui-icon-read"></i>查看</a>' +
                            '<a class="layui-btn layui-btn-xs layui-btn-radius layui-btn-table layui-btn-disabled"><i class="layui-icon layui-icon-edit"></i>编辑</a>' +
                            '<a class="layui-btn layui-btn-xs layui-btn-radius layui-btn-table layui-btn-disabled"><i class="layui-icon layui-icon-ok"></i>提交</a>';
                        $('#datatable_toolbar').html(html);
                        return '<span style="font-weight: bold; color: #1E9FFF; cursor: pointer;">'+data.courseName+'</span>';
                    } else {
                        html = '<a class="layui-btn layui-btn-xs layui-btn-radius layui-btn-table layui-btn-normal" lay-event="detail"><i class="layui-icon layui-icon-read"></i>查看</a>' +
                            '<a class="layui-btn layui-btn-xs layui-btn-radius layui-btn-table layui-btn-warm" lay-event="update"><i class="layui-icon layui-icon-edit"></i>编辑</a>';
                        if(data.isSubmit == 1){
                            html += '<a class="layui-btn layui-btn-xs layui-btn-radius layui-btn-table layui-btn-disabled"><i class="layui-icon layui-icon-ok"></i>提交</a>';
                        } else {
                            html += '<a class="layui-btn layui-btn-xs layui-btn-radius layui-btn-table layui-btn-primary" lay-event="submit"><i class="layui-icon layui-icon-ok"></i>提交</a>';
                        }
                        $('#datatable_toolbar').html(html);
                        return data.courseName;
                    }
             }}
            ,{field:'courseAttr', title:'课程性质', width:150, sort:true}
            ,{field:'skjsName', title:'任课教师', width:150, sort:true}
            ,{field:'skjsXy', title:'教师所在单位', width:180, sort:true}
            ,{field:'skjsZy', title:'教师所在专业', width:180, sort:true}
            ,{field:'skSj', title:'上课时间', width:200, sort:true}
            ,{field:'skDd', title:'上课地点', width:200, sort:true}
            ,{field:'skBj', title:'学生班级', width:150, sort:true}
            ,{fixed: 'right', width:290, align:'center', toolbar: '#datatable_toolbar'}
        ]]
        ,even: true //隔行背景
        ,limit: 10
        ,page: { //支持传入 laypage 组件的所有参数（某些参数除外，如：jump/elem） - 详见文档
            layout: ['count', 'prev', 'page', 'next', 'limit', 'refresh', 'skip']//自定义分页布局
            ,limits: [10,20,50,100]
            ,first: '首页' //不显示首页
            ,last: '尾页' //不显示尾页
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
                    'courseXy': $("#courseXy option:selected").val(),
                    'courseZy': $("#courseZy option:selected").val(),
                    'courseName': $(".search input[ name='courseName']").val(),
                    'courseAttr': $("#courseAttr option:selected").val(),
                    'skjsXy': $("#skjsXy option:selected").val(),
                    'skjsZy': $("#skjsZy option:selected").val(),
                    'skjsName': $(".search input[ name='skjsName']").val(),
                    'age': $("#age option:selected").val(),
                    'title': $("#title option:selected").val(),
                    'skSj': $(".search input[ name='skSj']").val(),
                    'skDd': $(".search input[ name='skDd']").val()
                }
                ,page: {
                    curr: 1 //重新从第 1 页开始
                }
            });
        }
        ,reset: function () {
            $(".search input").val('');
            //清除选中状态
            $("#courseXy").val("");
            $("#courseZy").val("");
            $("#courseAttr").val("");
            $("#skjsXy").val("");
            $("#skjsZy").val("");
            $("#age").val("");
            $("#title").val("");
            form.render("select");
        }
    };

    //监听工具条
    table.on('tool(datatable)', function(obj){
        let rowData = obj.data;
        if (obj.event === 'detail') {
            if(rowData.isPj == 2){ //1是2否（即未评价，查看按钮不可点击）
                return;
            }
            $.get(requestUrl+'/thpj/detail.do',{"code":rowData.pjCode}, function (result_data) {
                if(result_data.code == 200){
                    let data = result_data.data;
                    var thpjItemList = data.thpjItemList;
                    ////////////////////////////////////////////////////////////////////////////////////////////
                    $.get(requestUrl+'/thpj/getThpjTargetList.do',{'code':rowData.pjCode},function (result_data) {
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

        } else if (obj.event === 'courseName') {
            if(rowData.isPj == 1){
                return false;
            }
            //
            $.get(requestUrl+'/thpj/getThpjTargetList.do',function (result_data) {
                if(result_data.code == 200){
                    let data = result_data.data;
                    let templateCode = '';
                    let html = '';
                    for (let i = 0; i < data.length; i++) {
                        html += '<tr><td rowspan="'+data[i].num+'">'+data[i].name+'（'+data[i].score+'分）</td>\n';
                        for (let j = 0; j < data[i].num; j++) {
                            let obj = data[i].targetList[j];
                            templateCode = obj.templateCode;
                            html += '<td>\n'/* +parseInt(j+1)+'．'*/+obj.targetContent+'</td>\n' +
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
                                        return '超出预设分值范围！';
                                    }
                                },
                                totalScore: function(value,item){ //value：表单的值、item：表单的DOM对象
                                    if(100 < value || value < 0){ //如果输入值大于预设分值或者小于0，给出提示
                                        return '超出预设分值范围！';
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
                                var formData = data.field;
                                formData.templateCode = templateCode;
                                formData.jsonString = JSON.stringify(formData);
                                $.post(requestUrl+'/thpj/insert.do' ,formData ,function(result_data){
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
                });
            };
        },'json');
    };

});
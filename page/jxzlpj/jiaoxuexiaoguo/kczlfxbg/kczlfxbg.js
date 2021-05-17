/*
教学效果-课程质量分析报告
 */
layui.use(['layer','table','form'], function(){
    var $ = layui.$,layer = layui.layer,table = layui.table,form = layui.form;

    //初始化数据表格
    var datatable = table.render({
        id : guid()
        ,elem : '#datatable'
        ,height : 500
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
            ,{field: 'courseName', title: '课程名称', width:180, sort:true, event: 'insert', templet: function (data) {
                    let html = '';
                    if(data.isTxbg == 2){
                        html = '<a class="layui-btn layui-btn-xs layui-btn-radius layui-btn-table layui-btn-disabled"><i class="layui-icon layui-icon-read"></i>查看</a>' +
                            '<a class="layui-btn layui-btn-xs layui-btn-radius layui-btn-table layui-btn-disabled"><i class="layui-icon layui-icon-edit"></i>编辑</a>' +
                            '<a class="layui-btn layui-btn-xs layui-btn-radius layui-btn-table layui-btn-disabled"><i class="layui-icon layui-icon-ok"></i>提交</a>';
                        $('#datatable_toolbar').html(html);
                        return '<span style="font-weight: bold; color: #1E9FFF; cursor: pointer;">'+data.courseName+'</span>';
                    } else {
                        html = '<a class="layui-btn layui-btn-xs layui-btn-radius layui-btn-table layui-btn-normal" lay-event="detail"><i class="layui-icon layui-icon-read"></i>查看</a>';
                        if(data.isSubmit == 1){
                            html += '<a class="layui-btn layui-btn-xs layui-btn-radius layui-btn-table layui-btn-disabled"><i class="layui-icon layui-icon-edit"></i>编辑</a>'+
                                '<a class="layui-btn layui-btn-xs layui-btn-radius layui-btn-table layui-btn-disabled"><i class="layui-icon layui-icon-ok"></i>提交</a>';
                        } else {
                            html += '<a class="layui-btn layui-btn-xs layui-btn-radius layui-btn-table layui-btn-warm" lay-event="update"><i class="layui-icon layui-icon-edit"></i>编辑</a>'+
                                '<a class="layui-btn layui-btn-xs layui-btn-radius layui-btn-table layui-btn-primary" lay-event="submit"><i class="layui-icon layui-icon-ok"></i>提交</a>';
                        }
                        $('#datatable_toolbar').html(html);
                        return data.courseName;
                    }
                }
            }
            ,{field: 'courseAttr', title: '课程性质', width:150, sort:true}
            ,{field: 'xyName', title: '开课学院（部）', width:150, sort:true}
            ,{field: 'zyName', title: '系（教研室）', width:150, sort:true}
            ,{field: 'xn', title:'学年', width:150, sort:true}
            ,{field: 'xq', title:'学期', width:150, sort:true}
            ,{field: 'skjsAll', title:'授课教师', width:150, sort:true}
            ,{field: 'skbjAll', title:'授课班级', width:150, sort:true}
            ,{fixed: 'right', width:290, align:'center', toolbar: '#datatable_toolbar'}
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
    $('.search .layui-btn').on('click', function(){
        let type = $(this).data('type');
        active[type] ? active[type].call(this) : '';
    });
    let active = {
        search: function(){
            datatable.reload({
                where: {
                    'courseName': $(".search input[name='courseName']").val(),
                    'isTxbg': $("#isTxbg option:selected").val(),
                    'isSubmit': $("#isSubmit option:selected").val()
                }
                ,page: {
                    curr: 1 //重新从第 1 页开始
                }
            });
        }
        ,reset: function () {
            $(".search input").val('');
            $("#isTxbg").val(""); //清除选中状态
            $("#isSubmit").val(""); //清除选中状态
            form.render("select");
        }
    };

    //监听工具条
    table.on('tool(datatable)', function(obj){
        let row_data = obj.data;
        if (obj.event === 'insert') {
            //
            if(row_data.isTxbg == 1){
                return false;
            } else {
                //
                $('#a1').html( '<tr><td>1</td>\n' +
                    '<td><textarea name="a1_1_1" lay-verify="required" class="layui-textarea"></textarea></td>\n' +
                    '<td><textarea name="a1_1_2" lay-verify="required" class="layui-textarea"></textarea></td>\n' +
                    '<td><textarea name="a1_1_3" lay-verify="required" class="layui-textarea"></textarea></td>' +
                    '<td><i class="layui-icon layui-icon-delete"></i></td></tr>');
                //
                $('#a2').html('<tr><td>1</td>\n' +
                    '\t<td><textarea name="a2_1_1" lay-verify="required" class="layui-textarea"></textarea></td>\n' +
                    '\t<td><textarea name="a2_1_2" lay-verify="required" class="layui-textarea"></textarea></td>\n' +
                    '\t<td><textarea name="a2_1_3" lay-verify="required" class="layui-textarea"></textarea></td>\n' +
                    '\t<td><textarea name="a2_1_4_1" lay-verify="required" class="layui-textarea"></textarea></td>\n' +
                    '\t<td><textarea name="a2_1_4_2" lay-verify="required" class="layui-textarea"></textarea></td>\n' +
                    '\t<td><textarea name="a2_1_4_3" lay-verify="required" class="layui-textarea"></textarea></td>\n' +
                    '\t<td><textarea name="a2_1_4_4" lay-verify="required" class="layui-textarea"></textarea></td>\n' +
                    '\t<td><textarea name="a2_1_4_5" lay-verify="required" class="layui-textarea"></textarea></td>\n' +
                    '\t<td><textarea name="a2_1_5" lay-verify="required" class="layui-textarea"></textarea></td>\n' +
                    '<td><i class="layui-icon layui-icon-delete"></i></td></tr>');
                //
                $(".layui-icon-delete").parent().on("click", function () {
                    $(this).parent().remove()
                });
            }
            //
            layer.open({
                id : guid()
                ,title : '课程质量分析报告'
                ,type : 1
                ,area : [ '1100px', '500px' ]
                ,offset : '50px'
                ,maxmin: true
                ,content : $('#editFormContainer')
                ,success: function(layero, index){

                    //初始化表单数据
                    $('#subTitle').html(row_data.courseName+'（'+row_data.courseCode+'）课程质量分析报告');
                    form.val("editForm",{
                        "courseCode": row_data.courseCode
                        ,"courseName" : row_data.courseName
                        ,"courseAttr" : row_data.courseAttr
                        ,"xyName" : row_data.xyName
                        ,"zyName" : row_data.zyName
                        ,"xn" : row_data.xn
                        ,"xq" : row_data.xq
                        ,"skjsAll" : row_data.skjsAll
                        ,"skbjAll" : row_data.skbjAll
                        ,'userId': $.cookie('userId')
                        ,'userName': $.cookie('userName')
                    });

                    /**
                     * 验证表单数据
                     */
                    form.verify({
                        score: function(value,item){ //value：表单的值、item：表单的DOM对象
                            let defaultScore = $(item).parent().prev().text();
                            if(parseInt(defaultScore) < value || value < 0){ //如果输入值大于预设分值或者小于0，给出提示
                                return '超出预设分值范围！';
                            }
                        },
                        totalScore: function(value,item){ //value：表单的值、item：表单的DOM对象
                            if(100 < value || value < 0){ //如果输入值大于预设分值或者小于0，给出提示
                                return '超出预设分值范围！';
                            }
                        }
                    });

                    //评分合计
                    let $inputs = $('.score');
                    $inputs.keyup(function() {
                        let totalScore = 0;
                        $inputs.each(function(){
                            let value = parseInt($(this).val());
                            if(value.toString() != "NaN"){
                                totalScore += value;
                            }
                        });
                        $("input[name='c1']").val(totalScore);
                    });

                    //监听表单提交
                    form.on('submit(toSubmitEidtForm)', function(_form_data){
                        //
                        $.post(requestUrl+'/jxxg_kczlfxbg/insert.do', _form_data.field, function (_result_data) {
                            layer.msg(_result_data.msg, {offset: '100px'},function () {
                                if(_result_data.code == 200){
                                    // datatable.reload();//重新加载表格数据
                                }
                                layer.close(index);
                            });
                        },'json');
                        /*layer.alert(JSON.stringify(_form_data.field));
                        return false;*/
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

        } else if (obj.event === 'detail') {

            //根据编号加载报告信息
            $.get(requestUrl+'/jxxg_kczlfxbg/getKczlfxbg.do',{
                "code":row_data.bgCode
            },function (result_data) {
                if(result_data.code == 200){
                    layer.open({
                        id : guid()
                        ,title : '课程质量分析报告'
                        ,type : 1
                        ,area : [ '1100px', '500px' ]
                        ,offset : '50px'
                        ,btn: ['关闭']
                        ,content : $('#editFormContainer')
                        ,success: function(layero, index){

                            //初始化表单数据
                            var bg = result_data.data.bg;
                            $('#subTitle').html(bg.courseName+'（'+bg.courseCode+'）课程质量分析报告');
                            form.val("editForm",bg);
                            //
                            var bgA1List = result_data.data.bgA1List;
                            if(bgA1List.length > 0){
                                $.each(bgA1List,function (idx,obj) {
                                    var len = parseInt(idx+1);
                                    var html = '<tr><td>'+len+'</td>\n' +
                                        '            <td><textarea name="'+("a1_"+len+"_1")+'" lay-verify="required" class="layui-textarea">'+obj.A1_1+'</textarea></td>\n' +
                                        '            <td><textarea name="'+("a1_"+len+"_2")+'" lay-verify="required" class="layui-textarea">'+obj.A1_2+'</textarea></td>\n' +
                                        '            <td><textarea name="'+("a1_"+len+"_3")+'" lay-verify="required" class="layui-textarea">'+obj.A1_3+'</textarea></td>' +
                                        '       </tr>';
                                    $('#a1').append(html);
                                });
                            } else {
                                $('#a1').append('<tr><td colspan="4">无数据</td></tr>');
                            }

                            var bgA2List = result_data.data.bgA2List;
                            if(bgA2List.length > 0){
                                $.each(bgA2List,function (idx,obj) {
                                    var len = parseInt(idx+1);
                                    var html = '<tr><td>'+len+'</td>\n' +
                                        '<td><textarea name="'+("a2_"+len+"_1")+'" lay-verify="required" class="layui-textarea">'+obj.A2_1+'</textarea></td>\n' +
                                        '<td><textarea name="'+("a2_"+len+"_2")+'" lay-verify="required" class="layui-textarea">'+obj.A2_2+'</textarea></td>\n' +
                                        '<td><textarea name="'+("a2_"+len+"_3")+'" lay-verify="required" class="layui-textarea">'+obj.A2_3+'</textarea></td>\n' +
                                        '<td><textarea name="'+("a2_"+len+"_4_1")+'" lay-verify="required" class="layui-textarea">'+obj.A2_4_1+'</textarea></td>\n' +
                                        '<td><textarea name="'+("a2_"+len+"_4_2")+'" lay-verify="required" class="layui-textarea">'+obj.A2_4_2+'</textarea></td>\n' +
                                        '<td><textarea name="'+("a2_"+len+"_4_3")+'" lay-verify="required" class="layui-textarea">'+obj.A2_4_3+'</textarea></td>\n' +
                                        '<td><textarea name="'+("a2_"+len+"_4_4")+'" lay-verify="required" class="layui-textarea">'+obj.A2_4_4+'</textarea></td>\n' +
                                        '<td><textarea name="'+("a2_"+len+"_4_5")+'" lay-verify="required" class="layui-textarea">'+obj.A2_4_5+'</textarea></td>\n' +
                                        '<td><textarea name="'+("a2_"+len+"_5")+'" lay-verify="required" class="layui-textarea">'+obj.A2_5+'</textarea></td>' +
                                        '</tr>';
                                    $('#a2').append(html);
                                });
                            } else {
                                $('#a2').append('<tr><td colspan="10">无数据</td></tr>');
                            }

                            //
                            $('#a1_btn').css("display","none");
                            $('#a2_btn').css("display","none");
                            $('#editFormContainer .layui-btn-container > button').css("display","none"); //把保存按钮隐藏掉
                            //
                            $('#editForm').append('<div class=form_overlay></div>'); //禁用form表单中的所有表单元素
                        }
                        ,end:function () {
                            window.location.reload(); //隐藏的按钮和添加的遮罩层通过重载页面复原
                        }
                    });
                } else {
                    layer.msg("数据加载失败！", { offset: '100px'});
                }
            },'json');
            
        } else if (obj.event === 'update') {

            //根据编号加载报告信息
            $.get(requestUrl+'/jxxg_kczlfxbg/getKczlfxbg.do',{
                "code": row_data.bgCode
            },function (result_data) {
                if(result_data.code == 200){
                    layer.open({
                        id : guid()
                        ,title : '课程质量分析报告'
                        ,type : 1
                        ,area : [ '1100px', '500px' ]
                        ,offset : '50px'
                        // ,btn: ['关闭']
                        ,content : $('#editFormContainer')
                        ,success: function(layero, index){

                            //所有编辑页面，均增加取消按钮，不保存当前修改的内容。
                            let cancelBtn = $('<button class="layui-btn layui-btn-radius layui-btn-primary" style="width: 100px; font-size: 18px; font-weight: 700;">取消</button>');
                            $("#editForm .layui-btn-container").append(cancelBtn);
                            cancelBtn.click(function (event) {
                                layer.close(index);
                            });

                            //初始化表单数据
                            var bg = result_data.data.bg;
                            $('#subTitle').html(bg.courseName+'（'+bg.courseCode+'）课程质量分析报告');
                            form.val("editForm",bg);
                            //
                            var bgA1List = result_data.data.bgA1List;
                            $.each(bgA1List,function (idx,obj) {
                                var len = parseInt(idx+1);
                                var html = '<tr><td>'+len+'</td>\n' +
                                    '            <td><textarea name="'+("a1_"+len+"_1")+'" lay-verify="required" class="layui-textarea">'+obj.A1_1+'</textarea></td>\n' +
                                    '            <td><textarea name="'+("a1_"+len+"_2")+'" lay-verify="required" class="layui-textarea">'+obj.A1_2+'</textarea></td>\n' +
                                    '            <td><textarea name="'+("a1_"+len+"_3")+'" lay-verify="required" class="layui-textarea">'+obj.A1_3+'</textarea></td>' +
                                    '       <td><i class="layui-icon layui-icon-delete"></i></td></tr>';
                                $('#a1').append(html);
                                //删除行
                                $(".layui-icon-delete").parent().on("click", function () {
                                    $(this).parent().remove()
                                });
                            });
                            var bgA2List = result_data.data.bgA2List;
                            $.each(bgA2List,function (idx,obj) {
                                var len = parseInt(idx+1);
                                var html = '<tr><td>'+len+'</td>\n' +
                                    '<td><textarea name="'+("a2_"+len+"_1")+'" lay-verify="required" class="layui-textarea">'+obj.A2_1+'</textarea></td>\n' +
                                    '<td><textarea name="'+("a2_"+len+"_2")+'" lay-verify="required" class="layui-textarea">'+obj.A2_2+'</textarea></td>\n' +
                                    '<td><textarea name="'+("a2_"+len+"_3")+'" lay-verify="required" class="layui-textarea">'+obj.A2_3+'</textarea></td>\n' +
                                    '<td><textarea name="'+("a2_"+len+"_4_1")+'" lay-verify="required" class="layui-textarea">'+obj.A2_4_1+'</textarea></td>\n' +
                                    '<td><textarea name="'+("a2_"+len+"_4_2")+'" lay-verify="required" class="layui-textarea">'+obj.A2_4_2+'</textarea></td>\n' +
                                    '<td><textarea name="'+("a2_"+len+"_4_3")+'" lay-verify="required" class="layui-textarea">'+obj.A2_4_3+'</textarea></td>\n' +
                                    '<td><textarea name="'+("a2_"+len+"_4_4")+'" lay-verify="required" class="layui-textarea">'+obj.A2_4_4+'</textarea></td>\n' +
                                    '<td><textarea name="'+("a2_"+len+"_4_5")+'" lay-verify="required" class="layui-textarea">'+obj.A2_4_5+'</textarea></td>\n' +
                                    '<td><textarea name="'+("a2_"+len+"_5")+'" lay-verify="required" class="layui-textarea">'+obj.A2_5+'</textarea></td>' +
                                    '<td><i class="layui-icon layui-icon-delete"></i></td></tr>';
                                $('#a2').append(html);
                                //删除行
                                $(".layui-icon-delete").parent().on("click", function () {
                                    $(this).parent().remove()
                                });
                            });

                            /**
                             * 验证表单数据
                             */
                            form.verify({
                                score: function(value,item){ //value：表单的值、item：表单的DOM对象
                                    let defaultScore = $(item).parent().prev().text();
                                    if(parseInt(defaultScore) < value || value < 0){ //如果输入值大于预设分值或者小于0，给出提示
                                        return '超出预设分值范围！';
                                    }
                                },
                                totalScore: function(value,item){ //value：表单的值、item：表单的DOM对象
                                    if(100 < value || value < 0){ //如果输入值大于预设分值或者小于0，给出提示
                                        return '超出预设分值范围！';
                                    }
                                }
                            });

                            //评分合计
                            let $inputs = $('.score');
                            $inputs.keyup(function() {
                                let totalScore = 0;
                                $inputs.each(function(){
                                    let value = parseInt($(this).val());
                                    if(value.toString() != "NaN"){
                                        totalScore += value;
                                    }
                                });
                                $("input[name='c1']").val(totalScore);
                            });

                            //监听表单提交
                            form.on('submit(toSubmitEidtForm)', function(_form_data){
                                //
                                $.post(requestUrl+'/jxxg_kczlfxbg/update.do', _form_data.field, function (_result_data) {
                                    layer.msg(_result_data.msg, {offset: '100px'},function () {
                                        if(_result_data.code == 200){
                                            // datatable.reload();//重新加载表格数据
                                        }
                                        layer.close(index);
                                    });
                                },'json');
                                /*layer.alert(JSON.stringify(_form_data.field));
                                return false;*/
                            });

                        }
                        ,end:function () {
                            window.location.reload();
                        }
                    });
                } else {
                    layer.msg("数据加载失败！", { offset: '100px'});
                }
            },'json');

        } else if (obj.event === 'submit') {

            layer.confirm('提交后不可修改，是否确定提交？', {icon: 3, title:'提示', offset: '100px'}, function(index) {
                //执行提交操作
                $.post(requestUrl+'/jxxg_kczlfxbg/submit.do' , {'code': row_data.bgCode}, function(result_data){
                    layer.msg(result_data.msg, { offset: '100px'}, function () {
                        if(result_data.code == 200){
                            datatable.reload();//重新加载表格数据
                        }
                        layer.closeAll();
                    });
                },'json');
            });

        }
    });

});
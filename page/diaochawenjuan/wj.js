/**
 * 调查问卷-问卷信息
 */
layui.use(['layer','table','form'], function(){
    let $ = layui.$,layer = layui.layer,table = layui.table,form = layui.form;

    //数据表格
    let datatable = table.render({
        id: guid()
        ,elem : '#datatable'
        ,height : 540
        ,url: requestUrl+'/getWjSetPageList.do'
        ,where: {
            'userId':function () {
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
            ,{field: 'wjCode', title: '编号', width:200, sort: true}
            ,{field: 'wjName', title: '名称', width:200, sort: true}
            ,{field: 'wjDesc', title: '备注', templet: function(data){
                var html = '';
                if(data.isTrue == 1){
                    html = '<a class="layui-btn layui-btn-xs layui-btn-table layui-btn-normal " lay-event="wj">已填写</a>';
                } else {
                    html = '<a class="layui-btn layui-btn-xs layui-btn-table layui-btn-warm" lay-event="wj">未填写</a>';
                }
                    $('#toolbar').html(html);
                    return data.wjDesc;
                }
             }
            ,{fixed: 'right', width:120, align:'center', toolbar: '#toolbar'}
        ]]
        ,even: true //隔行背景
        ,limit: 10
        ,page: {
            layout: ['count', 'prev', 'page', 'next', 'limit', 'refresh', 'skip']//自定义分页布局
            ,limits: [10,20,50,100]
        }
        ,done : function(res, curr, count) {

            //监听右侧工具条
            table.on('tool(datatable)', function(obj){
                let rowData = obj.data;
                if (obj.event === 'wj') {
                    //
                    let layIndex = layer.open({
                        title : '调查问卷-问卷信息'
                        ,type : 1
                        ,area : [ '1100px', '500px' ]
                        ,offset : '50px'
                        // ,shadeClose : true //点击遮罩关闭
                        ,btn: ['关闭']
                        ,content : $('#wjContainer')
                        ,success: function(layero, index){
                            $.get(requestUrl+'/getWjSetInfo.do',{
                                'wjCode':rowData.wjCode
                            },function (result_data) {
                                if(result_data.code ==200){
                                    $('#title').html(rowData.wjName);
                                    $('#subTitle').html('&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;'+rowData.wjDesc);
                                    // 封装问卷
                                    let html = '';
                                    $.each(result_data.data,function(idx,obj){
                                        html += ' <div class="layui-form-item" style="margin-top: 20px" lay-verify="target"><h3 style="margin-top: 20px; font-weight: bold">\n' +
                                            'Q'+parseInt(idx+1)+'，'+obj.qcontent;
                                        if(obj.qtype == '单选'){
                                            html += '（单选）</h3><br/>';
                                            $.each(obj.wjSetOptList,function(index,opt){
                                                html += '<input type="radio" name="'+opt.Q_CODE+'" value="'+opt.OPT_CODE+'" title="'+opt.OPT+'">';
                                            });
                                        } else{ //多选
                                            html += '（多选）</h3><br/>';
                                            $.each(obj.wjSetOptList,function(index,opt){
                                                html += '<input type="checkbox" name="'+opt.Q_CODE+'" value="'+opt.OPT_CODE+'" title="'+opt.OPT+'" lay-skin="primary">';
                                            });
                                        }
                                    });

                                    if(rowData.isTrue != 1){
                                        //添加按钮
                                        html += '<div class="layui-btn-container" style="margin-top: 50px" align="center">\n' +
                                            '       <button class="layui-btn layui-btn-normal" lay-submit="" lay-filter="toSubmitEidtForm">提交</button>\n' +
                                            '       <button type="reset" class="layui-btn layui-btn-primary">重置</button>\n' +
                                            '    </div>';
                                    }

                                    //初始化表单
                                    $("#wjForm").html(html);
                                    form.render();

                                    if(rowData.isTrue == 1){
                                        $.get(requestUrl+'/getWjInfo.do',{
                                            'wjCode':rowData.wjCode,
                                            'userId':$.cookie('userId')
                                        },function (result_data) {
                                            if(result_data.code == 200){
                                                let singleCheckbox = {};
                                                $.each(result_data.data,function (idx,obj) {
                                                    if(obj.Q_TYPE == '单选'){
                                                        singleCheckbox[obj.Q_CODE] = obj.Q_OPT;
                                                    } else {
                                                        //根据数据库返回的选项值给复选框设置默认选中
                                                        let opts = obj.Q_OPT.split(",");
                                                        for(let i=0;i<opts.length;i++){
                                                            let multilCheckbox=$("input[name='"+obj.Q_CODE+"']");
                                                            for(let j=0;j<multilCheckbox.length;j++){
                                                                if(multilCheckbox[j].value==opts[i]){
                                                                    multilCheckbox[j].checked=true;
                                                                }
                                                            }
                                                        }
                                                    }
                                                });
                                                //表单赋值
                                                form.val("wjForm",singleCheckbox);
                                            }
                                        },'json');
                                    } else {
                                        //监听表单提交
                                        form.on('submit(toSubmitEidtForm)', function(data){
                                            var qList = [];
                                            $.each(result_data.data,function(idx,obj){
                                                qList.push({
                                                    'qCode': obj.qcode,
                                                    'qType': obj.qtype
                                                });
                                                if(obj.qtype == '多选'){
                                                    $.each(obj.wjSetOptList,function(index,opt){
                                                        //获取checkbox[name='opt.Q_CODE']选中的值
                                                        let arr = [];
                                                        $("input:checkbox[name='"+opt.Q_CODE+"']:checked").each(function(i){
                                                            arr[i] = $(this).val();
                                                        });
                                                        //JS允许在创建完一个对象后，动态给对象添加属性。
                                                        data.field[opt.Q_CODE] = arr.join(",");//将数组合并成字符串
                                                    });
                                                }
                                            });
                                            //
                                            /*layer.alert(JSON.stringify(data.field), {
                                                title: '最终的提交信息'
                                            });
                                            return false;*/
                                            $.post(requestUrl+'/addWjInfo.do',{
                                                'wjCode':rowData.wjCode,
                                                'qList':qList,
                                                'jsonString':JSON.stringify(data.field),
                                                'userId':$.cookie('userId'),
                                                'userName':$.cookie('userName')
                                            },function (result_data) {
                                                layer.msg(result_data.msg, {time : 3000, offset: '100px'}, function () {
                                                    if(result_data.code == 200){
                                                        datatable.reload();//重新加载数据
                                                    }
                                                });
                                            },'json');
                                        });
                                    }
                                }else{
                                    layer.msg('问卷加载失败', {time : 3000, offset: '100px'});
                                }
                            },'json');
                        }
                    });
                    // layer.full(layIndex); //默认以最大化方式打开
                }
            });
        }
    });
});
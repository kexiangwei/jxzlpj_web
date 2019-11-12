/**
 *学生评教
 */
layui.use(['layer','table','form','rate'], function(){
    let $ = layui.$,layer = layui.layer,table = layui.table,form = layui.form,rate = layui.rate;

    //数据表格
    let dataTable = table.render({
        id: "dataTable_id"
        ,elem : '#dataTable'
        ,height : 540
        ,url: requestUrl+'/getXspjCourseList.do'
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
            ,{field: 'code', title: '课程编号', width:120, sort: true}
            ,{field: 'nameZh', title: '课程中文名称'}
            ,{field: 'nameEn', title: '课程英文名称'}
            ,{field: 'type', title: '课程类别', width:120}
            ,{field: 'score', title: '学分', width:120, sort: true}
            ,{field: 'stuHour', title: '学时', width:120, sort: true}
            ,{field: 'collegeName', title: '开课部门'}
            ,{fixed: 'right', width:120, align:'center', toolbar: '#dataTable_bar'}
        ]]
        ,even: true //隔行背景
        ,limit: 10
        ,page: {
            layout: ['count', 'prev', 'page', 'next', 'limit', 'refresh', 'skip']//自定义分页布局
            ,limits: [10,20,50,100]
        }
        ,done : function(res, curr, count) {

            //监听右侧工具条
            table.on('tool(dataTable)', function(obj){
                let rowData = obj.data;
                layer.open({
                    title : '您当前位置 》学生评教 》课程评分'
                    ,type : 1
                    ,area : [ '1175px', '535px' ]
                    ,offset : '10px'
                    ,shadeClose : true //点击遮罩关闭
                    ,btn : ['关闭']
                    ,content : $('#kcpfContainer')
                    ,success: function(layero, index){

                        $.get(requestUrl+"/getXspjTemplate.do" , {} ,  function(resultData){
                            if(resultData.code == 200){
                                let data = resultData.data;
                                let htmlStr = '';
                                //对教师评价
                                for (let i = 0; i < data.teacherTargets.length; i++) {
                                    htmlStr += '<tr>' +
                                        '   <td>'+data.teacherTargets[i].idx+'</td>' +
                                        '   <td>'+data.teacherTargets[i].name+'</td>' +
                                        '   <td>'+data.teacherTargets[i].content+'</td>' +
                                        '   <td>'+data.teacherTargets[i].score+'</td>' +
                                        '   <td><div class="layui-form-item">' +
                                        '           <input type="text" name="kcpf_teacher_'+data.teacherTargets[i].idx+'" value="" required  lay-verify="required" autocomplete="off" class="layui-input">' +
                                        '       </div>' +
                                        '   </td>' +
                                        '</tr>';
                                }
                                $("#kcpf_teacher").html(htmlStr);
                                //自我学习评价
                                htmlStr = '';
                                for (let i = 0; i < data.myselfTargets.length; i++) {
                                    htmlStr += '<tr>' +
                                        '   <td>'+data.myselfTargets[i].idx+'</td>' +
                                        '   <td>'+data.myselfTargets[i].name+'</td>' +
                                        '   <td>'+data.myselfTargets[i].content+'</td>' +
                                        '   <td style="text-align: center">' +
                                        '       <div id="kcpf_myself_'+data.myselfTargets[i].idx+'"></div>' +
                                        '   </td>' +
                                        '</tr>';
                                }
                                $("#kcpf_myself").html(htmlStr);
                                for (let i = 0; i < data.myselfTargets.length; i++) {
                                    rate.render({
                                        elem: '#kcpf_myself_'+data.myselfTargets[i].idx
                                        // ,value: 3
                                        ,text: true //开启文本
                                        ,setText: function(value){ //自定义文本的回调
                                            let arr = {
                                                '1': '很不符合'
                                                ,'2': '不符合'
                                                ,'3': '基本符合'
                                                ,'4': '符合'
                                                ,'5': '很符合'
                                            };
                                            this.span.text(arr[value] || ( ''));
                                        }
                                    });
                                }
                                //监听表单提交
                                form.on('submit(kcpf_teacherForm)', function(data){
                                    layer.msg(JSON.stringify(data.field));
                                    return false;

                                });
                                //监听表单提交
                                form.on('submit(kcpf_myselfForm)', function(data){
                                    let starNum = $('#kcpf_myself_1 .layui-icon-rate-solid').length;//获取相同class的个数
                                    layer.msg(JSON.stringify(starNum));
                                    return false;

                                });
                            }
                        }, "json");

                    },end:function () {

                    }
                });
            });
        }
    });
});
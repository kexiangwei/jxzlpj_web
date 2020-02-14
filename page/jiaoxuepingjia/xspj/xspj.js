/**
 *教学评价-学生评教
 */
layui.use(['layer','table','form'], function(){
    let $ = layui.$,layer = layui.layer,table = layui.table,form = layui.form;

    //数据表格
    let datatable = table.render({
        id: "datatable"
        ,elem : '#datatable'
        ,height : 520
        ,url: requestUrl+'/xspj/getCourseList.do'
        ,where:{
            "userId":function () {
                return $.cookie('userId');
            }
            ,"pageSize":999999
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
        ,toolbar: '#datatable_toolbar'
        ,cols : [[ //表头
            {type:'numbers', title:'序号', width:80, fixed: 'left'}
            ,{field: 'code', title: '课程编号', width:120}
            ,{field: 'nameZh', title: '课程中文名称'}
            ,{field: 'nameEn', title: '课程英文名称'}
            ,{field: 'stuHour', title: '学时', width:120, sort: true}
            ,{field: 'stuScore', title: '学分', width:120, sort: true}
            ,{field: 'courseType', title: '课程类别', width:120}
            ,{field: 'courseDept', title: '开课部门'}
            ,{fixed: 'right', width:120, align:'center', toolbar: '#datatable_bar'}
        ]]
        ,even: true //隔行背景
        ,limit: 10
        ,page: {
            layout: ['count', 'prev', 'page', 'next', 'limit', 'refresh', 'skip']//自定义分页布局
            ,limits: [10,20,50,100]
        }
        ,done : function(res, curr, count) {

            //监听头部工具栏
            table.on('toolbar(datatable)', function(obj){
                let layEvent = obj.event;
                switch(layEvent){
                    case 'kcpf':
                        //
                        $.get(requestUrl+"/getXspjTemplate.do",  function(resultData){
                            if(resultData.code == 200){
                                if(resultData.data.isPj){
                                    //
                                    let idx = 1 //题号
                                        ,data=null //题目
                                        ,courseData = ['课程1','课程2','课程3','课程4','课程5'] //课程信息数据源
                                        ,courseData_arr = {}; //存储已排序的课程信息，格式{1：[],2:[],,,}
                                    let layerIndex =  layer.open({
                                        title : ['课程评分', 'font-size: 18px;text-align: center;']
                                        ,type : 1
                                        ,area : [ '900px', '500px' ]
                                        ,offset : '30px'
                                        ,btn : ['上一题','下一题','保存','取消']
                                        ,closeBtn: false
                                        ,content : $('#kcpf_container')
                                        ,success: function(layero, index){
                                            data = resultData.data.targetList;
                                            pjQuestion(idx,data,courseData);
                                        }
                                        ,yes: function(index, layero){
                                            //
                                            setCourseData(idx,courseData_arr);
                                            //
                                            --idx;
                                            if(idx < 1){
                                                idx = 1;
                                            }
                                            pjQuestion(idx,data,courseData_arr.hasOwnProperty(idx)?courseData_arr[idx]:courseData);
                                            return false;
                                        }
                                        ,btn2: function(index, layero){
                                            //
                                            setCourseData(idx,courseData_arr);
                                            //
                                            ++idx;
                                            if(idx > data.length){
                                                idx = data.length;
                                            }
                                            pjQuestion(idx,data,courseData_arr.hasOwnProperty(idx)?courseData_arr[idx]:courseData);
                                            return false;
                                        }
                                        ,btn3: function(index, layero){
                                            layer.msg('保存', {time : 3000, offset: '100px'});
                                        }
                                    });
                                }else{
                                    layer.msg('评教时间已过', {time : 3000, offset: '100px'});
                                    return;
                                }
                            }
                        }, "json");

                        break;
                }
            });

            //监听右侧工具条
            table.on('tool(datatable)', function(obj){
                let layEvent = obj.event
                    , rowData = obj.data;
                if (layEvent === 'detail_dataInfo') {
                    layer.msg('查看详情', {time : 3000, offset: '100px'});
                }
            });
        }
    });

    let pjQuestion =function (idx,data,courseData) {
        let htmlStr = '<table class="layui-table" id="table"><tr><td>'+idx+'.'+data[idx-1].targetContent+'</td></tr>';
        $.each(courseData,function (idx,obj) {
            htmlStr += '<tr><td>'+obj+'</td></tr>';
        });
        htmlStr += '</table>';
        $("#kcpf_container").html(htmlStr);
        tableRowMove();
    };

    let setCourseData = function (idx,courseData_arr) {
        let arr = [];
        $("#table").each(function () { //循环获取每行td的内容
            for (let i = 1; i < $(this).find("tr").length; i++) {
                let courseName = $(this).find("tr").eq(i).find("td").eq(0).html(); //获取td内容
                arr[i-1]=courseName;
            }
        });
        courseData_arr[idx] = arr;
    };
});
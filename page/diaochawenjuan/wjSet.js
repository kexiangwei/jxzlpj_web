/**
 * 调查问卷-问卷设置
 */
layui.use(['layer','table','form','element'], function(){
    let $ = layui.$,layer = layui.layer,table = layui.table,form = layui.form,element = layui.element;

    //问卷
    let dataTable = table.render({
        id: "dataTable_id"
        ,elem : '#dataTable'
        ,height : 470
        ,url: requestUrl+'/getWjSetPageList.do'
        ,where:{
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
        ,defaultToolbar: []
        ,toolbar: '#dataTable_toolbar'
        ,cols : [[ //表头
            {type:'numbers', title:'序号', width:80, fixed: 'left'}
            ,{field: 'code', title: '编号', width:120, sort: true}
            ,{field: 'name', title: '名称', width:200}
            ,{field: 'desc', title: '描述',width:200}
            ,{field: 'createDate', title: '创建日期', width:160}
            ,{field: 'lastModifyDate', title: '最后修改日期', width:160}
            ,{field: 'remark', title: '备注'}
            ,{fixed: 'right', width:220, align:'center', toolbar: '#dataTable_bar'}
        ]]
        ,even: true //隔行背景
        ,limit: 10
        ,page: {
            layout: ['count', 'prev', 'page', 'next', 'limit', 'refresh', 'skip']//自定义分页布局
            ,limits: [10,20,50,100]
        }
        ,done : function(res, curr, count) {
        }
    });

    //题库
    let question_dataTable = table.render({
        id: "question_dataTable_id"
        ,elem : '#question_dataTable'
        ,height : 470
        ,url: requestUrl+'/getQuestionPageList.do'
        ,where:{
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
        ,defaultToolbar: []
        ,toolbar: '#question_dataTable_toolbar'
        ,cols : [[ //表头
            {type:'numbers', title:'序号', width:80, fixed: 'left'}
            ,{field: 'code', title: '编号', width:120, sort: true}
            ,{field: 'contentType', title: '类别', width:120}
            ,{field: 'content', title: '内容', width:600}
            ,{field: 'type', title: '题型', width:120}
            ,{fixed: 'right', width:220, align:'center', toolbar: '#question_dataTable_bar'}
        ]]
        ,even: true //隔行背景
        ,limit: 10
        ,page: {
            layout: ['count', 'prev', 'page', 'next', 'limit', 'refresh', 'skip']//自定义分页布局
            ,limits: [10,20,50,100]
        }
        ,done : function(res, curr, count) {

            //监听右侧工具条
            table.on('tool(question_dataTable)', function(obj){
                var rowData = obj.data;
                if (obj.event === 'question_detail') {
                    layer.open({
                        title : '当前位置 》调查问卷 》问卷设置 》题库 》详情页面'
                        ,type : 1
                        ,area : [ '700px', '335px' ] //宽高
                        ,offset : '30px'
                        ,content : $('#questionInfo')
                        ,success: function(layero, index){
                            $.get(requestUrl+'/getOption.do',{'qCode':rowData.code },function (resultData) {
                                if(resultData.code == 200){
                                    let htmlStr ='<h3 style="margin-left:20px;margin-top: 20px;">'+rowData.content+'</h3><br/>';
                                    $.each(resultData.data,function(idx,obj){
                                        if(rowData.type == '单选'){
                                            htmlStr += '<input type="radio" value=" obj.CONTENT" style="margin-left:20px;margin-top: 10px;">&nbsp;&nbsp;'+obj.CONTENT+'</input><br/>';
                                        }else if(rowData.type == '多选'){
                                            htmlStr += '<input type="checkbox" style="margin-left:20px;margin-top: 10px;">&nbsp;&nbsp;'+obj.CONTENT+'</input><br/>';
                                        }
                                    });
                                    $('#questionInfo').html(htmlStr);
                                }
                            },'json');
                        }
                    });
                } else if (obj.event === 'question_update') {
                    layer.msg('编辑', {time : 3000, offset: '100px'});
                } else if (obj.event === 'question_delete') {
                    layer.msg('删除', {time : 3000, offset: '100px'});
                }
            });
        }
    });
});
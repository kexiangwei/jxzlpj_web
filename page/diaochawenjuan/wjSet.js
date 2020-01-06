/**
 * 调查问卷-问卷设置
 */
layui.use(['layer','element','table','form'], function(){
    let $ = layui.$,layer = layui.layer,element = layui.element,table = layui.table,form = layui.form;

    //问卷
    let wj_datatable = table.render({
        id: "wj_datatable"
        ,elem : '#wj_datatable'
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
        ,toolbar: '#wj_datatable_toolbar'
        ,cols : [[ //表头
            {type:'numbers', title:'序号', width:80, fixed: 'left'}
            ,{field: 'wjCode', title: '编号', width:120}
            ,{field: 'wjName', title: '名称', width:200}
            ,{field: 'wjDesc', title: '描述'}
            ,{field: 'createDate', title: '创建日期', width:120}
            ,{fixed: 'right', width:220, align:'center', toolbar: '#datatable_bar'}
        ]]
        ,even: true //隔行背景
        ,limit: 10
        ,page: {
            layout: ['count', 'prev', 'page', 'next', 'limit', 'refresh', 'skip']//自定义分页布局
            ,limits: [10,20,50,100]
        }
        ,done : function(res, curr, count) {

            //监听右侧工具条
            table.on('tool(wj_datatable)', function(obj){
                let row_data = obj.data;
                if (obj.event === 'detail') {
                    layer.open({
                        title : row_data.wjName + '-预览'
                        ,type : 1
                        ,area : [ '700px', '535px' ]
                        ,offset : '10px' //只定义top坐标，水平保持居中
                        ,shadeClose : true //点击遮罩关闭
                        ,btn : ['关闭']
                        ,content : ''
                        ,success: function(layero, index){

                        }
                        ,end:function () {

                        }
                    });
                } else if (obj.event === 'update') {
                    layer.msg('编辑', {time : 3000, offset: '100px'});
                } else if (obj.event === 'delete') {
                    layer.msg('删除', {time : 3000, offset: '100px'});
                }
            });
        }
    });

    //题库
    let question_datatable = table.render({
        id: "question_datatable"
        ,elem : '#question_datatable'
        ,height : 470
        ,url: requestUrl+'/getWjQuestionPageList.do'
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
        ,toolbar: '#question_datatable_toolbar'
        ,cols : [[ //表头
            {type:'numbers', title:'序号', width:80, fixed: 'left'}
            ,{field: 'qcode', title: '问题编号', width:120}
            ,{field: 'qcontent', title: '问题内容', width:205}
            ,{field: 'optA', title: '选项A', width:120}
            ,{field: 'optB', title: '选项B', width:120}
            ,{field: 'optC', title: '选项C', width:120}
            ,{field: 'optD', title: '选项D', width:120}
            ,{field: 'wjName', title: '所属问卷', width:150}
            ,{fixed: 'right', width:220, align:'center', toolbar: '#datatable_bar'}
        ]]
        ,even: true //隔行背景
        ,limit: 10
        ,page: {
            layout: ['count', 'prev', 'page', 'next', 'limit', 'refresh', 'skip']//自定义分页布局
            ,limits: [10,20,50,100]
        }
        ,done : function(res, curr, count) {

            //监听右侧工具条
            table.on('tool(question_datatable)', function(obj){
                let row_data = obj.data;
                if (obj.event === 'detail') {
                    layer.msg('查看', {time : 3000, offset: '100px'});
                } else if (obj.event === 'update') {
                    layer.msg('编辑', {time : 3000, offset: '100px'});
                } else if (obj.event === 'delete') {
                    layer.msg('删除', {time : 3000, offset: '100px'});
                }
            });
        }
    });
});
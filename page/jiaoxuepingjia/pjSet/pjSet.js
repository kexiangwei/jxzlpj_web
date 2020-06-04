/**
 *教学评价-评教设置
 */
layui.use(['layer','element','table','form'], function(){
    let $ = layui.$,layer = layui.layer,element = layui.element,table = layui.table,form = layui.form;

    //评教设置
    let pjSet_dataTable = table.render({
        id: "pjSet_dataTable"
        ,elem : '#pjSet_dataTable'
        ,height : 470
        ,url: requestUrl+'/getPjSetList.do'
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
        ,toolbar: '#datatable_toolbar'
        ,cols : [[ //表头
            {type:'numbers', title:'序号', width:80, fixed: 'left'}
            ,{field: 'templateType', title: '模板类型', width:150}
            ,{field: 'templateName', title: '模板名称', width:200}
            ,{field: 'startDate', title: '开始日期', width:200}
            ,{field: 'endDate', title: '结束日期', width:200}
            ,{field: 'createDate', title: '创建日期', width:200}
            ,{fixed: 'right', width:220, align:'center', toolbar: '#datatable_bar'}
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

    //模板设置
    let template_dataTable = table.render({
        id: "template_dataTable"
        ,elem : '#template_dataTable'
        ,height : 470
        ,url: requestUrl+'/getPjSetTemplateList.do'
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
        ,toolbar: '#datatable_toolbar'
        ,cols : [[ //表头
            {type:'numbers', title:'序号', width:80, fixed: 'left'}
            // ,{field: 'templateCode', title: '编号', width:150}
            ,{field: 'templateType', title: '类型', width:150}
            ,{field: 'templateName', title: '名称', width:200}
            ,{field: 'templateDesc', title: '描述', width:600}
            // ,{field: 'createDate', title: '创建日期', width:150}
            ,{fixed: 'right', width:220, align:'center', toolbar: '#datatable_bar'}
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

    //指标设置
    let target_dataTable = table.render({
        id: "target_dataTable"
        ,elem : '#target_dataTable'
        ,height : 470
        ,url: requestUrl+'/getPjSetTargetList.do'
        ,response: {
            statusCode: 200 //规定成功的状态码，默认：0
        }
        ,parseData: function(res){ //res 即为原始返回的数据
            return {
                "code": res.code, //解析接口状态
                "msg": res.msg, //解析提示文本
                "data": res.data //解析数据列表
            };
        }
        ,defaultToolbar: []
        ,toolbar: '#datatable_toolbar'
        ,cols : [[ //表头
            {type:'numbers', title:'序号', width:80, fixed: 'left'}
            // ,{field: 'targetCode', title: '编号', width:120}
            ,{field: 'targetType', title: '类型', width:150}
            ,{field: 'targetName', title: '名称', width:150}
            ,{field: 'targetContent', title: '内容', width:450}
            ,{field: 'targetScore', title: '分值', width:150, sort: true}
            // ,{field: 'createDate', title: '创建日期', width:150}
            ,{fixed: 'right', width:250, align:'center', toolbar: '#datatable_bar'}
        ]]
        ,done : function(res, curr, count) {

            //监听头工具栏事件
            table.on('toolbar(target_dataTable)', function(obj){
                //
                let layIndex = layer.open({
                    title : '教学评价-评教设置-指标'
                    ,type : 1
                    ,area : [ '700px', '450px' ]
                    ,offset : '50px'
                    ,shadeClose : true //点击遮罩关闭
                    ,content : $('#target_container')
                    ,success: function(layero, index){

                        //监听提交
                        form.on('submit(toSubmitEditForm)', function(data){
                            layer.msg(JSON.stringify(data.field));
                            return false;
                        });

                    },end:function () {

                    }
                });
            });

        }
    });
});
/**
 *学生评教设置
 */
layui.use(['layer','table','form','rate','element'], function(){
    let $ = layui.$,layer = layui.layer,table = layui.table,form = layui.form,rate = layui.rate,element = layui.element;

    //评教设置
    let dataTable = table.render({
        id: "dataTable_id"
        ,elem : '#dataTable'
        ,height : 470
        ,url: requestUrl+'/getXspjSetList.do'
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
            ,{field: 'startDate', title: '开始日期', width:120}
            ,{field: 'endDate', title: '结束日期', width:120}
            // ,{field: 'templateCode', title: '模板编号', width:120}
            ,{field: 'templateName', title: '模板名称', width:120}
            ,{field: 'createDate', title: '创建日期', width:120}
            ,{field: 'lastModifyDate', title: '修改日期', width:120}
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

    //模板设置
    let template_dataTable = table.render({
        id: "template_dataTable_id"
        ,elem : '#template_dataTable'
        ,height : 470
        ,url: requestUrl+'/getXspjTemplateList.do'
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
        ,toolbar: '#template_dataTable_toolbar'
        ,cols : [[ //表头
            {type:'numbers', title:'序号', width:80, fixed: 'left'}
            ,{field: 'CODE', title: '模板编号', width:120, sort: true}
            ,{field: 'NAME', title: '模板名称', width:841}
            ,{fixed: 'right', width:220, align:'center', toolbar: '#template_dataTable_bar'}
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
        id: "target_dataTable_id"
        ,elem : '#target_dataTable'
        ,height : 470
        ,url: requestUrl+'/getXspjTargetList.do'
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
        ,toolbar: '#target_dataTable_toolbar'
        ,cols : [[ //表头
            {type:'numbers', title:'序号', width:80, fixed: 'left'}
            ,{field: 'code', title: '指标编号', width:120, sort: true}
            ,{field: 'name', title: '指标名称', width:200, edit: 'text'}
            ,{field: 'type', title: '指标类别', width:200,templet: function(data){ // 函数返回一个参数 data，包含接口返回的所有字段和数据
                    if(data.type=='teacher'){
                        return '对教师评价';
                    }
                    if(data.type=='myself'){
                        return '自我学习评价';
                    }
                    return '';
                }
            }
            ,{field: 'content', title: '评价内容', width:523, edit: 'text'}
            ,{field: 'score', title: '指标分值', width:120, edit: 'text'}
        ]]
        ,done : function(res, curr, count) {
            //监听头工具栏事件
            table.on('toolbar(target_dataTable)', function(obj){
                layer.open({
                    title : '您当前位置 》指标设置 》新增页面'
                    ,type : 1
                    ,area : [ '700px', '500px' ]
                    ,offset : '30px'
                    ,shadeClose : true //点击遮罩关闭
                    ,content : $('#target_insert_form')
                    ,success: function(layero, index){
                        //监听提交
                        form.on('submit(target_insert_form)', function(data){
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
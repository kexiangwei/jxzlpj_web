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
        ,toolbar: '#pjSet_toolbar'
        ,cols : [[ //表头
            {type:'numbers', title:'序号', width:80, fixed: 'left'}
            ,{field: 'templateType', title: '模板类型', width:150}
            ,{field: 'templateName', title: '模板名称', width:200}
            ,{field: 'startDate', title: '开始日期', width:200}
            ,{field: 'endDate', title: '结束日期', width:200}
            ,{field: 'createDate', title: '创建日期', width:200}
            ,{fixed: 'right', width:220, align:'center', toolbar: '#pjSet_bar'}
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

});
/**
 * 统计查询
 */
layui.use(['layer','table'], function(){
    let $ = layui.$,layer = layui.layer,table = layui.table;

    //数据表格
    let dataTable = table.render({
        id: "dataTable_id"
        ,elem : '#dataTable'
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
        ,toolbar: true
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

        }
    });
});
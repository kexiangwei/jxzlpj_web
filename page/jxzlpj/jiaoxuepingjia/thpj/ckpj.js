/*
教学评价-同行评教
 */
layui.use(['layer','element','table'], function(){
    var $ = layui.$,layer = layui.layer,element = layui.element,table = layui.table;

    //初始化数据表格
    var datatable = table.render({
        id: guid()
        ,elem : '#datatable'
        ,height : 525
        ,url: requestUrl+'/thpj/ckpj.do'
        ,where:{
            "accountType":function () {
                return  $.cookie('accountType');
            },
            "userId":function () {
                return  $.cookie('userId');
            }
        }
        ,request: {//用于对分页请求的参数：page、limit重新设定名称
            pageName: 'pageIndex' //页码的参数名称，默认：page
            ,limitName: 'pageSize' //每页数据量的参数名，默认：limit
        }
        ,response: { //重新规定返回的数据格式
            statusCode: 200 //规定成功的状态码，默认：0
        }
        ,parseData: function(res){ //res 即为原始返回的数据
            return {
                "code": res.code, //解析接口状态
                "msg": "", //解析提示文本
                "count": res.data.totalNum, //解析数据长度
                "data": res.data.pageList //解析数据列表
            };
        }
        ,cols : [[ //表头
            {type:'checkbox', fixed: 'left'}
            ,{type:'numbers', title:'序号', width:80, fixed: 'left'}
            ,{field:'userId', title:'工号', width:150, sort:true}
            ,{field:'userName', title:'姓名', width:150, sort:true}
            ,{field:'pjNum', title:'评教次数', width:150, sort:true}
            ,{field:'bpNum', title:'被评次数', width:150, sort:true}
        ]]
        ,even: true //隔行背景
        ,limit: 15
        ,page: { //支持传入 laypage 组件的所有参数（某些参数除外，如：jump/elem） - 详见文档
            layout: ['count', 'prev', 'page', 'next', 'limit', 'refresh', 'skip']//自定义分页布局
            ,limits: [15,50,100]
            ,first: '首页' //不显示首页
            ,last: '尾页' //不显示尾页
        }
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
                    'skjsCode': $(".search input[ name='skjsCode']").val(),
                    'skjsName': $(".search input[ name='skjsName']").val()
                }
                ,page: {
                    curr: 1 //重新从第 1 页开始
                }
            });
        }
        ,reset: function () {
            $(".search input").val('');
        }
    };
});
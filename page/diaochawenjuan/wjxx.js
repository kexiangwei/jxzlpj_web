
layui.use(['layer','table','form','transfer','util'], function(){
    let $ = layui.$,layer = layui.layer,table = layui.table,form = layui.form,transfer = layui.transfer,util = layui.util;
    //数据表格
    let dataTable = table.render({
        id: "dataTable_id"
        ,elem : '#dataTable'
        ,height : 500
        ,url: requestUrl+'/getOption.do'
        ,where: {
            'qCode':111
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
        ,toolbar: '#dataTable_toolbar'
        ,cols : [[ //表头
            {type:'checkbox', fixed: 'left'}
            ,{type:'numbers', title:'序号', width:80, fixed: 'left'}
            ,{field: 'userId', title: '问卷编号', width:120, sort: true}
            ,{field: 'userName', title: '问卷名称', width:120}
            ,{field: 'accountType', title: '创建时间', width:120}
            ,{field: 'collegeName', title: '最后修改时间', width:120}
            ,{field: 'remark', title: '备注'}
            ,{fixed: 'right', width:160, align:'center', toolbar: '#dataTable_bar'}
        ]]
        ,even: true //隔行背景
        ,limit: 10
        ,page: {
            layout: ['count', 'prev', 'page', 'next', 'limit', 'refresh', 'skip']//自定义分页布局
            ,limits: [10,20,50,100]
        }
        ,done : function(res, curr, count) {
            var data = res.data;
            $('.layui-table-body tr').each(function() {
                var dataindex = $(this).attr('data-index');
                var idx = 0;
                for ( var item in data) {
                    if (dataindex == idx) {
                        $(this).dblclick(function() {//双击某一行事件
                            layer.msg('查看', {time : 3000, offset: '100px'});
                        });
                        break;
                    }
                    idx++;
                }
            });

            //监听搜索框
            let active = {
                search: function(){
                    dataTable.reload({
                        where: { //设定异步数据接口的额外参数，任意设
                            'wjCode': $(" input[ name='wjCode' ] ").val()
                            ,'wjName': $(" input[ name='wjName' ] ").val()
                        }
                        ,page: {
                            curr: 1 //重新从第 1 页开始
                        }
                    });
                }
                ,reset: function () {
                    $("input").val('');
                }
            };
            $('.search-container .layui-btn').on('click', function(){
                let type = $(this).data('type');
                active[type] ? active[type].call(this) : '';
            });

            //监听头部工具栏
            table.on('toolbar(dataTable)', function(obj){
                switch(obj.event){
                    case 'insert':
                        layer.open({
                            title : '当前位置 》调查问卷 》问卷信息 》 新增页面'
                            ,type : 1
                            ,area : [ '700px', '535px' ]
                            ,offset : '10px'
                            ,shadeClose : true
                            ,btn : ['关闭']
                            ,content : ''
                        });
                        break;
                    case 'import':
                        layer.msg('导入', {time : 3000, offset: '100px'});
                        break;
                }
            });

            //监听右侧工具条
            table.on('tool(dataTable)', function(obj){
                var rowData = obj.data;
                if (obj.event === 'detail') {
                    $.get(requestUrl+'/getUserDetail.do', {"userId":rowData.userId},function (resultData) {
                        if(resultData.code == 200){
                            let data = resultData.data;
                            layer.open({
                                title : '您当前位置 》用户管理 》详情页面'
                                ,type : 1
                                ,area : [ '700px', '535px' ]
                                ,offset : '10px'
                                ,shadeClose : true
                                ,btn : ['关闭']
                                ,content : '<table class="layui-table">\n' +
                                    '        <tbody>\n' +
                                    '            <tr><td style="width: 150px; text-align: right">工号</td><td>'+data.CODE+'</td></tr>\n' +
                                    '            <tr><td style="width: 150px; text-align: right">姓名</td><td>'+data.NAME+'</td></tr>\n' +
                                    '            <tr><td style="width: 150px; text-align: right">性别</td><td>'+data.SEX+'</td></tr>\n' +
                                    '            <tr><td style="width: 150px; text-align: right">证件类型</td><td>'+data.CARD_TYPE+'</td></tr>\n' +
                                    '            <tr><td style="width: 150px; text-align: right">证件号码</td><td>'+data.CARD_NUM+'</td></tr>\n' +
                                    '            <tr><td style="width: 150px; text-align: right">文化程度</td><td>博士</td></tr>\n' +
                                    '            <tr><td style="width: 150px; text-align: right">所属部门</td><td>'+data.COLLEGE_NAME+'</td></tr>\n' +
                                    '            <tr><td style="width: 150px; text-align: right">是否外聘</td><td>否</td></tr>\n' +
                                    '            <tr><td style="width: 150px; text-align: right">当前状态</td><td>在岗</td></tr>\n' +
                                    '        </tbody>\n' +
                                    '    </table>'
                            });
                        }else{
                            layer.msg('数据加载失败', {time : 3000, offset: '100px'});
                        }
                    },'json');
                } else if (obj.event === 'update') {
                    layer.msg('编辑', {time : 3000, offset: '100px'});
                } else if (obj.event === 'delete') {
                    layer.msg('删除', {time : 3000, offset: '100px'});
                }
            });
        }
    });
});
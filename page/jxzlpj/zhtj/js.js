/**
 * 综合统计-统计分析
 */
layui.use(['layer','table'], function(){
    let $ = layui.$,layer = layui.layer,table = layui.table;

    //数据表格
    let datatable = table.render({
        id: guid()
        ,elem : '#datatable'
        ,height : 580
        ,url: requestUrl+'/getTjfxPageList.do'
        ,where:{
            "tjType": "js",
            "userId":function () {
                let userId = null;
                if($.cookie('maxAuthLevel') == 8){
                    userId = $.cookie('userId');
                }
                return userId;
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
        /*,toolbar: '#toolbar0' //开启头部工具栏，并为其绑定左侧模板
        ,defaultToolbar: [{ //自定义头部工具栏右侧图标。如无需自定义，去除该参数即可
            title: '导出'
            ,layEvent: 'export'
            ,icon: 'layui-icon-export'
        }]*/
        ,totalRow: true //开启合计行
        ,cols : [
            [ //表头
                { type:'numbers', title:'序号', width:80, fixed: 'left', rowspan: 3 }
                ,{ field: 'NAME', title: '教师',align: 'center', width:200, sort: true, event: 'name', templet: function (data) {
                    return '<span style="font-weight: bold; cursor: pointer;">'+data.NAME+'</span>';
                }, fixed: 'left', totalRowText: '合计：', rowspan: 3
            }
                ,{ title: '教学研究',align: 'center', colspan: 10 }
                ,{ title: '教材入选情况',align: 'center', colspan: 14 }
                ,{ title: '教学奖励',align: 'center', colspan: 21 }
                ,{ title: '教学事故',align: 'center', colspan: 5 }
                ,{ title: '同行评教',align: 'center', colspan: 8 }
                ,{ title: '学生评教',align: 'center', colspan: 8 }
                ,{ field: 'ZP', title: '教学评价总评', align: 'center', width:200, sort: true, rowspan: 3 }
            ],
            [
                { title: '继续教育', align: 'center', colspan: 3 }
                ,{ title: '教改项目', align: 'center', colspan: 3 }
                ,{ field: 'JGLW_NUM', title: '第一作者教改论文', align: 'center', width:200, sort: true, totalRow:true, rowspan: 2 }
                ,{ title: '教学团队', align: 'center', colspan: 3 }
                ,{ title: '主编', align: 'center', colspan: 7 }
                ,{ title: '副主编', align: 'center', colspan: 7 }
                //教学奖励
                ,{ title: '教育教学成果奖', align: 'center', colspan: 3 }
                ,{ title: '专业建设成果奖', align: 'center', colspan: 3 }
                ,{ title: '课程建设成果奖', align: 'center', colspan: 3 }
                ,{ title: '教师个人成果奖', align: 'center', colspan: 3 }
                ,{ title: '其他本科教学奖励', align: 'center', colspan: 3 }
                ,{ title: '教师指导文体竞赛获奖', align: 'center', colspan: 3 }
                ,{ title: '教师指导学科竞赛获奖', align: 'center', colspan: 3 }
                //教学事故
                ,{field: 'JXSG_ZDSG', title: '重大教学事故次数', align: 'center', width:200, sort: true, totalRow:true, rowspan: 2}
                ,{field: 'JXSG_YBSG', title: '一般教学事故次数', align: 'center', width:200, sort: true, totalRow:true, rowspan: 2}
                ,{field: 'JXSG_GS', title: '教学过失次数', align: 'center', width:200, sort: true, totalRow:true, rowspan: 2}
                ,{field: 'JXSG_FMQD', title: '负面清单次数', align: 'center', width:200, sort: true, totalRow:true, rowspan: 2}
                ,{field: 'JXSG_TOTAL_NUM', title: '教学事故总次数', align: 'center', width:200, sort: true, totalRow:true, rowspan: 2}
                //教学评价
                ,{ title: '评价人信息', align: 'center', colspan: 3 }
                ,{ title: '被评价人信息', align: 'center', colspan: 3 }
                ,{ title: '课程信息', align: 'center', colspan: 2 }
                ,{ title: '评价人信息', align: 'center', colspan: 3 }
                ,{ title: '被评价人信息', align: 'center', colspan: 3 }
                ,{ title: '课程信息', align: 'center', colspan: 2 }

            ],
            [
                //教学研究
                {field: 'JXJY_ZRS', title: '总人数', align: 'center', width:120, sort: true, totalRow:true}
                ,{field: 'JXJY_ZRC', title: '总人次数', align: 'center', width:150, sort: true, totalRow:true}
                ,{field: 'JXJY_ZXS', title: '总学时数', align: 'center', width:150, sort: true, totalRow:true}
                ,{field: 'JGXM_COUNTRY_NUM', title: '国家级', align: 'center', width:120, sort: true, totalRow:true}
                ,{field: 'JGXM_PROVINCE_NUM', title: '省部级', align: 'center', width:120, sort: true, totalRow:true}
                ,{field: 'JGXM_SCHOOL_NUM', title: '校级', align: 'center', width:120, sort: true, totalRow:true}
                ,{field: 'JXTD_COUNTRY_NUM', title: '国家级', align: 'center', width:120, sort: true, totalRow:true}
                ,{field: 'JXTD_PROVINCE_NUM', title: '省部级', align: 'center', width:120, sort: true, totalRow:true}
                ,{field: 'JXTD_SCHOOL_NUM', title: '校级', align: 'center', width:120, sort: true, totalRow:true}
                //教材入选情况
                ,{field: 'JCJS_ZB_1', title: '国家规划教材', align: 'center', width:180, sort: true, totalRow:true}
                ,{field: 'JCJS_ZB_2', title: '省部级规划教材', align: 'center', width:180, sort: true, totalRow:true}
                ,{field: 'JCJS_ZB_3', title: '国家级精品教材', align: 'center', width:180, sort: true, totalRow:true}
                ,{field: 'JCJS_ZB_4', title: '省部级精品教材', align: 'center', width:180, sort: true, totalRow:true}
                ,{field: 'JCJS_ZB_5', title: '国家级优秀教材', align: 'center', width:180, sort: true, totalRow:true}
                ,{field: 'JCJS_ZB_6', title: '省部级优秀教材', align: 'center', width:180, sort: true, totalRow:true}
                ,{field: 'JCJS_ZB_7', title: '其他', align: 'center', width:180, sort: true, totalRow:true}
                ,{field: 'JCJS_FZB_1', title: '国家规划教材', align: 'center', width:180, sort: true, totalRow:true}
                ,{field: 'JCJS_FZB_2', title: '省部级规划教材', align: 'center', width:180, sort: true, totalRow:true}
                ,{field: 'JCJS_FZB_3', title: '国家级精品教材', align: 'center', width:180, sort: true, totalRow:true}
                ,{field: 'JCJS_FZB_4', title: '省部级精品教材', align: 'center', width:180, sort: true, totalRow:true}
                ,{field: 'JCJS_FZB_5', title: '国家级优秀教材', align: 'center', width:180, sort: true, totalRow:true}
                ,{field: 'JCJS_FZB_6', title: '省部级优秀教材', align: 'center', width:180, sort: true, totalRow:true}
                ,{field: 'JCJS_FZB_7', title: '其他', align: 'center', width:180, sort: true, totalRow:true}
                //教育教学成果奖
                ,{field: 'JYJXCGJ_COUNTRY', title: '国家级', align: 'center', width:120, sort: true, totalRow:true}
                ,{field: 'JYJXCGJ_PROVINCE', title: '省部级', align: 'center', width:120, sort: true, totalRow:true}
                ,{field: 'JYJXCGJ_SCHOOL', title: '校级', align: 'center', width:120, sort: true, totalRow:true}
                //专业建设成果奖
                ,{field: 'ZYJSCGJ_COUNTRY', title: '国家级', align: 'center', width:120, sort: true, totalRow:true}
                ,{field: 'ZYJSCGJ_PROVINCE', title: '省部级', align: 'center', width:120, sort: true, totalRow:true}
                ,{field: 'ZYJSCGJ_SCHOOL', title: '校级', align: 'center', width:120, sort: true, totalRow:true}
                //课程建设成果奖
                ,{field: 'KCJSCGJ_COUNTRY', title: '国家级', align: 'center', width:120, sort: true, totalRow:true}
                ,{field: 'KCJSCGJ_PROVINCE', title: '省部级', align: 'center', width:120, sort: true, totalRow:true}
                ,{field: 'KCJSCGJ_SCHOOL', title: '校级', align: 'center', width:120, sort: true, totalRow:true}
                //教师个人成果奖
                ,{field: 'JSGRCGJ_COUNTRY', title: '国家级', align: 'center', width:120, sort: true, totalRow:true}
                ,{field: 'JSGRCGJ_PROVINCE', title: '省部级', align: 'center', width:120, sort: true, totalRow:true}
                ,{field: 'JSGRCGJ_SCHOOL', title: '校级', align: 'center', width:120, sort: true, totalRow:true}
                //其他本科教学奖励
                ,{field: 'QTBKJXJL_COUNTRY', title: '国家级', align: 'center', width:120, sort: true, totalRow:true}
                ,{field: 'QTBKJXJL_PROVINCE', title: '省部级', align: 'center', width:120, sort: true, totalRow:true}
                ,{field: 'QTBKJXJL_SCHOOL', title: '校级', align: 'center', width:120, sort: true, totalRow:true}
                //教师指导文体竞赛获奖
                ,{field: 'WTBS_COUNTRY', title: '国家级', align: 'center', width:120, sort: true, totalRow:true}
                ,{field: 'WTBS_PROVINCE', title: '省部级', align: 'center', width:120, sort: true, totalRow:true}
                ,{field: 'WTBS_SCHOOL', title: '校级', align: 'center', width:120, sort: true, totalRow:true}
                //教师指导学科竞赛获奖
                ,{field: 'XKZYBS_COUNTRY', title: '国家级', align: 'center', width:120, sort: true, totalRow:true}
                ,{field: 'XKZYBS_PROVINCE', title: '省部级', align: 'center', width:120, sort: true, totalRow:true}
                ,{field: 'XKZYBS_SCHOOL', title: '校级', align: 'center', width:120, sort: true, totalRow:true}
                //同行评教
                ,{field: 'THPJ_PJ_RS', title: '人数', align: 'center', width:120, sort: true, totalRow:true}
                ,{field: 'THPJ_PJ_RC', title: '人次数', align: 'center', width:120, sort: true, totalRow:true}
                ,{field: 'THPJ_AVG_SCORE', title: '打出的平均分', align: 'center', width:180, sort: true}
                ,{field: 'THPJ2_PJ_RS', title: '人数', align: 'center', width:120, sort: true, totalRow:true}
                ,{field: 'THPJ2_PJ_RC', title: '人次数', align: 'center', width:120, sort: true, totalRow:true}
                ,{field: 'THPJ2_AVG_SCORE', title: '得到的平均分', align: 'center', width:180, sort: true}
                ,{field: 'THPJ3_1', title: '门数', align: 'center', width:120, sort: true, totalRow:true}
                ,{field: 'THPJ3_2', title: '门次数', align: 'center', width:120, sort: true, totalRow:true}
                //学生评教
                ,{field: 'XSPJ1_PJ_RS', title: '人数', align: 'center', width:120, sort: true, totalRow:true}
                ,{field: 'XSPJ1_PJ_RC', title: '人次数', align: 'center', width:120, sort: true, totalRow:true}
                ,{field: 'XSPJ1_AVG_SCORE', title: '打出的平均分', align: 'center', width:180, sort: true}
                ,{field: 'XSPJ2_PJ_RS', title: '人数', align: 'center', width:120, sort: true, totalRow:true}
                ,{field: 'XSPJ2_PJ_RC', title: '人次数', align: 'center', width:120, sort: true, totalRow:true}
                ,{field: 'XSPJ2_AVG_SCORE', title: '得到的平均分', align: 'center', width:180, sort: true}
                ,{field: 'XSPJ3_1', title: '门数', align: 'center', width:120, sort: true, totalRow:true}
                ,{field: 'XSPJ3_2', title: '门次数', align: 'center', width:120, sort: true, totalRow:true}
            ]
        ]
        ,even: true //隔行背景
        ,limit: 10
        ,page: {
            layout: ['count', 'prev', 'page', 'next', 'limit', 'refresh', 'skip']//自定义分页布局
            ,limits: [10,20,50,100]
        }
        ,done : function(res, curr, count) {

            /*//监听表头事件
            $("[data-field='NAME']").click(function (obj) {
                layer.alert(111);
            });*/

            /*//触发行双击事件
            table.on('rowDouble(datatable)', function(obj){
                alert(111);
            });*/

            /*//头工具栏事件
            table.on('toolbar(datatable)', function(obj){
                switch(obj.event){
                    //自定义头工具栏右侧图标 - 提示
                    case 'export':
                        layer.msg('这是工具栏右侧自定义的一个图标按钮');
                        break;
                };
            });*/

            //监听行工具事件
            table.on('tool(datatable)', function(obj){
                let row_data = obj.data;
                if (obj.event === 'name') {
                    layer.msg(row_data.NAME);
                }
            });
        }
    });
});
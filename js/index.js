//JavaScript代码区域
layui.use(['layer','element'], function(){
    var $ = layui.$,layer = layui.layer,element = layui.element;
    //
    layer.msg("欢迎你，"+ $.cookie('userName'));
    //
    $("#headImg").attr("src",requestUrl+($.cookie('headImg')!='null'?$.cookie('headImg'):'/files/userHeadImg/tly.jpg'));
    //
    $.ajax({
        type: "get",
        url: requestUrl+'/getUserMenu.do',
        data: {
            "userId":$.cookie('userId')
        },
        dataType: "json",
        success: function(data){
            var html='';
            $.each(data.data,function(index,item){ //教学研究
                html += '<li class="layui-nav-item">\n' +
                    '        <a href="javascript:;"><i class="layui-icon '+item.icon+'" style="font-size: 20px;"></i>&nbsp;&nbsp;'+item.menuName+'<span class="layui-nav-more"></span></a>';
                $.each(item.children,function(index,item2){ //教学团队
                    if(item2.menuName == '教学团队' || item2.menuName == '教改项目' || item2.menuName == '同行评教' || item2.menuName == '学生评教'|| item2.menuName == '通用设置'){
                        html += '<dl class="layui-nav-child"><dd><a href="javascript:;"><span class="l-line"></span>'+item2.menuName+'</a>';
                        $.each(item2.children,function(index,item3){
                            html += '<dl class="layui-nav-child"><dd><a class="site-demo-active" href="javascript:;" data-id="'+item3.menuId+'" data-title="'+item3.menuName+'" data-url="'+item3.url+'" data-type="tabAdd"><span class="l-line" style="margin-left: 52px"></span>'+item3.menuName+'</a></dd></dl>';
                        });
                        html += '</dd></dl>';
                    }else{
                        html += '<dl class="layui-nav-child">\n' +
                            '       <dd><a class="site-demo-active" href="javascript:;" data-id="'+item2.menuId+'" data-title="'+item2.menuName+'" data-url="'+item2.url+'" data-type="tabAdd"><span class="l-line"></span>'+item2.menuName+'</a></dd>\n' +
                            '   </dl>';
                    }
                });
                html+='</li>';
            });
            //
            $('#menuTree').html(html);
            //比如当你对导航动态插入了二级菜单，这时你需要重新去对它进行渲染,参考链接：https://www.layui.com/doc/modules/element.html
            element.render('nav', 'menuTree');

            //在这里给active绑定几项事件，后面可通过active调用这些事件
            var active = {
                //新增一个Tab项 传入三个参数，分别对应其标题，tab页面的地址，还有一个规定的id，是标签中data-id的属性值
                tabAdd: function (url, id, name) {
                    //关于tabAdd的方法所传入的参数可看layui的开发文档中基础方法部分
                    element.tabAdd('demo', {
                        title: name,
                        content: '<iframe data-frameid="' + id + '" scrolling="auto" frameborder="0" src="' + url + '" style="width:100%;height:99%;"></iframe>',
                        id: id //规定好的id
                    });
                    $("iframe").css("height",$(window).height()+"px");  //计算ifram层的大小
                },
                tabChange: function (id) {
                    //切换到指定Tab项
                    element.tabChange('demo', id); //根据传入的id传入到指定的tab项
                },
                tabDelete: function (id) {
                    element.tabDelete("demo", id);//删除
                }
            };
            //
            $('.site-demo-active').on('click', function () {
                // alert($(this).attr("data-id"));

                //
                $("div").remove(".layui-body");
                //
                var dataid = $(this);
                //这时会判断右侧.layui-tab-title属性下的有lay-id属性的li的数目，即已经打开的tab项数目
                if ($(".layui-tab-title li[lay-id]").length <= 0) {
                    //如果比零小，则直接打开新的tab项
                    active.tabAdd(dataid.attr("data-url"), dataid.attr("data-id"), dataid.attr("data-title"));
                } else {
                    //否则判断该tab项是否以及存在
                    var isData = false; //初始化一个标志，为false说明未打开该tab项 为true则说明已有
                    $.each($(".layui-tab-title li[lay-id]"), function () {
                        //如果点击左侧菜单栏所传入的id 在右侧tab项中的lay-id属性可以找到，则说明该tab项已经打开
                        if ($(this).attr("lay-id") == dataid.attr("data-id")) {
                            isData = true;
                        }
                    });
                    if (isData == false) {
                        //标志为false 新增一个tab项
                        active.tabAdd(dataid.attr("data-url"), dataid.attr("data-id"), dataid.attr("data-title"));
                    }
                }
                //最后不管是否新增tab，最后都转到要打开的选项页面上
                active.tabChange(dataid.attr("data-id"));
            });

            //监听导航点击
            element.on('nav(menuTree)', function(elem){
                if(typeof(elem.attr('data-id'))!=='undefined'){
                    $.cookie('currentMenuId', elem.attr('data-id'), { path: '/' });
                }
            });
            //监听Tab切换，问题描述：获取不到当前选项卡的菜单编号
            /*element.on('tab(demo)', function(elem){
                layer.alert($.cookie('currentMenuId'));
            });*/
        },
        error:function () {
            layer.msg("页面加载错误", {time : 3000, offset: '100px'});
        }
    });
});
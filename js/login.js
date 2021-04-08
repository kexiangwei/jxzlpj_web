layui.use(['layer','form'], function() {
    let $ = layui.$, layer = layui.layer, form = layui.form;

    //获取图形验证码
    var getCaptcha = function () {
        $.ajax({
            url:requestUrl+'/getCaptcha.do',
            type:'get',
            dataType:'json',
            success:function(data) {
                //图形验证码
                $("#imgCode").attr('src',data.data.image);
                //监听提交
                form.on('submit(loginForm)', function(formData){

                    $.post(requestUrl+"/login.do" , {
                        'token': data.data.token,
                        'imageCode': formData.field.imageCode,
                        'userId': formData.field.userId,
                        'password': formData.field.password
                    } ,  function(resultData){
                        if(resultData.code==200){

                            let obj = resultData.data;
                            //保存用户信息
                            $.cookie('userId', obj.userId, { path: '/' });
                            $.cookie('userName', obj.userName, { path: '/' });
                            $.cookie('sex', obj.sex, { path: '/' });
                            $.cookie('age', obj.age, { path: '/' });
                            $.cookie('accountType', obj.accountType, { path: '/' });
                            $.cookie('maxAuthLevel', obj.maxAuthLevel, { path: '/' });
                            $.cookie('userGroup', obj.userGroup, { path: '/' });
                            $.cookie('headImg', obj.headImg, { path: '/' });
                            //
                            $.cookie('xyCode', obj.xyCode, { path: '/' });
                            $.cookie('xyName', obj.xyName, { path: '/' });
                            $.cookie('zyCode', obj.zyCode, { path: '/' });
                            $.cookie('zyName', obj.zyName, { path: '/' });
                            //
                            $.cookie('userUnit', obj.userUnit, { path: '/' });
                            $.cookie('title', obj.title, { path: '/' });
                            //
                            $.cookie('nj', obj.nj, { path: '/' });
                            $.cookie('bj', obj.bj, { path: '/' });
                            //跳转到主页面
                            window.location.href="index.html";
                        }else{
                            layer.msg(resultData.msg, {time : 3000, offset: '100px'});
                        }
                    }, "json");
                    return false;//这个必须有
                });
            },
            error:function() {
                layer.msg('网络连接失败！', {time : 3000, offset: '100px'});
            }
        });
    };
    getCaptcha();
    $("img").click(function(){
        getCaptcha();
    });
});

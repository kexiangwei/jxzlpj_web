layui.use(['layer','form'], function() {
    let $ = layui.$, layer = layui.layer, form = layui.form;

    //获取图形验证码
    let getCaptcha = function () {
        $.ajax({
            url:requestUrl+'/getCaptcha.do',
            type:'get',
            dataType:'json',
            success:function(data) {
                //图形验证码
                $("#verCode").attr('src',data.data.image);
                //监听提交
                form.on('submit(loginForm)', function(formData){
                    // alert(JSON.stringify(formData));
                    $.post(requestUrl+"/login.do" , {
                        'userId': formData.field.userId,
                        'password': formData.field.password,
                        'token': data.data.token,
                        'verifyCode': formData.field.verifyCode
                    } ,  function(resultData){
                        if(resultData.code==200){
                            //保存用户信息
                            let obj = resultData.data;

                            $.cookie('userId', obj.userId, { path: '/' });
                            $.cookie('userName', obj.userName, { path: '/' });
                            $.cookie('userGroup', obj.userGroup, { path: '/' });
                            $.cookie('accountType', obj.accountType, { path: '/' });
                            $.cookie('headImg', obj.headImg, { path: '/' });
                            $.cookie('phone', obj.phone, { path: '/' });

                            $.cookie('sex', obj.sex, { path: '/' });
                            $.cookie('eduDegree', obj.eduDegree, { path: '/' });
                            $.cookie('title', obj.title, { path: '/' });
                            $.cookie('className', obj.className, { path: '/' });
                            $.cookie('grade', obj.grade, { path: '/' });
                            $.cookie('majorName', obj.majorName, { path: '/' });
                            $.cookie('collegeName', obj.collegeName, { path: '/' });

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

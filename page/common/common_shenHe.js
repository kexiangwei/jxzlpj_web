//初始化参数
var params = {

};

//填写审核意见
layui.use(['layer','form'], function(){
    var $ = layui.$,layer = layui.layer,form = layui.form;

    //
    form.on('select(status)', function(formData) {
        if(formData.value == '通过'){
            $('#opinion').html('通过');
        } else {
            $('#opinion').empty();
        }
    });
    //
    form.on('submit(toSubmitShenHeForm)', function(formData){
        /*layer.alert(JSON.stringify(formData.field), {
           title: '最终的提交信息'
       });
       return false;*/

       // alert(JSON.stringify(params));

        //
        $.post(parent.requestUrl+'/'+params.module+'/toShenhe.do', {
            "jsonStr":JSON.stringify(params.rowDatas)
            ,"status":formData.field.status
            ,"opinion":formData.field.opinion
            ,"userId":params.userId
            ,"userName":params.userName
        }, function (resultData) { //Referrer Policy: no-referrer-when-downgrade
            parent.layer.msg(resultData.msg, {offset: '100px'});
        },'json');

        /*//layer.getFrameIndex(windowName) - 获取特定iframe层的索引，此方法一般用于在iframe页关闭自身时用到。
        var index = parent.layer.getFrameIndex(window.name); //先得到当前iframe层的索引
        parent.layer.close(index); //再执行关闭*/
        parent.layer.closeAll();
    });
});

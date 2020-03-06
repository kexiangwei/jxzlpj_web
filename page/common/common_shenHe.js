//
var params = {

};
//
layui.use(['layer','form'], function(){
    var $ = layui.$,layer = layui.layer,form = layui.form;

    //
    form.on('select(status)', function(data) {
        if(data.value == '通过'){
            $('#opinion').html('通过');
        } else {
            $('#opinion').empty();
        }
    });
    //
    form.on('submit(toSubmitShenHeForm)', function(data){
        /*layer.alert(JSON.stringify(data.field), {
           title: '最终的提交信息'
       });
       return false;*/

       // alert(JSON.stringify(params));

        //
        $.post(parent.requestUrl+'/jxdg/toShenhe.do', {
            "jsonStr":JSON.stringify(params.rowDatas)
            ,"status":data.field.status
            ,"opinion":data.field.opinion
            ,"userId":params.userId
            ,"userName":params.userName
        }, function (data) {
            parent.layer.msg(data.msg, {offset: '100px'});
        },'json');

        //layer.getFrameIndex(windowName) - 获取特定iframe层的索引，此方法一般用于在iframe页关闭自身时用到。
        var index = parent.layer.getFrameIndex(window.name); //先得到当前iframe层的索引
        parent.layer.close(index); //再执行关闭
    });
});

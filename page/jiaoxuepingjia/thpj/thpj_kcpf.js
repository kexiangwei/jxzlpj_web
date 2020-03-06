layui.use(['layer','form'], function(){
    var $ = layui.$,layer = layui.layer,form = layui.form;
    //
    form.on('submit(toSubmit)', function(data){
        /*layer.alert(JSON.stringify(data.field), {
            title: '最终的提交信息'
        });
        return false;*/

        parent.layer.msg('保存成功', { offset: '100px'});
        //layer.getFrameIndex(windowName) - 获取特定iframe层的索引，此方法一般用于在iframe页关闭自身时用到。
        var index = parent.layer.getFrameIndex(window.name); //先得到当前iframe层的索引
        parent.layer.close(index); //再执行关闭

    });
});
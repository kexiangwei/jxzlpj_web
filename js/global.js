/**
 * 全局变量声明文件
 **/

var requestUrl="http://127.0.0.1:8080/jxzlpj";

//全局唯一标识符
var guid = function(){
    return 'xxxxxxxxxxxxxxxx'.replace(/[x]/g, function(c) {
        var r = Math.random()*16|0
            , v = c == 'x' ? r : (r&0x3|0x8);
        return v.toString(16);
    });
};

//判断对象是否为空
var isEmpty = function(obj) {
    for (var prop in obj) {
        // Inlude null properties as empty.
        if (obj[prop] !== null) {
            return false;
        }
    }
    return true;
};

/**
 * 加载下拉选项
 * @param defaultOptionVal
 * @param inputName
 * @param data
 */
var initSelect = function(defaultOptionVal, inputName, data){
    //
    $("select[name='"+inputName+"']").empty(); //移除下拉框所有选项option
    //
    let html = '<option value="">'+defaultOptionVal+'</option>';
    for (let i = 0; i < data.length; i++) {
        html += '<option value="' + data[i]['NAME'] + '" >' + data[i]['NAME'] + '</option>';
    }
    $("select[name='"+inputName+"']").append(html);
};
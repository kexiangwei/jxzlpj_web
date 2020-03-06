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
/**
 * 全局变量声明文件
 **/

var requestUrl="http://127.0.0.1:8080/jxzlpj";

//生成随机字符
var randomChar = function(){
    return 'xxxxxxxxxxxxxxxx'.replace(/[x]/g, function(c) {
        var r = Math.random()*16|0
            , v = c == 'x' ? r : (r&0x3|0x8);
        return v.toString(16);
    });
};

//给String对象增加一个原型方法,用于匹配指定字符结尾的字符串
String.prototype.endWith=function(endStr){
    var d=this.length-endStr.length;
    return (d>=0&&this.lastIndexOf(endStr)==d);
};
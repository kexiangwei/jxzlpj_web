/**
 * 表格行拖动
 */
function tableRowMove(){
    //绑定事件
    var addEvent = document.addEventListener ? function(el,type,callback){
        el.addEventListener( type, callback, !1 );
    } : function(el,type,callback){
        el.attachEvent( "on" + type, callback );
    };

    //精确获取样式
    var getStyle = document.defaultView ? function(el,style){
        return document.defaultView.getComputedStyle(el, null).getPropertyValue(style)
    } : function(el,style){
        style = style.replace(/\-(\w)/g, function($, $1){
            return $1.toUpperCase();
        });
        return el.currentStyle[style];
    };

    var dragManager = {
        y:0,
        draging:function(e){//mousemove时拖动行
            var handler = dragManager.handler;
            if(handler){
                e = e || event;
                if(window.getSelection){//w3c
                    window.getSelection().removeAllRanges();
                }else  if(document.selection){
                    document.selection.empty();//IE
                }
                var y = e.clientY;
                var down = y > dragManager.y;//是否向下移动
                var tr = document.elementFromPoint(e.clientX,e.clientY);
                if(tr && tr.nodeName == "TD"){
                    tr = tr.parentNode
                    dragManager.y = y;
                    if( handler !== tr){
                        tr.parentNode.insertBefore(handler, (down ? tr.nextSibling : tr));
                    }
                };
            }
        },
        dragStart:function(e){
            e = e || event;
            var handler = e.target || e.srcElement;
            if(handler.nodeName === "TD"){
                handler = handler.parentNode;
                dragManager.handler = handler;
                if(!handler.getAttribute("data-background")){
                    handler.setAttribute("data-background",getStyle(handler,"background-color"))
                }
                //显示为可移动的状态
                handler.style.backgroundColor = "lightgreen";
                handler.style.cursor = "move";
                dragManager.y = e.clientY;
            }
        },
        dragEnd:function(){
            var handler = dragManager.handler
            if (handler) {
                handler.style.backgroundColor = handler.getAttribute("data-background");
                handler.style.cursor = "default";
                dragManager.handler = null;
            }
        },
        main:function(el){
            addEvent(el,"mousedown",dragManager.dragStart);
            addEvent(document,"mousemove",dragManager.draging);
            addEvent(document,"mouseup",dragManager.dragEnd);

        }
    };

    var el = document.getElementById("table");
    dragManager.main(el);

};

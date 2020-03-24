/**
 * 上传附件
 */
layui.use(['layer','upload'], function(){
    var $ = layui.$,layer = layui.layer,upload = layui.upload;
    //
    var uploadTest1 //结业证书
        ,uploadTest2 //参会照片
        ,uploadTest3; //其他文件
    $(document).on('click','#upload',function(data){
        // alert(JSON.stringify(data));
        layer.open({
            title : '继续教育-附件'
            ,type : 1
            ,area : [ '900px', '450px' ]
            // ,area : '500px'//只想定义宽度时，你可以area: '500px'，高度仍然是自适应的
            ,offset : '50px'
            ,moveOut:true
            ,btn: ['关闭']
            ,shadeClose : true //点击遮罩关闭
            ,content : $('#uploadFileContainer')
            ,success: function(layero, index){
                $.get(requestUrl+"/getFileListByRelationCode.do" , {
                    "relationCode": $(" input[ name='code' ] ").val()
                } ,  function(data){
                    if(data.data.length>0){
                        $.each(data.data,function(index,file){
                            let imgDiv = '<div id="imgDiv_'+file.code+'" class="imgDiv">' +
                                '              <a href="javascript:void(0)"><img src="../../../layui/images/icon/delete.jpg" class="delete" /></a>\n' +
                                '              <img id="'+file.code+'" data-id="'+file.code+'" src="'+requestUrl+file.filePath +'" alt="继续教育-附件" style="width: 150px; margin:5px;">\n' +
                                '         </div>';
                            switch (file.fileType) {
                                case "jyzs":
                                    $('#demo1').append(imgDiv);
                                    break;
                                case "chzp":
                                    $('#demo2').append(imgDiv);
                                    break;
                                case "xdth":
                                    var tr = $(['<tr id="'+ file.code +'">'
                                        ,'<td>	<a href="javascript:void(0)">'+ file.fileName +'</a></td>'
                                        ,'<td>已上传</td>'
                                        ,'<td>' +
                                        '   <button class="layui-btn layui-btn-xs layui-btn-normal preview_fileInfo">预览</button>' +
                                        '   <button class="layui-btn layui-btn-xs layui-btn-danger demo-delete">删除</button>' +
                                        '</td>'
                                        ,'</tr>'].join(''));
                                    $('#xdthList').append(tr);
                                    //预览
                                    tr.find('a').on('click', function(){
                                        previewFileInfo(file);
                                    });
                                    tr.find('.preview_fileInfo').on('click', function(){
                                        previewFileInfo(file);
                                    });
                                    //删除
                                    tr.find('.demo-delete').on('click', function(){
                                        $.post(requestUrl+"/deleteFileInfo.do" , {
                                            "code": tr.attr("id")
                                        } ,  function(data){
                                            tr.remove();
                                        }, "json");
                                    });
                                    break;
                                case "qtwj":
                                    var tr = $(['<tr id="'+ file.code +'">'
                                        ,'<td>	<a href="javascript:void(0)">'+ file.fileName +'</a></td>'
                                        ,'<td>已上传</td>'
                                        ,'<td>' +
                                        '   <button class="layui-btn layui-btn-xs layui-btn-normal preview_fileInfo">预览</button>' +
                                        '   <button class="layui-btn layui-btn-xs layui-btn-danger demo-delete">删除</button>' +
                                        '</td>'
                                        ,'</tr>'].join(''));
                                    $('#demoList').append(tr);
                                    //预览
                                    tr.find('a').on('click', function(){
                                        previewFileInfo(file);
                                    });
                                    tr.find('.preview_fileInfo').on('click', function(){
                                        previewFileInfo(file);
                                    });
                                    //删除
                                    tr.find('.demo-delete').on('click', function(){
                                        $.post(requestUrl+"/deleteFileInfo.do" , {
                                            "code": tr.attr("id")
                                        } ,  function(data){
                                            tr.remove();
                                        }, "json");
                                    });
                                    break;
                            }
                            //
                            $("#imgDiv_"+file.code).mouseenter(function () {
                                $(this).find(".delete").show();
                            });
                            //
                            $("#imgDiv_"+file.code).mouseleave(function () {
                                $(this).find(".delete").hide();
                            });
                            //
                            $("#imgDiv_"+file.code).find("a").click(function (event) {
                                $.post(requestUrl+"/deleteFileInfo.do" , {
                                    "code": file.code
                                } ,  function(data){
                                    layer.msg(data.msg);
                                }, "json");
                                $(this).parent().remove();
                            });
                            //
                            $("#"+file.code).dblclick(function() {
                                previewFileInfo(file);
                            });
                        });
                    }
                }, "json");

//结业证书
                uploadTest1 = upload.render({
                    elem: '#test1' //指向容器选择器，如：elem: '#id'。也可以是DOM对象
                    ,url: requestUrl+'/uploadFileInfo.do' // 	服务端上传接口
                    ,data:{ //请求上传接口的额外参数。如：data: {id: 'xxx'}
                        "relationCode":function () {return $(" input[ name='code' ] ").val();}
                        ,"fileCategory":"JXYJ_JXJY" // 固定值
                        ,"fileType":"jyzs" // 固定值
                        ,"userId":function () {return $.cookie('userId');}
                        ,"userName":function () {return $.cookie('userName');}
                    }
                    ,field:"file" //设定文件域的字段名
                    ,accept:"file" //指定允许上传时校验的文件类型，可选值有：images（图片）、file（所有文件）、video（视频）、audio（音频）
                    ,exts:'jpg|png|gif|bmp|jpeg|pdf'
                    ,before: function(obj){
                        obj.preview(function(index, file, result){
                            let imgDiv = '<div id="imgDiv_'+index+'" class="imgDiv">' +
                                '              <a href="javascript:void(0)"><img src="../../../layui/images/icon/delete.jpg" class="delete" /></a>\n' +
                                '              <img src="'+result+'" style="width: 150px; margin:5px;">\n' +
                                '         </div>';
                            $('#demo1').append(imgDiv);
                        });
                    }
                    ,done: function(res, index, upload){ //执行上传请求后的回调。返回三个参数，分别为：res（服务端响应信息）、index（当前文件的索引）、upload（重新上传的方法，一般在文件上传失败后使用）
                        //
                        $("#imgDiv_"+index).mouseenter(function () {
                            $(this).find(".delete").show();
                        });
                        //
                        $("#imgDiv_"+index).mouseleave(function () {
                            $(this).find(".delete").hide();
                        });
                        //
                        $("#imgDiv_"+index).find("a").click(function (event) {
                            $.post(requestUrl+"/deleteFileInfo.do" , {
                                "code": res.data.code
                            } ,  function(result_data){
                                layer.msg(result_data.msg);
                            }, "json");
                            $(this).parent().remove();
                        });
                        //
                        $("#imgDiv_"+index).dblclick(function() {
                            previewFileInfo(res.data);
                        });
                        //
                        return layer.msg(res.msg);
                    }
                    ,error: function(){
                    }
                });

//参会照片
                var test2Files;
                uploadTest2=upload.render({
                    elem: '#test2'
                    ,url: requestUrl+'/uploadFileInfo.do' // 	服务端上传接口
                    ,data:{ //请求上传接口的额外参数。如：data: {id: 'xxx'}
                        "relationCode":function () { return $(" input[ name='code' ] ").val();}
                        ,"fileCategory":"JXYJ_JXJY" // 固定值
                        ,"fileType":"chzp" // 固定值
                        ,"userId":function () {
                            return $.cookie('userId');
                        }
                        ,"userName":function () {
                            return $.cookie('userName');
                        }
                    }
                    ,field:"file"
                    ,multiple: true
                    ,accept:"images"
                    ,acceptMime: 'image/*' //（只显示图片文件）
                    ,choose: function(obj){
                        test2Files = obj.pushFile();
                    }
                    ,before: function(obj){
                        layer.load();
                        obj.preview(function(index, file, result){
                            let imgDiv = '<div id="imgDiv_'+index+'" class="imgDiv">' +
                                '              <a href="javascript:void(0)"><img src="../../../layui/images/icon/delete.jpg" class="delete" /></a>\n' +
                                '              <img src="'+result+'" style="width: 150px; margin:5px;">\n' +
                                '         </div>';
                            $('#demo2').append(imgDiv);
                        });
                    }
                    ,done: function(res, index, upload){
                        layer.closeAll('loading');
                        //
                        $("#imgDiv_"+index).mouseenter(function () {
                            $(this).find(".delete").show();
                        });
                        //
                        $("#imgDiv_"+index).mouseleave(function () {
                            $(this).find(".delete").hide();
                        });
                        //
                        $("#imgDiv_"+index).find("a").click(function (event) {
                            $.post(requestUrl+"/deleteFileInfo.do" , {
                                "code": res.data.code
                            } ,  function(result_data){
                                layer.msg(result_data.msg);
                            }, "json");
                            $(this).parent().remove();
                        });
                        //
                        $("#imgDiv_"+index).dblclick(function() {
                            previewFileInfo(res.data);
                        });
                    }
                    ,allDone: function(obj){
                        layer.closeAll('loading');
                    }
                    ,error: function(index, upload){
                        layer.closeAll('loading');
                    }
                });

                //心得体会
                let xdthListView = $('#xdthList')
                    ,upload_xdth = upload.render({
                    elem: '#upload_xdth'
                    ,url: requestUrl+'/uploadFileInfo.do' // 	服务端上传接口
                    ,data:{ //请求上传接口的额外参数。如：data: {id: 'xxx'}
                        "relationCode":function () {
                            return $(" input[ name='code' ] ").val();
                        }
                        ,"fileCategory":"JXYJ_JXJY" // 固定值
                        ,"fileType":"xdth" // 固定值
                        ,"userId":function () {
                            return $.cookie('userId');
                        }
                        ,"userName":function () {
                            return $.cookie('userName');
                        }
                    }
                    ,field:"file" //设定文件域的字段名
                    ,multiple: true // 	是否允许多文件上传
                    ,accept: 'file'//指定允许上传时校验的文件类型，可选值有：images（图片）、file（所有文件）、video（视频）、audio（音频）
                    ,exts:'jpg|png|gif|bmp|jpeg|pdf'
                    ,choose: function(obj){
                        let files = this.files = obj.pushFile(); //将每次选择的文件追加到文件队列
                        //读取本地文件
                        obj.preview(function(index, file, result){
                            var tr = $(['<tr id="upload-'+ index +'">'
                                ,'<td>	<a href="javascript:void(0)">'+ file.name +'</a></td>'
                                ,'<td>待上传</td>'
                                ,'<td>' +
                                '   <button class="layui-btn layui-btn-xs layui-btn-normal preview_fileInfo">预览</button>' +
                                '   <button class="layui-btn layui-btn-xs layui-btn-danger demo-delete">删除</button>' +
                                '</td>'
                                ,'</tr>'].join(''));
                            xdthListView.append(tr);
                            //删除
                            tr.find('.demo-delete').on('click', function(){
                                $.post(requestUrl+"/deleteFileInfo.do" , {
                                    "code": $('#upload-'+index).attr("data-id")
                                } ,  function(data){
                                    delete files[index]; //删除对应的文件
                                    tr.remove();
                                    upload_xdth.config.elem.next()[0].value = '';
                                }, "json");
                            });
                        });
                    }
                    ,done: function(res, index, upload){
                        if(res.code == 200){ //上传成功
                            let tr = xdthListView.find('tr#upload-'+ index)
                                ,tds = tr.children();
                            tr.attr("data-id",res.data.code);//
                            tds.eq(1).html('<span style="color: #5FB878;">已上传</span>');
                            // tds.eq(3).html(''); //清空操作

                            //预览
                            let fileInfo = res.data;
                            tr.find('a').on('click', function(){
                                previewFileInfo(fileInfo);
                            });
                            tr.find('.preview_fileInfo').on('click', function(){
                                previewFileInfo(fileInfo);
                            });

                            return delete this.files[index]; //删除文件队列已经上传成功的文件
                        }
                        this.error(index, upload);
                    }
                    ,error: function(index, upload){
                        let tr = xdthListView.find('tr#upload-'+ index)
                            ,tds = tr.children();
                        tds.eq(2).html('<span style="color: #FF5722;">上传失败</span>');
                        // tds.eq(3).find('.demo-reload').removeClass('layui-hide'); //显示重传
                    }
                });
                //其他文件
                var demoListView = $('#demoList')
                    ,uploadListIns = upload.render({
                    elem: '#testList'
                    ,url: requestUrl+'/uploadFileInfo.do' // 	服务端上传接口
                    ,data:{ //请求上传接口的额外参数。如：data: {id: 'xxx'}
                        "relationCode":function () {
                            return $(" input[ name='code' ] ").val();
                        }
                        ,"fileCategory":"JXYJ_JXJY" // 固定值
                        ,"fileType":"qtwj" // 固定值
                        ,"userId":function () {
                            return $.cookie('userId');
                        }
                        ,"userName":function () {
                            return $.cookie('userName');
                        }
                    }
                    ,field:"file" //设定文件域的字段名
                    ,multiple: true // 	是否允许多文件上传
                    ,accept: 'file'//指定允许上传时校验的文件类型，可选值有：images（图片）、file（所有文件）、video（视频）、audio（音频）
                    ,exts:'jpg|png|gif|bmp|jpeg|pdf'
                    // ,auto: false //是否选完文件后自动上传。如果设定 false，那么需要设置 bindAction 参数来指向一个其它按钮提交上传
                    // ,bindAction: '#testListAction' //指向一个按钮触发上传，一般配合 auto: false 来使用。值为选择器或DOM对象，如：bindAction: '#btn'
                    ,choose: function(obj){
                        var files = this.files = obj.pushFile(); //将每次选择的文件追加到文件队列
                        //读取本地文件
                        obj.preview(function(index, file, result){
                            // alert(JSON.stringify(file));
                            var tr = $(['<tr id="upload-'+ index +'">'
                                ,'<td>	<a href="javascript:void(0)">'+ file.name +'</a></td>'
                                ,'<td>待上传</td>'
                                ,'<td>' +
                                '   <button class="layui-btn layui-btn-xs layui-btn-normal preview_fileInfo">预览</button>' +
                                '   <button class="layui-btn layui-btn-xs layui-btn-danger demo-delete">删除</button>' +
                                '</td>'
                                ,'</tr>'].join(''));
                            demoListView.append(tr);
                            //删除
                            tr.find('.demo-delete').on('click', function(){
                                $.post(requestUrl+"/deleteFileInfo.do" , {
                                    "code": $('#upload-'+index).attr("data-id")
                                } ,  function(data){
                                    // layer.msg(data.msg);
                                    delete files[index]; //删除对应的文件
                                    tr.remove();
                                    uploadListIns.config.elem.next()[0].value = ''; //清空 input file 值，以免删除后出现同名文件不可选
                                }, "json");
                            });
                        });
                    }
                    ,done: function(res, index, upload){
                        // alert(JSON.stringify(res));
                        if(res.code == 200){ //上传成功
                            var tr = demoListView.find('tr#upload-'+ index)
                                ,tds = tr.children();
                            tr.attr("data-id",res.data.code);//
                            tds.eq(1).html('<span style="color: #5FB878;">已上传</span>');
                            // tds.eq(3).html(''); //清空操作

                            //预览
                            let fileInfo = res.data;
                            tr.find('a').on('click', function(){
                                previewFileInfo(fileInfo);
                            });
                            tr.find('.preview_fileInfo').on('click', function(){
                                previewFileInfo(fileInfo);
                            });

                            return delete this.files[index]; //删除文件队列已经上传成功的文件
                        }
                        this.error(index, upload);
                    }
                    ,error: function(index, upload){
                        var tr = demoListView.find('tr#upload-'+ index)
                            ,tds = tr.children();
                        tds.eq(2).html('<span style="color: #FF5722;">上传失败</span>');
                        // tds.eq(3).find('.demo-reload').removeClass('layui-hide'); //显示重传
                    }
                });
            },end:function () {
                $("#demo1").empty();
                $("#demo2").empty();
                $("#demo3").empty();
            }
        });
    });
});

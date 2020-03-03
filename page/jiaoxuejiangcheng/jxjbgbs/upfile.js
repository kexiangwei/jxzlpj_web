/**
 * 上传附件
 */
layui.use(['layer','upload'], function(){
    var $ = layui.$,layer = layui.layer,upload = layui.upload;
    //
    $('#upfile').click(function(){
        layer.open({
            title : '教学奖惩-教学基本功比赛-上传附件'
            ,type : 1
            ,area : [ '700px', '300px' ]
            ,offset : '100px'
            ,moveOut:true
            ,shadeClose : true //点击遮罩关闭
            ,btn: ['关闭']
            ,content : $('#uploadFile_container')
            ,success: function(layero, index){
                let upfileList = $('#upfileList');
                $.get(requestUrl+"/getFileListByRelationCode.do" , {
                    "relationCode": $("#editForm input[ name='code' ] ").val()
                } ,  function(data){
                    if(data.data.length > 0){
                        //
                        upfileList.empty();
                        //
                        $.each(data.data,function(index,fileInfo){
                            let tr = $(['<tr id="'+ fileInfo.code +'">'
                                ,'<td style="text-align: center;">	<a href="javascript:void(0)">'+ fileInfo.fileName +'</a></td>'
                                ,'<td style="text-align: center;">已上传</td>'
                                ,'<td style="text-align: center;">' +
                                '   <button class="layui-btn layui-btn-xs layui-btn-normal upfile_preview">预览</button>' +
                                '   <button class="layui-btn layui-btn-xs layui-btn-danger upfile_delete">删除</button>' +
                                '</td>'
                                ,'</tr>'].join(''));
                            upfileList.append(tr);
                            //预览
                            tr.find('a').on('click', function(){//点击文件名
                                preview_fileInfo(fileInfo);
                            });
                            tr.find('.upfile_preview').on('click', function(){//点击预览按钮
                                preview_fileInfo(fileInfo);
                            });
                            //删除
                            tr.find('.upfile_delete').on('click', function(){
                                $.post(requestUrl+"/deleteFileInfo.do" , {
                                    "code": tr.attr("id")
                                } ,  function(data){
                                    tr.remove();
                                }, "json");
                            });
                        });
                    }
                }, "json");
                //上传附件
                let upfileIns = upload.render({
                    elem: '#upfileIns'
                    ,url: requestUrl+'/uploadFileInfo.do' // 	服务端上传接口
                    ,data:{ //请求上传接口的额外参数。如：data: {id: 'xxx'}
                        "relationCode":function () {
                            return $("#editForm input[ name='code' ] ").val();
                        }
                        ,"fileCategory":"jxjc_jxjbgbs" // 固定值
                        ,"fileType":"附件" // 固定值
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
                    ,exts:'pdf'
                    ,choose: function(obj){
                        $('#noData').empty();
                        let files = this.files = obj.pushFile(); //将每次选择的文件追加到文件队列
                        //读取本地文件
                        obj.preview(function(index, file, result){
                            let tr = $(['<tr id="upfile_'+ index +'">'
                                ,'<td style="text-align: center;">	<a href="javascript:void(0)">'+ file.name +'</a></td>'
                                ,'<td style="text-align: center;">正在上传</td>'
                                ,'<td style="text-align: center;">'
                                // ,'<button class="layui-btn layui-btn-xs demo-reload layui-hide">重传</button>'
                                ,'<button class="layui-btn layui-btn-xs layui-btn-normal upfile_preview">预览</button>' +
                                '<button class="layui-btn layui-btn-xs layui-btn-danger upfile_delete">删除</button>'
                                ,'</td>'
                                ,'</tr>'].join(''));
                            upfileList.append(tr);

                            //删除
                            tr.find('.upfile_delete').on('click', function(){
                                $.post(requestUrl+"/deleteFileInfo.do" , {
                                    "code": $('#upfile_'+index).attr("data-id")
                                } ,  function(data){
                                    // layer.msg(data.msg);
                                    delete files[index]; //删除对应的文件
                                    tr.remove();
                                    upfileIns.config.elem.next()[0].value = ''; //清空 input file 值，以免删除后出现同名文件不可选
                                }, "json");
                            });
                        });
                    }
                    ,done: function(res, index, upload){
                        if(res.code == 200){ //上传成功
                            let tr = upfileList.find('tr#upfile_'+ index)
                                ,tds = tr.children();
                            tr.attr("data-id",res.data.code);//
                            tds.eq(1).html('<span style="color: #5FB878;">已上传</span>');
                            // tds.eq(2).html(''); //清空操作

                            //预览
                            let fileInfo = res.data;
                            tr.find('a').on('click', function(){//点击文件名
                                preview_fileInfo(fileInfo);
                            });
                            tr.find('.upfile_preview').on('click', function(){//点击预览按钮
                                preview_fileInfo(fileInfo);
                            });
                            //
                            return delete this.files[index]; //删除文件队列已经上传成功的文件
                        }
                        this.error(index, upload);
                    }
                    ,error: function(index, upload){
                        let tr = upfileList.find('tr#upfile_'+ index)
                            ,tds = tr.children();
                        tds.eq(1).html('<span style="color: #FF5722;">上传失败</span>');
                    }
                });
            },end:function () {
                $("#upfileList").empty();
            }
        });
    });
});

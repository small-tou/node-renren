node-renren
===========

nodejs版人人网oauth认证和api sdk

开发中，不可用，可用后会删除此警告

#特色

* 对接口分组。
* 无需关心scope，传入你要使用的接口分组，自动生成scope。
* 集成oauth2.0认证
* 错误处理
* 规范的代码
* 支持图片上传


#人人网api说明：

http://wiki.dev.renren.com/wiki/API

#参与者致谢：

https://github.com/willerce

#示例：

```

 var config = {
        app_key:"99754adae54e49bc826da1144ad2659d",
        app_secret:"ddf05a79792a4a0aac6cfb42755e25c9",
        redirect_uri:"http://localhost:8080/sina_auth_cb",
        api_group: ["blog","photos"],
        access_token:req.cookies.token
    }
var api = new RenRen(config);
//发送一篇日志
api.blog.addBlog({
        title:("hello nodejs !"),
        content:"this blog is create by nodejs :https://github.com/xinyu198736/node-renren",
        access_token:(req.cookies.token)
    }, function (error,data) {
        console.log(data); //人人网的api错误信息不统一，不能统一处理，这里只是返回一个字符串，自己处理。
    });
//获取两个好友的共同好友并发送一条状态
api.friends.getSameFriends({
        uid1:83838506,
        uid2:230901848,
        fields:"uid,name",
        access_token:(req.cookies.token)
    }, function (error,data) {
        console.log(data);
        var data = JSON.parse(data);
        var text="系统判断，我和@孙歌(230901848) 的共同好友有："
        data.friends.forEach(function(person){
            text+="@"+person.name+"("+person.uid+")"+" ";
        })
        api.status.set({
            status:text,
            access_token:(req.cookies.token)
        })
    }); 
//上传一个照片
api.photos.upload({
        upload:path.join(__dirname, "/test.jpg"),
        caption:"upload by nodejs"
    },function(error,data){
        console.log(data)
    })
```
var RenRen = require("../lib/index.js");

var config = {
    app_key:"99754adae54e49bc826da1144ad2659d",
    app_secret:"ddf05a79792a4a0aac6cfb42755e25c9",
    redirect_uri:"http://localhost:8080/sina_auth_cb",
    api_group: ["blog",""]
}

var app_auth = {
    auth:function (req, res) {
        var api = new RenRen(config);
        var auth_url = api.oauth.authorize();
        res.redirect(auth_url);
        res.end();
    },
    sina_auth_cb:function (req, res) {
        var code = req.query.code;
        var api = new RenRen(config);
        api.oauth.accesstoken(code, function (data) {
            res.cookie("token", data.access_token);
            res.redirect('oauth');
            res.end();
        })

    }
}
//import some libs 
var express = require('express');
var cons = require('consolidate');
//init express app
var app = express();
app.use(express.logger({
    format:':method :url :status'
}));
//设置文件上传临时文件夹
app.use(express.bodyParser({
    uploadDir:'./uploads'
}));
app.use(express.cookieParser());
app.use(express.session({
    secret:'yutou'
}));
app.use(app.router);
app.use(express.errorHandler({
    dumpExceptions:true,
    showStack:true
}));
app.error = function (err, req, res) {
    console.log("500:" + err + " file:" + req.url)
    res.render('500');
}
//设置模板引擎为mustache，这里使用了consolidate库
app.engine("html", cons.mustache);
//设置模板路径
app.set('views', __dirname + '/views');
app.set('view engine', 'html');
app.set('view options', {
    layout:false
})
app.listen("8080")
//获取authorize url
app.get("/auth", app_auth.auth)
//获取accesstoken ,存储，并设置userid到cookie
app.get("/sina_auth_cb", app_auth.sina_auth_cb)
//中间页面，提醒用户认证成功
app.get('/oauth', function (req, res) {
    var api = new RenRen(config);
//    api.blog.addBlog({
//        title:("hello nodejs !"),
//        content:"this blog is create by nodejs :https://github.com/xinyu198736/node-renren",
//        access_token:(req.cookies.token)
//    }, function (data) {
//        console.log(data);
//        var body = JSON.parse(data);
//        res.render('oauth.html');
//    });
    
 api.friends.getSameFriends({
        uid1:83838506,
        uid2:230901848,
        fields:"uid,name",
        access_token:(req.cookies.token)
    }, function (data) {
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
        res.render('oauth.html');
    });
});


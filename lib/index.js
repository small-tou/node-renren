var  querystring  =  require ( 'querystring' );
var  https  =  require ( 'https' );
var path = require("path");
var fs = require('fs');
var underscore = require("underscore");
var urllib = require("urllib");
var md5 = require("MD5");
var request = require('request');
var RenRen = function (options) {
    this.options = {
        app_key: null,
        app_secret: null,
        access_token: null,
        user_id: 0,
        refresh_token: null,
        format: "JSON",
        redirect_uri: "",
        scope: ""
    };
    underscore.extend(this.options, options);
    this.base = this._base();
    this.oauth = this._oauth();
    this.status = this._status();
};
RenRen.prototype = {
    API_BASE_URL : 'http://api.renren.com/restserver.do',
    API_HOST : 'api.renren.com',
    API_URI_PREFIX : '/restserver.do'
};
RenRen.prototype._base = function(){
    var self = this;
    return {
        _post: function (options, callback) {
            if (self.options.access_token) {
                options['access_token'] = self.options.access_token;
            }
            options['format'] = "JSON";
            options['v'] = "1.0";
          //  options['api_key'] = self.options.app_key;
            var keys = [], sig = "";
            for (var i in options) {
                keys.push(i);
            }
            keys.sort();
            keys.forEach( function(k) {
                sig += k + "=" + options[k]
            })
            sig += self.options.app_secret;
            options['sig'] = md5(sig);
            console.log(options)
            var post_body = querystring.stringify(options);
            post_body = post_body.replace(/__multi__/g,"");
            console.log(post_body)
//           var headers = {};
//            headers [ "Content-length" ] = post_body ? post_body.length : 0 ;
//            headers [ "Content-Type" ] = 'application/x-www-form-urlencoded;charset=UTF-8';
//            var opts = {
//                host: self.API_HOST,
//                path: self.API_URI_PREFIX,
//                method: 'POST',
//                headers: headers 
//            };
//                urllib.request("http://"+self.API_HOST +self.API_URI_PREFIX, {
//                    type:"POST",
//                    data:options
//                }, function(err, data, res) {
//                    console.log(data.toString())
//                });
   //       self.base._request(opts, post_body, callback);
   request.post({url:self.API_BASE_URL, body:post_body,encoding:"utf8"}, function (e, r, body) {
       console.log(body)
   })
        },
        _get: function (options, callback) {
            if (self.options.access_token) {
                options['access_token'] = self.options.access_token;
            }
            options['format'] = "JSON";
            var opts = {
                host: self.API_HOST,
                path: self.API_URI_PREFIX  + '?' + querystring.stringify(options),
                method: 'GET' 
            };
            self._request(opts, null, callback);
        },
        _request: function(options,  post_body,  callback){
            var data = '';
            var req = https.request(options, function (res) {
                var chunks = [], size = 0;
                res.on('data', function (chunk) {
                    size += chunk.length;
                    chunks.push(chunk);
                });
                res.on('end', function () {
                    var data = null;
                    switch (chunks.length) {
                        case 0:
                            data = new Buffer(0); 
                            break;
                        case 1:
                            data = chunks[0]; 
                            break;
                        default:
                            data = new Buffer(size);
                            for (var i = 0, pos = 0, l = chunks.length; i < l; i++) {
                                chunks[i].copy(data, pos);
                                pos += chunks[i].length;
                            }
                            break;
                    }
                    callback(JSON.parse(data.toString()));
                });
            });
         //   req.write(post_body);
            req.on('error', callback);
            req.end(post_body);
        }
    }
};
RenRen.prototype._oauth = function () {
    var self=this;
    return {
        //生成authorize url
        authorize: function () {
            var options = {
                client_id: self.options.app_key,
                response_type: "code",
                redirect_uri: self.options.redirect_uri,
                scope: self.options.scope
            };
            return  'https://graph.renren.com/oauth/authorize?' + querystring.stringify(options);
        },
        //用code换取accesstoken
        accesstoken: function(code,callback){
            var options={
                grant_type: "authorization_code",
                code: code,
                client_id: self.options.app_key,
                client_secret: self.options.app_secret,
                redirect_uri: self.options.redirect_uri
            };
            /**
             * {
    "access_token": "10000|5.a6b7dbd428f731035f771b8d15063f61.86400.1292922000-222209506",
    "expires_in": 87063,
    "refresh_token": "10000|0.385d55f8615fdfd9edb7c4b5ebdc3e39-222209506",
    "scope": "read_user_album read_user_feed"
}
             */
            var post_body = querystring.stringify(options);
            var headers = {};
            headers ["Content-length"] = post_body ? post_body.length : 0;
            headers ["Content-Type"] = 'application/x-www-form-urlencoded';
            var opts = {
                host: "graph.renren.com",
                path: '/oauth/token',
                method  : 'POST',
                headers : headers 
            };    
            self.base._request(opts, post_body, callback);
        }
    }
};

RenRen.prototype._status = function () {
    var methods=["set", "addComment", "forward", "get", "gets", "getComment", "getEmoticons"];
    var status = {};
    var self = this;
    methods.forEach( function (m) {
        status[m] = function (options, callback) {
            options.method = "status."+m;
            self.base._post(options, callback);
        }
    })
    return status;
};
exports = module.exports=RenRen;

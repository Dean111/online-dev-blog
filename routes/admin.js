var express = require('express');
var router = express.Router();
var userInfoModel = require('../models/userInfo');
var checkLogin = require('../middlewares/check').checkLogin;
var PostModel = require('../models/posts');
var DirectoryModel = require('../models/directory');
var PictureModel = require('../models/picture');
var RecmandModel = require('../models/recomendArticle');
var checkLogin = require('../middlewares/check').checkLogin;
//var ccap = require('ccap');
var co = require('co');
var async = require('async');
var moment = require('moment');
//初始化页面
router.get('/',checkLogin,function(req, res, next) {
    res.render('admin');
});
//进入添加文章页面
router.get('/addInfo',checkLogin, function(req, res, next) {
    var articleId = req.query.articleId;
    var update = req.query.updateSuccess;//判断该参数是否是从更新文章的方法传递过来的
    if (!articleId) {
        DirectoryModel.getAllDirectory()
            .then(function(result){
                res.render('addInfo',{dirs:result});
            });
    }else {
        PostModel.getPostById(articleId).then(
            function(result) {
                if (!result) {
                    throw new Error('当前文章不存在')
                    res.render('addInfo');
                }else {
                    var specPost = result;
                    console.log('当前获取的内容是:'+result);
                    if (!update) {
                        res.render('addInfo',{post:specPost});
                    }else {
                        res.render('addInfo',{post:specPost,success:'文章更新成功'});
                    }
                }
            }
        )
    }
}).post('/addInfo',function (req,res,next) {
    var title = req.fields.articleTitle;
    var content = req.fields.articleContent;
    var picLink = req.fields.picLink;
    var dirId = req.fields.dirId;
    var date = new Date();
    var author = "585b9b46a6e9f41c747726ad";
    try {
        if (!title.length) {
            throw new Error('标题不能为空');
        }
        if (!content.length) {
            throw new Error('文章内容不能为空');
        }
        if (!picLink.length) {
            throw new Error('文章小图片链接不能为空');
        }
        if (!dirId.length) {
            throw new Error('文章所属目录不能为空');
        }
    } catch (e) {
        req.flash('error',e.massage);
        return res.redirect('back');
    }
    var post = {
        title:title,
        content:content,
        pv:0,
        author:author,
        picLink:picLink,
        createTime:date,
        dir:dirId
    }
    PostModel.create(post)
    .then(function (result) {
        userInfo = result;
        req.flash('success', '发表成功');
        // 发表成功后跳转到该文章页
        res.redirect('/posts');
    })
    .catch(next);
})


router.post('/updateArticle',checkLogin,function (req,res,next) {
    var id = req.fields.contentId;
    var picLink = req.fields.picLink;
    var title = req.fields.articleTitle;
    var content = req.fields.articleContent;
    try {
        if (!id) {
            throw new Error('没有获取到id')
        }
    } catch (e) {
        req.flash('error',e.message);
        res.redirect('back');
    }
    var post = {
        title:title,
        picLink:picLink,
        content:content,
        author:'585b9b46a6e9f41c747726ad'
    }
    console.log(post);
    PostModel.updatePostByIdAdmin(id,post).then(
        function(result){
            console.log(result[0]);
        }
    )
    res.redirect('/admin/addInfo?articleId='+id+'&updateSuccess=true');
    /*async.series({
        update:,
        getAll:PostModel.getPostById(id).then(function (result) {
            res.render('addInfo',{success:'更新成功',post:result})
        })
    },function (error,result) {

    })

    PostModel.updatePostByIdAdmin(id,post).then(
        function(result){
            console.log(result);
        }
    ).then(
        PostModel.getPostById(id).then(function (result) {
            res.render('addInfo',{success:'更新成功',post:result})
        })
    )*/
})



//文章列表管理页面
router.get('/articles', checkLogin,function(req, res, next) {
    res.render('admin_article');
});
//异步请求文章列表方法
router.get('/articlesByPage',checkLogin,function (req,res,next) {
    console.log('进入请求分页的方法');
    var start = req.query.start||0;
    var limit = req.query.limit||10;
    console.log('start:'+start);
    console.log('limit:'+limit);
    try {
      if (!start) {
          throw new Error('分页start必传');
      }
      if (!limit) {
          throw new Error('分页limit必传');
      }
    } catch (e) {
        req.flash('error',e.message);
        res.redirect('/posts');
    }
    Promise.all([
        PostModel.getPostPagersNum(),
        PostModel.pagerPost(start,limit)
      ]).then(function (result) {
          var totalCounts = result[0];
          var pagerPosts = result[1];
          /*res.render('posts', {
                posts: posts,
                info: info,
                picture:picture,
                recomends:recomends
            });*/
          res.json({"success":true,"totalCounts":totalCounts,"result":pagerPosts});
        }).catch(next);
})

router.get('/login',checkLogin,function (req,res,next) {
    res.render('admin_login');
})


/*router.get('/codeCreate',function (req,res,next) {
    if(req.url == '/favicon.ico')return res.end('');//Intercept request favicon.ico
    try {
        var captcha =  ccap();
        var ary =  captcha.get();//ary[0] is captcha's text,ary[1] is captcha picture buffer.
        var txt = ary[0];
        var buf = ary[1];
        res.end(buf);
    } catch (e) {
        console.log('错误信息是:'+e.message);
    }
})*/



//推荐文章列表管理界面
router.get('/recmand',checkLogin,function (req,res,next) {
    res.render('recmand');
});

//推荐文章列表管理界面
router.post('/recmand',checkLogin,function (req,res,next) {
    var title = req.fields.title;
    var link = req.fields.link;
    var isTop = req.fields.isTop||'off';
    console.log('推荐文章内容为：'+title+link+isTop);
    try {
        if (!title.length) {
            throw new Error('文章内容不能为空');
        }
        if (!link.length) {
            throw new Error('文章链接不能为空');
        }
    } catch (e) {
        req.flash('error',e.message);
        res.redirect('back');
    }
    var recmand = {
        title:title,
        link:link,
        isTop:isTop
    }
    RecmandModel.addArticle(recmand)
        .then(function (result) {
            res.render('recmand',{recmand:result,success:'发布成功'});
        }).catch(next);

});






//网站图片管理
router.get('/picture',checkLogin,function (req,res,next) {
    res.render('picture');
}).post('/picture',function (req,res,next) {
    var title = req.fields.title;
    var link = req.fields.link;
    try {
        if (!title.length) {
            throw new Error('图片标题不能为空');
        }
        if (!link.length) {
            throw new Error('图片链接不能为空')
        }
    } catch (e) {
        req.flash('error',e.massage);
        return res.redirect('back');
    }

    var pic = {
        title:title,
        link:link
    }

    PictureModel.create(pic)
        .then(function (result) {
            //res.render('posts',{picture:result});
            res.redirect('/posts');
        }).catch(next);
})




//设置个人信息的页面
router.get('/personInfo', checkLogin,function(req, res, next) {
    userInfoModel.getUserInfos()
        .then(function (info) {
            if (!info) {
                throw new Error('用户信息不存在');
            }
            var info = info[0];
            var session = req.session;
            if (session.change!==null) {

                console.log('1111111111');
                if (session.change=="changesuccess") {
                    console.log('44444444444444444');
                    session.change = null;
                    res.render('personInfo',{info:info,success:'修改成功'});
                }else if (session.change=="changefail"){
                    console.log('222222222222222');
                    session.change = null;
                    res.render('personInfo',{info:info,error:'修改失败'});
                }else {
                    res.render('personInfo',{info:info});
                }
            }else{
                console.log('33333333333333');
                res.render('personInfo',{info:info});
            }
        }).catch(next);
});

//修改个人信息方法
router.post('/edit',checkLogin,function (req,res,next) {
    var id = req.fields.infoId;
    var nickname = req.fields.nickname;
    var job = req.fields.job;
    var contact=req.fields.contact;
    var email = req.fields.email;
    try {
        if (!nickname.length) {
            throw new Error('请填写网名');
        }
        if (!job.length) {
            throw new Error('请填写工作信息');
        }
        if (!contact.length) {
            throw new Error('请填写联系方式');
        }
        if (!email.length) {
            throw new Error('请填写email');
        }
    } catch (e) {
        req.flash('error',e.massage);
        return res.redirect('back');
    }
    var userInfo = {
        nickname:nickname,
        job:job,
        contact:contact,
        email:email
    }
    userInfoModel.updateUserInfoById(id,userInfo)
        .then(function (result) {
            var session = req.session;
            console.log('修改返回的结果是：'+result.toString().substring(6, 7));
            var code = result.toString().substring(6, 7);
            if(code==1){
                console.log('修改I成功');
                req.flash('success', '修改成功');
                session.change = "changesuccess";
            }else {
                console.log('修改I失败');
                req.flash('success', '修改失败');
                session.change = "changefail";
            }
            var userInfo;
            // 发表成功后跳转到该文章页
            /*res.render('personInfo',{
                success:'修改成功'
            });*/
            res.redirect('/admin/personInfo');
        })
        .catch(next);
})
//添加个人信息
router.post('/personInfo',checkLogin,function (req,res,next) {
    var author = 'admin';
    var nickname = req.fields.nickname;
    var job = req.fields.job;
    var contact=req.fields.contact;
    var email = req.fields.email;
    try {
        if (!nickname.length) {
            throw new Error('请填写网名');
        }
        if (!job.length) {
            throw new Error('请填写工作信息');
        }
        if (!contact.length) {
            throw new Error('请填写联系方式');
        }
        if (!email.length) {
            throw new Error('请填写email');
        }
    } catch (e) {
        req.flash('error',e.massage);
        return res.redirect('back');
    }

    var useInfo = {
        nickname:nickname,
        job:job,
        contact:contact,
        email:email
    }

    userInfoModel.create(useInfo)
        .then(function (result) {
            userInfo = result.ops[0];
            req.flash('success', '发表成功');
            // 发表成功后跳转到该文章页
            res.redirect('/posts');
        })
        .catch(next);
})

module.exports = router;

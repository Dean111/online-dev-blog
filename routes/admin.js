var express = require('express');
var router = express.Router();
var userInfoModel = require('../models/userInfo');
var checkLogin = require('../middlewares/check').checkLogin;
var PostModel = require('../models/posts');
var PictureModel = require('../models/picture');
var RecmandModel = require('../models/recomendArticle');
//初始化页面
router.get('/', function(req, res, next) {
    res.render('admin');
});


//进入添加文章页面
router.get('/addInfo', function(req, res, next) {
    res.render('addInfo');
}).post('/addInfo',function (req,res,next) {
    var title = req.fields.articleTitle;
    var content = req.fields.articleContent;
    var picLink = req.fields.picLink;
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
    } catch (e) {
        req.flash('error',e.massage);
        return res.redirect('back');
    }
    var post = {
        title:title,
        content:content,
        pv:0,
        author:author,
        picLink:picLink
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

//文章列表管理页面
router.get('/articles', function(req, res, next) {
    res.render('admin_article');
});

//推荐文章列表管理界面
router.get('/recmand',function (req,res,next) {
    res.render('recmand');
});

//推荐文章列表管理界面
router.post('/recmand',function (req,res,next) {
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
router.get('/picture',function (req,res,next) {
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
router.get('/personInfo', function(req, res, next) {
    userInfoModel.getUserInfos()
        .then(function (info) {
            if (!info) {
                throw new Error('用户信息不存在');
            }
            var info = info[0];
            var session = req.session;
            if (session.change!==null) {
                if (session.change=="changesuccess") {
                    session.change = null;
                    res.render('personInfo',{info:info,success:'修改成功'});
                }else if (session.change=="changefail"){
                    session.change = null;
                    res.render('personInfo',{info:info,error:'修改失败'});
                }
            }else{
                res.render('personInfo',{info:info});
            }
        }).catch(next);
});

//修改个人信息方法
router.post('/edit',function (req,res,next) {
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
router.post('/personInfo',function (req,res,next) {
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

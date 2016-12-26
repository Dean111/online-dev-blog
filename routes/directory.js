var express = require('express');
var router = express.Router();
var PostModel = require('../models/posts');
var UserInfo = require('../models/userInfo');
var checkLogin = require('../middlewares/check').checkLogin;
var DirectoryModel = require('../models/directory');

router.get('/',checkLogin,function (req,res,next) {
    res.render('directory');
});

router.post('/',checkLogin,function (req,res,next) {
    var title = req.fields.dirTitle;
    var dirMark = req.fields.dirMark;
    var href = req.fields.hrefVal;
    try {
       if (!title) {
           throw new Error('请输入目录标题');
       }
       if (!dirMark) {
           throw new Error('请输入目录备注');
       }
    } catch (e) {
        req.flash('error',e.message);
        res.redirect('back');
    }
    var directory = {
        title:title,
        mark:dirMark,
        href:href
    }
    DirectoryModel.create(directory)
        .then(function(result) {
            res.render('directory',{directory:result,success:'添加目录成功'});
        }
    )
});
module.exports = router;

var express = require('express');
var router = express.Router();
var PostModel = require('../models/posts');
var UserInfo = require('../models/userInfo');
var checkLogin = require('../middlewares/check').checkLogin;
var CommentModel = require('../models/comments');
var PictureModel = require('../models/picture');
var RecmandModel = require('../models/recomendArticle');
var DirectoryModel = require('../models/directory');
var SpiderModel = require('../models/spider');
//获取的是公共的信息
router.get('/',function (req,res,next) {
    try {
        var dirName = req.query.dirName;
        if(!dirName){
            throw new Error('目录路径不存在');
        }
    } catch (e) {
        req.flash('error',e.message);
        res.redirect('back');
    }
    Promise.all([
        UserInfo.getUserInfos(),
        PictureModel.getAllPicture(),
        RecmandModel.getAllArticle(),
        DirectoryModel.getAllDirectory(),
        DirectoryModel.getDirectoryById(dirName),
        PostModel.getPostById(dirName),
        SpiderModel.getAllspiders()
    ]).then(function (result) {
        var info = result[0][0];
        var picture = result[1][0];
        var recomends = result[2];
        var directories = result[3];
        var currDir = result[4];
        var spiders = result[6];
        if (!info) {
            throw new Error('名片信息不存在');
        }
        if (!picture) {
            throw new Error('图片信息不存在');
        }
        if (!recomends) {
            throw new Error('推荐文章不存在');
        }
        res.render('articleList',{
            info: info,
            picture:picture,
            recomends:recomends,
            dirss:directories,
            dirName:dirName,
            currDir:currDir||'',
            spiders:spiders
        })
    }).catch(next);
})
//获取文章的分页列表
router.get('/articleByPager',function(req,res,next){
    var id = req.query.dirName;
    var start = req.query.start;
    var limit = req.query.limit;
    try{
        if(!id){
            throw new Error('目录路径不存在');
        }
    } catch (e) {
        req.flash('error',e.message);
        res.redirect('back');
    }
    console.log('进入后台post查询方法');
    Promise.all([
        PostModel.getPostByDirId(id,start,limit),
        PostModel.getPostCountByDir(id)
    ]).then(function(result){
        var post = result[0];
        var totalCounts = result[1];
        console.log({"success":true,"totalCounts":totalCounts,"result":post});
        res.json({"success":true,"totalCounts":totalCounts.length,"result":post});
    }).catch(next);
})
module.exports = router;

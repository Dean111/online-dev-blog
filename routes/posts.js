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
//GET /posts所有用户的或特定用户的文章页面
//eg:GET /posts?author=xxx
router.get('/',checkLogin,function (req,res,next) {
    Promise.all([
        UserInfo.getUserInfos(),
        PictureModel.getAllPicture(),
        RecmandModel.getAllArticle(),
        PostModel.getPostPagersNum(),
        PostModel.getAllPosts(),
        DirectoryModel.getAllDirectory(),
        SpiderModel.getAllspiders()
      ]).then(function (result) {
          var info = result[0][0];
          var picture = result[1][0];
          var recomends = result[2];
          var totalCounts = result[3];
          var directories = result[5];
          var spiders = result[6];
          console.log('spider:'+spiders);
          if (!info) {
              throw new Error('名片信息不存在');
          }
          if (!picture) {
              throw new Error('图片信息不存在');
          }
          if (!recomends) {
              throw new Error('推荐文章不存在');
          }
      res.render('posts', {
            //posts: posts,
            info: info,
            picture:picture,
            recomends:recomends,
            dirss:directories,
            dirName:'',
            spiders:spiders
        });
        //res.end({success:true,totalCounts:totalCounts,result:posts});
        }).catch(next);

});


router.get('/pager',checkLogin, function(req, res, next) {
  console.log('进入请求分页的方法');
  var obj = PostModel.getPostPagersNum();
  obj.then(function (result) {
    console.log('当前的条数是:'+result);
  });
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
      UserInfo.getUserInfos(),
      PostModel.getAllPosts(),
      PictureModel.getAllPicture(),
      RecmandModel.getAllArticle(),
      PostModel.getPostPagersNum(),
      PostModel.getAllPosts(),
      PostModel.pagerPost(start,limit)
    ]).then(function (result) {
        var info = result[0][0];
        var posts = result[1];
        var picture = result[2][0];
        var recomends = result[3];
        var totalCounts = result[4];
        var pagerPosts = result[6];
        if (!posts) {
          throw new Error('该文章不存在');
        }
        if (!info) {
            throw new Error('名片信息不存在');
        }
        if (!picture) {
            throw new Error('图片信息不存在');
        }
        if (!recomends) {
            throw new Error('推荐文章不存在');
        }
        /*res.render('posts', {
              posts: posts,
              info: info,
              picture:picture,
              recomends:recomends
          });*/
        res.json({"success":true,"totalCounts":totalCounts,"result":pagerPosts});
      }).catch(next);
    });
//发表一篇文章
// GET /posts/create 发表文章页
router.get('/create', checkLogin, function(req, res, next) {
  res.render('create');
});

// POST /posts 发表一篇文章
router.post('/', checkLogin, function(req, res, next) {
  var author = req.session.user._id;
  var title = req.fields.title;
  var content = req.fields.content;

  // 校验参数
  try {
    if (!title.length) {
      throw new Error('请填写标题');
    }
    if (!content.length) {
      throw new Error('请填写内容');
    }
  } catch (e) {
    req.flash('error', e.message);
    return res.redirect('back');
  }

  var post = {
    author: author,
    title: title,
    content: content,
    pv: 0
  };

  PostModel.create(post)
    .then(function (result) {
      // 此 post 是插入 mongodb 后的值，包含 _id
      post = result.ops[0];
      req.flash('success', '发表成功');
      // 发表成功后跳转到该文章页
      res.redirect(`/posts/${post._id}`);
    })
    .catch(next);
});


// GET /posts/:postId 单独一篇的文章页
router.get('/:postId',checkLogin, function(req, res, next) {
  var postId = req.params.postId;
  Promise.all([
    PostModel.getPostById(postId),// 获取文章信息
    CommentModel.getComments(postId),// 获取该文章所有留言
    PostModel.incPv(postId),// pv 加 1
    RecmandModel.getAllArticle(),
    DirectoryModel.getAllDirectory(),
    PostModel.getPostById(postId),
    PostModel.getFivePosts(),
  ])
  .then(function (result) {
    var post = result[0];
    var comments = result[1];
    var recomends = result[3];
    var dirss = result[4];
    var currDir = result[5];
    var fivePosts = result[6];
    if (!post) {
      throw new Error('该文章不存在');
    }
    if (!recomends) {
        throw new Error('推荐内容链接不存在');
    }

    res.render('post_new', {
      post: post,
      comments: comments,
      recomends:recomends,
      dirss:dirss,
      dirName:'',
      currDir:currDir,
      fivePosts:fivePosts
    });
  })
  .catch(next);
});
// GET /posts/:postId/edit 更新文章页
router.get('/:postId/edit',checkLogin, function(req, res, next) {
  var postId = req.params.postId;
  var author = req.session.user._id;

  PostModel.getRawPostById(postId)
    .then(function (post) {
      if (!post) {
        throw new Error('该文章不存在');
      }
      if (author.toString() !== post.author._id.toString()) {
        throw new Error('权限不足');
      }
      res.render('edit', {
        post: post
      });
    })
    .catch(next);
});
// POST /posts/:postId/edit 更新一篇文章
router.post('/:postId/edit', checkLogin, function(req, res, next) {
  var postId = req.params.postId;
  var author = req.session.user._id;
  var title = req.fields.title;
  var content = req.fields.content;
  PostModel.updatePostById(postId, author, { title: title, content: content })
    .then(function () {
      req.flash('success', '编辑文章成功');
      // 编辑成功后跳转到上一页
      res.redirect(`/posts/${postId}`);
    })
    .catch(next);
});

// GET /posts/:postId/remove 删除一篇文章
router.get('/:postId/remove', checkLogin, function(req, res, next) {
  var postId = req.params.postId;
  var author = req.session.user._id;

  PostModel.delPostById(postId, author)
    .then(function () {
      req.flash('success', '删除文章成功');
      // 删除成功后跳转到主页
      res.redirect('/posts');
    })
    .catch(next);
});
// POST /posts/:postId/comment 创建一条留言
router.post('/:postId/comment', checkLogin, function(req, res, next) {
  var author = req.session.user._id;
  var postId = req.params.postId;
  var content = req.fields.content;
  var comment = {
    author: author,
    postId: postId,
    content: content
  };

  CommentModel.create(comment)
    .then(function () {
      req.flash('success', '留言成功');
      // 留言成功后跳转到上一页
      res.redirect('back');
    })
    .catch(next);
});

// GET /posts/:postId/comment/:commentId/remove 删除一条留言
router.get('/:postId/comment/:commentId/remove', checkLogin, function(req, res, next) {
  var commentId = req.params.commentId;
  var author = req.session.user._id;

  CommentModel.delCommentById(commentId, author)
    .then(function () {
      req.flash('success', '删除留言成功');
      // 删除成功后跳转到上一页
      res.redirect('back');
    })
    .catch(next);
});
module.exports = router;

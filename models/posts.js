var marked = require('marked');
var Post = require('../lib/mongo').Post;
var Directory = require('../lib/mongo').Directory;
var CommentModel = require('./comments');
// 给 post 添加留言数 commentsCount
Post.plugin('addCommentsCount', {
  afterFind: function (posts) {
    return Promise.all(posts.map(function (post) {
      return CommentModel.getCommentsCount(post._id).then(function (commentsCount) {
        post.commentsCount = commentsCount;
        return post;
      });
    }));
  },
  afterFindOne: function (post) {
    if (post) {
      return CommentModel.getCommentsCount(post._id).then(function (count) {
        post.commentsCount = count;
        return post;
      });
    }
    return post;
  }
});


// 将 post 的 content 从 markdown 转换成 html
Post.plugin('contentToHtml', {
  afterFind: function (posts) {
    return posts.map(function (post) {
      post.content = marked(post.content);
      return post;
    });
  },
  afterFindOne: function (post) {
    if (post) {
      post.content = marked(post.content);
    }
    return post;
  }
});

module.exports = {
  // 创建一篇文章
  create: function create(post) {
      console.log('添加的文章是：'+post);
    return Post.create(post).exec();
  },
  //通过目录查找文章列表
  getPostByDirId:function getPostByDirId(dirId,start,limit) {
      console.log('当前获取的id是'+dirId);
      return Post.find({dir:dirId})
            .populate({path:'dir',model:'Directory'})
            .sort({_id:-1})
            .skip(Number(start))
            .limit(Number(limit))
            .exec();
  },
  //查找目录对应文章的篇数
  getPostCountByDir:function getPostCountByDir(dirId){
      console.log('the dirId is '+dirId);
      return Post
        .find({dir:dirId})
        //.populate({ path: 'dir', model: 'Directory' })
        //.count()
        //.sort({ _id: -1 })
        .exec();
  },
  // 通过文章 id 获取一篇文章
  getPostById: function getPostById(postId) {
     console.log('postId:'+postId);
    return Post
      .findOne({ _id: postId })
      .populate({path:'dir',model:'Directory'})
      .exec()
  },
  //查询文章总条数
  getPostPagersNum:function getPostPagersNum() {
      return Post.count().exec();
  },
  //查询所有的文章列表
  getAllPosts:function getAllPosts() {
     return Post
     .find()
     .sort({ _id: -1 })
     .exec();
 },
 getFivePosts:function getFivePosts(){
     return Post
     .find()
     .sort({ _id: -1 })
     .limit(5)
     .exec();
 },
 delPostByDirId:function delPostByDirId(dirId) {
     return Post.remove({dirId:dirId}).exec();
 },
 pagerPost:function pagerPost(start,limit) {
     console.log('start:post:'+start+'limit:post:'+limit);
    if ((!start)||(!limit)) {
        return Post.find().sort({ _id: -1 }).exec();
    }else {
        return Post.find().sort({_id:-1}).skip(Number(start)).limit(Number(limit)).exec();
    }
 },
  // 按创建时间降序获取所有用户文章或者某个特定用户的所有文章
  getPosts: function getPosts(author) {
    var query = {};
    if (author) {
      query.author = author;
    }
    return Post
      .find(query)
      .populate({ path: 'author', model: 'User' })
      .sort({ _id: -1 })
      .addCreateAt()
      .addCommentsCount()
      .contentToHtml()
      .exec();
  },

  // 通过文章 id 给 pv 加 1
  incPv: function incPv(postId) {
    return Post
      .update({ _id: postId }, { $inc: { pv: 1 } })
      .exec();
  },

  // 通过文章 id 获取一篇原生文章（编辑文章）
  getRawPostById: function getRawPostById(postId) {
    return Post
      .findOne({ _id: postId })
      .populate({ path: 'author', model: 'User' })
      .exec();
  },

  // 通过用户 id 和文章 id 更新一篇文章
  updatePostById: function updatePostById(postId, author, data) {
    return Post.update({ author: author, _id: postId }, { $set: data }).exec();
  },
  // 通过用户 id 和文章 id 更新一篇文章
  updatePostByIdAdmin: function updatePostById(postId, data) {
    return Post.update({_id: postId }, { $set: data }).exec();
  },

  // 通过用户 id 和文章 id 删除一篇文章
  delPostById: function delPostById(postId, author) {
    return Post.remove({ author: author, _id: postId })
      .exec()
      .then(function (res) {
        // 文章删除后，再删除该文章下的所有留言
        if (res.result.ok && res.result.n > 0) {
          return CommentModel.delCommentsByPostId(postId);
        }
      });
  }};

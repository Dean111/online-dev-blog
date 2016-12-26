var config = require('config-lite');
var Mongolass =  require('mongolass');
var mongolass = new Mongolass();
var moment = require('moment');
var objectIdToTimestamp = require('objectid-to-timestamp');
mongolass.connect(config.mongodb);
//根据id生成创建时间create_at
mongolass.plugin('addCreateAt',{
    afterFind:function(results){
        results.forEach(function (item) {
            item.create_at = moment(objectIdToTimestamp(item._id)).format('YYYY-MM-DD HH:mm');
        });
        return results;
    },
    afterFindOne:function (result) {
        if (result) {
            result.create_at = moment(objectIdToTimestamp(result._id)).format('YYYY-MM-DD HH:mm');
        }
        return result;
    }
});

exports.Post = mongolass.model('Post',{
    author:{type:Mongolass.Types.ObjectId},
    title:{type:'string'},
    content:{type:'string'},
    pv:{type:'number'},
    picLink:{type:'string'},
    createTime:{type:'date'},
    dir:{type:Mongolass.Types.ObjectId}
});
exports.Post.index({author:1,_id:-1}).exec();
exports.Post.index({dir:1,_id:1}).exec();
exports.Directory = mongolass.model('Directory',{
    title:{type:'string'},
    mark:{type:'string'},
    href:{type:'string'}
})
exports.Directory.index({href:1},{unique:true}).exec();


exports.Picture = mongolass.model('Picture',{
    title:{type:'string'},
    link:{type:'string'},
})

exports.recomendArticle = mongolass.model('recomendArticle',{
    title:{type:'string'},
    link:{type:'string'},
    isTop:{type:'string'}//是否置顶
})

exports.User = mongolass.model('User',{
    name:{type:'string'},
    password:{type:'string'},
    avatar:{type:'string'},
    gender:{type:'string',enum:['m','f','x']},
    bio:{type:'string'},
});
exports.User.index({name:1},{unique:true}).exec();//根据用户名找到用户，用户名唯一

exports.Comment = mongolass.model('Comment',{
    author:{type:Mongolass.Types.ObjectId},
    content:{type:'string'},
    postId:{type:Mongolass.Types.ObjectId}
});
exports.Comment.index({postId:1,_id:1}).exec();
exports.Comment.index({ author: 1, _id: 1 }).exec();
exports.UserInfo = mongolass.model('UserINfo',{
    nickname:{type:'string'},
    email:{type:'string'},
    contact:{type:'string'},
    job:{type:'string'}
})
exports.SpiderData = mongolass.model('SpiderData',{
    title:{type:'string'},
    href:{type:'string'}
});

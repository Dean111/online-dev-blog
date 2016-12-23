var RecomendArticle = require('../lib/mongo').recomendArticle;
module.exports = {
    //添加推荐文章
    addArticle:function addArticle(article) {
        return RecomendArticle.create(article).exec();
    },
    //删除一篇推荐文章链接(根据id删除)
    delArticle:function delArticle(id) {
        return RecomendArticle.remove({_id:id}).exec();
    },
    getAllArticle:function getAllArticle() {
        return RecomendArticle.find()
        .sort({ _id: -1 })
        .exec();
    }
}

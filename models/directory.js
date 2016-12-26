var Directory = require('../lib/mongo').Directory;
var PostModel = require('./posts');

module.exports = {
    create:function create(directory) {
        console.log('进入添加目录方法');
        return Directory.create(directory).exec();
    },
    updateDirectory:function updateDirectory(dirId,data) {
        return Directory.update({_id: dirId }, { $set: data }).exec();
    },
    getAllDirectory:function getAllDirectory() {
        return Directory.find().sort({_id:1}).exec();
    },
    delDirectoryById:function delDirectory(dirId) {
        return Directory.remove({_id: dirId }, { $set: data }).exec()
          .then(function (res) {
            // 删除目录后直接删除目录下的所有文章
            if (res.result.ok && res.result.n > 0) {
                return PostModel.delPostByDirId(dirId);
            }
        });
    },
    getDirectoryById:function getDirectoryById(dirId){
        return Directory.findOne({_id:dirId}).exec();
    }
}

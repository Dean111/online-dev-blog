var Picture = require('../lib/mongo').Picture;

module.exports = {
    create:function create(picture) {
        return Picture.create(picture).exec();
    },
    updatePicById:function updatePicById(userId,data) {
        return Picture.update({_id: userId }, { $set: data }).exec();
    },
    delPicById:function delPicById(id) {

    },
    getAllPicture:function getAllPicture() {
        return Picture
          .find()
          .sort({ _id: -1 })
          .exec();
      }
    }

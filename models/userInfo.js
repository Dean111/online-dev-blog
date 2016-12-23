var UserInfo = require('../lib/mongo').UserInfo;

module.exports={
    //创建一条个人信息
    create:function create(userInfo){
        return UserInfo.create(userInfo).exec();
    },
    //根据id修改个人信息
    updateUserInfoById: function updateUserInfoByI(userId,  data) {
      return UserInfo.update({_id: userId }, { $set: data }).exec();
    },

    delUserInfoById:function delUserInfoById(id) {
        return UserInfo.remove({_id:id}).exec();
    },
    getUserInfos: function getUserInfos() {
      return UserInfo
        .find()
        .sort({ _id: -1 })
        .exec();
    }
}

/**
 *爬虫数据
 */
 var SpiderData = require('../lib/mongo').SpiderData;
 module.exports = {
    getAllspiders:function getAllspiders(){
        return   SpiderData.find().limit(3).exec();
    }
 }

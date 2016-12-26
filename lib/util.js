var superagent = require('superagent');
var cheerio = require('cheerio');
var moment = require('moment');
var data = require('./mongo').SpiderData;
exports.dateFormat = function (date) {
  return moment(date).format('YYYY年MM月DD日hh:mm:ss dddd');
}



exports.spiderMan = function(url){
    superagent.get(url)
    .end(function (err, sres) {
        if (err) {
            return next(err);
        }
        var $ = cheerio.load(sres.text);
        var items = [];
        $('#topic_list .topic_title').each(function (idx, element) {
            var $element = $(element);
            items.push({
                title: $element.attr('title'),
                href: $element.attr('href')
            });
            var spider = {
                title: $element.attr('title'),
                href: $element.attr('href')
            };
            data.create(spider).then(function(result){
                console.log('存入的数据是'+result);
            })
        });
        //console.log('获取到的内容是：'+items);
        return items;

    });
}

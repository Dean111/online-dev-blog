/**
 * 1.使用request发起请求，获取响应
 * 2. 使用cheerio解析响应体，分析出电影列表
 * 3. 把电影列表保存到数据库中
 * 4. 创建WEB应用服务器展示电影列表
 * 5. 启动计划任务，每半小时创建子进程更新数据
 * 6. 上传github并布署到阿里云
 **/
var read = require('./read.js').read;
var write = require('./write.js').write;
var async = require('async');
var url = 'http://top.baidu.com/buzz?b=26&c=1&fr=topcategory_c1';
var request = require('request');
var iconv = require('iconv-lite');
var fs = require('fs');
var cheerio = require('cheerio');
var debug = require('debug')('crawl:main');
// mongod --dbpath=./data
debug('jjjjjjjjjjjjjjjjjjjjjjjjjjjjjjj');
console.log('111111111111111111111111111');
var read = function(url,callback){
    request({
        url,
        encoding:null
    },function(err,response,body){
        if(err){
            callback(err);
        }else{
            //把buffer类型的响应体转成utf8字符串
            var result = iconv.decode(body,'utf8');
            //把这个字符串转成$对象
            var $ = cheerio.load(result);
            var items = [];//创建一个空数组
            debug('开始读取电影列表');
            //迭代每个a标签
            $('.keyword .list-title').each(function(){
                var $me =  $(this);
                var item = {
                    name:$me.text(),
                    url:$me.attr('href')
                }
                debug('读到电影:'+item.name);
                items.push(item);
            });
            debug('完成读取电影列表');
            callback(err,items);
        }
    })
}
/*async.series({
    function(callback){
        console.log('进入read方法');
        read(url,function(err,items){
            callback(err,items);
        });
    },
    function(data,callback){
        write(data,callback);
    }
}
,function(err,result){
   //console.log(result);
   console.log('进入方法..............');
   debug('全部任务执行完毕');
    process.exit(0);
})*/
read(url,function(err,item){
    console.log('执行结束返回的结果是'+item);
});

var system = require('system');
var webPage = require('webpage');
var page = webPage.create();
var fs = require('fs');
// 任务回显
var result = {};

if (system.args.length === 1) {
    console.log('Plaease pass some keywords.');
    phantom.exit();
} else {
    // 读取搜索关键字和设备型号
    var keyword = '';
    var device = ''
    system.args.forEach(function(arg, i) {
        if (i === system.args.length - 1) {
            device += arg;
        } else if (i !== 0){
           keyword += (arg + ' ');  
        }
    });

    // 读取配置文件
    var deviceFile = fs.open('device.json','r');
    var content ='';
    // 读取配置文件内容
    while (!deviceFile.atEnd()) {
        content += deviceFile.readLine();
    }
    var deviceObj = JSON.parse(content);
    for(var i = 0 ; i < 3; i++){
        if (device === deviceObj[i].type) {
            device = deviceObj[i];
            console.log(device);
        }
    }
    page.settings.userAgent = device.ua;
    page.viewportSize = {
        width: device.width,
        height: device.height
    };

    // 首先记录任务开始时间
    var startTime = new Date();
    page.open('https://www.baidu.com/s?wd=' + keyword, function(status){
        if (status == 'fail') {
            console.log('fail to load the address');
            result.code = 0;
            result.msg = '抓取失败';
            result.word = keyword;
            result.time = new Date() - startTime;
            result.dataList = [];
            console.log(result);
            phantom.exit();
        } else if (status == 'success' && page.loadingProgress = 100){
            console.log('load success');
            // 利用includeJs()加载外部jquery脚本
            page.includeJs("http://cdn.bootcss.com/jquery/3.1.1/jquery.min.js", function() {
                var resultNum = page.evaluate(function() {
                    return $('.result').length;
                })
                // 获取抓取的数据
                for (var i = 1; i <= resultNum; i++) {
                    // 获取title
                    var title = page.evaluate(function(index) {
                        return $('#' + index + '>h3').text() || '';
                    }, i);
                    var info = page.evaluate(function(index) {
                        return $('#' + index + ' .c-abstract').text() || '';
                    }, i);
                    var link = page.evaluate(function(index) {
                        return $('#' + index + ' .f13>a.c-showurl').text() || '';
                    }, i);
                    result.dataList.push({
                        'title': title,
                        'info': info,
                        'link': link
                    });
                }
                result.code = 1;
                result.msg = '抓取成功';
                result.word = keyword;
                result.time = new Date() - startTime;
                console.log('搜索结果为：', JSON.stringify(result));
                phantom.exit();
            })
        }      
    });
}

// page.open('http://phantomjs.org', function (status) {
//   var content = page.content;
//   console.log('Content: ' + content);
//   phantom.exit();
// });
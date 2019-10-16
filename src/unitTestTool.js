/*
E2E 테스팅 툴 : unitTest

var webdriver = require('selenium-webdriver'), until = webdriver.until;
var driver = new webdriver.Builder().forBrowser('chrome').build();
driver.By = webdriver.By;
driver.manage().window().setSize(1936, 1096);


 * var unitTestTool = require("unitTestTool");
 * var UT = new unitTestTool(driver,path[,baseUrl]);
 * 
 */
var fs = require('fs');
module.exports = function(driver,path,baseUrl){

    // 셋팅시간
    var now = new Date();
    var year = now.getFullYear();
    var month = gts(now.getMonth()+1);
    var date = gts(now.getDate());
    var hh = gts(now.getHours());
    var mm = gts(now.getMinutes());
    var ss = gts(now.getSeconds());
    function gts(time){ // getTimeString
        return (time<10) ? "0"+time : time;
    };

	var UT = {
        report:"", // 리포트결과물
        driver:driver, // selenium driver
        path:path, // 리포트 결과물이 저장될 경로
        browserName:"",
        browserVersion:"",
        browserUserAgent:"",
        date:year+"년"+month+"월"+date+"일 "+hh+"시"+mm+"분"+ss+"초",
        time:hh+""+mm+""+ss,
        count:0,
        baseUrl:baseUrl // URL 저장
	};

    UT.driver.getCapabilities().then(function(browser){
        UT.browserName = browser.get("browserName");
        UT.browserVersion = browser.get("version");
    });

    // 리포트의 타이틀 삽입.
    UT.writeReportTitle = function(title){
        if(UT.browserUserAgent==""){
            UT.driver.wait(function(){
                return UT.driver.executeScript(function(){
                    return navigator.userAgent;
                });
            }).then(function(ua){
                UT.browserUserAgent = ua;
            });
        };
        UT.report += "\n=="+title+"==\n";
        UT.driver.getCurrentUrl().then(function(url){
            UT.report += ("대상 URL : " +url+"\n");
        });
        return "-----"+title+"-----\n";
    };

    UT.writeReportText = function(text){
        UT.report += text+"\n";
        return text+"\n";
    };

    // 리포트 단위테스트 추가(성공예상)
    UT.writeReport = function(title,result,origin,takeShot){
        if(result==(origin+"")){
            UT.report += title +": 성공\n";
            return title +": 성공\n";
        }else{
            if(UT.driver && (takeShot==null || takeShot)){
                UT.takeScreenshot("실패_"+title);
            };
            UT.report += title +": 실패(기준 :"+result+" , 결과:"+origin+")\n";
            return title +": 실패(기준 :"+result+" , 결과:"+origin+")\n";
        };
    };

    // 리포트 단위테스트 추가(실패예상)
    UT.writeReportForFail = function(title,result,origin,takeShot){
        if(result==(origin+"")){
            if(UT.driver && (takeShot==null || takeShot)){
                UT.takeScreenshot("실패_"+title);
            };
            UT.report += title +": 성공\n";
            return title +": 성공\n";
        }else{
            UT.report += title +": 실패\n";;
            return title +": 실패\n";
        };
    };

    // 리포트 결과물 생성 및 저장
    UT.exportTxt = function(fileName){
        var fileName = (!fileName) ? "unitTest" : fileName;
        var desc = "리포트 작성시간 : "+UT.date+"\n"+"대상 브라우저 : "+UT.browserName+"("+UT.browserVersion+")\n"+"에이전트 : "+UT.browserUserAgent+"\n";
        UT.report = desc+UT.report;
        fs.writeFileSync(UT.path+"/"+fileName+".txt",UT.report);
        UT.report = "";
    };

    // 스크린샷 찍기
    UT.takeScreenshot = function(name,executeScript,sleep){
        if(UT.driver){
            if(typeof executeScript=="function"){
                UT.$$(executeScript);
            }else if(typeof executeScript=="number"){
                var topFn = eval("(function(){$(window).scrollTop("+executeScript+");})");
                UT.$$(topFn);
            }else if(typeof executeScript =="string"){
                var topFnOfSelector = eval("(function(){$(window).scrollTop($('"+executeScript+"').offset().top);})");
                UT.$$(topFnOfSelector);
            };
            if(sleep){
                UT.sleep(sleep);
            };
            UT.driver.takeScreenshot().then(function(data){
                UT.count = UT.count+1;
                var newname = UT.count+"_"+name;
                console.log(newname);
                var shot = data.replace(/^data:image\/png;base64,/,"");
                fs.writeFile(UT.path+"/"+newname+".png", shot, 'base64', function(err) {
                    if(err) console.log(err);
                });
            });
        }
    };

    // driver.executeScript 축약
    UT.$$ = function(func){
        return UT.driver.executeScript(func);
    };

    // driver.get 축약
    UT.get = function(url){
        return UT.driver.get(UT.baseUrl + url);
    };

    // driver.sleep 축약
    UT.sleep = function(sec){
        return UT.driver.sleep(sec);
    };

    // driver.quit 축약
    UT.quit = function(){
        return UT.driver.quit();
    };

    // driver.wait 축약
    UT.wait = function(func){
        return UT.driver.wait(func);
    };

    // wendriver.By 의 축약
    UT.By = UT.driver.By;

    return UT;

};





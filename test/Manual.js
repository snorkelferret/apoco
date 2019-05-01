"use strict";

const       assert = require('chai').assert;
const         stub = require('sinon').stub;
//const        jsdom = require('jsdom');
const   browserify = require('browserify');
const browserifyFn = require('browserify-string');
const         path = require('path');
const           fs = require('fs');
//const Apoco=require('../declare').Apoco;
var webdriver = require('selenium-webdriver');
var By=webdriver.By;
var until=webdriver.until;

var test=require("selenium-webdriver/testing");
var promise=require("selenium-webdriver/lib/promise");

//global.document=require("jsdom").jsdom(undefined,
 //                                          {virtualConsole: jsdom.createVirtualConsole().sendTo(console)});
//global.window=document.defaultView;
//global.navigator=global.window.navigator;
//global.jQuery = require('jquery');


test.describe("Manual",function(){
//    var $= global.jQuery;
    var driver;
    var tabs;
    test.before(function(done){
        this.timeout(20000);
        driver = new webdriver.Builder()
            .forBrowser('chrome')
            .build();
        driver.getCapabilities().then(function(cap){
            const knownGoodVersions = { // add to this!
                firefox:['52.9.0','60.3.0'],
                chrome:['70.0.3538.67','70.0.3538.110',
                        '71.0.3578.80',
                        '72.0.3626.7','72.0.3626.53','72.0.3626.122'
                       ]
            };
            const kgv = knownGoodVersions[cap.get('browserName')];
            assert.notStrictEqual(undefined,kgv);
            const browserVersion = cap.get('version') || cap.get('browserVersion'); // this is nice
            assert.isTrue(kgv.includes(browserVersion));
        });
        driver.manage().timeouts().implicitlyWait(10000);
    
        driver.get("file://"+process.cwd()+"/index.html").then(done);
    });
   // driver.get("https://snorkelferret.github.io/index.html");

    test.after(function() {
        driver.quit();
        
    });
    test.it("has defined UI",function(done){
        this.timeout(15000);
       // driver.wait(function(){
        //     return
        execute("return window.UI;")
            .then(function(r){
                assert.isDefined(r,"UI is defined");
             //   console.log("Apoco is " + r);
                done();
            });
       // },1500);
    });
    test.it("has loaded a node called Content",function(done){
        this.timeout(15000);
       // driver.wait(function(){
      //     return driver.isElementPresent(By.id("Content"));
      // },15000);
       var b=driver.findElement(By.id("Content"));
       
    //    console.log("Got content node " + b);
        assert.notStrictEqual(b,undefined);
        assert.notStrictEqual(b,null);
        done();
       // });
    });
    
    // before(function(done){
    test.it("can find some tabs ",function(done){
        driver.findElement(By.id("Tabs")).then(function(e){
            e.findElements(By.tagName("li")).then(function(b){
//                console.log("before got tabs length " + b.length);
                tabs=b;
                done();
            });
        });
    });
    test.it("we have some tabs",function(done){
        assert.strictEqual(tabs.length,12);
//        console.log("we have poxy tabs " + tabs.length);
        done();
    });
    
    test.it("can get the tab list with Apoco",function(){
        driver.executeScript("return Apoco.Panel.get('Tabs').getChild('Tabs').getChildren().length")
            .then(function(p){
                assert.strictEqual(p,12);
            });
    });

    test.it("can find a tab name",function(done){
        var span,text="Fields",index=-1;    //(By.xpath("//span[contains(., 'Fields')]"))
         for(var i=0;i<tabs.length;i++){

             tabs[i].findElements(By.tagName("span")).then(
                function(spanArray){
//                    console.log('Found spans length:'+ spanArray.length);
                    spanArray.forEach(function(nextElement) {
                       // console.log("in span array " + nextElement);
                        nextElement.getText().then(function(p){
//                            console.log("text is " + p);
                            if(p === text){
                                index=i;
                                done();
                            }
                        });
                    });
                });
        }
    });
    test.it("can find a tab with xpath",function(done){
        var tab=driver.findElement(By.xpath(".//div[@id='Tabs']/ul/li/span[contains(.,'Fields')]"));
//        console.log("tab is " + tab);
        assert.isObject(tab);
        done();
    });

  
    test.it("click fields tab loads fields page",function(done){
        var tab=driver.findElement(By.xpath(".//div[@id='Tabs']/ul/li/span[contains(.,'Fields')]"));
//        console.log("tab is " + tab);
        tab.click();
        assert.isObject(driver.findElement(By.id("fieldMenu")));
        done();
    });
      test.it("click node tab loads Nodes page",function(done){
        var tab=driver.findElement(By.xpath(".//div[@id='Tabs']/ul/li/span[contains(.,'Nodes')]"));
//        console.log("tab is " + tab);
        tab.click();
        assert.isObject(driver.findElement(By.id("nodeMenu")));
        done();
    });
    test.it("click display tab loads Displays page",function(done){
        var tab=driver.findElement(By.xpath(".//div[@id='Tabs']/ul/li/span[contains(.,'Displays')]"));
//        console.log("tab is " + tab);
        tab.click();
        assert.isObject(driver.findElement(By.id("displayMenu")));
        done();
    });
    test.it("click Panels tab loads Panels page",function(done){
        var tab=driver.findElement(By.xpath(".//div[@id='Tabs']/ul/li/span[contains(.,'Panels')]"));
//        console.log("tab is " + tab);
        tab.click();
        assert.isObject(driver.findElement(By.id("PanelMenu")));
        done();
    });
    test.it("click Types tab loads Types page",function(done){
        var tab=driver.findElement(By.xpath(".//div[@id='Tabs']/ul/li/span[contains(.,'Types')]"));
//        console.log("tab is " + tab);
        tab.click();
        assert.isObject(driver.findElement(By.id("typeMenu")));
        done();
    });
    test.it("click IO tab loads IO page",function(done){
        var tab=driver.findElement(By.xpath(".//div[@id='Tabs']/ul/li/span[contains(.,'IO')]"));
//        console.log("tab is " + tab);
        tab.click();
        assert.isObject(driver.findElement(By.id("IOMenu")));
        done();
    });
    test.it("click fields tab loads Popups page",function(done){
        var tab=driver.findElement(By.xpath(".//div[@id='Tabs']/ul/li/span[contains(.,'Popups')]"));
//        console.log("tab is " + tab);
        tab.click();
        assert.isObject(driver.findElement(By.id("popupMenu")));
        done();
    });
    test.it("click fields tab loads Utils page",function(done){
        var tab=driver.findElement(By.xpath(".//div[@id='Tabs']/ul/li/span[contains(.,'Utils')]"));
//        console.log("tab is " + tab);
        tab.click();
        assert.isObject(driver.findElement(By.id("UtilsMenu")));
        done();
    });
 
    
    test.describe("Nodes",function(){
        var menu_items=[];
        test.it("can go back to Nodes page",function(done){
            driver.findElement(By.xpath(".//div[@id='Tabs']/ul/li/span[contains(.,'Nodes')]"))
                .then(function(tab){
                  //  console.log("Node tab is " + tab);
                    tab.click();
                    done();
                }).catch(function(err){
                    done();
                });

        });
        test.it("has found a list of nodes",function(done){
            
            driver.findElements(By.css("#nodeMenu ul li"))
                .then(function(mi){
                    menu_items=mi;
                //    console.log("got " + menu_items.length);
                    assert.strictEqual(menu_items.length,12);
               
                    done();
                })
                .catch(function(err){
                    console.log("Error " + err);
                    done();
                }); 
            
        }); 
        test.it("can click on each menu item",function(done){
            var p,name;
            for(var i=0;i<menu_items.length;i++){
              //  console.log("menu item is " + menu_items[i]);
              
                menu_items[i].click();
                driver.executeScript('return arguments[0].getAttribute("name")',menu_items[i])
                    .then(function(name){
                        test.it("has loaded the menu item",function(done){
                            p=document.findElementById(name);
                            assert.isObject(p);
                            done();
                        });
                    });
            }
            
            done();
        });
        
    });
     
    
    test.describe("Fields",function(){
        var menu_items=[];
        test.it("can go back to Fields page",function(done){
            driver.findElement(By.xpath(".//div[@id='Tabs']/ul/li/span[contains(.,'Fields')]"))
                .then(function(tab){
                  //  console.log("Node tab is " + tab);
                    tab.click();
                    done();
                }).catch(function(err){
                    done();
                });

        });
        test.it("has found a list of fields",function(done){
            
            driver.findElements(By.css("#fieldMenu ul li"))
                .then(function(mi){
                    menu_items=mi;
                //    console.log("got " + menu_items.length);
                    assert.strictEqual(menu_items.length,17);
               
                    done();
                })
                .catch(function(err){
                    console.log("Error " + err);
                    done();
                }); 
            
        }); 
        test.it("can click on each menu item",function(done){
            var p,name;
            for(var i=0;i<menu_items.length;i++){
              //  console.log("menu item is " + menu_items[i]);
              
                menu_items[i].click();
                driver.executeScript('return arguments[0].getAttribute("name")',menu_items[i])
                    .then(function(name){
                        test.it("has loaded the menu item",function(done){
                            p=document.findElementById(name);
                            assert.isObject(p);
                            done();
                        });
                    });
            }
            done();
        });
        
    });

   
    
    test.describe("Displays",function(){
        var menu_items=[];
        test.it("can go back to Displays page",function(done){
            driver.findElement(By.xpath(".//div[@id='Tabs']/ul/li/span[contains(.,'Display')]"))
                .then(function(tab){
                  //  console.log("Node tab is " + tab);
                    tab.click();
                    done();
                }).catch(function(err){
                    done();
                });

        });
        test.it("has found a list of fields",function(done){
            
            driver.findElements(By.css("#displayMenu ul li"))
                .then(function(mi){
                    menu_items=mi;
                //    console.log("got " + menu_items.length);
                    assert.strictEqual(menu_items.length,6);
               
                    done();
                })
                .catch(function(err){
                    console.log("Error " + err);
                    done();
                }); 
            
        }); 
        test.it("can click on each menu item",function(done){
            var p,name;
            for(var i=0;i<menu_items.length;i++){
              //  console.log("menu item is " + menu_items[i]);
              
                menu_items[i].click();
                driver.executeScript('return arguments[0].getAttribute("name")',menu_items[i])
                    .then(function(name){
                        test.it("has loaded the menu item",function(done){
                            p=document.findElementById(name);
                            assert.isObject(p);
                            done();
                        });
                    });
            }
            done();
        });
        
    });

    
     
    function execute() {
        return driver.executeScript.apply(driver, arguments);
    }
});

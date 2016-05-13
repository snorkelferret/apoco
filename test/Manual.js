"use strict";

const       assert = require('chai').assert;
const       stub = require('sinon').stub;
//const        jsdom = require('jsdom');
const   browserify = require('browserify');
const browserifyFn = require('browserify-string');
const         path = require('path');
const           fs = require('fs');
const Harvey=require('../declare').Harvey;
var webdriver = require('selenium-webdriver');
var By=webdriver.By;
var until=webdriver.until;

var test=require("selenium-webdriver/testing");
var promise=require("selenium-webdriver/lib/promise");

//global.document=require("jsdom").jsdom(undefined,
 //                                          {virtualConsole: jsdom.createVirtualConsole().sendTo(console)});
//global.window=document.defaultView;
//global.navigator=global.window.navigator;
global.jQuery = require('jquery');


describe("Manual",function(){
    var $= global.jQuery; 
    var driver;
    var tabs;
    //test.before(function(){
        driver = new webdriver.Builder()
            .forBrowser('firefox')
            .build();
    
    //});
    driver.get("file:///home/val/harvey/manual.html");
    test.after(function() {
        driver.quit();
    });
    
    before(function(done){
        driver.findElement(By.id("Tabs")).then(function(e){
            e.findElements(By.tagName("li")).then(function(b){
                console.log("before got tabs length " + b.length);
                tabs=b;
                done();
             });
         });
    });
    test.it("has loaded a node called Content",function(done){
        this.timeout(15000);
        /*
         driver.wait(function(){
            return driver.isElementPresent(By.id("Content"));
        },15000); */
        var b=driver.findElement(By.id("Content"));
        console.log("Got content node " + b);
        assert.notStrictEqual(b,undefined);
        assert.notStrictEqual(b,null);
        done();
        
    });
  /*  test.it("has made the tabs",function(done){
        
        tabs=driver.findElement(By.id("Tabs")).then(function(e){
            return e.findElements(By.tagName("li")).then(function(b){
                //console.log("b in stupid construction is " + b );
                assert.strictEqual(b.length,9);
                done();
            });
        });
    }); */
    test.it("we have some poxy tabs",function(done){
        assert.strictEqual(tabs.length,9);
        console.log("we have poxy tabs " + tabs.length);
        done();
    });

    test.it("can find a tab name",function(done){
        var span,text="Fields",index=-1;    //(By.xpath("//span[contains(., 'Fields')]"))
         for(var i=0;i<tabs.length;i++){
            
             tabs[i].findElements(By.tagName("span")).then(
                function(spanArray){
                    console.log('Found spans length:'+ spanArray.length);
                    spanArray.forEach(function(nextElement) {
                        console.log("in span array " + nextElement);
                        nextElement.getText().then(function(p){
                            console.log("text is " + p);
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
        console.log("tab is " + tab);
        assert.isObject(tab);
        done();
    });
    test.it("click fields tab loads fields page",function(done){
        var tab=driver.findElement(By.xpath(".//div[@id='Tabs']/ul/li/span[contains(.,'Fields')]"));
        console.log("tab is " + tab);
        tab.click();
        assert.isObject(driver.findElement(By.id("FieldsMenu")));
        done();
    });
      test.it("click fields tab loads Nodes page",function(done){
        var tab=driver.findElement(By.xpath(".//div[@id='Tabs']/ul/li/span[contains(.,'Nodes')]"));
        console.log("tab is " + tab);
        tab.click();
        assert.isObject(driver.findElement(By.id("NodesMenu")));
        done();
    });
    test.it("click fields tab loads Displays page",function(done){
        var tab=driver.findElement(By.xpath(".//div[@id='Tabs']/ul/li/span[contains(.,'Displays')]"));
        console.log("tab is " + tab);
        tab.click();
        assert.isObject(driver.findElement(By.id("DisplaysMenu")));
        done();
    });
    test.it("click fields tab loads Panels page",function(done){
        var tab=driver.findElement(By.xpath(".//div[@id='Tabs']/ul/li/span[contains(.,'Panels')]"));
        console.log("tab is " + tab);
        tab.click();
        assert.isObject(driver.findElement(By.id("PanelsMenu")));
        done();
    });
    test.it("click fields tab loads Types page",function(done){
        var tab=driver.findElement(By.xpath(".//div[@id='Tabs']/ul/li/span[contains(.,'Types')]"));
        console.log("tab is " + tab);
        tab.click();
        assert.isObject(driver.findElement(By.id("TypesMenu")));
        done();
    });
    test.it("click fields tab loads IO page",function(done){
        var tab=driver.findElement(By.xpath(".//div[@id='Tabs']/ul/li/span[contains(.,'IO')]"));
        console.log("tab is " + tab);
        tab.click();
        assert.isObject(driver.findElement(By.id("IOMenu")));
        done();
    });
    test.it("click fields tab loads Popups page",function(done){
        var tab=driver.findElement(By.xpath(".//div[@id='Tabs']/ul/li/span[contains(.,'Popups')]"));
        console.log("tab is " + tab);
        tab.click();
        assert.isObject(driver.findElement(By.id("PopupsMenu")));
        done();
    });
    test.it("click fields tab loads Utils page",function(done){
        var tab=driver.findElement(By.xpath(".//div[@id='Tabs']/ul/li/span[contains(.,'Utils')]"));
        console.log("tab is " + tab);
        tab.click();
        assert.isObject(driver.findElement(By.id("UtilsMenu")));
        done();
    });
    
});



describe("Manual About Page",function(){
    var $= global.jQuery; 
    var driver;
       
    driver = new webdriver.Builder()
        .forBrowser('firefox')
        .build();
    
    driver.get("file:///home/val/harvey/manual.html");
    after(function() {
        driver.quit();
    });
    
    test.it("has loaded a node called Blurb",function(done){
        this.timeout(15000);
        driver.wait(function(){
            return driver.isElementPresent(By.id("Content"));
        },15000); 
        var b=driver.findElement(By.id("Blurb")) ; //.then(function(b){ //xpath(".//div[@id='Blurb']/h2[contains(.,'About Harvey')]")).then(function(b){
            assert.isObject(b);
            done();
        //});
    });
    test.it("has loaded the lhs menus",function(done){
        this.timeout(15000);
        driver.findElements(By.xpath(".//div[@id='AboutMenu']/ul/li")).then(function(m){
            console.log("got menu items " + m.length);   
            m.forEach(function(nextElement) {
                console.log("in span array " + nextElement);
                nextElement.getText().then(function(p){
                    console.log("text is " + p);
                    nextElement.click();
                    assert.isObject(driver.findElement(By.id(p)));
                });
             });
            done();
        });
    }); 
});

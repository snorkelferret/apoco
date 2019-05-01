"use strict";

const       assert = require('chai').assert;
const       stub = require('sinon').stub;
const        jsdom = require('jsdom');
const   browserify = require('browserify');
const browserifyFn = require('browserify-string');
const         path = require('path');
const           fs = require('fs');
const Apoco=require('../declare').Apoco;
var webdriver = require('selenium-webdriver');
var By=webdriver.By;
var until=webdriver.until;

var test=require("selenium-webdriver/testing");
var promise=require("selenium-webdriver/lib/promise");
global.document=require("jsdom").jsdom(undefined,
                                           {virtualConsole: jsdom.createVirtualConsole().sendTo(console)});
global.window=document.defaultView;
global.navigator=global.window.navigator;


test.describe("Windows",function(){
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
/*
    test.describe("Window",function(){
        test.it("creates a child window",function(done){
            
            var promise=driver.executeScript('  var url="file://"+process.cwd()+"/child_window.html"; return Apoco.Window.open({name:"Child", url:url});');
            var w;
            promise.then(function(){ 
                w=driver.executeScript("return Apoco.window.get('Child')");
                assert.isObject(w);
                done();
            }).catch(function(err){
                console.log("Window open failed " + err);
                assert.isObject(w); //expect to fail
                done();
            });
            
        });
        
    });
*/
});

"use strict";

const       assert = require('chai').assert;
const        jsdom = require('jsdom');
const   browserify = require('browserify');
const browserifyFn = require('browserify-string');
const         path = require('path');
const           fs = require('fs');
const Harvey=require('../declare').Harvey;


global.document=require("jsdom").jsdom(undefined,
                                           {virtualConsole: jsdom.createVirtualConsole().sendTo(console)});
global.window=document.defaultView;
global.navigator=global.window.navigator;
global.jQuery = require('jquery');


describe("DisplayTabs-(start without tab items)",function(){
    var $= global.jQuery; 
    var t;
    require("../DisplayTabs.js"); 
    it("creates a tab display object",function(){
        $("body").append("<div id='test'></div>");
        assert($("#test").length>0);
        t=Harvey.display.tabs({id:"test_tabs",DOM:"test"});
        assert.isObject(t);
    });
    it("can add a tab",function(){
        t.addTab({name:"tabOne"});
        assert.strictEqual(t.getTab().length,1);
    });
    it("can add another tab",function(){
        t.addTab({name:"tabTwo"});
        assert.strictEqual(t.getTab().length,2);
    });
    it("has a show method that puts the root element into the dom",function(){
        assert.strictEqual($("#test_tabs").length,0);
        t.show();
        assert.strictEqual($("#test_tabs").length,1);
    });
    it("has put the tabs into the dom",function(){
        assert.strictEqual($("#test_tabs").find("li").length,2);
    });
    it("can delete a tab",function(){
        t.deleteTab("tabOne");
        assert.strictEqual(t.getTab().length,1);
    });
});

describe("DisplayTabs",function(){
    var $= global.jQuery; 
    var t;
    require("../DisplayTabs.js"); 
    it("creates a tab display object",function(){
        $("body").append("<div id='test'></div>");
        assert($("#test").length>0);
        t=Harvey.display.tabs({id:"test_tabs",DOM:"test",
                               tabs:[{name:"tabOne",action:function(that){
                                   that.element.text("clicked");
                               }},
                                     {name:"tabTwo"},
                                     {name:"tabThree"}
                               ]});
        assert.isObject(t);
    });
    it("has a show method which puts the root element into the dom ",function(){
        assert.strictEqual($("#test_tabs").length,0);
        t.show();
        assert.strictEqual($("#test_tabs").length,1);
    });
    it("has put the tabs into the dom",function(){
        assert.strictEqual($("#test_tabs").find("li").length,3);
    });
    it("executes the action function when clicked",function(){
        var b=$("#test_tabs").find("li").first();
        assert.notStrictEqual(b.length,0);
        console.log("text in b is " + b.html());
        b.trigger("click");
        assert.strictEqual(b.text(),"clicked");
    });
    it("can add a tab",function(){
        t.addTab({name:"tabFour"});
        assert.strictEqual(t.getTab().length,4);
        assert.strictEqual($("#test_tabs").find("li").length,4);
    });
    it("can delete a tab",function(){
        t.deleteTab("tabTwo");
        assert.strictEqual(t.getTab().length,3);
    });
    it("can still execute the action function when clicked",function(){
        var b=$("#test_tabs").find("li").first();
        assert.notStrictEqual(b.length,0);
        console.log("text in b is " + b.html());
        b.trigger("click");
        assert.strictEqual(b.text(),"clicked");
    });
});

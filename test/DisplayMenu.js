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


describe("DisplayMenu-(start without menu items)",function(){
    var $= global.jQuery; 
    var t;
    require("../DisplayMenu.js"); 
    it("creates a manu display object",function(){
        $("body").append("<div id='test'></div>");
        assert($("#test").length>0);
        t=Harvey.display.menu({id:"test_menu",DOM:"test"});
        assert.isObject(t);
    });
    it("can add a menu item",function(){
        assert.strictEqual(t.getMenu().length,0);
        t.addMenu({name:"port"});
        assert.strictEqual(t.getMenu().length,1);
    });
    it("can delete a menu item",function(){
        assert.strictEqual(t.getMenu().length,1);
        t.deleteMenu("port");
        assert.strictEqual(t.getMenu().length,0);
    });
    
});

describe("DisplayMenu",function(){
    var $= global.jQuery; 
    var t;
    require("../DisplayMenu.js"); 
    it("creates a manu display object",function(){
        $("body").append("<div id='test'></div>");
        assert($("#test").length>0);
        t=Harvey.display.menu({id:"test_menu",DOM:"test",list:[{name:"one"},
                                                               {name:"two",
                                                                action:function(that){
                                                                    that.element.text("clicked");
                                                                }},
                                                               {name: "three"}
                                                              ]});
        assert.isObject(t);
    });

    it("can add a menu item",function(){
        assert.strictEqual(t.getMenu().length,3);
        t.addMenu({name:"port"});
        assert.strictEqual(t.getMenu().length,4);
    });
    it("can delete a menu item",function(){
        assert.strictEqual(t.getMenu().length,4);
        t.deleteMenu("one");
        assert.strictEqual(t.getMenu().length,3);
    });
    it("has a show method that puts the root node into the dom",function(){
        assert.strictEqual($("#test_menu").length,0);
        t.show();
        assert.notStrictEqual($("#test_menu").length,0);
    });
    it("has added menus to the dom",function(){
        var b=t.getElement().find("li.ui-menu-item");
        assert.strictEqual(b.length,3);
    });
    it("has a show method which outs the root element into the dom",function(){
        t.show();
    });
    it("has a callback ",function(){
        var b=t.getElement().find("li[name='two']");
        assert.notStrictEqual(b.length,0);
        var b=t.getMenu("two").element;
        b.trigger("click");
        assert.strictEqual(b.text(),"clicked");
    });
    it("has set the selected tab",function(){
        var b=t.getSelected().element;
        var c=t.getMenu("two").element;
        assert.strictEqual(b,c);
    });
    
});

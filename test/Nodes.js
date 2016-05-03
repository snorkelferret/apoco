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


describe("Nodes",function(){
    var $= global.jQuery; 
    var t;
    require("../Nodes.js"); 
    it("creates a anchor",function(){
        $("body").append("<div id='test'></div>");
        assert($("#test").length>0);
        t=Harvey.node({node:"anchor",text:"test"});
        assert.isObject(t);
    });
    it("creates a heading",function(){
        t=Harvey.node({node:"heading",size:"h2",text:"test"});
        assert.isObject(t);
    });
    it("creates a label",function(){
        t=Harvey.node({node:"label",text:"test"});
        assert.isObject(t);
    });
    it("creates a paragraph",function(){
        t=Harvey.node({node:"paragraph",text:"test"});
        assert.isObject(t);
    });
    it("creates a list",function(){
        t=Harvey.node({node:"list",list:["one","two"]});
        assert.isObject(t);
    });
    it("creates a description list",function(){
        t=Harvey.node({node:"descriptionList",items:[{label:"one",description:"this is one"},
                                                     {label:"two",description:"this is two"}]
                      });
        assert.isObject(t);
    });
    it("creates a clock",function(){
        t=Harvey.node({node:"clock"});
        assert.isObject(t);
    });
    it("can load an image",function(){
        t=Harvey.node({node:"image",url:"data/images/alchemist1.jpg"});
        assert.isObject(t);
    });
    it("creates a paginator",function(){
        t=Harvey.node({node:"paginate",number:4});
        assert.isObject(t);
    });
     it("creates a progressBar",function(){
        t=Harvey.node({node:"progressBar",value:10});
        assert.isObject(t);
    }); 
    
});

"use strict";

const       assert = require('chai').assert;
const        jsdom = require('jsdom');
const   browserify = require('browserify');
const browserifyFn = require('browserify-string');
const         path = require('path');
const           fs = require('fs');
const Apoco=require('../declare').Apoco;


global.document=require("jsdom").jsdom(undefined,
                                           {virtualConsole: jsdom.createVirtualConsole().sendTo(console)});
global.window=document.defaultView;
global.navigator=global.window.navigator;


describe("Nodes",function(){

    var t;
    require("../Nodes.js"); 
    it("creates a anchor",function(){
        var b=document.createElement("div");
        b.id="test";
        document.getElementsByTagName("body")[0].appendChild(b);
       // $("body").append("<div id='test'></div>");
        assert.strictEqual(document.contains(b),true);
        t=Apoco.node({node:"anchor",text:"test"},b);
        assert.isObject(t);
        assert.isObject(t.getElement());
    });
    it("has appended the anchor to the DOM",function(){
        var b=document.querySelector("#test a");
        //var b=c.getElementsByTagName("a")[0];
        //var c=t.getElement();
        assert.isObject(b);
        assert.strictEqual(document.contains(b),true);
    });
    
    it("creates a heading",function(){
        var b=document.getElementById("test");
        t=Apoco.node({node:"heading",size:"h2",text:"test",name:"myHeading"},b);
        assert.isObject(t);
    });
    it("has added a name attribute to the heading element",function(){
        var b=document.querySelector("#test h2[name='myHeading']");
        assert.isObject(b);
    });
    it("creates a label",function(){
        t=Apoco.node({node:"label",text:"test"});
        assert.isObject(t);
    });
    it("creates a paragraph",function(){
        t=Apoco.node({node:"paragraph",text:"test"});
        assert.isObject(t);
    });
 
    it("creates a list",function(){
        t=Apoco.node({node:"list",list:["one","two"]});
        assert.isObject(t);
    });
    it("creates a description list",function(){
        t=Apoco.node({node:"descriptionList",items:[{label:"one",description:"this is one"},
                                                     {label:"two",description:"this is two"}]
                      });
        assert.isObject(t);
    });
    it("creates a clock",function(){
        t=Apoco.node({node:"clock"});
        assert.isObject(t);
    });
    it("can load an image",function(){
        t=Apoco.node({node:"image",url:"data/images/alchemist1.jpg"});
        assert.isObject(t);
    });
    it("creates a paginator",function(){
        t=Apoco.node({node:"paginate",number:4});
        assert.isObject(t);
    });
/*    it("creates a progressBar",function(){
        t=Apoco.node({node:"progressBar",value:10});
        assert.isObject(t);
    }); */
    
});

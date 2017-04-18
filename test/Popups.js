"use strict";

const       assert = require('chai').assert;
const        jsdom = require('jsdom');
const   browserify = require('browserify');
const browserifyFn = require('browserify-string');
const         path = require('path');
const           fs = require('fs');
const Apoco=require('../declare').Apoco;


describe("JSDOM",function(){
 
   // beforeEach(function () {
    /*    global.document = jsdom.jsdom('<html></html>');
        global.window = document.defaultView;
     $ = global.jQuery = require('jquery')(window); */
    global.document=require("jsdom").jsdom(undefined,
                                           {virtualConsole: jsdom.createVirtualConsole().sendTo(console)});
    global.window=document.defaultView;
 
    it("appends a node to the dom",function(){
        var b=document.createElement("div");
        b.id="thing";
        document.body.appendChild(b);
        assert.strictEqual(document.body.contains(b),true);
    });
    it('defines Apoco',function(){
        assert(Apoco); 
    });
    it('creates a virtual console',function(){
     //   console.log("I am a virtual console");
        assert(console.log !== undefined); 
    });
    
});

describe("Popups",function(){

    global.navigator=global.window.navigator;

    require("../Popups");

    it("defines Apoco",function(){
        assert(Apoco !== undefined); 
    });
    it("defines Apoco.popup",function(){
   //    console.log("here is apoco.popup " + Apoco.popup);
       // assert(Apoco.popup !== undefined);
        assert.isObject(Apoco.popup);
        
    });
    it("creates an alert",function(){
        Apoco.popup.alert();
        var b=document.getElementById("apoco_alert");
        assert.strictEqual(document.contains(b),true);
    });
    
    it('makes a dialog popup', function () {
        Apoco.popup.dialog("what","here i am");
        var b=document.getElementsByClassName("apoco_dialog")[0];
        assert.strictEqual(document.contains(b),true);;
        
    });

});

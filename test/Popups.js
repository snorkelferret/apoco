"use strict";

const       assert = require('chai').assert;
const        jsdom = require('jsdom');
const   browserify = require('browserify');
const browserifyFn = require('browserify-string');
const         path = require('path');
const           fs = require('fs');
const Harvey=require('../declare').Harvey;


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
    it('defines Harvey',function(){
        assert(Harvey); 
    });
    it('creates a virtual console',function(){
        console.log("I am a virtual console");
        assert(console.log !== undefined); 
    });
    
});

describe("Popups",function(){
    var $;

    global.navigator=global.window.navigator;

    require("../Popups");

    it("defines Harvey",function(){
        assert(Harvey !== undefined); 
    });
    it("defines Harvey.popup",function(){
        console.log("here is Harvey.popup " + Harvey.popup);
       // assert(Harvey.popup !== undefined);
        assert.isObject(Harvey.popup);
        
    });
    it("creates an alert",function(){
        Harvey.popup.alert();
        var b=document.getElementById("Harvey_alert");
        assert.strictEqual(document.contains(b),true);
    });
    
    it('makes a dialog popup', function () {
        Harvey.popup.dialog("what","here i am");
        var b=document.getElementsByClassName("Harvey_dialog")[0];
        assert.strictEqual(document.contains(b),true);;
        
    });

});

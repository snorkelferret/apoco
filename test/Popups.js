"use strict";

const       assert = require('chai').assert;
const        jsdom = require('jsdom');
const   browserify = require('browserify');
const browserifyFn = require('browserify-string');
const         path = require('path');
const           fs = require('fs');
const Harvey=require('../declare').Harvey;


//function prepare(script,cb) {
 //   browserifyFn(script,{debug:true});
     /*   .bundle(function(err,buf){
            if (err)
                cb(err);
            else {
                const doc = jsdom.jsdom("<html><body>"+
                                        "<div id='testSF'></div>"+
                                        "<script src='node_modules/jquery/dist/jquery.js'></script>"+
                                        "<script src='node_modules/jquery-ui/dialog.js'></script>"+
                                        // "<script src='/bundle.js'></script>"+
                                        "<script>"+buf.toString('utf-8')+"</script>"+
                                        "</body></html>",
                                        {
                                            virtualConsole:jsdom.createVirtualConsole().sendTo(console),
                                        });
                doc.body.onload = (x)=>{
                    cb(null,doc);
                };
            }
        }); */
//}

describe("JSDOM",function(){
    var $;

   // beforeEach(function () {
    /*    global.document = jsdom.jsdom('<html></html>');
        global.window = document.defaultView;
     $ = global.jQuery = require('jquery')(window); */
    global.document=require("jsdom").jsdom(undefined,
                                           {virtualConsole: jsdom.createVirtualConsole().sendTo(console)});
    global.window=document.defaultView;
    $ = global.jQuery = require('jquery');
  //  global.Harvey=require('../declare').Harvey;
   // });

    it('uses jquery', function () {
        var dom = $("#banner");
        
        assert(dom);
    });
    it("appends a node to the dom",function(){
        $("body").append("<div id='thing'</div>");
        assert($("#thing").length>0);
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

   // beforeEach(function () {
    /*    global.document = jsdom.jsdom('<html></html>');
        global.window = document.defaultView;
     $ = global.jQuery = require('jquery')(window); */
   // global.document=require("jsdom").jsdom();
    //global.window=document.defaultView;
    global.navigator=global.window.navigator;
    $ = global.jQuery = require('jquery');
   // global.Harvey=require('../declare').Harvey ;
   // Harvey.popup=require('./Popups');
    require("../Popups");
    require("../node_modules/jquery-ui");
   // global.Harvey=require('../declare').Harvey.popup;
   // });
    it("defines Harvey",function(){
        assert(Harvey !== undefined); 
    });
    it("defines Harvey.popup",function(){
        console.log("here is Harvey.popup " + Harvey.popup);
       // assert(Harvey.popup !== undefined);
        assert($.isEmptyObject(Harvey.popup)!==true);
        
    });
    it("creates an alert",function(){
        Harvey.popup.alert();
        assert($("#Harvey_alert").length>0);
    });
    
    it('makes a dialog popup', function () {
        Harvey.popup.dialog("what","here i am");
        assert($("#Harvey_dialog").length>0);
        //assert(dom);
    });

});

"use strict";

const       assert = require('chai').assert;
const        jsdom = require('jsdom');
const   browserify = require('browserify');
const browserifyFn = require('browserify-string');
const         path = require('path');
const           fs = require('fs');
const Harvey=require('../declare').Harvey;


describe("JSDOMfield",function(){
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

describe("InputField",function(){
    var $;
    global.navigator=global.window.navigator;
    $ = global.jQuery = require('jquery');
    require("../Utils.js");
    require("../Types.js");
    require("../Fields.js");
    require("../node_modules/jquery-ui");
   
    it("defines Harvey",function(){
        assert(Harvey !== undefined); 
    });
    it("defines Harvey.field",function(){
        console.log("here is Harvey.field " + Harvey.field);
       // assert(Harvey.popup !== undefined);
        assert($.isEmptyObject(Harvey.field)!==true);
        
    });
    var t=Harvey.field["InputField"]({name: "inputNode",type: "integer"});

    it("creates an InputField",function(){
       // var t=Harvey.field["InputField"]({name: "inputNode",type: "integer",value: 10});
        assert(t!== null);
        console.log("got an element " + t.element);
        //assert(t.element);
    });
    it("has a getElement method",function(){
        assert(t.getElement() !== null); 
    });
    it("creates a div element",function(){
       // var n=Harvey.field["InputField"]({name: "inputNode",type: "integer",value: 10});
        //assert(n);
        var b=t.getElement();
        assert(b.length>0);
        $("body").append(b);
    });
    
    it("creates an input node",function(){
        var b=$("body").find("div[name='inputNode']").find("input");
        assert.strictEqual(b.length,1);
    });
    
    it("adds a name attribute",function(){
        var element=$("body").find("div[name='inputNode']");
        assert.strictEqual($(element).attr("name"),"inputNode");
    });
    it("sets the value",function(){
        t.setValue(10);
        assert.strictEqual($("body").find("div[name='inputNode']").find("input").val(),'10');
    });
 
    it("checks the type of the value",function(){
        assert.strictEqual(t.checkValue(),true); 
    });
    it("rejects a value of the wrong type",function(){
        t.setValue("dog");
        assert.strictEqual(t.checkValue(),false);
         t.setValue(6);
    });
    it("has a getValue method that returns the value",function(){
        assert.strictEqual(t.getValue(),'6'); 
    });
    it("has a getKey method that returns the name ",function(){
        assert.strictEqual(t.getKey(),"inputNode"); 
    });
    
});

describe("FloatField",function(){
    var $;
    global.navigator=global.window.navigator;
    $ = global.jQuery = require('jquery');
    require("../Utils.js");
    require("../Types.js");
    require("../Fields.js");
    require("../node_modules/jquery-ui");
   
    it("defines Harvey",function(){
        assert(Harvey !== undefined); 
    });
    it("defines Harvey.field",function(){
        console.log("here is Harvey.field " + Harvey.field);
       // assert(Harvey.popup !== undefined);
        assert($.isEmptyObject(Harvey.field)!==true);
        
    });
    var f=Harvey.field["FloatField"]({name:"floatField",type: "float",precision: 3});
    it("has a getElement method",function(){
        assert(f.getElement() !== null); 
    });
    it("creates a div element",function(){
        var b=f.getElement();
        assert(b.length>0);
        $("body").append(b);
    });
    it("creates two input elements",function(){
        var e=$("body").find("div[name='floatField']").find("input");
        assert.strictEqual(e.length,2);
    });
    
    it("sets a float value with precision 3",function(){
        f.setValue(12.124234);
        var e=$("body").find("div[name='floatField']").find("input");
        console.log("first fields value is " + $(e[0]).val());
        assert.strictEqual($(e[0]).val(),'12');
        assert.strictEqual($(e[1]).val(),'124');
    });
    it("accepts a negative value",function(){
        f.setValue(-23.4678);
        var e=$("body").find("div[name='floatField']").find("input");
        console.log("first fields value is " + $(e[0]).val());
        assert.strictEqual($(e[0]).val(),'-23');
        assert.strictEqual($(e[1]).val(),'-467');
    });

});

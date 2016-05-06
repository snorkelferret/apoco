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


describe("DisplayForm-(start without fields)",function(){
    var $= global.jQuery; 
    var t;
    require("../DisplayForm.js"); 
    it("creates a form display object",function(){
        $("body").append("<div id='test'></div>");
        assert($("#test").length>0);
        t=Harvey.display.form({id:"test_form",DOM:"test"});
        assert.isObject(t);
    });
    it("can add a field",function(){
        assert.strictEqual(t.getField().length,0);
        t.addField({type:"string",name:"port",value:"hj78"});
        assert.strictEqual(t.getField().length,1);
    });
    it("can add a node",function(){
        assert.strictEqual(t.getNode().length,0);
        t.addNode({node:"heading",size:"h3",text:"Yippee"});
        assert.strictEqual(t.getNode().length,1);
    });
    it("has a show method which adds the root element to the DOM",function(){
        assert.strictEqual($("#test_form").length,0);
        t.show();
        assert.notStrictEqual($("#test_form").length,0);
    });
    it("can add a button",function(){
        assert.strictEqual(t.getButton().length,0);
        t.addButton({action:function(){console.log("button clicked");}});
        assert.strictEqual(t.getButton().length,1);
    });
    it("can add another field",function(){
        assert.strictEqual(t.getField().length,1);
        t.addField({name:"somethingElse",type:"integer",value: 120});
        assert.strictEqual(t.getField().length,2);
    });
    it("can add another node",function(){
        assert.strictEqual(t.getNode().length,1);
        t.addNode({node:"paragraph",name:"Blah",text:"Blah blah blah"});
        assert.strictEqual(t.getNode().length,2);
    });
    it("has added the node to the dom",function(){
        assert.notStrictEqual(t.getElement().find("p[name='Blah']").length,0);
    });
    it("can delete a node",function(){
        assert.strictEqual(t.getNode().length,2);
        t.deleteNode("Blah");
        assert.strictEqual(t.getNode().length,1);
        assert.strictEqual(t.getElement().find("[name='Blah']").length,0);
    });
    
    
});

describe("DisplayForm",function(){
    var $= global.jQuery; 
    var t;
    require("../DisplayForm.js"); 
    it("creates a form display object",function(){
        $("body").append("<div id='test'></div>");
        assert($("#test").length>0);
        t=Harvey.display.form({id:"test_form",DOM:"test",
                               components:[{node:"heading",size:"h2",text:"Start"},
                                           {node:"paragraph",text:"hullo people"},
                                           {type: "integer",value: 10,name:"ID"}
                                          ],
                               buttons:[{name:"OK",action:function(that){
                                   that.parent.getField("ID").setValue(342);
                               }}]
                              });
        assert.isObject(t);
    });
    it("can add a node",function(){
        assert.strictEqual(t.getNode().length,2);
        t.addNode({node:"heading",size:"h3",text:"Yippee"});
        assert.strictEqual(t.getNode().length,3);
    });
    it("can add a field",function(){
        assert.strictEqual(t.getField().length,1);
        t.addField({type:"string",name:"port",value:"hj78"});
        assert.strictEqual(t.getField().length,2);
    });
    it("has a show method which adds the root element to the DOM",function(){
        assert.strictEqual($("#test_form").length,0);
        t.show();
        assert.notStrictEqual($("#test_form").length,0);
    });
    it("can add another node",function(){
        assert.strictEqual(t.getNode().length,3);
        t.addNode({node:"paragraph",name:"Blah",text:"Blah blah blah"});
        assert.strictEqual(t.getNode().length,4);
    });
    it("has added the node to the dom",function(){
        assert.notStrictEqual(t.getElement().find("p[name='Blah']").length,0);
    });
    it("can delete a node",function(){
        assert.strictEqual(t.getNode().length,4);
        t.deleteNode("Blah");
        assert.strictEqual(t.getNode().length,3);
        assert.strictEqual(t.getElement().find("[name='Blah']").length,0);
    });
    it("has added a callback to the button",function(){
        assert.strictEqual(t.getField("ID").getValue(),"10");
        t.getElement().find("button[name='OK']").trigger("click");
        assert.strictEqual(t.getField("ID").getValue(),"342");
    });
    
});

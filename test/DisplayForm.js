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


describe("DisplayForm-(start without fields)",function(){
 
    var t;
    require("../DisplayForm.js"); 
    it("creates a form display object",function(){
        var b=document.createElement("div");
        b.id="test";
        document.getElementsByTagName("body")[0].appendChild(b);
        //$("body").append("<div id='test'></div>");
        assert.strictEqual(document.contains(b),true);
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
        var b=document.getElementById("test_form");
        assert.strictEqual(document.contains(b),false);
        t.show();
        b=document.getElementById("test_form");
        assert.strictEqual(document.contains(b),true);
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
        var b=t.getElement().querySelector("p[name='Blah']");
        assert.strictEqual(document.contains(b),true);
    });
    it("can delete a node",function(){
        assert.strictEqual(t.getNode().length,2);
        t.deleteNode("Blah");
        assert.strictEqual(t.getNode().length,1);
        var b=t.getElement().querySelector("p[name='Blah']");
        assert.strictEqual(document.contains(b),false);
    });
    
    
});

describe("DisplayForm",function(){
    var t;
    require("../DisplayForm.js"); 
    it("creates a form display object",function(){
        var b=document.createElement("div");
        b.id="test";
        document.getElementsByTagName("body")[0].appendChild(b);
        //$("body").append("<div id='test'></div>");
        assert.strictEqual(document.contains(b),true);
        //$("body").append("<div id='test'></div>");
        //assert($("#test").length>0);
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
        var b=document.getElementById("test_form");
        assert.strictEqual(document.contains(b),false);
        t.show();
        b=document.getElementById("test_form");
        assert.strictEqual(document.contains(b),true);
    });
    it("has put the fields in the dom ",function(){
        //console.log("form added " + $("#test_form").html() );
        var b=document.getElementById("test_form").getElementsByTagName("li");
        assert.strictEqual(b.length,5);
    });
    it("can add another node",function(){
        assert.strictEqual(t.getNode().length,3);
        t.addNode({node:"paragraph",name:"Blah",text:"Blah blah blah"});
        assert.strictEqual(t.getNode().length,4);
    });
    it("has added the paragraph node to the dom",function(){
        // var b=document.querySelector("#test_form p[name='Blah']");
        var b=document.getElementById("test_form").querySelector("p[name='Blah']");
        assert.strictEqual(document.body.contains(b),true);
    });
    it("can delete a node",function(){
        assert.strictEqual(t.getNode().length,4);
        t.deleteNode("Blah");
        assert.strictEqual(t.getNode().length,3);
        var b=document.getElementById("test_form").querySelector("p[name='Blah']");
        assert.strictEqual(document.body.contains(b),false);
        //assert.strictEqual(t.getElement().find("[name='Blah']").length,0);
    });
    it("has added some buttons",function(){
        assert.strictEqual(t.getButton().length,1);
    });
    it("has added the buttons to the DOM",function(){
        var b=document.getElementById("test_form").getElementsByTagName("button");
        assert.strictEqual(b.length,1);
    });
    it("has added a callback to the button",function(){
        assert.strictEqual(t.getField("ID").getValue(),"10");
        var b=document.getElementById("test_form").querySelector("button[name='OK']");
        b.click();
        assert.strictEqual(t.getField("ID").getValue(),"342");
    });
    
});

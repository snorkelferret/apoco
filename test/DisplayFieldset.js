"use strict";

const       assert = require('chai').assert;
const       expect = require('chai').expect;
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

describe("DisplayFieldset-(no initial data)",function(){
   
    var t;
    require("../DisplayFieldset.js"); 
    it("creates a fieldset display object",function(){
        // $("body").append("<div id='test'></div>");
        var b=document.createElement("div");
        b.id="test";
        document.getElementsByTagName("body")[0].appendChild(b);
       // assert($("#test").length>0);
        t=Apoco.display.fieldset({id:"test_fieldset",DOM:"test"});
        assert.isObject(t);
    });
    it("creates a DOM  container",function(){
        t.getElement();
        assert.isObject(t); //$("#test_fieldset").length,0); 
    });
    it("can add a field",function(){
        t.addField({type: "string", name: "title"});
        var b=t.getField();//("title");
        assert.notStrictEqual(b,null);
    });
    it("can add a node",function(){
        t.addNode({node: "paragraph", name: "blurb"});
        var b=t.getNode();//("title");
        assert.notStrictEqual(b,null);
    });
    it("can find a node",function(){
        var b=t.getNode("blurb");
        assert.notStrictEqual(b,null);
    });
    it("can find a field",function(){
        var b=t.getField("title");
        assert.notStrictEqual(b,null);
    });
    it("sets the value of a field",function(){
        t.getField("title").setValue("Robert");
        var b=t.getField("title").getValue();
        assert.strictEqual(b,"Robert");
    });
    it("has a show method which puts the root element into the dom",function(){
        var b=document.contains(document.getElementById("test_fieldset"));
        assert.strictEqual(b,false);
        t.show();
        b=document.contains(document.getElementById("test_fieldset"));
        assert.strictEqual(b,true);
    });
    it("has put the fields into the dom",function(){
        //var b=$("#test_fieldset").find("div[name='title'] input").val();
        var b=document.querySelector("#test_fieldset div[name='title'] input"); 
        var c=b.value;
        assert.strictEqual(c,"Robert");
    });
    it("has put the nodes into the dom",function(){
        //var b=$("#test_fieldset").find("div[name='blurb'] p").text();
        var b=document.querySelector("#test_fieldset p[name='blurb']");
        assert.isObject(b);
        assert.strictEqual(b.textContent,"");
    });
    it("can delete a node",function(){
        t.deleteNode("blurb");
        //var b=$("#test_fieldset").find("div[name='blurb']");
        var b=document.querySelector("#test_fieldset div[name='blurb']"); 
        assert.strictEqual(document.contains(b),false);
    });
    it("returns null if you try to get non-existant node",function(){
        var b=t.getNode("blurb");
        assert.strictEqual(b,null);
    });
    
});

describe("DisplayFieldset-(start with data)",function(){
    var t;
    require("../DisplayFieldset.js"); 
    it("creates a fieldset object",function(){
        var b=document.createElement("div");
        b.id="test";
        document.body.appendChild(b);
        assert.strictEqual(document.body.contains(b),true);
        t=Apoco.display.fieldset({id:"test_fieldset",
                                   DOM:"test",
                                   components:[{node:"paragraph",name:"stuff",text:"hullo people"},
                                               {type:"integer",value: 10,name:"howmany"},
                                               {field:"numberArray",type:"integerArray",value:[1,3,4],name:"ia"},
                                               {node:"heading",size:"h3",text:"Extra"}
                                   ]});
        assert.isObject(t);
    });
    it("has created some  fields",function(){
        var b=t.getField();
        for(var i=0;i<b.length;i++){
            console.log("field is " + b[i].name);
        }
        assert.strictEqual(b.length,2);
    });
    it("writes out json for all the fields",function(){
        var b=t.getJSON();
        expect(b).to.eql({ia:["1","3","4"],howmany:"10"});
    });
    it("throws an error if you try to add a field with the same name",function(){
        var fn=function(){
            t.addField({name:"howmany",type: "float",value: 10.4});
        };
        assert.throws(fn,"Cannot add field with non-unique name");
    });
    it("throws an error if you try to add a node with the same name",function(){
        var fn=function(){
            t.addNode({name:"stuff",node: "heading",size: "h2"});
        };
        assert.throws(fn,"Cannot add node with non-unique name");
    });
    it("can delete a field",function(){
        t.deleteField("howmany");
        assert.strictEqual(t.getField().length,1);
        assert.strictEqual(t.getField("howmany"),null);
    });
    it("can add a field",function(){
        t.addField({type: "string", name: "title"});
        var b=t.getField("title");
        assert.notStrictEqual(b,null);
    });
    it("sets the value of a field",function(){
        t.getField("title").setValue("Robert");
        var b=t.getField("title").getValue();
        assert.strictEqual(b,"Robert");
    });
    
});

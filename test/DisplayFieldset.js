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
        t.addChild({type: "string", name: "title"});
        var b=t.getChild("title");
        assert.notStrictEqual(b,null);
    });
    it("can add a node",function(){
        t.addChild({node: "paragraph", name: "blurb"});
        var b=t.getChild("blurb");
        assert.notStrictEqual(b,null);
    });
    it("can find a node",function(){
        var b=t.getChild("blurb");
        assert.notStrictEqual(b,null);
    });
    it("can find a field",function(){
        var b=t.getChild("title");
        assert.notStrictEqual(b,null);
    });
    it("sets the value of a field",function(){
        var p=t.getChild("title");
//        console.log("setting field with methods %j", p);
        t.getChild("title").setValue("Robert");
        var b=t.getChild("title").getValue();
        assert.strictEqual(b,"Robert");
    });
  
    it("has a show method which puts the root element into the dom",function(){
        var b=document.contains(document.getElementById("test_fieldset"));
        assert.strictEqual(b,false);
        t.show();
        b=document.contains(document.getElementById("test_fieldset"));
        assert.strictEqual(b,true);
    });
    
    it("returns a reference to itself after calling show()",function(){
        assert.strictEqual(t.show(),t);
    });
    
    it("has put the fields into the dom",function(){
        //var b=$("#test_fieldset").find("div[name='title'] input").val();
        var b=document.querySelector("#test_fieldset div[name='title'] input"); 
        var c=b.value;
        assert.strictEqual(c,"Robert");
    });
    it("can reset all the field values",function(){
        var b=document.querySelector("#test_fieldset div[name='title'] input");
        b.value="Fog";
        t.reset();
        var b=t.getChild("title").getValue();
        assert.strictEqual(b,"Robert");
    });
    
    it("returns a reference to itself after calling reset()",function(){
        assert.strictEqual(t.reset(),t);
    });
    
    it("has put the nodes into the dom",function(){
        //var b=$("#test_fieldset").find("div[name='blurb'] p").text();
        var b=document.querySelector("#test_fieldset p[name='blurb']");
        assert.isObject(b);
        assert.strictEqual(b.textContent,"");
    });
    it("can delete a node",function(){
        t.deleteChild("blurb");
        //var b=$("#test_fieldset").find("div[name='blurb']");
        var b=document.querySelector("#test_fieldset div[name='blurb']"); 
        assert.strictEqual(document.contains(b),false);
    });
    it("returns null if you try to get non-existant node",function(){
        var b=t.getChild("blurb");
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
        var b=t.getChildren();
//        for(var i=0;i<b.length;i++){
//            console.log("field is " + b[i].name);
//        }
        assert.strictEqual(b.length,4);
    });
    it("writes out json for all the fields",function(){
        var b=t.getJSON();
        expect(b).to.eql({ia:["1","3","4"],howmany:"10"});
    });
    it("throws an error if you try to add a field with the same name",function(){
        var fn=function(){
            t.addChild({name:"howmany",type: "float",value: 10.4});
        };
        assert.throws(fn,"Cannot add component with non-unique name");
    });
    it("throws an error if you try to add a node with the same name",function(){
        var fn=function(){
            t.addChild({name:"stuff",node: "heading",size: "h2"});
        };
        assert.throws(fn,"Cannot add component with non-unique name");
    });
    it("can delete a node",function(){
        t.deleteChild("stuff");
        assert.strictEqual(t.getChildren().length,3);
        assert.strictEqual(t.getChild("stuff"),null);
    });
    it("can delete a field",function(){
        t.deleteChild("howmany");
        assert.strictEqual(t.getChildren().length,2);
        assert.strictEqual(t.getChild("howmany"),null);
    });
    it("can add a field",function(){
        t.addChild({type: "string", name: "title",required:true});
        var b=t.getChild("title");
        assert.notStrictEqual(b,null);
    });

    
    it("returns null if all the required fields do not have the correct type",function(){
        var p=t.getJSON();
        assert.strictEqual(p,null);
    });
    it("sets the value of a field",function(){
        t.getChild("title").setValue("Robert");
        var b=t.getChild("title").getValue();
        assert.strictEqual(b,"Robert");
    });
    it("can add a child with a listener",function(){
        t.addChild({type: "string", name: "ssss",required:true,
                    listen:[{name:"something",action:function(that){}}]
                   });
        var b=t.getChild("title");
        assert.notStrictEqual(b,null);
    });
    it("returns a reference to the created child",function(){
        var b=t.addChild({type:"integer",name:"ttt",value:6});
        assert.strictEqual(b,t.getChild("ttt"));
    });
    it("can delete itself",function(){
        t.delete();
        var b=document.contains(document.getElementById("test_fieldset"));
        assert.strictEqual(b,false);
    });
    
    
});


describe(" can use a node that is not in the DOM as this.DOM",function(){
    var t;
    it("creates the fieldset",function(){
        var p=document.createElement("div");
        p.id="test";
        t=Apoco.display.fieldset({id:"test_fieldset",
                                   DOM:p,
                                   components:[{node:"paragraph",name:"DOMstuff",text:"hullo people"}
                                              ]});
        assert.isObject(t);
        
    });
    it("can show the fieldset",function(){
        t.show();
        assert.isObject(t.DOM);
        var e=t.DOM.children;
        assert.isObject(e[0]);
        assert.equal(e[0].id,"test_fieldset");
    });
    it("has not put this.DOM into the document",function(){
        var p=document.contains(t.DOM);
        assert.equal(p,false);
    });
    it("after append this.DOM is in the document",function(){
        document.body.appendChild(t.DOM);
        assert.equal(document.contains(t.DOM),true);
    });
    
});

describe("DisplayFieldset-adding pre-existing fields and nodes",function(){
  var t;
    require("../DisplayFieldset.js"); 
    it("creates a fieldset object",function(){
        var b=document.createElement("div");
        b.id="test";
        document.body.appendChild(b);
        assert.strictEqual(document.body.contains(b),true);
        t=Apoco.display.fieldset({id:"test_fieldset",
                                   DOM:"test",
                                   components:[{node:"paragraph",name:"stuff",text:"hullo people"}
                                              ]});
        assert.isObject(t);
    });
    it("can add a pre-existing node",function(){
        var d=Apoco.node({node:"button",name:"SomeButton", label: 'A Label'});
        t.addChild(d);
        var b=t.getChildren();
//        for(var i=0;i<b.length;i++){
//            console.log("field is " + b[i].name);
//        }
        assert.strictEqual(b.length,2);
        
    });

    it("can add a pre-existing field",function(){
        var d=Apoco.field['checkBox']({name:"Something", label: 'A Label'});
        t.addChild(d);
        var b=t.getChildren();
//        for(var i=0;i<b.length;i++){
//            console.log("field is " + b[i].name);
//        }
        assert.strictEqual(b.length,3);
        
    });
    it("can add a delete a pre-existing field",function(){
       
        t.deleteChild("Something");
        var b=t.getChildren();
//        for(var i=0;i<b.length;i++){
//            console.log("field is " + b[i].name);
//        }
        assert.strictEqual(b.length,2);
        
    });
    it("returns reference to itself after deleting a child",function(){
        t.addChild({name:"deleteMe",type:"string",value:"hullo"});
        assert.strictEqual(t.deleteChild("deleteMe"),t);
    });
});

describe("DisplayFieldset-can have a child fieldset",function(){
    var t,p;
    require("../DisplayFieldset.js"); 
    it("creates a fieldset object",function(){
        var b=document.createElement("div");
        b.id="test";
        document.body.appendChild(b);
        assert.strictEqual(document.body.contains(b),true);
        t=Apoco.display.fieldset({id:"test_fieldset",
                                  DOM:"test",
                                  components:[{node:"paragraph",name:"stuff",text:"hullo people"},
                                              {node:"whatever",nodeType:"div",id:"fieldset_parent"},
                                              {field:"numberArray",type:"integerArray",value:[1,3,4],name:"ia"},
                                              {node:"heading",size:"h3",text:"Extra"}
                                   ]});
        assert.isObject(t);
    });
    it("can get a node by Id",function(){
        var c=t.getChild("fieldset_parent");
        assert.isObject(c);
    });
    it("can add a child fieldset",function(){
        var c=t.getChild("fieldset_parent");
        assert.isObject(c);
        assert.isObject(c.getElement());
        p=Apoco.display.fieldset({id:"child",
                                  DOM:c.element,
                                  components:[{node:"paragraph"},
                                              {type:"integer",value: 10,name:"number"},
                                              {type:"string",value: "some string",name:"string"}
                                             ]
                                     });
        assert.isObject(p);
    });
    
    it("can put the objects into the DOM",function(){
        t.show();
        assert.strictEqual(document.body.contains(t.element),true);
        p.show();
        assert.strictEqual(document.body.contains(p.element),true);
    });
    it("can get the JSON for the child fieldset",function(){
        var j=p.getJSON();
        assert.isObject(j);
        assert.equal(j["number"],10);
        assert.equal(j["string"],"some string");
    });
    
    
});


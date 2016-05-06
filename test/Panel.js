"use strict";

const       assert = require('chai').assert;
const       stub = require('sinon').stub;
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


describe("Panel",function(){
    var $= global.jQuery; 
    var t;
    var MO=stub(Harvey.Utils.observer,"create");
    MO.returns(true);
    
    require("../Panel.js");
    it("creates a tab display object",function(){
        $("body").append("<div id='test'></div>");
        assert($("#test").length>0);
        t=Harvey.Panel.add({name:"test_panel",
                            components:[
                                {display:"menu",
                                 DOM: "test",
                                 id: "AboutMenu",
                                 //       selected: "heading",
                                 heading:"Core Methods",
                                 list: [{label: "start",name: "start"},
                                        {label: "stop",name:"stop"}]
                                }]
                           });
        assert.isObject(t);
    });
    it("can add a child display object to the panel",function(){
        t.addChild({display: "tabs",DOM:"test",id:"test_tabs",
                    tabs:[{name:"one"},{name:"two"},{name:"three"}]});
        assert.strictEqual(t.getChildren().length,2);
    });
    it("can get a child by id",function(){
        assert.isObject(t.getChild("test_tabs"));
    });
    it("can delete a child",function(){
        t.deleteChild("AboutMenu");
        assert.strictEqual(t.getChildren().length,1);
    });
    it("won't allow  another child with same id to be added ",function(){
        var fn=function(){
            t.addChild({display: "tabs",DOM:"test",id:"test_tabs",
                        tabs:[{name:"one"},{name:"two"},{name:"three"}]});
        };
        assert.throws(fn,"Harvey.Panel: already have a child with id test_tabs" );
    });
    it("will allow another display object to be added",function(){
        t.addChild({display:"menu",
                    DOM: "test",
                    id: "AboutMenu",
                    heading:"Core Methods",
                    list: [{label: "start",name: "start"},
                           {label: "stop",name:"stop"}]
                   });
        assert.strictEqual(t.getChildren().length,2);
    });
    it("can delete all the children", function(){
        t.deleteChildren();
        assert.strictEqual(t.getChildren(),null);
    });
    it("can add a child after all have been deleted", function(){
        t.addChild({display:"menu",
                    DOM: "test",
                    id: "AboutMenu",
                    heading:"Core Methods",
                    list: [{label: "start",name: "start"},
                           {label: "stop",name:"stop"}]
                   });
        assert.strictEqual(t.getChildren().length,1);
    });
    it("can delete itself",function(){
        Harvey.Panel.delete(t.name);
        console.log("t is %j", t);
        assert.strictEqual(Harvey.Panel.inList("test_panel"),null);
    });
  
    
});

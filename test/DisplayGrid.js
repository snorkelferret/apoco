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


describe("DisplayGrid",function(){
    var $= global.jQuery; 
    var t;
    require("../DisplayGrid.js"); 
    it("appends a node to the dom",function(){
        $("body").append("<div id='test'></div>");
        assert($("#test").length>0);
        t=Harvey.display.grid({id:"test_grid",DOM:"test",cols:[{name: "name",type:"string"}]});
        assert.isObject(t);
    });
    it("creates a jquery container",function(){
        assert.notStrictEqual($("#test_grid"),0); 
    });
    it("cannot add column if it does not have a unique name",function(){
        var fn=function(){
            t.addCol({name: "name",type:"string"});     
        };
        assert.throws(fn,"Columns must have unique names");
    });
    it("creates a div with id",function(){
        assert.notStrictEqual($("#test_grid"),0);
    });
    it("can add a column ",function(){
        t.addCol({name: "index",type:"integer"});     
        assert.strictEqual(t.getColIndex("index"),1);
    });
    it("can add a row",function(){
        t.addRow({name:"Bill",index:10});
    });
    it("creates a grid",function(){
        assert.notStrictEqual(t.getGrid(),null);
        assert.notStrictEqual(t.getGrid(),undefined);
    });
    it("creates a row array",function(){
       // var n=t.getGrid();
        assert.notStrictEqual(t.getGrid().rows.length,0);
    });
    it("can add another row",function(){
        t.addRow({name:"Homer",index:6});
    });
     it("can add more columns ",function(){
        t.addCol({name: "job",type:"string"});     
        assert.strictEqual(t.getColIndex("job"),2);
    });
    it("can add yet another row",function(){
        t.addRow({name:"Sam",job:"Manager"});
    });
    
});

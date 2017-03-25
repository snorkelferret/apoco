"use strict";

const       assert = require('chai').assert;
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



describe("DisplayGrid-(start without rows)",function(){

    var t;
    require("../DisplayGrid.js"); 
    it("creates a grid display object",function(){
        var b=document.createElement("div");
        b.id="test";
        document.getElementsByTagName("body")[0].appendChild(b);
        //$("body").append("<div id='test'></div>");
        t=Apoco.display.grid({id:"test_grid",DOM:"test",cols:[{name: "name",type:"string"}]});
        assert.isObject(t);
    });
    it("has a getElement method",function(){
        var b=t.getElement();
        assert.isObject(b); 
    });
    it("has a show method which adds the root element to the DOM",function(){
        var b=document.getElementById("test_grid");
        assert.isNotObject(b);
        t.show();
        var b=document.getElementById("test_grid");
        assert.isObject(b);
    });
    it("cannot add column if it does not have a unique name",function(){
        var fn=function(){
            t.addCol({name: "name",type:"string"});     
        };
        assert.throws(fn,"Columns must have unique names");
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
        var fn=function(){
            var b=t.getRow({name:"Homer",index:6},null,{val:-1});
        };
        assert.throws(fn,"grid is not sorted" );
    });
     it("can add more columns ",function(){
        t.addCol({name: "job",type:"string"});     
        assert.strictEqual(t.getColIndex("job"),2);
    });
    it("can add yet another row",function(){
        t.addRow({name:"Sam",job:"Manager"});
    });
  
    it("dumps the contents of the grid as a JSON object",function(){
        var b=t.getJSON();
        assert.isObject(b);
        console.log("JSON %j",b);
    });
    it("updates a row only if unique key",function(){
        var fn=function(){
            t.updateRow({name:"Sam",index:12});
        };
        assert.throws(fn,"No method available to find this cell");
    });
    it("has a delete method",function(){
        var b=document.getElementById("test_grid");
        console.log("delete grid got element" + b);
        t.delete();
        assert.strictEqual(document.body.contains(b),false);
        console.log("t is now " + t);
    });
});



describe("DisplayGrid-(start with data and subgrids)",function(){
    var t;
    require("../DisplayGrid.js");
    
    //var data=require("./data/data.js");
    require("./data/data.js");
    var data=window.data;
    it("has got some data",function(){
        assert.isObject(data); 
    });
    it("creates a grid display object",function(){
        //$("body").append("<div id='Content'></div>");
        var b=document.createElement("div");
        b.id="Content";
        document.body.appendChild(b);
        assert.strictEqual(document.body.contains(b),true);
        t=Apoco.display.grid(data);
        assert.isObject(t);
    });
     it("can add a row",function(){
        var b=t.getGrid("swaps").rows.length;
        b++;
        var n=t.addRow({stock:"FG63",class: "swaps",bid:10,maturity:"2020-05-21"});
        var c=t.getGrid("swaps").rows.length;
        console.log("b is " + b +  " and c " + c);
        //var b=t.getRow({stock:"FG63",subclass: 1,bid:10});
        assert.strictEqual(b,c);
       // console.log("JSON %j",n);
    });
    it("can add another row",function(){
        var n=t.addRow({stock:"XXX",class: "swaps",bid:109,maturity:"2016-08-30"});
        var b=t.getRow({stock:"XXX",class: "swaps",bid:109,maturity:"2016-08-30"});
        assert.notStrictEqual(b,null);
    });
    it("has a show method which adds the root element to the DOM",function(){
        var b=document.getElementById("Blotter");
        assert.strictEqual(document.body.contains(b),false);
        t.show();
        var b=document.getElementById("Blotter");
        assert.strictEqual(document.body.contains(b),true);
    });
    
    it("has added a row to the dom",function(){
        var b=document.getElementById("straight").getElementsByTagName("tr")[0].getElementsByTagName("td")[0];//querySelector("#1 tr:first td:first");
        assert.isObject(b);
        var c=b.textContent;
        console.log("td is " + c);
    });
    it("can add a column using the field option instead of a type",function(){
        var b=t.getCol().length;
        b++;
        t.addCol({name:"selection",field:"select",editable:true,options:["one","two","three"]});
        var c=t.getCol().length;
        assert.strictEqual(b,c);
    });
    it("can get a row",function(){
        var b=t.getRow({stock:'AAB',maturity:"2017-03-27"});
        assert.notStrictEqual(b,null);
       /* console.log("row is %j",b);
        for(var k in b){
            console.log("cell " + k + " values %j",b[k]);
            for(var m in b[k]){
                console.log("cell values " + m + " values %j " ,b[k][m]);
            }
        } */
    });
    it("can get a cell",function(){
        var b=t.getRow({stock:'AAB',maturity:"2017-03-27"});
        assert.notStrictEqual(b,null);
        console.log("got cell " + b['selection']);
        var c=b['selection'];
        assert.notStrictEqual(c,null);
    });
    it("has added the options to the select cell",function(){
        var b=t.getRow({stock:'AAB',maturity:"2017-03-27"});
        assert.notStrictEqual(b,null);
        console.log("got cell " + b['selection']);
        var c=b['selection'];
        assert.notStrictEqual(c,null);
        var d=b['selection'].select;
        assert.strictEqual(d.length,3);
        console.log("options is %j",d);
    });
    
    it("can add a column",function(){
        var b=t.getCol().length;
        b++;
        t.addCol({name:"other",type:"string",editable:false});
        var c=t.getCol().length;
        assert.strictEqual(b,c);
    });
    it("updates an existing row",function(){
        //  t.updateRow({stock:"XXX",subclass:1,maturity:20160830,other:"something"});
        t.updateRow({stock:"AAB",class:"index_linked",maturity:"2017-03-27",other:"something"});
        var b=t.getRow({stock:"AAB",class:"index_linked",maturity:"2017-03-27"});
        assert.notStrictEqual(b,null);
        assert.strictEqual(b["other"].getValue(),"something");
    });
    it("deletes a row",function(){
        t.deleteRow({stock:"AAC",class: "swaps",maturity:"2018-04-22"});
        
    });
    it("deletes a column",function(){
        t.deleteCol("bid");
    });
    it("can delete itself with hidden cols",function(){
        var b=document.getElementById("Blotter");
        console.log("delete grid got element" + b);
        t.delete();
        assert.strictEqual(document.body.contains(b),false);
        console.log("t is now " + t);
        
        
    });
    
});

describe("DisplayGrid-(start with data but no subgrids)",function(){
    var t;
    require("../DisplayGrid.js");
    var data={ id:"test_grid",DOM:"test",
               cols:[{name:"one",type: "integer" },
                     {name: "two",type: "string"}],
               rows:[{one: 20 ,two: "hat"},
                     {one: 22, two: "big"}]
             };
    it("creates a grid display object",function(){
        var b=document.createElement("div");
        b.id="test";
        document.body.appendChild(b);
        assert.strictEqual(document.contains(b),true);
        t=Apoco.display.grid(data);
        assert.isObject(t);
        t.show();
    });
    it("creates htmldiv container",function(){
        var b=document.getElementById("test_grid");
        assert.strictEqual(document.contains(b),true);
    });
    it("can add a row",function(){
        var b=t.getGrid("all").rows.length;
        b++;
        var n=t.addRow({one: 33 , two: "fig"});
        var c=t.getGrid("all").rows.length;
        console.log("b is " + b +  " and c " + c);
        assert.strictEqual(b,c);
    });
    
});

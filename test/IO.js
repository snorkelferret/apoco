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
 

require("../IO.js");

const expect = require('chai').expect;

describe("IO.getFiles",function() {
    it("can read a file",function(){
        var files=[{name: "data/images/alchemist1.jpg" ,type:"image/jpeg"}];
        var t={};
        var promises=Apoco.IO.getFiles(files,t);
        assert(promises.length,1);
        promises[0].then(function(file){
            assert.isObject(file);
        });
        
    });
    it("rejects a  file of the wrong mimetype",function(){
        var files=[{name: "data/images/alchemist1.jpg" ,type:"image/jpeg"}];
        var t={opts:{mimeType:['application/pdf']}};
        var promises=Apoco.IO.getFiles(files,t);
     //   console.log("promises in test is %j" ,promises);
        assert.deepEqual(promises,[]);
        assert.equal(t._errors[0],"File incorrect type data/images/alchemist1.jpg cannot be uploaded");
    });
  

});
 
describe("IO.pubsub",function() {
    var thing={name:"thing",
               listen:[{name:"channel",action:function(){}}]};
    
    it("can subscribe to a channel",function(){
        Apoco.IO.listen(thing);
        
        assert.strictEqual(Apoco.IO._subscribers.channel[0].context,thing);
    });
    it("can subscribe to another channel",function(){
        thing.listen.push({name:"another",action:function(){}});
        //Apoco.IO.unsubscribe(thing,"channel");
        Apoco.IO.listen(thing,"another");
        assert.strictEqual(Apoco.IO._subscribers.channel.length,1);
        assert.strictEqual(Apoco.IO._subscribers.another.length,1);
        
    });
    it("can unsubscribe to a channel",function(){
        Apoco.IO.unsubscribe(thing,"channel");
        assert.strictEqual(Apoco.IO._subscribers.channel,undefined);
    });
    it("can add a channel again",function(){
        Apoco.IO.listen(thing,"channel");
        assert.strictEqual(Apoco.IO._subscribers.channel.length,1);
    });
    it("can unsubscribe from all channels",function(){
        Apoco.IO.unsubscribe(thing);
        assert.strictEqual(Apoco.IO._subscribers.channel,undefined);
        assert.strictEqual(Apoco.IO._subscribers.another,undefined);
    });
    
    
});

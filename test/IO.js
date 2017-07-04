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
        assert.equal(files[0].error,"File incorrect type data/images/alchemist1.jpg cannot be uploaded");
    });
  

});
 

"use strict";

const       assert = require('chai').assert;
const        jsdom = require('jsdom');
const   mochaJsdom = require('mocha-jsdom');
const   browserify = require('browserify');
const browserifyFn = require('browserify-string');
const         path = require('path');
const           fs = require('fs');

function prepare(script,cb) {
    browserifyFn(script,{debug:true})
        .bundle(function(err,buf){
            if (err)
                cb(err);
            else {
                const doc = jsdom.jsdom("<html><body>"+
                                        "<div id='testSF'></div>"+
                                        "<script src='node_modules/jquery/dist/jquery.js'></script>"+
                                        "<script>"+buf.toString('utf-8')+"</script>"+
                                        "</body></html>",
                                        {
                                            virtualConsole:jsdom.createVirtualConsole().sendTo(console),
                                        });
                doc.body.onload = (x)=>{
                    cb(null,doc);
                };
            }
        });
}

describe("InputField",function(){
    let      $;
    let Harvey;
    let    doc;
    const spec = {name:"inputNode",type:"integer",value:"10"};
    before(function(done){
        prepare("var Harvey=require('./declare').Harvey;"+
                "window.jQuery=jQuery;window.Harvey=Harvey;"+
                "require('./Utils');require('./Fields');"+
                "Harvey.field['InputField']({name:'inputNode',type:'integer',value:'10'},$('#testSF'));",
                (err,d) => {
                    if (err)
                        done(err);
                    else {
                        doc    = d;
                        $      = doc.defaultView.jQuery;
                        Harvey = doc.defaultView.Harvey;
                        done();
                    }
                });
    });
    it("creates an input node",function(){
        var b = $('#testSF').find("input");
        console.log("*** testSF: %j",$('#testSF')[0].outerHTML);
        assert.strictEqual(b.length,1);
    });
});

var Harvey=require('../declare').Harvey;

require("../Fields");

var assert = require('chai').assert;

describe("InputField",function() {
    var t;
    var d={name:"inputNode",type:"integer",value:"10"};
    var element=$("<div></div>");
    before(function(){
        t=Harvey.Field["InputField"](d,element);
    });
    it("creates an input node",function(){
        var b=$(element).find("input");
        assert.strictEquals(b.length,1);
    });
    it("adds a name attribute",function(){
        assert.strictEquals($(element).attr("name"),"inputNode");
    });
    it("sets the value",function(){
        assert.strictEquals($(element).find("input").val(),10);
    });
    it("has a setter method that updates value",function(){
        t.setValue(20);
        assert.strictEquals($(element).find("input").val,20);
    });
    it("checks the type of the value",function(){
        assert.strictEqual(t.checkValue(),true); 
    });
    it("rejects a value of the wrong type",function(){
        t.setValue("dog");
        assert.strictEqual(t.checkValue(),false);
         t.setValue(6);
    });
});

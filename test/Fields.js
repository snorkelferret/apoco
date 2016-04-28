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



describe("setup",function(){
    var $;

  /*  global.document=require("jsdom").jsdom(undefined,
                                           {virtualConsole: jsdom.createVirtualConsole().sendTo(console)});
    global.window=document.defaultView;
    global.navigator=global.window.navigator; */
    $= global.jQuery; // = require('jquery');
  
    it('uses jquery', function () {
        var dom = $("#banner");
        
        assert(dom);
    });
    it("appends a node to the dom",function(){
        $("body").append("<div id='thing'></div>");
        assert($("#thing").length>0);
    });
    it('defines Harvey',function(){
        assert(Harvey); 
    });
    it('creates a virtual console',function(){
        console.log("I am a virtual console");
        assert(console.log !== undefined); 
    });
    
});

describe("InputField",function(){
    var $;
   
  //  require("../Utils.js");
  //  require("../Types.js");
    require("../Fields.js");
 //   require("../node_modules/jquery-ui");
    $= global.jQuery = require('jquery');
  
    it("defines Harvey.field",function(){
        console.log("here is Harvey.field " + Harvey.field);
       // assert(Harvey.popup !== undefined);
        assert($.isEmptyObject(Harvey.field)!==true);
        
    });
    var t=Harvey.field["InputField"]({name: "inputNode",type: "integer"});

    it("creates an InputField",function(){
       // var t=Harvey.field["InputField"]({name: "inputNode",type: "integer",value: 10});
        assert(t!== null);
        console.log("got an element " + t.element);
        //assert(t.element);
    });
    it("has a getElement method",function(){
        assert(t.getElement() !== null); 
    });
    it("creates a div element",function(){
       // var n=Harvey.field["InputField"]({name: "inputNode",type: "integer",value: 10});
        //assert(n);
        var b=t.getElement();
        assert(b.length>0);
        $("body").append(b);
    });
    
    it("creates an input node",function(){
        var b=$("body").find("div[name='inputNode']").find("input");
        assert.strictEqual(b.length,1);
    });
    
    it("adds a name attribute",function(){
        var element=$("body").find("div[name='inputNode']");
        assert.strictEqual($(element).attr("name"),"inputNode");
    });
    it("sets the value",function(){
        t.setValue(10);
        assert.strictEqual($("body").find("div[name='inputNode']").find("input").val(),'10');
    });
 
    it("checks the type of the value",function(){
        assert.strictEqual(t.checkValue(),true); 
    });
    it("rejects a value of the wrong type",function(){
        t.setValue("dog");
        assert.strictEqual(t.checkValue(),false);
        t.setValue(6);
    });
    it("has a getValue method that returns the value",function(){
        assert.strictEqual(t.getValue(),'6'); 
    });
    it("has a getKey method that returns the name ",function(){
        assert.strictEqual(t.getKey(),"inputNode"); 
        //console.log("InputField is %j",t);
    });
   
    
    
});

describe("FloatField",function(){
    var $;
    $= global.jQuery = require('jquery');
    require("../Fields.js");
  //  require("../node_modules/jquery-ui");
   
    it("defines Harvey",function(){
        assert(Harvey !== undefined); 
    });
    it("defines Harvey.field",function(){
        console.log("here is Harvey.field " + Harvey.field);
       // assert(Harvey.popup !== undefined);
        assert($.isEmptyObject(Harvey.field)!==true);
        
    });
    var f=Harvey.field["FloatField"]({name:"floatField",type: "float",precision: 3});
    it("has a getElement method",function(){
        assert(f.getElement() !== null); 
    });
    it("creates a div element",function(){
        var b=f.getElement();
        assert(b.length>0);
        $("body").append(b);
    });
    it("creates two input elements",function(){
        var e=$("body").find("div[name='floatField']").find("input");
        assert.strictEqual(e.length,2);
    });
    
    it("sets a float value with precision 3",function(){
        f.setValue(12.124234);
        var e=$("body").find("div[name='floatField']").find("input");
        console.log("first fields value is " + $(e[0]).val());
        assert.strictEqual($(e[0]).val(),'12');
        assert.strictEqual($(e[1]).val(),'124');
    });
    it("accepts a negative value",function(){
        f.setValue(-23.4678);
        var e=$("body").find("div[name='floatField']").find("input");
        console.log("first fields value is " + $(e[0]).val());
        assert.strictEqual($(e[0]).val(),'-23');
        assert.strictEqual($(e[1]).val(),'468');
    });
    it("gets a value",function(){
        assert.strictEqual(f.getValue(),"-23.468"); 
    });
    it("rounds a negative number down",function(){
        f.setValue(-23.45542467);
        assert.strictEqual(f.getValue(),"-23.455"); 
    });
    it("rounds a negative number up where appropriate",function(){
        f.setValue(-23.4555567);
        assert.strictEqual(f.getValue(),"-23.456"); 
    });
    it("rejects a value of the wrong type",function(){
        var fn=function(){
            f.setValue("dog");
        };
        assert.throws(fn,"setValue: this value is not a float dog");
    });
});

describe("DateField",function(){
    var  $;
  
    require("../Fields.js");
    //require("../node_modules/jquery-ui").datepicker;
    $= global.jQuery = require('jquery');
    
    it("defines Harvey",function(){
        assert(Harvey !== undefined); 
    });
    it("defines Harvey.field",function(){
        console.log("here is Harvey.field " + Harvey.field);
       // assert(Harvey.popup !== undefined);
        assert($.isEmptyObject(Harvey.field)!==true);
    });
    var f=Harvey.field["DateField"]({name:"dateField",type: "date"});
    it("creates a div element",function(){
        var b=f.getElement();
        assert(b.length>0);
        $("body").append(b);
    });
    it("creates an input node",function(){
        var e=$("body").find("div[name='dateField']").find("input");
        assert(e.length>0);
    });
    it("creates a jquery datepicker",function(){
       // var e=$("body").find("div[name='dateField']").find("#ui-datepicker-div");
        var e=$("body").find("#ui-datepicker-div");
        assert(e.length>0);
    });
    it("sets a date",function(){
        f.setValue(20160824);
        var e=$("body").find("div[name='dateField']").find("input");
        assert.strictEqual(e.val(),"20160824");
    });
    it("gets a date",function(){
        assert.strictEqual(f.getValue(),"20160824"); 
    });
    it("rejects a value of the wrong type",function(){
        f.setValue("dog");
        assert.strictEqual(f.checkValue(),false);
        f.setValue("");
    });
});

describe("CheckBoxField",function(){
    var $;
    $= global.jQuery = require('jquery');
 
    require("../Fields.js");
   
    var f=Harvey.field["CheckBoxField"]({name:"checkBoxField",type: "boolean"});
    it("creates a div",function(){
        var b=f.getElement();
        assert(b.length>0);
        $("body").append(b);
    });
    it("creates an input node",function(){
        var e=$("body").find("div[name='checkBoxField']").find("input");
        assert(e.length>0);
    });
    it("has a setter for value",function(){
        f.setValue(true);
        var e=$("body").find("div[name='checkBoxField']").find("input");
        assert.strictEqual(e.prop("checked"),true);
    });
    it("gets a value",function(){
        assert.strictEqual(f.getValue(),true); 
    });
    it("clicking toggles value",function(){
        var e=$("body").find("div[name='checkBoxField']").find("input");
        e.trigger("click");
        assert.strictEqual(f.getValue(),false); 
        e.trigger("click");
        assert.strictEqual(f.getValue(),true); 
    });
    
});


describe("NumberArrayField-Integer",function(){
    var $;
    $= global.jQuery = require('jquery');
    require("../Fields.js");
      
    var f=Harvey.field["NumberArrayField"]({name:"numberArrayField",type: "integerArray",size: 4,value:[1,2]});
    it("creates a div",function(){
        var b=f.getElement();
        assert(b.length>0);
        $("body").append(b);
    });
    it("creates an array of input nodes",function(){
        var e=$("body").find("div[name='numberArrayField']").find("input");
        assert.strictEqual(e.length,4);
    });
    it("can set a max value",function(){
        var w=f.getInputElement();
        w[0].prop("max",10);
        var e=$("body").find("div[name='numberArrayField']").find("input");
        assert.strictEqual($(e[0]).prop("max"),"10");
    });
    
    it("has a value getter",function(){
        var r=f.getValue();
        assert.sameMembers(r,["1","2","",""]);
    });
    it("sets the values",function(){
        f.setValue([2,5,7]);
        var e=$("body").find("div[name='numberArrayField']").find("input");
        assert.strictEqual($(e[0]).val(),"2");
        assert.strictEqual($(e[1]).val(),"5");
        assert.strictEqual($(e[2]).val(),"7");
        assert.strictEqual($(e[3]).val(),"");
    });  
});

describe("TextAreaField",function(){
    var $;
    $= global.jQuery = require('jquery');
  
    require("../Fields.js");
  
    
    var f=Harvey.field["TextAreaField"]({name:"textAreaField",type: "text"});
    it("creates a div",function(){
        var b=f.getElement();
        assert(b.length>0);
        $("body").append(b);
    });
    it("creates a textarea node",function(){
        var e=$("body").find("div[name='textAreaField']").find("textarea");
        assert.notStrictEqual(e.length,0);
    });
    it("adds text",function(){
        var e=$("body").find("div[name='textAreaField']").find("textarea").val("blah blah blah");
        var b=f.getValue();
        assert.equal(b,"blah blah blah");
    });
    it("has a value setter",function(){
        f.setValue("some other text");
        var e=$("body").find("div[name='textAreaField']").find("textarea").val();
        assert.equal(e,"some other text");
    });
});
                                       
describe("SelectField",function(){
    var $;
    $= global.jQuery = require('jquery');
 
    require("../Fields.js");
  
    
    var f=Harvey.field["SelectField"]({name:"selectField",type: "string",options:["one","two","three"]});
     it("creates a div",function(){
        var b=f.getElement();
        assert(b.length>0);
        $("body").append(b);
     });
    it("creates a select node",function(){
        var e=$("body").find("div[name='selectField']").find("select");
        assert.notStrictEqual(e.length,0);
    });
    it("creates option nodes",function(){
        var e=$("body").find("div[name='selectField']").find("option");
        assert.strictEqual(e.length,3);
       
    });
    it("sets a value",function(){
        var e=$("body").find("div[name='selectField']").find("option:contains('two')");
        //var e=$("body").find("div[name='selectField']").find("select");
        e[0].selected=true;
 
        $(e).trigger("change");
        var b=f.getValue();
        assert.strictEqual(b,"two");
    });
    it("has a method to set a value",function(){
        f.setValue("three");
        var b=$("body").find("div[name='selectField']").find("select").val();
        
        assert.equal(b,"three");
    });
    
});

describe("RadioButtonSetField",function(){
    var $;
    $= global.jQuery = require('jquery');
 
    require("../Fields.js");
 
    
    var f=Harvey.field["RadioButtonSetField"]({name:"radioButtonSetField",type: "boolean",labels:["one","two","three"]});
    it("creates a div",function(){
        var b=f.getElement();
        assert(b.length>0);
        $("body").append(b);
    });
    it("creates an array of input nodes",function(){
        var e=$("body").find("div[name='radioButtonSetField']").find("input");
        assert.strictEqual(e.length,3);
    }); 
    it("creates an array of label nodes",function(){
        var e=$("body").find("div[name='radioButtonSetField']").find("li");
        assert.strictEqual(e.length,3);
    });
    it("sets a value",function(){
        var e=$("body").find("div[name='radioButtonSetField']").find("li:contains('two')");
        $(e).find("input").trigger("click");
        var b=$(e).find('input').prop("checked");
        assert.strictEqual(b,true);
    });
    it("uses a setter method for value",function(){
        f.setValue("one");
        var e=$("body").find("div[name='radioButtonSetField']").find("li:contains('one')").find("input");
        var b=$(e).prop("checked");
        assert.strictEqual(b,true);
    });
    it("has a getter method which returns an array",function(){
        var b=f.getValue();
        assert.strictEqual(b.length,3);
        assert.strictEqual(b[0].one,true);
        assert.strictEqual(b[1].two,false);
        assert.strictEqual(b[2].three,false);
        
    });
    it("can add a new entry",function(){
        f.addValue("four");
        var e=$("body").find("div[name='radioButtonSetField']").find("li");
        assert.strictEqual(e.length,4);
        var e=$("body").find("div[name='radioButtonSetField']").find("input");
        assert.strictEqual(e.length,4);
    });
    it("can set the new entry",function(){
        var e=$("body").find("div[name='radioButtonSetField']").find("li:contains('four')");
        $(e).find("input").trigger("click");
        var b=$(e).find('input').prop("checked");
        assert.strictEqual(b,true);
    });
    it("rejects a value of the wrong type",function(){
        var fn=function(){
            f.setValue("dog");
        };
        assert.throws(fn,"RadioButtonsetfield: setValue has no member called dog");
    });
});

describe("CounterField",function(){
    var $;
    $= global.jQuery = require('jquery');
  
    require("../Fields.js");
 
    
    var f=Harvey.field["CounterField"]({name:"counterField",type: "integer",min:0,max:16});
    it("creates a div",function(){
        var b=f.getElement();
        assert(b.length>0); 
        $("body").append(b);
    });
    it("has a method to set a value",function(){
        f.setValue(10);
        var e=$("body").find("div[name='counterField']").find("input").val();
        assert.strictEqual(e,"10");
    });
    it("has a method to get a value",function(){
        var e=f.getValue();
        assert.strictEqual(e,"10");
    });
    it("has a spinner which increments the value",function(){
        var e=$("body").find("div[name='counterField']").find("a");
        assert.strictEqual(e.length,2);
        var r= $(e[0]).find("span.ui-icon-triangle-1-n"); //
        assert.strictEqual(r.length,1);
        var r=$("body").find("div[name='counterField']").find("a").first().trigger("mousedown");
        var r=$("body").find("div[name='counterField']").find("a").first().trigger("mouseup");
        $("body").find("div[name='counterField']").find("input").blur();
        var b=$("body").find("div[name='counterField']").find("input").val();
        assert.strictEqual(b,"11");
    });
    it("rejects a value of the wrong type",function(){
        var fn=function(){
            f.setValue("dog");
        };
        assert.throws(fn, "CounterField: setValue wrong type for value");
        
    });
    
});

describe("SliderField",function(){
    var $;
    $= global.jQuery = require('jquery');
 
    require("../Fields.js");
 
    
    var f=Harvey.field["SliderField"]({name:"sliderField",type: "integer",min: 0,max:10});
    it("creates a div",function(){
        var b=f.getElement();
        assert(b.length>0); 
        $("body").append(b);
    });
    it("creates a slider",function(){
        var r=$("body").find("div[name='sliderField']").find(".ui-slider");
        assert.strictEqual(r.length,1);
    });
    it("has a set value method",function(){
        f.setValue(5);
        var r=$("body").find("div[name='sliderField']").find("input").val();
        assert.strictEqual(r,"5");
    });
    it("rejects non-numeric values",function(){
        f.setValue("dog");
        assert.strictEqual(f.checkValue(),false);
    });
});

describe("StringArrayField",function(){
    var $;
    $= global.jQuery = require('jquery');

    require("../Fields.js");
 
    
    var f=Harvey.field["StringArrayField"]({name:"stringArrayField",value:["one","two","three"]});
    it("creates a div",function(){
        var b=f.getElement();
        assert(b.length>0); 
        $("body").append(b);
    });
    it("creates a list",function(){
        var e=$("body").find("div[name='stringArrayField']").find("li");
        assert.strictEqual(e.length,3);
    });
    it("sets the values",function(){
        var e=$("body").find("div[name='stringArrayField']").find("input");
        assert.strictEqual(e.length,3);
        assert.strictEqual($(e[0]).val(),"one");
        assert.strictEqual($(e[1]).val(),"two");
        assert.strictEqual($(e[2]).val(),"three");
        
    });
    it("has a method to get value array",function(){
        var r=f.getValue();
        assert.sameMembers(r,["one","two","three"]);
    });
    it("can add an empty field",function(){
        var r=$("body").find("div[name='stringArrayField']").find('span.plus');
        assert.strictEqual(r.length,1);
        $(r).trigger("click");
        var e=$("body").find("div[name='stringArrayField']").find("input");
        assert.strictEqual(e.length,4);
    });
    it("rejects a value of the wrong type",function(){
        var fn=function(){
            f.setValue(10);
        };
        assert.throws(fn,"StringArrayField: setValue not an array"); 
        f.setValue(["big","small"]);
    });
});

describe("ImageArrayField",function(){
    var $;
    $= global.jQuery = require('jquery');
 
    require("../Fields.js");
 
    
    var f=Harvey.field["ImageArrayField"]({name:"imageArrayField"});
    it("creates a div",function(){
        var b=f.getElement();
        assert(b.length>0); 
        $("body").append(b);
    });

});

describe("AutoCompleteField",function(){
    var $;
    $= global.jQuery = require('jquery');
 
    require("../Fields.js");
        
    var f=Harvey.field["AutoCompleteField"]({name:"autoCompleteField",type: "string",options:["one","two","three"]});
    it("creates a div",function(){
        var b=f.getElement();
        assert(b.length>0); 
        $("body").append(b);
    });

});




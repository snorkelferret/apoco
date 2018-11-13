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
 



describe("setup",function(){
    /*  global.document=require("jsdom").jsdom(undefined,
                                           {virtualConsole: jsdom.createVirtualConsole().sendTo(console)});
    global.window=document.defaultView;
    global.navigator=global.window.navigator; */
   
    it("appends a node to the dom",function(){
        var b=document.createElement("div");
        document.body.appendChild(b);
        assert.strictEqual(document.contains(b),true);
    });
    it('defines Apoco',function(){
        assert(Apoco); 
    });
    it('creates a virtual console',function(){
      //  console.log("I am a virtual console");
        assert(console.log !== undefined); 
    });
    
});

describe("InputField",function(){
     
    require("../Fields.js");
    
    it("defines Apoco.field",function(){
    //    console.log("here is Apoco.field " + Apoco.field);
       // assert(Apoco.popup !== undefined);
        assert.isObject(Apoco.field,true);
        
    });
    var t=Apoco.field["input"]({name: "inputNode",type: "integer"});

    it("creates an InputField",function(){
       // var t=Apoco.field["InputField"]({name: "inputNode",type: "integer",value: 10});
        assert(t!== null);
     //   console.log("got an element " + t.element);
        //assert(t.element);
    });
    it("has a getElement method",function(){
        assert(t.getElement() !== null); 
    });
    it("creates a div element",function(){
        var b=t.getElement();
        assert.isObject(b);
      //  console.log("8888888888888888899999999999999 name is " + b.getAttribute("name"));
        document.getElementsByTagName("body")[0].appendChild(b);
        
    });
    
    it("creates an input node",function(){
        //var c=document.getElementsByTagName("div";
        var b=(document.getElementsByName("inputNode")[0]).getElementsByTagName("input")[0];    
       // b=c.
  
        //var b=document.getElementsByTagName("div").getElementsByTagName("input")[0];
     //   var b=$("body").find("div[title='inputNode']").find("input");
     //   console.log("iiiiiiiiiiiiiiiiiinput node is %j " , b);
        assert.isObject(b);
    });
    
    it("adds a name attribute",function(){
        //var b=$("body").find("div[title='inputNode']");
        var b= document.getElementsByName("inputNode")[0];
     //   console.log("b is %j " , b);
     //   console.log("CCCCCCCCCCCCCCCC name is " + b.getAttribute("name"));
        assert.strictEqual(b.getAttribute("name"),"inputNode");
    });
    it("can set required",function(){
        t.setRequired(true);
        var e=(document.getElementsByName("inputNode")[0]).getElementsByTagName("input")[0];    
        assert.strictEqual(e.required,true);
    });
    it("returns itself from a call to setRquired",function(){
        var p=t.setRequired(true);
        assert.strictEqual(p,t);
    });
    it("can unset required",function(){
        t.setRequired(false);
        var e=(document.getElementsByName("inputNode")[0]).getElementsByTagName("input")[0];    
        assert.strictEqual(e.required,false);
    });
    
    it("knows the value has not been changed in the browser",function(){
        assert.strictEqual(t.valueChanged(),false);
    });
    it("sets the value",function(){
        t.setValue(10);
        var b=(document.getElementsByName("inputNode")[0]).getElementsByTagName("input")[0];
        assert.strictEqual(b.value,'10');
    });
    it("knows the value has been changes in the browser",function(){
        var b=(document.getElementsByName("inputNode")[0]).getElementsByTagName("input")[0];
        b.value=5;
        assert.strictEqual(t.valueChanged(),true);
    });
    
    it("checks the type of the value",function(){
        assert.strictEqual(t.checkValue(),true); 
    });
    it("rejects a value of the wrong type",function(){
        var fn=function(){
            t.setValue("dog");
        };
        assert.throws(fn,"Field: setValue dog is the wrong type, expects integer");
    });
    it("has a getValue method that returns the value",function(){
        t.setValue(4);
        assert.strictEqual(t.getValue(),'4');
    });
   it("returns itself from a call to setRquired",function(){
        var p=t.setValue(6);
        assert.strictEqual(p,t);
    });
    
    it("has a getKey method that returns the name ",function(){
        assert.strictEqual(t.getKey(),"inputNode"); 
        //console.log("InputField is %j",t);
    });
    it("only changes internal value with setValue",function(){
        var b=(document.getElementsByName("inputNode")[0]).getElementsByTagName("input")[0];
        t.setValue(10);
        b.value="29";
        assert.strictEqual(b.value,t.getValue());
        var f=t.resetValue();
        assert.notStrictEqual(b.value,f);
    });
 
});

describe("StaticField",function(){
    require("../Fields.js");
       
    it("defines Apoco.field",function(){
      //  console.log("here is Apoco.field " + Apoco.field);
        assert.isObject(Apoco.field,true);
        
    });
    var t=Apoco.field["static"]({name: "staticNode",value:"bob",type: "string"});
    it("creates a static field",function(){
        assert.isObject(t);
    });
    it("has a getElement method",function(){
        assert(t.getElement() !== null); 
    });
    it("creates a div element",function(){
        var b=t.getElement();
        assert.isObject(b);
        document.getElementsByTagName("body")[0].appendChild(b);
    });
    it("gets a value",function(){
        assert.strictEqual(t.getValue(),"bob"); 
    });
    var w=Apoco.field["static"]({name: "staticNode",value:[1,2,3,4,5],type: "integerArray"});
    it("reads an array",function(){
        var b=w.getElement();
        assert.isObject(b);
        var s=b.getElementsByTagName("span");
        assert.strictEqual(s.length,1);
    });
    it("can get a value",function(){
        var b=w.getValue();
       // console.log("static value is %j", b);
        assert.isArray(b);
        assert.deepEqual(b,[1,2,3,4,5]);
    });
    it("has not deranged numbers",function(){
        var b=w.getValue();
      //  console.log("static value is %j", b);
        assert.isArray(b);
        for(var i=0;i<b.length;i++){
            assert.isNotNaN(b[i]);
        }
    });
   
    it("can set a date field",function(){
        var p=Apoco.field["static"]({name: "statich",value:"2017-09-23",type: "date"});
        assert.strictEqual(p.getValue(),"2017-09-23");
    });
    it("can set a date specified in milliseconds",function(){
        var p=Apoco.field["static"]({name: "statich",value:1486998999898,type: "date"});
        assert.strictEqual(p.getValue(),"2017-02-13");
    });
    
    

});

describe("FloatField",function(){

    require("../Fields.js");
  //  require("../node_modules/jquery-ui");
   
    it("defines Apoco",function(){
        assert(Apoco !== undefined); 
    });
    it("defines Apoco.field",function(){
        //console.log("here is Apoco.field " + Apoco.field);
       // assert(Apoco.popup !== undefined);
        assert.isObject(Apoco.field);
        
    });
    var f=Apoco.field["float"]({name:"floatField",precision: 3});
    it("has a getElement method",function(){
        assert(f.getElement() !== null); 
    });
    it("creates a div element",function(){
        var b=f.getElement();
        assert.isObject(b);
        document.getElementsByTagName("body")[0].appendChild(b);
    });
    it("creates two input elements",function(){
        // var e=$("body").find("div[name='floatField']").find("input");
        var e=document.getElementsByName("floatField")[0].getElementsByTagName("input");
        assert.strictEqual(e.length,2);
    });
    
    it("sets a float value with precision 3",function(){
        f.setValue(12.124234);
        //var e=$("body").find("div[name='floatField']").find("input");
        var e=document.getElementsByName("floatField")[0].getElementsByTagName("input");
      //  console.log("first fields value is " + e[0].value);
        assert.strictEqual(e[0].value,'12');
        assert.strictEqual(e[1].value,'124');
    });
    it("accepts a negative value",function(){
        f.setValue(-23.4678);
        //var e=$("body").find("div[name='floatField']").find("input");
        var e=document.getElementsByName("floatField")[0].getElementsByTagName("input");
     //   console.log("first fields value is " + e[0].value);
        assert.strictEqual(e[0].value,'-23');
        assert.strictEqual(e[1].value,'468');
    });
    it("can set required",function(){
        f.setRequired(true);
        var e=document.getElementsByName("floatField")[0].getElementsByTagName("input");
        assert.strictEqual(e[0].required,true);
    });

    it("returns itself from a call to setRquired",function(){
        var p=f.setRequired(true);
        assert.strictEqual(p,f);
    });      

    it("can unset required",function(){
        f.setRequired(false);
        var e=document.getElementsByName("floatField")[0].getElementsByTagName("input");
        assert.strictEqual(e[0].required,false);
    });
    it("gets a value",function(){
        assert.strictEqual(f.getValue(),"-23.468"); 
    });
    it("knows the value has been changed in the browser",function(){
        var e=document.getElementsByName("floatField")[0].getElementsByTagName("input");
        e[0].value="33";
        e[1].value="424";
        assert.strictEqual(f.valueChanged(),true);
    });
    it("rounds a negative number down",function(){
        f.setValue(-23.45542467);
        assert.strictEqual(f.getValue(),"-23.455"); 
    });
    it("knows the value has been updated by setValue()",function(){
        assert.strictEqual(f.valueChanged(),false);
    });
    it("rounds a negative number up where appropriate",function(){
        f.setValue(-23.4555567);
        assert.strictEqual(f.getValue(),"-23.456"); 
    });
    it("rejects a value of the wrong type",function(){
        var fn=function(){
            f.setValue("dog");
        };
        assert.throws(fn, "FloatField: setValue this value is not a float");
        
    });
    it("only changes internal value with setValue",function(){
        var b=(document.getElementsByName("floatField")[0]).getElementsByTagName("input");
        b[0].value="29";
        b[1].value="34";
        assert.strictEqual("29.340",f.getValue());
      
    });
   it("knows the value has been changed in the browser",function(){
        assert.strictEqual(f.valueChanged(),true);
        
    });
    it("resets the value to the one previously stored by setValue",function*(){
        assert.notStrictEqual(29.340,f.resetValue());  
    });
    
 
    
    it("can delete itself",function(){
        f.delete();
    });
    
});

describe("FloatField- with spinner",function(){
  
    require("../Fields.js");
  //  require("../node_modules/jquery-ui");
   
 
    var f=Apoco.field["float"]({name:"floatField",spinner: true,type: "float",value: 10,precision: 3});
  
    it("creates a div element",function(){
        var b=f.getElement();
        assert.isObject(b);
        document.getElementsByTagName("body")[0].appendChild(b);
    });
    it("creates two input elements",function(){
        // var e=$("body").find("div[name='floatField']").find("input");
        var e=document.getElementsByName("floatField")[0].getElementsByTagName("input");
        assert.strictEqual(e.length,2);
    });
    it("knows a value has not been changed",function(){
        assert.strictEqual(f.valueChanged(),false);
    });
    it("has a spinner which increments the value",function(){
        var e=document.getElementsByName("floatField")[0].getElementsByTagName("li")[1];
        assert.isObject(e);
        var up=e.querySelector("span.up");
       // var down=e.getElemenstByClassName("down")[0];
        assert.isObject(up);
        up.focus();
        up.click();
        
        var b=f.getValue();
        //var b=document.getElementsByName("floatField")[0].getElementsByTagName("input")[0];
        assert.strictEqual(b,"10.100"); 
    });
    it("knows a value has been changed in the browser",function(){
        assert.strictEqual(f.valueChanged(),true);
                
    });
    it("can set a value",function(){
        f.setValue(16.555);
        assert.strictEqual(f.getValue(),"16.555");
    });
    it("knows a value has been changed by setValue",function(){
        assert.strictEqual(f.valueChanged(),false);
                
    });

    
});

describe("DateField",function(){
   
    require("../Fields.js");
    //require("../node_modules/jquery-ui").datepicker;
     
    it("defines Apoco",function(){
        assert(Apoco !== undefined); 
    });
    it("defines Apoco.field",function(){
     //   console.log("here is Apoco.field " + Apoco.field);
       // assert(Apoco.popup !== undefined);
        assert.isObject(Apoco.field,true);
    });
    var f=Apoco.field["date"]({name:"dateField",type: "date"});
    it("creates a div element",function(){
        var b=f.getElement();
        assert.isObject(b);
        document.getElementsByTagName("body")[0].appendChild(b);
    });
    it("creates an input node",function(){
        var e=document.getElementsByName("dateField")[0].getElementsByTagName("input")[0];
        //var e=$("body").find("div[name='dateField']").find("input");
        assert.isObject(e);
    });
    it("sets a date",function(){
        f.setValue("20160824");
        //var e=$("body").find("div[name='dateField']").find("input");
        var e=document.getElementsByName("dateField")[0].getElementsByTagName("input")[0];
        assert.strictEqual(e.value,"20160824");
    });
    it("gets a date",function(){
        assert.strictEqual(f.getValue(),"20160824"); 
    });
    it("rejects a value of the wrong type",function(){
        var fn=function(){
            f.setValue("dog");
        };
        assert.throws(fn,"Field: setValue dog is the wrong type, expects date");
    });
    it("only changes internal value with setValue",function(){
        var b=(document.getElementsByName("dateField")[0]).getElementsByTagName("input")[0];
        b.value="20230522";
        assert.strictEqual(b.value,f.getValue());
        assert.notStrictEqual(b.value,f.resetValue());
    });
    it("knows the value has been changed in the browser",function(){
        var b=(document.getElementsByName("dateField")[0]).getElementsByTagName("input")[0];
        b.value="20230525";
        assert.strictEqual(f.valueChanged(),true);
    });
});

describe("CheckBoxField",function(){
    require("../Fields.js");
   
    var f=Apoco.field["checkBox"]({name:"checkBoxField",type: "boolean"});
    it("creates a div",function(){
        var b=f.getElement();
        assert.isObject(b);
       document.getElementsByTagName("body")[0].appendChild(b);
    });
    it("creates an input node",function(){
        var e=document.getElementsByName("checkBoxField")[0].getElementsByTagName("input")[0];
        //var e=$("body").find("div[name='checkBoxField']").find("input");
        assert.isObject(e);
    });
    it("has a setter for value",function(){
        f.setValue(true);
        var e=document.getElementsByName("checkBoxField")[0].getElementsByTagName("input")[0];
        //var e=$("body").find("div[name='checkBoxField']").find("input");
        assert.strictEqual(e.getAttribute("checked"),"checked");
    });
 
    it("returns itself from a call to setValue",function(){
        var p=f.setValue(true);
        assert.strictEqual(p,f);
    });      

    it("gets a value",function(){
        assert.strictEqual(f.getValue(),true); 
    });
    it("clicking toggles value",function(){
        var e=document.getElementsByName("checkBoxField")[0].getElementsByTagName("input")[0];
        //var e=$("body").find("div[name='checkBoxField']").find("input");
        //e.focus();
        //e.click();
        assert.strictEqual(e.checked,true);
        e.focus();
        e.click();
        assert.strictEqual(e.checked,false);
        
        assert.strictEqual(f.getValue(),false); 
      //  e.click();
      //  assert.strictEqual(f.getValue(),"true"); 
    });
    it("knows the value has been changed in the browser",function(){
        assert.strictEqual(f.valueChanged(),true);
    });  
    it("can set a date field",function(){
        var p=Apoco.field["date"]({name: "statich",value:"2017-09-23",type: "date"});
        assert.strictEqual(p.getValue(),"2017-09-23");
    });

    it("can set a date specified in milliseconds",function(){
        var p=Apoco.field["date"]({name: "statich",value:1486998999898,type: "date"});
        assert.strictEqual(p.getValue(),"2017-02-13");
    });
    
    
});


describe("NumberArrayField-Integer",function(){

    require("../Fields.js");
      
    var f=Apoco.field["numberArray"]({name:"numberArrayField",type: "integerArray",size: 4,value:[1,2]});
    it("creates a div",function(){
        var b=f.getElement();
        assert.isObject(b);
        document.getElementsByTagName("body")[0].appendChild(b);
    });
    it("creates an array of input nodes",function(){
        var e=document.getElementsByName("numberArrayField")[0].getElementsByTagName("input");
        assert.strictEqual(e.length,4);
    });
    it("has a value getter",function(){
        var r=f.getValue();
        assert.sameMembers(r,["1","2","",""]);
    });
    it("sets the values",function(){
        f.setValue([2,5,7]);
        var e=document.getElementsByName("numberArrayField")[0].getElementsByTagName("input");
        assert.strictEqual(e[0].value,"2");
        assert.strictEqual(e[1].value,"5");
        assert.strictEqual(e[2].value,"7");
        assert.strictEqual(e[3].value,"");
    });
    it("only changes internal value with setValue",function(){
        var b=(document.getElementsByName("numberArrayField")[0]).getElementsByTagName("input")[0];
        b.value="2023";
        var s=f.getValue();
        assert.notStrictEqual(s,f.resetValue());
    });
    it("knows the value has been changed in the browser",function(){
        var b=(document.getElementsByName("numberArrayField")[0]).getElementsByTagName("input")[0];
        b.value="6798";
        assert.strictEqual(f.valueChanged(),true);
    });
    it("can add a value to the array",function(){
        f.addValue(4);
        assert.sameMembers(f.getValue(),["6798","5","7","","4"]);
    });

});

describe("TextAreaField",function(){
    require("../Fields.js");
  
    
    var f=Apoco.field["textArea"]({name:"textAreaField",type: "text"});
    it("creates a div",function(){
        var b=f.getElement();
        assert.isObject(b);
        document.getElementsByTagName("body")[0].appendChild(b);
    });
    it("creates a textarea node",function(){
        //  var e=$("body").find("div[name='textAreaField']").find("textarea");
        var e=document.getElementsByName("textAreaField")[0].getElementsByTagName("textarea")[0];
        assert.notStrictEqual(e.length,0);
    });
    it("adds text",function(){
        var e=document.getElementsByName("textAreaField")[0].getElementsByTagName("textarea")[0];
        //var e=$("body").find("div[name='textAreaField']").find("textarea").val("blah blah blah");
        e.value="blah blah blah";
        var b=f.getValue();
        assert.equal(b,"blah blah blah");
    });
    it("has a value setter",function(){
        f.setValue("some other text");
        var e=document.getElementsByName("textAreaField")[0].getElementsByTagName("textarea")[0];
       // var e=$("body").find("div[name='textAreaField']").find("textarea").val();
        assert.equal(e.value,"some other text");
    });
    it("knows the value has not been changed in the brower",function(){
        assert.strictEqual(f.valueChanged(),false);
    });
    it("only changes internal value with setValue",function(){
        var b=(document.getElementsByName("textAreaField")[0]).getElementsByTagName("textarea")[0];
        b.value="some user input";
        var s=f.getValue();
        assert.notStrictEqual(s,f.resetValue());
    });
    it("knows the value has been changed in the browser",function(){
        var b=(document.getElementsByName("textAreaField")[0]).getElementsByTagName("textarea")[0];
        b.value="whatever";
        assert.strictEqual(f.valueChanged(),true);
    });

});
                                       
describe("SelectField",function(){
  
    require("../Fields.js");
     
    var f=Apoco.field["select"]({name:"selectField",type: "string",options:["four","two","three"]});
    it("creates a div",function(){
        var b=f.getElement();
        assert.isObject(b);
        document.getElementsByTagName("body")[0].appendChild(b);
    });
    it("creates a select node",function(){
        var e=document.getElementsByName("selectField")[0].getElementsByTagName("select")[0];
        //var e=$("body").find("div[name='selectField']").find("select");
        assert.isObject(e);
    });
    it("creates option nodes",function(){
        //var e=$("body").find("div[name='selectField']").find("option");
        var e=document.getElementsByName("selectField")[0].getElementsByTagName("option");
        assert.strictEqual(e.length,3);
       
    });
    it("gets a value from browser",function(){
        //var e=$("body").find("div[name='selectField']").find("option:contains('two')");
        var e=document.getElementsByName("selectField")[0].getElementsByTagName("option");
        for(var i=0;i<e.length;i++){
            if(e[i].textContent === "two"){
                break;
            }
        }
        //var e=$("body").find("div[name='selectField']").find("select");
        e[i].selected=true;
        //var ev=new Event("change");
        //e[i].dispatchEvent(ev);
        e[i].click();
        var b=f.getValue();
        assert.strictEqual(b,"two");
    });
    it("knows the value has been changed in the browser",function(){
        assert.strictEqual(f.valueChanged(),true);
    });
    it("has a method to set a value",function(){
        f.setValue("three");
        //var b=$("body").find("div[name='selectField']").find("select").val();
        var b=document.getElementsByName("selectField")[0].getElementsByTagName("select")[0].value;;
        assert.equal(b,"three");
    });
    it("knows the value has been changed by setValue",function(){
        assert.strictEqual(f.valueChanged(),false); 
    });
    it("only changes internal value with setValue",function(){
        var b=(document.getElementsByName("selectField")[0]).getElementsByTagName("select")[0];
        b.value="four";
        var s=f.getValue();
        assert.notStrictEqual(s,f.resetValue());
    });
    it("can add an option",function(){
        f.addValue("ninety");
        var e=document.getElementsByName("selectField")[0].getElementsByTagName("option");
        assert.strictEqual(e.length,4);
        
    });
    
    it("returns itself from a call to addValue",function(){
        var p=f.addValue("pigs");
        assert.strictEqual(p,f);
    });      

    
    it("cannot  add a value of different type to options array",function(){
        var fn=function(){
            f.addValue({label:"sixty",value:77});
           
        };
        assert.throws(fn,"select field - addValue must be the same type as options array");
        //var e=document.getElementsByName("selectField")[0].getElementsByTagName("option");
        //assert.strictEqual(e.length,5);
       // f.getValue();
    });
 
    it("knows the value has been changed by setValue",function(){
        f.setValue("two");
        assert.strictEqual(f.valueChanged(),false);
    });
     
});

describe("SelectField with objectArray as options",function(){

    var f=Apoco.field["select"]({name:"objectselectField",type: "object",
                                 options:[{label:"four",value:4},
                                          {label:"two",value:2},
                                          {label:"three",value:3}
                                         ]});
    it("creates a div",function(){
        var b=f.getElement();
        assert.isObject(b);
        document.getElementsByTagName("body")[0].appendChild(b);
    });
    it("creates a select node",function(){
        var e=document.getElementsByName("objectselectField")[0].getElementsByTagName("select")[0];
        //var e=$("body").find("div[name='selectField']").find("select");
        assert.isObject(e);
    });
    it("creates option nodes",function(){
        //var e=$("body").find("div[name='selectField']").find("option");
        var e=document.getElementsByName("objectselectField")[0].getElementsByTagName("option");
        assert.strictEqual(e.length,3);
       
    });
    it("gets a value from browser",function(){
        //var e=$("body").find("div[name='selectField']").find("option:contains('two')");
        var e=document.getElementsByName("objectselectField")[0].getElementsByTagName("option");
        for(var i=0;i<e.length;i++){
           // console.log("option name is %j " , e[i].textContent);
            if(e[i].textContent === "two"){
                break;
            }
        }
      
        e[i].selected=true;
      
        e[i].click();
        var b=f.getValue();
        assert.deepEqual(b,{value:'2',label:"two"});
    });
    
    it("gets a value from browser with key value options ",function(){
        f.addValue({label:"sixty",value:60});
        //var e=$("body").find("div[name='selectField']").find("option:contains('two')");
        var e=document.getElementsByName("objectselectField")[0].getElementsByTagName("option");
        for(var i=0;i<e.length;i++){
            if(e[i].textContent === "sixty"){
                break;
            }
        }
        e[i].selected=true;
        e[i].click();
        var b=f.getValue();
        assert.deepEqual(b,{value:"60",label:"sixty"});
    });    
    it("can add objects array",function(){
        var labels=[{label:"ten",value:10},{label:"eleven",value:11},{label:"twelve",value:12}];
        for(var i=0;i<labels.length;i++){
            f.addValue(labels[i]);
            if(labels[i].value===10){
                f.setValue(labels[i]);
            }
        }
        var b=f.getValue();
        assert.deepEqual(b,{value:"10",label:"ten"});
    });
    
});

describe("SelectField with start value",function(){
    require("../Fields.js");

    var f=Apoco.field["select"]({name:"selectAgain",type: "string",value:"four",options:["","four"]});
    it("creates a div",function(){
        var b=f.getElement();
        assert.isObject(b);
        document.getElementsByTagName("body")[0].appendChild(b);
    });

    it("can add some values to a degenerate array",function(){
        var labels=["one","two","three"];
        for(var i=0;i<labels.length;i++){
            f.addValue(labels[i]);
        }
        var e=document.getElementsByName("selectAgain")[0].getElementsByTagName("option");
        assert.strictEqual(e.length,5);
    });
    it("the value is still set after adding values",function(){
        var b=f.getValue();
        assert.strictEqual(f.value,"four");
        assert.strictEqual("four",b);
    });

});



describe("SelectField with number array",function(){
    require("../Fields.js");

    var f=Apoco.field["select"]({name:"selectNumbers",type:"integer",value:4,options:[1,2,3,4]});
    it("creates a div",function(){
        var b=f.getElement();
        assert.isObject(b);
        document.getElementsByTagName("body")[0].appendChild(b);
    });

    it("can add some values to a the options",function(){
        var labels=[5,6,7];
        for(var i=0;i<labels.length;i++){
            f.addValue(labels[i]);
        }
        var e=document.getElementsByName("selectNumbers")[0].getElementsByTagName("option");
        assert.strictEqual(e.length,7);
    });
    it("the value is still set after adding values",function(){
        var b=f.getValue();
        assert.strictEqual(f.value,4);
        assert.strictEqual(4,b);
    });

});





describe("ButtonSetField",function(){
  
    require("../Fields.js");
 
    
    var f=Apoco.field["buttonSet"]({name:"radioButtonSetField",type: "boolean",labels:["one","two","three"]});
    it("creates a div",function(){
        var b=f.getElement();
        assert.isObject(b);
        document.getElementsByTagName("body")[0].appendChild(b);
    });
    it("creates an array of input nodes",function(){
        // var e=$("body").find("div[name='radioButtonSetField']").find("input");
        var e=document.getElementsByName("radioButtonSetField")[0].getElementsByTagName("input");
        assert.strictEqual(e.length,3);
    }); 
    it("creates an array of label nodes",function(){
        var e=document.getElementsByName("radioButtonSetField")[0].getElementsByTagName("li");
    //    var e=$("body").find("div[name='radioButtonSetField']").find("li");
        assert.strictEqual(e.length,3);
    });
    it("sets a value",function(){
        var index=-1;
        //var e=$("body").find("div[name='radioButtonSetField']").find("li:contains('two')");
        var e=document.getElementsByName("radioButtonSetField")[0].getElementsByTagName("li");
        for(var i=0;i<e.length;i++){
            if(e[i].textContent === "two"){
                index=i;
                break;
            }
        }
        if(index > -1){
            var b=e[index].getElementsByTagName("input")[0];  //find("input").trigger("click");
            b.click();
            assert.strictEqual(b.checked,true);
        }
        else{
            throw new Error("cannot find two");
        }
    });
    it("knows the value has been changed in the browser",function(){
        assert.strictEqual(f.valueChanged(),true);
    });
    it("uses a setter method for value",function(){
        var index=-1;
        f.setValue([true,false,false]);
        //var e=$("body").find("div[name='radioButtonSetField']").find("li:contains('one')").find("input");
        var e=document.getElementsByName("radioButtonSetField")[0].getElementsByTagName("li");
        for(var i=0;i<e.length;i++){
            if(e[i].textContent === "one"){
                break;
            }
        }
        var b=e[i].getElementsByTagName("input")[0];
        //var s=$(e).prop("checked");
        assert.strictEqual(b.checked,true);
    });
    it("knows the value has been set by setValue",function(){
        assert.strictEqual(f.valueChanged(),true);
    });
    it("has a getter method which returns an array of one for boolean fields",function(){
        var b=f.getValue();
      //  console.log("return for boolean buttonset is %j",b);
        assert.strictEqual(b.length,1);
        assert.strictEqual(b[0].one,true);
             
    });
    it("can add a new entry",function(){
        f.addValue("four");
        var e=document.getElementsByName("radioButtonSetField")[0].getElementsByTagName("li");
       // var e=$("body").find("div[name='radioButtonSetField']").find("li");
        assert.strictEqual(e.length,4);
        var e=document.getElementsByName("radioButtonSetField")[0].getElementsByTagName("input");
        //var e=$("body").find("div[name='radioButtonSetField']").find("input");
        assert.strictEqual(e.length,4);
    });


    
    it("can set the new entry",function(){
        var e=document.getElementsByName("radioButtonSetField")[0].getElementsByTagName("li");
        for(var i=0;i<e.length;i++){
            if(e[i].textContent === "four"){
                break;
            }
        }
       // var e=$("body").find("div[name='radioButtonSetField']").find("li:contains('four')");
        //$(e[i]).find("input").trigger("click");
        var b=e[i].getElementsByTagName("input")[0];
        b.click();
        //var b=$(e).find('input').prop("checked");
        assert.strictEqual(b.checked,true);
    });
    it("rejects a set value of the wrong length",function(){
        var fn=function(){
            f.setValue([true]);
        };
        assert.throws(fn,"ButtonSetField: values array length 1 does not match labels 4");
    });

    it("has a set method for booleans",function(){
        f.setValue([false,false,true,false]);
        var b=f.getValue();
        assert.strictEqual(b.length,1);
        for(var i=0;i<b.length;i++){
            assert.strictEqual(b[0].three,true);
        }
        
    });
    it("has a set method to set a single value",function(){
        f.setValue(true,1);
        var b=f.getValue();
        assert.strictEqual(b.length,1);
        for(var i=0;i<b.length;i++){
            assert.strictEqual(b[0].two,true);
        }
        
    });
    it("only updates internal values with setValue",function(){
        var e=document.getElementsByName("radioButtonSetField")[0].getElementsByTagName("input");
        e[0].click();
        assert.strictEqual(e[0].checked,true);
        var b=f.getValue();
        for(var i=0;i<b.length;i++){
            assert.strictEqual(b[0].one,true);
        }
        f.resetValue();
        b=f.getValue();
        for(var i=0;i<b.length;i++){
            assert.strictEqual(b[0].two,true);
        }
        
    });

    it("returns itself from a call to addValue",function(){
        var p=f.addValue("five");
        assert.strictEqual(p,f);
    });           
    it("can remove itself",function(){
        f.delete();
    });
 
    
});

describe("ButtonSetField - as checkboxes",function(){
    require("../Fields.js");
    var f=Apoco.field["buttonSet"]({name:"radioButtonSetField",checkbox:true,type: "boolean",labels:["one","two","three"]});
    it("creates a div",function(){
        var b=f.getElement();
        assert.isObject(b);
        document.getElementsByTagName("body")[0].appendChild(b);
    });
    it("creates an array of input nodes",function(){
        // var e=$("body").find("div[name='radioButtonSetField']").find("input");
        var e=document.getElementsByName("radioButtonSetField")[0].getElementsByTagName("input");
        assert.strictEqual(e.length,3);
    });
    it("sets a value on click",function(){
        var e=document.getElementsByName("radioButtonSetField")[0].getElementsByTagName("input");
        e[0].click();
        //e[2].click(); 
        var b=f.getValue();
        assert.strictEqual(b.length,3);
        assert.strictEqual(b[0].one,true);
        assert.strictEqual(b[1].two,false);
        assert.strictEqual(b[2].three,false);
    });
    it("allows multiple selects",function(){
        var e=document.getElementsByName("radioButtonSetField")[0].getElementsByTagName("input");
        //e[0].click();
        e[2].click(); 
        var b=f.getValue();
        assert.strictEqual(b.length,3);
        assert.strictEqual(b[0].one,true);
        assert.strictEqual(b[1].two,false);
        assert.strictEqual(b[2].three,true);
    });
    it("has a set method",function(){
        f.setValue([true,false,true]);
        var b=f.getValue();
        for(var i=0;i<b.length;i++){
            assert.strictEqual(b[0].one,true);
            assert.strictEqual(b[1].two,false);
            assert.strictEqual(b[2].three,true);
        }
        
    });
    it("returns itself from a call to setValue",function(){
        var p=f.setValue([false,false,true]);
        assert.strictEqual(p,f);
    });      
 
    
});


describe("SliderField",function(){

    require("../Fields.js");
     
    var f=Apoco.field["slider"]({name:"sliderField",type: "integer",min: 0,max:10});
    it("creates a div",function(){
        var b=f.getElement();
        assert.isObject(b); 
        document.getElementsByTagName("body")[0].appendChild(b);
    });
    it("creates a slider",function(){
        //var r=$("body").find("div[name='sliderField']").find(".ui-slider");
        var r=document.getElementsByName("sliderField")[0].getElementsByTagName("input")[0];
        assert.isObject(r);
    });
    it("has a set value method",function(){
        f.setValue(5);
        var r=document.getElementsByName("sliderField")[0].getElementsByTagName("input")[0];
        assert.strictEqual(r.value,"5");
    });
    it("rejects non-numeric values",function(){
        var fn=function(){
            f.setValue("dog");
        };
        assert.throws(fn,"Field: setValue dog is the wrong type, expects range");
    });
    it("has a reset method",function(){
        var r=document.getElementsByName("sliderField")[0].getElementsByTagName("input")[0];
        r.value=4;
        var p=f.getValue();
        assert.strictEqual(p,"4");
        f.resetValue();
        p=f.getValue();
        assert.strictEqual(p,"5");
    });
    it("knows the value has been changed in the browser",function(){
        var r=document.getElementsByName("sliderField")[0].getElementsByTagName("input")[0];
        r.value=2;
        assert.strictEqual(f.valueChanged(),true);
    });
    it("knows the value has been set by setValue",function(){
        f.setValue(3);
        assert.strictEqual(f.valueChanged(),false);
    });
    
});

describe("StringArrayField",function(){
 
    require("../Fields.js");
 
    
    var f=Apoco.field["stringArray"]({name:"stringArrayField",value:["one","two","three"]});
    it("creates a div",function(){
        var b=f.getElement();
        assert.isObject(b); 
        document.getElementsByTagName("body")[0].appendChild(b);
    });
    it("creates a list",function(){
        //var e=$("body").find("div[name='stringArrayField']").find("li");
        var e=document.getElementsByName("stringArrayField")[0].getElementsByTagName("li");
        assert.strictEqual(e.length,3);
    });
    it("sets the values",function(){
        //var e=$("body").find("div[name='stringArrayField']").find("input");
        var e=document.getElementsByName("stringArrayField")[0].getElementsByTagName("input");
        assert.strictEqual(e.length,3);
        assert.strictEqual(e[0].value,"one");
        assert.strictEqual(e[1].value,"two");
        assert.strictEqual(e[2].value,"three");
        
    });
    it("has a method to get value array",function(){
        var r=f.getValue();
        assert.sameMembers(r,["one","two","three"]);
    });
    it("can add an empty field",function(){
        var r=document.getElementsByName("stringArrayField")[0].getElementsByTagName("span")[0];
        //$("body").find("div[name='stringArrayField']").find('span.plus');
        assert.isObject(r);
        //$(r).trigger("click");
        r.click();
        //var e=$("body").find("div[name='stringArrayField']").find("input");
        var e=document.getElementsByName("stringArrayField")[0].getElementsByTagName("input");
        assert.strictEqual(e.length,4);
    });
    it("rejects a value of the wrong type",function(){
        var fn=function(){
            f.setValue(10);
        };
        assert.throws(fn,"StringArrayField: setValue not an array"); 
        //f.setValue(["big","small"]);
    });
    it("can add a new value",function(){
        f.addValue("hhhh");
        var p=f.getValue();
        assert.strictEqual(p.length,4);
    });
    it("has a reset method",function(){
        f.resetValue();
        var p=f.getValue();
     //   for(var i=0;i<p.length;i++){
    //        console.log("reset %j",p);
    //    }
        assert.strictEqual(p.length,3);
    });
    it("knows the value has been changed in the browser",function(){
        f.addValue("nnn");
        assert.strictEqual(f.valueChanged(),true);
    });
    it("returns itself from a call to addValue",function(){
        var p=f.addValue("ahh");
        assert.strictEqual(p,f);
    });      
    
    it("returns itself from a call to setValue",function(){
        var p=f.setValue("ahh",1);
        assert.strictEqual(p,f);
    });      
    
});






describe("ImageArrayField",function(){
  
    require("../Fields.js");
 
    
    var f=Apoco.field["imageArray"]({name:"imageArrayField"});
    it("creates a div",function(){
        var b=f.getElement();
        assert.isObject(b); 
        document.getElementsByTagName("body")[0].appendChild(b);
    });
    it("can load images",function(){
        var b=[{src:"../css/images/alchemist2.jpg"},{src:"../css/images/alchemist1.jpg"}];
        var p=f.loadImages(b);
        assert.strictEqual(p.length,2);
    });
    it("can make thumbnails",function(){
        f.mkThumbnails();
        var n=document.getElementsByClassName("imageArray");
        assert.isObject(n[0]);
    });

});

describe("FileReaderField",function(){
    require("../Fields.js");
    var f=Apoco.field["fileReader"]({type:"file",name:"fileReader"});
    it("creates a div",function(){
        var b=f.getElement();
        assert.isObject(b); 
        document.getElementsByTagName("body")[0].appendChild(b);
    });
     it("creates an input element",function(){
         var b=f.getElement();
         assert.isObject(b);
         var r=document.getElementsByName("fileReader")[0].getElementsByTagName("input")[0];
         assert.isObject(r);
     });
   /* it("can read a file",function(){
        var r=document.getElementsByName("fileReader")[0].getElementsByTagName("input")[0];
       // r.value="../css/images/alchemist1.jpg";
        // var p=f.getValue();
     //   r.trigger("../css/images/alchemist1.jpg");
       // var event = new window.Event('change');
        // Dispatch it.
       // r.dispatchEvent(event);
        var p=f.getPromises();
        // assert.strictEqual(p.length,1);
        assert(p.length,1);
        p.then(function(){
            var pp=document.getElementsByName("fileReader")[0].getElementsByTagName("embed")[0];
            assert.isObject(pp);
        });

    
    });*/
    it("can read a file from value array",function(){
        var o={},file;
        // calling getFiles to get the data
        var promise=Apoco.IO.getFiles([{name:"../css/images/alchemist1.jpg",
                                        type: "/images/jpeg"}],o);
        
        promise[0].then(function(ff){
            file=ff;
            var f=Apoco.field["fileReader"]({type:"file",
                                             value:[{name:ff.name,
                                                     type: "/images/jpeg",
                                                     data:ff.data}
                                                   ],
                                             name:"fileReader"});
            var r=document.getElementsByName("fileReader")[0].getElementsByTagName("input")[0];
            assert.isObject(r);
            var r=document.getElementsByName("fileReader")[0].getElementsByTagName("embed")[0];
            assert.isObject(r);
        });
        
    });
    
    
    
});

describe("AutoCompleteField",function(){
  
    require("../Fields.js");
        
    var f=Apoco.field["autoComplete"]({name:"autoCompleteField",type: "string",options:["one","two","three"]});
    it("creates a div",function(){
        var b=f.getElement();
        assert.isObject(b); 
        document.getElementsByTagName("body")[0].appendChild(b);
    });
    it("has added the initial options",function(){
        assert.strictEqual(f.options.length,3);
    });
    it("can add options",function(){
        var p=["adfgd","aa","safsd","bbbbndsa","dff"];
        f.addOptions(p);
        assert.strictEqual(f.options.length,8);
    });
    it("can add a subset of the options to the select element",function(){
        var t=f.contains(f.options,"a");
        assert.strictEqual(t.length,2); // only 2 elements start with a
    });
    it("puts the matching options into the DOM ",function(){
        f.addOptions(["throw","through"]);
        var c=0,ar=f.contains(f.options,"thr");
        f._make_list(ar);
        var t=f.element.getElementsByTagName("li");
       // console.log("VVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV Got " + t.length + " number of lis");
        for(var i=0;i<t.length;i++){
         //   console.log("visibility is "+ t[i].style.visibility );
            if(t[i].style.visibility === "inherit"){
                c++;
            }
        }
        assert.strictEqual(c,3);
    });
    it("has a getValue method",function(){
        var b=f.getValue();
        assert.strictEqual(b,null);     
    });
    it("knows the value has changed in the browser",function(){
        var b=document.getElementsByName("autoCompleteField")[0].getElementsByTagName("input")[0];
        b.value="note";
        assert.strictEqual(f.getValue(),"note");
        assert.strictEqual(f.valueChanged(),true);
    });

});




const Apoco=require('../declare').Apoco;

require("../Types.js");

const assert = require('chai').assert;

describe("CheckType(blank)",function() {
    it("returns true on empty string",function(){
        assert.strictEqual(Apoco.type["blank"].check(""),true);
    });
    it("returns true with no arg",function(){
        assert.strictEqual(Apoco.type["blank"].check(),true);
    });
    it("returns true on undefined",function(){
        assert.strictEqual(Apoco.type["blank"].check(undefined),true);
    });
    it("returns true on null",function(){
        assert.strictEqual(Apoco.type["blank"].check(null),true);
    });
});


describe("CheckType(phoneNumber)",function() {
    it("returns false on empty string",function(){
        assert.strictEqual(Apoco.type["phoneNumber"].check(""),false);
    });
    it("returns true for a mobile number",function(){
        assert.strictEqual(Apoco.type["phoneNumber"].check("07714576205"),true);
    });
    it("returns true for a number with std code",function(){
        assert.strictEqual(Apoco.type["phoneNumber"].check("+44(0)7714576205"),true);
    });
    it("returns false for an implausibly small number",function(){
        assert.strictEqual(Apoco.type["phoneNumber"].check("1"),false);
    });
    it("returns false for a string",function(){
        assert.strictEqual(Apoco.type["phoneNumber"].check("ffgjk"),false);
    });
    it("returns false for an array",function(){
        assert.strictEqual(Apoco.type["phoneNumber"].check(["ffgjk","y7ui"]),false);
    });
});

describe("CheckType(number)",function() {
    it("returns false on empty string",function(){
        assert.strictEqual(Apoco.type["number"].check(""),false);
    });
    it("returns false on a string",function(){
        assert.strictEqual(Apoco.type["number"].check("rew"),false);
    });
    it("returns true on a positive integer",function(){
        assert.strictEqual(Apoco.type["number"].check("10"),true);
    });
    it("returns true on a negative integer",function(){
        assert.strictEqual(Apoco.type["number"].check(-10),true);
    });
    it("returns true on a positive float",function(){
        assert.strictEqual(Apoco.type["number"].check("10.43"),true);
    });
    it("returns true on a negative float",function(){
        assert.strictEqual(Apoco.type["number"].check("-10.43"),true);
    });
    
});
describe("CheckType(negative integer)",function() {
    it("returns false on empty string",function(){
        assert.strictEqual(Apoco.type["negativeInteger"].check(""),false);
    });
    it("returns false on a string",function(){
        assert.strictEqual(Apoco.type["negativeInteger"].check("rew"),false);
    });
    it("returns false on a positive integer",function(){
        assert.strictEqual(Apoco.type["negativeInteger"].check(10),false);
    });
    it("returns true on a negative integer",function(){
        assert.strictEqual(Apoco.type["negativeInteger"].check(-10),true);
    });
    it("returns false on a negative float",function(){
          assert.strictEqual(Apoco.type["negativeInteger"].check(-10.89),false);
    });
    it("returns false for an array",function(){
        assert.strictEqual(Apoco.type["negativeInteger"].check(["ffgjk","y7ui"]),false);
    });
});

describe("CheckType(positive integer)",function() {
    it("returns false on empty string",function(){
        assert.strictEqual(Apoco.type["positiveInteger"].check(""),false);
    });
    it("returns false on a string",function(){
        assert.strictEqual(Apoco.type["positiveInteger"].check("rew"),false);
    });
    it("returns false on a negative integer",function(){
        assert.strictEqual(Apoco.type["positiveInteger"].check("-10"),false);
    });
    it("returns false on a positive float",function(){
        assert.strictEqual(Apoco.type["positiveInteger"].check("10.43"),false);
    });
    it("returns true on a positive integer",function(){
        assert.strictEqual(Apoco.type["positiveInteger"].check("10"),true);
    });
    it("returns false for an array",function(){
        assert.strictEqual(Apoco.type["positiveInteger"].check(["ffgjk","y7ui"]),false);
    });     
});

describe("CheckType(integer)",function() {
    it("returns false on empty string",function(){
        assert.strictEqual(Apoco.type["integer"].check(""),false);
    });
    it("returns false on a string",function(){
        assert.strictEqual(Apoco.type["integer"].check("rew"),false);
    });
    it("returns true on a negative integer",function(){
        assert.strictEqual(Apoco.type["integer"].check("-10"),true);
    });
    it("returns false on a positive float",function(){
        assert.strictEqual(Apoco.type["integer"].check("10.43"),false);
    });
    it("returns true on a positive integer",function(){
        assert.strictEqual(Apoco.type["integer"].check("10"),true);
    });
});

describe("CheckType(count)",function() {
    it("returns false on empty string",function(){
        assert.strictEqual(Apoco.type["count"].check(""),false);
    });
    it("returns false on a string",function(){
        assert.strictEqual(Apoco.type["count"].check("rew"),false);
    });
    it("returns true on a negative integer",function(){
        assert.strictEqual(Apoco.type["count"].check("-10"),true);
    });
    it("returns true on a positive float",function(){
        assert.strictEqual(Apoco.type["count"].check("10.43"),true);
    });
    it("returns true on a positive integer",function(){
        assert.strictEqual(Apoco.type["integer"].check("10"),true);
    });
});


describe("CheckType(float)",function() {
    it("returns false on empty string",function(){
        assert.strictEqual(Apoco.type["float"].check(""),false);
    });
    it("returns false on string",function(){
        assert.strictEqual(Apoco.type["float"].check("dfs"),false);
    });
    it("returns true on float as string",function(){
        assert.strictEqual(Apoco.type["float"].check("10.2"),true);
    });
    it("returns true on integer as string",function(){
        assert.strictEqual(Apoco.type["float"].check("10"),true);
    });
    it("returns true on 0 as string",function(){
        assert.strictEqual(Apoco.type["float"].check("0"),true);
    });
    it("returns true on 0",function(){
        assert.strictEqual(Apoco.type["float"].check(0),true);
    });
    it("returns true on a negative number",function(){
        assert.strictEqual(Apoco.type["float"].check(-20),true);
    });
    it("returns true on a number 0.9090999909",function(){
        assert.strictEqual(Apoco.type["float"].check(0.90909999001),true);
    });
    it("returns true on a number 3213212310.9090999909",function(){
        assert.strictEqual(Apoco.type["float"].check(3213212310.90909999001),true);
    });
});

describe("CheckType(decimal)",function() {
    it("returns false on empty string",function(){
        assert.strictEqual(Apoco.type["decimal"].check(""),false);
    });
    it("returns false on sqrt(-1)",function(){
        assert.strictEqual(Apoco.type["decimal"].check(Math.sqrt(-1)),false);
    });
});

describe("CheckType(integerArray)",function() {
    it("returns false on empty string",function(){
        assert.strictEqual(Apoco.type["integerArray"].check(""),false);
    });
    it("returns false on a string",function(){
        assert.strictEqual(Apoco.type["integerArray"].check("werrw"),false);
    });
    it("returns false on a string array",function(){
           assert.strictEqual(Apoco.type["integerArray"].check(["werrw","ew","we"]),false);
    });
    it("returns true on an integer array",function(){
        assert.strictEqual(Apoco.type["integerArray"].check([1,2,3,4,5]),true);
    });
    it("returns false on an  array containing any floats",function(){
        assert.strictEqual(Apoco.type["integerArray"].check([1.3,2.4,3,4,5]),false);
    });
    it("returns false on an integer array with a missing value",function(){
        assert.strictEqual(Apoco.type["integerArray"].check([1,2,"eert",4,5]),false);
    });
});

describe("CheckType(text)",function() {
    it("returns false on empty string",function(){
        assert.strictEqual(Apoco.type["text"].check(""),false);
    });
    it("returns true on an array of numbers",function(){
        assert.strictEqual(Apoco.type["text"].check([1,2,3,4]),true);
    });
});

describe("CheckType(floatArray)",function() {
    it("returns false on empty string",function(){
        assert.strictEqual(Apoco.type["floatArray"].check(""),false);
    });
    it("returns false on an array of strings",function(){
        assert.strictEqual(Apoco.type["floatArray"].check(["one","two","three"]),false);
    });
    it("returns true on an array of integers as strings",function(){
        assert.strictEqual(Apoco.type["floatArray"].check(["1","-3","2"]),true);
    });
    it("returns true on an array of floats as strings",function(){
        assert.strictEqual(Apoco.type["floatArray"].check(["100.4","-3213212310","2.9080"]),true);
    });
    it("returns true on an array of integers",function(){
        assert.strictEqual(Apoco.type["floatArray"].check([1,-3,"2"]),true);
    });
    it("returns true on an array of floats",function(){
        assert.strictEqual(Apoco.type["floatArray"].check([100.4,-3213212310,2.9080]),true);
    });
     it("returns false if an element of the array is undefined",function(){
         assert.strictEqual(Apoco.type["floatArray"].check(["1","-3","2",undefined]),false);
    });
    
});

describe("CheckType(alphabetic)",function() {
    it("returns false on empty string",function(){
        assert.strictEqual(Apoco.type["alphabetic"].check(""),false);
    });
    it("returns false on an alphanumeric string",function(){
        assert.strictEqual(Apoco.type["alphabetic"].check("wer45"),false);
    });
    it("returns false on an array of alphabetic strings",function(){
        assert.strictEqual(Apoco.type["alphabetic"].check(["wer","fjk"]),false);
    });
    it("returns true on an  alphabetic string",function(){
        assert.strictEqual(Apoco.type["alphabetic"].check("werTYdas"),true);
    });
    it("returns false with punctuation !",function(){
        assert.strictEqual(Apoco.type["alphabetic"].check("werTYdas!"),false);
    });
    it("returns false with punctuation -",function(){
        assert.strictEqual(Apoco.type["alphabetic"].check("werTYdas-"),false);
    });
    
});
describe("CheckType(string)",function() {
    it("returns true on empty string",function(){
        assert.strictEqual(Apoco.type["string"].check(""),true);
    });
    it("returns true on integer string",function(){
        assert.strictEqual(Apoco.type["string"].check("10"),true);
    });
    it("returns false on integer ",function(){
        assert.strictEqual(Apoco.type["string"].check(10),false);
    });
});

describe("CheckType(password)",function() {
    it("returns false on empty string",function(){
        assert.strictEqual(Apoco.type["password"].check(""),false);
    });
    it("returns false on null",function(){
        assert.strictEqual(Apoco.type["password"].check(null),false);
    });
    it("returns false on undefined",function(){
        assert.strictEqual(Apoco.type["password"].check(undefined),false);
    });
    it("returns true on string",function(){
        assert.strictEqual(Apoco.type["password"].check("hjhkjkjh"),true);
    });
});

describe("CheckType(alphaNum)",function() {
    it("returns false on empty string",function(){
        assert.strictEqual(Apoco.type["alphaNum"].check(""),false);
    });
    it("returns true on ag46fds",function(){
        assert.strictEqual(Apoco.type["alphaNum"].check("ag46fd"),true);
    });
    it("returns true on integer",function(){
        assert.strictEqual(Apoco.type["alphaNum"].check(10),true);
    });
    it("returns false on float",function(){
        assert.strictEqual(Apoco.type["alphaNum"].check(10.5),false);
    });
});

describe("CheckType(token)",function() {
    it("returns false on empty string",function(){
        assert.strictEqual(Apoco.type["token"].check(""),false);
    });
    it("returns true on integer",function(){
        assert.strictEqual(Apoco.type["token"].check(10),true);
    });
    it("returns true on float",function(){
        assert.strictEqual(Apoco.type["token"].check(10.34),true);
    });
    it("returns true on FG19_19.2",function(){
        assert.strictEqual(Apoco.type["token"].check("FG19_19.2"),true);
    });
    it("returns true on 28-19",function(){
        assert.strictEqual(Apoco.type["token"].check("28-19"),true);
    });
    it("returns true on #28-19",function(){
        assert.strictEqual(Apoco.type["token"].check("#28-19"),true);
    });
    it("returns false on null",function(){
        assert.strictEqual(Apoco.type["token"].check(null),false);
    });
});

describe("CheckType(email)",function() {
    it("returns false on empty string",function(){
        assert.strictEqual(Apoco.type["email"].check(""),false);
    });
    it("returns true on ff@junk.com",function(){
        assert.strictEqual(Apoco.type["email"].check("ff@junk.com"),true);
    });
    it("returns false on ff@junk",function(){
        assert.strictEqual(Apoco.type["email"].check("ff@junk"),false);
    });
    
});

describe("CheckType(currency)",function() {
    it("returns false on empty string",function(){
        assert.strictEqual(Apoco.type["currency"].check(""),false);
    });
    it("returns true for GBP450.50",function(){
        assert.strictEqual(Apoco.type["currency"].check("GBP450.50"),true);
    });
    it("returns true for GBP56,450.50",function(){
        assert.strictEqual(Apoco.type["currency"].check("GBP56,450.50"),true);
    });
    it("returns true for GBP 56,450.50",function(){
        assert.strictEqual(Apoco.type["currency"].check("GBP 56,450.50"),true);
    });
    it("returns true for GBP 56,450",function(){
        assert.strictEqual(Apoco.type["currency"].check("GBP 56,450"),true);
    });
    it("returns false for  56,450 USD",function(){
        assert.strictEqual(Apoco.type["currency"].check("56,450 USD"),false);
    }); 
});

describe("CheckType(date)",function() {
    it("returns false on empty string",function(){
        assert.strictEqual(Apoco.type["date"].check(""),false);
    });
    it("returns true on 20170612",function(){
        assert.strictEqual(Apoco.type["date"].check("20170612"),true);
    });
    it("returns false on 20170632",function(){
        assert.strictEqual(Apoco.type["date"].check("20170632"),false);
    });
});

describe("CheckType(time)",function() {
    it("returns false on empty string",function(){
        assert.strictEqual(Apoco.type["time"].check(""),false);
    });
    it("returns true on 12:00",function(){
        assert.strictEqual(Apoco.type["time"].check("12:00"),true);
    });
    it("returns true on 23:12",function(){
        assert.strictEqual(Apoco.type["time"].check("23:12"),true);
    });
    it("returns true on 10:10PM",function(){
        assert.strictEqual(Apoco.type["time"].check("10:10PM"),true);
    });
    it("returns false on 10",function(){
        assert.strictEqual(Apoco.type["time"].check(10),false);
    });
    it("returns false on AM",function(){
        assert.strictEqual(Apoco.type["time"].check("AM"),false);
    });
    it("returns false on 10 as string",function(){
        assert.strictEqual(Apoco.type["time"].check("10"),false);
    }); 
});

describe("CheckType(image)",function() {
    it("returns false on empty string",function(){
        assert.strictEqual(Apoco.type["image"].check(""),false);
    });
});

describe("CheckType(boolean)",function() {
    it("returns false on empty string",function(){
        assert.strictEqual(Apoco.type["boolean"].check(""),false);
    });
    it("returns true with value false",function(){
        assert.strictEqual(Apoco.type["boolean"].check(false),true);
    });
    it("returns true with string value false",function(){
        assert.strictEqual(Apoco.type["boolean"].check("false"),true);
    });
    it("returns true with value 0",function(){
        assert.strictEqual(Apoco.type["boolean"].check(0),true);
    });
});

         
describe("CheckType(array)",function() {
    it("returns false on empty string",function(){
        assert.strictEqual(Apoco.type["array"].check(""),false);
    });
    it("returns false on integer",function(){
        assert.strictEqual(Apoco.type["array"].check(10),false);
    });
    it("returns false on string",function(){
        assert.strictEqual(Apoco.type["array"].check("dog"),false); 
    });
    it("returns true on empty array",function(){
        assert.strictEqual(Apoco.type["array"].check([]),true); 
    });
    it("returns true on  array",function(){
        assert.strictEqual(Apoco.type["array"].check(["a"]),true); 
    });
});

describe("CheckType(object)",function() {
    it("returns false on empty string",function(){
        assert.strictEqual(Apoco.type["object"].check(""),false);
    });
    it("returns false when value is a function",function(){
        assert.strictEqual(Apoco.type["object"].check(function(){}),false);
    });
    it("returns false when value is null",function(){
        assert.strictEqual(Apoco.type["object"].check(null),false);
    });
    it("returns false when value is undefined",function(){
        assert.strictEqual(Apoco.type["object"].check(undefined),false);
    });
});

describe("CheckType(function)",function() {
    it("returns false on empty string",function(){
        assert.strictEqual(Apoco.type["function"].check(""),false);
    });
    it("returns false on null",function(){
        assert.strictEqual(Apoco.type["function"].check(null),false);
    });
    it("returns false on {}",function(){
        assert.strictEqual(Apoco.type["function"].check({}),false);
    });
    it("returns true when value is a function",function(){
        assert.strictEqual(Apoco.type["function"].check(function(){}),true);
    });
});

describe("CheckType(imageArray)",function() {
    it("returns false on empty string",function(){
        assert.strictEqual(Apoco.type["imageArray"].check(""),false);
    });
});

describe("CheckType(objectArray)",function() {
    it("returns false on empty string",function(){
        assert.strictEqual(Apoco.type["objectArray"].check(""),false);
    });
    it("returns false on an integer array",function(){
        assert.strictEqual(Apoco.type["objectArray"].check([0,1,2]),false);
    });
    it("returns true on an object array",function(){
        var t=[{"a":1},{"b":2}];
        assert.strictEqual(Apoco.type["objectArray"].check(t),true);
    });
    it("returns false if array contains one element that is not  an object ",function(){
        var t=[{"a":1},{"b":2},"pig"];
        assert.strictEqual(Apoco.type["objectArray"].check(t),false);
    });
});

describe("CheckType(stringArray)",function() {
    it("returns false on empty string",function(){
        assert.strictEqual(Apoco.type["stringArray"].check(""),false);
    });
    it("returns false on an integer array",function(){
        assert.strictEqual(Apoco.type["stringArray"].check([0,1,2]),false);
    });
    it("returns true on a array of integer strings",function(){
        assert.strictEqual(Apoco.type["stringArray"].check(["9","8","7"]),true);
    });
});

describe("CheckType(floatArray)",function() {
    it("returns false on empty string",function(){
        assert.strictEqual(Apoco.type["floatArray"].check(""),false);
    });
    it("returns true on an integer array",function(){
        assert.strictEqual(Apoco.type["floatArray"].check([0,1,2]),true);
    });
    it("returns false if array contains a string",function(){
        assert.strictEqual(Apoco.type["integerArray"].check([0,1,2,"dog"]),false);
    });   
});

describe("CheckType(integerArray)",function() {
    it("returns false on empty string",function(){
        assert.strictEqual(Apoco.type["integerArray"].check(""),false);
    });
    it("returns false for [true,false,true]",function(){
        assert.strictEqual(Apoco.type["integerArray"].check([true,false,true]),false);
    });
    it("returns true on an integer array",function(){
        assert.strictEqual(Apoco.type["integerArray"].check([0,1,2]),true);
    });
    it("returns false if array contains a float",function(){
        assert.strictEqual(Apoco.type["integerArray"].check([0,1,2,10.5]),false);
    });       
});

describe("CheckType(booleanArray)",function() {
    it("returns false on empty string",function(){
        assert.strictEqual(Apoco.type["booleanArray"].check(""),false);
    });
    it("returns true for [true,false,true]",function(){
        assert.strictEqual(Apoco.type["booleanArray"].check([true,false,true]),true);
    });
    it("returns false on a string",function(){
        assert.strictEqual(Apoco.type["booleanArray"].check("true"),false);
    });
    it("returns false for [true,false,blue,true]",function(){
         assert.strictEqual(Apoco.type["booleanArray"].check("[true,false,blue,true]"),false);
     });
    it("returns true for [0,false,1,true,0]",function(){
        assert.strictEqual(Apoco.type["booleanArray"].check([0,true,false,1,true]),true);
    });
    it("returns false on an integer array",function(){
        assert.strictEqual(Apoco.type["booleanArray"].check([0,1,2]),false);
    });
});

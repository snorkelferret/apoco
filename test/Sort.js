const Apoco=require('../declare').Apoco;

require("../Sort.js");

const assert = require('chai').assert;
const expect = require('chai').expect;

describe("Sort",function() {
    it("sorts an array of integers",function(){
        var b=[32,535,5454,6,77,879,5];
        Apoco.sort(b,"integer");
        expect(b).to.eql([5,6,32,77,535,879,5454]);
    });
    it("sorts an array of strings",function(){
        var b=["fog","dog","apple","zebra"];
        Apoco.sort(b,"string");
        expect(b).to.eql(["apple","dog","fog","zebra"]);
    });
    it("sorts an array of dates",function(){
        var b=[20200521,20160624,20300113,20200814];
        Apoco.sort(b,"date");
        expect(b).to.eql([20160624,20200521,20200814,20300113]);
    });
    it("sorts an array of alphanumerics",function(){
        var b=["x43","dsa4","X43","rew42","3","rwd","s56","f"];
        Apoco.sort(b,"alphaNum");
        expect(b).to.eql(["3","X43", "dsa4","f","rew42","rwd","s56","x43"]);
    });
    it("sorts an array of negative integers",function(){
        var b=[20,-200,-45,20,-4,-55];
        Apoco.sort(b,"negativeInteger");
        expect(b).to.eql([20,20,-4,-45,-55,-200]);
    });
    it("throws an error if it is given an unsortable type",function(){
        var b=["rew00",234,"ad",0];
        var fn=function(){
            Apoco.sort(b,"boolean");
        };
        assert.throws(fn,"Sort: don't know how to sort " );
    });
    it("can sort dates of the form YYYY-MM-DD",function(){
        var b=["2018-05-12","2013-04-22","2020-03-21","2010-10-01"];
        Apoco.sort(b,"date");
        expect(b).to.eql(["2010-10-01","2013-04-22","2018-05-12","2020-03-21"]);
    });
    it("can sort a complex object",function(){
        var b=[{stock: "AAB" ,maturity: 20171105 ,subclass: 12 },
               {stock: "AAE" ,maturity: 20201129 ,subclass: 11 },
               {stock: "AAF" ,maturity: 20210523 ,subclass: 0 },
               {stock: "AAC" ,maturity: 20180214 ,subclass: 8 },
               {stock: "AAD" ,maturity: 20191022 ,subclass: 7 },
               {stock: "AAG" ,maturity: 20221010 ,subclass: 10 }];
        Apoco.sort(b,[{type:"string",fn:function(a){return a["stock"];}},
                       {type: "integer",fn: function(a){return a["maturity"];}}]);
        
        expect(b).to.eql([{"maturity": 20171105,"stock": "AAB","subclass": 12},
                          {"maturity": 20180214,"stock": "AAC","subclass": 8},
                          {"maturity": 20191022,"stock": "AAD","subclass": 7},
                          {"maturity": 20201129,"stock": "AAE","subclass": 11},
                          {"maturity": 20210523,"stock": "AAF","subclass": 0},
                          {"maturity": 20221010,"stock": "AAG","subclass": 10}]);
    });
    
});
 

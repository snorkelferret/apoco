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
        var b=["2020-05-21","2016-06-24","2030-01-13","2020-08-14"];
        Apoco.sort(b,"date");
        expect(b).to.eql(["2016-06-24","2020-05-21","2020-08-14","2030-01-13"]);
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
        var b=[{stock: "AAB" ,maturity: '2017-11-05' ,subclass: 12 },
               {stock: "AAE" ,maturity: '2020-11-29' ,subclass: 11 },
               {stock: "AAF" ,maturity: '2021-05-23' ,subclass: 0 },
               {stock: "AAC" ,maturity: '2018-02-14' ,subclass: 8 },
               {stock: "AAD" ,maturity: '2019-10-22' ,subclass: 7 },
               {stock: "AAG" ,maturity: '2022-10-10' ,subclass: 10 }];
        Apoco.sort(b,[{type:"string",fn:function(a){return a["stock"];}},
                       {type: "date",fn: function(a){return a["maturity"];}}]);
        
        expect(b).to.eql([{"maturity": '2017-11-05',"stock": "AAB","subclass": 12},
                          {"maturity": '2018-02-14',"stock": "AAC","subclass": 8},
                          {"maturity": '2019-10-22',"stock": "AAD","subclass": 7},
                          {"maturity": '2020-11-29',"stock": "AAE","subclass": 11},
                          {"maturity": '2021-05-23',"stock": "AAF","subclass": 0},
                          {"maturity": '2022-10-10',"stock": "AAG","subclass": 10}]);
    });
    
});
 

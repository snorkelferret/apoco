var Harvey=require('../declare').Harvey;

require("../Utils");

var assert = require('chai').assert;

describe("formatDate",function() {
    it("formats",function(){
        assert.strictEqual(Harvey.Utils.formatDate("2016-04-15"),
                          "Friday 15th April 2016");
    });
});

const Harvey=require('../declare').Harvey;

require("../Utils");

const assert = require('chai').assert;

describe("Utils: formatDate",function() {
    it("formats",function(){
        assert.strictEqual(Harvey.Utils.formatDate("2017-04-15"),
                          "Saturday 15th April 2017");
    });
});


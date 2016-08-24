const Apoco=require('../declare').Apoco;

require("../Utils");

const assert = require('chai').assert;

describe("Utils: formatDate",function() {
    it("formats",function(){
        assert.strictEqual(Apoco.Utils.formatDate("2017-04-15"),
                          "Saturday 15th April 2017");
    });
});


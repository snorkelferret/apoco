var      $ = require('jquery');
var Harvey = require('./declare.js').Harvey, UI = require('./declare.js').UI;

// set all instances of the datepicker to these default values
$.datepicker.setDefaults({
   // showOn: 'both',
    dateFormat: 'yymmdd' //'yy-mm-dd'   //'IS0_8601'   // yyyy-mm-dd
    // buttonImageOnly: true,
    // buttonImage: 'calendar.gif',
    // buttonText: 'Calendar'
});

// core harvey initialisation
//

window.onerror=function(msg,url,lineno){
    Harvey.popup.dialog(url, ("line number " + lineno + " " + msg));
};

console.log=window.opener.console.log;
_.extend(true,Harvey,{
    childReady: function(){
	window.onload=function(){
	    var e=new Event("childReady");
	    e.data=window;
	    console.log("Harvey.childReady here ");
	    window.opener.dispatchEvent(e);
	};
    }

});

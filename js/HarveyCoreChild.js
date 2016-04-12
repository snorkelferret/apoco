

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

// Harvey is a singleton for each window session
//var Harvey ={};
var Harvey=(function($){
    'use strict';

    var DEBUG=false;
    var that=this;

    if(typeof Harvey !== "undefined"){
	throw new Error("Harvey already exists");
	return null;
    }
  
    window.onerror=function(msg,url,lineno){
	Harvey.popup.dialog(url, ("line number " + lineno + " " + msg)); 
    };

    console.log=window.opener.console.log;
    return {
	childReady: function(){
	    window.onload=function(){
		var e=new Event("childReady");
		e.data=window;
		console.log("Harvey.childReady here ");
		window.opener.dispatchEvent(e);
	    };
	}
   
    };
 
    
})(jQuery);

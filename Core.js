var Harvey=require('./declare').Harvey,UI=require('./declare').UI,jQuery=require('jquery');

function require_(script) {
    $.ajax({
        url: script,
        dataType: "script",
        async: false,           // <-- This is the key
        success: function () {
            // all good...
        },
        error: function () {
            throw new Error("Could not load script " + script);
        }
    });
}

//You can then use it in your code as you'd usually use an include:

//require_("/scripts/subscript.js");

// enable tooltips on everything
//$(document).tooltip({tooltipClass: "tooltip"});


// Harvey is a singleton for each window session

(function($){
    'use strict';

    var DEBUG=false;
    var that=this;

    // set all instances of the datepicker to these default values
    $.datepicker.setDefaults({
        // showOn: 'both',
        dateFormat: 'yymmdd' //'yy-mm-dd'   //'IS0_8601'   // yyyy-mm-dd
        // buttonImageOnly: true,
	// buttonImage: 'calendar.gif',
	// buttonText: 'Calendar'
    });

    window.onerror=function(msg,url,lineno){
	Harvey.popup.dialog(url, ("line number " + lineno + " " + msg));
    };

/*
    window.onerror=function(msg,url,lineno,colno,error){
	Harvey.display.dialog(url, ("line number " + lineno + " " + msg + " stack trace " + error.stack ));
    };  */
    window.addEventListener('beforeunload',function(e){  // 5 seconds to delete everything
        var d=$.Deferred();
        $(window.document.body).hide();
        var t=window.setTimeout(function(){ Harvey.Panel.deleteAll(d); },500000);
        d.done( function(){  window.clearTimeout(t);});
    });

    $.extend(true,Harvey,{
	start: function(options) {
            /*  if(Harvey.Utils.detectMobile()){
             $("body").width(360);
             $("body").height(640);
             } */
	    // Harvey.popup.spinner(true);
            if(options){
	        if(Harvey.checkType["object"](options)){
		    var p=Harvey.display[options.display](options);
		    if(p){
		        //  console.log("calling execute");
		        if(p.execute){
			    p.execute();
		        }
		        else { throw new Error("p.execute does not exist");}
		        p.show();
		    }
		    else {
		        throw new Error("could not execute " + k);
		    }
	        }
            }
	},
        stop: function(){
            Harvey.Panel.deleteAll();
            if(Harvey.webSocket){
                Harvey.webSocket.close();
            }

        }

    });

})(jQuery);

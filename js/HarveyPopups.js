var Harvey = require('./declare.js');

;(function($){
    'use strict';

    var popups={

	dialog: function(title, message,no_close){
	    var Hdialog;
	    if($("#Harvey_dialog").length === 0){
		// if(DEBUG)log("DIALOG ----- dialog does not exist");
		Hdialog=$("<div id='Harvey_dialog' title='" + title + "' ></div>");
		var p=$("<p> " + message + "</p>");
		Hdialog.append("<span class= 'ui-icon ui-icon-circle-check'> </span>");
		Hdialog.append(p);
		// Harvey.display.Content.append(Hdialog);
		Hdialog.dialog({ modal: true,
				 autoOpen: false,
				 buttons:{
				     OK: function(){
					 $(this).dialog("close");
				     }
				 }
			       });
	    }
	    else{
		//if(DEBUG)log("DIALOG ------------- EXISTS title now " + title + " message " + message);
		$("#Harvey_dialog").dialog("option", "title", title);
		$("#Harvey_dialog  p").remove();
		if(message !== undefined){
		    var p=$("<p> " + message + "</p>");
		    $("#Harvey_dialog").append(p);
		}
	    }
	    if(no_close){
		$("#Harvey_dialog").find('.ui-dialog-titlebar-close').addClass('hidden');		    }
	    else{
		$("#Harvey_dialog").find('.ui-dialog-titlebar-close').removeClass('hidden');
	    }
	    $("#Harvey_dialog").dialog('open');
	    this.dialog.close=function(){
		$("#Harvey_dialog").dialog('close');
	    };
	},

	spinner: function(on){
	    if($("#Harvey_spinner").length === 0){
		var spinner=$("<div id='Harvey_spinner'>  </div>");
		$(document.body).append(spinner);
	    }
	    if(on){
		//console.log("Harvey spinner on");
		$("#Harvey_spinner").show();
	    }
	    else{
		console.log("Harvey spinner off");
		$("#Harvey_spinner").hide();
	    }
            return spinner;
	},
	alert: function(text){

	    if($("#Harvey_alert").length == 0){
		var nd,ns,np;
		nd=$("<div id='Harvey_alert' class='ui-widget'></div>").draggable();
		ns=$("<div class='ui-state-error ui-corner-all' style='padding 10px'></div>");
		np=$("<p class='ui-state-error-text'> <span class='ui-icon ui-icon-alert' style='float: left;  margin: 10px;'>  </span> <strong> Alert: </strong> <span class='alert_text'> </span> </p>");
		ns.append(np);
		nd.append(ns);
		$("body").append(nd);
	    }
	    $("#Harvey_alert").show();
	    $("#Harvey_alert").find(".alert_text").text(text);
            $("#Harvey_alert").delay(6000).fadeOut(4000, function(){
                $(this).remove();
            });

	    return nd;

	},
	trouble: function(heading,text){
	    var a=$("<div  id='Harvey_trouble'>");
	    var b=$("<h1> " + heading + "</h1>");
	    a.append(b);
	    if(text){
		var c=$("<h1 style='margin-left: 100px;' > " + text + " </h1></div>");
		a.append(c);
	    }
	    // this should call a hard logging function
	    $(document.body).append(a);
            this.dialog("Unrecoverable Error","Please shutdown now");


	},

	statusCode: {
	    204: function(s) {
		Harvey.popup.dialog("Bad Return from server: 204","There is no content for this page " + s);
	    },
	    205: function(s){
		Harvey.popup.dialog("Bad Return from server: 205","Response requires that the requester reset the document view " + s);
	    },
	    400: function(s){  // Bad request
		Harvey.popup.dialog("Bad Return from server: 400","Bad request " + s);
	    },
	    401: function(s){
		Harvey.popup.dialog("Bad Return from server: 401","Unauthorised " + s);
	    },
	    403: function(s){
		Harvey.popup.dialog("Bad Return from server: 403","Forbidden " + s);
	    },
	    404: function(s) {
		Harvey.popup.dialog("Bad Return from server: 404","Not Found " + s);
	    },
	    410: function(s){
		Harvey.popup.dialog("Bad Return from server: 410","Gone " + s);
	    },
	    413: function(s){
		Harvey.popup.dialog("Bad Return from server: 413","Request entity too large " + s);
	    },
	    424: function(s){
		Harvey.popup.dialog("Bad Return from server: 424","Method Failure " + s);
	    },
	    500: function(s){
		Harvey.popup.dialog("Bad Return from server: 500","Internal server error " +s);
	    },
	    501: function(s){
		Harvey.popup.dialog("Bad Return from server: 501","Not Implemented " + s);
	    },
	    503: function(s){
		Harvey.popup.dialog("Bad Return from server: 503","Service unavailable " +s);
	    },
	    511: function(s){
		Harvey.popup.dialog("Bad Return from server: 511","Network authentication required " + s);
	    }
	}
    };
    $.extend(true, Harvey, {
	popup: popups
    });

})(require('jquery'));

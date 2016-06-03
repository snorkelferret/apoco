var Harvey = require('./declare.js').Harvey;

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

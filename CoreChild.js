var Apoco = require('./declare.js').Apoco;

window.onerror=function(msg,url,lineno){
    Apoco.popup.dialog(url, ("line number " + lineno + " " + msg));
};

console.log=window.opener.console.log;
_.extend(true,Apoco,{
    childReady: function(){
	window.onload=function(){
	    var e=new Event("childReady");
	    e.data=window;
	    console.log("Apoco.childReady here ");
	    window.opener.dispatchEvent(e);
	};
    }

});

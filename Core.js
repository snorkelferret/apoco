global.Harvey=require('./declare').Harvey;
global.UI=require('./declare').UI;
require("./index.js");
require("./Utils.js");
require("./Panel.js");
require("./Popups.js");


// Harvey is a singleton 

(function(){
    'use strict';

    var DEBUG=false;
    var that=this;
    window.onerror=function(msg,url,lineno,col_no,error){
   	Harvey.popup.error(url, ("line number " + lineno + " " + msg));
    };

    window.addEventListener('beforeunload',function(e){  
        Harvey.stop(); 
      /*  var t;
        var d=new Promise(function(resolve,reject){
            t=window.setTimeout(function(){
            Harvey.Panel.deleteAll(resolve);// },500000);
        });
        d.then( function(){
            console.log("got to then for beforeunload");
            window.clearTimeout(t);
        }).catch(function(result){
            Harvey.popup.error(result);
        }); */
      
    });
   
    //Harvey.mixinDeep(Harvey,{
    Harvey.start=function(options) {
	    // Harvey.popup.spinner(true);
           // console.log("++++++++++++++++++++++++++++++== Harvey start is here ");
          //  console.log("options are %j ",options);
            if(options){
	        if(!Harvey.checkType["array"](options) && Harvey.checkType["object"](options)){
		    var p=Harvey.display[options.display](options);
		    if(p){
		        p.show();
		    }
		    else {
		        throw new Error("could not execute " + options.display);
		    }
	        }
                else if(Harvey.checkType["array"](options)){
                    Harvey.Panel.UIStart(options);
                }
                else{
                    throw new Error("Harvey.start: Unknown options");
                }
            }
    };
    Harvey.stop=function(){
        Harvey.Panel.deleteAll();
        if(Harvey.webSocket){
            Harvey.webSocket.close();
        }

    };    //});
 
})();

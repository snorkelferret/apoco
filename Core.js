global.Apoco=require('./declare').Apoco;
global.UI=require('./declare').UI;
require("./index.js");
require("./Utils.js");
require("./Panel.js");
require("./Popups.js");


// Apoco is a singleton 

(function(){
    'use strict';

    var DEBUG=false;
    var that=this;
    window.onerror=function(msg,url,lineno,col_no,error){
   	Apoco.popup.error(url, ("line number " + lineno + " " + msg));
    };

    window.addEventListener('beforeunload',function(e){  
        Apoco.stop(); 
      /*  var t;
        var d=new Promise(function(resolve,reject){
            t=window.setTimeout(function(){
            Apoco.Panel.deleteAll(resolve);// },500000);
        });
        d.then( function(){
            console.log("got to then for beforeunload");
            window.clearTimeout(t);
        }).catch(function(result){
            Apoco.popup.error(result);
        }); */
      
    });
   
    //Apoco.mixinDeep(Apoco,{
    Apoco.start=function(options) {
	    // Apoco.popup.spinner(true);
           // console.log("++++++++++++++++++++++++++++++== Apoco start is here ");
          //  console.log("options are %j ",options);
            if(options){
	        if(!Apoco.type["array"].check(options) && Apoco.type["object"].check(options)){
		    var p=Apoco.display[options.display](options);
		    if(p){
		        p.show();
		    }
		    else {
		        throw new Error("could not execute " + options.display);
		    }
	        }
                else if(Apoco.type["array"].check(options)){
                    Apoco.Panel.UIStart(options);
                }
                else{
                    throw new Error("Apoco.start: Unknown options");
                }
            }
    };
    Apoco.stop=function(){
        Apoco.Panel.deleteAll();
        if(Apoco.webSocket){
            Apoco.webSocket.close();
        }

    };    //});
 
})();

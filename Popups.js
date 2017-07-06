var Apoco=require('./declare').Apoco;

;(function(){
    'use strict';

    // var popups={
    Apoco.popup={
        error:function(title,message){
            var t="ERROR ";
            if(Apoco.error === undefined){
                title=t.concat(title);
              //  console.log("error title is " + t);
                Apoco.error=this.dialog(title,message,true);
                Apoco.error.close=function(){
                    document.body.removeChild();
                };
                return;
            }
            Apoco.error.update(title,message,true);
        },
	dialog: function(title, message,modal){
            var mkDialog=function(title,message,modal){
	        var Hdialog,message_text,title_text,Modal,draggable;
                if(modal && Apoco.modal === undefined){
                    console.log("creating a modal " + message);
                    Apoco.modal=document.createElement("div");
                    Apoco.modal.id="Apoco_modal";
                }
	        if(message === undefined){
                    message="";
	        }
                if(title === undefined){
                    title="";
                }
                if(modal === undefined){
                    modal=false;
                }

                this.close=function(){
                   // console.log("click closed is here");
                   // console.log("Gdiakof is " + Hdialog);
                    if(modal === true){
                        Apoco.modal.removeChild(Hdialog);
                        document.body.removeChild(Apoco.modal);
                    }
                    else{
                        document.body.removeChild(Hdialog);
                    }
                };

                this.create=function(){
                    var s,b,t,header;
                    Hdialog=document.createElement("div");
                    Hdialog.classList.add("apoco_dialog");
                    draggable=Apoco.Utils.draggable(Hdialog);

                    // create header
                    header=document.createElement("div");
                    header.classList.add("titlebar");
                    title_text=document.createElement("span");
                    title_text.textContent=title;
                    header.appendChild(title_text);
                    b=document.createElement("button");
                    b.classList.add("button");
                    header.appendChild(b);
                    b.role="button";
                    s=document.createElement("span");
                    s.classList.add("close");
                    b.addEventListener("click",this.close,false);
                    b.appendChild(s);
                    Hdialog.appendChild(header);
                    //Content
                    s=document.createElement("div");
                    s.classList.add("message");
                    message_text=document.createElement("p");
                    message_text.style.float="right";
                    message_text.textContent=message;
                    b=document.createElement("span");
                    s.appendChild(b);
                    s.appendChild(message_text);
                    Hdialog.appendChild(s);
                    // Tail
	            s=document.createElement("div");
                    t=document.createElement("div");
                    s.appendChild(t);
                    b=document.createElement("button");
                    b.classList.add("button");
                    b.type="button";
                    b.addEventListener("click",this.close,false);
                    t.appendChild(b);
                    t=document.createElement("span");
                    t.classList.add("text");
                    t.textContent="OK";
                    b.appendChild(t);
                    Hdialog.appendChild(s);
                    if(modal === true){
                        document.body.appendChild(Apoco.modal);
                        Apoco.modal.appendChild(Hdialog);
                    }
                    else{
                        document.body.appendChild(Hdialog);
                    }
                    
                };
                this.exists=function(){
                    if(Hdialog === undefined){
                        return false;
                    }
                    return true;
                },
                this.update=function(title,message){
                    message_text.textContent=message;     
	            title_text.textContent=title;
                    if(modal === true){
                        document.body.appendChild(Apoco.modal);
                       // document.body.classList.add("modal");
                       Apoco.modal.appendChild(Hdialog);
                    }
                    else{
                        document.body.appendChild(Hdialog);
                    }
                    //Hdialog.visibility="visible";
                    //Modal.visibility="visible";
                };
                
            };
          
            var d=new mkDialog(title,message,modal);
            d.create();
            return d;
            
        },
	spinner: function(on){
	
            if(!document.contains(document.getElementById("apoco_spinner"))){
		var spinner=document.createElement("div");
                spinner.id="apoco_spinner";
		document.body.appendChild(spinner);
	    }
	    if(on === true ){
		//console.log("apoco spinner on");
                document.getElementById("apoco_spinner").style.display="inherit";
	    }
	    else{
		//console.log("apoco spinner off");
                document.getElementById("apoco_spinner").style.display="none";

	    }
            return spinner;
	},
	alert: function(title,text,time){
	    var nd,ns,np,s;
          //  console.log("creating alert");
            nd=document.createElement("div");
            nd.id="apoco_alert";
            Apoco.Utils.draggable(nd);
            ns=document.createElement("div");
            ns.classList.add("alert");
            np=document.createElement("p");
            s=document.createElement("span");
            s.textContent=title;
            np.appendChild(s);
            s=document.createElement("p");
            s.textContent=text;
            np.appendChild(s);
            
	    ns.appendChild(np);
	    nd.appendChild(ns);
	    document.body.appendChild(nd);

            var t;
            if(time === undefined){
                time=10000;
            }
            t=window.setTimeout(function(){
                document.body.removeChild(nd);
                window.clearTimeout(t);
            },time);
  
	    return nd;

	},
	trouble: function(heading,text){
            var a=document.createElement("div");
            a.id="apoco_trouble";

            var b=document.createElement("h1");
            b.textContent=heading;
	    a.appendChild(b);
	    if(text!== undefined){

                var c=document.createElement("div");
                var d=document.createElement("h2");
                d.textContent=text;
                c.appendChild(d);
		a.appendChild(c);
	    }
	    // this should call a hard logging function
	    document.body.appendChild(a);
            var t;
           
            t=window.setTimeout(function(){
                document.body.removeChild(a);
                a=null;
                window.clearTimeout(t);
                Apoco.popup.error("Unrecoverable Error","Please shutdown now");
            },5000);
 	},

	statusCode: {
	    204: function(s) {
		Apoco.popup.error("Bad Return from server: 204","There is no content for this page " + s);
	    },
	    205: function(s){
		Apoco.popup.error("Bad Return from server: 205","Response requires that the requester reset the document view " + s);
	    },
	    400: function(s){  // Bad request
		Apoco.popup.error("Bad Return from server: 400","Bad request " + s);
	    },
	    401: function(s){
		Apoco.popup.error("Bad Return from server: 401","Unauthorised " + s);
	    },
	    403: function(s){
		Apoco.popup.error("Bad Return from server: 403","Forbidden " + s);
	    },
	    404: function(s) {
		Apoco.popup.error("Bad Return from server: 404","Not Found " + s);
	    },
	    410: function(s){
		Apoco.popup.error("Bad Return from server: 410","Gone " + s);
	    },
	    413: function(s){
		Apoco.popup.error("Bad Return from server: 413","Request entity too large " + s);
	    },
	    424: function(s){
		Apoco.popup.error("Bad Return from server: 424","Method Failure " + s);
	    },
	    500: function(s){
		Apoco.popup.error("Bad Return from server: 500","Internal server error " +s);
	    },
	    501: function(s){
		Apoco.popup.error("Bad Return from server: 501","Not Implemented " + s);
	    },
	    503: function(s){
		Apoco.popup.error("Bad Return from server: 503","Service unavailable " +s);
	    },
	    511: function(s){
		Apoco.popup.error("Bad Return from server: 511","Network authentication required " + s);
	    }
	}
    };

})();

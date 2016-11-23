var Apoco=require('./declare').Apoco;

;(function(){
    'use strict';

    // var popups={
    Apoco.popup={
        error:function(title,message){
            var t="ERROR ";
            if(Apoco.error === undefined){
                title=t.concat(title);
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
                    console.log("creating a modal ");
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
                    Hdialog.classList.add("Apoco_dialog","ui-dialog","resizable","ui-widget","ui-widget-content","ui-corner-all");
                    draggable=Apoco.Utils.draggable(Hdialog);

                    // create header
                    header=document.createElement("div");
                    header.classList.add("ui-dialog-titlebar","ui-widget-header","ui-corner-all");
                    title_text=document.createElement("span");
                    title_text.classList.add("ui-dialog-title");
                    title_text.textContent=title;
                    header.appendChild(title_text);
                    b=document.createElement("button");
                    b.classList.add("ui-button","ui-widget","ui-state-default","ui-corner-all","ui-button-icon-only","ui-dialog-titlebar-close");
                    header.appendChild(b);
                    b.role="button";
                    b.style.float="right";
                    s=document.createElement("span");
                    s.classList.add("ui-button-icon-primary","ui-icon","ui-icon-closethick");
                    b.addEventListener("click",this.close,false);
                    b.appendChild(s);
                    Hdialog.appendChild(header);
                    //Content
                    s=document.createElement("div");
                    s.classList.add("ui-dialog-content","ui-widget-content");
                    
                    message_text=document.createElement("p");
                    message_text.style.float="right";
                    message_text.textContent=message;
                    b=document.createElement("span");
                    b.classList.add("ui-icon","ui-icon-circle-check");
                    s.appendChild(b);
                    s.appendChild(message_text);
                    Hdialog.appendChild(s);
                    // Tail
	            s=document.createElement("div");
                    s.classList.add("ui-dialog-buttonpane","ui-widget-content");
                    t=document.createElement("div");
                    t.classList.add("ui-dialog-buttonset");
                    s.appendChild(t);
                    b=document.createElement("button");
                    b.classList.add("ui-button","ui-widget","ui-state-default","ui-corner-all","ui-button-text-only");
                    b.type="button";
                    b.addEventListener("click",this.close,false);
                    t.appendChild(b);
                    t=document.createElement("span");
                    t.classList.add("ui-button-text");
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
	
            if(!document.contains(document.getElementById("Apoco_spinner"))){
		var spinner=document.createElement("div");
                spinner.id="Apoco_spinner";
		document.body.appendChild(spinner);
	    }
	    if(on === true ){
		console.log("Apoco spinner on");
                document.getElementById("Apoco_spinner").style.display="inherit";
	    }
	    else{
		console.log("Apoco spinner off");
                document.getElementById("Apoco_spinner").style.display="none";

	    }
            return spinner;
	},
	alert: function(text,time){
	    var nd,ns,np,s;
            nd=document.createElement("div");
            nd.id="Apoco_alert";
            nd.classList.add("ui-widget");
            Apoco.Utils.draggable(nd);
            ns=document.createElement("div");
            ns.classList.add("ui-state-error","ui-corner-all");
            ns.style.padding="10px";
            np=document.createElement("p");
            np.classList.add("ui-state-error-text");
            s=document.createElement("span");
            s.classList.add("ui-icon","ui-icon-alert");
            s.style.float="left";
            s.style.margin="1em";
            np.appendChild(s);
            s=document.createElement("strong");
            s.textContent="Alert";
            np.appendChild(s);
            s=document.createElement("span");
            s.style.margin="1em";
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
            a.id="Apoco_trouble";

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

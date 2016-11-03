
var Apoco=require('./declare').Apoco;
require("./DisplayBase");

;(function(){
    "use strict";
    var ApocoMakeSlideshow=function(options,win){
        var defaults={
	    autoplay: true,
	    fullscreen: true,
            delay: 4000,
	    element: null,
            editable: false, //unusual to make it uneditable
            thumbnails:false,
            fade: false,
            fadeDuration: 2000,
            current: 0,
            controls: true
	};
	var f,that=this;
 
        
        for(var k in defaults){
            if(options[k] === undefined){
                options[k]=defaults[k];
            }  
        }
        
        if(options.fade === true){
            if(options.delay <= 250 ){
                Apoco.popup.error("Slideshow: image delay is less than 1/4 second- setting fade to false");
                options.fade=false;
            }
            else if(options.fadeDuration >= options.delay){
                Apoco.popup.error("Slideshow: Fade Duration is greater than image delay - setting fade to  " + (options.delay -50));
                options.fadeDuration=Math.max(options.delay -50,200);
            }
        }
        
        //Apoco.mixinDeep(options,defaults);
	Apoco._DisplayBase.call(this,options,win);  //use class inheritance - base Class
//	console.log("called display base");
        if(this.thumbnails === true){
            this.thumbnails=document.createElement("div"); 
            this.thumbnails.classList.add("thumbnails");
        }
        if(this.values){  // start preloading images
     //       console.log("got some values");
            f=Apoco.field["imageArray"]({name:"slideshow"});
            if(!f){
                throw new Error("Slideshow: cannot make imageArray");
            }
            this.promises=f.loadImages(this.values);
        }
        else if(this.editable === true){   // put up file browser to select images 
            f=Apoco.field["imageArray"]({name:"slideshow",editable: this.editable});
        }
        this._execute();
      
    
    };

    ApocoMakeSlideshow.prototype={
        _isVisible:function(e){
            var that=this;
            if(that.DOM.contains(that.element)){
//                e.stopPropagation();
               // console.log("element is " + that.getKey() + " element " + that.element);    
                //e.preventDefault();
               // console.log("visibility change");
                if(document.hidden){
                  //  console.log("hidden");
                    if(that.interval){
                        that.stop();
                    }
                }
                else{
                 //   console.log("visible");
                    if(that.autoplay){
                        //   var t;
                        //    t=setInterval(function(){ //need this to stop race condition
                        that.element.querySelector("span.ui-icon-play").click();
                        //    clearInterval(t);
                        // },2000);
                    }
                }
            }
        },
        handleEvent:function(e){           
          //  console.log("event handler is here event type is " + e.type);
            if(e.type == "visibilitychange"){
                this._isVisible(e);
            }
        },
        _controls:function(){
            var that=this;
            var d,u,l,s,sibs;
            var icons=[{class:"ui-icon-seek-prev",action: "step",params:"prev"},
                       {class:"ui-icon-play",action: "play"},
                       {class:"ui-icon-pause",action: "stop"},
                       {class:"ui-icon-seek-next",action: "step",params: "next"},
                       {class:"ui-icon-arrow-4-diag",action:"showFullscreen"}];
            d=document.createElement("div");
            d.classList.add("slideshow_controls");
            u=document.createElement("ul");
            d.appendChild(u);
            u.addEventListener("mouseover",function(e){
                if(e.target.tagName === "LI"){
                    e.stopPropagation();
                    e.target.classList.add("ui-icon-hover");
                }
            });
            u.addEventListener("mouseout",function(e){
                if(e.target.tagName === "LI"){
                    e.stopPropagation();
                    e.target.classList.remove("ui-icon-hover");
                }
            });
            
            for(var i=0;i<icons.length;i++){
                if(icons[i].action === "showFullscreen" && this.fullscreen !== true){
                    continue;  //don't show the fullscreen icon
                }
                l=document.createElement("li");
                l.classList.add("ui-state-default","ui-corner-all");
                l.addEventListener("click",(function(icon,that){
                return function(e){
                    e.stopPropagation();
                    if(icon.action === "play" && that.interval){
                    //    console.log("already in play mode");
                        e.currentTarget.classList.remove("ui-state-active");
                        that["stop"]();
                        that.autoplay=false;
                        return;
                    }
                    if(icon.action === "step" && that.interval){
                        that.stop();
                    }
                    e.currentTarget.classList.add("ui-state-active");
                    sibs=Apoco.Utils.getSiblings(e.currentTarget);
                 //   console.log("got siblings length " + sibs.length);
                    for(var j=0;j<sibs.length;j++){
                        sibs[j].classList.remove("ui-state-active");
                    }
                    if(icon.params){
                        that[icon.action](icon.params);
                    }
                    else{
                        that[icon.action](); 
                    }
                };
                })(icons[i],this),false);
                s=document.createElement("span");
                s.classList.add("ui-icon",icons[i].class);
                l.appendChild(s);
                u.appendChild(l);
            }
            that.element.appendChild(d);
            
        },
        _calculateCover:function(v){
             var that=this;
            var ar=this.width/this.height;
            v.SSimage.style.margin="0"; // reset the margin 
            if(v.aspect_ratio > ar){   //wider than window - fit to width
		var h=that.width/v.aspect_ratio;
                //              console.log("new image height is " + h);
                var w=((that.width).toString() + "px");
                //              console.log("new image width is " + w);
                v.SSimage.style.width=w;
                v.SSimage.style.height=(h.toString() + "px");
		h=(that.height-h)/2;
		v.SSimage.style.marginTop=(h.toString() + "px"); 
                v.SSimage.style.marginBottom=(h.toString() + "px");
	    }
	    else{  // - fit to height
		var w=that.height*v.aspect_ratio;
              //                console.log("new image width is " + w);
                v.SSimage.style.width=(w + "px");
                v.SSimage.style.height=(that.height + "px");
		w=(that.width-w)/2;
                v.SSimage.style.marginLeft=(w + "px");
                v.SSimage.style.marginRight=(w + "px");
	    }
        },
        _afterShow:function(){ //set the width and height when it has been determined
            var that=this,lis=[];
           // console.log("AFTER SHOW IS HERE ");
            
            this.width=window.getComputedStyle(this.slideshow_container,null).getPropertyValue("width").split("px");
            this.height=window.getComputedStyle(this.slideshow_container,null).getPropertyValue("height").split("px");
           // console.log("slideshow container width " + this.width + " height " + this.height);
            this.width=parseFloat(this.width);
            this.height=parseFloat(this.height);
            lis=that.slideshow_container.querySelectorAll("li.slide");
                  //  console.log("lis is " + lis + " lis.length " + lis.length);
            if(lis.length !== that.values.length){
	        throw new Error("Slideshow: slide lis do not exist");
            }
            
            // get the slide container
            var car=this.slideshow_container.getElementsByTagName("ul")[0];
    
            for(var i=0;i<this.values.length;i++){
                console.log("stc od " + this.values[i].image);
                if(this.values[i].image ){ // image is loaded
                    this._calculateCover(this.values[i]);
                }
            }
            if(that.autoplay === true){
                //         console.log("trigger autoplay");
                if(that.interval){
                    that.stop();
                }
                if(that.controls){
                    that.element.querySelector("span.ui-icon-play").click();
                }
                else{
                    that.play();
                }
            };
          
            
        },
	_execute: function(){
            var that=this,l,temp;
	 //   console.log("execute of DisplaySlideshow");
	    this.element=document.createElement("div"); 
            this.element.id=this.id;
            this.element.classList.add("Apoco_slideshow","ui-widget-content","ui-corner-all");
            this.slideshow_container=document.createElement("div");
            this.slideshow_container.classList.add("slideshow","pic_area");
	    this.element.appendChild(this.slideshow_container);
            var car=document.createElement("ul");
            car.classList.add("carousel");
 	    that.slideshow_container.appendChild(car);
            for(var i=0;i<this.values.length;i++){ //create containers for images
                l=document.createElement("li");
                l.classList.add("slide");
                car.appendChild(l);
                this.values[i].SSimage=document.createElement("img");
                l.appendChild(this.values[i].SSimage);
                that.values[i].SSimage.style.visibility="hidden";
                temp=document.createElement("h1");
                temp.textContent="Loading....";
                l.appendChild(temp);
                
                this.promises[i].then(function(v){
                    var temp=Apoco.Utils.getSiblings(v.SSimage)[0];
                    v.SSimage.src=v.src;
                    temp.parentNode.removeChild(temp);
                });/*.catch(function(reason){
                     Apoco.popup.error("Slideshow",("Could not load images" + reason));
                }); */
            }
            if(that.controls === true){
                that._controls();
            }   
            document.addEventListener("visibilitychange", this, false); // stop weird flicker from stacks of images 
     
        },
        deleteAll:function(){
            // delete all the images
            if(this.values){
                for(var i=0;i<this.values;i++){
                    this.slideshow_container.removeChild(this.values[i].SSimage);
                }
            }
            while(this.element.firstChild){
                this.element.removeChild(this.element.firstChild);
            }
        },
        showFullscreen: function(){
	    // get the window width and height
	    var that=this,c,t;
	   // var width=$(window).width()-60; //innerWidth();
	    //var height=$(window).height()-60; //innerHeight();
            var width=parseInt(window.innerWidth-36);
            var height=parseInt(window.innerHeight-48);
            //if this node is in the DOM we are already in fullscreen mode
            var r=document.getElementsByClassName("slideshow_cover")[0];
     //       console.log("showFullscreen got width " + width + " height " + height);
	    that.element.parentNode.removeChild(this.element); 
     //       console.log("slideshow cover is " + r);
            // that.hide();
            that.stop();
	    if(!document.contains(r)){
//	        console.log("Fullscreen is truE- so do it");
	        that.element.style.width=(width.toString() + "px"); 
                that.element.style.height=(height.toString() + "px");
	        that.slideshow_container.style.width=(width.toString() + "px");
                that.slideshow_container.style.height=((height).toString() + "px");
	        //console.log("remove class pic_area");
	        that.slideshow_container.classList.remove("pic_area");
	        that.slideshow_container.classList.add("pic_area_full");
	        that.element.classList.add("show_full_screen");
                document.body.appendChild(that.element);
                c=that.element.querySelector("div.slideshow_controls");
                c.style.position="absolute";
                c.style.top=(height.toString() + "px");
                c.style.left=((width/2 -70).toString() + "px");
                t=document.createElement("div"); // add a big div to cover everything
                t.classList.add("slideshow_cover");
                document.body.appendChild(t);
                that._afterShow();
                window.scrollTo(0,0);
	    }
	    else{
                document.body.removeChild(r); // remove slideshow_cover
                // console.log("Fullscreen is falsE- so undo it");
	        that.element.style.width=""; 
                that.element.style.height="";
	        that.slideshow_container.style.width=""; 
                that.slideshow_container.style.height=""; 
	        that.element.classList.remove("show_full_screen");
	        that.slideshow_container.classList.remove("pic_area_full");
	        that.slideshow_container.classList.add("pic_area");
                c=that.element.querySelector("div.slideshow_controls");
                c.style.position="";
                c.style.top="";
                c.style.left="";
                
                if(this.after){
                    t=document.getElementById(that.after);
                    if(t){
                        t.parentNode.insertBefore(that.element,t.nextSibling);
                    }
                    else{
                        this.DOM.appendChild(that.element);
                    }
                }
                else{
                    that.DOM.appendChild(that.element);
                }
                that._afterShow();
	    }
        },
        play:function(){
            var that=this;
            this.step("next"); // update immediately for user feedback
          //  console.log("play is here " + that);
            this.autoplay=true;
            this.interval=setInterval(function(){that.step("next","play");},this.delay);
        },
        stop:function(){
          //  console.log("stop is here");
            var that=this;
            if(this.interval){
                clearInterval(that.interval);
            }
            this.interval=null;
        },
        _crossFade: function(prev,next){
            var that=this;
            var timer,op=0.05,inc=0.1,step=40;
            // we want about 25 steps per second. i.e st=40
            var n=parseInt(this.fadeDuration/step);
            // calculate the increment for a given number of steps
            inc=Math.pow(1/op,1/n) -1.0;
            if(inc <= 0) return; // something has gone badly wrong
          //  console.log("inc is " + inc);            
            // calculate the number of steps for a given increment 
//            var n=Math.log(1.0/op)/Math.log(1+inc);
//            var step=parseInt(this.fadeDuration/n);

         //   console.log("fade step is " + st + " fade duration  is " + n*st);
            that.values[next].SSimage.style.visibility="visible";
            that.values[next].SSimage.style.position="absolute";
            that.values[next].SSimage.style.top=0;
            that.values[next].SSimage.style.left=0;
            that.values[next].SSimage.style.opacity = op;
            that.values[next].SSimage.style.filter = 'alpha(opacity=' + op * 100 + ")"; // IE 5+ Support
            
            timer = setInterval(function() {
                if (op >= 1.0) {
                    clearInterval(timer);
                    that.values[prev].SSimage.style.position="relative";
                    that.values[prev].SSimage.style.visibility="hidden";
                    that.values[prev].SSimage.style.opacity=1;
                    that.values[prev].SSimage.style.filter = 'alpha(opacity=' + 100 + ")";
                }
                else{
                    that.values[prev].SSimage.style.opacity = (1-op);
                    that.values[prev].SSimage.style.filter = 'alpha(opacity=' + (1-op) * 100 + ")"; // IE 5+ Support
                    that.values[next].SSimage.style.opacity = op;
                    that.values[next].SSimage.style.filter = 'alpha(opacity=' + op * 100 + ")"; // IE 5+ Support
                    op += op * inc;
                }
            }, step);
        },
        step: function(dir,caller){
            var num=this.values.length;
            var next,prev=this.current;
            if(dir==="next"){
                if(this.current>=(num-1)){
                    this.current=0;
                }
                else{
                    this.current++;
                }
            }
            else{
                if(this.current <= 0){
                    this.current=num-1;
                }
                else{
                    this.current--;
                }
            }
            next=this.current;
         //  console.log("step - prev " + prev + " next " + next);
            if(this.fade === false  || caller !== "play"){  // don't do crossfade if just stepping thru the images
                this.values[prev].SSimage.style.position="relative";
                this.values[prev].SSimage.style.visibility="hidden";
                this.values[next].SSimage.style.visibility="visible"; 
                this.values[next].SSimage.style.position="absolute";
                this.values[next].SSimage.style.opacity=1;
                this.values[next].SSimage.style.filter = "alpha(opacity=100)";
                this.values[next].SSimage.style.top=0;
                this.values[next].SSimage.style.left=0;
            }
            else{
                this._crossFade(prev,next);
            }
          //  console.log("now current is " + this.current);
        } 
    };

    Apoco.Utils.extend(ApocoMakeSlideshow,Apoco._DisplayBase);

    Apoco.display.slideshow=function(opts,win){
        opts.display="slideshow";
        return new ApocoMakeSlideshow(opts,win);
    };
    Apoco.display.slideshowMethods=function(){
        var ar=[];
        for(var k in ApocoMakeSlideshow.prototype){
            ar.push(k);
        }
        return ar; 
    };


})();
















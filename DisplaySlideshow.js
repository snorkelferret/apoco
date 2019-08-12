
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
            controls: true,
            fit_to: "height",
            keepAspectRatio: true,
            sideArrows: false
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
        if(this.components){  // start preloading images
     //       console.log("got some values");
            f=Apoco.field["imageArray"]({name:"slideshow"});
            if(!f){
                throw new Error("Slideshow: cannot make imageArray");
            }
            this.promises=f.loadImages(this.components);
        }
        else if(this.editable === true){   // put up file browser to select images 
            f=Apoco.field["imageArray"]({name:"slideshow",editable: this.editable});
        }
        this._execute();
      
    
    };

   
    
    ApocoMakeSlideshow.prototype={
        _isVisible:function(e){
            var that=this;
            console.log("isVisible is here");
            if(that.DOM.contains(that.element)){
                if(document.hidden){
                  //  console.log("+++++++++++++++=hidden");
                    if(that.interval){
                        that.stop();
                    }
                }
                else{
                 //   console.log("++++++++++++++++visible");
                    if(that.autoplay){
                        if(that.controls){
                            that.element.querySelector(".play").click();
                        }
                        else{
                            that.play();
                        }
                    }
                }
            }
        },
        handleEvent:function(e){           
            if(e.type == "visibilitychange"){
                console.log("handle event got visibilitychange");
                this._isVisible(e);
            }
        },
        _sideArrows:function(){
            var c,p,q,t=["right","left"],that=this;
            var doit=function(e){
                e.stopPropagation();
                if(that.autoplay){
                    that.stop();
                }
                if(e.target.classList.contains("left") || e.target.parentNode.classList.contains("left")){
                    that.step("next");
                }
                else{
                    that.step("prev");
                }
            };
            // make a container for the arrows
            c=document.createElement("div");
            c.classList.add("arrows");
            this.element.appendChild(c);
            for(var i=0;i<2;i++){
                p=document.createElement("div");
                p.classList.add(t[i]);
                p.classList.add("arrow");
                q=document.createElement("i");
                p.appendChild(q);
                this.element.appendChild(p);
                c.appendChild(p);
              //  this.slideshow_container.appendChild(p);
                p.addEventListener("click",doit);
            }
        },
        _controls:function(){
            var that=this;
            var d,u,l,s,sibs;
            var icons=[{class:"prev",action: "step",params:"prev"},
                       {class:"play",action: "play"},
                       {class:"pause",action: "stop"},
                       {class:"next",action: "step",params: "next"},
                       {class:"fullscreen",action:"showFullscreen"}];
            d=document.createElement("div");
            d.classList.add("slideshow_controls");
            u=document.createElement("ul");
            d.appendChild(u);
            for(var i=0;i<icons.length;i++){
                if(icons[i].action === "showFullscreen" && this.fullscreen !== true){
                    continue;  //don't show the fullscreen icon
                }
                l=document.createElement("li");
               
                l.addEventListener("click",(function(icon,that){
                    return function(e){
                        e.stopPropagation();
                        if(icon.action === "play" && that.interval){
                            //    console.log("already in play mode");
                            e.currentTarget.classList.remove("selected");
                            that["stop"]();
                            that.autoplay=false;
                            return;
                        }
                        if(icon.action === "step" && that.interval){
                            that.stop();
                        }
                        e.currentTarget.classList.add("selected");
                        sibs=Apoco.Utils.getSiblings(e.currentTarget);
                        //   console.log("got siblings length " + sibs.length);
                        for(var j=0;j<sibs.length;j++){
                            sibs[j].classList.remove("selected");
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
                s.classList.add(icons[i].class);
                l.appendChild(s);
                u.appendChild(l);
            }
            that.element.appendChild(d);
            
        },
        _getTopOffset:function(){
            var e,y=this.element.offsetTop;
            e=this.element;
          //  console.log("initial offset is " +y);
            while(e==e.offsetParent){
                y+=e.offsetTop;
            //    console.log("offset is " + y);
            }
            return y;
        },
        _calculateCover:function(v){
            
            var ar,w,h,y;
            if(this.keepAspectRatio === false){
                return;
            }
             if(!document.contains(this.element)){ // not currently active
                return;
            }    
            w=window.getComputedStyle(this.slideshow_container,null).getPropertyValue("width").split("px");
            h=window.getComputedStyle(this.slideshow_container,null).getPropertyValue("height").split("px");
            this.width=parseInt(w);
            this.height=parseInt(h);
            //console.log("slideshow container width " + this.width + " height " + this.height);
            if(parseInt(this.height) === 0){ // if height is not set on slideshow_container
                y=this._getTopOffset();
                this.height=window.innerHeight-y;
                //this.slideshow_container.style.height=(h + "px");
            }
            
            if(parseInt(this.height)>0 ){
                ar=this.width/this.height;
           //     console.log("height " + this.height + " is > 0 ; and ar is " + ar );
            }
            else{
                ar=0;
            }
            //  console.log("window aspect ratio is " + ar);
              
            if(this.fit_to === "width"){
                this._setToWidth(v,ar);
            }
            else if(this.fit_to === "height"){
                this._setToHeight(v,ar);
            }
            else if(v.aspect_ratio > ar){
                this._setToWidth(v,ar);
            }
            else{
                  this._setToHeight(v,ar);
            }
     
        },
   
        _setToHeight:function(v,ar){
            var w,h,that=this;
            v.SSimage.style.margin="0"; // reset the margin
          //  console.log("FIT TO HEIGHT");
          //  console.log("image aspect ration is " + v.aspect_ratio + " and window is " + ar);
	    w=that.height*v.aspect_ratio;
            //   console.log("new image width is " + w);
            v.SSimage.style.width=(w + "px");
            v.SSimage.style.height=(that.height + "px");
	    w=(that.width-w)/2;
            v.SSimage.style.marginLeft=(w + "px");
            v.SSimage.style.marginRight=(w + "px");
        },
        _setToWidth:function(v,ar){
            var w,h,m,that=this;
            v.SSimage.style.margin="0"; // reset the margin
          //  console.log("FIT to WIDTH");
            h=this.width/v.aspect_ratio;
         //   console.log("need height " + h);
            if(this.height< h && this.fit_to === "width"){ //crop the image
                h=parseInt(h);
           //     console.log("cropping height to " + this.height);
                m=parseInt((h-this.height)/2);
                v.SSimage.style.height=(h + "px");
                v.SSimage.style.marginTop=(-m + "px");
                v.SSimage.style.marginBottom=(-3*m + "px");
               // this.element.style.height=(h + "px");
                //this.height=h;
               // console.log("this.height " + this.height);
            }
            else{
           // console.log("image aspect ration is " + v.aspect_ratio + " and window is " + ar);
	  //  console.log("new image height is " + h);
        //    w=((that.width).toString() + "px");
         //    console.log("new image width is " + w);
         //   v.SSimage.style.width=(w + "px");
                v.SSimage.style.height=(h + "px");
            }
            if(this.fit_to !== "width"){
	        h=(that.height-h)/2;
                v.SSimage.style.marginTop=(h + "px"); 
                v.SSimage.style.marginBottom=(h + "px");
            } 
        },
        _afterShow:function(){ //set the width and height when it has been determined
            var that=this,lis=[];
          //  console.log("AFTER SHOW IS HERE ");
         
            for(var i=0;i<this.components.length;i++){
              //  console.log("after show calc " + i + " this loaded is " + this.components[i].loaded);
                if(this.components[i].loaded){
                //   console.log("Values loaded = going to calculate cover");
                    this._calculateCover(this.components[i]);
                }
            }
            lis=that.slideshow_container.querySelectorAll("li.slide");
                  //  console.log("lis is " + lis + " lis.length " + lis.length);
            if(lis.length !== that.components.length){
	        throw new Error("Slideshow: slide lis do not exist");
            }
            
            // get the slide container
            var car=this.slideshow_container.getElementsByTagName("ul")[0];

            if(that.autoplay === true){
                //  console.log("trigger autoplay");
                if(that.interval){
                  //  console.log("stopping");
                    that.stop();
                }
                that.components[this.current].element.style.visibility="visible";
                if(that.controls){
                    that.element.querySelector(".play").click();
                }
                else{
                   // that.components[this.current].element.style.visibility="visible";
                  //  setTimeout(function(){
                    that.play();
                  //  },that.delay);
                }
            }
            else{ // show the first image
                if(this.components.length>0){
                    this.components[0].element.style.visibility="visible";
                    this.current=0;
                }
            }
          
            
        },
	_execute: function(){
            var that=this,temp,pp,element;
	    //   console.log("execute of DisplaySlideshow");
          
            this.slideshow_container=document.createElement("div");
            this.slideshow_container.classList.add("slideshow","pic_area");
	    this.element.appendChild(this.slideshow_container);
            var car=document.createElement("ul");
            car.classList.add("carousel");
 	    that.slideshow_container.appendChild(car);
            for(var i=0;i<this.components.length;i++){ //create containers for images
                this.components[i].element=document.createElement("li");
                this.components[i].element.classList.add("slide");
                car.appendChild(this.components[i].element);
                this.components[i].SSimage=document.createElement("img");
                this.components[i].element.appendChild(this.components[i].SSimage);
                this.components[i].SSimage.parentElement.style.visibility="hidden";
               
                if(this.components[i].content){
                    element=document.createElement("div");
                    element.classList.add("slideshow_content");
                    this.components[i].element.appendChild(element);
                    
                    if(!element){
                        throw new Error("cannot find slideshow element");
                    }
                    for(var j=0;j<this.components[i].content.length;j++){
                        temp=this.components[i].content[j];
                        if(temp["node"]){
                            pp=Apoco.node(temp,element);
                        }
                        else if(temp["field"] ){
                            pp=Apoco.field(temp,element);
                        }
                        else{
                            throw new Error("content array must contain either nodes or fields");
                        }
                    }
                }
                               
                this.promises[i].then(function(v){
                    //console.log("image loaded " );
                    v.SSimage.src=v.src;
                    v.loaded=true;
                    that._calculateCover(v);
                    
                });/*.catch(function(reason){
                     Apoco.popup.error("Slideshow",("Could not load images" + reason));
                }); */
            }
            if(that.controls === true){
                that._controls();
            }
            if(that.sideArrows === true){
                that._sideArrows();
            }
            if(that.fit_to){
                window.addEventListener("resize",function(e){
                    var resizeTimeout;
                 //   console.log("resize event");
                    e.stopPropagation();
                
                    if(!resizeTimeout){
                        resizeTimeout=setTimeout(function(){
                            resizeTimeout=null;
                           // that.height=window.innerHeight-that.element.offsetTop;
                             //that.element.style.height=(that.height + "px");
                            //that._afterShow();
                            for(var i=0;i<that.components.length;i++){
                            //    console.log("after show calc " + i + " this loaded is " + that.components[i].loaded);
                                if(that.components[i].loaded){
                              //      console.log("Values loaded = going to calculate cover");
                                    that._calculateCover(that.components[i]);
                                }
                            }
                        },100); // animate at 10 fps
                    }
                
                },false);
            }

        },
        deleteAll:function(){
            // delete all the images
            if(this.components){
                for(var i=0;i<this.components;i++){
                    this.slideshow_container.removeChild(this.components[i].SSimage);
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
	    if(!document.body.contains(r)){
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
            return this;
        },
        play:function(){
            var that=this;
            if(!document.contains(this.element)){
                return null;
            }
         
         //   that.step("next"); // update immediately for user feedback
//            console.log("play is here- current " + that.current);
            that.autoplay=true;
            that.interval=setInterval(function(){that.step("next","play");},this.delay);
            return this;
        },
        stop:function(){
          //  console.log("stop is here");
            var that=this;//,found=0;
            if(this.interval){
                clearInterval(that.interval);
            }
            this.interval=null;
         
            if(that.fade_timer !== 0){
                clearInterval(that.fade_timer);
                that.fade_timer=0; // make sure the fade has stopped cleanly
                for(var i=0;i<this.components.length;i++){
                    if(i!== this.current){
                        this.components[i].element.style.visibility="hidden";
                    }
                    else{
                        this.components[i].element.style.visibility="visible";
                    }
                    this.components[i].element.style.opacity=1.0;
                }
 
            }
            return this;
        
        },
        _crossFade: function(prev,next){
            var that=this;
            var op=0.05,inc=0.1,step=40;
            // we want about 25 steps per second. i.e st=40
            var n=parseInt(this.fadeDuration/step);
            // calculate the increment for a given number of steps
            inc=Math.pow(1/op,1/n) -1.0;
            if(inc <= 0) return; // something has gone badly wrong
          //   console.log("inc is " + inc);             

        //    console.log("fade step is " + step + " fade duration  is " + n*step);
            that.components[next].element.style.visibility="visible";
            that.components[next].element.style.top=0;
            that.components[next].element.style.left=0;
            that.components[next].element.style.opacity = op;
            //that.components[next].element.style.filter = 'alpha(opacity=' + op * 100 + ")"; // IE 5+ Support
       //     console.log("cross fade prev is " + prev + " next " + next);
      
            that.fade_timer = setInterval(function() {
                if (op >= 1.0) {
                    clearInterval(that.fade_timer);
                 //   console.log("crossfade -  clearInterval"+ that.fade_timer);
                    that.fade_timer=0;
                    op=1.0;
                    that.components[prev].element.style.visibility="hidden";
                    that.components[prev].element.style.opacity=1;
              //      that.components[prev].element.style.filter = 'alpha(opacity=' + 100 + ")";
                }
                else{
                    that.components[prev].element.style.opacity = (1-op);
                //    that.components[prev].element.style.filter = 'alpha(opacity=' + (1-op) * 100 + ")"; // IE 5+ Support
                    that.components[next].element.style.opacity = op;
                 //   that.components[next].element.style.filter = 'alpha(opacity=' + op * 100 + ")"; // IE 5+ Support
                    op += op * inc;
                }
            }, step);
           
        },
        step: function(dir,caller){
            var that=this,num=this.components.length;
            var next,prev=this.current;
            // stop the current fade if one is in progress
       //     console.log("fade timer is " + this.fade_timer);
            if(this.fade_timer !== 0){  //not completed the last fade
                that.stop();
                this.fade_timer=0;
            //    console.log("step called stop");
                that.play(); //start it up again
                return;
            }
            
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
           // console.log("step - prev " + prev + " next " + next);
            if(this.fade === false ){ // || caller !== "play"){  // don't do crossfade if just stepping thru the images
                this.components[prev].element.style.visibility="hidden";
                this.components[next].element.style.visibility="visible"; 
                this.components[next].element.style.opacity=1;
               // this.components[next].element.style.filter = "alpha(opacity=100)";
                this.components[next].element.style.top=0;
                this.components[next].element.style.left=0;
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
















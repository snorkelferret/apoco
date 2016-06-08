var Harvey=require('./declare').Harvey;
require("./DisplayBase");
require("./Popups");
require("./Fields");
require("./Utils");
// Menu display object
//  requires HarveyDisplayBase.js
//


;(function(){

  "use strict";


// create the  display

    var HarveyMakeSlideshow=function(options,win){
        var defaults={
	    autoplay: true,
	    fullscreen: false,
            paginate: true,
	    selection_list_element: null,
	    element: null,
            editable: false, //unusual to make it uneditable
            thumbnails:false
	};
	var f,that=this;
        Harvey.mixinDeep(options,defaults);
	Harvey._DisplayBase.call(this,options,win);  //use class inheritance - base Class
	console.log("called display base");
        this.thumbnails=document.createElement("div"); //$("<div class='thumbnails'></div");
        this.thumbnails.classList.add("thumbnails");
        if(this.values){  // start preloading images
            console.log("got some values");
            f=Harvey.field["imageArray"]({name:"slideshow"});
            if(!f){
                throw new Error("Slideshow: cannot make imageArray");
            }
            this.promise=f.loadImages(this.values);
        }
        else if(this.editable === true){   // put up file browser to select images 
            f=Harvey.field["imageArray"]({name:"slideshow",editable: this.editable});
        }
        this.execute();
    };
    var controls=function(that){
        var d=document.createElement("div");//$("<div lass='slideshow_controls'></div>");
        d.classList.add("slideshow_controls");
        /*  if(that.paginate === true){
         var len=that.values.length;
         var cmd=function(){alert("blah");};
         var p=Harvey.node({node:'paginate',number: len,action:cmd});
         d.append(p);
         }  */
    };

    HarveyMakeSlideshow.prototype={
	execute: function(){
            var that=this,a=[];
	    console.log("execute of DisplaySlideshow");
	    this.element=document.createElement("div");  //$("<div id='" + this.id + "' class='Harvey_slideshow ui-widget ui-widget-content ui-corner-all'></div>");
            this.element.id=this.id;
            this.element.classList.add("Harvey_slideshow","ui-widget-content","ui-corner-all");
            this.slideshow_container=document.createElement("div"); //$("<div class='slideshow pic_area'> </div>");
            this.slideshow_container.classList.add("slideshow","pic_area");
	    this.element.appendChild(this.slideshow_container);
            if(this.promise){
                    /* this.promise.then(function(){
                   console.log("Slideshow: Finished loading images");
                    console.log("asked for  " + that.values.length + " number of images " + " and got " + num_loaded);
                    Harvey.popup.dialog("Slideshow",("Could only load " + num_loaded + " images"));
                    if(that.values.length !== num_loaded){
                        console.log("Could not load all images");
                        a=that.values.splice();
                        that.values.length=0; 
                        for(var i=0; i<a.length;i++){
                            console.log("examing images " + i);
                            if(a.image !== null){
                                that.values.push(a);
                            }
                        }
                    } 
                    if(that.values.length>0){
                        console.log("going to start now");
                        that.start();
                    }
                }).catch(function(reason){
                   // Harvey.popup.error("Slideshow",("Could not load images" + reason));
                }); */
            }
       /*     if(this.autoplay || this.fullscreen){
	       var fw=$("<div class='slideshow_controls' > </div>");
	       this.element.append(fw);
	   }
	   if(this.autoplay){
               var ap=$("<div class='autoplay'> <p class='small_text'> autoplay</p></div>");
	       fw.append(ap);
	       ap.on("click", function(e){ that.api.next(); that.api.play(); });
	   }
	   if(this.fullscreen){
	       var fs=$("<div class='fullscreen' class='ui-state-default ui-icon ui-icon-arrow-4-diag'> </div>");
	       fw.append(fs);
	       fs.on("click", function(e){
		//   console.log("CLICK CLICK fullscreen button");
		   (that.fullscreen)?that.fullscreen=false: that.fullscreen=true;
		   that.show_fullscreen();

	       });
	   }*/
        },
        deleteAll:function(){
            this.element.parentNode.removeChild(this.element); //detach();
            this.element=null;
        },
        show_fullscreen: function(){
	    // get the window width and height
	    var that=this;
	   // var width=$(window).width()-60; //innerWidth();
	    //var height=$(window).height()-60; //innerHeight();
            var width=window.innerWidth;
            var height=window.innerHeight;
	    that.element.parentNode.removeChild(this.element); //detach();
	    //console.log("FULLSCREEN ++++++++++=" + this.fullscreen);

	    if(this.fullscreen){
	        //console.log("Fullscreen is truE- so do it");
	        that.element.style.width=width; //css({width:width,height:height});
                that.element.style.height=height;
	        that.slideshow_container.style.width=width;//css({width: width,height:height});
                that.slideshow.container.style.height=height;
	        //console.log("remove class pic_area");
	        that.slideshow_container.classList.remove("pic_area");
	        that.slideshow_container.classList.add("pic_area_full");
	        that.element.classList.add("show_full_screen");
                document.body.appendChild(this.element);
	        //that.element.appendTo("#wrapper");
	       // $("#main").addClass('hidden');
	    }
	    else{
	        // console.log("Fullscreen is falsE- so undo it");
	        that.element.style.width=""; //css({width:"",height:""});
                that.element.style.height=""; //css({width:"",height:""});
	        that.slideshow_container.style.width=""; //css({width:"",height:""});
                that.slideshow_container.style.height=""; //css({width:"",height:""});
	        that.element.classList.remove("show_full_screen");
	        that.slideshow_container.classList.remove("pic_area_full");
	        that.slideshow_container.classList.add("pic_area");
	        //that.element.appendTo(that.parent);
                that.DOM.addChild(that.element);
	        // SJ.BGCarousel.stop();
	        //$("#main").removeClass('hidden');
	    }
	    if(this.current_gallery === null){
	        throw new Error("Cannot find current gallery");
	    }
	    this.start();
	   //console.log("fullscreen");
        },
        step: function(dir){
            var num=this.values.length;
            console.log("next is here len vals is " + num + " current is " + this.current);
            this.values[this.current].SSimage.style.position="relative";
            this.values[this.current].SSimage.style.visibility="hidden";
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
            this.values[this.current].SSimage.style.visibility="visible"; //css({position:'absolute',visibility:"visible",top:0,left:0});
            this.values[this.current].SSimage.style.position="absolute";
            this.values[this.current].SSimage.style.top=0;
            this.values[this.current].SSimage.style.left=0;
            console.log("now current is " + this.current);
        },
        start: function(){
            console.log("slideshow start is here");
	    var that=this;
            var num,img;
            this.current=0;
	    this.width=this.slideshow_container.style.width? this.slideshow_container.style.width: 400;
	    this.height=this.slideshow_container.style.height?this.slideshow_container.style.height: 400;
            console.log("slideshow container width " + this.width + " height " + this.height);

	    var car=document.createElement("ul");
            car.classList.add("carousel");
            var g=this.height/2 -24;
            var left=document.createElement("span");
            left.classList.add("carousel_left");
            left.style.top=(g + "px");
            left.style.left="0px";
            
            var right=document.createElement("span");//$("<span class='carousel_right' style='top:" + g + "px ; left:" + (this.width-48) + "px'></span>");
            
            right.classList.add("carousel_right");
            right.style.top=(g + "px");
            right.style.left=((this.width-48) + "px");
            //left.hover(function(){$(this).addClass("hover");}, function(){ $(this).removeClass("hover");});
            //right.hover(function(){$(this).addClass("hover");}, function(){ $(this).removeClass("hover");});

            left.addEventListener("click",function(e){e.stopPropagation();
                                                      that.step("prev");},false);
            right.addEventListener("click",function(e){e.stopPropagation();
                                                       that.step("next");},false);

            this.slideshow_container.appendChild(left);
            this.slideshow_container.appendChild(right);

	    var ar=that.width/that.height;
	    that.slideshow_container.appendChild(car);

	    for(var i=0; i< this.values.length;i++){
		console.log("loading image " + i + " with aspect ratio " + this.values[i].aspect_ratio);
                console.log("image width " + this.values[i].width + " height " + this.values[i].height);
		var l=document.createElement("li"); //$("<li class='slide'> </li>");
                l.classList.add("slide");
		if(this.values[i].aspect_ratio > ar){   //wider than window - fit to width
		    var h=this.width/this.values[i].aspect_ratio;
		    img=document.createElement("img");  //$("<img  width='" + this.width + "' height='" + h + "' alt=''>");
                    img.style.width=this.width;
                    img.style.height=h;
		    h=(that.height-h)/2;
		    img.style.padding.top=h;  //css({"padding-top": h, "padding-bottom": h});
                    img.style.padding.bottom=h;
		}
		else{  // - fit to height
		    var w=this.height*this.values[i].aspect_ratio;
		    //img=$("<img  height='" + that.height + "' width='" + w + "' alt=''>");
                    img=document.createElement("img");
                    img.style.width=w;
                    img.style.height=this.height;
		    w=(that.width-w)/2;
                    img.style.padding.top=w;
                    img.style.padding.bottom=w;
		    //img.css({"padding-left": w, "padding-right": w});
		}

		img.src=this.values[i].src;
		l.appendChild(img);
		car.appendChild(l);
                this.values[i].SSimage=img;
	    }

        },
        getImages: function(data,settings){
            if(!settings){
                settings={};
            }
            var promise=new Promise(function(resolve,reject){
                Harvey.REST("GET",settings,data);
            });
            promise.then(function(rd){
                for(var i=0;i<rd.length;i++){
                    this.values.push(rd[i]);
                }
            }).catch(function(reason){
                Harvey.popup.dialog("Slideshow: getImages could not load " + reason);
            });

            return promise;
        }
    };

    Harvey.Utils.extend(HarveyMakeSlideshow,Harvey._DisplayBase);

    // Create the namespace
    // Harvey.display.tabs
    // $.extend(true, Harvey, {
    Harvey.mixinDeep(Harvey,{
	display: {
	    slideshow: function(opts,win){
                opts.display="slideshow";
                return new HarveyMakeSlideshow(opts,win);
            },
            slideshowMethods:function(){
                var ar=[];
                for(var k in HarveyMakeSlideshow.prototype){
                    ar.push(k);
                }
                return ar;
            }
	}
    });



})();

var Harvey=require('./declare').Harvey,UI=require('./declare').UI; //jQuery=require('jquery');

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
            thumbnails:false
	};
        var settings;
        //var settings=$.extend({},defaults,options);
        for(var k in defaults){
            settings[k]=defaults[k];
        }
        for(var k in options){
            settings[k]=options[k];
        }
	this.DEBUG=true;
	var that=this;
	Harvey._DisplayBase.call(this,settings,win);  //use class inheritance - base Class
	console.log("called display base");
        this.thumbnails=$("<div class='thumbnails'></div");
        if(this.values){
            var f=Harvey.field["ImageArrayField"]({name:"slideshow",required: false,editable:this.editable});//,values:this.values},this.thumbnails);
            f.values=this.values;
            this.promise=f.loadImages();
        }
        this.execute();
    };
    var controls=function(that){
        var d=$("<div lass='slideshow_controls'></div>");
            /*  if(that.paginate === true){
            var len=that.values.length;
            var cmd=function(){alert("blah");};
            var p=Harvey.node({node:'paginate',number: len,action:cmd});
            d.append(p);
             }  */
    };

    HarveyMakeSlideshow.prototype={
	execute: function(){
            var that=this;
	    console.log("execute of DisplaySlideshow");
	    this.element=$("<div id='" + this.id + "' class='Harvey_slideshow ui-widget ui-widget-content ui-corner-all'></div>");
            this.slideshow_container=$("<div class='slideshow pic_area'> </div>");
	    this.element.append(this.slideshow_container);

            this.promise.done(function(){
                console.log("Slideshow: Finished loading images");
                console.log("got " + that.values.length + " number of images ");
                console.log("going to start now");
                that.start();
            });
            //this.promise.done(this.start);
            this.promise.fail(function(){
                Harvey.display.dialog("Slideshow","Could not load images");
                return null;
            });

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
            this.element.detach();
            this.element.empty();
            this.element.remove();
        },
        show_fullscreen: function(){
	    // get the window width and height
	    var that=this;
	    var width=$(window).width()-60; //innerWidth();
	    var height=$(window).height()-60; //innerHeight();

	    that.element.detach();
	    //console.log("FULLSCREEN ++++++++++=" + this.fullscreen);

	    if(this.fullscreen){
	        //console.log("Fullscreen is truE- so do it");
	        that.element.css({width:width,height:height});
	        that.slideshow_container.css({width: width,height:height});
	        //console.log("remove class pic_area");
	        that.slideshow_container.removeClass("pic_area");
	        that.slideshow_container.addClass("pic_area_full");
	        that.element.addClass("show_full_screen");
	        that.element.appendTo("#wrapper");
	        $("#main").addClass('hidden');
	    }
	    else{
	        // console.log("Fullscreen is falsE- so undo it");
	        that.element.css({width:"",height:""});
	        that.slideshow_container.css({width:"",height:""});
	        that.element.removeClass("show_full_screen");
	        that.slideshow_container.removeClass("pic_area_full");
	        that.slideshow_container.addClass("pic_area");
	        that.element.appendTo(that.parent);
	        // SJ.BGCarousel.stop();
	        $("#main").removeClass('hidden');
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
            this.values[this.current].SSimage.css({position: "relative",visibility:"hidden"});
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
            this.values[this.current].SSimage.css({position:'absolute',visibility:"visible",top:0,left:0});
            console.log("now current is " + this.current);
        },
        start: function(){
	    var that=this;
            var num,img;
            this.current=0;
	    this.width=this.slideshow_container.width()? this.slideshow_container.width(): 400;
	    this.height=this.slideshow_container.height()?this.slideshow_container.height(): 400;
            console.log("slideshow container width " + this.width + " height " + this.height);

	    var car=$("<ul class='carousel'></ul>");

            var g=this.height/2 -24;
            var left=$("<span  class='carousel_left' style='top:" + g + "px ; left: 0px '></span>");

            var right=$("<span class='carousel_right' style='top:" + g + "px ; left:" + (this.width-48) + "px'></span>");
            left.hover(function(){$(this).addClass("hover");}, function(){ $(this).removeClass("hover");});
            right.hover(function(){$(this).addClass("hover");}, function(){ $(this).removeClass("hover");});

            left.on("click",function(e){e.stopPropagation();
                                        that.step("prev");});
            right.on("click",function(e){e.stopPropagation();
                                         that.step("next");});

            this.slideshow_container.append(left);
            this.slideshow_container.append(right);

	    var ar=that.width/that.height;
	    that.slideshow_container.append(car);

	    for(var i=0; i< this.values.length;i++){
		console.log("loading image " + i + " with aspect ratio " + this.values[i].aspect_ratio);
                console.log("image width " + this.values[i].width + " height " + this.values[i].height);
		var l=$("<li class='slide'> </li>");

		if(this.values[i].aspect_ratio > ar){   //wider than window - fit to width
		    var h=this.width/this.values[i].aspect_ratio;
		    img=$("<img  width='" + this.width + "' height='" + h + "' alt=''>");
		    h=(that.height-h)/2;

		    img.css({"padding-top": h, "padding-bottom": h});
		}
		else{  // - fit to height
		    var w=this.height*this.values[i].aspect_ratio;
		    img=$("<img  height='" + that.height + "' width='" + w + "' alt=''>");
		    w=(that.width-w)/2;
		    img.css({"padding-left": w, "padding-right": w});
		}

		img.attr("src",this.values[i].src);
		l.append(img);
		car.append(l);
                this.values[i].SSimage=img;
	    }

        },
        getImages: function(settings,data){
            if(!settings){
                settings={};
            }
            var promise=Harvey.REST("GET",settings,data);
            promise.done(function(rd){
                for(var i=0;i<rd.length;i++){
                    this.values.push(rd[i]);
                }
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

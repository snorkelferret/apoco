var Harvey = require('./declare.js').Harvey, UI = require('./declare.js').UI;

// Node class for static elements like headings and text etc
// No callbacks or publish or listeners for these elements
// if you need callbacks use Harvey.fields

;(function($){

    var _Node=function(d,element){

        if(!d){
            throw new Error("Harvey: node, No params");
        }

	if(d && !d.node){
            throw new Error("Harvey: node doesn't know how to make",d.node);
        };

  	for(var k in d){
	    this[k]=d[k];
	}

        //if(d.node === "image"){
        //    var promise=

        _getNode[d.node](this);

	if(this.class){
	    this.element.addClass(this.class);
	}
	if(this.id){
	    this.element.attr('id', this.id);
	}
        if(this.name){
            this.element.attr('name',this.name);
        }

	if(this.tooltip){
	    this.element.prop("title", d.tooltip);
	    this.element.tooltip({tooltipClass: "tooltip"});
	}
        if(element){
        //    console.log("Node appending to element");
            element.append(this.element);
        }

    };

    _Node.prototype={
	getElement: function(){
	    return this.element;
	},
	setText: function(text){
	   // if (this.text){
	//	this.element.empty();
		this.element.html(text);
		this.text=text;
	  //  }
	}
    };

    var _getNode={
	anchor: function(that){
            that.element=$("<a href='" + that.href + "'> " + that.text + "</a>");
            if(that.target){
                that.element.prop('target','_blank');
            }
	},
	heading: function(that){
	    switch(that.size){
	    case "h1":
	    case "H1":
		that.element=$("<h1>" + that.text + "</h1>");
		return;
	    case "h2":
	    case "H2":
		that.element=$("<h2>" + that.text + "</h2>");
		return;
	    case "h3":
	    case "H3":
		that.element=$("<h3>" + that.text + "</h3>");
		return;
	    case "h4":
	    case "H4":
		that.element=$("<h4>" + that.text + "</h4>");
		return;
	    case "h5":
	    case "H5":
		that.element=$("<h5>" + that.text + "</h5>");
		return;
	    case "h6":
	    case "H6":
		that.element=$("<h6>" + that.text + "</h6>");
		return;
	    default:
		throw new Error("invalid arg for header " + that.size);
	    };
	},
	label: function(that){
	    if(that.for){
		that.element=$("<label for='" + that.for + "'>" + that.text + "</label>");
	    }
	    else{
		that.element=$("<label>" + that.text + "</label>");
	    }
	},
	paragraph: function(that){
	    that.element=$("<p>" + that.text + "</p>");
	},
        list: function(that){
	    that.element=$("<ul class='list'></ul>");
	    for(var i=0;i<that.list.length;i++){
                var l=that.list[i];
	        var el=$("<li>" + l + "</li>");
	        that.element.append(el);
            }
        },
        descriptionList: function(that){
            that.element=$("<dl></dl>");
            for(var i=0;i<that.items.length;i++){
                if(that.items[i].label){
                    that.element.append("<dt>" + that.items[i].label + "</dt>");
                }
                else  if(that.items[i].labels){
                    if(Harvey.checkType['array'](that.items[i].labels)){
                        for(var j=0;j<that.items[i].labels.length;j++){
                            that.element.append("<dt>" + that.items[i].labels[j] + "</dt>");
                        }
                    }


                }
                if (that.items[i].description){
                    that.element.append("<dd>" + that.items[i].description + "</dd>");
                }
                else if (that.items[i].descriptions){
                    if(Harvey.checkType['array'](that.items[i].descriptions)){
                        for(var j=0;j<that.items[i].descriptions.length;j++){
                            that.element.append("<dd>" + that.items[i].descriptions[j] + "</dd>");
                        }
                    }
                }
            }
        },
        image: function(that){
            //console.log("image node is here");
            var imm=new Image();  // get the width and height - need to load in to image
	    imm.src=that.url;
          //  var d=$.Deferred;
            that.element=$("<div></div>");
	    imm.onload=function(){
	//	console.log("+++++ reader onload got width " + this.width + " " + this.height);
                if(that.width){
                    this.width=that.width;
                }
                else{
                    that.element.width(this.width);
                }
                if(that.height){
                    this.height=that.height;
                }
                else{
                    that.element.height(this.height);
                }
                that.element.append(imm);
            //    d.resolve();
            };
            //return d;
          /*  if(that.src || that.url){
                if(that.src){
                    that.element=$("<img src='" + that.src + "'>");
                }
                else {
                    that.element=$("<img url='" + that.url + "'>");
                }
                if(!that.element){
                    throw new Error("could not load " + that.url);
                }
                if(that.width){
                    that.element.width(that.width.toString());
                }
                if(that.height){
                    that.element.height(that.height.toString());
                }
            }
            else{
                throw new Error("Harvey.node image need a src or href");
            }*/
        },
	clock: function(that){  // this needs to be changed to get the time from the server- shows server alive
            that.element=$("<div class='Harvey_clock'> </div>");

            var cb=function(t){
                var d=new Date();
                that.element.html(d.toLocaleTimeString());
		//t.html(d.getHours() + ":" + d.getMinutes() + ":" + d.getSeconds());
            };
	    window.setInterval(function(){cb(that);},1000);
	},
        button:function(that){
            var t=that.text?that.text: that.name;
	    that.element=$("<button type='button'>" + t + "</button>");
            if(that.disabled){
                that.element.prop("disabled",that.disabled);
            }
            if(that.action){
                that.element.on("click",function(){
                    that.action(that);
                });
            }
	},
        paginate:function(that){

            if(!that.number){
                throw new Error("paginate needs a number");
            }

	    that.current_num=0;
            //console.log("paginator init with number " + that.number);
	    // var that=this;
            that.element=$("<div class='Harvey_paginate'></<div>");

            var cb=function(index,el){
              //  console.log("index is " + index);
                el.addClass("ui-state-active");
                el.siblings().removeClass("ui-state-active");
                that.current_num=index;
                that.action(that);
            };
            if(this.prevNext){
                var n;
                var b=("<button> previous </button>");
                this.element.append(b);
                b.on("click",function(){
                    if(that.current_num === 0){
                        n=that.number-1;
                    }
                    else{
                        n=that.current_num-1;
                    }
                    var t=this.element.find('button[name="' + n + '"]');
                    t.trigger("click");
                });

            }
            for(var i=0;i<that.number;i++){
                //console.log("making button number " + i);
                var b=$("<button name='" + i + "'>" + (i+1) + "</button>");
                that.element.append(b);
                b.on("click", function(){
                    var index=i;
                    return function(){
                        cb(index,$(this));
                  //      console.log("got a click for " + index);
                    };

                }(i));
            }
            if(this.prevNext){
                var b=("<button> next </button>");
                this.element.append(b);
                b.on("click",function(){
                    var n=(that.current_num+1)%that.number;
                    var t=this.element.find('button[name="' + n + '"]');
                    t.trigger("click");
                });
            }
        },
        progressBar:function(that){
            var max=100;
            if($("#Harvey_progressBar").length === 0 ){
                if(!that.element){
                    that.element=$("<div id='Harvey_progressBar'></div>");
                    that.element.progressbar({ value: that.value, max: max,min:0});
                    //element.append(pb);
                    //return pb;
                }
            }

        }
    };

      /*          that.setValue=function(){
                    //var that=this;
                    for(var k in that){
                        console.log("paginate this method " + k);
                    }
	        };
                that.reset= function(){

                };
                that.init(that);
            };
            return  mkPaginator; */

    Harvey.node=function(options,el){
        if(options === "node_list"){ // return the list of nodes- internal use only
            var nl={};
            for(var k in _getNode){
                console.log("k in getNode is " + k);
                nl[k]=k;
            }
            return nl;
         }
        else{
            //console.log("Harvey.node calling _Node");
            return new _Node(options,el);
        }
    };
})(require('jquery'));

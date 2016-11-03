var Apoco=require('./declare').Apoco;
require("./Types.js");
// Node class for static elements like headings and text etc
// No callbacks or publish or listeners for these elements
// if you need callbacks use Apoco.fields

;(function(){

    var _Node=function(d,element){
        if(!d){
            throw new Error("Apoco: node, No params");
        }
	if(d && !d.node){
            throw new Error("Apoco: node doesn't know how to make",d.node);
        };
  	for(var k in d){
	    this[k]=d[k];
	}
        _getNode[d.node](this);

	if(this.class){
	    this.element.classList.add(this.class);
	}
	if(this.id){
	    this.element.id=this.id;
	}
        if(this.name){
           // console.log("++++++++++++++++Node adding name " + this.name);
            this.element.setAttribute("name",this.name);
        }
        if(element){
            element.appendChild(this.element);
        }
    };

    _Node.prototype={
	getElement: function(){
	    return this.element;
	},
	setText: function(text){
            switch(this.node){
            case "heading":
            case "paragraph":
            case "label":
            case "anchor":
		this.element.innerHTML=text;
		this.text=text;
                return;
            default:
                throw new Error("Cannot set text of " + this.node);
            }
	}
    };

    var _getNode={
	anchor: function(that){
            that.element=document.createElement("a"); 
            that.element.href=that.href;
            that.element.textContent=that.text;
            if(that.target){
                that.element.target="_blank";
            }
	},
        whatever: function(that){
            if(that.nodeType){
                that.element=document.createElement(that.nodeType);
                if(that.element !== null){
                    if(that.text){
                        that.element.textContent=that.text;
                    }
                  
                }
                if(that.attr){
                    for(var i=0;i<that.attr.length;i++){
                        for(var k in that.attr[i]){
                            that.element.setAttribute(k,that.attr[i][k]);
                        }
                    }
                }
            }
            else{
                throw new Error ("Node: whatever no nodeType specified");
            }
        },
	heading: function(that){
	    switch(that.size){
	    case "h1":
	    case "H1":
		that.element=document.createElement("h1");
                that.element.textContent=that.text;
		return;
	    case "h2":
	    case "H2":
                that.element=document.createElement("h2");
                that.element.textContent=that.text;
		return;
	    case "h3":
	    case "H3":
                that.element=document.createElement("h3");
                that.element.textContent=that.text;
		return;
	    case "h4":
	    case "H4":
                that.element=document.createElement("h4");
                that.element.textContent=that.text;
		return;
	    case "h5":
	    case "H5":
                that.element=document.createElement("h5");
                that.element.textContent=that.text;
		return;
	    case "h6":
            case "H6":
                that.element=document.createElement("h6");
                that.element.textContent=that.text;
		return;
	    default:
		throw new Error("invalid arg for header " + that.size);
	    };
	},
	label: function(that){
            that.element=document.createElement("label");
            that.element.textContent=that.text;
	    if(that.for){
                that.element.htmlFor=that.for;
	    }
	},
        code: function(that){
            that.element=document.createElement("code");
            if(that.text!==undefined){
               // that.element.textNode(that.text);
               that.element.textContent=that.text;
            }
        },
	paragraph: function(that){
	    that.element=document.createElement("p");
            if(that.text!==undefined){
                // that.element.textContent=that.text; // doesn't parse unicode
                that.element.innerHTML=that.text;
            }
	},
        list: function(that){
	    that.element=document.createElement("ul");
            that.element.classList.add("list");
	    for(var i=0;i<that.list.length;i++){
                var l=that.list[i];
	        var el=document.createElement("li");
                el.textContent=l;
	        that.element.appendChild(el);
            }
        },
        descriptionList: function(that){
            var d;
            if(that.items === undefined){
                throw new Error("Node: descriptionList requires at least one item" + that.name);
            }
            that.element=document.createElement("dl"); 
            for(var i=0;i<that.items.length;i++){
                if(that.items[i].label){
                    d=document.createElement("dt");
                    d.textContent=that.items[i].label;
                    that.element.appendChild(d);
                }
                else  if(that.items[i].labels){
                    if(Apoco.checkType['array'](that.items[i].labels)){
                        for(var j=0;j<that.items[i].labels.length;j++){
                            d=document.createElement("dt");
                            d.textContent=that.items[i].labels[j];
                            that.element.appendChild(d);
                        }
                    }
                }
                if (that.items[i].description){
                    d=document.createElement("dd");
                    d.innerHTML=that.items[i].description;
                    that.element.appendChild(d);
                }
                else if (that.items[i].descriptions){
                    if(Apoco.checkType['array'](that.items[i].descriptions)){
                        for(var j=0;j<that.items[i].descriptions.length;j++){
                            d=document.createElement("dd");
                            d.innerHTML=that.items[i].descriptions[j];
                            that.element.appendChild(d);
                        }
                    }
                }
            }
        },
        image: function(that){
          //  console.log("image node is here");
            var imm=document.createElement("img");//new Image();
            // get the width and height - need to load in to image
            if(that.url !== undefined){
                imm.src=that.url;
            }
            else if(that.src !== undefined){
                imm.src=that.src;
            }
            else{
                throw new Error("Node: image no url or src parm supplied");
            }
            that.element=document.createElement("div"); 
	    imm.onload=function(){
	//	console.log("+++++ reader onload got width " + this.width + " " + this.height);
                if(that.width){
                    this.width=that.width;
                }
                else{
                    that.element.style.width=((this.width).toString()+ "px");
                }
                if(that.height){
                    this.height=that.height;
                }
                else{
                    that.element.style.height=((this.height).toString()+ "px");
                }
                that.element.appendChild(imm);
            };
        },
	clock: function(that){  
            that.element=document.createElement("div");  
            that.element.classList.add("Apoco_clock");
            var cb=function(t){
                var d=new Date();
                that.element.textContent=d.toLocaleTimeString();
            };
	    window.setInterval(function(){cb(that);},1000);
	},
        button:function(that){
            var t=that.text?that.text: that.name;
            that.element=document.createElement("button");
            that.element.type="button";
            that.element.classList.add("ui-button");
            that.element.textContent=t;
            if(that.disabled === true){
                that.element.setAttribute("disabled","disabled");
            }
            if(that.action){
                that.element.addEventListener("click",function(e){
                    e.stopPropagation();
                    e.preventDefault();
                    that.action(that);
                },false);
            }
	},
        paginate:function(that){
            var n;
            if(!that.number){
                throw new Error("paginate needs a number");
            }
	    that.current_num=0;
            //console.log("paginator init with number " + that.number);
	    // var that=this;
            that.element=document.createElement("div");
            that.element.classList.add("Apoco_paginate");
            var cb=function(index,el){
              //  console.log("index is " + index);
                n=el.parentNode.childNodes;
                for(var i=0;i<n.length;i++){
                    n[i].classList.remove("ui-state-active");
                }
                el.classList.add("ui-state-active");   
                that.current_num=index;
                that.action(that);
            };
            if(this.prevNext){
                var n;
                var b=document.createElement("button");
                b.textContent="previous";
                this.element.appendChild(b);
                b.addEventListener("click",function(e){
                    e.stopPropagation();
                    if(that.current_num === 0){
                        n=that.number-1;
                    }
                    else{
                        n=that.current_num-1;
                    }
                    var t=this.element.getElementsByName(n)[0];
                    t.click();
                },false);

            }
            for(var i=0;i<that.number;i++){
                //console.log("making button number " + i);
                var b=document.createElement("button");
                b.name=i;
                b.textContent=(i+1);
                that.element.appendChild(b);
                b.addEventListener("click", function(){
                    var index=i;
                    return function(e){
                        e.stopPropagation();     
                        cb(index,e.target);
                  //      console.log("got a click for " + index);
                    };

                }(i),false);
            }
            if(this.prevNext){
                var b=document.createElement("button");
                b.textContent="next";
                this.element.appendChild(b);
                b.addEventListener("click",function(e){
                    var n=(that.current_num+1)%that.number;
                    var t=this.element.getElementsByName(n); 
                    t.click();
                },false);
            }
        }/*,
        progressBar:function(that){
            var max=100;
            if(!document.contains(document.getElementById("Apoco_progressBar"))){
                if(!that.element){
                    that.element=document.createElement("div");//$("<div id='Apoco_progressBar'></div>");
                    that.element.id="Apoco.progressBar";
                    $(that.element).progressbar({ value: that.value, max: max,min:0});
                    //element.append(pb);
                    //return pb;
                }
            }

        }*/
    };

    Apoco.node=function(options,el){
        if(options === "node_list"){ // return the list of nodes- internal use only
            var nl={};
            for(var k in _getNode){
              //  console.log("k in getNode is " + k);
                nl[k]=k;
            }
            return nl;
         }
        else{
            //console.log("Apoco.node calling _Node");
            return new _Node(options,el);
        }
    };
})();

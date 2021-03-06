var Apoco=require('./declare').Apoco;
require("./Types.js");
// Node class for static elements like headings and text etc
// No callbacks or publish or listeners for these elements
// if you need callbacks use Apoco.fields

//TODO
//need to sort out parent element from this.element to make it match fields
// for example the hide/show method is ugly


;(function(){

    var _Node=function(d,element){
        var p;
      //  console.log("Node got element " + element + " for " + d.node);
        if(!d){
            throw new Error("Apoco: node, No params");
        }
	if(d && !d.node){
            throw new Error("Apoco: node doesn't know how to make",d.node);
        };
  	for(var k in d){
	    this[k]=d[k];
	}
        if(_getNode[d.node]){
            _getNode[d.node](this);
        }
        else{
            throw new Error("Node: no node called " + d.node + " exists");
        }
        if(element !== undefined){
            p=element;
            this.root=p;
        }
        else{
            p=this.element;
        }
        if(this.class){
            Apoco.Utils.addClass(p,this.class);
        }
        if(this.childClass){
            Apoco.Utils.addClass(this.element,this.childClass);
        }
        if(this.hidden){
            this.hide();
        }
        if(this.title){
            this.element.setAttribute("title",this.title);
        }
	if(this.id){
	    this.element.id=this.id;
	}
        if(this.name){
           // console.log("++++++++++++++++Node adding name " + this.name);
            this.element.setAttribute("name",this.name);
        }
        if(this.props){
           
            for(var k in this.props){
                this.element[k]=this.props[k];
            }
        }
        if(element){
        //    console.log("APPERNFING NODE TO ELEMENT " + element);
            element.appendChild(this.element);
        }
    };

    _Node.prototype={
	getElement: function(){
	    return this.element;
	},
        getParent:function(){
            return this.parent;  
        },
	setText: function(text){
            if(this.text !== undefined && text !== undefined ){
         	this.element.innerHTML=text;
                this.text=text;
            }
            else{
                throw new Error("Cannot set text of " + this.node);
            }
            return this;
	},
        delete:function(msg_from_parent){
            while (this.element.lastChild) {
                this.element.removeChild(this.element.lastChild);
            }
            if(this.parent && msg_from_parent === undefined){
		this.parent.deleteChild(this);
                return;
	    }
            else if(this.element.parentNode) {
                this.element.parentNode.removeChild(this.element);
            }
            if(this.listen){
                Apoco.IO.unsubscribe(this);
            }
            this.element=null;
        },
        show:function(){
            this.hidden=false;
            if(this.root){
                this.root.style.display="";
            }
            else{
                this.element.style.display="";
            }
            return this;
        },
        hide:function(){
            this.hidden=true;
            if(this.root){
                this.root.style.display="none";
            }
            else{
                this.element.style.display="none";
            }
            return this;
        },
        isHidden:function(){
            if(document.contains(this.element)){
                return false;
            }
            return true;
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
               // console.log("",that.attr);
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
            if(that.text===undefined){
                that.text="";
            }
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
            if(that.text===undefined){
                that.text="";
            }
           
            that.element.textContent=that.text;
            
	    if(that.for){
                that.element.htmlFor=that.for;
	    }
	},
        code: function(that){
            that.element=document.createElement("code");
                       
            if(that.text===undefined){
                that.text="";
            }
            
            // that.element.textContent=that.text;
            that.element.innerHTML=that.text;
        },
	paragraph: function(that){
	    that.element=document.createElement("p");
            if(that.text===undefined){
                that.text="";
            }
                // that.element.textContent=that.text; // doesn't parse unicode
            that.element.innerHTML=that.text;
	},
        list: function(that){
            if(that.ordered === true){
                that.element=document.createElement("ol");
            }
            else{
	        that.element=document.createElement("ul");
            }
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
                    if(Apoco.type['array'].check(that.items[i].labels)){
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
                    if(Apoco.type['array'].check(that.items[i].descriptions)){
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
                if(that.keepAspectRatio === false){
                    that.element.appendChild(imm);
                    return;
                }
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
            that.element.classList.add("apoco_clock");
            if(that.timer){
                that.timer=null;
            }
            var cb=function(t){
                var d=new Date();
                if(!t.element){   //if the element has been deleted
                    window.clearInterval(t.timer);
                    return;
                }
             //   console.log("date is " + d);
             //   console.log("element is " + t.element);
                t.element.textContent=d.toLocaleTimeString();
            };
	    that.timer=window.setInterval(function(){cb(that);},1000);
	},
        button:function(that){
            var t=that.text?that.text: that.name;
            that.element=document.createElement("button");
            that.element.type="button";
            that.element.classList.add("button");
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
            that.element.classList.add("apoco_paginate");
            var cb=function(index,el){
              //  console.log("index is " + index);
                n=el.parentNode.childNodes;
                for(var i=0;i<n.length;i++){
                    n[i].classList.remove("selected");
                }
                el.classList.add("selected");   
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
        }
    };
/*
    Apoco.node={};

    for(var k in _getNode){
        Apoco.node[k]=function(options,el){
          return  new _Node(options,el);
        };
    }
  */  
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

var Apoco=require('./declare').Apoco;

// check that we have the string methos to remove leading and trailing whitespace

String.prototype.trim = String.prototype.trim || function trim() {
    return this.replace(/^\s\s*/, '').replace(/\s\s*$/, ''); };



;(function(){
    var DEBUG=true;
    'use strict';
    Apoco.cloneDeep=require("clone-deep");
    Apoco.Utils={  
        getCssValue:function(css_class,rule,filename){ // doesn't work in chrome
            var stylesheets;
            console.log("class is " + css_class + " rule " + rule + " filename " + filename);
            if(document && document.styleSheets){
                stylesheets = document.styleSheets;
            }
            else{
                return null;
            }
           // console.log("found " + stylesheets.length + " number of stylesheets");
            var found=-100;
            for(var j=0;j< stylesheets.length; j++){
                if(filename !== undefined){
                  //  console.log("got stylesheets" + stylesheets[j].href);
                    if(stylesheets[j].href && (stylesheets[j].href.indexOf(filename)>0)) {
                     //   console.log("filename equals %j ", stylesheets[j]);
                        found=j;
                        break;
                    }
                }
            }
            if(found>=0){
              //  console.log("Found the filename");
                var classes=stylesheets[j].rules || stylesheets[j].cssRules; // || stylesheets[j].rules[0].cssRules;
                if(classes === undefined || classes === null){
                    return null;
                }
               // console.log("got classes %j ",classes);
                for(var i=0; i<classes.length; i++){
                   // console.log("got class " + classes[i].selectorText );
                    if(classes[i].selectorText == css_class){
                    //  console.log("found the class " + classes[i].selectorText + " style " + classes[i].style[rule]);
                    //   console.log("style Object %j ", classes[i].style);
                    //   console.log("rule is " + classes[i].style[rule]);
                        if(classes[i].style[rule]){
                          //  console.log("returning " + classes[i].style[rule]);
                            return classes[i].style[rule];
                        }
                    }
                }
            }
            return null;
        },
        widthFromCssClass:function(class_list,filename){ // if in ems need to take font-size into account
            var value=0,units,v;
            for(var i=0;i<class_list.length;i++){
              //  var c=("." + children[i].type).toString();
                var t=Apoco.Utils.getCssValue(class_list[i].classname,"width",filename);
              //  console.log("got class value " + t);
                if(t=== null){
                    return null;
                }
                if(t.indexOf("em")>0){
                    var v=t.split("em");
                    if(units !== undefined && units !== "em"){
                        return null;
                    }
                    units="em";
                }
                else if(t.indexOf("px")>0){
                    var v=t.split("px");
                    if(units !== undefined && units !== "px"){
                        return null;
                    }
                    units="px";
                }
                else{
                    return null;
                }
                class_list[i].value=v[0];
                class_list[i].units=units;
                value += parseFloat(v[0]);
            }
            return (value.toString() + units);
        },
        addClass:function(element,cl){
            if(!element){
                throw new Error("addClass: requires an html element");
            }
            if(!cl){
                throw new Error("addClass: requires a class or an array of classes");
            }
            if(cl){
                if(Apoco.type["string"].check(cl)){
                    element.classList.add(cl);
                }
                else{
                    for(var i=0;i< cl.length;i++){
                       if(Apoco.type["string"].check(cl[i]) && !Apoco.type["blank"].check(cl[i]) ){ 
                           element.classList.add(cl[i]);
                       }
                    }
                }
            } 
        },
        fontSizeToPixels:function(font_size){
            var p,pp="";
            var lu={"6":8,"7":9,"7.5":10,"8":11,"9":12,"10":13,"11":15,"12":16,"13":17,"13.5":18,"14":19,"14.5":20,"15":21,"16":22,"17":23,"18":24,"20":26,"22":29,"24":32,"26":35,"27":36,"28":37,"29":38,"30":40,"32":42,"34":45,"36":48};
            if(font_size === undefined){
                return null;
            }
            pp=font_size.toString();
            if(pp.indexOf("pt")>=0){
                p=pp.split("pt");
                pp=p[0].toString();
            }
            else if(isNaN(font_size)){
                return null;
            }
            if(lu[pp]){
                return lu[pp];
            }
            
            return null;
        },
	binarySearch: function(arr,sort_order,data,closest){ // sorted list on an array of key value objects
	    // sort_order array -  1st then 2nd etc
	    var mid,r,compare;
            var len=arr.length;
            //console.log("array len is " + len);
         //  console.log("data to match is %j",data);
            if(sort_order === null){ //should be sorting on uniquekey
                compare=function(aa){
                   // console.log("testing " + aa + " with " + data);
                    if(aa == data){
                   //     console.log(aa + " is equal to " + data);
                        return 0;
		    }
		    else if(aa > data){
		     //  	console.log(aa + " is greater than " + data);
			return 1;
		    }
		    else if(aa < data){
		       // console.log(aa + " is less than " + data);
			return -1;
		    }
	            else{  // sorting on uniqueKey if value is null throw an error
                        throw new Error("binarySearch: sorting on UniqueKey found a null value");
                    }
                };
            }
            else{
	        compare=function(aa){
		    var field,item,curr;
                   // console.log("START Compare:");
		    for(var i=0;i<sort_order.length;i++){
		        field=sort_order[i];
                        item=data[field];
                        if(aa[field].hasOwnProperty("value")){
                            curr=aa[field].value;
                        }
                        else{
                            curr=aa[field];
                        }
                      //  console.log("sort field is " + field + " item is " + item + " compare " + aa[field].value);
                        if(curr == item){ // && i === sort_order.length -1){
		        //    console.log(curr + " equals " + item);
		            //found[i]=true;
                            continue;
		        }
                        if(item === "" || item === null){
                          //  console.log("continue");
                            return 1;
                        }
                        if(curr === "" || curr === null){
                           // console.log("continue");
                            return -1;
                        }
		      //  console.log("field is " + field + " value is " + item);
  
		        if(curr > item){
		           // console.log(curr + " is greater than " + item);
			    return 1;
		        }
		        else if(curr < item){
		       //    console.log(curr + " is less than " + item);
			    return -1;
		        }
	                else{
                            throw new Error("binarySearch: should never get here- trying to find "+ JSON.stringify(item) + " field is " + field);
                        }
		    }
                    return 0;
	            //	console.log(" return value is  null ");
	            //	return null;
	        };
            }
	    // perhaps should use localeCompare() e.g string1.localeCompare(string2)
	    mid = Math.floor(arr.length / 2);
	  //  console.log("mid is " + mid);
            if(closest){
                if(closest.index === undefined){
                    closest.index=mid;
                }
                else{
                    closest.index=(closest.dir==="after")?closest.index+mid:closest.index-Math.ceil(arr.length / 2);
                }
            }
  	    r=compare(arr[mid]);
         //   for(var i=0;i<arr.length;i++){
          //      console.log("array is here id  " + arr[i]["id"].value + " date " + arr[i]["submissionDate"].value);
          //  }
	    if (r < 0  && arr.length > 1) {
                if(closest){
                    closest.dir="after";
                }
                //console.log("going up");
            	return Apoco.Utils.binarySearch(arr.slice(mid, Number.MAX_VALUE),sort_order,data,closest);
	    }
	    else if (r > 0 && arr.length > 1) {
                if(closest){
                    closest.dir="before";
                }
              //  console.log("going down");
		return Apoco.Utils.binarySearch(arr.slice(0, mid),sort_order,data,closest);
	    }
	    else if (r  === 0) {
                return arr[mid];
	    }
	    else {
		//console.log('not here');
		if(closest){
		    closest.val=arr[mid];
                    if(r<0){
                        closest.dir="after";
                    }
                    else{
                        closest.dir="before";
                    }
		}
		return null;
	    }
	},
	hashCode: function(str){
	    var hash = 0;
	    var char;
	    if (str.length == 0) return hash;
	    for (var i = 0; i < str.length; i++) {
		char = str.charCodeAt(i);
		hash = ((hash<<5)-hash)+char;
		hash = hash & hash; // Convert to 32bit integer
	    }
	    return hash;
	},
	extend: function(subClass,superClass){   //class deep inheritance
	    var F = function(){};
	    F.prototype=superClass.prototype;
	    var subProto=subClass.prototype;

	    subClass.prototype=new F();
	    subClass.prototype.constructor=subClass;
	    subClass.superClass=superClass.prototype;
	    // if the subClass has prototype members copy them to the new object
	    for(var k in subProto){
		if(subProto.hasOwnProperty(k)){
		    subClass.prototype[k]=subProto[k];
		}
	    }

	    //  if(!Object.prototype.constructor) console.log("olkjkllkj");
	    //if(superClass.prototype.constructor) console.log("uiiooui");
	    if(superClass.prototype){
		if(superClass.prototype.constructor === Object.prototype.constructor){
		    superClass.prototype.constructor = superClass;
		}
	    }
	},
  
        draggable:function(source,destination,handle){
            handle=undefined;    // the handle is not working in all cases disable 
            if(destination === undefined){
                destination=document.body;
            }
            if(handle === undefined){
              //  console.log("handle is undefined");
                handle=source;
            }
            if(!source){
                throw new Error("draggable: source is undefined");
            }
            handle.classList.add("isdraggable");
            
            var allowDrag=function(e){
              //  console.log("allow drag is here");
                e.preventDefault();
                return false;
            };
            var dragEnd=function(e){
              //  console.log("dragEnd is here " + e.target);
                if(e.currentTarget === e.target){
                    e.stopPropagation();
                //    console.log("dragend is here");
                    e.currentTarget.classList.remove("draggable");
                    destination.removeEventListener("drop",drop);
                    destination.removeEventListener("dragover",allowDrag);
                }
   
            };
            var drop=function(e){
                // return function(e){
               // console.log("drop is here");
                e.preventDefault();
                e.stopPropagation();
                var data=e.dataTransfer.getData("text").split(",");
                //console.log("drop git data %j",data );
                if(!source){
                    throw new Error("source is undefined");
                }
                if(handle.classList.contains("draggable")){
                  //  console.log("source has class draggable ");
                    source.style.left = (e.clientX + parseInt(data[0],10)) + 'px';
                    source.style.top = (e.clientY + parseInt(data[1],10)) + 'px';
                    handle.classList.remove("draggable");
                }
                //  document.body.removeChild(document.getElementById("temp_clone"));
                return false;
               // };
            };
            
            var dragStart=function(e){
                var a,b;
                //console.log("current target is " + e.currentTarget.id + " target " + e.target.id);
                if(e.currentTarget === e.target){
                    e.stopPropagation();
                  //  console.log("dragStart is here " + e.target);     
                    e.currentTarget.classList.add("draggable");
                    destination.addEventListener("dragover",allowDrag,false);
                    destination.addEventListener("drop",drop,false);
                    var style=window.getComputedStyle(e.target, null);
                    //e.dataTransfer.setData("text", e.target.id);
                    a=style.getPropertyValue("left");
                    b=style.getPropertyValue("top");
             //       console.log("setting data to " + a + " and " + b);
                    e.dataTransfer.setData("text",  (parseInt(style.getPropertyValue("left"),10) - e.clientX) + ',' + (parseInt(style.getPropertyValue("top"),10) - e.clientY));
                }
             
            };
            
            //console.log("draggable is here- source.draggable is " + source.draggable);
            if(handle.draggable=== false){
              //  console.log("dragable is false");
                handle.draggable=true;
                handle.addEventListener("dragstart",dragStart,false);
                handle.addEventListener("dragend",dragEnd,false);
            }
                        
        },
        formatDate: function(d){ //YYYY-MM-DD to human
            //	console.log("date is " + d);
	    var days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
	    var months = ["January", "February", "March", "April", "May",
		          "June", "July", "August", "September", "October", "November", "December"];

	    var parts=d.split("-"); // because Safari does not understand the ISO8601 format
            
            if(parts.length !== 3){
                parts=[];
                d=d.trim();
                if(d.length !== 8){
                    throw new Error("date is in wrong format - YYYY-MM-DD or YYYYMMDD","Utils.js");
                }
                parts[0]=d.substr(0,4);
                parts[1]=d.substr(4,2);
                parts[2]=d.substr(6);
    
            }
           
	    var date=new Date(parseInt(parts[0]),parseInt(parts[1])-1,parseInt(parts[2])); // stupid workaround for Safari 5.1
	    var month=date.getMonth();
	    var day=date.getDay();
	    var n=date.getDate();
	    var year=date.getFullYear();
	    var ending;
	    var last_char=n.toString().slice(-1);
	    //console.log(" last char is " + last_char);
	    var d=parseInt(n);
	    if(d>10 && d<14){
	        ending="th";
	    }
	    else if(last_char === "1"){

	        ending="st";
	    }
	    else if( last_char === "2"){
	        ending="nd";
	    }
	    else if(last_char === "3"){
	        ending="rd";
	    }
	    else{
	        ending="th";
	    }
	    //date.toLocaleString();
	    return (days[day] + " " + n + ending + " "  +  months[month] + " " + year);

        },

        dateNow:function(){
	    var n=new Date();
	    var now= (n.getFullYear() + "-" + ('0' + (n.getMonth()+1)).slice(-2) + "-" + ('0' + n.getDate()).slice(-2));
	    return now;
        },
        datePast:function(date){
	    var n=new Date(); //.toISOString(); // current or past events
	    var now= (n.getFullYear() + "-" + ('0' + (n.getMonth()+1)).slice(-2) + "-" + ('0' + n.getDate()).slice(-2));
            //	console.log("now is " + now + " and date is " + date);
	    var r=(now > date)?true: false;
	    return r;
        },
        observer:{
            _list:[],
            create: function(){
                var that=this;
                var check=function(mutations){
                    if(that._list.length>0){
                        mutations.forEach(function(mutation){
                            for(var k in mutation){
                            //    console.log("mutation is " + k);
                                if(k === "addedNodes"){
                                  //  for(var n in mutation.addedNodes){
                                  //      console.log("mutation.addNodes key is " + n);
                                  //  }
                                  //  console.log("mutation addedNodes.length is " + mutation.addedNodes.length);
                                    for(var i=0; i< mutation.addedNodes.length;i++){
                                    //    console.log("Mutation observer addedNodes " + mutation.addedNodes[i].id);
                                        for(var j=0;j<that._list.length;j++){
                                       //     console.log("Observer trying to find " + that._list[j].id);
                                            if(mutation.addedNodes[i].id == that._list[j].id && that._list[j].found === false){
                                        //        console.log(" really found ????? " + document.getElementById(that._list[j].id));
                                         //       console.log("+++++++++++++++++++++++++++++++++++++++++==Observer Found " + that._list[j].id);
                                          //      console.log("!!!!!!!!!!!!!!!!!!!!!!!!Observer calling action function");
                                                that._list[j].found=true;
                                                that._list[j].fn.call(that._list[j].context,that._list[j].context);
                                                // break;
                                            };
                                        }
                                    }
                                    break;
                                }
                            }
                        });  
                        
                    }
                    var temp=[];
                 //   console.log("observer list is " + that._list.length);
                    for(var k=0;k<that._list.length;k++){
                       //console.log("that_list " + k + " found is " + that._list[k].id + " found " + that._list[k].found);
                        if(that._list[k].found === false){
                            temp.push(that._list[k]);
                        }
                     //  else{
                     //      console.log("==================== cutting out " + that._list[k].id);
                     //  }
                    }
                    that._list=temp;
                    if(that._list.length==0){ // all fullfilled so reset
                        Apoco.Observer.takeRecords(); //empty the list
                        Apoco.Observer.disconnect(); //stop observing
                     //   console.log("OBSERVER DISCONNECT");
                    }

                   // console.log("observer list is now " + that._list.length);
                };
                if(!Apoco.Observer){
                    var MutationObserver = window.MutationObserver || window.WebKitMutationObserver || window.MozMutationObserver;
                  //  console.log("MAKING NEW OBSERVER");
                    Apoco.Observer=new MutationObserver(function(mutations){
                        check(mutations);
                    });
                }
            },
            add:  function(id,fn,context){

             //  console.log("Observer adding ____________- id to list  " + id);
                if(id !== undefined){
                    this._list.push({id:id,fn:fn,context:context,found:false});
                }
             //  console.log("obsever list is " + this._list.length + " long");
            }

        },
        getSiblings:function (elem) {
            var siblings = [];
            var sibling = elem.parentNode.firstChild;
            while(sibling){
                //for ( ; sibling; sibling = sibling.nextSibling )
               // console.log("found sibling");
                if ( sibling.nodeType == 1 && sibling != elem ){
                    siblings.push( sibling );
                }
                sibling=sibling.nextSibling;
            }
            return siblings;
        },
        
        detectMobile: function(){
            if(navigator.userAgent.match(/Android/i)
               ||navigator.userAgent.match(/webOS/i)
               ||navigator.userAgent.match(/iPhone/i)
               ||navigator.userAgent.match(/Windows Phone/i)
               ||navigator.userAgent.match(/BlackBerry/i)
               ||navigator.userAgent.match(/IEMobile/i)){
                return true;
            }
            else{
                return false;
            }
        },
  
	history: {
	    init: function(func){
//		console.log("init history");
                global.window.addEventListener('popstate',function(event) {
                    //console.log("location: " + document.location + ", state: " + JSON.stringify(event.state));
                    if(event.state && event.state.name ){
                       // console.log("FORWARD AND BACK BUTTON name is " + event.state.name);
                        func(event.state.name);
                    }
                    else{
                        func(null);
                    }
                    
                },false);
	    },
  	    currentState: function(){
		return(history.state);
	    },
	    replace: function(c_obj){
		history.replaceState(c_obj,c_obj.title,c_obj.url);
	    },
	    push: function(name){   // used by callback functions
                var p,c_obj={};
                c_obj.name=name;
                //p=("index.html?" + name);
                p=(window.location.pathname + "?" + name);
               // console.log("path is " + p);
		history.pushState(c_obj,name,p);
	    },
            fragString:function(){
                var name=null,u=window.location.href;
                var p=u.split("?"); 
            },
            queryString:function(){
                var name=null,u=window.location.href;
                var p=u.split("?");
              //  console.log(" got string to start ",p[1]);
                if(p.length ===2){
                    name=p[1].toString();
                }
                return name;
            }
        }
    };

})();

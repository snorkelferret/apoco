var Harvey=require('./declare').Harvey,UI=require('./declare').UI,jQuery=require('jquery');

// check that we have the string methos to remove leading and trailing whitespace

String.prototype.trim = String.prototype.trim || function trim() {
    return this.replace(/^\s\s*/, '').replace(/\s\s*$/, ''); };



;(function(){
    var DEBUG=true;
    'use strict';

    Harvey.Utils={
        getCssValue:function(css_class,rule){
            var stylesheets = document.stylesheets;
            for(var j=0;j< stylesheets.length; j++){
                var classes=stylesheets[j].rules || stylesheets[j].cssRules || stylesheets[j].rules[0].cssRules;
                for(var i=0; i<classes.length; i++){
                    if(classes[i].selectorText == css_class){
                        if(classes[i].style == rule){
                            return classes[i].style;
                        }
                    }
                }
            }
            return null;
        },
	binarySearch: function(arr,sort_order,data,closest){ // sorted list on an array of key value objects
	    // sort_order array -  1st then 2nd etc
	    var mid,r;
            var len=arr.length;
	    function compare(aa){
		var field,item;
                console.log("Compare: sort_order.length is " + sort_order.length);
		for(var i=0;i<sort_order.length;i++){
		    field=sort_order[i];
		    item=data[field];
		    console.log("field is " + field);
                    if(aa[field].value == item){ // && i === sort_order.length -1){
			console.log(aa[field].value + " equals " + item);
		        //found[i]=true;
                        continue;
		    }
		    else if(aa[field].value > item){
			console.log(aa[field].value + " is greater than " + item);
			return 1;
		    }
		    else if(aa[field].value < item){
			console.log(aa[field].value + " is less than " + item);
			return -1;
		    }
	            else{
                        throw new Error("binarySearch: should never get here");
                    }
		}
                return 0;
	//	console.log(" return value is  null ");
	//	return null;
	    }
	    // perhaps should use localeCompare() e.g string1.localeCompare(string2)
	    mid = Math.floor(arr.length / 2);
	    console.log("mid is " + mid);
            if(closest){
                if(closest.index === undefined){
                    closest.index=mid;
                }
                else{
                    closest.index=(closest.dir==="after")?closest.index+mid:closest.index-Math.ceil(arr.length / 2);
                }
            }
  	    r=compare(arr[mid]);
	    if (r < 0  && arr.length > 1) {
                if(closest){
                    closest.dir="after";
                }
            	return Harvey.Utils.binarySearch(arr.slice(mid, Number.MAX_VALUE),sort_order,data,closest);
	    }
	    else if (r > 0 && arr.length > 1) {
                if(closest){
                    closest.dir="before";
                }
		return Harvey.Utils.binarySearch(arr.slice(0, mid),sort_order,data,closest);
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
        formatDate: function(d){
            //	console.log("date is " + d);
	    var days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
	    var months = ["January", "February", "March", "April", "May",
		          "June", "July", "August", "September", "October", "November", "December"];

	    var parts=d.split("-"); // because Safari does not understand the ISO8601 format
            //	var date=new Date(d);
	    var date=new Date(parseInt(parts[0]),parseInt(parts[1])-1,parseInt(parts[2])); // stuoid workaround for Safari 5.1
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
                        for(var item in mutations){
                            //console.log("this is mutation item " + item);
                            for(var i=0; i< item.addedNodes.length;i++){
                              //  console.log("Mutation observer added " + item.addedNodes[i].id);
                                for(var j=0;j<that._list.length;j++){
                                //    console.log("Observer trying to find " + that._list[j].id);
                                    if(item.addedNodes[i].id == that._list[j].id && that._list[i].found === false){
                                        console.log("Observer Found " + that._list[j].id);
                                   //     console.log("Observer calling action function");
                                        that._list[j].fn.call(that._list[j].context,that._list[j].context);
                                        that._list[j].found=true;
                                       // break;
                                    };
                                }
                            }
                        }
                    }
                    var temp=[];
                    console.log("observer list is " + that._list.length);
                    for(var k=0;k<that._list.length;k++){
                        if(that._list[k].found !== true){
                            temp.push(that._list[k]);
                        }
                        else{
                            console.log("==================== cutting out " + that._list[k].id);
                        }
                    }
                    that._list=temp;
                    if(that._list.length==0){ // all fullfilled so reset
                        Harvey.Observer.takeRecords(); //empty the list
                        Harvey.Observer.disconnect(); //stop observing
                    }

                    console.log("observer list is now " + that._list.length);
                };
                if(!Harvey.Observer){
                    var MutationObserver = window.MutationObserver || window.WebKitMutationObserver || window.MozMutationObserver;
                    Harvey.Observer=new MutationObserver(function(mutations){
                        check(mutations);
                    });
                }
            },
            add:  function(id,fn,context){

                console.log("Observer adding ____________- id is " + id);
                if(id !== undefined){
                    this._list.push({id:id,fn:fn,context:context,found:false});
                }
                //console.log("obsever list is " + this._list.length + " long");
            }

        },
        detectMobile: function(){
            if(navigator.userAgent.match(/Android/i)
               ||navigator.userAgent.match(/iPhone/i)
               ||navigator.userAgent.match(/BlackBerry/i)
               ||navigator.userAgent.match(/IEMobile/i)){
                return true;
            }
            else{
                return false;
            }

        }
    };

})();

var Apoco=require('./declare').Apoco;
require("./Utils");
require("./Types")

;(function(){

    'use strict';

    function chunkify(t) {
	var tz = [], x = 0, y = -1, n = 0, i, j;
	t=t.toString();
	while (i = (j = t.charAt(x++)).charCodeAt(0)) {
	    var m = (i == 46 || (i >=48 && i <= 57));
	    if (m !== n) {
		tz[++y] = "";
		n = m;
	    }
	    tz[y] += j;
	}
	return tz;
    }

    var default_compare=function(a){return a;};
    
    function generic_compare(a,b,fn){
	var s=fn(a);
	var t=fn(b);
	if(s<t) return -1;
	if(s>t) return 1;
	return 0;
    }


    var sort_fn=function(type){
        var a,b,aa,bb,c,d;
	switch(type){
	case "integer":
	case "count":
	case "phoneNumber":
	case "maxCount":
	case "string":
	case "float":
	case "positiveInteger":
            return generic_compare;
	case "date":  // date is in format 2018-04-22
	case "token":	
	case "alphaNum":
	    return (function(s,t,fn){
		a=fn(s);
		b=fn(t);
		if( a === b) return 0;
		aa = chunkify(a);
		bb = chunkify(b);
		
		for (var x = 0; aa[x] && bb[x]; x++) {
		    if (aa[x] !== bb[x]) {
			c = Number(aa[x]), d = Number(bb[x]);
			if (c == aa[x] && d == bb[x]) {
			    return c - d;
			} else return (aa[x] > bb[x]) ? 1 : -1;
		    }
		}
		return aa.length - bb.length;
	    });
	case "negativeInteger":
	    return function(a,b,fn){ // note order is swapped 
		var s=fn(a);
		var t=fn(b);
		if(t<s) return -1;
		if(t>s) return 1;
		return 0;	
	    };
	case "boolean":
	case "currency":
	case "email":
	case "integerArray":
	case "floatsArray":
	case "text":	
	case "time":
	default:
	    //throw new Error("Apoco.sort:- Don't know how to sort " + type);
	    return undefined;
	}
	return undefined;    
	
    };
 
    
    Apoco.isSortable=function(type){
	if(sort_fn(type) !== undefined){
	    return true;
	}
	return false;
    };
  
    Apoco.sort=function(r,type_data){
	var compare,fn,t;
        if(r === undefined){
            throw new Error("Apoco.sort needs an input array");
        }
        if(Apoco.type['array'].check(type_data)){
	    for(var i=0;i<type_data.length;i++){ // multiple fields to order sort
		if(!Apoco.isSortable(type_data[i].type)){
		    throw new Error("Apoco.sort:- Don't know how to sort type " + type_data[i].type);
		}
                // if(!Apoco.type_data[i].fn){
                if(!type_data[i].fn){
                     throw new Error("Apoco.sort needs a function to retrieve the array element"); 
                }
	  //      console.log("sort: array index " + i + " has type " + type_data[i].type);
		type_data[i].compare=sort_fn(type_data[i].type);
	  //      console.log("sort: type data function is " + type_data[i].fn);
	    }
	    r.sort(function(a,b){ 
		for(var i=0;i<type_data.length;i++){
		    t=type_data[i].compare(a,b,type_data[i].fn);
		    if(t !== 0){
			return t;
		    }
		}
		return t;
	    });
        }
        else{
            if(type_data && Apoco.type["object"].check(type_data)){
	        compare=sort_fn(type_data.type);
                if(!type_data.fn){
                    throw new Error("Apoco.sort needs a function to retrieve the array element");
                }
	        fn=type_data.fn;
            }
            else if(Apoco.type["string"].check(type_data)){
                compare=sort_fn(type_data);
                if(compare === undefined){
                    throw new Error("Sort: don't know how to sort " + type_data);
                }
                fn=default_compare;
            }
            else{
                throw new Error("Apoco.sort: Incorrect parameters ");
            }
	    r.sort(function(a,b){
	        return compare(a,b,fn);
	    });
        }
        return r;
    };
  	
})();


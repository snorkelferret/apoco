var Harvey=require('./declare').Harvey;
require("./Utils.js");

;(function(){

    'use strict';

    function chunkify(t) {
	var tz = [], x = 0, y = -1, n = 0, i, j;
	
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

    
    function generic_compare(a,b,fn){
	var s=fn(a);
	var t=fn(b);
	if(s<t) return -1;
	if(s>t) return 1;
	return 0;
    }


    var sort_fn=function(type){
	switch(type){
	case "integer":
	case "count":
	case "phoneNumber":
	case "maxCount":
	case "string":
	case "float":
	case "positiveInteger":
	case "date":
	    return generic_compare;
	case "token":	
	case "alphaNum":
	    return (function(s,t,fn){
		a=fn(s);
		b=fn(t);
		if( a === b) return 0;
		var aa = chunkify(a);
		var bb = chunkify(b);
		
		for (x = 0; aa[x] && bb[x]; x++) {
		    if (aa[x] !== bb[x]) {
			var c = Number(aa[x]), d = Number(bb[x]);
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
	case "integers2":
	case "floats2":
	case "text":	
	case "time":
	default:
	    //throw new Error("Harvey.sort:- Don't know how to sort " + type);
	    return undefined;
	}
	return undefined;    
	
    };
    var default_compare=function(a){return a;};
    
    Harvey.isSortable=function(type){
	if(sort_fn(type) !== undefined){
	    return true;
	}
	return false;
    };
    Harvey.sort=function(r,type_data){
	var compare,fn,t;
        
        if(Harvey.checkType['array'](type_data)){
	    for(var i=0;i<type_data.length;i++){ // multiple fields to order sort
		if(!Harvey.isSortable(type_data[i].type)){
		    throw new Error("Harvey.sort:- Don't know how to sort type " + type_data[i].type);
		}
                // if(!Harvey.type_data[i].fn){
                if(!type_data[i].fn){
                     throw new Error("Harvey.sort needs a function to retrieve the array element"); 
                }
	        //	console.log("sort: array index " + i + " has type " + type_data[i].type)
		type_data[i].compare=sort_fn(type_data[i].type);
	        //	console.log("sort: type data function is " + type_data[i].fn);
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
            if(type_data && Harvey.checkType["object"](type_data)){
	        compare=sort_fn(type_data.type);
                if(!type_data.fn){
                    throw new Error("Harvey.sort needs a function to retrieve the array element");
                }
	        fn=type_data.fn;
            }
            else if(Harvey.checkType["string"](type_data)){
                compare=sort_fn(type_data);
                fn=default_compare;
            }
            else{
                throw new Error("Harvey.sort: Incorrect parameters ");
            }
	    r.sort(function(a,b){
	        return compare(a,b,fn);
	    });
        }
        return r;
    };
 

	
})();


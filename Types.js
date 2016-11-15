var Apoco=require('./declare').Apoco;

;(function(){

    
    Apoco.type={
        alphaNum:{
            html_type:"text",
            field: "input",
            check: function(s){
	        if(Apoco.type.blank.check(s)){
		    return false;
	        }
	        s=String(s);
	        s=s.trim(); // trim leading and trailing whitespace
	        var isAlphaNumeric =/^[a-zA-Z0-9]+$/;   // No spaces or underscores //: /[^a-zA-Z0-9_ ]/;  // /^[a-zA-Z0-9]*$/
	        if(s.search(isAlphaNumeric) != -1){
		    return  true;  //s.toString();
	        }
	        return false;
            }},
        alphabetic:{
            html_type:"text",
            field: "input",
            check:function(s){
	        if(Apoco.type.blank.check(String(s))){
		    return false;
	        }
	        var isAlpha =/^[a-zA-Z]+$/;
                s=String(s);
	        if(s.search(isAlpha) != -1){
		    return true;
	        }
	        return false;
	}},
        any:{
            html_type:"text",
            field: "input",
            check:function(s){
                return true;
            }},
        array:{
            html_type: "text",
            field: "stringArray",
            check:function(a){
	        // var t=("testing  " + a + " is an array");
	        if( Object.prototype.toString.call(a) === '[object Array]' ) {
                    if(a.length>=0){
		        return true;
                    }
	        }
	        return false;
	}},
        blank:{
            check:function(s){
                if(s == "undefined" || s == undefined){
                    return true;
                }
                else if(s === null){
                    return true;
                }
                else if(s === false){
                    return null;
                }
                else{
		    var isNonblank_re    = /\S/;  // has at least one character which is not tab space or newline
		    var st=String(s);
		    if(st.search(isNonblank_re) === -1){ // does not have any "real" characters
		        return true;
		    }
		    else{
		        return null;
		    }
                }
	  	return true;
	}},
        boolean:{
            html_type: "checkbox",
            field: "checkBox",
            check:function(s){
	        //  console.log("check_field.boolean: value is " + s);
                var rf=/^([Vv]+(erdade(iro)?)?|[Ff]+(als[eo])?|[Tt]+(rue)?|0|[\+\-]?1)$/;
	        if(Apoco.type.blank.check(s)){
		    return false;
	        }
	        s=String(s);
                if(s.search(rf) !== -1){
                    return true;
                }
	        return false;
	}},
        booleanArray:{
            html_type:"checkbox",
            field: "buttonSet",
            check:function(a){
            if(Apoco.type.array.check(a)){
                for(var i=0;i<a.length;i++){
                    if(!Apoco.type.boolean.check(a[i])){
                        return false;
                    }
                }
                return true;
            }
            return false;
        }},
        count:{
            html_type: "number",
            field: "input",
            check:function(s){
	        if(Apoco.type.blank.check(s)){
		    return false;
	        }
                s=String(s);
	        if(isNaN(parseFloat(s))){
		    return false;
	        }
	        return true;
	}},
        currency:{
            html_type:"number",
            field: "input",
            check:function(s){
	        // Check if string is currency
                
	        if(Apoco.type.blank.check(s)){
		    return false;
                }
                //currency woth currency code prefix
                var re=/^([A-Z]{0,3})?[ ]?([0-9]{1,3},([0-9]{3},)*[0-9]{3}|[0-9]+)(.[0-9][0-9])?$/;
	        //var re=/[\u0024\u20AC\u00A5A-Z\s]{0,4}[0-9.,]+[\s\u0024\u20AC\u00A5A-Z]{0,4}/;
                var s=String(s);  
	        if(s.search(re) != -1){
                    return true;
                }
	        return false;
	    }},
        date: {
            html_type:"date",
            field: "date",
            check:function(s){ // Gregorian calendar date
	        if(Apoco.type.blank.check(s)){
		    return false;
	        }
	        var yyyymmdd = new RegExp("^(?:(?:(?:(?:(?:[13579][26]|[2468][048])00)|(?:[0-9]{2}(?:(?:[13579][26])|(?:[2468][048]|0[48]))))(?:(?:(?:09|04|06|11)(?:0[1-9]|1[0-9]|2[0-9]|30))|(?:(?:01|03|05|07|08|10|12)(?:0[1-9]|1[0-9]|2[0-9]|3[01]))|(?:02(?:0[1-9]|1[0-9]|2[0-9]))))|(?:[0-9]{4}(?:(?:(?:09|04|06|11)(?:0[1-9]|1[0-9]|2[0-9]|30))|(?:(?:01|03|05|07|08|10|12)(?:0[1-9]|1[0-9]|2[0-9]|3[01]))|(?:02(?:[01][0-9]|2[0-8])))))$");
	        s=String(s);
	        if(s.search(yyyymmdd) !== -1){
		        return true;
	        }
	        //	    var isDate_re=/^(0?[1-9]|[12][0-9]|3[01])[\/\-](0?[1-9]|1[012])[\/\-]\d{4}$/; // dd/mm/yyyy
	        var isDate_re=/^(19|20)?[0-9]{2}[- \/.](0?[1-9]|1[012])[- \/.](0?[1-9]|[12][0-9]|3[01])$/; // yyyy-mm-dd 1900-2099
	        if(s.search(isDate_re) !== -1){
		    return true;
	        }
	        return false;
	    }},
        decimal:{
            html_type:"number",
            field: "input",
            check: function(s){  //Decimal numbers
	        if(Apoco.type.blank.check(s) || isNaN(s)){
		    return false;
	        }
	        s=String(s);
                if(!s.search){
                    return false;
                }
	        var isDecimal_re = /^\s*(\+|-)?((\d+(\.\d+)?)|(\.\d+))\s*$/;
	        if(s.search(isDecimal_re) != -1){
		    s=parseFloat(s); //.toFixed(2); // 2 decimal places
		    return true;
	        }
	        return false;
	    }},
        email:{
            html_type:"email",
            field: "input",
            check: function(s){
	        if(Apoco.type.blank.check(s)){
		    return false;
	        }
	        s=String(s);
	        s=s.trim(); // trim leading and trailing whitespace
	        // checks that an input string looks like a valid email address.
	        var isEmail_re= /^\s*[\w\-\+_]+(\.[\w\-\+_]+)*\@[\w\-\+_]+\.[\w\-\+_]+(\.[\w\-\+_]+)*\s*$/;
	        if(s.search(isEmail_re) != -1){
		    return true;
	        }
	        return false;
	    }},
        file:{
            html_type:"file",
            field: "input",
            check: function(s){
                return true;
            }},
        float:{
            html_type:"number",
            field: "float",
            check:function(s){   //IEEE 32-bit floating-point
	        // Checks that an input string is a decimal number, with an optional +/- sign character.
	        if(Apoco.type.blank.check(s)){
		    return false;
	        }
                if(isNaN(s)){
                    return false;
                }
	        if(s==0){ return true;} // this regex below does not match 0.0 !!!!! AHGGG WHY ?????
	        // console.log("float as string is " + s);
	        s=String(s);
                if(!s.search){
                    return false;
                }
	        var isDecimal_re   =  /^\s*(\+|-)?((\d+(\.\d+)?)|(\.\d+))\s*$/;
	        if(s.search(isDecimal_re) != -1){
		    s=parseFloat(s);  //.toFixed(6); // 6 decimal places
		    return true;
	        }
	        return false;
	    }},
        floatArray:{
            html_type:"number",
            field: "numberArray",
            check:function(s){
	        if(Apoco.type.array.check(s)) {
                    for(var i=0;i<s.length;i++){
		        if(!Apoco.type.float.check(s[i])){
		            return false;
                        }
		    }
		    return true;
	        }
	        return false;
	    }},
        function:{
            check: function(a){
	        function isFunction(object) {
                    var obj={};
		    return !!(object && obj.toString.call(object) == '[object Function]');
	        }
	        // if(isFunction(a)){
	        //	return true;
	        //}
                if(typeof a === "function"){
                    return true;
                }
	        return false;
	}},
        image:{
            html_type: "image",
  
            check:function(img){   // obviously need better checking than this!!!
	        if(!img){
		    return false;
	        }
                if(!img.naturalWidth){
                    return false;
                }
                if(typeof img.naturalWidth != undefined && img.naturalWidth === 0){
                    return false;
                }
                
	        return true;
	    }},
        imageArray:{
            html_type:"image",
            field: "imageArray",
            check:function(a){
                if(Apoco.type.array.check(a)){
                    for(var i=0;i<a.length;i++){
                        if(!Apoco.type.object.check(a[i])){ // needs better than this
                            return false;
                        }
                        else if(!Apoco.type.image.check(a)){
                            return false;
                        }
                    }
                }
                else{
                    return false;
                }
                return true;
            }},
        integer:{
            html_type: "number",
            field: "input",
            check: function(s){  //32 bit signed integers
	        // checks that an input string is an integer, with an optional +/- sign character.
	        if(Apoco.type.blank.check(s)){
		    return false;
	        }
                s=String(s);
	        var isInteger_re     = /^\s*(\+|-)?\d+\s*$/;
	        if(s.search(isInteger_re) !== -1){
		    return  true; //parseInt(s, 10);
	        }
                
	        return false;
            }},
        integerArray:{
            html_type:"number",
            field: "numberArray",
            check:function(a){
                if(Apoco.type.array.check(a)){
                    for(var i=0;i<a.length;i++){
                        if(!Apoco.type.integer.check(a[i])){
                            return false;
                        }
                    }
                    return true;
                }
                return false;
            }},
        negativeInteger:{
            html_type:"number",
            field: "input",
            check:function(s){  //strictly negative integers of arbitary length
	        var isNegativeInteger_re     =  /-\s?\d+\s*$/; //  /^\s*(\-)?\d+\s*$/;
	        if(Apoco.type.blank.check(s)){
		    return false;
	        }
                s=String(s);                
	        if(s.search(isNegativeInteger_re) !== -1){
		    return true; //parseInt(s,10); // base 10
	        }
                
	        return false;
	    }},
        number:{
            html_type: "number",
            field: "input",
            check:function(s){
	        if(Apoco.type.blank.check(s) || isNaN(s)){
		    return false;
	        }
                s=String(s);
                return true;
            }},
        object:{
            check: function(a){  // a string is an object if called with var s= new String();
	        //var t=("testing  " + a + " is an object");
                if(a === undefined){
                    return false;
                }
	        if(a !== null && typeof a === 'object'){
		    return true;
	        }
	        return false;
	    }},
        objectArray:{
            check:function(a){
                if(Apoco.type.array.check(a)){
                    for(var i=0;i<a.length;i++){
                        if(!Apoco.type.object.check(a[i])){
                            return false;
                        }
                    }
                }
                else{
                    return false;
                }
                return true;
            }},
        password:{
            html_type:"password",
            field: "input",
            check:function(s){
               // s=String(s);
	        if(Apoco.type.blank.check(s)){
		    return false;
	        }
                if(Apoco.type.token.check(s)){
                    return true;
                }
                return false;
            }},
        phoneNumber:{
            html_type:"tel",
            field:"input",
            check:function(s){
	        //console.log("checking phone number " + s);
	        var pn_re=/^[\s()+-]*([0-9][\s()+-]*){6,20}$/;                    // /^(?:\+?\d{2}[ -]?\d{3}[ -]?\d{5}|\d{4})$/;
               
	        if(Apoco.type.blank.check(s)){
		    return false;
	        }
                s=String(s);
	        if(s.search(pn_re) !== -1){
		    return true;
	        }
                
	        return false;

	}},
        positiveInteger:{
            html_type:"number",
            field: "input",
            check:function(s){  //strictly positive integers of arbitary length
	     	var isPositiveInteger_re= /^\s*\d+\s*$/;
	        if(Apoco.type.blank.check(s)){
		    return false;
	        }
                s=String(s);
	        if(s.search(isPositiveInteger_re) !== -1){
		    return true; // parseInt(s,10); // base 10
	        }
	        return false;
	    }},
        range:{
            html_type:"range",
            field: "slider",
            check:function(s){
                if(Apoco.type.float.check(s)){
                    return true;
                }
                if(Apoco.type.integer.check(s)){
                    return true;
                }
                return false;
            }},
        string:{
            html_type:"text",
            field: "input",
            alt: "autoComplete",
            check:function(s){  // any non zero string
                //  console.log("checkType string is " + s);
                if(s==="") {
                    return true;
                }
	        if(Apoco.type.blank.check(String(s))){
		    return false;
	        }
	        if(typeof(s) === 'string' || s instanceof String ){
		    return true;
	        }
 	        return false; //   .toString();
	    }},
        stringArray:{
            html_type: "text",
            field: "stringArray",
            alt: "select",
            check:function(s){
                if(Apoco.type.array.check(s)){
                    for(var i=0;i<s.length;i++){
                        if(!Apoco.type.string.check(s[i])){
		            return false;
	                }
                    }
                    return true;
                }
	        return false;
	    }},
        text:{
            html_type:"text",
            field: "textArea",
            check:function(s){
	        if(Apoco.type.blank.check(String(s))){
		    return false;
	        }
	        return true;
  	    }},
        time:{
            html_type:"time",
            field: "input",
            check: function(s){ //Instant of time (Gregorian calendar)
	       
	        if(Apoco.type.blank.check(s)){
		    return false;
	        }
                s=String(s);
	        //  var isTime =/^([0-1][0-9]|[2][0-3]):([0-5][0-9])$/; // 24 hour clock HH:MM
	        // var isTime_re = /^(\d{1,2}):(\d{2})(:00)?([ap]m)?$/;
	        s=s.trim();
	        var isTime=/^((([0]?[1-9]|1[0-2])(:|\.)[0-5][0-9]((:|\.)[0-5][0-9])?( )?(AM|am|aM|Am|PM|pm|pM|Pm))|(([0]?[0-9]|1[0-9]|2[0-3])(:|\.)[0-5][0-9]((:|\.)[0-5][0-9])?))$/;  // Matches 1:01 AM | 23:52:01 | 03.24.36 AM
 	        // var isDateTime=/?n:^(?=\d)((?<day>31(?!(.0?[2469]|11))|30(?!.0?2)|29(?(.0?2)(?=.{3,4}(1[6-9]|[2-9]\d)(0[48]|[2468][048]|[13579][26])|(16|[2468][048]|[3579][26])00))|0?[1-9]|1\d|2[0-8])(?<sep>[/.-])(?<month>0?[1-9]|1[012])\2(?<year>(1[6-9]|[2-9]\d)\d{2})(?:(?=\x20\d)\x20|$))?(?<time>((0?[1-9]|1[012])(:[0-5]\d){0,2}(?i:\ [AP]M))|([01]\d|2[0-3])(:[0-5]\d){1,2})?$/;
	        if(s.search(isTime) !== -1){
		    return true;
	        }
	        else{
		    return false;
                }
	}},
        token:{
            html_type:"text",
            field: "input",
            check:function(s){  // a token has no whitespace or special chars
	        
	        if(Apoco.type.blank.check(s)){
		    return false;
	        }
                s=String(s);
	        //	var isSpecialChar= /^[@!#\$\^%&*()+=\-\[\]\\\';,\.\/\{\}\|\":<>\? ]+$/;
	        // var isSpecialChar= /^[@!#\$\^%&*()+=\[\]\\\';,\/\{\}\|\":<>\? ]+$/; // except . -
	        s=s.trim(); // trim leading and trailing whitespace
	        var invalidChar = /[^A-Za-z0-9.#_\\-]/;
	        //log("check_field token " + s);
	        if(s.search(invalidChar) === -1){
		    //log("check_field token " + s);
		    return true;
	        }
                
	        return false;
	    }},
        url:{
            html_type:"url",
            field: "input",
            check: function(s){
                
	        if(Apoco.type.blank.check(s)){
		    return false;
	        }
                s=String(s);
                var isURL=/^(ht|f)tp(s?)\:\/\/(([a-zA-Z0-9\-\._]+(\.[a-zA-Z0-9\-\._]+)+)|localhost)(\/?)([a-zA-Z0-9\-\.\?\,\'\/\\\+&amp;%\$#_]*)?([\d\w\.\/\%\+\-\=\&amp;\?\:\\\&quot;\'\,\|\~\;]*)$/;
                
                if(s.search(isURL) !== -1){
		    //log("check_field token " + s);
		    return true;
	        }
	        return false;  
            }}
    };

/*
        inheritsFrom=function(a,c){
	    var t=("testing Inherits from ");
	    while (a != null) {
		if(a.superClass && a.superClass == c.prototype)
		{
		    return true;
		}
	    }
	    return false;
	};
   */ 

})();


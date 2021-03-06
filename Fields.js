var Apoco=require('./declare').Apoco;
require('./Utils');
require("./Sort");
require('./Types');
require("./datepicker");
require("./IO");
require("./Popups");

var Promise=require('es6-promise').Promise; //polyfill for ie11

// editable: true by default
// required: false by default

;(function(){
    "use strict";

    var _Field=function(d,element){
        var defaults={
            required:false,
            editable: true,
            type: "any",
            value: null,
            hidden:false
        };
        if(!d){
            throw new Error("Field: must have some options");
        }
        if(!d.name){
            throw new Error("Apoco.field: Field must have a name");
        }
        if(!d.type){
            throw new Error("Apoco.field: must have a type");
	}
     
        for(var k in defaults){  
            if(d[k] === undefined){
                d[k]=defaults[k];
            }
        }
        
        for(var k in d){
            this[k]=d[k];
        }
        (this.editable===false)?this.popup=false:this.popup=true; // no popup editor if not editable
           
        if(Apoco.type[this.type]){
	    this.html_type=Apoco.type[this.type].html_type;
        }
        else{ 
            throw new Error("Apoco field does not support type " + this.type);
        }
        
        if(element === undefined){
            this.element=document.createElement("div");
        }
	else if(element){
            this.element=element;
        }
	else {
            throw new Error("Field: element is not a html node");
        }
        this.element.classList.add(this.type);

        if(this.class){
            Apoco.Utils.addClass(this.element,this.class);
        }
        
	this.element.setAttribute("name",this.name);
        if(this.title !== undefined){
            this.element.title=this.title;
        }
	if(this.label){
            var l=document.createElement("label");
            l.appendChild(document.createTextNode(this.label));
 	    this.element.appendChild(l);
	}
        if(this.hidden){
            this.hide();
        }
	if(this.publish !== undefined){
	    Apoco.IO.publish(this);
	}
	if(this.listen !== undefined){
	    Apoco.IO.listen(this);
	}
    };

    _Field.prototype={
	getElement:function(){
	    return this.element;
	},
	getInputElement: function(){
	    if(this.input){
		return this.input;
	    }
	    return null;
	},
        getLabel:function(){
            var t=this.element.getElementsByTagName("label")[0];
            if(t){
                return t;
            }
            return null;
        },
        getParent:function(){
            return this.parent;
        },
	getKey:function(){
            var k=(this.name)?this.name: this.label;
	    if(k){
		return k;
	    }
	    return null;
	},
        hide:function(){
            this.hidden=true;
           // if(this.DOM.contains(this.element)){
            this.element.style.display="none";
            return this;
           // }
        },
        show:function(display_type){
            this.hidden=false;
            
            if(display_type && display_type !== "none"){
                this.element.style.display=display_type; 
            }
            else{
                this.element.style.display="inherit"; 
            }
            return this;
        },
        isHidden:function(){
            if(this.DOM && this.DOM.contains(this.element)){
                return false;
            }
            return true;
        },
        setRequired:function(on){
            if(on){
                this.required=true;
                this.input.required=true;
            }
            else{
                this.required=false;
                this.input.removeAttribute("required");
            }
            return this;
        },
	getValue:function(){
	    var v=this.input.value;
	    if( v && v.length > 0){
		return this.input.value;
	    }
	    return null;
	},
	setValue:function(v){
            if(v === null || v === undefined){
                this.input.value="";
            }
            else if(!Apoco.type[this.type].check(v)){
                throw new Error("Field: setValue " + v  + " is the wrong type, expects " + this.type);
            }
	    else {
                this.input.value=v;
            }
            this.value=v;
            return this;
	},
        delete:function(){
            // remove all the nodes

            while (this.element.lastChild) {
                this.element.removeChild(this.element.lastChild);
            }
        
            if(this.parent){
                this.parent.deleteChild(this);
                return;
            }
            if(this.element.parentNode){
                this.element.parentNode.removeChild(this.element);
            }
            if(this.action){ // cannot do if this.action is  wrapped in anonymous function
                this.element.removeEventListener("click",this.action,false);
            } 
            if(this.listen){
                Apoco.IO.unsubscribe(this);
            }
            this.element=null;
            this.input=null;
            this.value=null;
        },
	popupEditor:function(func){
            if(!this.editable){ return;}
	    if(this.input.length >0){ // element exists
		var cb=function(that){
		    return function(e){
			e.stopPropagation();
			if(e.which === 13){
			    func(that.input.val());
			}
		    };
		}(this);
	    }
	    else{
		throw new Error("no input element for this type " + this.type);
	    }
	},
        resetValue:function(){
            if(this.value === undefined){
                this.input.value = "";
                return null;
            }
           
            if(Apoco.type["array"].check(this.value)){
                for(var i=0;i<this.value.length; i++){
                    this.input[i].value=this.value[i];
                }
                return this.value;
            }
            if(this.input){
                this.input.value=this.value;
            }
            return this.value;
        },
        valueChanged:function(){
           // console.log("Value Changed getValue is " + this.getValue() + " and value is " + this.value);
         
            if(this.getValue() != this.value){
               // console.log("ValueChanged: return true");
                return true;
            }
           // console.log("ValueChanged: return false");
            return false;
        }, 
	checkValue:function(){
	    var array=false;
            var v=this.getValue();
            if(Apoco.type["blank"].check(v)){
   	        if(this.required){
                    return false;
                }
            }
            if(Apoco.type[this.type].check !== undefined){
                if(!Apoco.type[this.type].check(v)){
                    return false;
                }
 	    }
	    return true;
	}
    };

    var StaticField=function(d,element){
        var that=this;
        d.field="static";
        
        _Field.call(this,d,element);
       
        this.span=document.createElement("span");
        if(this.childClass){
            Apoco.Utils.addClass(this.span,this.childClass);
        }
        //s.setAttribute("type",this.html_type);
                
        this.setValue(this.value);
        this.element.appendChild(this.span);
    };
    StaticField.prototype={
        setValue:function(v){
            var t=new String,p;
            if(!v){
                v=this.value;
            }
            else{
                this.value=v;
            }
            if(this.type === "date"){  // this is if the date is given in milliseconds past 1970
                if(Apoco.type["integer"].check(this.value)){
                    t=new Date(this.value).toISOString(); //
                    t=t.split("T");
                    if(t.length !==2){
                        throw new Error("staticField cannot parse input value " + this.value);
                    }
                    this.value=t[0];
                }
            }
            if(this.type === "object" && this.userSetValue){
               this.span.textContent=this.userSetValue(v);
            }
            else if(Apoco.type["array"].check(v)){
                for(var i=0;i<v.length;i++){
                    p=v[i];
                    t=t.concat(p.toString());
                    if(i<(v.length-1)){
                        t=t.concat(", ");
                    }
                }
                this.span.textContent=t;
            }
            else{
                this.span.textContent=this.value;
            }
            
        },
        getValue:function(){  
           return this.value; // OK because static field can only be changed by a call to setValue 
        }
    };

    Apoco.Utils.extend(StaticField,_Field);
    
    var InputField=function(d,element){
        var that=this;
        d.field="input";
	_Field.call(this,d,element);
        this.input=document.createElement("input");
        this.input.setAttribute("type",this.html_type);
       
       if(this.childClass){
            Apoco.Utils.addClass(this.input,this.childClass);
        }
        if(this.type === "float" || this.type === "integer"){
            if( this.min !== undefined){
                this.input.setAttribute("min",this.min);
            }
            if(this.max !== undefined){
                this.input.setAttribute("max",this.max);
            }
            if(this.step){ 
                this.input.setAttribute("step",this.step);
            }
            if(this.precision){
                this.input.setAttribute("pattern", "^[-+]?\d*\.?\/" + this.precision + "*$");
            }
        }
        if(this.placeholder){
            this.input.setAttribute("placeholder",this.placeholder);
        }
        if(this.required === true){
            this.input.required=true;
        }
        this.element.appendChild(this.input);
   
	if(this.value !== null && this.value !== undefined){
            // check that the value is valid
            if(Apoco.type[this.type].check(this.value)){
                this.input.value=this.value;
            }
            else {
                throw new Error("Field with type " + this.type + "doesn't accept a value of " + this.value);
            }
	}
        if(this.editable === false){
            this.input.readOnly=true;
        }
        if(this.action){
            this.action(this);
        }
	return this;
    };

    Apoco.Utils.extend(InputField,_Field);

    var FloatField=function(d,element){
        var inp;
	var that=this;
        d.field="float";
        d.type="float";
	_Field.call(this,d,element);
	this.input=new Array(2);
        if(this.precision===undefined){
            this.precision=2;
        }
	var list=document.createElement("ul"); 
        list.classList.add('aligned_float');
        if(this.childClass){
            Apoco.Utils.addClass(list,this.childClass);
        }
        
	var el=document.createElement("li");
	var dec=document.createElement("div");
        dec.className='values';
        inp=document.createElement("input");
        inp.className="float_left";
        inp.setAttribute("pattern",'^[-+]?[0-9]*$');
        this.input[0]=inp;
        inp=document.createElement("input");
        inp.className="float_right";
       // inp.setAttribute("pattern",("'^[0-9]*.{0}|.{"+ this.precision + "}$'"));
        inp.setAttribute("type","text");
        this.input[1]=inp;
	this.setValue(this.value);

	dec.appendChild(this.input[0]);
        var s=document.createElement("span");
        s.textContent=".";//("&#46");
        dec.appendChild(s); // add the .
	dec.appendChild(this.input[1]);
	el.appendChild(dec);
	list.appendChild(el);
        if(this.required === true){
            this.input[1].required=true;
            this.input[0].required=true;
        }
        if(this.editable === false){
            this.input[0].readOnly=true;
            this.input[1].readOnly=true;
            this.spinner=false;
        }
        if(this.spinner){
	    el=document.createElement("li");
            list.appendChild(el);
            dec=document.createElement("div");
            dec.className="arrows";
            el.appendChild(dec);
            var up=document.createElement("span");
            up.classList.add("up");
            var down=document.createElement("span");
            down.classList.add("down");
            dec.appendChild(up);
	    dec.appendChild(down);
            if(this.step === undefined){
                this.step=0.1;
            }
            
	    var timer;
	    var step_fn=function (direction){
	        var t=that.getValue(),p;
	        if(t=== null || t===""){
		    clearInterval(timer);
		    return;
	        }
	        if(!Apoco.type.float.check(t)){
		    clearInterval(timer);
		    throw new Error("stepfn return from getValue: this is not a floating point number");
	        }
	        if(direction==="up"){
		    t=parseFloat(t,10)+that.step;
	        }
	        else{
		    t=parseFloat(t,10)-that.step;
	        }
	        t=parseFloat(t,10).toFixed(that.precision);
               
	        p=t.toString().split(".");
	        if(p.length !== 2){
		    throw new Error("value is not a floating point number" + v);
	        }
                that.input[0].value=p[0];
                that.input[1].value=p[1];
                
	  /*      if(that.setValue(t) === null){   // do not call setValue !!!!!!!!!!!!
		    clearInterval(timer);
		    throw new Error("step_fn val is not floating point " + t);
	        } */
	    };
	    var eObj={
                click:function(e){
                    e.preventDefault();
		    e.stopPropagation();
		    if(e.currentTarget === down){
		       step_fn("down");
		    }
		    else{
		        step_fn("up");
		    }
                },
	        mousedown: function(e){
		    e.preventDefault();
		    e.stopPropagation();
		    if(e.currentTarget === down){
		        timer=setInterval(function(){step_fn("down");},100);
		    }
		    else{
		        timer=setInterval(function(){step_fn("up");},100);
		    }
	        },
 	        mouseup: function(e){
                    e.stopPropagation();
		    if(timer){
		        clearInterval(timer);
		    }
	        }
	    };
            for(var k in eObj){
                up.addEventListener(k,eObj[k],false);
                down.addEventListener(k,eObj[k],false);
            }
	   	    
        };
	this.element.appendChild(list);
        if(this.action){
            this.action(this);
        }
	return this;
    };


    FloatField.prototype={
        setRequired: function(on){
            var v=(on)?true:false;
            this.required=v;
            if(v){
                this.input[0].required=v;
                this.input[1].required=v;
            }
            else{
                this.input[0].removeAttribute("required");
                this.input[0].removeAttribute("required");
            }
            return this;
        },
	getValue: function(){
            var v;
            var a=this.input[0].value;
            var b=this.input[1].value;
	    if(Apoco.type.blank.check(a)) {
		if(Apoco.type.blank.check(b)){
		    return null;
		}
		else{
		    v=parseFloat(("0."+b),10).toFixed(this.precision);
		}
	    }
	    else if(Apoco.type.blank.check(b)){
		v=parseFloat((a + ".000"),10).toFixed(this.precision);
	    }
	    else{
                if(a<0){
		    v=(parseInt(a,10)-parseFloat(("." + b),10)).toFixed(this.precision);
                }
                else{
                    v=(parseInt(a,10)+parseFloat(("." + b),10)).toFixed(this.precision);
                }
	    }
	    if(!Apoco.type.float.check(v)){
		throw new Error("getValue: this is not a floating point number " + v);
		return null;
	    }
	    return v;
	},
        resetValue:function(){
            this.setValue(this.value);
            return this;
        },
	setValue: function(v){
 	    if(Apoco.type.blank.check(v)){
                this.input[0].value="";
                this.input[1].value="";
		this.value="";
		return;
	    }
            if(!Apoco.type["float"].check(v)){
		throw new Error("FloatField: setValue this value is not a float " + v);
	    }
	    v=parseFloat(v,10).toFixed(this.precision);  // not necessarily a number
	    var p=v.toString().split(".");
	    if(p.length !== 2){
		throw new Error("value is not a floating point number" + v);
		return null;
	    }
            this.input[0].value=p[0];
            this.input[1].value=p[1];
	    this.value=v;
	},
        popupEditor: null
    };

    Apoco.Utils.extend(FloatField,_Field);

    var DateField=function(d,element){
        var that=this,t;
        d.field="date";
        d.type="date";
        _Field.call(this,d,element);
        this.input=document.createElement("input");
        this.input.type=this.html_type;
        if(this.required === true){
            this.input.required=true;
        }
        if(this.childClass){
            Apoco.Utils.addClass(this.input,this.childClass);
        }
        
        this.element.appendChild(this.input);
        if(this.value){
            if(Apoco.type["integer"].check(this.value)){
                t=new Date(this.value).toISOString(); //
                t=t.split("T");
                if(t.length !==2){
                    throw new Error("DateField cannot parse input value " + this.value);
                }
                this.input.value=t[0];
            }
            else{
                this.input.value=this.value;
            }
            
	}
	if(this.editable !== false){
            if(navigator.appCodeName === "Mozilla"){ //add a datepicker cause none on Mozilla
                this.input.type="text";
                this.input.setAttribute("placeholder","YYYY-MM-DD");
                Apoco.datepicker.init(this.input);
            }
            else{
                this.picker=document.createElement("datepicker");
                this.picker.setAttribute("type","grid");
                this.input.appendChild(this.picker);
            }
        }
        if(this.action){
            this.action(this);
        }
 	return this;
    };
  
    Apoco.Utils.extend(DateField,_Field);

    var TimeField=function(d,element){
        d.field="time";
        d.type="time";

	_Field.call(this,d,element);
        this.input=document.createElement("input");
        this.input.setAttribute("type",this.html_type);
        if(this.required === true){
            this.input.required=true;
        }
        if(this.childClass){
            Apoco.Utils.addClass(this.input,this.childClass);
        }
        
        this.element.appendChild(this.input);
        if(this.editable === false){
            this.input.readOnly=true;
        }
        if(this.action){
            this.action(this);
        }
        return this;
    };

    Apoco.Utils.extend(TimeField,_Field);

    var ObjectField=function(d,element){
        d.field="object";
        d.type="object";
       
        if(!d.inputType){
            d.inputType="string";
        }
       //console.log("userSetValue is " + d.userSetValue);       
        if(!Apoco.type["object"].check(d.value)){
            throw new Error("Fields: Object  value  is incorrect type %j ",d.value);
        }
        if(!d.userSetValue || !Apoco.type["function"].check(d.userSetValue)){
            throw new Error("Object field: userSetValue function incorrect");
        }
        if(!d.userGetValue || !Apoco.type["function"].check(d.userGetValue)){
            throw new Error("Object field: userGetValue function incorrect");
        }
      
        _Field.call(this,d,element);
       
        this.html_type=Apoco.type[this.inputType].html_type;

        this.input=document.createElement("input");
        this.input.setAttribute("type",this.html_type);
        if(this.childClass){
            Apoco.Utils.addClass(this.input,this.childClass);
        }
        if(this.placeholder){
            this.input.setAttribute("placeholder",this.placeholder);
        }
        if(this.required){
            this.input.required=true;
        }
        this.element.appendChild(this.input);
        if(!this.editable){
            this.input.readOnly=true;
        }
        if(this.value){
         //   console.log("Object field setting value");
            this.setValue(this.value);
        }
        else{
            this.value={}; // default for this.value is null - so make it an object
        }
        if(this.action){
            this.action(this);
        }
        return this;
    };

    ObjectField.prototype={
        setValue:function(val){
            var c;
            if(Apoco.type[this.type].check(val)){
                for(var k in val){ // doing this so can have missing or extra key values
                    this.value[k]=val[k];
                }
                c=this.userSetValue(val);
             //   console.log("return from userSetValue is %j ",c);
                if (this.input){
                    this.input.value=c;
                }
                else if(this.field === "static"){  
                    this.span.textContent=c;
                }
            }
            else{
                throw new Error("Object field setValue value incorrect type %j",val);
            }
            return this;
        },
        getValue:function(){
            if(this.field === "static"){
                return this.value;
            }
            return this.userGetValue(this);
        }
    };
    Apoco.Utils.extend(ObjectField,_Field);
    
    var CheckBoxField=function(d,element){
        d.field="checkBox";
        d.type="boolean";
  	_Field.call(this,d,element);
   
        this.input=document.createElement("input");
        this.input.setAttribute("type",this.html_type);
        this.input.className="check_box";
        if(this.childClass){
            Apoco.Utils.addClass(this.input,this.childClass);
        }
        
        this.element.appendChild(this.input);
        if(this.required===true){
            this.input.required=true;
        }
        this.setValue(this.value);
        if(this.editable === false){
            this.input.setAttribute("disabled",true);
        }
        if(this.action){
            this.action(this);
        }
	return this;
    };

    CheckBoxField.prototype={
	getValue:function(){
            return this.input.checked;
	},
        setValue:function(val){
            if(val === "true" || val === true || val === 1){
                this.input.setAttribute("checked","checked");
	    }
	    else {
                if(this.input.hasAttribute("checked")){
                    this.input.removeAttribute("checked");
                }
	    }
            return this;
        },
	popupEditor:function(func){
            if(this.editable === true){
	        var cb=function(that){
		    return function(e){
		        e.stopPropagation();
		        func(that.input.checked);
		    };
	        }(this);
	        this.input.addEventListener("click",cb,false);
            }
        }
    };

    Apoco.Utils.extend(CheckBoxField,_Field);

    var NumberArrayField=function(d,element){
        if(!d.size && !d.value ){
            throw new Error("NumberArrayfield needs a size or value");
        }
        d.field="numberArray";
        if(!d.type){
            d.type="integerArray";
        }
	_Field.call(this,d,element);
        if(!this.size){
            this.size=this.value.length;
        }
	this.input=new Array(this.size);
	this.popup=true;
        if(this.type === "floatArray" && this.step === undefined){
            this.step=0.1;
        }
	if(this.value && !Apoco.type.array.check(this.value)){
	    throw new Error("NumberArrayField: value is not an array");
	}
	for(var i=0;i<this.input.length;i++){
            this.input[i]={};
            if(this.value){ 
	        this.input[i].value=(this.value[i] || "");
            }
            this.addValue(i,"internal");
   	}
        if(this.action){
            this.action(this);
        }
	return this;
    };

    NumberArrayField.prototype={
        addValue:function(i,internal){
            var s;
            if(internal !== "internal"){
                var v=i;
                i=this.input.length;
                this.input[i]={};
                this.input[i].value=v;
            }
            this.input[i].input=document.createElement("input");
            this.input[i].input.setAttribute("type", this.html_type);
            this.input[i].input.className=this.type;
            if(this.required===true){
                this.input[i].input.required=true;
            }
            this.input[i].input.value=this.input[i].value;
            if( this.delimiter !== undefined){
                if(i>0 && i<(this.input.length-1)){
                    s=document.createElement("span");
                    s.textContent=this.delimiter;
                    this.element[0].appendChild(s);
                }
            }
            if(this.editable === false){
                this.input[i].input.readOnly=true;
            }
            else{
                if(this.min){
                    this.input[i].input.setAttribute("min", this.min);
                }
                if(this.max){
                    this.input[i].input.setAttribute("max", this.max);
                }
                if(this.step){
                    this.input[i].input.setAttribute("step", this.step);
                }
            }
 	    this.element.appendChild(this.input[i].input);
            return this;
        },
        setRequired:function(on){
            var v=(on)?true : false;
            this.required=v;
            for(var i=0;i<this.input.length;i++){
                if(v){
                    this.input[i].input.required=v;
                }
                else{
                    this.input[i].removeAttribute("required");
                }
            }
            return this;
        },
        deleteValue:function(value){
            var index = -1;
            for(var i=0;i<this.input.length;i++){
                if(this.input[i].value === value){
                    if(index !== -1){
                        throw new Error("Mpre than one values matches "+ value);
                    }
                    index=i;
                }
            }
            if(index !== -1){
                this.input.splice(index,1);
                return this;
            }
            return null;
        },
	setValue: function(v){
            if(v.length >this.input.length){
                throw new Error("NumverArratField: input array size is less than value size");
            }
   	    for(var i=0;i<this.input.length;i++){
                if(v[i]){
                    this.input[i].input.value=Number(v[i]);
                }
                else{
                    this.input[i].input.value="";
                }
	    }
            this.value=v;
            return this;
	},
	getValue:function(index){
            if(index !== undefined && index< this.input.length){
                return this.input[index].input.value;
            }
            var v=new Array;
            for(var i=0;i<this.input.length;i++){
	        v[i]=this.input[i].input.value;
            }
            return v;
	},
	popupEditor:function(func){
	    if(this.input.length>0){
		var r=this.getValue();
		this.element.addEventListener("keypress",function(event){
		    event.stopPropagation();
		    if(event.which === 13){
			func(r);
		    }
		},false);
	    }
	    throw new Error("no input element for this type " + this.type);
	}
    };

    Apoco.Utils.extend(NumberArrayField,_Field);

    var TextAreaField=function(d,element){
        d.field="textArea";
        d.type="text";
	_Field.call(this,d,element);
	this.popup=true;
        this.input=document.createElement("textarea");
        if(this.childClass){
            Apoco.Utils.addClass(this.input,this.childClass);
        }
        
        if(this.required===true){
            this.input.required=true;
        }
	this.element.appendChild(this.input);
	if(this.value){
            this.input.value=this.value;
	}
        if(this.editable === false){
            this.input.readOnly=true;
            this.popup=false;
        }
        if(this.action){
            this.action(this);
        }
	return this;
    };

    TextAreaField.prototype={
	popupEditor:function(func,ok,cancel){
	    if(ok && ok.length >0 && cancel && cancel.length >0){
		var cb=function(that){
		    return function(e){
			e.stopPropagation();
			that.value=that.input.val();
			func(that.input.val());
		    };
		}(this);
		var bb=function(that){
		    return function(e){
			e.stopPropagation();
			func(null);
		};
		}(this);
		ok.addEventListener("click",cb,false);
		cancel.addEventListener("click",bb,false);
	    }
	    else{
		throw new Error("no input element for this type " + this.type);
	    }
	}
    };

    Apoco.Utils.extend(TextAreaField,_Field);


    var SelectField=function(d,element){
	var i,o,p,that=this;
        var allowed_types=["enum","float","integer","string","object"];
        this.opt_type=null;
        d.field="select";
        if(!d.type){
            d.type="string"; // make a default
        }
        if(d.type){
            for(var i=0;i<allowed_types.length;i++){
            //    console.log("type is " + d.type + " allowed type is " + allowed_types[i]);
                if(d.type == allowed_types[i]){
                    if(d.type === "enum"){
                        this.opt_type="enum";
                        d.type = "string";
                    }
                    else{
                        this.opt_type=(d.type + "Array");
                    }
                    break;
                }
            }
            if(this.opt_type === null){ // not an allowed type
                throw new Error("selectField: this type -  " + d.type + " - is not allowed for select field ");
            }
        }
	_Field.call(this,d,element);
        this.select=document.createElement("select");
        if(this.required === true){
            this.select.required=true;
        }
        if(this.childClass){
            Apoco.Utils.addClass(this.select,this.childClass);
        }
        if(this.options){
           //if(Apoco.type["array"].check(this.options)){
           // console.log("select: this options is %j ", this.options);    
            if(!Apoco.type[this.opt_type].check(this.options)){
                throw new Error("select field- options must be an array or object array with two keys: value and label of type " + this.type);
            }
        }
        else{
            throw new Error("select field needs options set");
        }
     //   console.log("opt type is " + this.opt_type);
	for(i=0; i<this.options.length; i++){
            o=document.createElement("option");
            if(this.type !== "object"){
                o.value=this.options[i];
                o.textContent=this.options[i];
            }
            else{
                o.value=this.options[i].value;
                o.textContent=this.options[i].label;
            }
            this.select.appendChild(o);
	}
	if(this.blank_option === true){ // add a blank option at the head of the list
            o=document.createElement("option");
            o.value="";
            this.select.appendChild(o);
	}
        
        if(this.blank_option){   
            this._mkBlankOption();
        }
        else if(this.onChange){ // add the changEvent anyway
            this.select.addEventListener("change",function(e){
                e.stopPropagation();
                that.onChange(that);
            });
        }

	if(this.value){
            //this.select.value=this.value;
            this.setValue(this.value);
	}
        this.element.appendChild(this.select);
        if(this.action){
            this.action(this);
        }
	return this;
    };


    SelectField.prototype={
        setRequired:function(on){
            var v=(on)?true:false;
            this.required=v;
            if(v){
                this.select.required=v;
            }
            else{
                this.select.removeAttribute("required");
            }
            return this;
        },
        _mkBlankOption:function(){
            var that=this,o;
            var cd=function(that){
		return function(e){
		    e.stopPropagation();
                    if(e.keyCode === 13){
		        if(that.input.style.visibility === "visible"){ //}("visible")){
			    that.input.style.visibility= "hidden"; //hide();
                            that.select.style.visibility="visible";
                         //   console.log("target value" + e.target.value);
                            o=document.createElement("option");
                            o.value=e.target.value;
                            o.textContent=e.target.value;
                            that.select.appendChild(o);
                            that.options.push(that.select.value);
                            that.select.value=e.target.value;
		        }
                    }
		};
	    }(this);


            var mk_input=function(){
                that.input=document.createElement("input");
                that.input.setAttribute("type",that.html_type);
                that.element.appendChild(that.input);
                that.input.addEventListener("keypress",cd);
            };
            
            // if selection option is "Other" add a new input field
            this.select.addEventListener("change",function(e){
	        //  console.log("select option has changed");
                e.stopPropagation();
                if(that.select.value === ""){      
		    if(!that.input){ 
                        mk_input();
                    }
                    that.select.style.visibility="hidden";
	            that.input.style.visibility="visible";
	            that.input.focus();
	        }
                if(that.onChange){
                    that.onChange(that);
                }
	    });
        },
        setValue: function(v){
            var value,name,b;
            if(!Apoco.type[this.type].check(v)){
                throw new Error("select: setValue value " + v + " does not match specified type " + this.type);   
            }
            if(this.type === "object"){
                name=v.label;
                value=v.value;
                if(!name || !value){
                    throw new Error("select: setValue must have object with keys value and label");
                } 
            }
            else{
                name=v;
                value=v;
            }
   
            for(var i=0;i<this.options.length;i++){
              //  console.log("option is %j ", this.options[i]);
             //   console.log( "name is " + name);
                if(this.type === "object"){
                    b=this.options[i].value;
                }
                else{
                    b=this.options[i];
                }
             //   console.log( "value is " + b );
                if(b === value){
                //    console.log("found value " + name);
                    this.select.value=value;
                    this.select.label=name;
                    this.value=v;
                    return this;
                }
            }
            if(this.input){
                this.input.value=value;
                this.input.label=name;
                this.value=v;
                return this;
            }
            throw new Error("SelectField: Cannot set value to " + v + " not in options list");
           
        },
        addValue:function(v){
            var o,a=[];
            if(!v){
                throw new Error("selectField: addValue must have a parameter");
            }
          //  console.log("selectField trying to add value %j ",v);
         //  console.log("selectField: addValue optype is " + this.opt_type);
            if(Apoco.type[this.type].check(v)){
                a.push(v);
            }
            else if(Apoco.type[this.opt_type].check(v)){
                a=v;
            }
            else{
                throw new Error("select field - addValue must be the same type as options array " + this.opt_type);
            }
            for(var i=0;i<a.length;i++){
                this.options.push(a[i]);
                o=document.createElement("option");
                (a[i].value)?o.value=a[i].value:o.value=a[i];
                (a[i].label)?o.textContent=a[i].label:o.textContent=a[i];
                this.select.appendChild(o);
            }
            return this;
        },
	getValue:function(){
	    var v,n=null;
	    if(this.input && this.input.value){
		v=this.input.value; // added option
                // so no label
	    }
	    else{
		v=this.select.value;
	    }
           
	    if(!v || v.length <= 0){
                return null;
            }
            // return value of correct type
            if(this.type === "float"){
                v=parseFloat(v);
            }
            else if(this.type === "integer"){
                v=parseInt(v);
            }
            else if(this.type === "object"){
                // need to find the label
                if(n===null){
                    for(var i=0;i<this.options.length;i++){
                     //   console.log("getValue: this is option " + this.options[i].value + " with label " + this.options[i].label);
                        if(this.options[i].value == v){
                            n=this.options[i].label;
                            break;
                        }
                    }
                }
                v={value:v,label:n};
            }
	    return v;

	},
	popupEditor:function(func){
	    this.edit_func=func;
	},
        resetValue:function(){
            this.select.value=this.value;
            return this.select.value;
        }

    };

   Apoco.Utils.extend(SelectField,_Field);

    var ButtonSetField=function(d,element){   // like select field - but not in a dropdown and not editable
        d.field="ButtonSetField";
        if(d.checkbox !== true){
            d.type="boolean";
        }
        else{
            d.type="booleanArray";
        }
        if(!d.labels || d.labels.length ===0){
	    throw new Error("must have a labels array for ButtonSetField");
	}
          
	_Field.call(this,d,element);
        this.input=[];
        if(!this.value){
            this.value=[];  
        }
        
        for(var i=0;i<this.labels.length;i++){
            this.input[i]={};
            this.input[i].label=this.labels[i];
            if(!this.value[i]){
                this.value[i]=false;
            }
         }
        this.labels.length=0;
	this.popup=true;
        var u=document.createElement("ul");
        u.className="choice";
        if(this.childClass){
            Apoco.Utils.addClass(u,this.childClass);
        }
	this.element.appendChild(u);
        
	for(var i=0;i<this.input.length;i++){
	    this.addValue(i);
	};
        this.setValue(this.value);
        if(this.action){
            this.action(this);
        }
	return this;
    };

    ButtonSetField.prototype={
	addValue:function(index,value){
            var l,p;
            if(index === undefined){
                throw new Error("ButtonSetField: must supply a name");
            }
            if(!Apoco.type["integer"].check(index)){
                var label=index;
                index=this.input.length;
                this.input[index]={};
                this.input[index].label=label;
                this.value[index]=(value)?value:false;
            }
            l=document.createElement("li");
  	    this.element.getElementsByTagName('ul')[0].appendChild(l);
            this.input[index].input=document.createElement("input");
            if(this.checkbox === true ){
                this.input[index].input.type="checkbox";
                if(this.editable === false){
                    this.input[index].input.disabled=true;
                }
            }
            else{
                this.input[index].input.type="radio";
                if(this.editable === false){
                    if(this.value[index] === false){
                        this.input[index].input.disabled=true;
                    }
                }
            }
            this.input[index].input.id=this.input[index].label;
            this.input[index].input.checked=this.value[index];
          
            l.appendChild(this.input[index].input);
            p=document.createElement("label");
            p.setAttribute("for",this.input[index].label);
            p.textContent=this.input[index].label;
            l.appendChild(p);
            if(this.checkbox !== true){
                this.element.addEventListener("click",function(e){
                    var b;
                  //  console.log("element has tag" + e.target.tagName);
                    if(e.target.tagName === "INPUT" ){
                    //    console.log("e.terget has checked = " +  e.target.checked);
                        // set the siblings to false
                        b=e.currentTarget.getElementsByTagName('input');
                        for(var i=0;i<b.length;i++){
                            if(b[i] !== e.target){
                                b[i].checked=false;
                                b[i].parentNode.classList.remove("checked");
                            }
                            else{
                                b[i].parentNode.classList.add("checked");
                            }
                        }
                        e.stopPropagation();
                    }
                },false);
            }
            return this;
	},
	resetValue:function(){
            for(var i=0;i<this.input.length;i++){
                this.input[i].input.checked=this.value[i];
            }
            return this;
	},
        setValue: function(value,index){
            var t=0;
            if(!value){
                throw new Error("ButtonSet:setValue needs a value - got " + value );
            }
            if(!Apoco.type["array"].check(value)){
                if( index !== undefined && index<=this.input.length){
                    if(this.checkbox !== true){
                        if(value === true){ //set all the others to false
                            for(var i=0;i<this.input.length;i++){
                                this.input[i].input.checked=false;
                                this.value[i]=false;
                            }
                        }
                    }
                    this.input[index].input.checked=value;
                    this.value[index]=value;
                }
                else{
                    throw new Error("ButtonSetField: value must be a boolean array");
                }
                
                return this;
            }
            
            if(value.length!== this.input.length){
                throw new Error("ButtonSetField: values array length " + value.length + " does not match labels " + this.input.length);
            }
            else if(this.checkbox !== true){ //radio button only one true value
                 for(var i=0;i<value.length;i++){
                    if(value[i] === true){
                        t++;
                    }
                }
                if(t> 1){
                    throw new Error("ButtonSetField: only one true value for radio buttons");
                }
            }
            for(var i=0;i<value.length;i++){
                this.value[i]=value[i];
                this.input[i].input.checked =value[i];
               (value[i]===true)?this.input[i].input.parentNode.classList.add("checked"):this.input[i].input.parentNode.classList.remove("checked");
            }
            return this;
        },
	deleteValue:function(label){
	    var that=this;
	    var index=null;
	    for(var i=0;i<this.input.length;i++){
		if(this.input[i].label === label){
		    index=i;
		    break;
		}
	    }
	    if(index !== null){
		var p=this.input[index].input.parentNode;
                p.removeChild(this.input[index].input);
		this.input.splice(index,1);
                p.parentNode.removeChild(p);
	    }
	    else{
		throw new Error("could not remove value " + value);
	    }
            return this;
	},
	getValue:function(){
            var ar=[],p={};
            for(var i=0;i<this.input.length;i++){
                p={};
                if(this.checkbox === true){  // allows multiple selections - so return an array  
                    p[this.input[i].label]=this.input[i].input.checked;
                    ar[i]=p;
                }
                else{    // only one value at most will be checked
                    if(this.input[i].input.checked){
                        p[this.input[i].label]=this.input[i].input.checked;
                        ar.push(p);
                        return ar;
                    }
                }
            }
	    return ar;
	},
	checkValue:function(){
	    if(this.required ){ // must have at least one value set to true.
                for(var i=0; i<this.input.length; i++){
                    if(this.input[i].input.checked === true){
                        return true;
                    }
                }
	    }
            else{
                return true;
            }
	    return false;
	}
    };
    Apoco.Utils.extend(ButtonSetField,_Field);

    var SliderField=function(d,element){
        d.field="SliderField";
        d.type="range";
        d.html_type="range";
      	_Field.call(this,d,element);
	this.popup=true;
	this.input= document.createElement("input");
        this.input.setAttribute("type",this.type);
        this.element.appendChild(this.input);
        if(this.childClass){
            Apoco.Utils.addClass(this.input,this.childClass);
        }
	var that=this;
	if(this.min){
            this.input.setAttribute("min",this.min);
        }
        if(this.max){
             this.input.setAttribute("max",this.max);
        }
        if(this.step){
             this.input.setAttribute("step",this.step);
        }
        this.value=(this.value)?this.value: this.min;
        this.input.value=this.value;
        if(this.editable === false){
            this.input.readOnly=true;
        }
        if(this.action){
            this.action(this);
        }
        return this;
    };
     
    Apoco.Utils.extend(SliderField,_Field);

    var StringArrayField=function(d,element){
        d.field="StringArrayField";
        d.type="stringArray";
	_Field.call(this,d,element);
	this.popup=true;
	var that=this;
	var array_length=0;
        this.input=[];
        var dv=document.createElement("div");
        dv.className="list_container";
        this.element.appendChild(dv);
        var u=document.createElement("ul");
        u.className="string_fieldset";
        dv.appendChild(u);
	if(this.value && this.value.length>0){
	    array_length=this.value.length;
	}
	if(!this.length){
	    this.length=array_length;
	}
        this.length=Math.max(this.length,array_length);

	if(this.length === 0){
	    this.length=4;
	}
	for(var i=0;i<this.length;i++){
            if(this.value && this.value[i]){
	        this.addValue(this.value[i],i);
            }
            else{
                this.addValue("",i); 
            }
	}
	// this adds an extra field if you press return in last field
	if(this.editable !== false){
	    // add a glyph
            var sp=document.createElement("span");
            sp.classList.add("plus");
            var p=this.element.getElementsByTagName("li")[(this.element.getElementsByTagName("li").length-1)];
            p.appendChild(sp);
            var sm=document.createElement("span");
            sm.classList.add("minus");
            p.appendChild(sm);
            var addremove=function(add){
                var l=that.input.length,n;
                sp.parentNode.removeChild(sp);
                sm.parentNode.removeChild(sm);
                if(add=== "add"){
		    that.addValue("",l); // add a blank value
                }
                else{
                    that.deleteValue(l-1);
                }
                n=parseInt(that.element.getElementsByTagName("li").length-1,10);
                var last_element=that.element.getElementsByTagName("li")[n];
		last_element.appendChild(sp);
                last_element.appendChild(sm);
            };
            
	    sp.addEventListener("click",function(e){
		e.stopPropagation();
	        addremove("add");
	    });
	    sm.addEventListener("click",function(e){
		e.stopPropagation();
	        addremove("remove");
	    });

	}
        if(this.action){
            this.action(this);
        }
        return this;
    };
    
    StringArrayField.prototype={
        setValue:function(v,index){
            if(!Apoco.type["array"].check(v)){
                if( index !== undefined && index<this.length){
                    this.input[index].input.value=v;
                    this.value[index]=v;
                }
                else{
                    throw new Error("StringArrayField: setValue not an array");
                }
            } 
            else {
               if(v.length <= this.length){
                    for(var i=0;i<v.length;i++){
                        this.input[i].input.value=v[i];
                        this.value[i]=v[i];
                    }
               }
                else{
                    throw new Error("StringArrayField: setValue array is too long");
                } 
            }
            return this;
        },
	getValue:function(){
	    var vals=[],t;
	    for(var i=0;i<this.input.length;i++){
		t=this.input[i].input.value;
		if(t !== ""){
		    vals.push(this.input[i].input.value);
		}
	    }
	    return vals;
	},
        deleteValue:function(i){
            var t;
            if(this.input.length>1){
                t=this.input[i].input.parentNode;
                this.input.splice(i,1);
                if(this.value[i]){
                    this.value.splice(i,1);
                }
                t.parentNode.removeChild(t);
            }
            return this;
        },
	addValue:function(value,i){
            if(i===undefined){
                i=this.input.length;
            }
 	    this.input[i]={};
            var element=document.createElement("li");
            element.className="string";
            this.input[i].input=document.createElement("input");
            if(this.required===true){
                this.input[i].input.required=true;
            }
            this.input[i].input.setAttribute("type","string");
            element.appendChild(this.input[i].input);
            this.element.getElementsByClassName("string_fieldset")[0].appendChild(element);
	   
	    this.input[i].input.value=value;
            if(this.editable === false){
                this.input[i].input.readOnly=true;
            }
          
            return this;
	},
        setRequired:function(on){
            var v=(on)?true:false;
            this.required=v;
            for(var i=0;i<this.input.length;i++){
                this.input[i].input.requied=v;
            }
            return this;
        },
	checkValue:function(){
	    var valid;
	    (this.required)?valid=false: valid=true;
	    var v=this.getValue();
	    for(var i=0;i<v.length;i++){
		if(this.required){
		    if(!Apoco.type["blank"].check(v[i])){
			valid=true;   // at least one non blank value
		    }
		}
		if(!Apoco.type["string"].check(v[i])){  
		    valid=false;
		    break;
		}
	    }
	    if(!valid){
		this.displayInvalid();
	    }
	    return valid;
	},
        resetValue:function(){
            var v;
            for(var i=0;i<this.length;i++){ // original length
                v=(this.value[i])?this.value[i]:"";
                if(this.input[i]){
                    this.input[i].input.value=v;
                }
                else{  // value has been deleted
                    this.addValue(v,i);
                }
            }
            if(this.input.length > this.length && this.length>0){
      //          console.log("this input length " + this.input.length + " original length " + this.length);
                for(var i=this.input.length-1; i>this.length;i--){
                    this.deleteValue(i);
                }
            }
            return this;
        }
    };

    Apoco.Utils.extend(StringArrayField,_Field);

    // base class for Image file reads and other input type "file"
    var FileField=function(d,element){
        var that=this,container,q,p;
        d.field="fileReader";
        d.type="fileArray";
	_Field.call(this,d,element);

        if(!this.value){
            this.value=[];
        }

        this.element.classList.add(d.field);
        if(this.editable !== false){
	    if(!window.FileReader){
	        Apoco.popup.dialog("Sorry No FileReader","Your browser does not support the reader");
	        throw new Error("No FileReader");
	    }
         //   console.log("making a container");
            this.container=document.createElement("div");
            this.container.classList.add("file_container");
            this.element.appendChild(this.container);
            // add the upload icon
            p=document.createElement("div");
            p.classList.add("upload_icon");
            this.container.appendChild(p);
          
            // make a wrapper for the input so we can add styling
            that._mkInputNode();
          
            if(this.text){
                p=document.createElement("p");
                p.classList.add("text");
                p.innerHTML=this.text;
                this.container.appendChild(p);
            }
            if(this.progressBar){
                // make a container for all the nodes
                this.progressBar=document.createElement("div");
                this.progressBar.classList.add("progress_bar");
                this.container.appendChild(this.progressBar);
                if(that.opts){
                    that.opts.progressBar=that.progressBar;
                    that.opts.progressCallback=that._doProgress;
                }
            }
            if(this.resetButton){
                this.resetButton=document.createElement("button");
                this.resetButton.textContent="Remove files";
                this.resetButton.style="display: none";
                if(this.resetClass){
                    Apoco.Utils.addClass(this.resetButton,this.resetClass);
                }
                this.resetButton.onclick=function(){that.reset(that);
                                                    return false;}; // because probably in a form
                this.container.append(this.resetButton);
            }
            if(this.dragDrop){
                that._addListeners();
            }
        }
        // display the files
        if(!this.filesHidden){
            if(this.value.length > 0){
                if(!that.checkValue()){
                    throw new Error("file must have a name");
                }
                for(var i=0;i<this.value.length;i++){
                    // this.addValue(this.value[i]);
                    this.mkFileDisplay(this.value[i]);
                }
            }
        }

        if(this.action){
            this.action(this);
        }
        return this;
    };
    FileField.prototype={
        _promises:[],
        _errors:[],
        _mkInputNode:function(){
            var q,p,that=this;
            q=document.createElement("div"); // this is so we can style the file input
            if(that.childClass){
                 Apoco.Utils.addClass(q,this.childClass);
            }
            p=document.createElement("span");
            p.textContent="Choose a file";
            q.appendChild(p);
            that.input=document.createElement("input");
            that.input.type="file";
            that.input.classList.add("invisible_input");
            if(that.required===true){
                that.input.required=true;
            }
            that.input.setAttribute("name","files");
            if(that.opts){
                for(var k in that.opts){
                    that.input.setAttribute(k,this.opts[k]);
                }
            }
            q.appendChild(this.input);
            that.container.appendChild(q);
            if(this.dragDrop === true){
                p=document.createElement("p");
                p.classList.add("dragdrop_text");
                p.innerHTML="<b>OR</b> drag and drop a file here.";
                that.container.appendChild(p);
            }
            that._addInputListener();
            if(that.maxNum < 1){
                throw new Error("fileReader: maxNum cannot be less than one" + that.maxNum);
            }
        },
        showError:function(){
            var that=this,str="";
            for(var i=0;i< that._errors.length;i++){
                str=str.concat(that._errors[i]);
                if(that.progressBar){
                    that.progressBar.innerHTML=str;
                    that.progressBar.style="background-color: red; width:auto";
                }
            }
            that._errors=[];
        },
        _addInputListener:function(){
            var that=this,rc;
            that.input.addEventListener("change",function(e){
             //   console.log("FileReader got change event ");
                rc=that._getFiles(e,that);
                // for(var i=0;i<that._promises.length; i++){
                that._processFileIn();
            });
        },
        _processFileIn:function(){
            var that=this;
            Promise.all(that._promises).then(function(files){
                var pb=that.progressBar;
              //  console.log("errors are %j ", that._errors );
                that.showError();
                
                for(var i=0;i<files.length;i++){
                //    console.log("adding value " + files[i].name);
                    that.addValue(files[i]);
   
                    if(pb){
                        if(that.value.length > 1){
                            pb.textContent=("Staged for upload: " + that.value.length + " files ");
                        }
                        else{
                            pb.textContent=("Staged for upload: " + files[0].name ); 
                        }
                    }
                }
            }).catch(function(msg){
                console.log("Apoco.field.fileReader Error " + msg);
            });
        },
        _handleEvent:function(that){
           // console.log("that is %j " , that);
            return function(e){
               // console.log("inside event function is that is %j " , that);
              //  console.log("event type " + e.type);
                switch(e.type){
                case "dragover":
                  //  console.log("dragover");
                    if(!that.container.classList.contains("drop_zone")){
                        that.container.classList.add("drop_zone");
                    }
                    e.preventDefault();
                    e.stopPropagation();
                    break;
                case "dragenter":
                    that.container.classList.add("drop_zone");
                    e.stopPropagation();
                    break;
                case "dragleave":
                    that.container.classList.remove("drop_zone");
                    e.stopPropagation();
                    break;
                case "drop":
                 //   console.log("drop is here");
                    that.container.classList.remove("drop_zone");
                    e.preventDefault();
                    e.stopPropagation();
                    that._getFiles(e,that);
                    that._processFileIn();
                    break;
                default: return;
                }
            };
        },
        _addListeners:function(){
            var that=this;
            // add the event listeners   
            that.container.addEventListener("dragover",that._handleEvent(that),false);
            that.container.addEventListener("dragenter",that._handleEvent(that),false);
            that.container.addEventListener("dragleave",that._handleEvent(that),false);
            that.container.addEventListener("drop",that._handleEvent(that),false);
        },
        checkValue:function(v){
            var that=this,ar=[];
            if(v){
                ar.push(v);
            }
            else{
                ar=that.value;
            }
            for(var i=0;i<ar.length;i++){
                if(!ar[i].name){
                    return false;
                }
                if(!ar[i].data){
                    return false;
                }
                if(!ar[i].type){
                    return false;
                }
            }
            for(var i=0;i<this.value.length;i++){
                if(this.value[i].name === v.name ){
                 //   console.log("already have this value");
                    return false;
                }
            }
            return true;
        },
        getValue:function(){
            return this.value;
        },
        getFileNames:function(){
            var that=this,f=[];
            for(var i=0;i<that.value.length;i++){
                f[i]=that.value[i].name;
            }
            return f;
        },
        getPromises:function(){
            return this._promises;
        },
        clearPromises:function(){
            this._promises=[];
            console.log("clearPromises length is " + this._promises.length);
        },
        clearFileNames:function(){
            if(this._files){
                this._files.length=0;
            }
           // console.log("clearFilenames file s");
        },
        findFile:function(name){
            var that=this;
            if(name){
                for(var i=0;i<that.value.length;i++){
                    if (that.value[i].name === name){
                        if(that.value[i].object){ //maybe should be promise
                            return that.value[i];
                        }
                    }
                }
            }
            return that.value;
        },
        hideFile:function(name){
            var that=this,f;
            f=that.findFile(name);
            if(f && f.element){
                f.element.style.display="none";
            }
            return this;
        },
        showFile:function(name){
            var that=this,f;
            f=that.findFile(name);
            if(f && f.element){
                f.element.style.display="unset";
            }
            return this;
        },
        setValue:function(v){ 
            return null;
        },
        resetValue:function(){
            if(this.value !== undefined){
                this.value = [];
            }
            // remove the embed onject for the file(s)
           
            for(var i=0;i<this.value.length;i++){
         //       console.log("FireReader removing embedded stuff");
                this.element.removeChild(this.value[i].element);
            }
            this.reset();
            return this.value;
        },
        deleteValue:function(name){
            var that=this,found=null;
            for(var i=0;i< that._promises.length; i++){
             //   console.log("looking at promise " + i);
                that._promises[i].then(function(file){
                    if(file.name === name ){
                        found=i;
                    }
                });
            }
          //  console.log("FileReader: got promise to delete " + found);
           
            for(var i=0;i< that.value.length;i++){
                if(that.value[i].name === name){
                    break;
                }
            }
            if(i<that.value.length){
               // console.log(Object.keys(that.value[i]));
                for(var k in that.value[i]){
                 //   console.log("k is " + k);
                    if(k === "element"){
                        if(that.value[i].element.parentNode){
                            that.value[i].element.parentNode.removeChild(that.value[i].element);
                        }  
                    }
                    else{
                        delete that.value[i][k];
                    }
                }
                that.value.splice(i,1);
                if(found){
                    that._prpmises.splice(found,1);
                }
            }
            else{
                return null;
            }
            
            return that.value;
        },
        addValue:function(v){
            var that=this;
            that.replaced=null;
            if(!that.checkValue(v)){
                throw new Error(("addValue failed checkValue() with value %j",v));
            }
 
            if(that.maxNum && that.value.length === that.maxNum){
                // overwrite the last value
                that.replaced=that.value[(that.maxNum -1)].name;
                that.value[(that.maxNum-1)]=v;
            }
            else{
                that.value.push(v);
            }
            if(!that.filesHidden ){
                that.mkFileDisplay(v);
            }
            if(that.resetButton){
                if(that.value.length){
                    that.resetButton.style="display: inherit";
                }
                else{
                    that.resetButton.style="display: none";   
                }
            }
            return that.value;
        },
        mkFileDisplay:function(v){
            var that=this;

            if(v && v.object ){
                return null; // already build this
            }
            if(that.width){
                if(!isNaN(that.width)){
                    that.width=that.width+"px";
                }
            }
            else{
                that.width="400px";
            }
            if(that.height){
                if(!isNaN(that.height)){
                    that.height=that.height+"px";
                }
            }
            else{
                that.height="400px";
            }
            v.element=document.createElement("div");
            v.element.classList.add("embed_file");
            if(that.resizable === true || v.resizable === true){
                v.element.classList.add("resizable");
                //console.log("adding resizable");
            }
            v.object=document.createElement("embed");
            v.object.setAttribute("name",v.name);
            v.object.setAttribute("type",v.type);
            v.object.setAttribute("src",v.data);
            v.object.setAttribute("scale","tofit");
            if(that.width){
                v.object.width=that.width; 
            }
            if(that.height){
                v.object.height=that.height; 
            }
            if(v.width){
                v.object.width=v.width; 
            }
            if(v.height){
                v.object.height=v.height; 
            }
        
            if(that.hideFiles === true ){
                v.object.style.display="none";
            }
            v.element.appendChild(v.object);
            that.element.appendChild(v.element);
            // console.log("appending child");
         //   console.log("FileReader: promises length is " + that._promises.length);
         //   console.log("Filereader has " + that.value.length);        
            return v;
        },
        reset:function(){
            var that=this;
          //  console.log("FileReader: reset is here");
            for(var i=0;i< that.value.length; i++){
            //    console.log("deleting file " + that.value[i].name);
                that.deleteValue(that.value[i].name);
            }
            that.clearFileNames();
            that.clearPromises();
            that._errors=[];
            that.value=[];
            that.input.value="";
            if(that.progressBar){
                that.progressBar.innerHTML="";
                that.progressBar.style.width="0px";
            }
            if(that.resetButton ){
                that.resetButton.style="display: none";
            }
        },
        _doProgress:function(evt){
            var pl,pb,that=this;
           // console.log("do progress options %j", that.opts);
           // console.log("_doProgress got event %j ", evt);
            if(!that["progressBar"]){
                throw new Error("Cannot find progressBar");
            }
            else{
                pb=that.progressBar;
            }
            pb.style="";
          //  console.log("do progress is here");
           // console.log("evt type is  " + evt.type);
            if (evt.lengthComputable && evt.type === "progress") {
                pl = Math.round((evt.loaded / evt.total) * 100);
                // Increase the progress bar length.
                if (pl< 100) {
                    pb.style.width = pl + '%';
                    pb.textContent = pl + '%';
                }
            }
            else{  // finished loading into memory
                pb.style.width = "auto";
                pb.textContent = "100%";
            }
        },
        _getFiles: function(evt){
            var that=this,rc=0;
            var files=[],f;
            that._promises=[];
           // console.log("reading file");
            //new_values.length=0; // reset array
	    evt.stopPropagation();
            if(that.opts.accept){
                that.opts.mimeType=that.opts.accept;
            }
            if(evt.target && evt.target.files){
                f=evt.target.files;
            }
            else if(evt.dataTransfer && evt.dataTransfer.files){
                f=evt.dataTransfer.files;
            }
            else{
                throw new Error("FileReader: cannot find files");
            }
            
            if(that.opts.mimeType){
            //    console.log("checking mimetype");
                for(var i=0;i<f.length; i++){
                 //   console.log("filereader getting file of type " + that.MIMEType);
               //     console.log("evt target MIMEType is " + f[i].type);
                    for(var j=0;j<that.opts.mimeType.length;j++){
                        if (f[i].type.match(that.opts.mimeType[j])) {
                          //  console.log("Got matching file types");
                            files.push(f[i]);
                            break;
                        }
                    }
                }
            }
            else{
                files=f;
            }
            if(files.length === 0){
                that.input.value="";
                return 0;
            }
          
           // console.log("_getFileSelect has files %j ",files);
            rc=Apoco.IO.getFiles(files,that);
            return rc; // an array of promises
        }
    };

    Apoco.Utils.extend(FileField,_Field);
  
    
    var ImageArrayField =function(d,element){
        var that=this,rc=true;
        var new_values=[];
        this.promises=[];
        d.field="ImageArrayField";
        d.type="imageArray";
	_Field.call(this,d,element);
	this.popup=true;
       
        this.width=this.width?this.width:120;
        this.height=this.height?this.height:90;
        if(!this.value){
            this.value=[];
        }
        if(this.editable !== false){
	    if(!window.FileReader){
	        Apoco.popup.dialog("Sorry No FileReader","Your browser does not support the image reader");
	        throw new Error("No FileReader");
	    }
            this.input=document.createElement("input");
            if(this.childClass){
                Apoco.Utils.addClass(this.input,this.childClass);
            }
            this.input.type="file";
            if(this.required===true){
                this.input.required=true;
            }
            this.input.setAttribute("name","files");
            this.input.setAttribute("multiple","multiple");
	    this.element.appendChild(this.input);
	    this.input.addEventListener("change",function(e){
                rc=that._getImageFileSelect(e);
            });
        }
        if(!rc){
            Apoco.popup["dialog"]("Image Load Error","One or more of the selected files is not a readable image");
        }
        
        if(this.value && this.value.length>0){  // start pre-loading
            this.loadImages();
        }
        if(this.thumbnails === true){ 
            this.mkThumbnails();
        }
        if(this.action){
            this.action(this);
        }
        return this;
    };

    
    ImageArrayField.prototype={
        _getImage: function(o){
            var that=this;
            var imm=document.createElement("img"); //new Image();  // get the width and height - need to load in to image
            imm.src=o.src;
            var promise=new Promise(function(resolve,reject){
	        imm.onload=function(){
                    o.width=parseFloat(this.width);
                    o.height=parseFloat(this.height);
                    o.title=o.name;
                    o.image=imm;
                    o.aspect_ratio=parseFloat(this.width/this.height);
                    resolve(o);
                };
                imm.onerror=function(){
                    o.image=null;
                    reject("Field:ImageArray._getImage Could not load image " + o.src);
                };
            });
            return promise;
        },
        getValue:function(){
            return this.value;
        }, 
        _getImageFileSelect: function(evt){
            var that=this,rc=true;
            var td=this.element.querySelector("div.thumbnails");
   	    //new_values.length=0; // reset array
	    evt.stopPropagation();
	    var files = new Array; //evt.target.files;
            //check that the files are images
            for(var i=0;i<evt.target.files.length;i++){
                if (evt.target.files[i].type.match('image.*')) {
                    files.push(evt.target.files[i]);
                }
                else{
                    rc=false;
                }
            }
            var count=that.value.length;
	    var last=count+files.length;
	    for (var i=count,j=0; i<last; i++,j++) {
		var reader = new FileReader();
		reader.onload = (function(f,num) {
                 //   console.log("getImagefileselect  file is  %j",f);
		    return function(e) {
                        var p;
			e.stopPropagation();
                        that.value[num]={src: e.target.result,name:f.name};
                        that.promises[num]=that._getImage(that.value[num]);
                        if(that.thumbnails === true){
                            that._addThumbnail(td,num);
                        }
 		    };
		})(files[j],i);
		reader.readAsDataURL(files[j]);
	    }
            return rc;
        },
        loadImages: function(values){
            var i=0,last,that=this;
            if(values !==undefined && Apoco.type["array"].check(values)){ //loading more images after creation
                i=this.value.length;
                this.value=this.value.concat(values);
            }
            last=this.value.length;
    
            for(i; i<last;i++){
                this.promises[i]=that._getImage(that.value[i]);
            }
      
            return this.promises;
        },
        finishedLoading:function(){
            return Promise.all(this.promises); // rejects on first fail
        },
        _addThumbnail:function(pp,i){
            var that=this,div=document.createElement("div");
            if(this.value[i].name){
                div.setAttribute("name",this.value[i].name);
            }
            pp.appendChild(div);
            
            if(this.value[i].label){
                var r=document.createElement("h5");
                r.textContent=this.value[i].label;
                div.appendChild(r);
            }
            this.promises[i].then((function(el){
                return function(v){
                    if(!v.image){
                        throw new Error("mkThumbnails: image does not exist");
                    }
                    if(that.width){
                        v.image.style.width=(that.width.toString() + "px");
                    }
                    if(that.height){
                        v.image.style.height=(that.height.toString() + "px");
                    }
        	    el.appendChild(v.image); 
                    //that._addThumbnail(td,v);
                };
            }(div))); 
        },
        mkThumbnails: function(){
            var that=this,el;
            var td=this.element.querySelector("div.thumbnails");
            if(!td){
                td=document.createElement("div");
                td.className="thumbnails";
                this.element.appendChild(td);
	    }
	    for(var i=0;i<this.value.length;i++){ // each image
                that._addThumbnail(td,i);
            }
  	},
        resetValue:function(){ // wrong
            return;
        },
	checkValue:function(){
	    return true;
	},
        deleteValue:function(title){
            var index=-1;
            for(var i=0;i<this.value;i++){
                if(this.value[i].title == title){
                    index=i;
                    break;
                }
            }
            if(index > 0){
                this.value.splice(index,1);
            }
            if(this.thumbnails){
                this.mk_thumbnails();
            }
            return this;
        }
    };

    Apoco.Utils.extend(ImageArrayField,_Field);

    var AutoCompleteField=function(d,element){
        var v;
        var box,that=this;
        var pubsub;
        d.field="AutoCompleteField";
        d.type="string";

        _Field.call(this,d,element);
        if(this.options === undefined){
            this.options=[];
        }
        box=document.createElement("div");
        box.classList.add(this.type,"apoco_autocomplete");
        this.element.appendChild(box);
        this.input=document.createElement("input");
        this.input.setAttribute("placeholder","Search");
        if(this.required===true){
            this.input.required=true;
        }
        if(this.childClass){
            Apoco.Utils.addClass(this.input,this.childClass);
        }
        this.input.setAttribute("type",this.html_type);
        box.appendChild(this.input);
      
        this.select=document.createElement("ul");
        this.select.classList.add("choice");
        this.select.style.visibility="hidden";
        box.appendChild(this.select);
        var handleEvent=function(e){
            var pubsub;
            switch(e.type){
            case "input":
                var r;
             //  console.log("INPUT event on %j ",e.target);
                var v=that.input.value;
              //  console.log("got value "+ v);
                e.stopPropagation();
                that.select.style.visibility="hidden";
                r=that.contains(that.options,v);
                if(r.length>0){
                    that._make_list(r);
                    that.select.style.visibility="visible";
                }
                break;
            case "blur":
                e.stopPropagation();
                that.select.style.visibility="hidden";
                break;
            case "keypress":
                console.log("select got keypress");
                pubsub=(that.name + "_value_selected");
                break;
            default: return;
            }
        };
        //make a list of 10 things
        for(var i=0;i<10;i++){
            this.select.appendChild(document.createElement("li"));
        }
          //click event triggers after the blur so the link gets hidden.
        // Instead of click use mousedown it will work.
        
        this.select.addEventListener("mousedown", function(e){
            e.stopPropagation();
            that.input.value=e.target.textContent;
            that.select.style.visibility="hidden";
        },false);
        
        this.input.addEventListener("input",handleEvent,false); 
        this.input.addEventListener("keyup",handleEvent,true);
        this.input.addEventListener("blur",handleEvent,true); 
                   
        if(this.action){
            this.action(this);
        }
        return this;
    };

    AutoCompleteField.prototype={
        deleteOptions:function(){
            this.options.length=0;
            return this;
        },
        addOptions:function(n){
            for(var i=0;i<n.length;i++){
                this.options.push(n[i]);
            }
            if(this.options.length>1){
                Apoco.sort(this.options,"string");
            }
            return this;
         },
        _make_list:function(ar){
            var p;
            var l=this.element.getElementsByTagName("li");
            
            for(var i=0;i<10;i++){
                if(ar[i]){
                    l[i].textContent=ar[i];
                    l[i].style.visibility="inherit";
                }
                else{
                    l[i].textContent="";
                    l[i].style.visibility="hidden";
                }
            }
         },
        contains:function(arr,item){
            var count=0,a,n=[];
            // make it case insensitive
            item=item.toLowerCase();
          //  console.log("contains: got input " + item);
            for(var i=0;i<arr.length;i++){
                a=arr[i].toLowerCase();
             //   console.log("testing arr " + i + " value " + a);
                if(a.startsWith(item)){
                 //  console.log("item " + item + " starts with " + a);
                    n[count]=arr[i];
                    count++;
                }
                if(count ===10){
                    return n;
                }
            }
            return n;
        },
        popupEditor: null
    };

    Apoco.Utils.extend(AutoCompleteField,_Field);

      
    Apoco.field={
        exists:function(field){
            if(this[field]){
                return true;
            }
            return false;
        },
        static: function(options,element){return new StaticField(options,element);},
        staticMethods:function(){var n=[]; for(var k in StaticField.prototype){  n.push(k);} return n;},
        input:function(options,element){return new InputField(options,element);},
        inputMethods:function(){var n=[]; for(var k in InputField.prototype){  n.push(k);} return n;},
        object:function(options,element){return new ObjectField(options,element);},
        objectMethods:function(){var n=[]; for(var k in ObjectField.prototype){  n.push(k);} return n;},
        float:function(options,element){return new FloatField(options,element);},
        floatMethods:function(){var n=[]; for(var k in FloatField.prototype){ n.push(k);} return n;},
        fileReader:function(options,element){ return new FileField(options,element);},
        fileReaderMethods:function(){var n=[]; for(var k in FileField.prototype){ n.push(k);} return n;},
        date:function(options,element){return new DateField(options,element);},
        dateMethods:function(){var n=[]; for(var k in DateField.prototype){  n.push(k);} return n;},
        time:function(options,element){return new TimeField(options,element);},
        timeMethods:function(){var n=[]; for(var k in TimeField.prototype){ n.push(k);} return n;},
	numberArray:function(options,element){return new  NumberArrayField(options,element);},
        numberArrayMethods:function(){var n=[]; for(var k in NumberArrayField.prototype){ n.push(k);} return n;},
	textArea:function(options,element){ return new  TextAreaField(options,element);},
        textAreaMethods:function(){var n=[]; for(var k in TextAreaField.prototype){ n.push(k);} return n;},
	select:function(options,element){ return new  SelectField(options,element);},
        selectMethods:function(){var n=[]; for(var k in SelectField.prototype){ n.push(k);} return n;},
	checkBox: function(options,element){return new CheckBoxField(options,element);},
        checkBoxMethods:function(){var n=[]; for(var k in CheckBoxField.prototype){ n.push(k);} return n;},
        slider:function(options,element){ return new  SliderField(options,element);},
        sliderMethods:function(){var n=[]; for(var k in SliderField.prototype){ n.push(k);} return n;},
	buttonSet:function(options,element){ return new  ButtonSetField(options,element);},
        buttonSetMethods:function(){var n=[]; for(var k in ButtonSetField.prototype){ n.push(k);} return n;},
	stringArray:function(options,element){ return new  StringArrayField(options,element);},
        stringArrayMethods:function(){var n=[]; for(var k in StringArrayField.prototype){ n.push(k);} return n;},
        imageArray:function(options,element){ return new  ImageArrayField(options,element);},
        imageArrayMethods:function(){var n=[]; for(var k in ImageArrayField.prototype){ n.push(k);} return n;},
	autoComplete: function(options,element){ return new AutoCompleteField(options,element);},
        autoCompleteMethods:function(){var n=[]; for(var k in AutoCompleteField.prototype){ n.push(k);} return n;}
    };

    


    
})();

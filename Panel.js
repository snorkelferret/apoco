var Apoco=require('./declare').Apoco;
require("./Utils");
require("./Popups");
require("./Window");

// Panel is a container
// change show to show hidden children if param is show_children
;(function() {
    'use strict';
    function check(ar){
      
	if(!Apoco.type["object"].check(ar)){
	    throw new Error("This is not a window display object " + ar,"Panel.js");
	}
        
	for(var i in ar){
	    var OK=0;
	    var msg=new String;
            for(var k in ar[i]){
	//	console.log("key is " + k);
		switch(k){
		case "display": // check whether there is a display object
		    var d=ar[i][k];
		   //console.log("switch case display " + d);
		    if(!Apoco.display[d]){
			msg=msg.concat("Apoco does not know how to create " + d);
		    }
		    else{
			OK++;
		    }
                    break;
		case "DOM": // does this object exist ?
		    //var d=document.getElementById(ar[i][k]);
                    var d=true;
                    if(!ar[i][k] || ar[i][k].length===0){
                        d=false;
                    }
		  // console.log("switch case DOM ", d);
		    if(!d){
			msg=msg.concat("No Dom object called " + d);
		    }
		    else{
			OK++;
		    }
		    break;
		case "id":  // must have an id
		  //  console.log("switch case id");
		    if(!ar[i][k] || ar[i][k].length===0){
			msg=msg.concat("display objects must have an id");
		    }
		    else{
			OK++;
		    }
		    break;
		default:
		 //   console.log("this is default");
		    break;
		}
	    }
	    if(OK !== 3 ){
		//console.log("got " + OK );
		throw new Error(msg);
	    }
	}
	return true;
    }

    Apoco.Panel={
	_list: [],  // list of all the Panels. Panel is a group of elements comprising a logical UI object.
        UIStart:function(w){
            var nv;
          //  console.log("UIStart is here");
            if(w === undefined){
                throw new Error("Panel.UIStart needs a string array of valid UI Panel names");
            }
            for(var i=0;i<w.length;i++){
              //  console.log("trying to find " + w[i]);
                nv=this._UIGet(w[i]);
                if(nv !== null){
                    this.add(nv);
                }
                else{
                    throw new Error("Apoco.Panel: No panel called " + w[i] + " was found in UI.Panels");
                }
            }

        },
        _UIGet:function(name){
           // console.log("UIGet trying to find " + name);
         //   console.log("UIGet Panels " + UI.Panels);
            if(name === undefined){
                throw new Error("Panel._UIGet: panel name is undefined");
            }
            if(typeof UI === undefined){
                throw new Error("Panels: UIGet needs UI.Panels to be defined");
            }
            if(typeof UI.Panels === undefined){
                throw new Error("Panel: UI.Panels is not defined");
            }
            for(var k in UI.Panels){
            //     console.log("trying to get panel " + name + " from " + k);
                if(k == name){
                //    console.log("found " + name);
                    var cd=Apoco.cloneDeep(UI.Panels[k]);
                    cd.name=name; // so we don't have to repeat the name in the UI declaration
               //     console.log("clone deep is " + cd);
                    return cd;
                }
            }
            return null;
        },
 	_inList: function(k){
            if(k===undefined){
                throw new Error("Panel: inList name is undefined");
            }
            for(var i=0;i< this._list.length;i++){
	//	console.log("i is " + i + "checking is in list " + this._list[i].name);
		if(this._list[i].name == k){
		    return i;
		}
	    }
	    return null;
	},
        _dumpHTML:function(panel_name){
            var nodes=new String,c,found,t=new String;
            var f=this._inList(panel_name);
            if(f === null){
                throw new Error("Panel: _dumpHtml needs a panel name");
            }
           
            for(var j=0; j<this._list[f].components.length;j++){
                c=this._list[f].components[j];
                if(c){
                    t="<!-- INSERT INTO ";
                    if(Apoco.type.object.check(c.DOM)){  // has been put into DOM with show
                        //c.DOM.id;
                        t=t.concat(c.DOM.id );
                    }
                    else{
                        t=t.concat(c.DOM);
                    }
                    t=t.concat(" -->");
                    nodes=nodes.concat(t);
                    t=c.element.outerHTML;
                    nodes=nodes.concat(t);
                } 
            }
            //console.log("DUMP HTML  " + nodes);
            return nodes;
        },
        get: function(k){
            var u=this._inList(k);
            if(u !== null){
                return this._list[u];
            }
          //  console.log("panel not yet in list");
            return null;
        },
        show:function(k){
            if(k===undefined){
                throw new Error("Panel.show name is undefined");
            }
            var c,p=this.get(k);
            if(!p){
                return null;
            }
            c=p.getChildren();
            if(c === null){
                return null;
            }
            for(var i=0;i<c.length;i++){
               // console.log("Panel show " + c[i].id + " hidden " + c[i].hidden);
                c[i].show(true);  // set fromParent  
            }
            return p;
        },
        showAll:function(win){
            var w,tw=null;
            if(win !== undefined){
                w=Apoco.Window.get(win);
                if(w===null){
                    throw new Error("Panel.hideAll - cannot find window " + w);
                }
                tw=w.window;
            }
            for(var i=0;i<this._list.length;i++){
                if(tw !== null){
                    if( this._list[i].window === tw){
                        this.show(this._list[i].name);
                    }
                }
                else{
                    this.show(this._list[i].name);
                }
            }
           
        },
        hideAll: function(win){
            var w,tw=null;
            if(win !== undefined){
               // console.log("hideall got window");
                w=Apoco.Window.get(win);
                if(w===null){
                    throw new Error("Panel.hideAll - cannot find window " + w);
                }
                tw=w.window;
            }
            for(var i=0;i<this._list.length;i++){
               // console.log(i + " this is panel " + this._list[i].name + " with window " + this._list[i].window);
               // console.log("WINDOW IS " + tw);
                if(tw !== null){
                    if(this._list[i].window === tw){
                 //       console.log("hiding panel for window " + win + " name " + this._list[i].name);
                        this.hide(this._list[i].name);
                    }
                }
                else{
                   // console.log("hiding things without window");
                    this.hide(this._list[i].name);
                }
            }
        },
        hide:function(k){
            var p=this.get(k);
           // console.log("hiding panel " + k);
            if(!p){
                throw new Error("Panel.hide Cannot find panel " + k);
            }
            var c=p.getChildren();
            if(c === null){
                return null;
            }
            for(var i=0;i<c.length;i++){
                if(document.contains(c[i].element)){ 
                    c[i].hide(true);  // setting hide from parent to true
                }
            }
            return p;
        },
        getList: function(){
            var l=[];
            for(var i=0;i< this._list.length;i++){
              //  console.log("panel has " + this._list[i].name + " at " + i);
                l[i]=this._list[i].name;
            }
            if(l.length === 0){
                return null;
            }
            return l;
        },
        clone: function(panel){ // clone an existing panel and put in new window
            var stuff={},np,p,name,i=0;
            
            p=this.get(panel);
            if(p !== null){
                name=panel;
                np=this._UIGet(panel); //need to change the name
                if(np == null){
                    throw new Error("Panel can't find " + panel + " in UI.Panels");
                }
                while(this.get(name) !== null){
                    i++;
                    name=(name + i);
                }
                np.name=name;
            //    console.log("name is " + name + " i is " + i);
                for(var j=0;j<np.components.length;j++){
                    np.components[j].id = ( np.components[j].id + i);
                }
                return np;
            }
            else{
                throw new Error("Apoco.Panel.clone: No panel named " + panel + " found");
            }
        },
	add: function(panel){
            var w,p;
	  //  console.log("Panel.add is here");
	   //console.log("+++++++++++=adding panel object ++++++++++ " + panel.name);
            if(!panel){
                throw new Error("Panel.add must have a name or object","Panel.js");
            }
            if(Apoco.type['string'].check(panel)){
                w=this._UIGet(panel);
                if(w){
                    panel=w;
                }
                else{
                    throw new Error("Panel is not an object and not defined in UI.Panels","Panel.js");
                }
            }
            if(Apoco.type["object"].check(panel) && !panel.name){
                throw new Error("panel must have a name");
            }
	    if(this._inList(panel.name) === null){
		check(panel.components);
		p=Apoco._panelComponents(panel);
		this._list.push(p);
	    }
	    else{
		throw new Error("Panel.add " + panel.name + " is already in the display list","Panel.js");
	    }
            return p;
	},
        deleteAll: function(promise_resolve){
            var obj;
            var n=this._list.length;
           // console.log("there are " + n + " panels in Panel List");
            for(var i=0;i<n; i++){
               //console.log("panel: removing panel " + i + " name " + this._list[i].name + " from list");
               	obj=this._list[i];
                obj.deleteChildren();
                if(promise_resolve){
                    if(i===(n-1)){
                  //      console.log("***********************************8delete is done");
                        promise_resolve();
                    }
                }
             }
            Apoco.Window._closeAll();
            this._list.length=0;
        },
        delete: function(name){
   	    var p=this._inList(name);
	    if(p !== null){
                var obj=this._list[p];
                obj.deleteChildren();
	//	console.log("panel: removing panel " + obj.name + " from list");
		this._list.splice(p,1);
                for(var k in obj){
                  //  console.log("DELETING " + k);
                    delete obj[k];
                    
                }
                obj=null;
                return this._list.length;
            }
            else {
                throw new Error("Apoco.Panel delete -" + name + " is not in the list of Panels");
            }
	}
    };
    var _Components=function(obj){
        var that=this,w;
        for(var k in obj){
	    this[k]=obj[k];
	  //   console.log("_ApocoPanelComponents got value " + k + " value ", this[k]);
	}
        //Apoco.mixinDeep(this,obj);
        
	if(this.window){
            w=Apoco.Window.get(this.window);
            if(w !== null){
                w.window.focus();
                that.window=w.window;
                that._addComponents();
            }
            else{ 
                var p=Apoco.Window.open(obj.window);  // create a new browser window
	        p.then(function(w){
                    w.window.focus();
                    that.window=w.window;
                    that._addComponents();
                }).catch(function(msg){
                    throw new Error("window " + that.window + " does not exist " + msg);
                });
            }
	}
        else{
            that._addComponents();
        }
      
    };

    _Components.prototype={
	_addComponents: function(){
	    var that=this;
            var d;
	 
	    for(var i=0;i<this.components.length;i++){
                // check that DOM parent exists
 		var p=this.components[i].display;
             //   console.log("adding component " + p);
		this.components[i].parent=this;
               // console.log("addComponents window is " + that.window);
	        d=Apoco.display[p](this.components[i],that.window);
		if(!d){
		    throw new Error("could not create " + p);
	        }
               
            //    console.log("_addComponents id is " + d.id + " hidden is " + d.hidden);
                if(d.hidden === undefined  ||  d.hidden !== true){ /// hmmmm
              //      console.log("_addComponents showing " + d.id);
        	    d.show();
                }
    
		this.components[i]=d;
	    }
	},
	addChild: function(display_object){ // to existing panel
            var d;
            if(!display_object){
                throw new Error("addChild: missing parameter - display object","Panel.js");
            }
            if(this.getChild(display_object.id)){
                throw new Error("Apoco.Panel: already have a child with id " + display_object.id);
            }
            if(!display_object.display){
                throw new Error("You can only add display objects to a panel");
            }
            if(!display_object.displayType){ //has not been instantiated
                d=display_object;
                display_object=Apoco.display[d.display](d,this.window);
                if(!display_object){
                    throw new Error("Panel.addChild: could not create display object " + d.display);
                }
            }
        //   console.log("adding child length is " + this.components.length);
            display_object.parent=this;
 	    this.components.push(display_object);
            if(display_object.hidden !== true){
                display_object.show();
            }
            //   console.log("after add adding child length is " + this.components.length);
            return display_object;
	},
        deleteChildren: function(child_array){
            if(!this.components){
                return null;
            }
         //   console.log("Panel deleteChildren is here parms " + child_array);
      //      console.log("child array check type is " + Apoco.type["array"].check(child_array) );
            if(child_array && Apoco.type["array"].check(child_array)){
           //     console.log("child array is here and its an array");
                for(var i=0;i<child_array.length;i++){
              //      console.log("deleting child " + child_array[i]);
                    this.deleteChild(child_array[i]);
                }
                return this.components.length;
            }
            for(var i=0;i<this.components.length;i++){
                this.components[i].delete("message from parent");
            }
            this.components.length=0;
            return 0;
        },
        deleteChild: function(obj){
            var index=-1;
            if(!obj){
                throw new Error("Apoco.Panel: deleteChild obj is null");
            }
           // console.log("Panel delete child is here");           
            if(!Apoco.type['object'].check(obj)){ // type check string does not work if id is an int e.g 209
                obj=this.getChild(obj);
               // console.log("obj is string- object is  " + obj);
            }
          
	    for(var i=0;i<this.components.length;i++){
             //   console.log("does " + obj + "match " + this.components[i]);
		if(obj === this.components[i]){
                    index=i;
               //     console.log("got index "+ index);
                    break;
		}
	    }
            if(index !== -1){
                this.components[index].delete("message from parent");
	        this.components.splice(index,1);
            }
            else{
                throw new Error("Panel: deleteChild could not find child " + obj);
            }

	},
	getChildren: function(){
	    if (this.components && this.components.length>0){
		return this.components;
	    }
	    return null;
	},
        getChild: function(id){
            if(!this.components){
                return null;
            }
            if(!id){
                throw new Error("getChild: needs a parameter, either the display object or it's id");
            }
            if(Apoco.type.object.check(id)){
                if(id.id){
                    id=id.id;
                }
                else{
                    return null;
                }
            }
           // console.log("Panel.getChild Trying to find " + id);
            for(var i=0;i< this.components.length;i++){
             //   console.log("this is child " + this.components[i].id);
                if(this.components[i].id === id){
                    return this.components[i];
                }
            }
            return null;
        },
	findChild: function(child){
	    var found=null;
            
            if(!this.components){
                return null;
            }
            if(!child){
                throw new Error("findChild: parameter needs to be an object with at least one key value pair - key:id or element:HTMLElement or name:someName ");
            }
	    for(var i=0;i<this.components.length; i++){
	//	console.log("this is child " + i);
		found=null;
		for(var k in child){ // if there is more than one property in the child - make sure all are matched
		    switch(k){
		    case "key":
			(child[k] === this.components[i].getKey())?found=i:found=-1;
			break;
		    case "element":
			(child[k] === this.components[i].getElement())? found=i: found=-1;
			break;
		    case "name":
			(child[k] === this.components[i].getName())? found=i: found=-1;
			break;
		    default:
			found=null;
			break;
		    }
		    //console.log("in keys found key " + k + " and found is " + found);
		    if(found === -1){
			break;   // has the key but not matched so move to next child
		    }
		}
		if(found !== null && found !== -1){
		    return this.components[i];
		}

	    }
	    return null;
	}
    };
    Apoco._panelComponents=function(t){
        if(t === "methods"){
            var f={};
            for(var k in _Components.prototype ){
                f[k]=k;
            }
            return f;
        }else{
            return new _Components(t);
        }
    };
      
})();

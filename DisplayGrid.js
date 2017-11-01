var Apoco=require('./declare').Apoco; 
require("./DisplayBase.js");
require("./Sort.js");

/*
 * Copyright (c) Pooka Ltd.2012-2016
 * Distributed under MIT license.
 * All rights reserved.
 */

/*
  TODO 
   right mouse buton - add functionality to add/remove columns
   resizable does not reappear after the element has been detached
   add support for displaying/ uploading images

Data Format
jsonishData={
      DOM: "Content",
      sortOrder: [cols[i].name,cols[j].name],
      groupby: some column name,
      userSortable: [cosl[i].name],
      cols:  // have these keys
      {  name: string, // required key
         type: // see ApocoTypes  // required key
         editable: boolean, (default true)
         hidden: boolean,(default false)// setting to true means no dom element is created.
         required: boolean (default: false)
         step: float, default(0.1) // FloatField only
         precision: integer, default(2) // FloatField only
 },
 rows:  // must have the same number of keys matching the names of the cols
 [ { key: matching cols name above, value, key: value ...},
 { ....}
 ]
 };

*/


;(function(){
    "use strict";
    
    function sort_into_subGrids(that){
	// see if the data has been put into subgrids
	if(that.rows && Apoco.type["array"].check(that.rows)){ // not sorted into subgrids
	    var n,tg,subgrid= new Object;
	    if(that.groupBy){
		for(var i=0;i<that.rows.length;i++){
		    n=that.rows[i][that.groupBy];
                    if(!n){
                        throw new Error("Grid - sort_into_subGrids field " + that.groupBy + " does not exist");
                    }
                    n=n.toString();
		    if (!subgrid[n]){
			subgrid[n]={};
			subgrid[n].name = n;
			subgrid[n].rows = new Array;
		    }
		    subgrid[n]["rows"].push(that.rows[i]); 
		}
                that.rows.length=0; //
	    }
	    else{
                subgrid["all"]=new Object;
                subgrid["all"].name="all"; // very smelly
		subgrid["all"].rows=that.rows;
	    }
	    var i=0;
	    for(var k in subgrid){
		that.grids[i]=subgrid[k];
		i++;
	    }
	}
       	// that.rows.length=0; // delete rows array
	if(!that.grids){
	    throw new Error("Apoco.display.grid: no rows or grids in " + that.id);
	}
    }

    var ApocoMakeGrid=function(options,win){
	var DEBUG=true;
	var that=this,t;
        
       	Apoco._DisplayBase.call(this,options,win);  //use class inheritance - base Class

	this.cellEdit=null; // cell currently being edited- this is of type Apoco.field
	this.allowEdit=true;  // are edits allowed?
        this.grids=[];
        this.resort=false; // if any of the cols in sortOrder or userSortable are editable - will need resort
    
        if(this.cols === undefined || this.cols.length === 0){
            throw new Error("DisplayGrid: need to supply a least one column");
        }
        for(var i=0;i<this.cols.length;i++){   // are there any duplicated columns
            for(var j=0;j<this.cols.length;j++){
                if(i !== j){
                    if(this.cols[i].name === this.cols[j].name){
                        throw new Error("DisplayGrid: Cannot have duplicate column names " + this.cols[i].name);
                    }
                }
            }
        }
        if(this.sortOrder && !Apoco.type["stringArray"].check(this.sortOrder)){
            throw new Error("DisplayGrid: sortOrder must be an array of strings ");
        }
        if(this.uniqueKey && !Apoco.type["stringArray"].check(this.uniqueKey)){
            throw new Error("DisplayGrid: uniqueKey must be an array of strings");
        }
        if(this.userSortable && !Apoco.type["stringArray"].check(this.userSortable)){
             throw new Error("DisplayGrid: userSortable must be an array of strings");
        }
        
        for(var i=0;i<this.cols.length; i++){
            if(this.userSortable){
                for(var j=0;j<this.userSortable.length;j++){
                    if(this.cols[i].name === this.userSortable[j] && this.cols[i].editable === true){
                        this.resort=true;
                    }
                }
            }
            if(this.sortOrder){
                for(var j=0;j<this.sortOrder.length;j++){
                    if(this.cols[i].name === this.sortOrder[j] && this.cols[i].editable === true){
                        this.resort=true;
                    }
                }
            }
        }
        if(!this.uniqueKey){ // add a hidden column that is a unique key
            this.cols.push({name:"_aid",type: "integer",hidden: true, editable: false});
            this.idKey=0; // start id value
            this.uniqueKey=["_aid"];
        }
        else{  // make sure that the unique key is not editable
            for(var i=0;i<this.cols.length;i++){
                for(var j=0;j<this.uniqueKey.length;j++){
                    if(this.cols[i].name === this.uniqueKey[j] && this.cols[i].editable === true){
                        throw new Error("DisplayGrid: cols that are unique cannot be edited " + this.uniqueKey[j]);
                    }
                }
            }
        }
        if(this.sortOrder){   // make sure the sortOrder makes a unique ordering
            this.sortOrder=this._mkSortOrder(this.sortOrder);
        }
        else{
            this.sortOrder=this.uniqueKey.slice(0);  // copy the array
        }
        //console.log("SORT ORDER from MakeGrid is %j",this.sortOrder);
        this._execute();
    };


    ApocoMakeGrid.prototype={
        _mkSortOrder: function(s){ // what is our sort policy?
            var found,not_found=[],sortOrder=[];
            if(Apoco.type["stringArray"].check(s)){
                sortOrder=s.slice(0); // copy the array
            }
            else{
                throw new Error("DisplayGrid: _mkSortorder needs a string array");
            }
            //console.log("MakeSortOrder: got initial sortOrder %j" , sortOrder + "param  was %j",s);
            if(this.uniqueKey){
                if(!Apoco.type["stringArray"].check(this.uniqueKey)){
                    throw new Error("DisplayGrid: unique key is not a stringArray");
                }
                //  console.log("this,uniquekey length is " + this.uniqueKey.length);
                this.sortOrderUnique=true;
                if(sortOrder.length>0){
                    //    console.log("MakeGrid sortOrder length is " + this.sortOrder.length);
                    // to determine the absolute ordering is unique
                    // uniqueKey must be a subset of sortOrder
                    for(var i=0;i<this.uniqueKey.length;i++){
                        found=false;
                        for(var j=0;j<sortOrder.length;j++){
                            if(this.uniqueKey[i] == sortOrder[j]){
                                found=true;
                            }
                        }
                        if(!found){
                            //    console.log("not found was " + this.uniqueKey[i]);
                            not_found.push(this.uniqueKey[i]);
                        }
                    }
                    for(var i=0;i<not_found.length;i++){
                        // console.log("not found is pushing " + not_found[i]);
                        sortOrder.push(not_found[i]);
                    }
                    // console.log("_MakeSortOrder: sortOrder length is " + this.sortOrder.length);
                }
            }
         //   console.log("MakeSortOrder returning array %j",sortOrder);
            return sortOrder;  
        },
	_execute:function(){
            var rows,body,r,that=this;
            // var t0=performance.now();
            // make the header
            this.colElement=document.createElement("div");
            this.colElement.classList.add("head");
            this.element.appendChild(this.colElement);

            this.grid_container=document.createElement("div");
            this.grid_container.classList.add("grid_content");

            if(this.resizable){
                this.element.classList.add("resizable");
            }
            //   console.log("this.rows is " + this.rows)
            
            this.element.appendChild(this.grid_container);
            for(var i=0; i< this.cols.length; i++){
                this.addCol(i);
            }
            
            if(this.rows !== undefined){
                // add a unique key to the rows if needed
                if(this.uniqueKey[0] === "_aid"){  // need to do this before sorting!!!
                    for(var j=0;j<this.rows.length;j++){
                        this.rows[j]["_aid"]=this.idKey;
                        this.idKey++;
                    }
                }
                //   console.log("sorting into subgrids");
                sort_into_subGrids(this);
                
	        for(var i=0;i<this.grids.length;i++){
                  //  console.log("this is grid " + i);
                    this.addGrid(this.grids[i]);
                    body=this.grids[i].element.getElementsByTagName("tbody")[0]; //.find("tbody");
                    rows=this.grids[i].rows;
                //    console.log("grid has " + rows.length + " number of rows");
                    for(var j=0;j<rows.length;j++){
                        //  console.log("adding row");
                        r=this._mkRow(rows[j]);
                        body.appendChild(r);
                    }
                }
                this.sort();
                this.redrawRows();
            }
   	},
        _afterShow:function(){
            var v,c,width=0,d,t;
            var that=this;
            //console.log("After show is here");
            if(!this.grids){
                return;
            }
            v=that.element.getElementsByClassName("head")[0];
            if(v){
                c=v.getElementsByTagName("div");
                // adding up child widths because window may be smaller than grid width
                if(c){
                    for(var i=0; i<c.length;i++){
              //          console.log("found child " + i);
                        d=window.getComputedStyle(c[i],null).getPropertyValue("width");
                //        console.log("width of child is " + d);
                        if(d.indexOf("px")>=0){
                            t=d.split("px");
                        }
                        else{
                            return;
                        }
                        width+=parseFloat(t[0]);
                    }
                   // var width=window.getComputedStyle(v,null).getPropertyValue("width");
                    //var width=v.style.width;
                    width=(Math.ceil(width).toString() + "px");
                    for(var i=0;i<this.grids.length;i++){
                        //console.log("setting grid " + i + " to " + width);
                        this.grids[i].element.style.width=width;
                    }
                    v.style.width=width;
                }
                // now add all the grids                
                this.element.appendChild(this.grid_container);
            }
            else{
                console.log("cannot find head element ");
            }
        },
    	sort: function(dir){
	    var isSortable=false;
            var ar=[],t,s;
            if(!this.sortOrder || this.sortOrder.length === 0){
                throw new Error("DisplayGrid: sort there is no sortOrder specified");
            }
	    for(var i=0; i< this.sortOrder.length; i++){
             //   console.log("this is sortOrder " + this.sortOrder[i]);
		t=this.getColIndex(this.sortOrder[i]);
	//	console.log("col index is " + t);
		s=this.sortOrder[i];  // name of the column in the row
	  //      console.log("name is " + s);
		if(this.cols){
		    ar.push({type: this.cols[t].type,
			     fn:(function(s){
				 return function (a){
                                    // console.log("value is " + a[s].value);
				     return  a[s].value; };
			     })(s)
			    });
		}
	    }
          //  console.log("sortOrder.length is " + this.sortOrder.length);
	               
	    for(var j=0;j<this.grids.length;j++){
		Apoco.sort(this.grids[j].rows,ar);
                this.grids[j].sorted=true;
                this.grids[j].reverse=false;
               /* for(var n=0;n<this.grids[j].rows.length;n++){
                    for(var m=0;m<this.sortOrder.length; m++){
                        var mn=this.sortOrder[m];
                        console.log("row " + mn + " is " + this.grids[j].rows[n][mn].value );
                    }
                } */
                if(dir && dir === "down"){
                    this.grids[j].rows.reverse();
                    this.grids[j].reverse=true;
                }
	    }
	    
	},
        addGrid:function(grid){
            var div,h;
	    var name=grid.name;
	    var rows=grid.rows;
            div=document.createElement("div");
            div.classList.add("inner_table");
	    if(name !== undefined && name !== "all"){
	        div.id=name;
                h=document.createElement("h4");
            //    h.classList.add("ui-widget-header");
                h.textContent=name;
                div.appendChild(h);
	    }
	    
	    var table=document.createElement("table");
	    div.appendChild(table);
	    var body=document.createElement("tbody");//$("<tbody class=''></tbody>");
	    table.appendChild(body);
	    this.grid_container.appendChild(div);
            grid.element=div;
            grid.sorted=false;
        },
        addCol:function(col){
            var that=this,index,r,t,rows;
            var was_hidden=this.isHidden();
            if(this.grids.length !== 0){  //adding a column after creation
                //check that the col does not already exist
                for(var i=0;i<this.cols.length; i++){
                    if(this.cols[i].name === col.name){
                        throw new Error("DisplayGrid: cannot add column with duplicate name " + col.name);
                    }
                }
            }
            var check_opts=function(c){
                if(!c.name){
                    throw new Error("column must have a name");
                }
                if(!c.type && !c.field){
                    throw new Error("displayGrid: column must have type or field");
                }
     
            };

            if(Apoco.type["integer"].check(col)){
                index=col;
                col=this.cols[index];
                check_opts(col);
            }
            else{ // adding a column after creation
                check_opts(col);
                index=this.getColIndex(col.name);
                if(index===null){
                    index=this.cols.length;
                    this.cols[index]=col;
                }
                else{
                    throw new Error("Columns must have unique names");
                }
                if(!was_hidden){
                    Apoco.popup.spinner("true");
                    this.hide(); // hide whilst adding column
                }
            }
 
            if(this.grids){ // add the rows with null value for a new col - only after grids have already been created - (initially addCol is called in execute before the grids have been created) 
                for(var i=0;i<this.grids.length;i++){
                    rows=this.grids[i].rows;
                    if(rows){
                        for(var j=0;j<rows.length;j++){
                            t=Object.keys(rows[j])[0];
                            r=rows[j][t].element.parentNode;
                            rows[j][col.name]=null;
                            this._addCell(rows[j],col,r);
                        }
                    }
                }
            }  
	    if(this.cols[index].hidden !== true){
		//console.log("grid col " + this.cols[index].name);
		var label=(this.cols[index].title)?this.cols[index].title:this.cols[index].name;
                var h=document.createElement("div");
                var s=document.createElement("span");
                h.setAttribute("name",this.cols[index].name);
                h.appendChild(s);
                (this.cols[index].type)?h.classList.add(this.cols[index].type):h.classList.add(this.cols[index].field);
                s.textContent=label;
		this.cols[index].element=h;
                if(this.userSortable !== undefined){
                    for(var i=0;i<this.userSortable.length;i++){
                        if(this.userSortable[i] === this.cols[index].name){
                            if(Apoco.isSortable(this.cols[index].type)){
        	                this.cols[index].sortable=true;                    
                            }
                        }
                    }
                }
		if(this.cols[index].sortable){
                    var dec=document.createElement("div");
                    dec.classList.add("arrows");
                    var up=document.createElement("span");
                    up.classList.add("up");
                    var down=document.createElement("span");
                    down.classList.add("down");
		    dec.appendChild(up);
		    dec.appendChild(down);
		    h.appendChild(dec);

		    dec.addEventListener("click",function(col,that){
		        return function(e){
                            var dir;
                            if(e.target.tagName === "SPAN"){
                                if(e.target.classList.contains("up")){
                                    dir="up";
                                }
                                else{
                                    dir="down";
                                }
                                e.stopPropagation();
                                e.preventDefault();
                                that.sortOrder=that._mkSortOrder([col.name]);
                                that.sort(dir);
                                that.redrawRows();
                                //console.log("got that.cols " + col.name);
			    }
		        };
		    }(this.cols[index],that),false);  // col is + 1 for first row outside for loop +1 for index starts at 1 -
                }
 		this.colElement.appendChild(h);
	//	if(this.cols[index].hidden){
	//	    h.visibility="hidden";
        //		}
	    }
            
            if(!was_hidden){
                Apoco.popup.spinner(false);   
                this.show();
            }
        },
        rowEditPopup: function(row,buttons,override){
            var b,d,that=this,p={},label,
                settings={draggable: true,
                          components:[]
                         };
          //  console.log("this DOM is " + this.DOM);
            if(Apoco.type["string"].check(this.DOM)){
                settings.DOM=this.DOM;
            }
            else{  // is this.DOM a html element - if so get id
                settings.DOM=this.DOM.id;
            }
        //    console.log("rowEditPopup: got row %j",row);
            if(override && !Apoco.type["object"].check(override)){ // do we have edit overrides
                throw new Error("rowEditPopup: edit override should be an object not %j ",override);
            }
            settings.id="rowEditPopup";
            b=document.getElementById(settings.id);
            if(document.contains(b)){
                //throw new Error("rowEditpopup: this element already ecists" + settings.id);
                b.parentNode.removeChild(b);
               // return null;
            }
  //          console.log("got edit overrides %j",override);
  
            for(var i=0; i<this.cols.length;i++){
                p={};
                label=(this.cols[i].titile)?this.cols[i].title: this.cols[i].name;
                for(var k in this.cols[i]){
                    if(this.cols[i].hasOwnProperty(k) && k !== "element"){
                            p[k]=this.cols[i][k];
                    }
                }
                if(!p.label){
                    p.label=label;
                }
                p["value"]=row[this.cols[i].name].value;
                settings.components[i]=p;
            }
          
            
            for(var i=0;i<settings.components.length;i++){
                for(var k in override){
                    if(settings.components[i].name === k){
                        for(var m in override[k]){
                            settings.components[i][m]=override[k][m];
                        }
                    }
                }
            }     
             
            if(buttons && Apoco.type["object"].check(buttons)){
                settings["buttons"]=buttons;
            }
    //        console.log("+++++ adding form with settings %j",settings);
            var f=Apoco.display["form"](settings);
            return f;
            
        },
        deleteCol:function(name){
            var el,index=this.getColIndex(name);
            //var was_hidden=this.isHidden();
            if(index>0){
                //chepck that the col is not used as unique key or sortOrder
                for(var i=0;i<this.sortOrder.length;i++){
                    if(this.sortOrder[i] == name){
                        throw new Error("Cannot delete col used for sorting");
                    }
                }
                // remove the associated rows
                for(var i=0;i<this.grids.length;i++){
                    for(var j=0;j<this.grids[i].rows.length;j++){
                        el=this.grids[i].rows[j][name].getElement();
                        el.parentNode.removeChild(el);
                        el=null;
                        delete this.grids[i].rows[j][name];
                    }
                }
                // remove the col from the DOM
                this.colElement.removeChild(this.cols[index].element);
                this.cols[index].element=null;
                // remove the original data copied into col.options
                this.cols.splice(index,1);
            }
            else{
                throw new Error("cannot find column " + name);
            }
        },
	getColIndex: function(name){
            if(name === undefined){
                return null;
            }
	    for(var i=0; i< this.cols.length;i++){
		if (this.cols[i].name === name){
		    return i;
		}
	    }
	    return null;
	},
	getCol: function(name){ //grid_name){
	    // console.log("getting columns");
	    //var index=-1,col=new Array;
            if(name !== undefined){
	        for(var i=0;i< this.cols.length;i++){
	            //	console.log("col is " + this.cols[i].name);
		    if(this.cols[i].name == name){
		        return(this.cols[i]);
		    }
	        }
      	    }
            return this.cols;
 	},
        _addCell:function(row,col,r){
            var c,type,settings={};
     
            for(var k in col){
                settings[k]=col[k];
            }
            if(row[col.name] === undefined){  // row[col_name] can be null
                if(this.required === true){
                   throw new Error("Field " + col.name + "is required");
                }
                row[col.name]=null;
            }
	    //console.log("value is " + row[col_name]);
	    settings.value=row[col.name];
  	    c=document.createElement("td");
            (col.type)?c.classList.add(col.type):c.classList.add(col.field);
            if(col.editable === false){
                row[col.name]=Apoco.field["static"](settings,c);
            }
            else if(col.field !== undefined){
                row[col.name]=Apoco.field[col.field](settings,c);
            }
            else{ 
               row[col.name]=Apoco.field[Apoco.type[col.type].field](settings,c);
            }
            
            if(col.hidden !== true){  //only put in DOM if not hidden
		r.appendChild(row[col.name].element);
            }
        },
        _addRowElementData:function(row_data,el){  // only add the uniqueKey whose values don't change 
            var s,c;
            if(!this.uniqueKey){
                return;
            }
            if(!row_data){
                throw new Error("DisplayGrid:No data ");
            }
            if(!el){
                throw new Error("DisplayGrid: element is undefined");
            }
            if(el.tagName !== "TR"){
                throw new Error("Can only add data to a row element");
            }
            //el.dataset={};
           
            for(var i=0;i< this.uniqueKey.length;i++){
                //  console.log("ADD row has unique key " + this.uniqueKey[i]);
                // console.log("ADD row has unique key value is " + row_data[this.uniqueKey[i]].value);
                if(row_data[this.uniqueKey[i]]){
                    s="data-";
                    s=s.concat(this.uniqueKey[i]);
                        el.setAttribute(s,row_data[this.uniqueKey[i]].value);
                }
            }
            
            if(this.groupBy){
                s="data-";
                s=s.concat(this.groupBy);
                el.setAttribute(s,row_data[this.groupBy].value);
            }
            for(var i=0; i<this.uniqueKey.length;i++){
                s="data-";
                s=s.concat(this.uniqueKey[i].toString());
                c=el.getAttribute(s);
               // console.log("ADD addRowElementData got data %j" , c);
            }
        },
        getRowFromElement: function(element){  
            var s,c,ci,key={},g,need_more_data=false;
            if(!this.uniqueKey){
                return null;
            }
            if(element.tagName === "TD"){
                c=element.parentNode;  // get the row
            }
            for(var i=0;i<this.uniqueKey.length;i++){
                s="data-";
                s=s.concat(this.uniqueKey[i]);
              //  console.log("getRowFromElement: uniqueKey is " + this.uniqueKey[i] + " attribute " + s);
                c=element.getAttribute(s);
            //    console.log("Rowfromelement got data " + c);
                key[this.uniqueKey[i]]=c;
             /*  for(var k in c){
                    console.log("getRowFromElement got key " + k + " with value  " + c[k]);
               }*/
            }
            if(this.groupBy){
                s='data-';
                s=s.concat(this.groupBy);
                g=element.getAttribute(s);
            }
            // if the sortOrder is the same as uniqueKey - solution is trivial
            for(var i=0;i<this.sortOrder.length;i++){
                if(this.sortOrder[i] !== this.uniqueKey[i]){
                    need_more_data=true;
                }
            }
            if(!need_more_data){
                var r=this.getRow(key,g);
                return r;
            }
            // get the cell data from the DOM
            c=element.childNodes;
            
            for(var i=0;i<this.sortOrder.length; i++){
                if(!key[this.sortOrder[i]]){
                    for(var j=0; j<c.length; j++){
                        if(c[j].getAttribute("name") === this.sortOrder[i]){
                            for(var k=0;k<this.cols.length;k++){
                                if(this.cols[k].name === this.sortOrder[i]){
                                    if(this.cols[k].editable === false ){  // value is in static span tex
                                        ci=c[j].getElementsByTagName("span");
                                        if(ci[0].textContent === ""){
                                            key[this.sortOrder[i]]=null; // because value is null
                                        }
                                        else{
                                            key[this.sortOrder[i]]=ci[0].textContent;
                                        }
                                        break;
                                    }
                                    // is there an input node ....?
                                    ci=c[j].getElementsByTagName("input");
                                    if(ci && ci.length === 1){
                                        key[this.sortOrder[i]]=ci[0].value;
                                        break;
                                    }
                                    return null; // can't find it
                                }
                            }
                        }
                    }
                }
            }
            var r=this.getRow(key,g);
            return r;
        }, 
        _mkRow:function(row_data){
            var r=document.createElement("tr");
         
            for(var k=0;k<this.cols.length;k++){
                //   console.log("adding cell");
                this._addCell(row_data,this.cols[k],r);
            }
            this._addRowElementData(row_data,r); // put the data onto the element
            return r;
        },
        _insertRow:function(row_data,r,grid){
            var row=null,e,t,key={},closest={val: -1};
            for(var i=0;i<this.sortOrder.length;i++){
                key[this.sortOrder[i]]=row_data[this.sortOrder[i]].value;
            }
            row=this.getRow(key,grid.name,closest);
            //  console.log("grid element is %j ", closest.val);//grid.rows[index]);
            //  console.log("slosest index is " + closest.index);
            t=Object.keys(grid.rows[closest.index])[0];
            //  console.log("key is " + t);
            if(closest.dir === "after"){
                closest.index++;  // check not stepping off end of array
                if(closest.index >= grid.rows.length ){
                    grid.rows.push(row_data);
                    grid.element.getElementsByTagName("tbody")[0].appendChild(r);
                }
                else{
                    e= grid.rows[closest.index][t].element;
                    e.parentNode.insertBefore(r,e.nextSibling); // insert after e
                    grid.rows.splice(closest.index,0,row_data); //insert row
                }
            }
            else{
                // grid.rows.splice(closest.index,0,row_data);
                e=grid.rows[closest.index][t].element;
                e.parentNode.insertBefore(r,e); // insert the element
                grid.rows.splice(closest.index,0,row_data);
            }
        },
        addRow: function(row_data){
	    var row=null,r,grid,name,t,sortOrder=[],e,key={};
            var closest={val:-1},l=this.grids.length;
         
	    if(this.groupBy){
                if(row_data[this.groupBy] === undefined){
		    throw new Error("Cannot add row - no field in row data matches " + this.groupBy);
		}
                name=row_data[this.groupBy];
	    }
	    else{
                name="all";
	    }
            t=this.getGrid(name);
            if(t === null){  // no grid for this group has been created
                this.grids[l]={name:name,rows:[]};
                t=this.addGrid(this.grids[l]);
                if(t=== null){
                    throw new Error("DisplayGrid: Could not create grid " + name);
                }
            }
            grid=this.getGrid(name);
          //  console.log("addRow grid is " + grid);
            if(grid===null || grid === undefined){  // create a new grid
                throw new Error("DisplayGrid: addRow grid is not defined");
            }
            
            if(this.uniqueKey[0] === "_aid"){  // add the unique key to the row
                row_data["_aid"]=this.idKey;
                this.idKey++;
            }
            r=this._mkRow(row_data);
                        
            if(!grid.sorted){
                if(grid.rows.length===0){
                    grid.sorted=true; // grid has just been created
                }
             //   console.log("adding row to end");
                grid.rows.push(row_data);
                grid.element.getElementsByTagName("tbody")[0].appendChild(r);//.find("tbody").append(r);
            }
            else{
                this._insertRow(row_data,r,grid);
            }
            return row_data;
        },
        deleteRow:function(key,group){
            var closest={},g,parent,el;
            var row=this.getRow(key,group,closest);
            if(row === null){
                throw new Error("deleteRow: cannot find row ");
            }
            if(group!==undefined){
                g=this.getGrid(group);
            }
            else if(this.groupBy && key[this.groupBy]){
                g=this.getGrid(key[this.groupBy]);
            }
            else{
                g=this.grids[0];
            }
            if(g===null){
                throw new Error("Cannot find group");
            }
            // remove from dom
            for(var i=0;i<this.cols.length;i++){
              //  console.log("deleting col " + this.cols[i].name);
                if(!row[this.cols[i].name]){
                    throw new Error("row is undefined");
                }
                if(!parent){
                    parent=row[this.cols[i].name].getElement().parentNode;
                }
                if(this.cols[i].hidden !== true){
                    el=row[this.cols[i].name].getElement();
                    el.parentNode.removeChild(el);
                    el=null;
                }
            }
            parent.parentNode.removeChild(parent);
            g.rows.splice(closest.index,1);
        },
        getRow:function(key,group,closest){
            var grid=[],row,sortOrder=[];
 
           // if(!closest && this.sortOrderUnique !== true){
           //     throw new Error("No unique key to find row");
           // }
            if(group && group !== undefined){
                grid[0]=this.getGrid(group);
            }
            else{
                if(this.groupBy && key[this.groupBy] ){
                    grid[0]=this.getGrid(key[this.groupBy]);
                    if(!grid[0]){
                        throw new Error("Cannot find grid " + this.groupBy);
                    }
                }
                else{
                    grid=this.grids.slice(0);
                }
            }
         //   console.log("getRow this.sortOrder length is " + this.sortOrder.length);
         //   console.log("key is %j",key);
            for(var i=0;i<grid.length;i++){
                if(grid[i].name === undefined){
                    throw new Error("grid " + i + "name is " + grid[i].name);
                }
       //         console.log("searching grid ",grid[i].name);
                if(grid[i].sorted){
                    if(this.closest){
                        if(this.sortOrder === undefined){
                            throw new Error("DisplayGrid: getRow sortOrder is undefined");
                        }
                    }
                    else{
                        sortOrder=this.sortOrder;
                        if(this.uniqueKey){
                            for(var j=0;j<this.uniqueKey.length; j++){
                                if(key[this.uniqueKey[j]] === undefined || key[this.uniqueKey[j]]===null){
                                    throw new Error("getRow: key is not unique needs " + this.uniqueKey[j] );
                                }
                            }
                        }
                        else{
                             for(var j=0;j<sortOrder.length; j++){
                                if(key[sortOrder[j]] === undefined || key[sortOrder[j]]===null){
                                    throw new Error("getRow: key is not unique needs " + sortOrder[j] );
                                }
                            }  
                        }
                    }
                    if(grid[i].reverse){
                        grid[i].rows.reverse();
                        grid[i].reverse=false;
                    }
		    row=Apoco.Utils.binarySearch(grid[i].rows,sortOrder,key,closest);
                  //  console.log("binary search returns row " + row);
                    if(row !== null){
                        return row;
                    }
                }
                else{
                     throw new Error("DisplayGrid: grid is not sorted " + grid[i].name);
                }
            }
            return null;
        },
        getChild:function(group){
            return this.getGrid(group);
        },
        getChildren:function(){
            return this.getGrid();
        },
	updateRow: function(cell_data,override_editable){
	    var row,index,g,n,closest={val:-1},resort;
	    if(this.groupBy){
		g=cell_data[this.groupBy];
		if(g === undefined){
                    throw new Error("No subGrid called " + this.groupBy + " in cell update data ");
		}
	    }
	    var grid=this.getGrid(g);
            if(grid.sorted){  // grids have a sort order and have been sorted
                row=this.getRow(cell_data,g,closest);
                if(row === null){
	            throw new Error("UpdateRow: cannot find row");
                }
	    }
	    else{
		// use a dumb way of finding this....
		throw new Error("No method available to find this cell");
	    }
	  //  console.log("UpdateRow: found row %j" ,row);
	    if(row){   // need to check that we are not overwritting a sortOrder key, making sort invalid
		var to,cell,cl;
		for(var k in cell_data){
                    // if this cell is in current sort order grid may now be unsorted
                    if(row[k].editable !== false || override_editable === true){  // need to force update --- see rowEdit override !!!!
 		        row[k].setValue(cell_data[k]);  
		        if(row[k].hidden !== true){
                            cl="cell_updated";
                            cell=row[k].getElement();
			    if(cell.classList.contains(cl)){  // add colours to the cells to show update frequency
			        cell.classList.remove(cl);
                                cell.classList.add("cell_updated_fast");
			        cl="cell_updated_fast";
			    }
			    else{
			        row[k].getElement().classList.add(cl);
			    }
			    if(to){ clearTimeout(to);}
			    to=setTimeout(function(){
			        row[k].getElement().classList.remove(cl);},15000);
		        }
		    }
                }
                for(var i=0;i<this.sortOrder.length;i++){  // do we need to resort the grid
                    if(row[this.sortOrder[i]].getValue() !== cell_data[this.sortOrder[i]] ){
                        resort=true;
                    }
                }
                if(!resort){
                    return;
                }
                grid.rows.splice(index,1);
                this._insertRow(cell_data,row,grid);
            }
	    else{
		throw new Error("No matching entry found in grid data");
	    }
	},
	getGrid: function(name){
            if(!this.grids){
                return null;
            }
	    else if(this.grids.length === 1 ){
		return this.grids[0];
	    }
            if(name !== undefined){
	        for(var i=0;i<this.grids.length;i++){
		    if(this.grids[i].name == name){
		        return this.grids[i];
		    }
	        }
	        return null;
            }
            return this.grids;
	},
        deleteChild:function(grid){
            this.hideGrid(grid);
        },
        deleteChildren:function(){
            var el,row;
            if(this.grids){
                for(var i=0;i<this.grids.length;i++){
                    for(var j=0;j<this.grids[i].rows.length;j++){
                        row=this.grids[i].rows[j];
                        for(var k=0;k<this.cols.length;k++){
                            el=row[this.cols[k].name].element;
                        //    console.log("el is " + el);
                        //    console.log("cell is " + j + " " + k);
                            if(el && el.parentNode){
                                el.parentNode.removeChild(el);
                            }
                        }
                    }
                    this.grids[i].rows.length=0;
                    this.grids[i].element.parentNode.removeChild(this.grids[i].element);
                }
 
            }
            if(this.colElement){
                for(var i=0;i<this.cols.length;i++){
                    if(this.cols[i].element){ // some elements are hidden so not in DOM
                        this.colElement.removeChild(this.cols[i].element);
                    }
                 //   else{
                 //       console.log("no column at " + i);
                 //   }
                }
                if(this.colElement.parentNode){
                    this.colElement.parentNode.removeChild(this.colElement);
                }
            }
            this.cols.length=0;
            this.grids.length=0;
        },
        hideCol:function(name,state){
            var b,current_state=false;
            if(!name){ throw new Error("Grid: hideCol needs a name"); }
            if(!state){state="toggle";}
            
            b=this.getColIndex(name);
            if(b === null){
                throw new Error("grid: hideCol cannot find column called " + name);
            }
            if(this.cols[b].element.classList.contains("hidden")){
                current_state=true;
            }
            if(state === current_state){
                return;  // already in the correct state
            }
            if(state === "toggle"){
                state=(current_state)?false:true;
            }
            
            for(var i=0;i<this.grids.length;i++){
                if(state){
                    this.cols[b].element.classList.add("hidden");
                }
                else{
                    this.cols[b].element.classList.remove("hidden");
                }
                for(var j=0;j<this.grids[i].rows.length;j++){
                    if(state){
                        this.grids[i].rows[j][name].element.classList.add("hidden");
                    }
                    else{
                        this.grids[i].rows[j][name].element.classList.remove("hidden");
                    }
                }
            }
        },
	deleteAll:function(){
            this.deleteChildren();
           
        },
	showGrid: function(name){
            var g;
            var p=this.element.querySelector("div.grid_content");
	    if(this.grids.length === 1 || name === undefined){
		name="all";
	    }
	    //console.log("show grid is here");
	    for(var i=0; i< this.grids.length;i++){
                g=this.grids[i];
                if(document.contains(this.grids[i].element)){
		    p.removeChild(g.element);
                }
		if(g.name == name || name == "all"){
                    if(!document.contains(g.element)){
		       p.appendChild(g.element);
                    }
		}
	    }
	},
	hideGrid: function(name){
	    if(this.grids.length === 1){
		name="all";
	    }
	    for(var i=0; i< this.grids.length;i++){
		if(this.grids[i].name == name || name == "all"){
		    this.grids[i].element.visibility="hidden";
		}
	    }
	},
	redrawRows: function(grid_name){
            var b,g,p,name,grids=[];
	    if(!grid_name){
	        grids=this.grids;
	    }
            else{
                grids[0]=this.getGrid(grid_name);
                if(!grids[0]){
                    throw new Error("DisplayGrid: cannot find grid named " + grid_name);
                }
            }
            //find the col that has an element i.e not hidden
            for(var i=0;i<this.cols.length;i++){
                if(this.cols[i].hidden !== true){
                    name=this.cols[i].name;
                    break;
                }
            }
            if(!name)throw new Error("DisplayGrid: Cannot find col that is not hidden");
            for(var i=0;i<grids.length;i++){
	        b=grids[i].element.getElementsByTagName("tbody")[0];
	        b.innerHTML="";
                /*   while (b.firstChild) {
                 b.removeChild(b.firstChild);
                 } */
    	        for(var j=0; j<grids[i].rows.length; j++){
                    p=grids[i].rows[j][name].element.parentNode;
		    b.appendChild(p);
	        }
            }
	},
        getJSON: function(){
            var c,t,m;
            var n={rows:[]};
            for(var i=0;i<this.grids.length; i++){
                m=this.grids[i].rows.length;
                for(var j=0;j<m;j++){
                    t=i*m+j;
                    n.rows[t]={};
                    for(var k=0;k<this.cols.length;k++){
                        c=this.cols[k].name;
                        n.rows[t][c]=this.grids[i].rows[j][c].value;
                    }
                }
            }
            return n;
        }

    };


    Apoco.Utils.extend(ApocoMakeGrid,Apoco._DisplayBase);

    Apoco.display.grid=function(opts,win){
        opts.display="grid";
        return new ApocoMakeGrid(opts,win);
    };
    Apoco.display.gridMethods=function(){
        var ar=[];
        for(var k in ApocoMakeGrid.prototype ){
            ar.push(k);
        }
        return ar; 
    };

})();

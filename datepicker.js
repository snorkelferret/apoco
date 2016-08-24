var Apoco=require('./declare').Apoco;

;(function(){
// ISO 8691
    "use strict";
    //singleton 
    function Datepicker(element){
        var that=this;
        this.days= ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        this.months=[{name:'January',len:31}, {name:'February',len:28}, {name:'March',len:31}, {name:'April',len:30}, {name:'May',len:31},{name: 'June',len:30},{name:'July',len:31},{name:'August',len:31},{name:'September',len:30}, {name:'October',len:31}, {name:'November',len:30}, {name:'December',len:31}];
    };
    Datepicker.prototype={
        init:function(element){
            var that=this;
           // console.log("Datepicker is here");
            // if(element){
           //     console.log("got a paramenter");
           // }
       
            var  click=function(e){
             //   console.log("click is here");
                var pos=[];
                if(that.element === undefined){
                    that.create();
                }
                e.stopPropagation();
                e.preventDefault();
                // if the datepicker is open  close it
                
                // get the date in the input if any
                var date=e.target.value;

                if(that.current_element !== undefined){
               //     console.log("there is a previous click");
                    if(element==that.current_element){ //at least 2 clicks
                 //       console.log("and it was the same element");
                   //     console.log("and the element's  visibility is " + that.element.style.visibility);
                        if(that.element.style.visibility === "visible"){
                     //       console.log("and it is visible- so close it");
                            that.close();
                            return;
                        }
                    }
                }
                that.close(); //close and reopen
                that.current_element=element; 
                var t=that.parseDate(date);               
                if(!t){  // if no date in input node
                    that.selectedDate=new Date();  // set the date to today
                }
                else{
                    that.selectedDate=t;
                    e.target.value=that.dateToString(that.selectedDate);          
                } 

               // console.log("selected date is " + that.selectedDate);
                that.mkCalendarBody();
                var rect = element.getBoundingClientRect();
                // get the position
                //  console.log("init x " + e.clientX + " y " + e.clientY);
                //  console.log("rect right is " + rect.right + " bottom " + rect.bottom);
                // pos=that.getPos(e);
                that.element.style.top=((rect.bottom+window.scrollY).toString() + "px"); //pos[0];
                that.element.style.left=((rect.right+window.scrollX).toString() + "px"); //pos[1];
                that.element.style.visibility="visible";
            };
            var change=function(e){
                var date;
               // console.log("change is here ================");
                date=e.target.value;
                var t=that.parseDate(date);
                if(t){
                    that.selectedDate=t;
                
                    e.target.value=that.dateToString(that.selectedDate);
                    //console.log("selected date is " + that.selectedDate);
                    that.mkCalendarBody();
                }
                else{
                    e.target.value="";
                }
            };
            if(element!== undefined){
              //  console.log("++++++++++++++++++++tag name us " + element.tagName);
                if(element.tagName.toLowerCase() !== "input"){
                    throw new Error("datepicker: element must be an input node");
                }
               // console.log("datepicker here");
                element.classList.add("Apoco_datepicker_input");
                element.addEventListener("click",click,false);
                element.addEventListener("change",change,false);
            }
        },
        close:function(){
            if(this.element){
                this.element.style.visibility="hidden";
            }
        },
        parseDate:function(date){
            var p;
            if(date === undefined || date === ""){
               // console.log("parseDate date is undefined");
                return null;
            }
            p=new Date(date);
            if(!p || p<0){
                throw new Error("datepicker: cannot parse this as a date  " + date);
            }
          
            return p;
        },
        mkCalendarHeader:function(date){
            var table,row,body,head,col,title,span,that=this;
            var icons=[{id:"Apoco_datepicker_prevYear",
                        func: function(e){
                            e.stopPropagation();
                            if(that.selectedDate){
                                var f=that.selectedDate.getFullYear()-1;
                                that.selectedDate.setFullYear(f);
                                that.mkCalendarBody(this.selectedDate);
                                var p=that.calendar.querySelector("td.ui-state-active");
                                if(p){
                                    p.classList.remove("ui-state-active");
                                }
                            }
                        }
                       },
                       {id:"Apoco_datepicker_prevMonth",
                        func:function(e){
                            e.stopPropagation();
                            if(that.selectedDate){
                                var f=that.selectedDate.getMonth()-1;
                                that.selectedDate.setMonth(f);
                                that.mkCalendarBody(that.selectedDate);
                                var p=that.calendar.querySelector("td.ui-state-active");
                                if(p){
                                    p.classList.remove("ui-state-active");
                                }
                            }
                        }
                       },
                       {id:"Apoco_datepicker_nextYear",
                        func:function(e){
                            e.stopPropagation();
                            if(that.selectedDate){
                                var f=that.selectedDate.getFullYear()+1;
                                that.selectedDate.setFullYear(f);
                                that.mkCalendarBody(that.selectedDate);
                                var p=that.calendar.querySelector("td.ui-state-active");
                                if(p){
                                    p.classList.remove("ui-state-active");
                                }
                            }
                        }
                       },
                       {id:"Apoco_datepicker_nextMonth",
                        func:function(e){
                            e.stopPropagation();
                            if(that.selectedDate){
                                var f=that.selectedDate.getMonth()+1;
                                that.selectedDate.setMonth(f);
                                that.mkCalendarBody(that.selectedDate);
                                var p=that.calendar.querySelector("td.ui-state-active");
                                if(p){
                                    p.classList.remove("ui-state-active");
                                }
                            }
                        }
                       }
                      ];
            table=document.createElement("table");
            table.id="Apoco_datepicker_controls";
            table.classList.add("ui-datepicker-header","ui-widget-header","ui-helper-clearfix","ui-corner-all");
            this.element.appendChild(table);
            body=document.createElement("tbody");
            table.appendChild(body);
            row=document.createElement("tr");
            
            body.appendChild(row);
            col=document.createElement("td");
            col.classList.add("arrows");
            row.appendChild(col);
            for(var i=0;i<2;i++){
                span=document.createElement("span");
                span.id=icons[i].id;
                if(i===0){
                    span.classList.add("ui-icon","ui-icon-circle-arrow-w");
                }
                else{
                    span.classList.add("ui-icon","ui-icon-circle-triangle-w");
                }
                span.addEventListener("click",icons[i].func,false);
                col.appendChild(span);
            }
            title=document.createElement("td");
            title.id="Apoco_datepicker_title";
            title.classList.add("ui-datepicker-title");
            row.appendChild(title);
            col=document.createElement("td");
            col.classList.add("arrows");
            col.style.float="right";
            row.appendChild(col);
            for(var i=2;i<icons.length;i++){
                span=document.createElement("span");
                span.id=icons[i].id;
                if(i===2){
                    span.classList.add("ui-icon","ui-icon-circle-arrow-e");
                    //"ui-icon-seek-next");
                }
                else{
                    span.classList.add("ui-icon","ui-icon-circle-triangle-e");
                }
                span.addEventListener("click",icons[i].func,false);
                col.appendChild(span);
            }
            this.calendar=document.createElement("table");
            this.calendar.id="Apoco_datepicker_grid";
            this.element.appendChild(this.calendar);
            body=document.createElement("tbody");
            this.calendar.appendChild(body);
            row=document.createElement("tr");
            body.appendChild(row);
            for(var i=0;i<this.days.length;i++){
                col=document.createElement("th");
                col.textContent=this.days[i];
                row.appendChild(col);
            }
            var selectDay=function(e){
                var day,s,p;
               // console.log("selectDay is here");
              //  console.log("target type is " + e.target.type);
              //  console.log("target classlist " + e.target.classList.contains("Apoco_date"));
                if(e.target.classList.contains("Apoco_date")){
                    day=e.target.textContent;
                //    console.log("got day " + day);
                    e.stopPropagation();
                    e.preventDefault();
                    //find the previous selection
                    p=that.calendar.querySelector("td.ui-state-active");
                    if(p){
                        p.classList.remove("ui-state-active");
                    }
                    e.target.classList.add("ui-state-active");
                    //e.target.siblings.classList.remove("ui-state-active");
                    that.selectedDate.setDate(day);
                    s=that.dateToString(that.selectedDate);
                    
                    that.current_element.value=s;
                  //  console.log("setected day is " + that.selectedDate);
                }
            };
            this.calendar.addEventListener("click",selectDay,false);
        },
        dateToString:function(date){
            var y,m,s,d;
            y=(date.getFullYear()).toString();
            m=(date.getMonth() + 1);
            d=date.getDate();
            if(m<10){
                m=("0" + m ).toString();
            }
            if(d<10){
                d=("0" + d).toString();
            }
            s=(y + "-" + m + "-" + d);
            return s;
        },
        mkCalendarBody:function(){
            var c,r,last_day,s;
           // console.log("mkCalendarBody: selected Date is " + this.selectedDate);
            var current_month=this.selectedDate.getMonth();
            var prev_month=(current_month === 0)?11:current_month-1;
            var next_month=(current_month+1)%12;
            var current_year=this.selectedDate.getFullYear();
            var day=this.selectedDate.getDate();
            var t=new Date(),today=-1;
            // is today included in the calendar
           // console.log("today's year is " + t.getFullYear() + " and current " + current_year);
           // console.log("today's month is " + t.getMonth() + " and current " + current_month);              
            if(t.getFullYear() === current_year){
                if(t.getMonth() === current_month){
                    today=t.getDate();
                    console.log("today is " + today);
                }
            }
           // console.log("mkCalendarBody this.calendar is " + this.calendar);
            
            // fill in the title
            c=document.getElementById("Apoco_datepicker_title");
            c.textContent=(this.months[current_month].name + " " + current_year).toString();
            //remove the previous body if it exists
            var tbody=this.calendar.getElementsByTagName("tbody")[0];
            r=tbody.getElementsByTagName("tr")[0]; //week names
            //console.log("length of rows is " + r.length);
            while(tbody.firstChild){
                tbody.removeChild(tbody.firstChild);
            }
            // put the week names back
            tbody.appendChild(r);
            // what day of the week does the current month start on?
            //console.log("current year " + current_year + " current_month " + current_month);
            if((current_month+1) > 9){
                s=(current_year.toString() + "-" + (current_month+1).toString() + "-01");
            }
            else {
                s=(current_year.toString() + "-0" + (current_month+1).toString() + "-01");
            }
           // console.log("s is " + s);
            var start_day=new Date(s).getDay();
            //console.log("start_day is " + start_day);
            if(start_day !== 0){ // need to get the prev month
                if(prev_month === 1){ // February - need to see if its a leap year
                    last_day=this.months[prev_month].len;
                    if(current_year%4 === 0){
                        last_day++;
                    }
                }
                else{
                    last_day=this.months[prev_month].len;
                }
            }
            c=Math.ceil((start_day+this.months[current_month].len)/7);
            var len=c*7;
            //console.log("c is " + c + " len is " + len);
            var ml=this.months[current_month].len;
            //howmany days of the previous month do we need to show?
            var p=last_day-start_day+1;
            for(var i=0;i<len;i++){
               // console.log("making day " + p);
                if(i%7 === 0){
                    r=document.createElement("tr");
                    tbody.appendChild(r); 
                }
                c=document.createElement("td");
                if(i<start_day){
                    c.className="ui-state-disabled";
                }
                else if (i=== start_day){
                    p=1;
                    c.classList.add("Apoco_date");
                }
                else if(i=== ml+start_day){
                    p=1;
                    c.className="ui-state-disabled";
                }
                else if(i>(ml+start_day)){
                    c.className="ui-state-disabled";
                }
                c.textContent=p;
                if(i>=start_day && i<(ml+start_day) ){
                    c.classList.add("Apoco_date");
                    if(p=== today){ 
                        c.classList.add("ui-state-highlight");
                    }
                    if(p===day){
                        c.classList.add("ui-state-active");
                    }
                }
                r.appendChild(c);
                p++;
            }
        },
      
       	create:function(){
	    if (this.element=== undefined) {
		this.element = document.createElement('div');
		//this.element.onselectstart = function () { return false; };
		this.element.id = "Apoco_datepicker";
                this.element.classList.add("ui-datepicker","ui-widget-content","ui-corner-all");
		document.getElementsByTagName("body").item(0).appendChild(this.element);
                this.mkCalendarHeader();
	    }
            this.format="YYYY-MM-DD";  // e.g 2020-10-23
            this.selectedDate=Date();
	}
    };        
   // console.log("Making datepicker");
    
    Apoco.datepicker=new Datepicker(); 
    
})();


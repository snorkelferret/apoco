//var Apoco=require('../../declare').Apoco;
var Apoco=require('../../declare').Apoco;
global.UI={};


UI.Panels={
    TestPanel:{
        name: "TestPanel",
        components: [
	    {display: "fieldset",
	     DOM: "test",
	     id: "Create",
	     components:[{ field: "select", name: "selection_dropdown", options: [ "Blotter","Broker","Bigfig","Auction-control","Trades","robo-broker","knock-down-ginger","auction"]},
                         { node: "button", name: "create_window",text: "new",
			   action: function(that){
			       var h=that.parent.getChild("selection_dropdown").getValue();
                               if(Apoco.Panel.inList(h) === null){
                                   var p=Apcoc.Panel.add(h);
                               }
                           }
                         },
                         { node: "button",name: "logout",text: "logout",
                           action: function(that){
                               Apoco.stop();
                               }
                         }]
            }
	]
    }
};




off=${1:-1}
last=${2:-100}
file=${3:-"data.js"}
alpha=(A B C D E F G H I J K L M N O P Q R S T U V W X Y Z)
rm  $file
echo "" > $file
echo "window.data={ DOM: \"Content\",
     	     sortOrder: [\"maturity\",\"stock\"],
	     object: \"Blotter\",
	     id: \"Blotter\",
	     display: \"grid\",
      	     groupBy: \"subclass\", 
	     uniqueKey: [\"stock\"],
             cols: [ {name: \"stock\",type: \"string\",editable: false}, 
	       	     {name:\"bid\",type: \"float\",editable: false,step: 0.1,precision: 3,required: false},
                     {name: \"offer\",type: \"float\",editable: false, step: 0.1,precision: 3,required: false},	
                     {name:\"client_bid\",type:\"integer\",editable: false,required: false},              
	       	     {name: \"volume_bid\",type: \"integer\",editable: false,required: false},
	       	     {name: \"volume_offer\",type: \"integer\",editable: false,required: false},
                     {name:\"client_offer\",type:\"integer\",editable: false,required: false},              
                     {name: \"maturity\",type: \"date\",editable: false,display: false},           
	       	     {name: \"subclass\",type:\"integer\",editable: false,display: false}
	       	     
		    ],
	    rows:[	
		  
     " > $file

while test $off -le $last; do


   # make a string for the stock name
   slow=$(echo "scale=0; $off/(26*26)" | bc -l);
   ff=${alpha[$slow]}

   tick=$(echo "scale=0; $off/26" | bc -l);
   if test $off -ge 676 ; then
      tick=$(echo "scale=0; ($off-676)/26" | bc -l);
   fi

   ft=${alpha[$tick]}

   
   mod=$RANDOM
   #index=`expr $mod % 26`; 

   #echo $index  
   #ttt=${alpha[$index]}
   index=`expr $off % 26`;
   ttt=${alpha[$index]};
   stock=$ff$ft$ttt;

    cl=$RANDOM
   # client_bid=`expr $cl % 24`;
    ct=$RANDOM
   # client_offer=`expr $ct % 24`;
 
   number=$RANDOM
   
   mod=$RANDOM
   #volume_bid=`expr $number % 24 + 1`;

   #volume_offe=r`expr $mod % 27 + 1`;

   p=`expr $mod % 7`;
   if test $p -lt 1; then
      bid=$(echo "scale=3; $number/100 + 1" | bc -l);
      #bid=`expr $number % 100 + 1`;
   else
      bid=null;
    fi
    p=`expr $mod % 11`;
   if test $p -lt 1; then
    offer=$(echo "scale=3; $number/102 + 1" | bc -l);
   #   offer=`expr $number % 100 + 1`;
   else
     offer=null;
     fi

   echo "got bid " $bid  " and offer " $offer
   #bid=$(echo "scale=2; $other_num/100" | bc -l)
 
   #make a date field yyyymmdd
   year=`expr $index + 2016`;
   month=`expr $number % 12 + 1`;
   day=`expr $number % 30 + 1`;
   tday=$day
   tmonth=$month
   if test $month -lt 10; then
      tmonth="0"$month
   fi
   if test $day -lt 10; then
      tday="0"$day;
   fi
   subclass=`expr $mod % 13`

   day=`expr $number % 30 + 1`;

   if(test $off -eq $last); then
       echo "{stock:" \"$stock\" ",bid: " $bid " , offer: " $offer ", client_bid: null, volume:[], client_offer:null,maturity:" \"$year"-"$tmonth"-"$tday\" ",subclass:" $subclass "}" >> $file
   else
       echo "{stock:" \"$stock\" ",bid: " $bid " , offer: " $offer ", client_bid: null, volume:[], client_offer:null,maturity:" \"$year"-"$tmonth"-"$tday\" ",subclass:" $subclass "}," >> $file
   fi
  off=`expr $off + 1`;

done 
  echo "]};" >> $file

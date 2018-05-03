window.onload = content;

function content()
{
	
	//used solely to detect whether or not the END-USER's browser is ActiveX compatible or not (only works on IE anyway)
    var ActXo= "ActiveXObject" in window;
	
	//variables intended for reading JSON files
	var dir_sql ="assets/sql/";
	var format =".json";
	var namefile="queries";
	
	var qr; //what the json reading request returns
	var list = document.getElementById("list");//list of queries read in json
	var OptionDiv = document.getElementById("option")
	
	
	//selection contains column names or the name of a stored procedure
	var selection;
	//conditions, or arguments
	var condition;
	//code for additionnal stuff
	var optionCode;
	// details
	var detailCode;
	//additionnal stuff
	var option;

	
	function loadQuery(){
		console.log("loadquery being called !") //used to check if the listener works
		var query = new XMLHttpRequest();
		query.open("GET",dir_sql+namefile+format,true);
		query.onerror = function(){
				status.innerText=("ERROR LOADING JSON");
		};
		query.onload = function() {
			if (query.readyState == 4 && query.status == "200") {
				//needs error handling
				qr = JSON.parse(this.responseText); // See the info.txt file in folder for info about how the json is oragnized
				listen("change",list,prepareQuery); 
				Querylisting();
			}
		};
		query.send(null);
	}
	function prepareQuery(){
		OptionDiv.innerHTML="";
		document.getElementById("result").innerHTML = ""; //clean the div
		OptionDiv.setAttribute("class","");
		document.getElementById("optninfo").innerHTML = "";
		
		var queryOK=true;
	    var index = list.value//is the index of the request in the JSON file
		console.log("With the query having the index : "+index);
	
		//preping the query string 
		if (index !=-1){ // this condition does the job of the placeholder, missing on IE
			try{
				selection=(qr.commands[index].command); 
				condition=(qr.commands[index].rule);
				optionCode=(qr.options[index].option);
				detailCode=(qr.options[index].detail)
				option=""; // this must ALWAYS be reset upon changing query !
				console.log(option);
			}
			catch(error){
				console.log(error);
				queryOK=false;
			}
			finally{
				if (queryOK) {
					if (optionCode=="None"){ //if valid query AND there is no option....
						makedisplayquery();
						status.innerText=("result of the query : "+qr.commands[index].name+" : ");
						console.log("NOoption");
					}
					else{
						OptionHandler(); // will deal with options
						status.innerText=("Waiting options for : "+qr.commands[index].name+" : ");
					}
				}
				else{ //invalid query
					status.innerText=("Invalid query number.");
					res.innerHTML=('<p style="color:red;font-size: large;">NO DATA.</p>');
				}
			}
		}
		else status.innerHTML=("Waiting for a query ..."); //if not placeholder
	}
	function makedisplayquery(){ // NEEDS ERROR CHECKING
			//double check the div is cleared
			document.getElementById("result").innerHTML = ""; 
			//opening the connection
			connection.Open(connectionstring);
			
			if (option!=""){ // displaying what the option string is (you may want to delete that)
				document.getElementById("optninfo").innerText=("("+option+")");	
			}
			
			var rs = new ActiveXObject("ADODB.Recordset"); //The object returned is a Recordset (not a table/string)
			var connectOK=true;
			try{
				rs.Open(selection+" "+condition+" "+option,connection,3); //3 >  static cursor
				console.log("there are  :"+rs.RecordCount+" lines"); // will always return the number of rows in our case.
				rs.MoveFirst 
				var MaxCol=rs.fields.count //to know how many column there are in the query
			}
			catch(error){
				console.log(error);
				connectOK=false;
			}
			finally{
				if (connectOK==true){;
					//we need to ensure the first line contains all our column names
					var colNum=0;
					var headerLine = document.createElement("tr");
					headerLine.setAttribute("id","tableHeader");
					while (colNum<MaxCol){ 
						var headerField = document.createElement("th");
						var colName = document.createTextNode(rs.fields(colNum).name);
						headerField.appendChild(colName); 
						headerLine.appendChild(headerField);
						colNum+=1;
					}
					res.appendChild(headerLine); // adding the headerline to the table.
					
					// filling the table with data
					while(!rs.eof)
					{
						
						colNum=0;
						var line = document.createElement("tr");
						var data;
						
						while (colNum<MaxCol){ //we need to get every field for each line
							var field= document.createElement("td");
							data=document.createTextNode(rs.fields(colNum)); //rs .<...> : fields(X) for column X, start 0. // GetString outputs the table // getrows is broken
							field.appendChild(data); //adding data to a field
							line.appendChild(field); // adding the field to a line
							colNum+=1;
						}
						res.appendChild(line); // adding the line to the table 
					
						rs.movenext;
				
					}
				detailHandler(); //taking care of details if needed
				//end of query, and closing connection.	
				rs.close;
				connection.close;
				}
				else{ // error handling
					status.innerText=("Requête invalide.");
					res.innerHTML=('<p style="color:red;font-size: large;">NO DATA.</p>');
					alert("Can't execute query // INVALID QUERY.");
					connection.close;
				}
			}
	}
	function detailHandler(){
		console.log("DetailHandlerBeingCalled");
		if (detailCode=="color odd"){
				console.log("odd colors !");
				res.setAttribute("class","alt_color");
		}
	}
	//this function  makes sure that the code will work on older and newer versions of the browser
	function listen(event,item,funct) {
		if(item.addEventListener) {
			item.addEventListener(event,funct,false);
			console.log("ADDEVENT");
		}
		else if (item.attachEvent) {
			item.attachEvent("on"+event, funct);
			console.log("ATTACHEVENT");
		}
		else{
		//if both can't be done, the website won't work.
		console.log("NOEVENT");
		alert("UNABLE TO ASSIGN LISTENER !");
		}
	}
	function Querylisting(){ // does the job of listing all the queries in the selector on the page
	var limit=(qr.commands.length-1)
	var i=0;
	while(i<=limit)
			{
				
				var optn = document.createElement("option");
				optn.setAttribute("value",i);
				var data=document.createTextNode(qr.commands[i].name); 
				
				optn.appendChild(data); //adding data to a field
				list.appendChild(optn); // on ajoute la ligne au tableau
				i+=1;
		
			}
			
	
	}
	function OptionHandler(){
		console.log("OptionHandlerBeingCalled");
		OptionDiv.setAttribute("class", "outlined");
		
		if (optionCode==1){  // contains all the elements needed for that one option

	
			
			var date = document.createElement("input");
			date.type = "number";
			date.setAttribute("class", "margin");
			
			var date2 = document.createElement("input");
			date2.type = "number";
			date2.setAttribute("class", "margin");
			
			var text = document.createElement("p");
			var optName = document.createTextNode("select periods for comparison");
			text.appendChild(optName);
			text.setAttribute("class", "margin");
			
			var textEx = document.createElement("p");
			var optEx = document.createTextNode("ex : 2018 means 2018-2019");
			textEx.appendChild(optEx);
			textEx.appendChild(optEx);
			textEx.setAttribute("id", "example");
			
			var submit = document.createElement("input");
			submit.type = "submit";
			submit.value = "Submit";
			submit.setAttribute("class", "margin");
			
			OptionDiv.appendChild(text);
			OptionDiv.appendChild(textEx);
			
			OptionDiv.appendChild(date);
			OptionDiv.appendChild(date2);
			
			OptionDiv.appendChild(submit);
			
			listen("click",submit,Option1);
			
			function Option1(){
				
				//the third string is now filled 
				option=(Number(date.value)+","+(Number(date.value)+1)+","+Number(date2.value)+","+(Number(date2.value)+1)+";");
				status.innerText=("Result of the query : "+qr.commands[list.value].name+" : ");
				makedisplayquery(); // option handled
			}
		}
		else {
			OptionDiv.innerText=("Unhandled Option");
		}
	}
	if(!ActXo){ //May not anyway work if the security settings aren't proprely set... be sure to turn of compatibility mode for local websites
		alert(" please use an ACTIVEX-able browser ");
		
		
	}else {
		
		//variables used for interaction with HTML
		var status= document.getElementById("status");
		var res = document.getElementById("result");
		
		// All the info needed to connect to the Database
		var connection = new ActiveXObject("ADODB.Connection") ;
		var source=''; //Address, or name of the machine, where your database is located
		var BDD=''; // Database name
		var user=''; // the name of the user/account used to run the SQL queries
		var password=''; //your password here
		var provider=''; //something like "SQLOLEDB"
		
		var connectionstring="Data Source="+source+";Initial Catalog="+BDD+";User ID="+user+";Password="+password+";Provider="+provider;
		
		status.innerHTML=("Waiting for a query ...");
		
		loadQuery(); // calls other functions subsequently.
		
		
	}
}
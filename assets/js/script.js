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
	var controlDiv = document.getElementById("controlBoard");//hiding controls until authentification is completed (less clutter)
	controlDiv.style.display = "none";
	
	//number of queries contained in one command in the json
	var iteration;
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
	//contains information requiered to access a database
	var connectionString;

	
	function loadQuery(){
		console.log("loadquery being called !") //used to check if the listener works
		var query = new XMLHttpRequest();
		query.open("GET",dir_sql+namefile+format,true);
		query.onerror = function(){
				status.innerText=("ERROR LOADING JSON");
		};
		query.onload = function() {
			if (query.readyState == 4 && query.status == "200") {
				var listOK = true;
				try{
				qr = JSON.parse(this.responseText); // See the info.txt file in folder for info about how the json is oragnized
				}
				catch(error){
				status.innerHTML=("Failed to load the query list.");
				listOK = false;
				}
				finally{
					if (listOK == true){
					listen("change",list,prepareQuery); 
					Querylisting();
					}
				}
			}
			refresh(); // adds the refresh button
		};
		query.send(null);
	}
	function prepareQuery(){
		OptionDiv.innerHTML="";
		document.getElementById("resultat").innerHTML = ""; //clean the div
		OptionDiv.setAttribute("class","");
		document.getElementById("optninfo").innerHTML = "";
		
		var queryOK=true;
	    var index = list.value//is the index of the request in the JSON file
		console.log("With the query having the index : "+index);
	
		//preping the query 
		if (index !=-1){ // this condition does the job of the placeholder, missing on IE
			try{
				iteration=(qr.options[index].iteration);
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
						iterate();
						console.log("pasoption");
					}
					else{
						OptionHandler(); // will deal with options
					}
				}
				else{ //invalid query
					status.innerText=("Incorrect Query Number");
					res.innerHTML=('<p style="color:red;font-size: large;">NOTHING TO DISPLAY.</p>');
				}
			}
		}
		else status.innerHTML=("Waiting for request ..."); //if not placeholder
	}
	function makedisplayquery(){
			//opening the connection
			connection.Open(connectionString);
			
			//needs error checking
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
					
					// headache - they wanted a space between hundreds and thousands
					var formnum = new RegExp(/\B(?=(\d{3})+(?!\d))/g); //searches for patterns of three numbers in a row with some extra precisions
					var checknum = new RegExp(/^ *([0-9]+,?[0-9]*) *$/) // matches any number with or without a , and with spaces before / after
					
					// filling the table with data
					while(!rs.eof){
						
						colNum=0;
						var line = document.createElement("tr");
						var data;
						
						while (colNum<MaxCol){ //we need to get every field for each line
							var field= document.createElement("td");
							data=document.createTextNode(rs.fields(colNum)); //rs .<...> : fields(X) pour la colonne X, partant de 0. // GetString donne la table entière // GetRows(nblignes/début/colonne(s)) permet de choisir une ou des lignes.
							//data=data.replace(/./g,","); -- did not work as expected
							field.appendChild(data); //adding data to a field
							
															
							//pending for removal
							//console.log(field.innerHTML)
							//console.log(field.innerHTML.length+" longueur");
							//console.log(checknum.test(field.innerHTML))
							
							//checking data format before adding it
							if (detailCode!="dots") field.innerHTML=field.innerHTML.replace(/\./g,",");
							if (checknum.test(field.innerHTML)) {
								//gets the match
								var temp = field.innerHTML.replace(checknum,'$1')
								//adds spaces at thousands and hundreds ... (can be replaced with anything else)
								var cut = temp.split(",");
								cut[0] = cut[0].replace(formnum," ");
								temp = cut.join(",");
							
							
								//console.log(temp);
								field.innerHTML=temp
								
							}
							
							//field.innerHTML=field.innerHTML.replace(formnum,' '); // this lines puts a space every 3 numbers for readability's sake, can be replaced by anything else !!carefull with EXCEL compatibility!!
							line.appendChild(field); // adding the field to a line
							colNum+=1;
						}
						res.appendChild(line); // adding the line to the table 
						
						rs.movenext;
				
					}
				// those lines provide spacing between tables for iterations
				var spacer = document.createElement("tr");
				var spacerd = document.createElement("td");
				spacer.appendChild(spacerd);
				spacer.setAttribute("class","spacer");
				spacerd.setAttribute("class","spacer");
				res.appendChild(spacer);
				
				detailHandler(); //taking care of details if needed
				//end of query, and closing connection.	
				rs.close;
				connection.close;
				}
				else{ // error handling
					status.innerText=("Invalid Request");
					alert("One or more requests returned nothing! ");
					connection.close;
				}
			}
	} 
	//add code for handling "details" here
	function detailHandler(){
		res.setAttribute("class","")
		console.log("DetailHandlerBeingCalled");
		if (detailCode=="color odd col"){
				console.log("odd colors !");
				res.setAttribute("class","alt_color");
		}
	}
	//handles whether or not there are multiples query on the specified command
	function iterate(){
		
		//double check the div is cleared
		document.getElementById("resultat").innerHTML = ""; 
		var index = list.value//is the index of the request in the JSON file
		status.innerText=("Result of query '"+qr.commands[index].name+"' : ");
		if (iteration==0){
			makedisplayquery(); // with values already defined
		}
		else{
			makedisplayquery();
			var i=0;
			while (i<iteration){ // needs error checking
				selection=(qr.commands[index].iteration[i].command); 
				condition=(qr.commands[index].iteration[i].rule);
				console.log(qr.commands[index].iteration);
				console.log(condition);
				console.log(selection);
				console.log(i);
				makedisplayquery();
				i+=1
			}	
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
		alert("couldn't attach event// UNAVAILABLE LISTENER");
		}
	}
	function Querylisting(){ // does the job of listing all the queries in the selector on the page
	var limit=(qr.commands.length-1) //gets the number of requests in the JSON file
	
	if (limit <=0 || typeof limit == 'undefined'){ //just in case
		alert("Cannot read the request list, please do check the integrity of the JSON File.");
		}
	else{
	var i=0;
		while(i<=limit){
					
					var optn = document.createElement("option");
					optn.setAttribute("value",i);
					var data=document.createTextNode(qr.commands[i].name); 
					
					optn.appendChild(data);
					list.appendChild(optn);
					i+=1;
			
			}
				
		}
	}
	function OptionHandler(){
		console.log("OptionHandlerBeingCalled");
		OptionDiv.setAttribute("class", "outlined");
		
		if (optionCode=="compareTwoYears"){  // contains all the elements needed for that one option

			var today = new Date();
			var currYear = today.getFullYear();
			console.log("nous sommes en "+currYear);
			
			var date = document.createElement("input");
			date.type = "number";
			date.setAttribute("class", "margin");
			
			var date2 = document.createElement("input");
			date2.type = "number";
			date2.setAttribute("class", "margin");
			
			var text = document.createElement("p");
			var optName = document.createTextNode("Choose two years to compare : ");
			text.appendChild(optName);
			text.setAttribute("class", "margin");
			
			var textEx = document.createElement("p");
			var optEx = document.createTextNode("ex : 2018 corresponds to the 2018-2019 period.");
			textEx.appendChild(optEx);
			textEx.appendChild(optEx);
			textEx.setAttribute("id", "example");
			
			var submit = document.createElement("input");
			submit.type = "submit";
			submit.value = "Envoyer";
			submit.setAttribute("class", "margin");
			
			OptionDiv.appendChild(text);
			OptionDiv.appendChild(textEx);
			
			OptionDiv.appendChild(date);
			OptionDiv.appendChild(date2);
			
			OptionDiv.appendChild(submit);
			
			listen("click",submit,Option1);
			
			option=(Number(currYear)+","+(Number(currYear)+1)+","+Number(currYear-1)+","+(Number(currYear))+";");
			iterate();
			
			function Option1(){
				
				//the third string is now filled 
				option=(Number(date.value)+","+(Number(date.value)+1)+","+Number(date2.value)+","+(Number(date2.value)+1)+";");
				iterate(); // option handled
			}
		}
		else {
			OptionDiv.innerText=("Unhandled Option");
		}
	}
	function refresh(){ //enables the user to refresh a query through a button, will also reset option values
		var ctrl = document.getElementById("controlBoard");
		var Refr = document.createElement("input");
		Refr.type = "submit";
		Refr.value = "actualiser";
		Refr.setAttribute("id", "refresh");
		ctrl.appendChild(Refr);	
		listen("click",Refr,prepareQuery); 
	}
	if(!ActXo){ //May not anyway work if the security settings aren't proprely set... be sure to turn of compatibility mode for local websites
		alert("Please make sure you are using internet Explorer or an Active X able browser.");
		
		
	}else {
		
		//variables used for interaction with HTML
		var status= document.getElementById("status");
		var res = document.getElementById("resultat");
		
		// All the info needed to connect to the Database
		var connection = new ActiveXObject("ADODB.Connection") ;
		var source ='VM-SRV2012-AP'; //Address, or name of the machine, where your database is located
		var BDD='PMI'; // Database name
		var user; // the name of the user/account used to run the SQL queries
		var password; //your password here
		var provider='SQLOLEDB'; //something like "SQLOLEDB"
		
		// variables for password and login
		var userfield= document.getElementById("ID");
		var passwordfield= document.getElementById("PWD");
		var logbutton = document.getElementById("LOG IN");
		listen("click",logbutton,connect);
		
		function connect(){ //tests the connection beforehand
			user=userfield.value;
			password=passwordfield.value;
			connectionString="Data Source="+source+";Initial Catalog="+BDD+";User ID="+user+";Password="+password+";Provider="+provider;
			var idOK = true;
			try{ //tests connection
			connection.Open(connectionString);
			}
			catch(error){
				alert("Incorrect credentials !");
				idOK=false;
			}
			finally{
				if(idOK){ //correct credentials
					var rs = new ActiveXObject("ADODB.Recordset"); //The object returned is a Recordset (not a table/string)
					
					var connectOK=true;
					try{
						rs.Open("select SYSDATETIME();",connection,3);  
					}
					catch(error){
						console.log(error);
						connectOK=false;
						alert("Connection issues !"); //litteraly do nothing
					}
					finally{
						if (connectOK){ //connection works fine
						rs.close;
						connection.close;
						status.innerHTML=("Waiting for request ...");
						
						//hide form and show controls
						document.getElementById("connectionBoard").innerHTML="";
						controlDiv.style.display =  "block";
						status.style.background= "grey";
						
						loadQuery(); // calls other functions subsequently.
						}
					}
				}	
			}
		}
	}	
}

var window = window.this;

window.onload = content;

function content()
{
	
	//used solely to detect whether or not the END-USER's browser is ActiveX compatible or not (only works on IE anyway)
    var ActXo= "ActiveXObject" in window;
	
	
	
	if(!ActXo){
		alert("Please use an ActiveX able Brower ");
		
		//May not work if the security settings aren't proprely set
	}else {
		
		var connection = new ActiveXObject("ADODB.Connection") ;
		var source='-'; //Address, or name of the machine, where your database is located
		var BDD='-'; // Database name
		var user='-'; // the name of the user/account used to run the SQL queries
		var password='-'; //your password here
		var provider='-'; //something like "SQLOLEDB"
		// All the info needed to connect to the Database
		var connectionstring="Data Source="+source+";Initial Catalog="+BDD+";User ID="+user+";Password="+password+";Provider="+provider;
		
		//variables for interaction with HTML
		var status= document.getElementById("status");
		var req = document.getElementById("resultat");
		
		
		connection.Open(connectionstring);
		var rs = new ActiveXObject("ADODB.Recordset"); //The object returned is a Recordset (not a table/string)
		
		//selection should contain column names or the name of a stored procedure
		var selection = "-";
		// condition should always contain conditions, or arguments
		var condition = "-";
		
		//run a query or call a stored procedure here...
		rs.Open(selection+" "+condition,connection,3,2); //3 >  static cursor 2 > SQL query (column names) 
		console.log("-:"+rs.RecordCount+"-"); // will always return the number of rows in our case.
		rs.MoveFirst
		
		
	status.innerText=("Résultat de la requête : ");	
	rs.close;
	connection.close;
	}
	

}
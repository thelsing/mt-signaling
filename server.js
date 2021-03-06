const WebSocket = require('ws');
const port = process.env.PORT || 8080

const wss = new WebSocket.Server({ port });

//all connected to the server users 
var users = {};
var userConnectedTo = {};
  
//when a user connects to our sever 
wss.on('connection', function(connection) {
  
   console.log("User connected. Current connections: ", Object.keys(users).length);
	
   //when server gets a message from a connected user
   connection.on('message', function(message) { 
	  console.log("Got message: ", message);
      var data; 
      //accepting only JSON messages 
      try {
         data = JSON.parse(message); 
      } catch (e) { 
         console.log("Invalid JSON"); 
         data = {}; 
      } 
		
      //switching type of the user message 
      switch (data.type) { 
         //when a user tries to login 
			
         case "login": 

				
            //if anyone is logged in with this username then refuse 
            if(users[data.source]) { 
               sendTo(connection, { 
                  type: "login", 
                  success: false 
               }); 
	       console.log("Login attempt for user: ", data.source, " denied (duplicate). Current connections: ", Object.keys(users).length); 
            } else { 
               //save user connection on the server 
               users[data.source] = connection; 
	       userConnectedTo[data.source] = [];
               connection.name = data.source; 
					
               sendTo(connection, { 
                  type: "login", 
                  success: true 
               }); 
	       console.log("Login attempt for user: ", data.source, " successful. Current connections: ", Object.keys(users).length); 
            } 
				
            break; 
				
         case "offer": 
            //for ex. UserA wants to call UserB 
            console.log("Sending offer from ", data.source, " to ", data.destination); 
				
            //if UserB exists then send him offer details 
            var conn = users[data.destination];
				
            if(conn != null) { 
					
               sendTo(conn, data); 
            } 
				
            break;  
				
         case "answer": 
            console.log("Sending answer from ", data.source, " to ", data.destination); 
            //for ex. UserB answers UserA 
            var conn = users[data.destination]; 
				
            if(conn != null) { 
               sendTo(conn, data); 
            } 
				
            break;  
				
         case "candidate": 
            console.log("Sending candidate from ", data.source, " to ",data.destination); 
            var conn = users[data.destination];  
				
            if(conn != null) { 
               sendTo(conn, data);
            } 
				
            break;  
				
         case "leave": 
            console.log("Disconnecting from", data.source); 
            var conn = users[data.source]; 
				
            //notify the other user so he can disconnect his peer connection 
            if(conn != null) { 
               sendTo(conn, { 
                  type: "leave" 
               }); 
            }  
				
            break;  
				
         default: 
            sendTo(connection, { 
               type: "error", 
               message: "Command not found: " + data.type 
            }); 
				
            break; 
      }  
   });  
	
   //when user exits, for example closes a browser window 
   //this may help if we are still in "offer","answer" or "candidate" state 
   connection.on("close", function() { 
	
      if(connection.name) {       
        delete users[connection.name]; 
	console.log("User disconnected: ", connection.name, " Current connections: ", Object.keys(users).length);
      } else {
	console.log("unknown User disconnected.  Current connections: ", Object.keys(users).length);
      }
   });  
});  

function sendTo(connection, message) { 
   connection.send(JSON.stringify(message)); 
}
console.log("started");

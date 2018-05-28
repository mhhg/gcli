import io from "socket.io-client";
import React from "react";
import ReactDOM from "react-dom";
import App from "./App";
import "./index.css";
import Server from "./config";

// const socket = io.connect('http://127.0.0.1:3000/',
// let Socket = io.connect('http://repo.reglazh.com:5000', {});
// let Socket = io.connect('http://app.reglazh.com:5000', {});
localStorage.setItem("authState", "false");
localStorage.setItem("socketConnected", "false");
let Socket = io.connect(Server.Addr + ":5000", {});

Socket.on("connect", function(str, a, b) {
  
  console.log("[Socket][connection established]");
  
  localStorage.setItem("socketConnected", "true");
  
  ReactDOM.render(<App />, document.getElementById("root"));
  
  Socket.emit("user:auth", localStorage.getItem("superuser"), callbackLogin);
});

// Socket.on("user:auth", function(msg) {
//   console.log("[user:auth] triggered.");

//   Socket.emit("user:auth", localStorage.getItem("superuser"), callbackLogin);
// });

function callbackLogin(stringResponse) {
  let response = JSON.parse(stringResponse);

  console.log("[Socket.callbackLogin] response:", response);

  if (response.code !== 200) {
    console.log(
      "[DEBUG][callbackLogin] unauthorized access. server response: " +
        stringResponse
    );
    localStorage.setItem("authState", "false");
    return;
  }

  localStorage.setItem("superuser", stringResponse);
  localStorage.setItem("authState", "true");
  
  ReactDOM.render(<App />, document.getElementById("root"));
}

// SocketIOClient.on('chat:message', msg => console.log(msg));
// SocketIOClient.emit('chat:message', 'chat:message emit from client!');

export default Socket;

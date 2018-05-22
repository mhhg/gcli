import io from 'socket.io-client';


// const socket = io.connect('http://127.0.0.1:3000/', 
// let Socket = io.connect('http://repo.reglazh.com:5000', {});
// let Socket = io.connect('http://app.reglazh.com:5000', {});
let Socket = io.connect('http://0.0.0.0:5000', {});

Socket.on("connect", function(str, a, b) {
  console.log("[Socket][connection established]");
  console.log("[Socket] str", str);
  console.log("[Socket] a", a);
  console.log("[Socket] b", b);
});

// SocketIOClient.on('chat:message', msg => console.log(msg));
// SocketIOClient.emit('chat:message', 'chat:message emit from client!');

export default Socket;
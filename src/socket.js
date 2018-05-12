import io from 'socket.io-client';


// const socket = io.connect('http://127.0.0.1:3000/', 
let Socket = io.connect('http://localhost:5000', {});
// let SocketIOClient = io.connect('http://repo.reglazh.com:3000', {});

// SocketIOClient.on('chat:message', msg => console.log(msg));
// SocketIOClient.emit('chat:message', 'chat:message emit from client!');

export default Socket;
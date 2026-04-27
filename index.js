const express = require('express');
const { createServer } = require('node:http');
const { join } = require('node:path');
const { Server } = require('socket.io');

async function main() {

  const app = express();
  const server = createServer(app);
  const io = new Server(server, {
    connectionStateRecovery: {}
  });

  app.use(express.static(join(__dirname)));
  app.get('/', (req, res) => {
    res.sendFile(join(__dirname, 'index.html'));
  });

  io.on('connection', async (socket) => {
    socket.nickname = null;

    socket.on('set nickname', (nickname) => {
      if(!nickname || !nickname.trim()){
        socket.emit('nickname error', `A nickname is needed to join the chatroom`);
        return;
      }

      const taken = [...io.sockets.sockets.values()]
        .some(s => s.nickname === nickname.trim());
      if(taken){
        socket.emit('nickname error', `Too late! "${nickname}" is already taken.`);
        return;
      }

      socket.nickname = nickname;
      socket.broadcast.emit('message', `${nickname} has joined the chat :]`);
      socket.emit('message', `hii ${nickname}, you're now able to chit chat :D`);

      const onlineUsers = [...io.sockets.sockets.values()]
        .map(s => s.nickname)
        .filter(Boolean);
      io.emit('online users', onlineUsers);
    });

    socket.on('typing', () => {
      socket.broadcast.emit('typing', socket.nickname);
    });

    socket.on('stop typing', () => {
      socket.broadcast.emit('stop typing', socket.nickname);
    });

    socket.on('chat message', (msg) => {
      socket.broadcast.emit('chat message', {
        text: msg,
        sender: socket.nickname || 'Anonymous'
      });
    });

    socket.on('private message', ({to, text}) => {
      if(!socket.nickname){
        socket.emit('message', 'please enter a nickname first');
        return;
      }

      const targetSocket = [...io.sockets.sockets.values()]
        .find(s  => s.nickname === to);

      if(!targetSocket){
        socket.emit('message', `there's no "${to}" connected right now`);
        return;
      }

      targetSocket.emit('private message', {
        from: socket.nickname,
        text: text
      });

      socket.emit('private message sent', {
        to: to,
        text: text
      });

    })

    socket.on('disconnect', () => {
      if (socket.nickname){
        io.emit('message', `${socket.nickname} has left the chat :[`);
        io.emit('stop typing', socket.nickname);
        const onlineUsers = [...io.sockets.sockets.values()]
          .map(s => s.nickname)
          .filter(Boolean);
        io.emit('online users', onlineUsers);
      }
    });
  
  });


server.listen(3000, () => {
  console.log('server running at http://localhost:3000');
});
}

main();
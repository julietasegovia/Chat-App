const express = require('express');
const { createServer } = require('node:http');
const { join } = require('node:path');
const { Server } = require('socket.io');
const sqlite3 = require('sqlite3');
const { open } = require('sqlite');

async function main() {
  const db = await open({
    filename: 'chat.db',
    driver: sqlite3.Database
  });

  await db.exec(`
    CREATE TABLE IF NOT EXISTS messages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      client_offset TEXT UNIQUE,
      content TEXT
    );
  `);

  const app = express();
  const server = createServer(app);
  const io = new Server(server);

  app.get('/', (req, res) => {
    res.sendFile(join(__dirname, 'index.html'));
  });

  io.on('connection', async (socket) => {

    socket.on('set nickname', (nickname) => {
      if(socket.nickname)
        return;
      socket.nickname = nickname;
      socket.broadcast.emit('message', `${nickname} has joined the chat :]`);
      socket.emit('message', `hii ${nickname}, you're now able to join the chat :D`);
    });

    socket.on('chat message', async (msg, clientOffset, callback) => {
      let result;
      try {
        result = await db.run(
          'INSERT INTO messages (content, client_offset) VALUES (?, ?)',
          msg, clientOffset
        );
      } catch (e) {
        if (e.errno === 19) callback();
        return;
      }
      socket.broadcast.emit('chat message', { text: msg, sender: socket.nickname || 'Anonymous' }, result.lastID);
      callback(null, result.lastID);
    });

    socket.on('disconnect', () => {
      if (socket.nickname)
        io.emit('message', `${socket.nickname} has left the chat :[`);
    });

    socket.on('typing', () => {
        socket.broadcast.emit('typing', socket.nickname);
    });

    socket.on('stop typing', () => {
        socket.broadcast.emit('stop typing', socket.nickname);
    });
  });

  server.listen(3000, () => {
    console.log('server running at http://localhost:3000');
  });
}

main();
      let counter = 0;

      const socket = io();

      const form = document.getElementById('form');
      const input = document.getElementById('input');
      const messages = document.getElementById('messages');

      let nickname;

      const typing = document.getElementById('typing-indicator');
      let typingTimeout;
      let isTyping = false;
      const typingUsers = new Set();

      const topbar = document.getElementById('topbar');

      input.addEventListener('input', () => {
        if(!isTyping) {
          isTyping = true;
          socket.emit('typing');
        }

        clearTimeout(typingTimeout);
        typingTimeout = setTimeout(() => {
          isTyping = false;
          socket.emit('stop typing');
        }, 1500);
      });

      form.addEventListener('submit', (e) => {
        e.preventDefault();
        if (input.value) {
          const clientOffset = `${socket.id}-${counter++}`;

          renderMessage(input.value, nickname);

          socket.emit('chat message', input.value);

          input.value = '';
        }
      });

      askNickname();

      socket.on('nickname error', (error) => {
        alert(error);
        askNickname();
      })
      
      socket.on('typing', (nickname) => {
        typingUsers.add(nickname);
        updateTypingIndicator();
      });

      socket.on('stop typing', (nickname) => {
        typingUsers.delete(nickname);
        updateTypingIndicator();
      });

      socket.on('online users', (users) => {
        topbar.innerHTML = users.map(user => `
          <span class="online-user">● ${user}</span>
        `).join('');
      })

      socket.on('chat message', ({ text, sender }, serverOffset) => {
        renderMessage(text, sender);
      });

      socket.on('message', (text) => {
        const li = document.createElement('li');
        li.textContent = text;
        li.style.color = 'gray';
        messages.appendChild(li);
      });

      function renderMessage(text, sender) {
        const item = document.createElement('li');

        const mentionsEveryone = /@everyone\b/.test(text);
        const mentionsUser = new RegExp(`@${nickname}\\b`).test(text) || mentionsEveryone;
        if (mentionsUser) item.style.background = '#fff3cd';

        const highlighted = text.replace(/@(\w+)\b/g, '<strong>@$1</strong>');
        item.innerHTML = `<span style = "font-weight: bold">${sender}</span>: ${highlighted}`;
        messages.appendChild(item);
        window.scrollTo(0, document.body.scrollHeight);
      }

      function updateTypingIndicator() {
        if(typingUsers.size === 0)
          typing.textContent = '';
        else if(typingUsers.size === 1)
          typing.textContent = `${[...typingUsers][0]} is typing...`;
        else
          typing.textContent = `${[...typingUsers].join(', ')} are typing...`;
      }

      function askNickname(){
        const name = prompt('Enter your name:');
        if(!name || !name.trim()){
          alert('Nickname cannot be empty');
          return askNickname();
        }
        nickname = name.trim();
        socket.emit('set nickname', nickname);
      }

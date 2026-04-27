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

function escapeHTML(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

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
  if (input.value && input.value.trim()) {
    const message = input.value.trim();
    renderMessage(message, nickname, false);
    socket.emit('chat message', message);
    input.value = '';
  }
});

function whisperTo() {
  const userSpans = document.querySelectorAll('.online-user');
  userSpans.forEach(span => {
    span.style.cursor = 'pointer';
    span.addEventListener('click', () => {
      const username = span.textContent.replace('● ', '');
      if (username !== nickname) {
        const text = prompt(`Whisper to ${username}:`);
        if (text && text.trim()) {
          socket.emit('private message', { to: username, text: text.trim() });
        }
      }
    });
  });
}

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
    <span class="online-user">● ${escapeHTML(user)}</span>
  `).join('');
  whisperTo();
})

socket.on('chat message', ({ text, sender }, serverOffset) => {
  renderMessage(text, sender, false);
});

socket.on('private message', ({ from, text }) => {
  renderMessage(text, from, true);
});

socket.on('private message sent', ({ to, text }) => {
  const li = document.createElement('li');
  li.textContent = `✓ Whisper sent to ${to}: ${text}`;
  li.style.color = '#694a70';
  li.style.fontStyle = 'italic';
  li.style.fontSize = '0.85rem';
  li.style.padding = '0.25rem 1rem';
  messages.appendChild(li);
  window.scrollTo(0, document.body.scrollHeight);
});

socket.on('message', (text) => {
  const li = document.createElement('li');
  li.textContent = text;
  li.style.color = 'gray';
  li.style.padding = '0.3rem 1rem';
  li.style.fontStyle = 'italic';
  messages.appendChild(li);
  window.scrollTo(0, document.body.scrollHeight);
});

function renderMessage(text, sender, isPrivate = false) {
  const item = document.createElement('li');

  const mentionsEveryone = /@everyone\b/.test(text);
  const mentionsUser = new RegExp(`@${nickname}\\b`).test(text) || mentionsEveryone;
  if (mentionsUser) item.style.background = '#fff3cd';

  if (isPrivate) {
    item.style.background = '#f3e5f5';
    item.style.padding = '0.5rem 1rem';
    item.style.margin = '0.25rem 0';
  }

  const privateBadge = isPrivate ? '<span style="background: #9c27b0; color: white; padding: 0.1rem 0.4rem; border-radius: 0.3rem; font-size: 0.7rem; margin-right: 0.5rem;">WHISPER</span>' : '';
  const highlighted = escapeHTML(text).replace(/@(\w+)\b/g, '<strong>@$1</strong>');
  
  item.innerHTML = `${privateBadge}<span style="font-weight: bold">${sender}</span>: ${highlighted}`;
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
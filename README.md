# Simple Chat App
### Why did I make this?
I wanted to learn how to make more responsive websites with deeper back-end. I figured socket.io was a good option to apply server work to the language I'm most comfortable with, JavaScript.
The first hour of this project was setting up Socket.io and following the 'chat-app' tutorial (https://socket.io/docs/v4/tutorial/). The remaining time of the project was spent on adding the features that appear in the 'Homework' part of the tutorial. Each hour (which I assume is how long will each feature take to implement) I will add a section to this readme.

### Nickname implementation
I added the value 'nickname' to the socket in the index.js for the server. Then, I added an alert that asks for the user to insert said 'nickname' value in index.html for the client. I updated the connection and disconnection messages to use the nickname of the connected/disconnected user via `${nickname}`/`${socket.nickname}`. In the index.html, in the value 'sender' of the list, I'll display the sender's nickname and then their message.
This way, each message has their sender identified to prevent misunderstandings.
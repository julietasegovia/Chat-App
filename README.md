# Simple Chat App
### Why did I make this?
I wanted to learn how to make more responsive websites with deeper back-end. I figured socket.io was a good option to apply server work to the language I'm most comfortable with, JavaScript.
The first hour of this project was setting up Socket.io and following the 'chat-app' tutorial (https://socket.io/docs/v4/tutorial/). The remaining time of the project was spent on adding some of the features that appear in the 'Homework' part of the tutorial. Each hour (which I assume is how long will each feature take to implement) I will add a section to this readme.

### Nickname Implementation
I added the value 'nickname' to the socket in the index.js for the server. Then, I added an alert that asks for the user to insert said 'nickname' value in index.html for the client. I updated the connection and disconnection messages to use the nickname of the connected/disconnected user via `${nickname}`/`${socket.nickname}`. In the index.html, in the value 'sender' of the list, I'll display the sender's nickname and then their message.
This way, each message has their sender identified to prevent misunderstandings.

### Typing users
For the server, I just added a 'typing' and 'stopped typing' event. The big changes where made for the client, as I added a div called 'typing-indicator' to the index.html that shows the name/s of whoever is typing right above the messager's input, similar to Discord's. I declared a variable in the script for said indicators timeout, so the code knows when to stop counting an event as 'typing' for each user, and a boolean that shows if the client is typing or not. I decided to stop counting activity as 'typing' after 1.5 seconds of inactivity. Then, I created a function that displays if a single or multiple users are typing. I realized that when the screen is full of messages the typing display overlapped with the last message, so I fixed that too.

### Displaying users online
Again, I added an event called 'online users' to the server's index.js. Whenever a user connects or disconnects, the code creates a new const variable that contains the nicknames of the users that are currently online, then, it emits the event. To the index.html I added simple styling for a topbar to display the online nicknames, and a styling for said nicknames. I then added a topbar div, which I modify later in the script whenever an 'online users' event occurs.

### Mentions
This one was pretty simple at first, it was just adding two conditions to the render of the message, if it mentions @everyone (`@everyone`) or @user (`@${nickname}`). @everyone will highlight the message in yellow to all connected users. @user will only highlight the message to the owner of said nickname.
Testing this i found a bug; If the mentioned user's nickname is contained in another user's nickname (for example, how 'alexcina' contains 'alex') the message will appear highlighted to both users, even though we're only mentioning one user. I fixed this by adding a boundary to the call (`@${nickname}\\b`) so that the nicknames won't match if there's any more text after the nickname ends.

### Nickname Implementation 2
Now that I'm implementing mentions is that I realize that I have nothing stopping different users from using the same nickname. Not only that, I'm also allowing the users to be anonymous, which is not considered in the mentions system. That's why I'll modify the 'set nickname' event so that it doesn't admit repeated names nor null names.
I created a simple validation on the event to ensure there's no white-space only nicknames. Then, I added another condition, I stored the currently-used nicknames in a constant and rejected the entered nickname if it matched with any of the previous ones. The thruthness of any of this conditions will launch a new event called 'nickname error', in which the user will be asked to re-enter nicknames until they enter a valid one. For this reiteration, I created a function called askNickname, which I'll call each time a 'nickname error' is launched. Now, the user isn't allowed to continue without a valid, unique, mentionable nickname.
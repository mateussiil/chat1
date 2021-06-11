const express = require("express");
const socket = require("socket.io");
const cors = require('cors');

const app = express();
app.use(express.json());

const server = app.listen(process.env.PORT || 3333, function () {
  console.log(`http://localhost:${3333}`);
});

app.use(express.static(__dirname + '/public'));

const io = socket(server);

const activeUsers = new Set();

io.on("connection", function (socket) {
  console.log("Nova Conecção");

  socket.on("new user", function (data) {
    socket.userId = data;
    activeUsers.add(data);
    io.emit("new user", [...activeUsers]);
  });

  socket.on("disconnect", () => {
    activeUsers.delete(socket.userId);
    io.emit("user disconnected", socket.userId);
  });

  socket.on("image", function(info) {
    if (info.image) {
      var img = new Image();
      img.src = 'data:image/jpeg;base64,' + info.buffer;
      ctx.drawImage(img, 0, 0);
    }
  });
  
  socket.on("chat message", function (data) {
    io.emit("chat message", data);
  });
  
  socket.on("typing", function (data) {
    socket.broadcast.emit("typing", data);
  });
});
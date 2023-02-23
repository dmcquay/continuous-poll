"use strict";

const express = require("express");
const socketIO = require("socket.io");

const PORT = process.env.PORT || 8000;
const INDEX = "/index.html";

const server = express()
  .use((req, res) => res.sendFile(INDEX, { root: __dirname }))
  .listen(PORT, () => console.log(`Listening on ${PORT}`));

const io = socketIO(server);

let votesByClientId = {};

const emitResults = (socket) => {
  const votes = Object.values(votesByClientId);
  const yesCount = votes.filter((x) => x === "yes").length;
  const noCount = votes.filter((x) => x === "no").length;
  (socket || io).emit("results", { yesCount, noCount });
};

io.on("connection", (socket) => {
  console.log("Client connected");
  socket.on("disconnect", () => console.log("Client disconnected"));
  emitResults(socket);

  socket.on("vote", (clientId, value) => {
    votesByClientId[clientId] = value;
    emitResults();
  });

  socket.on("reset", () => {
    votesByClientId = {};
    emitResults();
  });
});

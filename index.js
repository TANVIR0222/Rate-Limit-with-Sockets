import { createServer } from "node:http";
import path from "node:path";

import "dotenv/config";
import express from "express";
import { Server } from "socket.io";

const main = async () => {
  const PORT = process.env.PORT || 3000;

  const app = express();
  const server = createServer(app);

  const io = new Server();
  io.attach(server);

  // socket.io Handler
  io.on("connection", (socket) => {
    socket.on("client:checkbox:change", (data) => {
      console.log("backend received checkbox change event from client:", data, {
        id: socket.id,
      });
      io.emit("server:checkbox:change", data);
    });
  });

  // express Handler
  app.use(express.static(path.resolve("./public")));
  app.get("/health", (req, res) => {
    res.status(200).json({ status: "ok" });
  });

  server.listen(PORT, () => {
    console.log(`Server is running on port http://localhost:${PORT}`);
  });
};

main();

import { createServer } from "node:http";
import path from "node:path";

import "dotenv/config";
import express from "express";
import { Server } from "socket.io";
import { publisher, subscriber } from "./redis-connection.js";

const CHECKBOX_COUNT = 100;

const state = {
  checkboxes: new Array(CHECKBOX_COUNT).fill(false),
};

const main = async () => {
  const PORT = process.env.PORT || 3000;

  const app = express();
  const server = createServer(app);

  const io = new Server();
  io.attach(server);

  await subscriber.subscribe("internal-server:checkbox:change");
  subscriber.on("message", (channel, message) => {
    if (channel === "internal-server:checkbox:change") {
      const { index, checked } = JSON.parse(message);
      state.checkboxes[index] = checked;
      io.emit("server:checkbox:change", { index, checked });
      // Update the state or emit the change to connected clients
    }
  });

  // socket.io Handler
  io.on("connection", (socket) => {
    socket.on("client:checkbox:change", async (data) => {
      // io.emit("server:checkbox:change", data);
      // state.checkboxes[data.index] = data.checked;
      await publisher.publish(
        "internal-server:checkbox:change",
        JSON.stringify(data),
      );
    });
  });

  // express Handler
  app.use(express.static(path.resolve("./public")));
  app.get("/health", (req, res) => {
    res.status(200).json({ status: "ok" });
  });

  app.get("/checkboxes", (req, res) => {
    res.status(200).json({ checkboxes: state.checkboxes });
  });

  server.listen(PORT, () => {
    console.log(`Server is running on port http://localhost:${PORT}`);
  });
};

main();

const ENV_CONF = require("./configs/env.conf");
const express = require("express");
const http = require("http");
const logger = require("morgan");
const errorHandler = require("errorhandler");
const cors = require("cors");
const socketIO = require("socket.io");

const app = express();
const server = http.createServer(app);
const errorMiddleware = require("./middleware/errorMiddleware");

app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(cors({ credentials: true, origin: ENV_CONF.CORS_ORIGIN }));

if (ENV_CONF.NODE_ENV === "development") {
  app.use(logger("dev"));
  app.use(errorHandler());
} else {
  app.use(logger("short"));
}

// ROUTES
require("./routes/")(app);

if (ENV_CONF.NODE_ENV === "production") {
  app.use(express.static(__dirname + "/public/"));
  app.get("*", (_, res) => res.sendFile(__dirname + "/public/index.html"));
}

app.use((req, res) => {
  res.status(404).json({
    error: true,
    message: `Bad request - route does not exist: ${req.method} ${req.originalUrl}`,
  });
});

app.use(errorMiddleware);

// WEB-SOCKETS
const io = socketIO(server, {
  cors: {
    origin: ENV_CONF.CORS_ORIGIN,
    methods: ["GET", "POST"],
    credentials: true,
    transports: ["websocket", "polling"],
  },
  allowEIO3: true,
});

require("./sockets")(io);

module.exports = server;
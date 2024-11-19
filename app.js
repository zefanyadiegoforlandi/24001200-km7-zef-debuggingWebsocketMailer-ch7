if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config();
  }
  require("./instrument.js");
  const Sentry = require("@sentry/node");
  const express = require('express');
  const http = require('http');
  const { Server } = require('socket.io');
  const routes = require('./routes/index');
  const path = require('path');
  const session = require('express-session');
  
  const app = express();
  const server = http.createServer(app);
  const io = new Server(server);
  
  app.set('view engine', 'ejs');
  app.set('views', path.join(__dirname, 'views'));
  
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(express.static(path.join(__dirname, 'public')));
  
  app.use(session({
    secret: process.env.SESSION_SECRET || 'your_secret_key',
    resave: false,
    saveUninitialized: true,
    cookie: {
      httpOnly: true,
      secure: false, 
      maxAge: 3600000,  
    }
  }));
  
  app.use(routes);
  
  const PORT = process.env.PORT || 3000;
  
  io.on('connection', (socket) => {
      console.log(`User connected: ${socket.id}`);
      
      socket.on('notification', (message) => {
          console.log(`Notification: ${message}`);
          io.emit('notification', message);
      });
  
      socket.on('disconnect', () => {
          console.log(`User disconnected: ${socket.id}`);
      });
  });
  
  app.get('/error', (req, res) => {
      throw new Error('Aduh ini error');
  });
  
  Sentry.setupExpressErrorHandler(app);
  
  server.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
  
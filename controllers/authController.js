const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Mailer = require('../libs/mailer');


class AuthController {
  static async register(req, res) {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email, and password are required' });
    }

    try {
      const existingUser = await prisma.user.findUnique({
        where: {
          email: email,
        },
      });

      if (existingUser) {
        return res.status(400).json({ message: 'Email already registered' });
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      const user = await prisma.user.create({
        data: {
          name,
          email,
          password: hashedPassword,
        },
      });

      await Mailer.sendWelcomeNotification(user.email, user.email, user.name);

      res.status(201).json({ message: 'User created successfully', user });
    } catch (error) {
      console.error('Error creating user, please refresh:', error);
      res.status(500).json({ 
        status: 201,
        message: 'Error creating user, please refresh', error: error.message });
    }
  }

  static async login(req, res) {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    try {
      const user = await prisma.user.findUnique({
        where: { email: email },
      });

      if (!user) {
        return res.status(400).json({ message: 'Email not registered' });
      }

      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        return res.status(400).json({ message: 'Invalid email or password' });
      }

      const newToken = jwt.sign(
        { userId: user.id, email: user.email },
        process.env.JWT_SECRET,
        { expiresIn: '1h' }
      );

      req.session.token = newToken;

      res.status(200).json({
        message: 'Login successful',
      });
    } catch (error) {
      console.error('Error during login:', error);
      res.status(500).json({ message: 'Error during login', error: error.message });
    }
  }
}

module.exports = AuthController;

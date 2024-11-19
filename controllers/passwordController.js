const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const bcrypt = require('bcryptjs');
const Mailer = require('../libs/mailer');
const jwt = require('jsonwebtoken');


class PasswordController {

  static async forgotPassword(req, res) {
      const { email } = req.body;

      if (!email) {
          return res.status(400).json({ message: 'Email is required' });
      }

      try {
          const user = await prisma.user.findUnique({ where: { email } });

          if (!user) {
              return res.status(404).json({ message: 'User not found' });
          }

          const token = jwt.sign({ email }, process.env.JWT_SECRET, { expiresIn: '10m' });

          const confirmationResetLink = `http://localhost:3000/confirmation-email?token=${token}`;

          await Mailer.sendPasswordResetEmail(user.email, confirmationResetLink);

          res.status(200).json({ message: 'Confirmation link sent to email' });
      } catch (error) {
          console.error('Error sending confirmation email:', error);
          res.status(500).json({ message: 'Error sending email' });
      }
  }

  static async confirmEmail(req, res) {
    const { token, email } = req.body;

    if (!token) {
        return res.status(400).json({ message: 'Token is required' });
    }

    if (!email) {
        return res.status(400).json({ message: 'Email is required' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        if (decoded.email !== email) {
            return res.status(400).json({ message: 'Invalid email' });
        }
        const user = await prisma.user.findUnique({ where: { email: decoded.email } });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const newToken = jwt.sign(
            { id: user.id },
            process.env.JWT_SECRET,
            { expiresIn: '10m' }
        );

        return res.status(200).json({
            status: 'success',
            message: 'go to reset-password',
            newToken: newToken
        });

    } catch (error) {
        return res.status(401).json({ message: 'Invalid or expired token' });
    }
  }

  static async resetPassword(req, res) {
    const { newToken, newPassword, confirmPassword } = req.body;

    if (!newToken || !newPassword || !confirmPassword) {
        return res.status(400).json({ message: 'New token, new password, and confirmation password are required' });
    } 

    try {
        console.log('newPassword:', newPassword);
        console.log('confirmPassword:', confirmPassword);
        const decoded = jwt.verify(newToken, process.env.JWT_SECRET);
        const userId = decoded.id;


        const user = await prisma.user.findUnique({ where: { id: userId } });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);

        await prisma.user.update({
            where: { id: userId },
            data: { password: hashedPassword },
        });

        return res.status(200).json({ message: 'Password updated successfully' });
    } catch (error) {
        console.error('Error resetting password:', error);
        return res.status(500).json({ message: 'Error resetting password' });
    }
  }  
  
}

module.exports = PasswordController;

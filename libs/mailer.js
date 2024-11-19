const nodemailer = require('nodemailer');

class Mailer {
  static transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
      user: process.env.EMAIL_USER, // Gunakan email server pengirim untuk autentikasi
      pass: process.env.EMAIL_PASS, // Password untuk autentikasi
    },
  });

  static async sendPasswordResetEmail(toEmail, confirmationResetLink) {
    console.log('Sending password reset email to:', toEmail);

    const htmlContent = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body {
            font-family: Arial, sans-serif;
            color: #333;
            background-color: #f4f4f4;
            margin: 0;
            padding: 0;
          }
          .container {
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #ffffff;
            border-radius: 8px;
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
          }
          .header {
            text-align: center;
            padding: 20px 0;
            background-color: #007bff;
            color: #ffffff;
            border-radius: 8px 8px 0 0;
          }
          .header h1 {
            margin: 0;
            font-size: 24px;
          }
          .content {
            padding: 20px;
          }
          .content p {
            line-height: 1.6;
          }
          .button {
            display: inline-block;
            margin-top: 20px;
            padding: 10px 20px;
            background-color: #007bff;
            color: #ffffff;
            text-decoration: none;
            border-radius: 4px;
            font-weight: bold;
            transition: background-color 0.3s ease;
          }
          .button:hover {
            background-color: #0056b3;
          }
          .footer {
            text-align: center;
            font-size: 12px;
            color: #888;
            padding: 20px 0;
            margin-top: 20px;
            border-top: 1px solid #ddd;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Password Reset Request</h1>
          </div>
          <div class="content">
            <p>Hi there,</p>
            <p>We received a request to reset your password. Click the button below to reset it:</p>
            <p style="text-align: center;"> <a href="${confirmationResetLink}" class="button" style="color: white;">
             Reset Password</a> 
            </p>
            <p>If you didn’t request this, please ignore this email.</p>
            <p>Thank you,<br>Your Company Team</p>
          </div>
          <div class="footer">
            <p>&copy; 2023 Your Company. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>`;

    try {
      await this.transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: toEmail,
        subject: 'Reset your password',
        html: htmlContent, 
      });
      console.log('Reset password email sent successfully');
    } catch (error) {
      console.error('Error sending reset password email:', error);
      throw error;
    }
  }

  
  

  // Kirim notifikasi selamat datang
  static async sendWelcomeNotification(toEmail, name) {
    try {
      await this.transporter.sendMail({
        from: process.env.EMAIL_USER, // Email pengirim tetap dari environment
        to: toEmail, // Email tujuan
        subject: 'Welcome!',
        html: `<p>Hello ${name}, welcome to our service!</p>`, // Pesan selamat datang
      });
    } catch (error) {
      console.error('Error sending welcome email:', error);
      throw error;
    }
  }

  // Kirim notifikasi saat password berhasil diubah
  static async sendPasswordChangeNotification(fromEmail, toEmail) {
    try {
      await this.transporter.sendMail({
        from: fromEmail, // Gunakan email pengguna yang login
        to: toEmail, // Email tujuan
        subject: 'Password Changed',
        html: `<p>Your password has been changed successfully. If this was not you, please contact support immediately.</p>`,
      });
    } catch (error) {
      console.error('Error sending password change email:', error);
      throw error;
    }
  }
}

module.exports = Mailer;

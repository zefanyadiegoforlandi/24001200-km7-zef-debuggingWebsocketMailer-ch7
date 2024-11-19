const express = require('express');
const authController = require('../controllers/authController');
const passwordController = require('../controllers/passwordController');
const router = express.Router();
const jwt = require('jsonwebtoken');

//route get
router.get('/reset-password', (req, res) => {
    const { newToken } = req.query;
    res.render('resetPassword', { newToken });
});

router.get('/login', (req, res) => {
    res.render('login');
});

router.get('/register', (req, res) => {
    res.render('register');
});

router.get('/dashboard', (req, res) => {
    if (!req.session.token) {
        return res.status(401).json({ message: 'Unauthorized' });
      }
    
      const decodedToken = jwt.decode(req.session.token);
    
      res.render('dashboard', {
        email: decodedToken.email,
        userId: decodedToken.userId
      });
});

router.get('/confirmation-email', (req, res) => {
    const { token } = req.query;
    res.render('confirmationEmail', { token: token });
});

// Auth routes
router.post('/api/auth/register', authController.register);
router.post('/api/auth/login', authController.login);

// Password reset routes
router.post('/api/password/forgot-password', passwordController.forgotPassword);
router.post('/api/password/reset-password', passwordController.resetPassword);
router.post('/api/password/confirm-email', passwordController.confirmEmail);

module.exports = router;

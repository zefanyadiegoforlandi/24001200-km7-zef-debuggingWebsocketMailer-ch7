const axios = require('axios');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

class HtmlController {
    static async handleRegisterForm(req, res) {
        const { name, email, password } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({ message: 'Name, email, and password are required' });
        }
        console.log('Register request received:', { name, email, password });
        const existingUser = await prisma.user.findUnique({
            where: {
              email: email,
            },
          });
    
        if (existingUser) {
            return res.status(400).json({ message: 'Email already registered' });
        }
        
        try {
            const response = await axios.post('http://localhost:3000/auth/register', {
                name,
                email,
                password
            }, {
                headers: {
                    'Content-Type': 'application/json'
                }
            });
        } catch (error) {
            console.error('Error during registration:', error.response ? error.response.data : error.message);
            return res.redirect('/register?error=true');
        }
    }
}

module.exports = HtmlController;

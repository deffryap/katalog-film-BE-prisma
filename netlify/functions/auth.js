const prisma = require('./utils/prisma');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

exports.handler = async (event) => {
    const path = event.path.replace('/.netlify/functions', '').replace('/api', '');
    const body = JSON.parse(event.body || '{}');
    const headers = { 
        'Access-Control-Allow-Origin': 'https://katalog-film-fe.netlify.app', // Ganti jika URL frontend Anda berbeda
        'Access-Control-Allow-Headers': 'Content-Type, Authorization', 
        'Access-Control-Allow-Methods': 'POST, OPTIONS' 
    };

    if (event.httpMethod === 'OPTIONS') return { statusCode: 204, headers };

    try {
        if (path === '/auth/register') {
            const { username, password } = body;
            const hashedPassword = await bcrypt.hash(password, 10);
            await prisma.user.create({ data: { username, password: hashedPassword } });
            return { statusCode: 201, headers, body: JSON.stringify({ message: "Admin berhasil didaftarkan." }) };
        }

        if (path === '/auth/login') {
            const { username, password } = body;
            const user = await prisma.user.findUnique({ where: { username } });
            if (!user || !(await bcrypt.compare(password, user.password))) {
                return { statusCode: 400, headers, body: JSON.stringify({ error: "Username atau password salah." }) };
            }
            const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '1h' });
            return { statusCode: 200, headers, body: JSON.stringify({ token, user: { id: user.id, username: user.username } }) };
        }

        return { statusCode: 404, headers, body: JSON.stringify({ error: "Rute tidak ditemukan." }) };
    } catch (error) {
        console.error(error);
        return { statusCode: 500, headers, body: JSON.stringify({ error: "Terjadi kesalahan pada server." }) };
    }
};

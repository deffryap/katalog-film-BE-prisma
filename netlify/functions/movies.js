const prisma = require('./utils/prisma');
const jwt = require('jsonwebtoken');

exports.handler = async (event) => {
    const pathSegments = event.path.replace('/.netlify/functions', '').replace('/api', '').split('/');
    const id = pathSegments[2] ? parseInt(pathSegments[2]) : null;
    const headers = { 
        'Access-Control-Allow-Origin': 'https://katalog-film-fe.netlify.app', // Ganti jika URL frontend Anda berbeda
        'Access-Control-Allow-Headers': 'Content-Type, Authorization', 
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS' 
    };

    if (event.httpMethod === 'OPTIONS') return { statusCode: 204, headers };

    const protectedMethods = ['POST', 'PUT', 'DELETE'];
    if (protectedMethods.includes(event.httpMethod)) {
        const authHeader = event.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) return { statusCode: 401, headers, body: JSON.stringify({ error: "Akses ditolak." }) };
        try {
            jwt.verify(authHeader.split(' ')[1], process.env.JWT_SECRET);
        } catch (error) {
            return { statusCode: 401, headers, body: JSON.stringify({ error: "Token tidak valid." }) };
        }
    }

    try {
        if (event.httpMethod === 'GET' && !id) {
            const { search, type } = event.queryStringParameters || {};
            const where = {};
            if (search) where.Title = { contains: search, mode: 'insensitive' };
            if (type && type !== 'all') where.Type = type;
            const movies = await prisma.movie.findMany({ where });
            return { statusCode: 200, headers, body: JSON.stringify(movies) };
        }

        if (event.httpMethod === 'GET' && id) {
            const movie = await prisma.movie.findUnique({ where: { id } });
            return { statusCode: 200, headers, body: JSON.stringify(movie) };
        }

        if (event.httpMethod === 'POST') {
            const movieData = JSON.parse(event.body);
            const newMovie = await prisma.movie.create({ data: movieData });
            return { statusCode: 201, headers, body: JSON.stringify(newMovie) };
        }

        if (event.httpMethod === 'PUT' && id) {
            const movieData = JSON.parse(event.body);
            delete movieData.imdbID;
            const updatedMovie = await prisma.movie.update({ where: { id }, data: movieData });
            return { statusCode: 200, headers, body: JSON.stringify(updatedMovie) };
        }

        if (event.httpMethod === 'DELETE' && id) {
            await prisma.movie.delete({ where: { id } });
            return { statusCode: 200, headers, body: JSON.stringify({ message: "Konten berhasil dihapus." }) };
        }

        return { statusCode: 405, headers, body: JSON.stringify({ error: "Metode tidak diizinkan." }) };
    } catch (error) {
        console.error(error);
        return { statusCode: 500, headers, body: JSON.stringify({ error: "Terjadi kesalahan pada server." }) };
    }
};

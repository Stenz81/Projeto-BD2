const express = require('express');
const { Pool } = require('pg'); // Changed from MongoClient to pg Pool
const server = express();
const { readFile } = require('fs').promises;
const ejs = require('ejs');

require('dotenv').config();

const port = 8080;
// PostgreSQL connection pool for Neon
const pool = new Pool({
    connectionString: process.env.NEON_URI,
    ssl: {
        rejectUnauthorized: false
    }
});
const dataBaseName = "DataBaseRPG";
const collectionName = "Magia";

server.set('view engine', 'ejs');

server.use(express.static('public'));

server.get('/', async (request, response) => {
    response.send(await readFile('./busca.html', 'utf8'));
});

server.get('/buscar', async (req, res) => {
    const searchQuery = req.query.search || '';

    try {
        // Consulta ao banco de dados
        const result = await pool.query(
            'SELECT * FROM Magia WHERE nome ILIKE $1',
            [`%${searchQuery}%`]
        );

        const magias = result.rows;

        // Lê o arquivo HTML
        let html = await readFile('./busca.html', 'utf8');

        // Inserir os resultados diretamente no HTML
        html = html.replace(
            '<script>',
            `
                <script>
                    window.magias = ${JSON.stringify(magias)};
            `);

        // Envia a página com os resultados
        res.send(html);

    } catch (err) {
        console.error('Erro ao buscar magias:', err);
        res.status(500).send('Erro ao buscar magias');
    }
});



server.listen(process.env.PORT || port, () => console.log(`App available on http://localhost:${port}`));

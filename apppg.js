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

server.set('view engine', 'ejs');

server.use(express.static('public'));

server.use(express.json())

server.get('/', async (request, response) => {
    response.send(await readFile('public/busca.html', 'utf8'));
});

server.post('/buscar-magias', async (req, res) => {
    const { nivel_inferior, nivel_superior, crencas, formas_de_combate } = req.body;
    let query = `
    SELECT DISTINCT Magia.* FROM Magia
    JOIN crenca_x_magia ON Magia.id = crenca_x_magia.id_magia
    JOIN crenca ON crenca.id = crenca_x_magia.id_crenca
    JOIN forma_de_combate_x_magia ON Magia.id = forma_de_combate_x_magia.id_magia
    JOIN forma_de_combate ON forma_de_combate.id = forma_de_combate_x_magia.id_forma_de_combate
    WHERE Magia.nivel_base BETWEEN $1 AND $2
  `;
    console.log(nivel_inferior)
    const params = [nivel_inferior, nivel_superior];
    let index = 3;

    if (crencas && crencas.length > 0) {
        const placeholders = crencas.map((_, i) => `$${index++}`).join(', ');
        query += ` AND crenca.nome IN (${placeholders})`;
        params.push(...crencas);
    }

    if (formas_de_combate && formas_de_combate.length > 0) {
        const placeholders = formas_de_combate.map((_, i) => `$${index++}`).join(', ');
        query += ` AND forma_de_combate.nome IN (${placeholders})`;
        params.push(...formas_de_combate);
    }
    try {
        const result = await pool.query(query, params);
        console.log(result.rows)
        res.json(result.rows);
    } catch (err) {
        console.error('Erro ao buscar magias:', err);
        res.status(500).json({ erro: 'Erro no servidor' });
    }
});

server.get('/magias/:nome', async (request, response) => {
    console.log(request.path)
    value = decodeURIComponent(request.path)
    console.log(value)
    // já vem decodificado: "NÉVOA SOMBRIA"
    const name = request.params.nome; 
    console.log(name)
    upperName = name
    try {
        const magia_result = await pool.query(
            'SELECT * FROM magia WHERE nome = $1',
            [upperName]
        );

        const crencas_result = await pool.query(`
              SELECT crenca.nome 
              FROM magia, crenca,crenca_x_magia
              WHERE crenca_x_magia.id_crenca = crenca.id
              AND crenca_x_magia.id_magia = magia.id
              AND magia.nome = $1;
            `, [upperName]);

        // Busca formas de combate associadas
        const formas_de_combate_result = await pool.query(`
              SELECT forma_de_combate.nome 
              FROM magia, forma_de_combate, forma_de_combate_x_magia 
              WHERE forma_de_combate_x_magia.id_forma_de_combate = forma_de_combate.id
              AND forma_de_combate_x_magia.id_magia = magia.id
              AND magia.nome = $1;
            `, [upperName]);

        const crencas = crencas_result.rows.map(row => row.nome)
        const formas_de_combate = formas_de_combate_result.rows.map(row => row.nome)
        const magia = magia_result.rows[0]
        response.render('magia.ejs', {magia,crencas,formas_de_combate});
    } catch (err) {
        console.error('Database error:', err);
        response.status(500).send('Internal server error');
    }
});

server.listen(process.env.PORT || port, () => console.log(`App available on http://localhost:${port}`));

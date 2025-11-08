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
    response.send(await readFile('Busca.html', 'utf8'));
});

server.get('/insere.html', async (request, response) => {
    response.send(await readFile('Insere.html', 'utf8'));
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

server.post('/inserir-magias', async (req, res) => {
    const { nivel_magia, nome_magia, crenca1, crenca2, forma1, forma2, custo_inicial, custo_rodada, custo_acao, escalonamento, descricao } = req.body;
    const client = await pool.connect()
    console.log('Olá')
    try {
        await client.query('BEGIN')
        const queryInsertMagia =
            `INSERT INTO Magia(nome,custo_inicial,custo_por_rodada,nivel_base,descricao,custo_acao,escalonamento) 
        VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING ID`
        const paramsMagia = [nome_magia, custo_inicial, custo_rodada, nivel_magia, descricao, custo_acao, escalonamento] //parametros 
        console.log(paramsMagia)
        const res_magia = await client.query(queryInsertMagia, paramsMagia)

        const queryCrencas = `SELECT Crenca.id FROM Crenca WHERE Crenca.nome = $1 OR Crenca.nome = $2`
        const paramsSelectCrenca = [crenca1, crenca2]

        const res_crencas = await client.query(queryCrencas, paramsSelectCrenca)
        const paramsCrenca = [res_magia.rows[0].id]
        paramsCrenca.push(...res_crencas.rows.map(row => row.id))

        const queryInsertCrencas =
            `
        INSERT INTO crenca_x_magia(id_magia, id_crenca) VALUES 
        ($1, $2),
        ($1, $3)`
        console.log(paramsCrenca)
        await client.query(queryInsertCrencas, paramsCrenca)

        const queryFormaCombate = `
        SELECT forma_de_combate.id 
            FROM forma_de_combate 
            WHERE forma_de_combate.nome = $1 OR forma_de_combate.nome = $2`




        const paramsSelectFormaCombate = [forma1, forma2]
        const res_FormaCombate = await client.query(queryFormaCombate, paramsSelectFormaCombate)

        const paramsFormaCombate = [res_magia.rows[0].id]
        paramsFormaCombate.push(...res_FormaCombate.rows.map(row => row.id))
        const queryInsertFormaCombate =
            `
        INSERT INTO forma_de_combate_x_magia(id_magia, id_forma_de_combate) VALUES 
        ($1, $2),
        ($1, $3)`

        await client.query(queryInsertFormaCombate, paramsFormaCombate)


        await client.query('COMMIT')
        console.log('Comittou')
    } catch (e) {
        if (e.code === '23505') { // unique constraint
            e.message = `Erro: Nome ${nome_magia} já cadastrado`;
        } else if (e.code === '23502') {
            e.message = 'Erro: Magia requer nome obrigatório';
        }
        await client.query('ROLLBACK')
        console.log("Erro na inserção")
         res.status(500).json({ erro: e.message });
    } finally {
        client.release()
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
        response.render('Magia.ejs', { magia, crencas, formas_de_combate });
    } catch (err) {
        console.error('Database error:', err);
        response.status(500).send('Internal server error');
        res.status(500).json({ erro: 'Erro no servidor' });
    }
});

server.listen(process.env.PORT || port, () => console.log(`App available on http://localhost:${port}`));

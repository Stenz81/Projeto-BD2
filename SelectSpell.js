const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    connectionString: process.env.NEON_URI,
    ssl: { rejectUnauthorized: false }
});

const connectToDatabase = async () => {
    try {
        // Test connection
        await pool.query('SELECT 1');
        console.log('Connected to the PostgreSQL database');
    } catch (err) {
        console.error(`Error connecting to the database: ${err}`);
    }    
};
//SELECT DISTINCT Magia.* FROM Magia, crenca, forma_de_combate, crenca_x_magia, forma_de_combate_x_magia 
    //WHERE Magia.id = crenca_x_magia.id_magia
    //AND Magia.id = forma_de_combate_x_magia.id_magia
    //AND forma_de_combate.id = forma_de_combate_x_Magia.id_forma_de_combate
    //AND crenca.id = crenca_x_magia.id_crenca
    //AND Magia.nivel_base BETWEEN 1 AND 3
    //AND (crenca_x_magia.id_crenca = (SELECT id FROM crenca WHERE nome = 'Natureza') OR crenca_x_magia.id_crenca = (SELECT id FROM crenca WHERE nome = 'Anima'))
    //AND (forma_de_combate_x_magia.id_forma_de_combate = (SELECT id FROM forma_de_combate WHERE nome = 'Tank') OR (forma_de_combate_x_magia.id_forma_de_combate = (SELECT id FROM forma_de_combate WHERE nome = 'Suporte')))
function selectMagia(){
    
    const nivel_inferior = document.getElementById("nivel_inferior").value.toString()
    const nivel_superior = document.getElementById("nivel_superior").value.toString()

    let selecao = "SELECT DISTINCT Magia.* FROM Magia, crenca, forma_de_combate, crenca_x_magia, forma_de_combate_x_magia";
    selecao = selecao.concat("\nWHERE Magia.id = crenca_x_magia.id_magia");
    selecao = selecao.concat("\nAND Magia.id = forma_de_combate_x_magia.id_magia");
    selecao = selecao.concat("\nAND crenca.id = crenca_x_magia.id_crenca");
    selecao = selecao.concat("AND Magia.nivel_base BETWEEN ")
    selecao = selecao.concat(nivel_inferior).concat(" AND ").concat(nivel_superior)
    selecao = crenca in 
}
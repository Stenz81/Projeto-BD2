/*const { Pool } = require('pg');
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
};*/
//SELECT DISTINCT Magia.* FROM Magia, crenca, forma_de_combate, crenca_x_magia, forma_de_combate_x_magia 
//WHERE Magia.id = crenca_x_magia.id_magia
//AND Magia.id = forma_de_combate_x_magia.id_magia
//AND forma_de_combate.id = forma_de_combate_x_Magia.id_forma_de_combate
//AND crenca.id = crenca_x_magia.id_crenca
//AND Magia.nivel_base BETWEEN 1 AND 3
//AND (crenca_x_magia.id_crenca = (SELECT id FROM crenca WHERE nome = 'Natureza') OR crenca_x_magia.id_crenca = (SELECT id FROM crenca WHERE nome = 'Anima'))
//AND (forma_de_combate_x_magia.id_forma_de_combate = (SELECT id FROM forma_de_combate WHERE nome = 'Tank') OR (forma_de_combate_x_magia.id_forma_de_combate = (SELECT id FROM forma_de_combate WHERE nome = 'Suporte')))
function selectMagia() {

    const nivel_inferior = document.getElementById("nivel_inferior").value.toString()
    const nivel_superior = document.getElementById("nivel_superior").value.toString()
    const crencas_select = document.getElementById("cb_Crenca")
    const crencas = []
    const forma_de_combate_select = document.getElementById("cb_FormaCombate")
    const formas_de_combate = []
    const saida = document.getElementsById("container2")

    saida.innerHTML = ""; //limpar saida
    
    if(formas_de_combate.length > 2){
        saida.innerHTML = "<p class='erro'>Por favor, insira de 0 a 2 formas de combate.</p>";
    }
    if(nivel_superior<nivel_inferior){
        saida.innerHTML = "<p class='erro'>Nível Inferior não pode ser menor que Nível Superior</p>";
    }

    for (let option of crencas_select.options) {
        if (option.selected) {
            crencas.push(option.text); // ou option.value
        }
    }

    for (let option of forma_de_combate_select.options) {
        if (option.selected) {
            formas_de_combate.push(option.text); // ou option.value
        }
    }

    let selecao = "SELECT DISTINCT Magia.* FROM Magia, crenca, forma_de_combate, crenca_x_magia, forma_de_combate_x_magia";
    selecao = selecao.concat("\nWHERE Magia.id = crenca_x_magia.id_magia");
    selecao = selecao.concat("\nAND Magia.id = forma_de_combate_x_magia.id_magia");
    selecao = selecao.concat("\nAND crenca.id = crenca_x_magia.id_crenca");
    selecao = selecao.concat("\nAND Magia.nivel_base BETWEEN ")
    selecao = selecao.concat(nivel_inferior).concat(" AND ").concat(nivel_superior)

    if (crencas.length > 0) {
        selecao = selecao.concat("\nAND crenca.nome IN (");
        for (let i = 0; i < crencas.length; i++) {
            selecao = selecao.concat("'", crencas[i], "'");
            if (i !== crencas.length - 1) {
                selecao = selecao.concat(", ");
            }
        }
        selecao = selecao.concat(")");
    }

    if (formas_de_combate.length > 0) {
        selecao = selecao.concat("\nAND forma_de_combate.nome IN (");
        for (let i = 0; i < formas_de_combate.length; i++) {
            selecao = selecao.concat("'", formas_de_combate[i], "'");
            if (i !== formas_de_combate.length - 1) {
                selecao = selecao.concat(", ");
            }
        }
        selecao = selecao.concat(")\n");
    }
    console.log(selecao)
}

const botao = document.getElementById("Confirm_button")
botao.addEventListener("click", selectMagia)
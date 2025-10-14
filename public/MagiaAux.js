// Exemplo: routes/magia.js
import express from "express";
import pool from "../db.js"; // conexão com o banco
const router = express.Router();



router.get("/:id", async (req, res) => {
  const { id } = req.params;

  try {
    // Busca informações principais da magia
    const [magiaRows] = await pool.query(
      "SELECT * FROM magia WHERE id = ?",
      [id]
    );

    if (magiaRows.length === 0) {
      return res.status(404).send("Magia não encontrada");
    }

    const magia = magiaRows[0];

    // Busca crenças associadas
    const [crencas] = await pool.query(`
      SELECT c.nome 
      FROM crenca c
      JOIN crenca_x_magia cm ON c.id = cm.id_crenca
      WHERE cm.id_magia = ?;
    `, [id]);

    // Busca formas de combate associadas
    const [formas_de_combate] = await pool.query(`
      SELECT f.nome 
      FROM forma_de_combate f
      JOIN forma_de_combate_x_magia fm ON f.id = fm.id_forma
      WHERE fm.id_magia = ?;
    `, [id]);

    // Renderiza o EJS passando todos os dados
    res.render("magia", {
      magia,
      crencas: crencas.map(c => c.nome),
      formas: formas.map(f => f.nome)
    });

  } catch (err) {
    console.error(err);
    res.status(500).send("Erro ao buscar magia");
  }
});

export default router;
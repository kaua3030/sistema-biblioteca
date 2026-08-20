import { Router } from "express";
import { z } from "zod";
import { database } from "../database.js";

const livrosRouter = Router();

const livroSchema = z.object({
  titulo: z.string().trim().min(1, "Informe o título").max(150),
  autor: z.string().trim().min(1, "Informe o autor").max(120),
  categoria: z.string().trim().min(1, "Informe a categoria").max(80),
  ano: z.coerce.number().int().min(0, "Informe um ano válido"),
  disponivel: z.boolean().default(true)
});

function getId(value: string) {
  return z.coerce.number().int().positive().parse(value);
}

livrosRouter.get("/", async (request, response) => {
  const busca = String(request.query.busca ?? "").trim();

  if (busca) {
    const resultado = await database.query(
      `SELECT * FROM livros
       WHERE titulo ILIKE $1 OR autor ILIKE $1 OR categoria ILIKE $1
       ORDER BY id DESC`,
      [`%${busca}%`]
    );

    return response.json(resultado.rows);
  }

  const resultado = await database.query("SELECT * FROM livros ORDER BY id DESC");
  return response.json(resultado.rows);
});

livrosRouter.get("/:id", async (request, response) => {
  const id = getId(request.params.id);
  const resultado = await database.query("SELECT * FROM livros WHERE id = $1", [id]);

  if (resultado.rowCount === 0) {
    return response.status(404).json({ erro: "Livro não encontrado" });
  }

  return response.json(resultado.rows[0]);
});

livrosRouter.post("/", async (request, response) => {
  const dados = livroSchema.parse(request.body);
  const resultado = await database.query(
    `INSERT INTO livros (titulo, autor, categoria, ano, disponivel)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING *`,
    [dados.titulo, dados.autor, dados.categoria, dados.ano, dados.disponivel]
  );

  return response.status(201).json(resultado.rows[0]);
});

livrosRouter.put("/:id", async (request, response) => {
  const id = getId(request.params.id);
  const dados = livroSchema.parse(request.body);
  const resultado = await database.query(
    `UPDATE livros
     SET titulo = $1, autor = $2, categoria = $3, ano = $4, disponivel = $5
     WHERE id = $6
     RETURNING *`,
    [dados.titulo, dados.autor, dados.categoria, dados.ano, dados.disponivel, id]
  );

  if (resultado.rowCount === 0) {
    return response.status(404).json({ erro: "Livro não encontrado" });
  }

  return response.json(resultado.rows[0]);
});

livrosRouter.delete("/:id", async (request, response) => {
  const id = getId(request.params.id);
  const resultado = await database.query("DELETE FROM livros WHERE id = $1", [id]);

  if (resultado.rowCount === 0) {
    return response.status(404).json({ erro: "Livro não encontrado" });
  }

  return response.status(204).send();
});

export default livrosRouter;

import { Router } from "express";
import { z } from "zod";
import { database } from "../database.js";

const emprestimosRouter = Router();

const emprestimoSchema = z.object({
  livroId: z.coerce.number().int().positive(),
  leitor: z.string().trim().min(1, "Informe o nome do leitor").max(120),
  dataPrevistaDevolucao: z.iso.date().refine(
    (data) => data >= new Date().toISOString().slice(0, 10),
    "Informe uma data atual ou futura"
  )
});

function getId(value: string) {
  return z.coerce.number().int().positive().parse(value);
}

const consultaEmprestimos = `
  SELECT
    e.id,
    e.livro_id AS "livroId",
    l.titulo AS "livroTitulo",
    e.leitor,
    e.data_emprestimo AS "dataEmprestimo",
    e.data_prevista_devolucao AS "dataPrevistaDevolucao",
    e.data_devolucao AS "dataDevolucao"
  FROM emprestimos e
  JOIN livros l ON l.id = e.livro_id
`;

emprestimosRouter.get("/", async (request, response) => {
  const mostrarTodos = request.query.status === "todos";
  const filtro = mostrarTodos ? "" : "WHERE e.data_devolucao IS NULL";
  const resultado = await database.query(
    `${consultaEmprestimos} ${filtro} ORDER BY e.id DESC`
  );

  return response.json(resultado.rows);
});

emprestimosRouter.post("/", async (request, response) => {
  const dados = emprestimoSchema.parse(request.body);
  const client = await database.connect();

  try {
    await client.query("BEGIN");
    const livro = await client.query(
      "SELECT id, titulo, disponivel FROM livros WHERE id = $1 FOR UPDATE",
      [dados.livroId]
    );

    if (livro.rowCount === 0) {
      await client.query("ROLLBACK");
      return response.status(404).json({ erro: "Livro não encontrado" });
    }

    if (!livro.rows[0].disponivel) {
      await client.query("ROLLBACK");
      return response.status(409).json({ erro: "Livro indisponível para empréstimo" });
    }

    const resultado = await client.query(
      `INSERT INTO emprestimos (livro_id, leitor, data_prevista_devolucao)
       VALUES ($1, $2, $3)
       RETURNING
         id,
         livro_id AS "livroId",
         leitor,
         data_emprestimo AS "dataEmprestimo",
         data_prevista_devolucao AS "dataPrevistaDevolucao",
         data_devolucao AS "dataDevolucao"`,
      [dados.livroId, dados.leitor, dados.dataPrevistaDevolucao]
    );

    await client.query("UPDATE livros SET disponivel = FALSE WHERE id = $1", [dados.livroId]);
    await client.query("COMMIT");

    return response.status(201).json({
      ...resultado.rows[0],
      livroTitulo: livro.rows[0].titulo
    });
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
});

emprestimosRouter.patch("/:id/devolucao", async (request, response) => {
  const id = getId(request.params.id);
  const client = await database.connect();

  try {
    await client.query("BEGIN");
    const emprestimo = await client.query(
      `SELECT livro_id
       FROM emprestimos
       WHERE id = $1 AND data_devolucao IS NULL
       FOR UPDATE`,
      [id]
    );

    if (emprestimo.rowCount === 0) {
      await client.query("ROLLBACK");
      return response.status(404).json({ erro: "Empréstimo ativo não encontrado" });
    }

    const livroId = emprestimo.rows[0].livro_id;
    const resultado = await client.query(
      `UPDATE emprestimos
       SET data_devolucao = CURRENT_DATE
       WHERE id = $1
       RETURNING
         id,
         livro_id AS "livroId",
         leitor,
         data_emprestimo AS "dataEmprestimo",
         data_prevista_devolucao AS "dataPrevistaDevolucao",
         data_devolucao AS "dataDevolucao"`,
      [id]
    );

    await client.query("UPDATE livros SET disponivel = TRUE WHERE id = $1", [livroId]);
    await client.query("COMMIT");

    return response.json(resultado.rows[0]);
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
});

export default emprestimosRouter;

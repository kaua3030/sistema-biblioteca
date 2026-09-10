import request from "supertest";
import { criarAmbienteDeTeste } from "./helpers/banco.js";

describe("Empréstimos e devoluções com PostgreSQL", () => {
  let ambiente: Awaited<ReturnType<typeof criarAmbienteDeTeste>>;
  let livroId: number;
  let dataFutura: string;
  let dataPassada: string;

  beforeAll(async () => {
    ambiente = await criarAmbienteDeTeste();
  }, 15000);

  beforeEach(async () => {
    await ambiente.database.query("TRUNCATE emprestimos, livros RESTART IDENTITY");
    const datas = await ambiente.database.query(
      "SELECT (CURRENT_DATE + 7)::text AS futura, (CURRENT_DATE - 1)::text AS passada"
    );
    dataFutura = datas.rows[0].futura;
    dataPassada = datas.rows[0].passada;

    const livro = await request(ambiente.app)
      .post("/api/livros")
      .send({ titulo: "Dom Casmurro", autor: "Machado de Assis", categoria: "Romance", ano: 1899 })
      .expect(201);
    livroId = livro.body.id;
  });

  afterAll(async () => {
    await ambiente?.encerrar();
  });

  function emprestar(leitor = "Maria Silva") {
    return request(ambiente.app)
      .post("/api/emprestimos")
      .send({ livroId, leitor, dataPrevistaDevolucao: dataFutura });
  }

  test("registra o empréstimo e torna o livro indisponível no banco", async () => {
    const response = await emprestar().expect(201);

    expect(response.body).toMatchObject({
      id: expect.any(Number),
      livroId,
      livroTitulo: "Dom Casmurro",
      leitor: "Maria Silva",
      dataDevolucao: null
    });

    const registro = await ambiente.database.query(
      `SELECT e.leitor, e.data_prevista_devolucao::text AS prazo,
              e.data_devolucao, l.disponivel
       FROM emprestimos e JOIN livros l ON l.id = e.livro_id
       WHERE e.id = $1`,
      [response.body.id]
    );
    expect(registro.rows).toEqual([{
      leitor: "Maria Silva",
      prazo: dataFutura,
      data_devolucao: null,
      disponivel: false
    }]);
  });

  test("recusa um segundo empréstimo sem alterar o empréstimo original", async () => {
    const original = await emprestar().expect(201);
    const response = await emprestar("João Souza").expect(409);

    expect(response.body.erro).toBe("Livro indisponível para empréstimo");
    const registros = await ambiente.database.query("SELECT id, leitor FROM emprestimos");
    expect(registros.rows).toEqual([{ id: original.body.id, leitor: "Maria Silva" }]);
    const livro = await request(ambiente.app).get(`/api/livros/${livroId}`).expect(200);
    expect(livro.body.disponivel).toBe(false);
  });

  test("permite apenas um empréstimo quando duas solicitações chegam juntas", async () => {
    const respostas = await Promise.all([emprestar("Maria Silva"), emprestar("João Souza")]);

    expect(respostas.map((resposta) => resposta.status).sort()).toEqual([201, 409]);
    const registros = await ambiente.database.query(
      "SELECT leitor FROM emprestimos WHERE livro_id = $1 AND data_devolucao IS NULL",
      [livroId]
    );
    const aprovado = respostas.find((resposta) => resposta.status === 201)!;
    expect(registros.rows).toEqual([{ leitor: aprovado.body.leitor }]);
  });

  test("registra a devolução, preserva o histórico e permite um novo empréstimo", async () => {
    const emprestimo = await emprestar().expect(201);
    const devolucao = await request(ambiente.app)
      .patch(`/api/emprestimos/${emprestimo.body.id}/devolucao`)
      .expect(200);

    expect(devolucao.body.dataDevolucao).toEqual(expect.any(String));
    const registro = await ambiente.database.query(
      `SELECT e.data_devolucao IS NOT NULL AS devolvido, l.disponivel
       FROM emprestimos e JOIN livros l ON l.id = e.livro_id
       WHERE e.id = $1`,
      [emprestimo.body.id]
    );
    expect(registro.rows).toEqual([{ devolvido: true, disponivel: true }]);

    const ativos = await request(ambiente.app).get("/api/emprestimos").expect(200);
    expect(ativos.body).toEqual([]);
    const historico = await request(ambiente.app).get("/api/emprestimos?status=todos").expect(200);
    expect(historico.body).toHaveLength(1);
    expect(historico.body[0].id).toBe(emprestimo.body.id);

    const novo = await emprestar("João Souza").expect(201);
    expect(novo.body.id).not.toBe(emprestimo.body.id);
  });

  test("recusa repetir uma devolução sem liberar o livro de um novo empréstimo", async () => {
    const antigo = await emprestar().expect(201);
    await request(ambiente.app).patch(`/api/emprestimos/${antigo.body.id}/devolucao`).expect(200);
    const novo = await emprestar("João Souza").expect(201);

    const response = await request(ambiente.app)
      .patch(`/api/emprestimos/${antigo.body.id}/devolucao`)
      .expect(404);
    expect(response.body.erro).toBe("Empréstimo ativo não encontrado");

    const livro = await request(ambiente.app).get(`/api/livros/${livroId}`).expect(200);
    expect(livro.body.disponivel).toBe(false);
    const ativos = await request(ambiente.app).get("/api/emprestimos").expect(200);
    expect(ativos.body).toHaveLength(1);
    expect(ativos.body[0].id).toBe(novo.body.id);
  });

  test("impede excluir um livro emprestado e preserva seus registros", async () => {
    const emprestimo = await emprestar().expect(201);
    const response = await request(ambiente.app).delete(`/api/livros/${livroId}`).expect(409);

    expect(response.body.erro).toBe("O livro está emprestado");
    const livro = await request(ambiente.app).get(`/api/livros/${livroId}`).expect(200);
    expect(livro.body.disponivel).toBe(false);
    const registros = await ambiente.database.query("SELECT id FROM emprestimos");
    expect(registros.rows).toEqual([{ id: emprestimo.body.id }]);
  });

  test.each(["leitor vazio", "data passada"])("rejeita %s sem gravar empréstimo", async (cenario) => {
    const response = await request(ambiente.app)
      .post("/api/emprestimos")
      .send({
        livroId,
        leitor: cenario === "leitor vazio" ? "   " : "Maria Silva",
        dataPrevistaDevolucao: cenario === "data passada" ? dataPassada : dataFutura
      })
      .expect(400);

    expect(response.body.erro).toBe("Dados inválidos");
    const registros = await ambiente.database.query("SELECT id FROM emprestimos");
    expect(registros.rows).toEqual([]);
    const livro = await request(ambiente.app).get(`/api/livros/${livroId}`).expect(200);
    expect(livro.body.disponivel).toBe(true);
  });

  test("recusa emprestar um livro inexistente sem deixar registros parciais", async () => {
    await request(ambiente.app).delete(`/api/livros/${livroId}`).expect(204);
    const response = await emprestar().expect(404);

    expect(response.body.erro).toBe("Livro não encontrado");
    const registros = await ambiente.database.query("SELECT id FROM emprestimos");
    expect(registros.rows).toEqual([]);
  });
});

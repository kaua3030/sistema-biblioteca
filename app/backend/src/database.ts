import pg from "pg";

const { Pool } = pg;

export const database = new Pool({
  host: process.env.DB_HOST ?? "localhost",
  port: Number(process.env.DB_PORT) || 5432,
  user: process.env.DB_USER ?? "admin",
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME ?? "biblioteca"
});

export async function initializeDatabase() {
  await database.query(`
    CREATE TABLE IF NOT EXISTS livros (
      id SERIAL PRIMARY KEY,
      titulo VARCHAR(150) NOT NULL,
      autor VARCHAR(120) NOT NULL,
      categoria VARCHAR(80) NOT NULL,
      ano INTEGER NOT NULL CHECK (ano >= 0),
      disponivel BOOLEAN NOT NULL DEFAULT TRUE
    )
  `);

  await database.query(`
    CREATE TABLE IF NOT EXISTS emprestimos (
      id SERIAL PRIMARY KEY,
      livro_id INTEGER NOT NULL REFERENCES livros(id) ON DELETE CASCADE,
      leitor VARCHAR(120) NOT NULL,
      data_emprestimo DATE NOT NULL DEFAULT CURRENT_DATE,
      data_prevista_devolucao DATE NOT NULL,
      data_devolucao DATE,
      CHECK (data_prevista_devolucao >= data_emprestimo),
      CHECK (data_devolucao IS NULL OR data_devolucao >= data_emprestimo)
    )
  `);

  await database.query(`
    CREATE UNIQUE INDEX IF NOT EXISTS emprestimo_ativo_por_livro
    ON emprestimos (livro_id)
    WHERE data_devolucao IS NULL
  `);
}

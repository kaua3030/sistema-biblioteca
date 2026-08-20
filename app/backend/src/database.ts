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
}

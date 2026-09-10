import { randomUUID } from "node:crypto";
import pg from "pg";

export async function criarAmbienteDeTeste() {
  const connectionString = process.env.TEST_DATABASE_URL;

  if (!connectionString) {
    throw new Error(
      "Defina TEST_DATABASE_URL para executar os testes com PostgreSQL. " +
      "Consulte tests/README.md ou use npm run test:unit para os testes sem banco."
    );
  }

  const url = new URL(connectionString);
  const nomeBanco = decodeURIComponent(url.pathname.slice(1));

  if (!["postgres:", "postgresql:"].includes(url.protocol) || !nomeBanco.endsWith("_test")) {
    throw new Error("TEST_DATABASE_URL deve apontar para um banco PostgreSQL com nome terminado em _test.");
  }

  const schema = `teste_${randomUUID().replaceAll("-", "")}`;
  const variaveis = {
    DB_HOST: url.hostname,
    DB_PORT: url.port || "5432",
    DB_USER: decodeURIComponent(url.username),
    DB_PASSWORD: decodeURIComponent(url.password),
    DB_NAME: nomeBanco,
    PGOPTIONS: `-c search_path=${schema} -c timezone=UTC`
  };
  const anteriores = Object.fromEntries(
    Object.keys(variaveis).map((chave) => [chave, process.env[chave]])
  );
  const administrador = new pg.Pool({
    connectionString,
    options: "",
    max: 1,
    connectionTimeoutMillis: 5000
  });
  let database: pg.Pool | undefined;
  let schemaCriado = false;

  async function encerrar() {
    try {
      await database?.end();
      if (schemaCriado) {
        await administrador.query(`DROP SCHEMA "${schema}" CASCADE`);
      }
    } finally {
      await administrador.end();
      for (const [chave, valor] of Object.entries(anteriores)) {
        if (valor === undefined) {
          delete process.env[chave];
        } else {
          process.env[chave] = valor;
        }
      }
    }
  }

  try {
    await administrador.query(`CREATE SCHEMA "${schema}"`);
    schemaCriado = true;
    Object.assign(process.env, variaveis);

    // Importar depois da configuração faz a aplicação usar o banco e o schema de teste.
    const moduloBanco = await import("../../src/database.js");
    database = moduloBanco.database;
    const destino = await database.query("SELECT current_schema() AS schema");
    if (destino.rows[0].schema !== schema) {
      throw new Error("A conexão da aplicação não está isolada no schema de teste.");
    }
    await moduloBanco.initializeDatabase();
    const { default: app } = await import("../../src/app.js");

    return { app, database, encerrar };
  } catch (error) {
    await encerrar();
    throw error;
  }
}

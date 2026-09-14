# Testes e CI (instruções detalhadas)

## Requisitos
- Node.js (recomendado): 20.x
- npm (recomendado): 9.x / 11.x
- Docker & Docker Compose (para testes de integração com Postgres)

---

## Rodar testes backend (integração com Postgres)

1) Subir Postgres de teste:
docker run --rm -d --name biblioteca-postgres-test \
  -e POSTGRES_USER=biblioteca_test \
  -e POSTGRES_PASSWORD=biblioteca_test \
  -e POSTGRES_DB=biblioteca_test \
  -p 127.0.0.1:5433:5432 postgres:15-alpine

2) Definir variável de ambiente (Git Bash / WSL):
export TEST_DATABASE_URL="postgresql://biblioteca_test:biblioteca_test@127.0.0.1:5433/biblioteca_test"

3) Instalar dependências e rodar testes:
cd app/backend
npm install
npm test

4) Parar o banco de teste:
docker stop biblioteca-postgres-test

---

## Rodar testes frontend

cd app/frontend
npm install
npm test

> Observação sobre lockfile:
> Se o CI usar `npm ci` e falhar por mismatch do package-lock.json, gere um lockfile limpo com:
> rm -rf node_modules package-lock.json && npm install
> e commite o novo package-lock.json.

---

## Comportamento esperado do CI
1. instalar dependências (usar `npm ci` quando o lockfile estiver sincronizado);
2. iniciar serviço Postgres temporário para testes de integração e exportar TEST_DATABASE_URL;
3. rodar `npm test` (backend e frontend);
4. só se os testes passarem → construir imagens/docker; caso contrário → parar o pipeline.


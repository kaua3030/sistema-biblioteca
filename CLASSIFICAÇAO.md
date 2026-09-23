cat > TESTS.md <<'EOF'
# Testes do Sistema da Biblioteca

## Objetivo

Os testes verificam o funcionamento do backend e do frontend antes da integração do código.

## Classificacao dos testes

| Classificacao | Objetivo | Teste | Comando | PostgreSQL |
| --- | --- | --- | --- | --- |
| Smoke | Verificar se a API esta disponivel | Health check da API | `npm run test:smoke` | Não |
| Sanity | Validar funcionalidades basicas | Cadastro de livro sem titulo | `npm run test:sanity` | Não |
| Regression | Validar regras de emprestimos e devolucoes | Emprestimos, devolucoes, concorrencia e dados no banco | `npm run test:regression` | Sim |

## Testes do backend

Os testes do backend utilizam Jest, Supertest e PostgreSQL.

- Smoke: verifica se `GET /api/health` responde corretamente.
- Sanity: verifica se a API rejeita um livro sem titulo.
- Regression: verifica emprestimos, devolucoes, disponibilidade de livros, validacoes e registros no PostgreSQL.

## Testes do frontend

O frontend possui testes para:

- Formatar datas no padrao brasileiro.
- Exibir corretamente a situacao de um livro como Disponivel ou Emprestado.

## Como executar localmente

Entre na pasta do backend:

```bash
cd app/backend

Execute Smoke:

npm run test:smoke

Execute Sanity:

npm run test:sanity

Para executar Regression, inicie um PostgreSQL de teste:

docker run --rm -d --name biblioteca-postgres-test \
  -e POSTGRES_USER=biblioteca_test \
  -e POSTGRES_PASSWORD=biblioteca_test \
  -e POSTGRES_DB=biblioteca_test \
  -p 127.0.0.1:5433:5432 \
  postgres:15-alpine

Verifique se o banco esta pronto:

docker exec biblioteca-postgres-test pg_isready -U biblioteca_test -d biblioteca_test

Defina a conexao com o banco:

Em Git Bash / WSL / macOS / Linux:
export TEST_DATABASE_URL="postgresql://biblioteca_test:biblioteca_test@127.0.0.1:5433/biblioteca_test"
Em PowerShell:
$env:TEST_DATABASE_URL="postgresql://biblioteca_test:biblioteca_test@127.0.0.1:5433/biblioteca_test"

Execute Regression:

npm run test:regression

Ao terminar, encerre o banco de teste:

docker stop biblioteca-postgres-test
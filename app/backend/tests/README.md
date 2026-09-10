# Testes do backend

Os testes usam Jest, TypeScript e Supertest. As requisições passam pela aplicação
Express real, iniciada localmente pelo Supertest; não é necessário executar
`npm run dev`.

- `app.test.ts`: os dois testes existentes, de disponibilidade da API e validação
  do cadastro de livros. Não precisam de PostgreSQL.
- `emprestimos.test.ts`: testes de integração das rotas de livros, empréstimos e
  devoluções com PostgreSQL real. Conferem também os dados gravados, a
  disponibilidade do livro e solicitações simultâneas. Não simulam o banco.

## Preparar o banco de teste

Use um banco dedicado cujo nome termine em `_test`. O usuário precisa ter
permissão para criar schemas nesse banco. Cada execução cria um schema exclusivo,
usa a mesma criação de tabelas da aplicação e remove esse schema ao terminar.

Exemplo de PostgreSQL temporário com Docker, executado a partir de qualquer pasta:

```bash
docker run --rm -d --name biblioteca-postgres-test \
  -e POSTGRES_USER=biblioteca_test \
  -e POSTGRES_PASSWORD=biblioteca_test \
  -e POSTGRES_DB=biblioteca_test \
  -p 127.0.0.1:5433:5432 postgres:15-alpine

docker exec biblioteca-postgres-test pg_isready -U biblioteca_test -d biblioteca_test
```

Espere a mensagem `accepting connections` antes de executar os testes. As
credenciais acima servem somente para esse banco local descartável.

## Executar

Na pasta `app/backend`, instale as dependências e configure o endereço do banco:

```bash
npm ci
export TEST_DATABASE_URL='postgresql://biblioteca_test:biblioteca_test@127.0.0.1:5433/biblioteca_test'
npm test
```

No PowerShell, defina a variável assim antes de executar `npm test`:

```powershell
$env:TEST_DATABASE_URL = 'postgresql://biblioteca_test:biblioteca_test@127.0.0.1:5433/biblioteca_test'
```

Comandos disponíveis:

| Comando | Executa | Precisa do banco? |
| --- | --- | --- |
| `npm test` | Todos os testes do backend | Sim |
| `npm run test:unit` | Apenas os dois testes existentes de `app.test.ts` | Não |
| `npm run test:integration` | Apenas os testes de empréstimo e devolução | Sim |
| `npm run build` | Compilação da aplicação | Não |

Sem `TEST_DATABASE_URL`, a suíte de integração falha com uma mensagem de
configuração; ela não é ignorada silenciosamente. Os testes não carregam o `.env`
da aplicação. A configuração do banco usada pela API é substituída apenas durante
essa suíte.

Depois de terminar, encerre o banco descartável:

```bash
docker stop biblioteca-postgres-test
```

## Integração com o trabalho de CI/CD

O responsável pelo pipeline deve disponibilizar um serviço PostgreSQL de testes,
definir `TEST_DATABASE_URL` e executar `npm ci` e `npm test` na pasta do backend.
O comando padrão inclui os testes de integração. O frontend mantém seus comandos
próprios de instalação, testes e compilação. As imagens Docker devem ser
construídas somente depois de todos os testes passarem.

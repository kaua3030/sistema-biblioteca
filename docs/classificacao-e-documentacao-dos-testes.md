# Classificação e documentação dos testes — Sprint CI/CD

**Projeto:** Sistema Biblioteca  
**Base analisada:** branch `develop` em 23/09/2026.  
**Escopo:** testes automatizados existentes nesse pacote. Esta documentação não comprova, por si só, a execução local ou a publicação no GitHub.

## Como os testes foram classificados

| Categoria | Finalidade | Testes do projeto |
| --- | --- | --- |
| Smoke | Confirma rapidamente que a API inicia e responde. | Health check da API. |
| Sanity | Confere comportamentos pontuais após alterações. | Validação de livro sem título e duas funções de apresentação do frontend. |
| Regressão | Protege regras já implementadas contra falhas futuras. | Nove cenários de empréstimo e devolução. |

## Casos automatizados existentes

| Nº | Camada | Categoria | Cenário e resultado esperado |
| --- | --- | --- | --- |
| 1 | Backend | Smoke | `GET /api/health` responde HTTP 200 e `{ "status": "ok" }`. |
| 2 | Backend | Sanity | Cadastro de livro sem título responde HTTP 400 com `Dados inválidos`. |
| 3 | Frontend | Sanity | Data `2026-09-01` é exibida como `01/09/2026`. |
| 4 | Frontend | Sanity | Situação do livro é exibida como `Disponível` ou `Emprestado`, conforme o valor recebido. |
| 5 | Backend | Regressão | Empréstimo válido é criado (HTTP 201) e torna o livro indisponível no banco. |
| 6 | Backend | Regressão | Segundo empréstimo do mesmo livro é recusado (HTTP 409), preservando o empréstimo original. |
| 7 | Backend | Regressão | Duas solicitações simultâneas para o mesmo livro resultam em um sucesso e um conflito, com um só empréstimo ativo. |
| 8 | Backend | Regressão | Devolução registra a operação, mantém o histórico e permite novo empréstimo. |
| 9 | Backend | Regressão | Repetir uma devolução é recusado (HTTP 404) sem liberar o livro de um empréstimo posterior. |
| 10 | Backend | Regressão | Livro emprestado não pode ser excluído (HTTP 409); os registros são preservados. |
| 11 | Backend | Regressão | Empréstimo com nome do leitor vazio é recusado (HTTP 400), sem criar registro nem alterar a disponibilidade. |
| 12 | Backend | Regressão | Empréstimo com data de devolução passada é recusado (HTTP 400), sem criar registro nem alterar a disponibilidade. |
| 13 | Backend | Regressão | Empréstimo de livro inexistente é recusado (HTTP 404), sem registro parcial. |

Os casos 1 e 2 estão em `app/backend/tests/app.test.ts`; os casos 3 e 4, em `app/frontend/tests/formatadores.test.ts`; os demais, em `app/backend/tests/emprestimos.test.ts`. Os testes do backend exercitam a API; somente os cenários de empréstimo e devolução exigem PostgreSQL. Os dois testes de frontend são de funções de apresentação e não dependem da API nem do banco.

## Execução local

Ao executar todos os testes do backend, é necessário um PostgreSQL separado. A variável `TEST_DATABASE_URL` deve apontar para um banco cujo nome termine em `_test`; o código cria um esquema temporário isolado para a execução. Exemplo com Docker:

```bash
docker run --rm -d --name biblioteca-postgres-test \
  -e POSTGRES_USER=biblioteca_test \
  -e POSTGRES_PASSWORD=biblioteca_test \
  -e POSTGRES_DB=biblioteca_test \
  -p 127.0.0.1:5433:5432 postgres:15-alpine
docker exec biblioteca-postgres-test pg_isready -U biblioteca_test -d biblioteca_test
cd app/backend
npm ci
export TEST_DATABASE_URL='postgresql://biblioteca_test:biblioteca_test@127.0.0.1:5433/biblioteca_test'
npm test
```

Para executar uma categoria do backend isoladamente, no diretório `app/backend`, use `npm run test:smoke`, `npm run test:sanity` ou `npm run test:regression`. Ao terminar, execute `docker stop biblioteca-postgres-test`.

Frontend, a partir da raiz do projeto:

```bash
cd app/frontend
npm ci
npm test
```

## Execução no GitHub Actions

O workflow `.github/workflows/cd-ci.yml` do pacote analisado executa os grupos smoke, sanity e regressão com um serviço PostgreSQL; também valida Terraform. A construção das imagens Docker depende da conclusão dessas verificações. Um indicador verde no Actions comprova somente os testes incluídos naquele commit: para a apresentação, guardem o link da execução e o hash do commit correspondente.

## Estado e pendências da documentação

- O pacote analisado já contém **11 testes de backend e 2 de frontend**, superando o mínimo de 2 por camada pedido na atividade.
- Esta classificação descreve os testes existentes. Os testes adicionais mencionados na conversa da equipe, mas ainda não integrados à `develop`, não estão contados aqui.
- Os arquivos `TESTS.md` e `CLASSIFICAÇAO.md` do pacote recebido precisam ser revisados: há comandos de terminal misturados ao texto e conteúdo duplicado. Este arquivo pode servir como versão limpa para integrar ao repositório.
- Ainda é preciso registrar a evidência de uma falha proposital em teste e, depois da correção, de uma execução verde. Uma execução vermelha sem jobs iniciados não demonstra falha de teste.
- Os exemplos de testes de listagem e formulário dos PDFs devem ser implementados se essas funcionalidades foram escolhidas para a Sprint. O requisito mínimo explícito é 2 testes automatizados no backend e 2 no frontend.

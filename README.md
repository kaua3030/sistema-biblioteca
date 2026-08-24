# Sistema da Biblioteca

Aplicação web para cadastro e gerenciamento do acervo de uma biblioteca escolar. O projeto utiliza uma arquitetura com frontend e backend separados, banco de dados PostgreSQL e ferramentas de DevOps para containerização, provisionamento e configuração da infraestrutura.

## Funcionalidades

- Cadastrar, listar, consultar, editar e excluir livros.
- Pesquisar livros por título, autor ou categoria.
- Registrar empréstimos e previsões de devolução.
- Consultar empréstimos ativos.
- Registrar devoluções.
- Atualizar automaticamente a disponibilidade do livro.
- Impedir dois empréstimos ativos para o mesmo livro.
- Impedir a exclusão de um livro emprestado.

## Arquitetura

O projeto segue a opção frontend + backend proposta na atividade:

```text
Computador do frontend                Computador do backend

React + Nginx                         Node.js + Express
porta 3000          HTTP/JSON         porta 8000
       └──────────────────────────────► API REST
                                            │
                                            ▼
                                      PostgreSQL
                                      rede interna Docker
```

O frontend pode ser executado em um computador diferente do backend. A URL da API e a origem permitida pelo CORS são definidas por variáveis de ambiente.

## Tecnologias

- React
- TypeScript
- Vite
- Node.js
- Express
- Zod
- PostgreSQL
- Docker e Docker Compose
- Terraform
- Ansible
- Git e GitHub

## Estrutura do repositório

```text
.
├── app
│   ├── backend
│   │   ├── src
│   │   │   ├── routes
│   │   │   │   ├── emprestimos.ts
│   │   │   │   └── livros.ts
│   │   │   ├── app.ts
│   │   │   ├── database.ts
│   │   │   └── server.ts
│   │   └── Dockerfile
│   └── frontend
│       ├── src
│       │   ├── App.tsx
│       │   ├── api.ts
│       │   ├── index.css
│       │   └── types.ts
│       ├── nginx.conf
│       └── Dockerfile
├── ansible
├── docs
├── terraform
├── docker-compose.backend.yml
├── docker-compose.frontend.yml
└── README.md
```

## Pré-requisitos

Para executar manualmente com Docker:

- Git
- Docker Engine com Docker Compose no Linux; ou
- Docker Desktop no Windows.

Para executar a automação completa:

- Terraform
- Ansible
- Credenciais e chave SSH do provedor de infraestrutura.

## Configuração das variáveis de ambiente

Os arquivos `.env` não são enviados ao GitHub. Crie os arquivos locais a partir dos exemplos.

No Linux:

```bash
cp app/backend/.env.example app/backend/.env
cp app/frontend/.env.example app/frontend/.env
```

No PowerShell:

```powershell
Copy-Item app/backend/.env.example app/backend/.env
Copy-Item app/frontend/.env.example app/frontend/.env
```

### Backend

Exemplo para `app/backend/.env`:

```env
PORT=8000
CORS_ORIGIN=http://localhost:3000
DB_HOST=localhost
DB_PORT=5432
DB_USER=admin
DB_PASSWORD=troque_esta_senha
DB_NAME=biblioteca
```

O Docker Compose substitui `DB_HOST` pelo nome interno `banco-de-dados` quando a API é executada em container.

### Frontend

Exemplo para `app/frontend/.env`:

```env
VITE_API_URL=http://localhost:8000/api
```

Como o Vite utiliza essa variável durante a compilação, qualquer alteração em `VITE_API_URL` exige uma nova construção da imagem do frontend.

## Execução local com Docker

Na raiz do projeto, inicie primeiro o backend e o banco:

```bash
docker compose -f docker-compose.backend.yml --env-file app/backend/.env up -d --build
```

Depois inicie o frontend:

```bash
docker compose -f docker-compose.frontend.yml --env-file app/frontend/.env up -d --build
```

Acesse:

- Frontend: `http://localhost:3000`
- Verificação da API: `http://localhost:8000/api/health`

Para encerrar sem apagar os dados do banco:

```bash
docker compose -f docker-compose.frontend.yml --env-file app/frontend/.env down
docker compose -f docker-compose.backend.yml --env-file app/backend/.env down
```

Não utilize `down -v` se quiser preservar os dados armazenados no PostgreSQL.

## Execução em dois computadores

As máquinas precisam possuir conectividade de rede entre si.

### Computador do backend e banco

Configure `app/backend/.env`:

```env
CORS_ORIGIN=http://IP_DO_FRONTEND:3000
```

Inicie:

```bash
docker compose -f docker-compose.backend.yml --env-file app/backend/.env up -d --build
```

### Computador do frontend

Configure `app/frontend/.env`:

```env
VITE_API_URL=http://IP_DO_BACKEND:8000/api
```

Inicie:

```bash
docker compose -f docker-compose.frontend.yml --env-file app/frontend/.env up -d --build
```

As portas necessárias são:

- `3000/TCP` no computador do frontend.
- `8000/TCP` no computador do backend.
- `5432/TCP` permanece restrita à rede interna do Docker.

## API REST

### Livros

| Método | Rota | Operação |
|---|---|---|
| `GET` | `/api/livros` | Lista os livros |
| `GET` | `/api/livros?busca=termo` | Pesquisa livros |
| `GET` | `/api/livros/:id` | Consulta um livro |
| `POST` | `/api/livros` | Cadastra um livro |
| `PUT` | `/api/livros/:id` | Atualiza um livro |
| `DELETE` | `/api/livros/:id` | Exclui um livro |

Exemplo de livro:

```json
{
  "titulo": "Dom Casmurro",
  "autor": "Machado de Assis",
  "categoria": "Romance",
  "ano": 1899
}
```

### Empréstimos

| Método | Rota | Operação |
|---|---|---|
| `GET` | `/api/emprestimos` | Lista empréstimos ativos |
| `GET` | `/api/emprestimos?status=todos` | Lista todos os empréstimos |
| `POST` | `/api/emprestimos` | Registra um empréstimo |
| `PATCH` | `/api/emprestimos/:id/devolucao` | Registra a devolução |

Exemplo de empréstimo:

```json
{
  "livroId": 1,
  "leitor": "Maria Silva",
  "dataPrevistaDevolucao": "2026-09-01"
}
```

## Banco de dados

O backend cria as tabelas necessárias durante a inicialização:

- `livros`: mantém os dados do acervo e a disponibilidade.
- `emprestimos`: registra leitor, livro, empréstimo, previsão e devolução.

O relacionamento é garantido por chave estrangeira. Uma restrição no banco impede mais de um empréstimo ativo para o mesmo livro.

As operações de empréstimo e devolução utilizam transações. Dessa forma, o registro do empréstimo e a alteração da disponibilidade do livro são confirmados juntos ou cancelados juntos em caso de erro.

## Infraestrutura com Terraform

O Terraform é responsável por criar os recursos de infraestrutura, como máquinas virtuais, regras de firewall e endereços utilizados pelo Ansible.

```bash
cd terraform
terraform init
terraform plan
terraform apply
```

Para reproduzir a infraestrutura durante a apresentação:

```bash
terraform destroy
terraform apply
```

As credenciais do provedor, região, chave SSH, imagens das máquinas e variáveis do ambiente devem ser configuradas antes da execução.

## Configuração com Ansible

O Ansible é responsável por acessar as máquinas criadas, instalar Docker e Docker Compose, copiar ou obter o projeto, configurar cada host e iniciar seus respectivos serviços.

Após configurar os IPs e a chave SSH em `ansible/inventory.ini`:

```bash
ansible-playbook -i ansible/inventory.ini ansible/instalar-biblioteca.yml
```

O fluxo automatizado deve iniciar somente o frontend no host de frontend e somente a API com o PostgreSQL no host de backend.

## Segurança e DevSecOps

Medidas aplicadas no projeto:

- Credenciais e endereços configurados por variáveis de ambiente.
- Arquivos `.env` ignorados pelo Git.
- Validação das entradas da API com Zod.
- Consultas SQL parametrizadas.
- Exposição somente das portas necessárias.
- PostgreSQL sem publicação da porta para a rede externa.
- Restrições, chaves e transações para proteger a integridade dos dados.
- Endpoint de verificação da disponibilidade da API.

### Confidencialidade

Senhas não ficam diretamente no código-fonte e o banco não é exposto publicamente. O CORS limita a origem autorizada no navegador.

### Integridade

Validações, consultas parametrizadas, chaves estrangeiras, restrições e transações evitam dados inválidos ou alterações parciais.

### Disponibilidade

Os containers utilizam política de reinicialização e health check. O endpoint `/api/health` permite verificar se a API está respondendo.

## Gerência de configuração

O desenvolvimento é versionado no GitHub com contribuições incrementais. Os commits utilizam uma convenção baseada em tipos como:

- `feat`: nova funcionalidade.
- `fix`: correção de problema.
- `docs`: documentação.
- `chore`: manutenção e configuração.
- `refactor`: melhoria interna sem mudança funcional.

Cada integrante deve realizar pelo menos uma contribuição identificável no histórico do repositório.

## Responsabilidades da equipe

- Desenvolvimento: implementação e explicação do frontend, backend, banco e regras de negócio.
- DevOps/DevSecOps: Docker, Terraform, Ansible, infraestrutura, deploy e controles de segurança.
- Equipe: README, diagramas, testes, GitHub e compreensão do fluxo completo.

Os papéis indicam a responsabilidade principal, mas todos os integrantes devem compreender a solução e colaborar com a entrega.

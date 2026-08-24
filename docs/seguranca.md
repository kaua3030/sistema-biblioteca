# Práticas de Segurança e DevSecOps — Sistema da Biblioteca

Este documento detalha as medidas de segurança implementadas no ciclo de vida de desenvolvimento e deploy do Sistema da Biblioteca, alinhadas com os princípios de DevSecOps e Gerência de Configuração.

---

## 1. Medidas de Segurança Implementadas

### A. Proteção de Credenciais e Informações Sensíveis (Segredo Zero)
* **Ação:** Nenhuma senha, token ou chave privada é armazenada diretamente no código-fonte da aplicação.
* **Implementação:** Toda a configuração de banco de dados e credenciais de API é feita por meio de **Variáveis de Ambiente**. Além disso, o arquivo `.gitignore` foi rigorosamente configurado para impedir que arquivos locais de ambiente (como `.env`) ou chaves privadas do Ansible/Terraform sejam enviados acidentalmente para o repositório público do GitHub.

### B. Princípio do Menor Privilégio e Hardening de Redes
* **Ação:** Restrição do perímetro de ataque expondo estritamente o necessário.
* **Implementação:** Nos arquivos do Terraform e no `docker-compose.yml`, o Banco de Dados fica isolado em uma rede interna, inacessível externamente. Apenas as portas estritamente necessárias do Front-end e da API (ex: `80` e `8080`) são expostas para o tráfego externo de usuários.

### C. Validação de Dados na API e Logs Ativos
* **Ação:** Proteção contra injeções (como SQL Injection) e monitoramento de atividades perigosas.
* **Implementação:** O Back-end API implementa validações rigorosas em todos os dados recebidos nos endpoints de cadastro e alteração de livros. Paralelamente, a aplicação registra logs estruturados para auditoria de erros ou comportamentos anômalos no servidor.

---

## 2. Análise dos Pilares de Segurança (CID)

A nossa solução foi projetada considerando os três pilares fundamentais da segurança da informação:

### 🔒 Confidencialidade
Garantida através do isolamento da infraestrutura com o Terraform e da injeção segura de segredos via Ansible/Variáveis de ambiente. Dados sensíveis do banco de dados e dos usuários não ficam visíveis no repositório do GitHub e não são trafegados de forma desprotegida, assegurando que apenas pessoas e sistemas autorizados tenham acesso aos dados lidos.

### 🔄 Integridade
Garantida pelo uso do Git e pelo processo de desenvolvimento incremental e rastreável. Como cada integrante realiza commits específicos de suas funcionalidades, há total auditoria sobre quem alterou o quê. No sistema, a validação de payloads da API impede a corrupção de dados ou inserções maliciosas no banco de dados.

### ⚡ Disponibilidade
Garantida através da conteinerização com Docker. Caso um serviço sofra uma falha crítica, o container pode ser reiniciado de forma isolada sem derrubar o servidor inteiro. Além disso, a Infraestrutura como Código (Terraform + Ansible) permite recriar todo o ambiente do zero em minutos caso ocorra um desastre físico no servidor.

# Backlog de Produto - Sistema Biblioteca no Kubernetes

## Visao do produto

Disponibilizar o Sistema Biblioteca de forma confiavel em Kubernetes, com frontend e API reunidos em uma unica imagem de aplicacao. O produto deve preservar as funcoes de cadastro de livros e emprestimos, publicar versoes no GHCR e permitir escala, recuperacao de falhas e retorno a uma versao estavel quando necessario.

## Objetivo deste backlog

Este backlog organiza os requisitos das Atividades Integradoras 1 e 2 antes do planejamento das sprints. Cada item descreve uma necessidade de produto e sua condicao de aceite. Os itens estao ordenados por prioridade e ainda nao possuem responsavel, data ou status de sprint.

## Criterio de prioridade

- **P0 - Essencial:** necessario para entregar e demonstrar o sistema no Kubernetes.
- **P1 - Importante:** necessario para completar a demonstracao de operacao e manutencao.
- **P2 - Evolucao:** melhora a rastreabilidade, a seguranca ou a experiencia de operacao.

## Premissas de arquitetura

- Frontend e API devem ser entregues juntos em um unico container de aplicacao.
- O PostgreSQL continua separado como servico interno de dados.
- O PostgreSQL nao deve ficar exposto publicamente.
- O frontend e a API devem manter comunicacao configuravel por variaveis de ambiente.
- As imagens devem ser versionadas no GitHub Container Registry (GHCR).
- Os manifests Kubernetes devem permanecer versionados no mesmo repositorio.

## Product Backlog priorizado

| Ordem | ID | Epico | Historia de usuario | Prioridade | Criterios de aceite | Dependencias |
|---:|---|---|---|---|---|---|
| 1 | PB-01 | Aplicacao em um unico container | Como usuario, quero abrir a interface e usar a API do Sistema Biblioteca a partir de uma unica imagem de aplicacao para simplificar a implantacao e a demonstracao. | P0 | O frontend e compilado junto com a API; a API entrega os arquivos do frontend; apenas uma imagem da aplicacao e gerada; navegar pela interface e chamar a API funciona no mesmo container. | Nenhuma |
| 2 | PB-02 | Arquitetura de implantacao | Como equipe, queremos definir como a aplicacao unificada e o banco serao implantados no Kubernetes para que o sistema funcione como uma solucao integrada. | P0 | A aplicacao possui um unico Deployment; o banco possui responsabilidade separada; o banco permanece acessivel apenas internamente. | PB-01 |
| 3 | PB-03 | Configuracao segura | Como equipe, queremos externalizar URLs, origens permitidas e credenciais para evitar segredos no codigo e permitir ambientes diferentes. | P0 | Arquivos de exemplo existem; segredos nao entram no Git; CORS e conexao com banco sao configuraveis sem alterar o codigo. | PB-02 |
| 4 | PB-04 | Qualidade da aplicacao | Como equipe, queremos validar frontend e backend antes de publicar imagens para reduzir a chance de implantar uma versao com falha. | P0 | Testes do frontend e backend executam; falhas interrompem a publicacao; ha evidencias do resultado dos testes. | PB-01 |
| 5 | PB-05 | Imagem Docker unica | Como equipe, queremos construir uma unica imagem Docker do Sistema Biblioteca para executar a interface e a API de forma reproduzivel. | P0 | Existe um Dockerfile de aplicacao unificada; o .dockerignore esta no contexto correto; a imagem constroi sem erro; a interface e a API iniciam localmente no mesmo container. | PB-01, PB-03, PB-04 |
| 6 | PB-06 | Banco de dados no cluster | Como equipe, queremos disponibilizar o PostgreSQL de forma interna e persistente para preservar livros e emprestimos. | P0 | Banco possui armazenamento persistente; credenciais chegam por Secret; a aplicacao conecta ao banco por Service interno; porta do banco nao e publicada para usuarios externos. | PB-02, PB-03 |
| 7 | PB-07 | Publicacao no GHCR | Como equipe, queremos publicar a imagem inicial unificada no GHCR para que o cluster use uma versao rastreavel. | P0 | A imagem `1.0.0` fica disponivel; o workflow so publica apos testes aprovados; a imagem pode ser baixada com `docker pull`. | PB-04, PB-05 |
| 8 | PB-08 | Aplicacao no Kubernetes | Como bibliotecario, quero que o Sistema Biblioteca execute com duas replicas para que o acesso continue disponivel se um Pod falhar. | P0 | Existe um Deployment da aplicacao com 2 replicas; readiness e liveness probes usam endpoint de saude; dois Pods ficam `Running` e `Ready`. | PB-06, PB-07 |
| 9 | PB-09 | Acesso estavel | Como usuario, quero acessar o Sistema Biblioteca por um Service estavel para nao depender dos enderecos temporarios dos Pods. | P0 | O Service seleciona os Pods corretos; porta e targetPort correspondem ao container; a interface e a API respondem por navegador ou requisicao HTTP. | PB-08 |
| 10 | PB-10 | Implantacao inicial | Como equipe, queremos aplicar os manifests no cluster para disponibilizar a primeira versao operacional do Sistema Biblioteca. | P0 | `kubectl apply` cria os recursos; o Deployment fica disponivel; o Service e listado; a demonstracao mostra cadastro, consulta ou emprestimo funcionando. | PB-08, PB-09 |
| 11 | PB-11 | Observabilidade basica | Como equipe, queremos consultar o estado dos Pods e Deployment para identificar rapidamente se a aplicacao esta pronta. | P1 | Existe roteiro com `kubectl get pods`, `kubectl get deployments`, logs e descricao de eventos; a equipe consegue identificar Pod nao pronto. | PB-10 |
| 12 | PB-12 | Escalabilidade horizontal | Como equipe, queremos aumentar a aplicacao de 2 para 4 replicas para atender a uma demanda maior. | P1 | O Deployment chega a 4 Pods prontos; a criacao dos novos Pods e registrada; o sistema continua acessivel pelo Service. | PB-10 |
| 13 | PB-13 | Ajuste de capacidade | Como equipe, queremos reduzir a aplicacao de 4 para 2 replicas para adequar o uso de recursos quando a demanda diminuir. | P1 | O cluster termina os Pods excedentes; duas replicas permanecem prontas; o manifesto fica alinhado com a quantidade desejada. | PB-12 |
| 14 | PB-14 | Recuperacao automatica | Como equipe, queremos que o Kubernetes recrie um Pod removido para manter a disponibilidade configurada. | P1 | Um Pod controlado pelo Deployment e removido; um novo Pod e criado automaticamente; duas replicas voltam a ficar prontas. | PB-13 |
| 15 | PB-15 | Nova versao do produto | Como bibliotecario, quero receber uma melhoria pequena e visivel para confirmar que o processo de atualizacao entrega valor. | P1 | A mudanca possui teste e documentacao; o numero de versao e atualizado; a alteracao e revisavel no historico Git. | PB-04 |
| 16 | PB-16 | Publicacao da versao 1.0.1 | Como equipe, queremos publicar a nova imagem no iGHCR sem remover a versao anterior para permitir uma atualizacao segura. | P1 | A imagem `1.0.1` fica disponivel; a imagem `1.0.0` continua disponivel; tags e digests podem ser conferidos. | PB-15 |
| 17 | PB-17 | Atualizacao controlada | Como usuario, quero que o cluster atualize o Sistema Biblioteca para a nova imagem sem deixar o sistema indisponivel. | P1 | O Deployment usa a imagem `1.0.1`; o rollout termina com todas as replicas prontas; a funcionalidade alterada pode ser demonstrada. | PB-16 |
| 18 | PB-18 | Rollback | Como equipe, queremos retornar para a versao anterior se a nova versao apresentar problema. | P1 | O rollback retorna o Deployment para `1.0.0`; o rollout conclui; a aplicacao volta a responder; a equipe registra a evidencia do procedimento. | PB-17 |
| 19 | PB-19 | Documentacao operacional | Como equipe, queremos um roteiro de implantacao e recuperacao para repetir a demonstracao e operar o sistema com seguranca. | P2 | README explica pre-requisitos, deploy, acesso, escala, atualizacao e rollback; comandos usam nomes reais do projeto; segredos nao aparecem na documentacao. | PB-10, PB-18 |
| 20 | PB-20 | Evidencias da entrega | Como equipe, queremos registrar as evidencias das atividades para comprovar a implantacao e a operacao do sistema. | P2 | Repositorio possui imagem unica, manifests e workflows; existem evidencias de Pods, Service, escalabilidade, self-healing, atualizacao e rollback; a demonstracao pratica pode ser repetida. | PB-10, PB-12, PB-14, PB-17, PB-18 |

## Definition of Ready

Um item pode entrar em sprint quando:

- possui objetivo e criterio de aceite compreensivel;
- dependencias anteriores foram resolvidas;
- equipe sabe quais arquivos, imagens ou recursos Kubernetes serao afetados;
- a forma de validar o resultado esta definida.

## Definition of Done

Um item sera considerado concluido quando:

- a implementacao estiver versionada no GitHub;
- os testes aplicaveis tiverem passado;
- a documentacao e a configuracao necessarias tiverem sido atualizadas;
- a equipe tiver validado o criterio de aceite;
- a evidencia da execucao estiver registrada quando o item envolver Docker, GHCR ou Kubernetes.

## Sequencia recomendada para as sprints

1. **Sprint de base e implantacao:** PB-01 a PB-10, iniciando obrigatoriamente pela unificacao do frontend e da API em uma unica imagem.
2. **Sprint de operacao Kubernetes:** PB-11 a PB-14.
3. **Sprint de entrega e recuperacao:** PB-15 a PB-20.

Essa sequencia respeita as dependencias e permite demonstrar primeiro um sistema funcional, depois sua capacidade de operacao e por fim a atualizacao segura de versoes.

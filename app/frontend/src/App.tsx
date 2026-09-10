import { formatarData, textoSituacaoLivro } from "./formatadores";
import { useEffect, useState, type FormEvent } from "react";
import {
  atualizarLivro,
  cadastrarLivro,
  excluirLivro,
  listarEmprestimos,
  listarLivros,
  registrarDevolucao,
  registrarEmprestimo
} from "./api";
import type { Emprestimo, EmprestimoForm, Livro, LivroForm } from "./types";

const formularioInicial: LivroForm = {
  titulo: "",
  autor: "",
  categoria: "",
  ano: new Date().getFullYear()
};

function dataInicialDevolucao() {
  const data = new Date();
  data.setDate(data.getDate() + 7);
  return data.toISOString().slice(0, 10);
}

function App() {
  const [livros, setLivros] = useState<Livro[]>([]);
  const [emprestimos, setEmprestimos] = useState<Emprestimo[]>([]);
  const [formulario, setFormulario] = useState<LivroForm>(formularioInicial);
  const [formularioEmprestimo, setFormularioEmprestimo] = useState<EmprestimoForm | null>(null);
  const [livroSelecionado, setLivroSelecionado] = useState<Livro | null>(null);
  const [editandoId, setEditandoId] = useState<number | null>(null);
  const [busca, setBusca] = useState("");
  const [carregando, setCarregando] = useState(true);
  const [carregandoEmprestimos, setCarregandoEmprestimos] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [salvandoEmprestimo, setSalvandoEmprestimo] = useState(false);
  const [mensagem, setMensagem] = useState("");
  const [erro, setErro] = useState("");

  async function carregarLivros(termo = "") {
    setCarregando(true);

    try {
      setLivros(await listarLivros(termo));
    } catch (error) {
      setErro(error instanceof Error ? error.message : "Erro ao carregar livros");
    } finally {
      setCarregando(false);
    }
  }

  async function carregarEmprestimos() {
    setCarregandoEmprestimos(true);

    try {
      setEmprestimos(await listarEmprestimos());
    } catch (error) {
      setErro(error instanceof Error ? error.message : "Erro ao carregar empréstimos");
    } finally {
      setCarregandoEmprestimos(false);
    }
  }

  async function atualizarDados() {
    await Promise.all([carregarLivros(busca), carregarEmprestimos()]);
  }

  useEffect(() => {
    carregarLivros();
    carregarEmprestimos();
  }, []);

  function alterarCampo(campo: keyof LivroForm, valor: string | number) {
    setFormulario((atual) => ({ ...atual, [campo]: valor }));
  }

  function limparFormulario() {
    setFormulario(formularioInicial);
    setEditandoId(null);
  }

  async function salvarLivro(event: FormEvent) {
    event.preventDefault();
    setSalvando(true);
    setMensagem("");
    setErro("");

    try {
      if (editandoId) {
        await atualizarLivro(editandoId, formulario);
        setMensagem("Livro atualizado com sucesso");
      } else {
        await cadastrarLivro(formulario);
        setMensagem("Livro cadastrado com sucesso");
      }

      limparFormulario();
      await carregarLivros(busca);
    } catch (error) {
      setErro(error instanceof Error ? error.message : "Erro ao salvar livro");
    } finally {
      setSalvando(false);
    }
  }

  function editarLivro(livro: Livro) {
    setFormulario({
      titulo: livro.titulo,
      autor: livro.autor,
      categoria: livro.categoria,
      ano: livro.ano
    });
    setEditandoId(livro.id);
    setMensagem("");
    setErro("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function removerLivro(livro: Livro) {
    if (!window.confirm(`Excluir “${livro.titulo}”?`)) {
      return;
    }

    setMensagem("");
    setErro("");

    try {
      await excluirLivro(livro.id);
      setMensagem("Livro excluído com sucesso");
      await atualizarDados();
    } catch (error) {
      setErro(error instanceof Error ? error.message : "Erro ao excluir livro");
    }
  }

  function abrirEmprestimo(livro: Livro) {
    setLivroSelecionado(livro);
    setFormularioEmprestimo({
      livroId: livro.id,
      leitor: "",
      dataPrevistaDevolucao: dataInicialDevolucao()
    });
    setMensagem("");
    setErro("");
  }

  function fecharEmprestimo() {
    setLivroSelecionado(null);
    setFormularioEmprestimo(null);
  }

  async function salvarEmprestimo(event: FormEvent) {
    event.preventDefault();

    if (!formularioEmprestimo) {
      return;
    }

    setSalvandoEmprestimo(true);
    setMensagem("");
    setErro("");

    try {
      await registrarEmprestimo(formularioEmprestimo);
      setMensagem("Empréstimo registrado com sucesso");
      fecharEmprestimo();
      await atualizarDados();
    } catch (error) {
      setErro(error instanceof Error ? error.message : "Erro ao registrar empréstimo");
    } finally {
      setSalvandoEmprestimo(false);
    }
  }

  async function devolverLivro(emprestimo: Emprestimo) {
    if (!window.confirm(`Registrar a devolução de “${emprestimo.livroTitulo}”?`)) {
      return;
    }

    setMensagem("");
    setErro("");

    try {
      await registrarDevolucao(emprestimo.id);
      setMensagem("Devolução registrada com sucesso");
      await atualizarDados();
    } catch (error) {
      setErro(error instanceof Error ? error.message : "Erro ao registrar devolução");
    }
  }

  function pesquisar(event: FormEvent) {
    event.preventDefault();
    carregarLivros(busca);
  }

  return (
    <>
      <header className="cabecalho">
        <div className="limite">
          <span className="marca">Biblioteca Escolar</span>
          <p>Cadastro, empréstimo e gerenciamento do acervo</p>
        </div>
      </header>

      <main className="limite conteudo">
        <section className="painel formulario-painel">
          <div className="titulo-secao">
            <div>
              <span className="etiqueta">Acervo</span>
              <h1>{editandoId ? "Editar livro" : "Cadastrar livro"}</h1>
            </div>
            {editandoId && (
              <button className="botao secundario" type="button" onClick={limparFormulario}>
                Cancelar edição
              </button>
            )}
          </div>

          <form className="formulario" onSubmit={salvarLivro}>
            <label className="campo campo-grande">
              <span>Título</span>
              <input
                value={formulario.titulo}
                onChange={(event) => alterarCampo("titulo", event.target.value)}
                maxLength={150}
                required
              />
            </label>

            <label className="campo">
              <span>Autor</span>
              <input
                value={formulario.autor}
                onChange={(event) => alterarCampo("autor", event.target.value)}
                maxLength={120}
                required
              />
            </label>

            <label className="campo">
              <span>Categoria</span>
              <input
                value={formulario.categoria}
                onChange={(event) => alterarCampo("categoria", event.target.value)}
                maxLength={80}
                required
              />
            </label>

            <label className="campo">
              <span>Ano</span>
              <input
                type="number"
                min="0"
                value={formulario.ano}
                onChange={(event) => alterarCampo("ano", Number(event.target.value))}
                required
              />
            </label>

            <button className="botao principal" type="submit" disabled={salvando}>
              {salvando ? "Salvando..." : editandoId ? "Salvar alterações" : "Cadastrar livro"}
            </button>
          </form>
        </section>

        {(mensagem || erro) && (
          <div className={erro ? "aviso erro" : "aviso sucesso"}>{erro || mensagem}</div>
        )}

        {livroSelecionado && formularioEmprestimo && (
          <section className="painel">
            <div className="titulo-secao">
              <div>
                <span className="etiqueta">Circulação</span>
                <h2>Registrar empréstimo</h2>
              </div>
              <button className="botao secundario" type="button" onClick={fecharEmprestimo}>
                Cancelar
              </button>
            </div>

            <p className="emprestimo-livro">Livro: <strong>{livroSelecionado.titulo}</strong></p>

            <form className="formulario-emprestimo" onSubmit={salvarEmprestimo}>
              <label className="campo">
                <span>Nome do leitor</span>
                <input
                  value={formularioEmprestimo.leitor}
                  onChange={(event) => setFormularioEmprestimo({
                    ...formularioEmprestimo,
                    leitor: event.target.value
                  })}
                  maxLength={120}
                  required
                />
              </label>

              <label className="campo">
                <span>Previsão de devolução</span>
                <input
                  type="date"
                  min={new Date().toISOString().slice(0, 10)}
                  value={formularioEmprestimo.dataPrevistaDevolucao}
                  onChange={(event) => setFormularioEmprestimo({
                    ...formularioEmprestimo,
                    dataPrevistaDevolucao: event.target.value
                  })}
                  required
                />
              </label>

              <button className="botao principal" type="submit" disabled={salvandoEmprestimo}>
                {salvandoEmprestimo ? "Registrando..." : "Confirmar empréstimo"}
              </button>
            </form>
          </section>
        )}

        <section className="painel">
          <div className="lista-cabecalho">
            <div>
              <span className="etiqueta">Catálogo</span>
              <h2>Livros cadastrados</h2>
            </div>

            <form className="pesquisa" onSubmit={pesquisar}>
              <input
                type="search"
                placeholder="Título, autor ou categoria"
                value={busca}
                onChange={(event) => setBusca(event.target.value)}
              />
              <button className="botao secundario" type="submit">Pesquisar</button>
            </form>
          </div>

          {carregando ? (
            <p className="estado">Carregando livros...</p>
          ) : livros.length === 0 ? (
            <p className="estado">Nenhum livro encontrado.</p>
          ) : (
            <div className="tabela-container">
              <table>
                <thead>
                  <tr>
                    <th>Título</th>
                    <th>Autor</th>
                    <th>Categoria</th>
                    <th>Ano</th>
                    <th>Situação</th>
                    <th>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {livros.map((livro) => (
                    <tr key={livro.id}>
                      <td className="livro-titulo">{livro.titulo}</td>
                      <td>{livro.autor}</td>
                      <td>{livro.categoria}</td>
                      <td>{livro.ano}</td>
                      <td>
                        <span className={livro.disponivel ? "status disponivel" : "status indisponivel"}>
                          {textoSituacaoLivro(livro.disponivel)}
                        </span>
                      </td>
                      <td>
                        <div className="acoes">
                          {livro.disponivel && (
                            <button className="emprestar" type="button" onClick={() => abrirEmprestimo(livro)}>
                              Emprestar
                            </button>
                          )}
                          <button type="button" onClick={() => editarLivro(livro)}>Editar</button>
                          <button className="excluir" type="button" onClick={() => removerLivro(livro)}>
                            Excluir
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <section className="painel">
          <div className="lista-cabecalho">
            <div>
              <span className="etiqueta">Circulação</span>
              <h2>Empréstimos ativos</h2>
            </div>
          </div>

          {carregandoEmprestimos ? (
            <p className="estado">Carregando empréstimos...</p>
          ) : emprestimos.length === 0 ? (
            <p className="estado">Nenhum empréstimo ativo.</p>
          ) : (
            <div className="tabela-container">
              <table>
                <thead>
                  <tr>
                    <th>Livro</th>
                    <th>Leitor</th>
                    <th>Empréstimo</th>
                    <th>Devolução prevista</th>
                    <th>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {emprestimos.map((emprestimo) => (
                    <tr key={emprestimo.id}>
                      <td className="livro-titulo">{emprestimo.livroTitulo}</td>
                      <td>{emprestimo.leitor}</td>
                      <td>{formatarData(emprestimo.dataEmprestimo)}</td>
                      <td>{formatarData(emprestimo.dataPrevistaDevolucao)}</td>
                      <td>
                        <div className="acoes">
                          <button
                            className="devolver"
                            type="button"
                            onClick={() => devolverLivro(emprestimo)}
                          >
                            Registrar devolução
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>
    </>
  );
}

export default App;

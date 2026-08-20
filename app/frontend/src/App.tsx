import { useEffect, useState, type FormEvent } from "react";
import { atualizarLivro, cadastrarLivro, excluirLivro, listarLivros } from "./api";
import type { Livro, LivroForm } from "./types";

const formularioInicial: LivroForm = {
  titulo: "",
  autor: "",
  categoria: "",
  ano: new Date().getFullYear(),
  disponivel: true
};

function App() {
  const [livros, setLivros] = useState<Livro[]>([]);
  const [formulario, setFormulario] = useState<LivroForm>(formularioInicial);
  const [editandoId, setEditandoId] = useState<number | null>(null);
  const [busca, setBusca] = useState("");
  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [mensagem, setMensagem] = useState("");
  const [erro, setErro] = useState("");

  async function carregarLivros(termo = "") {
    setCarregando(true);
    setErro("");

    try {
      setLivros(await listarLivros(termo));
    } catch (error) {
      setErro(error instanceof Error ? error.message : "Erro ao carregar livros");
    } finally {
      setCarregando(false);
    }
  }

  useEffect(() => {
    carregarLivros();
  }, []);

  function alterarCampo(campo: keyof LivroForm, valor: string | number | boolean) {
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
      ano: livro.ano,
      disponivel: livro.disponivel
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
      await carregarLivros(busca);
    } catch (error) {
      setErro(error instanceof Error ? error.message : "Erro ao excluir livro");
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
          <p>Cadastro e gerenciamento do acervo</p>
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

            <label className="checkbox">
              <input
                type="checkbox"
                checked={formulario.disponivel}
                onChange={(event) => alterarCampo("disponivel", event.target.checked)}
              />
              Disponível para empréstimo
            </label>

            <button className="botao principal" type="submit" disabled={salvando}>
              {salvando ? "Salvando..." : editandoId ? "Salvar alterações" : "Cadastrar livro"}
            </button>
          </form>
        </section>

        {(mensagem || erro) && (
          <div className={erro ? "aviso erro" : "aviso sucesso"}>{erro || mensagem}</div>
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
                          {livro.disponivel ? "Disponível" : "Indisponível"}
                        </span>
                      </td>
                      <td>
                        <div className="acoes">
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
      </main>
    </>
  );
}

export default App;

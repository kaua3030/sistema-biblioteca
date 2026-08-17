import { useState } from 'react'
import './App.css'

function App() {
  const [livros, setLivros] = useState([
    {
      id: 1,
      titulo: 'O Pequeno Príncipe',
      autor: 'Antoine de Saint-Exupéry',
      categoria: 'Literatura',
      ano: 1943,
      disponivel: true
    },
    {
      id: 2,
      titulo: 'Dom Casmurro',
      autor: 'Machado de Assis',
      categoria: 'Literatura Brasileira',
      ano: 1899,
      disponivel: true
    },
    {
      id: 3,
      titulo: 'Harry Potter e a Pedra Filosofal',
      autor: 'J. K. Rowling',
      categoria: 'Fantasia',
      ano: 1997,
      disponivel: false
    },
    {
      id: 4,
      titulo: 'O Hobbit',
      autor: 'J. R. R. Tolkien',
      categoria: 'Fantasia',
      ano: 1937,
      disponivel: true
    },
    {
      id: 5,
      titulo: '1984',
      autor: 'George Orwell',
      categoria: 'Ficção',
      ano: 1949,
      disponivel: true
    }
  ])

  // Estado do formulário
  const [titulo, setTitulo] = useState('')
  const [autor, setAutor] = useState('')
  const [categoria, setCategoria] = useState('')
  const [ano, setAno] = useState('')
  const [disponivel, setDisponivel] = useState(true)

  // Estado da edição
  const [editandoId, setEditandoId] = useState(null)

  // Estados da busca
  const [buscaId, setBuscaId] = useState('')
  const [buscaTitulo, setBuscaTitulo] = useState('')
  const [buscaAutor, setBuscaAutor] = useState('')
  const [buscaCategoria, setBuscaCategoria] = useState('')
  const [buscaAno, setBuscaAno] = useState('')
  const [buscaDisponivel, setBuscaDisponivel] = useState('')

  // Limpar formulário
  function limparFormulario() {
    setTitulo('')
    setAutor('')
    setCategoria('')
    setAno('')
    setDisponivel(true)
    setEditandoId(null)
  }

  // Adicionar ou editar livro
  function salvarLivro(e) {
    e.preventDefault()

    if (!titulo || !autor || !categoria || !ano) {
      alert('Preencha todos os campos!')
      return
    }

    if (editandoId !== null) {
      setLivros(
        livros.map((livro) =>
          livro.id === editandoId
            ? {
                ...livro,
                titulo,
                autor,
                categoria,
                ano: Number(ano),
                disponivel
              }
            : livro
        )
      )

      limparFormulario()
      return
    }

    const novoLivro = {
      id: livros.length > 0 ? Math.max(...livros.map((l) => l.id)) + 1 : 1,
      titulo,
      autor,
      categoria,
      ano: Number(ano),
      disponivel
    }

    setLivros([...livros, novoLivro])
    limparFormulario()
  }

  // Preparar livro para edição
  function editarLivro(livro) {
    setEditandoId(livro.id)
    setTitulo(livro.titulo)
    setAutor(livro.autor)
    setCategoria(livro.categoria)
    setAno(livro.ano)
    setDisponivel(livro.disponivel)

    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    })
  }

  // Excluir livro
  function excluirLivro(id) {
    const confirmar = window.confirm(
      'Tem certeza que deseja excluir este livro?'
    )

    if (confirmar) {
      setLivros(livros.filter((livro) => livro.id !== id))
    }
  }

  // Filtrar livros
  const livrosFiltrados = livros.filter((livro) => {
    const correspondeId =
      buscaId === '' ||
      livro.id.toString().includes(buscaId)

    const correspondeTitulo =
      livro.titulo
        .toLowerCase()
        .includes(buscaTitulo.toLowerCase())

    const correspondeAutor =
      livro.autor
        .toLowerCase()
        .includes(buscaAutor.toLowerCase())

    const correspondeCategoria =
      livro.categoria
        .toLowerCase()
        .includes(buscaCategoria.toLowerCase())

    const correspondeAno =
      buscaAno === '' ||
      livro.ano.toString().includes(buscaAno)

    const correspondeDisponivel =
      buscaDisponivel === '' ||
      (buscaDisponivel === 'sim' && livro.disponivel) ||
      (buscaDisponivel === 'nao' && !livro.disponivel)

    return (
      correspondeId &&
      correspondeTitulo &&
      correspondeAutor &&
      correspondeCategoria &&
      correspondeAno &&
      correspondeDisponivel
    )
  })

  // Limpar filtros
  function limparFiltros() {
    setBuscaId('')
    setBuscaTitulo('')
    setBuscaAutor('')
    setBuscaCategoria('')
    setBuscaAno('')
    setBuscaDisponivel('')
  }

  return (
    <div className="app">

      {/* CABEÇALHO */}
      <header className="header">
        <div>
          <h1>📚 Biblioteca Escolar</h1>
          <p>Sistema de gerenciamento de livros</p>
        </div>

        <div className="total">
          <strong>{livros.length}</strong>
          <span>Livros cadastrados</span>
        </div>
      </header>

      <main>

        {/* FORMULÁRIO */}
        <section className="card">
          <h2>
            {editandoId !== null
              ? '✏️ Editar Livro'
              : '➕ Cadastrar Livro'}
          </h2>

          <form onSubmit={salvarLivro}>

            <div className="form-grid">

              <div className="campo">
                <label>Título</label>
                <input
                  type="text"
                  placeholder="Digite o título"
                  value={titulo}
                  onChange={(e) => setTitulo(e.target.value)}
                />
              </div>

              <div className="campo">
                <label>Autor</label>
                <input
                  type="text"
                  placeholder="Digite o autor"
                  value={autor}
                  onChange={(e) => setAutor(e.target.value)}
                />
              </div>

              <div className="campo">
                <label>Categoria</label>
                <input
                  type="text"
                  placeholder="Ex: Literatura"
                  value={categoria}
                  onChange={(e) => setCategoria(e.target.value)}
                />
              </div>

              <div className="campo">
                <label>Ano</label>
                <input
                  type="number"
                  placeholder="Ex: 2024"
                  value={ano}
                  onChange={(e) => setAno(e.target.value)}
                />
              </div>

              <div className="campo">
                <label>Disponibilidade</label>

                <select
                  value={disponivel ? 'sim' : 'nao'}
                  onChange={(e) =>
                    setDisponivel(e.target.value === 'sim')
                  }
                >
                  <option value="sim">Disponível</option>
                  <option value="nao">Emprestado</option>
                </select>
              </div>

            </div>

            <div className="botoes">

              <button className="btn salvar" type="submit">
                {editandoId !== null
                  ? 'Salvar Alterações'
                  : 'Cadastrar Livro'}
              </button>

              {editandoId !== null && (
                <button
                  type="button"
                  className="btn cancelar"
                  onClick={limparFormulario}
                >
                  Cancelar
                </button>
              )}

            </div>

          </form>
        </section>

        {/* BUSCA */}
        <section className="card">
          <div className="titulo-busca">
            <div>
              <h2>🔎 Buscar Livros</h2>
              <p>Use um ou vários filtros ao mesmo tempo</p>
            </div>

            <button
              className="btn limpar"
              onClick={limparFiltros}
            >
              Limpar filtros
            </button>
          </div>

          <div className="filtros">

            <div className="campo">
              <label>ID</label>
              <input
                type="text"
                placeholder="ID"
                value={buscaId}
                onChange={(e) => setBuscaId(e.target.value)}
              />
            </div>

            <div className="campo">
              <label>Título</label>
              <input
                type="text"
                placeholder="Título"
                value={buscaTitulo}
                onChange={(e) => setBuscaTitulo(e.target.value)}
              />
            </div>

            <div className="campo">
              <label>Autor</label>
              <input
                type="text"
                placeholder="Autor"
                value={buscaAutor}
                onChange={(e) => setBuscaAutor(e.target.value)}
              />
            </div>

            <div className="campo">
              <label>Categoria</label>
              <input
                type="text"
                placeholder="Categoria"
                value={buscaCategoria}
                onChange={(e) =>
                  setBuscaCategoria(e.target.value)
                }
              />
            </div>

            <div className="campo">
              <label>Ano</label>
              <input
                type="text"
                placeholder="Ano"
                value={buscaAno}
                onChange={(e) => setBuscaAno(e.target.value)}
              />
            </div>

            <div className="campo">
              <label>Disponibilidade</label>

              <select
                value={buscaDisponivel}
                onChange={(e) =>
                  setBuscaDisponivel(e.target.value)
                }
              >
                <option value="">Todos</option>
                <option value="sim">Disponíveis</option>
                <option value="nao">Emprestados</option>
              </select>
            </div>

          </div>
        </section>

        {/* TABELA */}
        <section className="card">

          <div className="resultado">
            <h2>📖 Lista de Livros</h2>

            <span>
              {livrosFiltrados.length} resultado(s)
            </span>
          </div>

          {livrosFiltrados.length === 0 ? (
            <div className="sem-livros">
              <div>📚</div>
              <h3>Nenhum livro encontrado</h3>
              <p>
                Tente alterar os filtros de pesquisa.
              </p>
            </div>
          ) : (
            <div className="tabela-container">

              <table>

                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Título</th>
                    <th>Autor</th>
                    <th>Categoria</th>
                    <th>Ano</th>
                    <th>Disponibilidade</th>
                    <th>Ações</th>
                  </tr>
                </thead>

                <tbody>

                  {livrosFiltrados.map((livro) => (
                    <tr key={livro.id}>

                      <td>
                        <strong>#{livro.id}</strong>
                      </td>

                      <td className="titulo-livro">
                        {livro.titulo}
                      </td>

                      <td>{livro.autor}</td>

                      <td>
                        <span className="categoria">
                          {livro.categoria}
                        </span>
                      </td>

                      <td>{livro.ano}</td>

                      <td>
                        {livro.disponivel ? (
                          <span className="status disponivel">
                            ● Disponível
                          </span>
                        ) : (
                          <span className="status emprestado">
                            ● Emprestado
                          </span>
                        )}
                      </td>

                      <td>
                        <div className="acoes">

                          <button
                            className="btn-editar"
                            onClick={() =>
                              editarLivro(livro)
                            }
                          >
                            ✏️
                          </button>

                          <button
                            className="btn-excluir"
                            onClick={() =>
                              excluirLivro(livro.id)
                            }
                          >
                            🗑️
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

      <footer>
        Sistema de Biblioteca Escolar • React + JavaScript
      </footer>

    </div>
  )
}

export default App
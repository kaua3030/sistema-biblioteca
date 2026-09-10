export function formatarData(data: string) {
  return new Date(`${data.slice(0, 10)}T00:00:00`).toLocaleDateString("pt-BR");
}

export function textoSituacaoLivro(disponivel: boolean) {
  return disponivel ? "Disponível" : "Emprestado";
}
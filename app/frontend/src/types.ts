export interface Livro {
  id: number;
  titulo: string;
  autor: string;
  categoria: string;
  ano: number;
  disponivel: boolean;
}

export type LivroForm = Omit<Livro, "id" | "disponivel">;

export interface Emprestimo {
  id: number;
  livroId: number;
  livroTitulo: string;
  leitor: string;
  dataEmprestimo: string;
  dataPrevistaDevolucao: string;
  dataDevolucao: string | null;
}

export interface EmprestimoForm {
  livroId: number;
  leitor: string;
  dataPrevistaDevolucao: string;
}

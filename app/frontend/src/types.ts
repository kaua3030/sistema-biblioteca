export interface Livro {
  id: number;
  titulo: string;
  autor: string;
  categoria: string;
  ano: number;
  disponivel: boolean;
}

export type LivroForm = Omit<Livro, "id">;

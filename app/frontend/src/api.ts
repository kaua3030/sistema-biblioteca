import type { Livro, LivroForm } from "./types";

const API_URL = import.meta.env.VITE_API_URL || "/api";

async function request<T>(url: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_URL}${url}`, {
    headers: { "Content-Type": "application/json" },
    ...options
  });

  if (!response.ok) {
    const data = await response.json().catch(() => null);
    throw new Error(data?.erro || "Não foi possível concluir a operação");
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json();
}

export function listarLivros(busca = "") {
  const query = busca ? `?busca=${encodeURIComponent(busca)}` : "";
  return request<Livro[]>(`/livros${query}`);
}

export function cadastrarLivro(livro: LivroForm) {
  return request<Livro>("/livros", {
    method: "POST",
    body: JSON.stringify(livro)
  });
}

export function atualizarLivro(id: number, livro: LivroForm) {
  return request<Livro>(`/livros/${id}`, {
    method: "PUT",
    body: JSON.stringify(livro)
  });
}

export function excluirLivro(id: number) {
  return request<void>(`/livros/${id}`, { method: "DELETE" });
}

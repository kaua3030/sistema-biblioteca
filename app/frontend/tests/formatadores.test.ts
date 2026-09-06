import { formatarData, textoSituacaoLivro } from "../src/formatadores.js";

describe("Formatadores do frontend", () => {
  test("deve formatar data no padrao brasileiro", () => {
    expect(formatarData("2026-09-01")).toBe("01/09/2026");
  });

  test("deve mostrar a situacao do livro", () => {
    expect(textoSituacaoLivro(true)).toBe("Disponível");
    expect(textoSituacaoLivro(false)).toBe("Emprestado");
  });
});
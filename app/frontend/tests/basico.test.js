describe("Testes básicos do frontend", () => {
  test("deve montar o nome do sistema", () => {
    const nome = "Biblioteca Escolar";

    expect(nome).toBe("Biblioteca Escolar");
  });

  test("deve indicar quando um livro está disponível", () => {
    const livro = {
      titulo: "Dom Casmurro",
      disponivel: true
    };

    expect(livro.disponivel).toBe(true);
  });
});

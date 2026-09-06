describe("Testes básicos do backend", () => {
  test("deve somar dois números", () => {
    expect(2 + 2).toBe(4);
  });

  test("deve validar um texto preenchido", () => {
    const titulo = "Dom Casmurro";

    expect(titulo.length).toBeGreaterThan(0);
  });
});
import request from "supertest";
import app from "../src/app.js";

describe("API da biblioteca", () => {
  test("deve responder o health check da API", async () => {
    const response = await request(app).get("/api/health");

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ status: "ok" });
  });

  test("deve rejeitar cadastro de livro sem titulo", async () => {
    const response = await request(app)
      .post("/api/livros")
      .send({
        titulo: "",
        autor: "Machado de Assis",
        categoria: "Romance",
        ano: 1899
      });

    expect(response.status).toBe(400);
    expect(response.body.erro).toBe("Dados inválidos");
  });
});
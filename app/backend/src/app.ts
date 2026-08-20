import cors from "cors";
import express from "express";
import { ZodError } from "zod";
import livrosRouter from "./routes/livros.js";

const app = express();

app.use(cors({ origin: process.env.CORS_ORIGIN ?? "http://localhost:3000" }));
app.use(express.json());

app.get("/api/health", (_request, response) => {
  response.json({ status: "ok" });
});

app.use("/api/livros", livrosRouter);

app.use((error: unknown, _request: express.Request, response: express.Response, _next: express.NextFunction) => {
  if (error instanceof ZodError) {
    return response.status(400).json({
      erro: "Dados inválidos",
      detalhes: error.flatten().fieldErrors
    });
  }

  console.error(error);
  return response.status(500).json({ erro: "Erro interno do servidor" });
});

export default app;

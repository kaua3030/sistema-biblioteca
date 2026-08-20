import "dotenv/config";
import app from "./app.js";
import { initializeDatabase } from "./database.js";

const port = Number(process.env.PORT) || 8000;

initializeDatabase()
  .then(() => {
    app.listen(port, () => {
      console.log(`API executando na porta ${port}`);
    });
  })
  .catch((error) => {
    console.error("Não foi possível iniciar a API", error);
    process.exit(1);
  });

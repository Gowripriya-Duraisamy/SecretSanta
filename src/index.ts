import express from 'express';
import { SantaController } from "./controllers/santa";

const app = express();

app.use(express.json());

app.post("/santa", SantaController)

app.listen(4000, () => {
    console.log("Server is listening in 4000");
});


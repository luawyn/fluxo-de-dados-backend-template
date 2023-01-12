import express, { Request, Response } from "express";
import cors from "cors";
import { accounts } from "./database";
import { ACCOUNT_TYPE } from "./types";

const app = express();

app.use(express.json());
app.use(cors());

app.listen(3003, () => {
  console.log("Servidor rodando na porta 3003");
});

app.get("/ping", (req: Request, res: Response) => {
  res.send("Pong!");
});

app.get("/accounts", (req: Request, res: Response) => {
  res.send(accounts);
});

app.get("/accounts/:id", (req: Request, res: Response) => {
  try {
    const id = req.params.id;

    const result = accounts.find((account) => account.id === id);

    if (!result) {
      res.status(400);
      throw new Error("Conta nao encontrada. Verifique a 'id'.");
    }

    res.status(200).send(result);
  } catch (error: any) {
    console.log(error);

    if (res.statusCode === 200) {
      res.status(500);
    }

    res.send(error.message);
  }
});

// - regra de negocio: toda id de conta comeca com a letra 'a'
// - caso busque uma conta sem a letra 'a' precisa apresentar um erro
app.delete("/accounts/:id", (req: Request, res: Response) => {
  try {
    const id = req.params.id;
    if (id[0] !== "a") {
      res.status(400);
      throw new Error("'id' invalido. Deve iniciar com a letra 'a'");
    }
    const accountIndex = accounts.findIndex((account) => account.id === id);

    if (accountIndex >= 0) {
      accounts.splice(accountIndex, 1);
    }
    res.status(200).send("Item deletado com sucesso");
  } catch (error: any) {
    console.log(error);
    if (res.statusCode === 200) {
      res.status(500);
    }
    res.send(error.message);
  }
});

app.put("/accounts/:id", (req: Request, res: Response) => {
  try {
    const id = req.params.id;

    const newId = req.body.id;
    const newOwnerName = req.body.ownerName;
    const newBalance = req.body.balance;
    const newType = req.body.type;

    if (newBalance !== undefined) {
      if (typeof newBalance !== "number") {
        res.status(400);
        throw new Error("'Balance' precisa ser number");
      }
      if (newBalance < 0) {
        res.status(400);
        throw new Error("'Balance' nao pode ser negativo");
      }
    }

    if (newType !== undefined) {
      if (newType !== "Ouro" && newType !== "Platina" && newType !== "Black") {
        res.status(400);
        throw new Error("'type' deve ser uma categoria valida");
      }
    }

    const account = accounts.find((account) => account.id === id);

    if (account) {
      account.id = newId || account.id;
      account.ownerName = newOwnerName || account.ownerName;
      account.type = newType || account.type;

      account.balance = isNaN(newBalance) ? account.balance : newBalance;
    }

    res.status(200).send("Atualização realizada com sucesso");
  } catch (error: any) {
    console.log(error);
    if (res.statusCode === 200) {
      res.status(500);
    }
    res.send(error.message);
  }
});

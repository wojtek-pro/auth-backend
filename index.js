import express from "express";
import cors from "cors";
import bcrypt from "bcrypt";
import { db } from "./db.js";

const app = express();
app.use(express.json());
app.use(cors());

// TEST
app.get("/", (req, res) => {
  res.send("API działa");
});

// REJESTRACJA
app.post("/register", async (req, res) => {
  const { email, password } = req.body;

  const check = await db.query(
    "SELECT * FROM users WHERE email=$1",
    [email]
  );

  if (check.rows.length > 0) {
    return res.status(400).send("User istnieje");
  }

  const hash = await bcrypt.hash(password, 10);

  await db.query(
    "INSERT INTO users (email, password) VALUES ($1, $2)",
    [email, hash]
  );

  res.send("OK");
});

// LOGIN
app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  const result = await db.query(
    "SELECT * FROM users WHERE email=$1",
    [email]
  );

  const user = result.rows[0];

  if (!user) return res.status(400).send("Brak usera");

  const ok = await bcrypt.compare(password, user.password);

  if (!ok) return res.status(401).send("Złe hasło");

  res.send("Zalogowano");
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("Server działa");
});

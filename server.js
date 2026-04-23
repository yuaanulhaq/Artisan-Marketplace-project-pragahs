import express from "express";
import path from "path";

const app = express();

// API routes
app.get("/api", (req, res) => {
  res.json({ message: "API is working ✅" });
});

// Serve frontend
const __dirname = new URL('.', import.meta.url).pathname;
app.use(express.static(path.join(__dirname, "../../web/dist")));

// Catch-all → send frontend
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../../web/dist/index.html"));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running 🚀`));

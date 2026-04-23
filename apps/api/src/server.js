import express from "express";
import path from "path";
import { fileURLToPath } from "url";

const app = express();

// Fix __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ✅ API routes
app.get("/api", (req, res) => {
  res.json({ message: "API is working ✅" });
});

// ✅ Serve frontend build
const frontendPath = path.join(__dirname, "../../web/dist");
app.use(express.static(frontendPath));

// ✅ Catch-all → React app
app.get("*", (req, res) => {
  res.sendFile(path.join(frontendPath, "index.html"));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

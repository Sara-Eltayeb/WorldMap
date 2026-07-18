import express from "express";
import cors from "cors";
import countriesRouter from "./routes/countries.js";
import { getMCPClient } from "./mcpClient.js";

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.use("/api/countries", countriesRouter);

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", service: "World Explorer MCP Backend" });
});

app.use((err, req, res, next) => {
  console.error("Unhandled error:", err);
  res.status(500).json({
    success: false,
    error: "Internal server error",
  });
});

async function start() {
  try {
    console.log("Initializing MCP client...");
    const client = await getMCPClient();
    console.log("MCP client connected successfully");

    app.listen(PORT, () => {
      console.log(`World Explorer backend running on http://localhost:${PORT}`);
      console.log(`MCP-powered API ready at http://localhost:${PORT}/api`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
}

start();

import express from "express";
import cors from "cors";
import health from "./routes/health";
import { errorHandler } from "./middleware/errorHandler";

const app = express();

app.use(cors());
app.use(express.json());

app.use("/health", health);
// later: app.use("/auth", authRoutes) etc.

app.use(errorHandler);

export default app;
import express from "express";
import cors from "cors";
import health from "./routes/health";
import { errorHandler } from "./middleware/errorHandler";
import authRoutes from "./routes/auth";
import medicineRoutes from "./routes/medicine";
import stockRoutes from "./routes/stock";
import alertRoutes from "./routes/alerts";
import publicRoutes from "./routes/public";
import reportRoutes from "./routes/reports";

const app = express();

app.use(cors({ origin: process.env.FRONTEND_URL || "http://localhost:5173" }));
app.use(express.json());

app.use("/health", health);
app.use("/auth", authRoutes);
app.use("/medicines", medicineRoutes);
app.use("/stock", stockRoutes);
app.use("/alerts", alertRoutes);
app.use("/public", publicRoutes);
app.use("/reports", reportRoutes);

app.use(errorHandler);

export default app;
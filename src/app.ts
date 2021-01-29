import express from "express";
import morgan from "morgan";
import cors from "cors";
import upload from "./routes/upload";
import { notFound, errorHandler } from "./middlewares/errorMiddleware";

const PORT = process.env.PORT || 5000;
const app = express();
app.use(cors());
app.use(express.json());
app.use(morgan("dev"));
app.use("/upload", upload);
app.use(notFound);
app.use(errorHandler);

app.listen(PORT, () => console.log(`Server running at port ${PORT}...`));

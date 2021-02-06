import express from "express";
import morgan from "morgan";
import cors from "cors";
import handlebars from "express-handlebars";
import download from "./routes/download";
import upload from "./routes/upload";
import { notFound, errorHandler } from "./middlewares/errorMiddleware";
import { getLogoURL } from "./firebase";
const PORT = process.env.PORT || 5000;
const app = express();
app.use(express.static("public"));
app.set("view engine", "hbs");
app.engine(
  "hbs",
  handlebars({
    defaultLayout: "main",
    layoutsDir: process.cwd() + "/views/layouts",
    extname: "hbs",
  })
);

app.use(cors());
app.use(express.json());
app.use(morgan("short"));
app.use("/download", download);
app.use("/upload", upload);
app.get("/logo", (req, res, next) => {
  getLogoURL()
    .then(url => res.redirect(url[0]))
    .catch(err => next(err));
});
app.use(notFound);
app.use(errorHandler);

app.listen(PORT, () => console.log(`Server running at port ${PORT}...`));

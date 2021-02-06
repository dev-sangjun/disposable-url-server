import express from "express";
import multer from "multer";
import { uploadFiles } from "../firebase";
import { v4 as uuidv4 } from "uuid";

const router = express.Router();
const upload = multer({
  limits: {
    fileSize: 8 * 1048576,
    files: 99,
  },
});
router.post("/", upload.array("files"), (req, res, next) => {
  const files = req.files as Express.Multer.File[];
  const numLimit = Number(req.body.numLimit);
  const expiresIn = Number(req.body.expiresIn);
  const uuid = uuidv4();
  uploadFiles(uuid, numLimit, expiresIn, files)
    .then(() => res.json({ uuid }))
    .catch(err => next(err));
});

export default router;

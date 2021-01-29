import express from "express";
import multer from "multer";
import mongoose from "mongoose";
import crypto from "crypto";
import path from "path";
import { v4 as uuidv4 } from "uuid";

const router = express.Router();
let endpoints: Map<string, number> = new Map<string, number>();
let num = 0;

router.get("/", (req, res, next) => {
  const uuid = uuidv4();
  endpoints.set(uuid, num++);
  console.log(endpoints);
  res.send(uuid);
});
router.get("/:id", (req, res, next) => {
  const { id } = req.params;
  const value = endpoints.get(id);
  if (value == null || value == undefined) {
    return res.send("No content available");
  }
  /*
    1. Find a matching URL
    2. Download Data
    3. Remove files from Google Drive
    4. Remove the (key, URL) pair from the map
    5. Return files
  */
  endpoints.delete(id);
  res.json({ value });
});

const upload = multer();
router.post("/", upload.array("files", 12), (req, res, next) => {
  const { files } = req;
  const uuid = uuidv4();
  /*
    Upload File to Google Drive & retrieve its URL
    Generate Key
    Add it to a dictionary [key: url]
    Return URL w/ key
  */
  endpoints.set(uuid, num++);
  res.json({
    key: uuid,
  });
});

export default router;

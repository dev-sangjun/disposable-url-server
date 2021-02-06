import express from "express";
import axios from "axios";
import {
  uploadFiles,
  getFile,
  removeURL,
  isValid,
  addURLToMap,
  checkURLMap,
} from "../firebase";
import { v4 as uuidv4 } from "uuid";
const router = express.Router();

router.get("/:uuid", (req, res, next) => {
  const { uuid } = req.params;
  isValid(uuid)
    .then(val => {
      if (val) res.render("access", { style: "access", uuid });
      else res.render("denied", { style: "denied" });
    })
    .catch(() => res.render("denied", { style: "denied" }));
});

router.get("/:uuid/files", (req, res, next) => {
  const { uuid } = req.params;
  /*
    1. Get files
    2. Remove URL
    3. Send response w/ URLs
  */
  let uuidKeys: string[] = [];
  removeURL(uuid)
    .then(() => getFile(uuid))
    .then(async data => {
      {
        await Promise.all(
          data.val().map(async (url: string, index: number) => {
            const uuidKey = await addURLToMap(uuid, url);
            uuidKeys.push(uuidKey);
          })
        );
        const baseURL = `https://disposable-url.herokuapp.com/download/${uuid}/link/`;
        res.render("files", {
          style: "files",
          length: data.val().length,
          data: uuidKeys
            .map(
              (uuidKey: string, index: number) =>
                `<div class="files-container">
                  <span>File ${index + 1}</span>
                  <a href="${
                    baseURL + uuidKey
                  }" target="_blank">Download</a><br />
                </div>`
            )
            .join(""),
        });
      }
    })
    .catch(() => res.render("denied", { style: "denied" }));
});

router.get("/:uuid/link/:uuidKey", async (req, res, next) => {
  const { uuid, uuidKey } = req.params;
  console.log(uuid, uuidKey);
  checkURLMap(uuid, uuidKey)
    .then(url => {
      axios
        .get(url)
        .then(() => res.redirect(url))
        .catch(err => {
          console.log(err.message);
          res.render("denied", { style: "denied" });
        });
    })
    .catch(() => res.render("denied", { style: "denied" }));
});

export default router;

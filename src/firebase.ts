import admin from "firebase-admin";
import { v4 as uuidv4 } from "uuid";
const serviceAccountKey = require("../config/service-account-key.json");
const firebaseApp = admin.initializeApp({
  credential: admin.credential.cert(serviceAccountKey),
  storageBucket: "disposable-url.appspot.com",
  databaseURL: "https://disposable-url-default-rtdb.firebaseio.com/",
});

const db = firebaseApp.database();
export const bucket = admin.storage().bucket();

export const uploadFiles = async (
  uuid: string,
  numLimit: number,
  expiresIn: number,
  files: Express.Multer.File[]
) => {
  let urls: string[] = [];
  const ms = expiresIn * 60 * 1000;
  await Promise.all(
    files.map(async file => {
      const path = `uploads/${uuid}/${file.originalname}`;
      const bucketFile = bucket.file(path);
      await bucketFile.save(file.buffer, {
        contentType: file.mimetype,
        gzip: true,
      });
      const [url] = await bucketFile.getSignedUrl({
        action: "read",
        expires: Date.now() + ms,
      });
      deleteFile(uuid, ms).catch(err => console.error(err));
      urls.push(url);
    })
  );
  db.ref().child(`uploads/${uuid}/urls`).set(urls);
  db.ref().child(`uploads/${uuid}/num_limit`).set(numLimit);
};

export const getFile = (uuid: string) => {
  const ref = db.ref(`uploads/${uuid}/urls`);
  return ref.once("value");
};

export const removeURL = async (uuid: string) => {
  const ref = db.ref(`uploads/${uuid}/num_limit`);
  return await ref
    .once("value")
    .then(async data => {
      const numLimit = Number(data.val());
      await ref.set(numLimit - 1);
      return numLimit;
    })
    .then(async numLimit => {
      if (numLimit <= 0) await db.ref().child(`uploads/${uuid}`).remove();
    });
};

export const getLogoURL = async () => {
  const file = bucket.file("logo.png");
  return file.getSignedUrl({
    action: "read",
    expires: "01-01-2050",
  });
};

// Checks if the uuid exists inside uploads/
export const isValid = async (uuid: string) => {
  return db
    .ref(`uploads/${uuid}`)
    .once("value")
    .then(data => data.val());
};

export const addURLToMap = async (uuid: string, url: string) => {
  const uuidKey = uuidv4();
  return db
    .ref()
    .child(`uploads/${uuid}/urlKeys/${uuidKey}`)
    .set(url)
    .then(() => uuidKey);
};

export const checkURLMap = async (uuid: string, uuidKey: string) => {
  return db
    .ref()
    .child(`uploads/${uuid}/urlKeys/${uuidKey}`)
    .once("value")
    .then(data => data.val());
};

export const deleteFromURLMap = async (uuid: string) => {
  return db.ref(`urlKeys/${uuid}`).remove();
};

const timeout = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const deleteFile = async (uuid: string, ms: number) => {
  await timeout(ms);
  return bucket
    .deleteFiles({
      prefix: `uploads/${uuid}/`,
    })
    .then(() => {
      db.ref().child(`uploads/${uuid}`).remove();
    });
};

import multer from "multer";
import crypto from "crypto";
import path from "path";

const storage = multer.diskStorage({
  destination: (res, file, cb) => {
    cb(null, "./public/images");
  },
  filename: (res, file, cb) => {
    crypto.randomBytes(12, (error, bytes) => {
      const fn = `${bytes.toString("hex") + path.extname(file.originalname)}`;
      cb(null, fn);
    });
  },
});

export const upload = multer({ storage });

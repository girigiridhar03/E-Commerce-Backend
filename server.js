import dotenv from "dotenv";
dotenv.config();
import connectToDB from "./config/db.config.js";
import app from "./app.js";

connectToDB()
  .then(() => {
    app.listen(process.env.PORT, () => {
      console.log(`Server is running on PORT: ${process.env.PORT}`);
    });
  })
  .catch((err) => {
    console.log(`Connection Failed: ${err}`);
    process.exit(1);
  });

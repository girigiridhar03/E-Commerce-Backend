import dotenv from "dotenv";
import connectToDB from "./config/db.config";
import app from "./app";
dotenv.config();

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

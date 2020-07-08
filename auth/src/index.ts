import mongoose from "mongoose";

import { app } from "./app";

// start app
const start = async () => {
  if (!process.env.JWT_KEY) {
    throw new Error("JWT_KEY must be defined");
  }

  if (!process.env.MONGO_URI) {
    throw new Error("MONGO_URI must be defined");
  }

  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useCreateIndex: true,
    });

    console.log("Connected to MongoDB");
  } catch (err) {
    console.error(err);
  }

  const PORT = 3000;

  app.listen(PORT, () => console.log(`Listening on port ${PORT}...`));
};

start();

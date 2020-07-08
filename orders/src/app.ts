// package imports
import express from "express";
import "express-async-errors";
import { json } from "body-parser";
import cookieSession from "cookie-session";
import { currentUser, errorHandler, NotFoundError } from "@ac-gittix/common";

// local imports
import { newOrderRouter } from "./routes/new";
import { indexOrderRouter } from "./routes/index";
import { showOrderRouter } from "./routes/show";
import { cancelOrderRouter } from "./routes/cancel";

const app = express();
app.set("trust proxy", true); // traffic proxied thru ingress-nginx, trust proxy HTTPS
// middlewares
app.use(json());
app.use(
  cookieSession({
    signed: false, // disable encryption, JWT is encrypted and better cross lang support
    secure: process.env.NODE_ENV !== "test", // only use cookies over HTTPS
  })
);
app.use(currentUser);

// routes
app.use(cancelOrderRouter);
app.use(indexOrderRouter);
app.use(newOrderRouter);
app.use(showOrderRouter);

// 404
app.all("*", () => {
  throw new NotFoundError();
});

// error handling
app.use(errorHandler);

export { app };

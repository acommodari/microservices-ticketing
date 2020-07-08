// package imports
import express from "express";
import "express-async-errors";
import { json } from "body-parser";
import cookieSession from "cookie-session";
import { errorHandler, NotFoundError } from "@ac-gittix/common";

// local imports
import { currentUserRouter } from "./routes/current-user";
import { signinRouter } from "./routes/signin";
import { signoutRouter } from "./routes/signout";
import { signupRouter } from "./routes/signup";

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

// routes
app.use(currentUserRouter);
app.use(signinRouter);
app.use(signoutRouter);
app.use(signupRouter);

// 404
app.all("*", () => {
  throw new NotFoundError();
});

// error handling
app.use(errorHandler);

export { app };

// package imports
import express from "express";
import "express-async-errors";
import { json } from "body-parser";
import cookieSession from "cookie-session";
import { currentUser, errorHandler, NotFoundError } from "@ac-gittix/common";

// local imports
import { newTicketRouter } from "./routes/new";
import { showTicketRouter } from "./routes/show";
import { indexTicketRouter } from "./routes/index";
import { updateTicketRouter } from "./routes/update";

const app = express();
app.set("trust proxy", true); // traffic proxied thru ingress-nginx, trust proxy HTTPS
// middlewares
app.use(json());
app.use(
  cookieSession({
    signed: false, // disable encryption, JWT is encrypted and better cross lang support
    // secure: process.env.NODE_ENV !== "test", // only use cookies over HTTPS
    secure: false,
  })
);
app.use(currentUser);

// routes
app.use(newTicketRouter);
app.use(showTicketRouter);
app.use(indexTicketRouter);
app.use(updateTicketRouter);

// 404
app.all("*", () => {
  throw new NotFoundError();
});

// error handling
app.use(errorHandler);

export { app };

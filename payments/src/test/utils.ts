import jwt from "jsonwebtoken";
import mongoose from "mongoose";

export const getFakeAuthCookie = (id?: string) => {
  // build a JWT payload { id, email }
  const payload = {
    id: id || generateMongoId(),
    email: "test@test.com",
  };

  // create the JWT
  const token = jwt.sign(payload, process.env.JWT_KEY!);

  // build session Object { jwt: MY_JWT }
  const session = { jwt: token };

  // turn session into JSON
  const sessionJSON = JSON.stringify(session);

  // take JSON and encode it as base64
  const base64 = Buffer.from(sessionJSON).toString("base64");

  // return string that replicates the cookie (in array for supertest)
  return [`express:sess=${base64}`];
};

export const generateMongoId = () => {
  return new mongoose.Types.ObjectId().toHexString();
};

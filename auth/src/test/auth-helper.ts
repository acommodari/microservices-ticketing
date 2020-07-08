import request from "supertest";
import { app } from "../app";

export const getAuthCookie = async () => {
  const email = "test@test.com";
  const password = "password";

  const authResponse = await request(app)
    .post("/api/users/signup")
    .send({ email, password })
    .expect(201);

  return authResponse.get("Set-Cookie");
};

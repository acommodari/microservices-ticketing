import request from "supertest";
import mongoose from "mongoose";

import { getFakeAuthCookie, generateMongoId } from "../../test/utils";
import { app } from "../../app";

it("returns a 404 if the ticket is not found", async () => {
  const id = generateMongoId();

  await request(app).get(`/api/tickets/${id}`).send().expect(404);
});

it("returns the ticket if the ticket is found", async () => {
  const title = "title";
  const price = 20;

  const response = await request(app)
    .post("/api/tickets")
    .set("Cookie", getFakeAuthCookie())
    .send({ title, price })
    .expect(201);

  const ticketResponse = await request(app)
    .get(`/api/tickets/${response.body.id}`)
    .send()
    .expect(200);

  expect(ticketResponse.body.title).toEqual(title);
  expect(ticketResponse.body.price).toEqual(price);
});

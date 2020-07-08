import request from "supertest";

import { app } from "../../app";
import { getFakeAuthCookie, generateMongoId } from "../../test/utils";
import { natsWrapper } from "../../nats-wrapper";
import { Ticket } from "../../models/ticket";

it("returns a 404 if the provided id does not exist", async () => {
  const id = generateMongoId();

  await request(app)
    .put(`/api/tickets/${id}`)
    .set("Cookie", getFakeAuthCookie())
    .send({ title: "title", price: 20 })
    .expect(404);
});

it("returns a 401 if the user is not authenticated", async () => {
  const id = generateMongoId();

  await request(app)
    .put(`/api/tickets/${id}`)
    .send({ title: "title", price: 20 })
    .expect(401);
});

it("returns a 401 if the user does not own the ticket", async () => {
  const title = "title";
  const price = 20;

  const response = await request(app)
    .post("/api/tickets")
    .set("Cookie", getFakeAuthCookie())
    .send({ title, price });

  await request(app)
    .put(`/api/tickets/${response.body.id}`)
    .set("Cookie", getFakeAuthCookie())
    .send({ title: "updated title", price: 10 })
    .expect(401);

  const ticketResponse = await request(app)
    .get(`/api/tickets/${response.body.id}`)
    .send();

  expect(ticketResponse.body.title).toEqual(title);
  expect(ticketResponse.body.price).toEqual(price);
});

it("returns a 400 if the user provides an invalid title or price", async () => {
  const cookie = getFakeAuthCookie();

  const response = await request(app)
    .post("/api/tickets")
    .set("Cookie", cookie)
    .send({ title: "title", price: 20 });

  await request(app)
    .put(`/api/tickets/${response.body.id}`)
    .set("Cookie", cookie)
    .send({ title: "", price: 20 })
    .expect(400);

  await request(app)
    .put(`/api/tickets/${response.body.id}`)
    .set("Cookie", cookie)
    .send({ price: 20 })
    .expect(400);

  await request(app)
    .put(`/api/tickets/${response.body.id}`)
    .set("Cookie", cookie)
    .send({ title: "title", price: -20 })
    .expect(400);

  await request(app)
    .put(`/api/tickets/${response.body.id}`)
    .set("Cookie", cookie)
    .send({ title: "title" })
    .expect(400);
});

it("updates the ticket provided valid inputs", async () => {
  const cookie = getFakeAuthCookie();

  const response = await request(app)
    .post("/api/tickets")
    .set("Cookie", cookie)
    .send({ title: "title", price: 20 });

  const title = "updated title";
  const price = 10;

  await request(app)
    .put(`/api/tickets/${response.body.id}`)
    .set("Cookie", cookie)
    .send({ title, price })
    .expect(200);

  const ticketResponse = await request(app)
    .get(`/api/tickets/${response.body.id}`)
    .send();

  expect(ticketResponse.body.title).toEqual(title);
  expect(ticketResponse.body.price).toEqual(price);
});

it("publishes an event", async () => {
  const cookie = getFakeAuthCookie();

  const response = await request(app)
    .post("/api/tickets")
    .set("Cookie", cookie)
    .send({ title: "title", price: 20 });

  const title = "updated title";
  const price = 10;

  await request(app)
    .put(`/api/tickets/${response.body.id}`)
    .set("Cookie", cookie)
    .send({ title, price })
    .expect(200);

  expect(natsWrapper.client.publish).toHaveBeenCalled();
});

it("rejects updates if the ticket is reserved", async () => {
  const cookie = getFakeAuthCookie();

  const response = await request(app)
    .post("/api/tickets")
    .set("Cookie", cookie)
    .send({ title: "title", price: 20 });

  const ticket = await Ticket.findById(response.body.id);
  ticket!.set({ orderId: generateMongoId() });
  await ticket!.save();

  const title = "updated title";
  const price = 10;

  await request(app)
    .put(`/api/tickets/${response.body.id}`)
    .set("Cookie", cookie)
    .send({ title, price })
    .expect(400);
});

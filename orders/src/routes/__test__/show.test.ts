import request from "supertest";

import { app } from "../../app";
import { getFakeAuthCookie, generateMongoId } from "../../test/utils";
import { Ticket } from "../../models/ticket";

it("fetches the order", async () => {
  // Create a ticket
  const ticket = Ticket.build({
    id: generateMongoId(),
    title: "concert",
    price: 20,
  });
  await ticket.save();

  // Make request to build an order with this ticket
  const user = getFakeAuthCookie();
  const { body: order } = await request(app)
    .post("/api/orders")
    .set("Cookie", user)
    .send({ ticketId: ticket.id })
    .expect(201);

  // Make request to fetch the order
  const { body: fetchedOrder } = await request(app)
    .get(`/api/orders/${order.id}`)
    .set("Cookie", user)
    .send()
    .expect(200);

  expect(fetchedOrder.id).toEqual(order.id);
});

it("returns an error if one user tries to fetch another users order", async () => {
  // Create a ticket
  const ticket = Ticket.build({
    id: generateMongoId(),
    title: "concert",
    price: 20,
  });
  await ticket.save();

  // Make request to build an order with this ticket
  const { body: order } = await request(app)
    .post("/api/orders")
    .set("Cookie", getFakeAuthCookie())
    .send({ ticketId: ticket.id })
    .expect(201);

  // Make request to fetch the order
  await request(app)
    .get(`/api/orders/${order.id}`)
    .set("Cookie", getFakeAuthCookie())
    .send()
    .expect(401);
});

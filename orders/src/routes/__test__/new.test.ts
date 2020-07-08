import request from "supertest";

import { app } from "../../app";
import { generateMongoId, getFakeAuthCookie } from "../../test/utils";
import { Order, OrderStatus } from "../../models/order";
import { Ticket } from "../../models/ticket";
import { natsWrapper } from "../../nats-wrapper";

// Tests not exhaustive, a lot could be improved upon
it("returns an error if the ticket does not exist", async () => {
  const ticketId = generateMongoId();

  await request(app)
    .post("/api/orders")
    .set("Cookie", getFakeAuthCookie())
    .send({ ticketId })
    .expect(404);
});

it("returns an error if the titcket is already reserved", async () => {
  const ticket = Ticket.build({
    id: generateMongoId(),
    title: "concert",
    price: 20,
  });
  await ticket.save();

  const order = Order.build({
    ticket,
    userId: "1",
    status: OrderStatus.Created,
    expiresAt: new Date(),
  });
  await order.save();

  await request(app)
    .post("/api/orders")
    .set("Cookie", getFakeAuthCookie())
    .send({ ticketId: ticket.id })
    .expect(400);
});

it("reserves a ticket", async () => {
  const ticket = Ticket.build({
    id: generateMongoId(),
    title: "concert",
    price: 20,
  });
  await ticket.save();

  await request(app)
    .post("/api/orders")
    .set("Cookie", getFakeAuthCookie())
    .send({ ticketId: ticket.id })
    .expect(201);
});

it("emits an order created event", async () => {
  const ticket = Ticket.build({
    id: generateMongoId(),
    title: "concert",
    price: 20,
  });
  await ticket.save();

  await request(app)
    .post("/api/orders")
    .set("Cookie", getFakeAuthCookie())
    .send({ ticketId: ticket.id })
    .expect(201);

  expect(natsWrapper.client.publish).toHaveBeenCalled();
});

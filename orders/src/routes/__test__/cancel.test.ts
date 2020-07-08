import request from "supertest";

import { app } from "../../app";
import { getFakeAuthCookie, generateMongoId } from "../../test/utils";
import { Ticket } from "../../models/ticket";
import { Order, OrderStatus } from "../../models/order";
import { natsWrapper } from "../../nats-wrapper";

it("marks an order as cancelled", async () => {
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

  // Make request to cancel the order
  await request(app)
    .patch(`/api/orders/${order.id}`)
    .set("Cookie", user)
    .send()
    .expect(200);

  // Expectation to make sure the order is cancelled
  const updatedOrder = await Order.findById(order.id);

  expect(updatedOrder!.status).toEqual(OrderStatus.Cancelled);
});

it("emits an order cancelled event", async () => {
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

  // Make request to cancel the order
  await request(app)
    .patch(`/api/orders/${order.id}`)
    .set("Cookie", user)
    .send()
    .expect(200);

  expect(natsWrapper.client.publish).toHaveBeenCalled();
});

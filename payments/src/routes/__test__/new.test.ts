import request from "supertest";

import { app } from "../../app";
import { getFakeAuthCookie, generateMongoId } from "../../test/utils";
import { Order } from "../../models/order";
import { OrderStatus } from "@ac-gittix/common";
import { stripe } from "../../stripe";
import { Payment } from "../../models/payment";

jest.mock("../../stripe.ts");

it("returns a 404 when purchasing an order that does not exist", async () => {
  await request(app)
    .post("/api/payments")
    .set("Cookie", getFakeAuthCookie())
    .send({ token: "token", orderId: generateMongoId() })
    .expect(404);
});

it("returns a 401 when purchasing an order that does not belong to the user", async () => {
  const order = Order.build({
    id: generateMongoId(),
    userId: generateMongoId(),
    version: 0,
    price: 10,
    status: OrderStatus.Created,
  });
  await order.save();

  await request(app)
    .post("/api/payments")
    .set("Cookie", getFakeAuthCookie())
    .send({ token: "token", orderId: order.id })
    .expect(401);
});

it("returns a 400 when purchasing a cancelled order", async () => {
  const userId = generateMongoId();
  const order = Order.build({
    id: generateMongoId(),
    userId,
    version: 0,
    price: 10,
    status: OrderStatus.Cancelled,
  });
  await order.save();

  await request(app)
    .post("/api/payments")
    .set("Cookie", getFakeAuthCookie(userId))
    .send({ token: "token", orderId: order.id })
    .expect(400);
});

it("returns a 201 with valid inputs", async () => {
  const userId = generateMongoId();
  const order = Order.build({
    id: generateMongoId(),
    userId,
    version: 0,
    price: 10,
    status: OrderStatus.Created,
  });
  await order.save();

  const { body } = await request(app)
    .post("/api/payments")
    .set("Cookie", getFakeAuthCookie(userId))
    .send({ token: "tok_visa", orderId: order.id })
    .expect(201);

  const chargeOptions = (stripe.charges.create as jest.Mock).mock.calls[0][0];
  expect(chargeOptions.source).toEqual("tok_visa");
  expect(chargeOptions.amount).toEqual(1000);
  expect(chargeOptions.currency).toEqual("usd");

  const payment = await Payment.findOne({
    orderId: order.id,
    stripeId: body.stripeId,
  });

  expect(payment).not.toBeNull();
});

import {
  Listener,
  PaymentCreatedEvent,
  Subjects,
  OrderStatus,
} from "@ac-gittix/common";
import { Message } from "node-nats-streaming";

import { queueGroupName } from "./queue-group-name";
import { Order } from "../../models/order";

export class PaymentCreatedListener extends Listener<PaymentCreatedEvent> {
  readonly subject = Subjects.PaymentCreated;
  queueGroupName = queueGroupName;

  async onMessage(data: PaymentCreatedEvent["data"], msg: Message) {
    const order = await Order.findById(data.orderId);

    if (!order) {
      throw new Error("Order not found");
    }

    order.set({ status: OrderStatus.Complete });
    await order.save();
    // normally we should publish an event since we are saving and thus incrementing the version
    // however in the context of this app we are assuming that we will no longer update an order after its completed (shortcut)

    msg.ack();
  }
}

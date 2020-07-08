import { Publisher, Subjects, OrderCancelledEvent } from "@ac-gittix/common";

export class OrderCancelledPublisher extends Publisher<OrderCancelledEvent> {
  readonly subject = Subjects.OrderCancelled;
}

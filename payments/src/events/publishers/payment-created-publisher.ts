import { Publisher, PaymentCreatedEvent, Subjects } from "@ac-gittix/common";

export class PaymentCreatedPublisher extends Publisher<PaymentCreatedEvent> {
  readonly subject = Subjects.PaymentCreated;
}

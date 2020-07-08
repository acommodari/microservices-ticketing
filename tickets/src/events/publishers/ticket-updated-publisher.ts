import { Publisher, Subjects, TicketUpdatedEvent } from "@ac-gittix/common";

export class TicketUpdatedPublisher extends Publisher<TicketUpdatedEvent> {
  readonly subject = Subjects.TicketUpdated;
}

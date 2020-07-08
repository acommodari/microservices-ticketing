import { Publisher, Subjects, TicketCreatedEvent } from "@ac-gittix/common";

export class TicketCreatedPublisher extends Publisher<TicketCreatedEvent> {
  readonly subject = Subjects.TicketCreated;
}

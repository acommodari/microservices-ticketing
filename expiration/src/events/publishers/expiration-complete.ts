import {
  Publisher,
  ExpirationCompleteEvent,
  Subjects,
} from "@ac-gittix/common";

export class ExpirationCompletePublisher extends Publisher<
  ExpirationCompleteEvent
> {
  readonly subject = Subjects.ExpirationComplete;
}

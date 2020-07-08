import { TicketUpdatedEvent } from "@ac-gittix/common";
import { Message } from "node-nats-streaming";

import { TicketUpdatedListener } from "../ticket-updated-listener";
import { natsWrapper } from "../../../nats-wrapper";
import { generateMongoId } from "../../../test/utils";
import { Ticket } from "../../../models/ticket";

const setup = async () => {
  // create an instance of the listener
  const listener = new TicketUpdatedListener(natsWrapper.client);

  // create and save a ticket
  const ticket = Ticket.build({
    id: generateMongoId(),
    title: "concert",
    price: 10,
  });
  await ticket.save();

  // create a fake data event
  const { id, version } = ticket;
  const data: TicketUpdatedEvent["data"] = {
    version: version + 1,
    id,
    title: "new concert",
    price: 20,
    userId: generateMongoId(),
  };

  // create a fake message object
  // @ts-ignore
  const msg: Message = {
    ack: jest.fn(),
  };

  return { listener, ticket, data, msg };
};

it("finds, updates, and saves a ticket", async () => {
  const { listener, ticket, data, msg } = await setup();

  // call the onMessage function with the data object + message object
  await listener.onMessage(data, msg);

  // write assertions to make sure a ticket was updated
  const updatedTicket = await Ticket.findById(ticket.id);

  expect(updatedTicket!.title).toEqual(data.title);
  expect(updatedTicket!.price).toEqual(data.price);
  expect(updatedTicket!.version).toEqual(data.version);
});

it("acks the message", async () => {
  const { listener, data, msg } = await setup();

  // call the onMessage function with the data object + message object
  await listener.onMessage(data, msg);

  // write assertions to make sure ack function is called
  expect(msg.ack).toHaveBeenCalled();
});

it("does not call ack inf the event has a skipped version number", async () => {
  const { listener, data, msg } = await setup();

  // set verison to future version
  data.version = 10;

  // call the onMessage function with the data object + message object
  try {
    await listener.onMessage(data, msg);
  } catch (err) {}

  // write assertions to make sure ack function is not called
  expect(msg.ack).not.toHaveBeenCalled();
});

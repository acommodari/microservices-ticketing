import { randomBytes } from "crypto";

export const stripe = {
  charges: {
    create: jest.fn().mockResolvedValue({ id: randomBytes(4).toString("hex") }),
  },
};

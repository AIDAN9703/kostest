import { relations } from "drizzle-orm";
import { boatAddOns } from "../tables/boatAddOns.table";
import { boats } from "../tables/boats.table";
import { addOns } from "../tables/addOns.table";

export const boatAddOnsRelations = relations(boatAddOns, ({ one }) => ({
  boat: one(boats, {
    fields: [boatAddOns.boatId],
    references: [boats.id],
  }),
  addOn: one(addOns, {
    fields: [boatAddOns.addOnId],
    references: [addOns.id],
  }),
}));

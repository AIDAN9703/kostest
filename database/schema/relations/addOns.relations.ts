import { relations } from "drizzle-orm";
import { addOns } from "../tables/addOns.table";
import { boatAddOns } from "../tables/boatAddOns.table";

export const addOnsRelations = relations(addOns, ({ many }) => ({
  boatAddOns: many(boatAddOns),
}));

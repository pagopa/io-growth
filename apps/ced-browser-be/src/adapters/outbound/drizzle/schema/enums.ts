import { pgEnum } from "drizzle-orm/pg-core";

export const placeTypeEnum = pgEnum("place_type", ["online", "offline"]);

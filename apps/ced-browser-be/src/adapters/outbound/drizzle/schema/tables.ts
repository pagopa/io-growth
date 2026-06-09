import {
  char,
  customType,
  pgMaterializedView,
  varchar,
} from "drizzle-orm/pg-core";

import { placeTypeEnum } from "./enums.js";

const tsvector = customType<{ data: string }>({ dataType: () => "tsvector" });

export const placeMaterializedView = pgMaterializedView(
  "place_materialized_view",
  {
    city: varchar({ length: 255 }),
    country: varchar({ length: 255 }),
    id: char({ length: 26 }).notNull(),
    name: varchar({ length: 512 }),
    operatorId: char("operator_id", { length: 26 }),
    postalCode: varchar("postal_code", { length: 20 }),
    profileDisplayName: varchar("profile_display_name", { length: 512 }),
    profileId: char("profile_id", { length: 26 }),
    searchVectorCity: tsvector("search_vector_city"),
    searchVectorDisplayName: tsvector("search_vector_display_name"),
    searchVectorName: tsvector("search_vector_name"),
    state: varchar({ length: 255 }),
    street: varchar({ length: 512 }),
    type: placeTypeEnum(),
    url: varchar({ length: 2048 }),
  },
).existing();

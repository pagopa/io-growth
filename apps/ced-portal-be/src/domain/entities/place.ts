import type { SupportContact } from "./support-contact.js";

export interface Address {
  readonly city: string;
  readonly country: string;
  readonly postalCode: string;
  readonly street: string;
}

export interface OfflinePlace {
  readonly address: Address;
  readonly name: string;
  readonly supportContacts: SupportContact[];
  readonly type: "offline";
}

export interface OnlinePlace {
  readonly name: string;
  readonly supportContacts: SupportContact[];
  readonly type: "online";
  readonly website: string;
}

export type OperatorPlace = OfflinePlace | OnlinePlace;

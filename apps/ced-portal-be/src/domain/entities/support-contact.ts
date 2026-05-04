export interface SupportContact {
  readonly type: "email" | "phone" | "website";
  readonly value: string;
}

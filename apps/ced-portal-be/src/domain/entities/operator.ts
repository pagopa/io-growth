export interface CreateOperatorInput {
  readonly externalId: string;
  readonly name: string;
  readonly status: "active";
}

export interface Operator {
  readonly id: string;
  readonly name: string;
}

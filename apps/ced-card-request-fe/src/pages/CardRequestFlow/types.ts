export interface StepRef {
  validate: () => boolean | Promise<boolean>;
}

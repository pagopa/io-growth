export const ASSISTANCE_TOPICS = [
  'technical_issue',
  'program_info',
  'agreement_support',
] as const;

export type AssistanceTopic = (typeof ASSISTANCE_TOPICS)[number];

export type AssistanceStep = 'topic' | 'contacts';

export const isAssistanceTopic = (value: string): value is AssistanceTopic =>
  (ASSISTANCE_TOPICS as readonly string[]).includes(value);

const NEXT_STEP_BY_TOPIC: Record<AssistanceTopic, AssistanceStep | null> = {
  technical_issue: 'contacts',
  program_info: null,
  agreement_support: null,
};

export const getNextStep = (topic: AssistanceTopic): AssistanceStep | null =>
  NEXT_STEP_BY_TOPIC[topic];

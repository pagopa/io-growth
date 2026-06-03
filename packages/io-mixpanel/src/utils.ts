export const isEnvConfigEnabled = (envVariable: string | undefined): boolean =>
  envVariable === 'true' ? true : false;

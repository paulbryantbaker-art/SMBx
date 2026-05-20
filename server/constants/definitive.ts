export const DEFINITIVE_SPEC_VERSION = 'DEFINITIVE.v1.0';
export const DEFINITIVE_SPEC_URI = 'definitive://v1';
export const DEFINITIVE_METHODOLOGY_VERSION = 'V19';
export const DEFINITIVE_METHODOLOGY_URI = 'methodology://v19';

export function definitiveVersionPayload() {
  return {
    specVersion: DEFINITIVE_SPEC_VERSION,
    specUri: DEFINITIVE_SPEC_URI,
    methodologyVersion: DEFINITIVE_METHODOLOGY_VERSION,
    methodologyUri: DEFINITIVE_METHODOLOGY_URI,
  };
}

import type { SampleAuthorityRef } from './types.js';

export const sampleAuthorities = {
  workingCapital: {
    id: 'AUTH.SAMPLE.ABA.WORKING_CAPITAL',
    label: 'Working capital target and true-up mechanics',
    citation: 'Sample fixture for ABA-style private-target working-capital mechanics.',
  },
  section1060: {
    id: 'AUTH.SAMPLE.IRC.1060',
    label: 'Special allocation rules for applicable asset acquisitions',
    citation: 'IRC section 1060 and Treas. Reg. section 1.1060-1 sample reference.',
  },
  firpta: {
    id: 'AUTH.SAMPLE.IRC.1445',
    label: 'FIRPTA withholding on U.S. real property interests',
    citation: 'IRC section 1445 and IRS Forms 8288 / 8288-A sample reference.',
  },
  indemnity: {
    id: 'AUTH.SAMPLE.ABA.PRIVATE_TARGET_2023',
    label: 'Private-target indemnity cap, basket, and survival mechanics',
    citation: 'Sample fixture for ABA Private Target Deal Points-style economics.',
  },
} satisfies Record<string, SampleAuthorityRef>;

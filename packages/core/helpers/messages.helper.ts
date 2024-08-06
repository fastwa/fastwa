import { colors } from '@fastwa/common';

export const MESSAGES = {
  APPLICATION_START: (release: string) => `
   ${colors.cyan(`🐦 Fastwa v${release}`)}
   - License:       MIT
   - Documentation: https://fastwa.org
  `,
  APPLICATION_READY: 'Ready'
};

export const VERSION_MESSAGE = (version: string) => `Release v${version}`;

export const MODULE_INIT_MESSAGE = (module: string) =>
  `${module} dependencies initialized`;

export const MAPPED_INTERACTION_MESSAGE = (command: string) =>
  `Interaction mapped ${command}`;

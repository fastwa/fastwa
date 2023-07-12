export const MESSAGES = {
  APPLICATION_START: 'Starting Fastwa application...',
  APPLICATION_READY: 'Fastwa application successfully started'
};

export const VERSION_MESSAGE = (version: string) => `Using v${version} release`;

export const MODULE_INIT_MESSAGE = (module: string) =>
  `${module} dependencies initialized`;

export const MAPPED_COMMAND_MESSAGE = (command: string) =>
  `Mapped {${command}} command`;

export const MAPPED_REACTION_MESSAGE = (command: string) =>
  `Mapped {${command}} reaction`;

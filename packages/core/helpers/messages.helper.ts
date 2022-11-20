export const MESSAGES = {
  APPLICATION_START: 'Starting PlayWA application...',
  APPLICATION_READY: 'PlayWA application successfully started',
}

export const MODULE_INIT_MESSAGE = (module: string) => 
  `${module} dependencies initialized`;

export const MAPPED_COMMAND_MESSAGE = (command: string) =>
  `Mapped {${command}} command`;

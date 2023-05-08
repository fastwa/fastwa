export const MESSAGE_REGEX = {
  VARIABLE: /:(\w+)/g,
  PARAM_KEYS: /(?<=:)(\w+)/g
};

export function createCommandRegex(commandParams: string) {
  const sanitizedCmd = commandParams.replace('/', '\\/').replace(/\s+/g, '\\s');

  return new RegExp(`^${sanitizedCmd}$`, 'g');
}

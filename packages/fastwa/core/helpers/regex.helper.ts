export const MESSAGE_REGEX = {
  PARAMETER: /:(\w+)/g,
  PARAM_KEYS: /(?<=:)(\w+)/g
};

export function createCommandRegex(commandParams: string) {
  const sanitizedCmd = commandParams.replace(/[/\s+]/g, (match) =>
    match === '/' ? '/' : '\\s'
  );

  return new RegExp(`^${sanitizedCmd}$`, 'g');
}

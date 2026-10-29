const enabled = process.stdout.isTTY && !process.env.NO_COLOR;

const color = (open: number, close: number) => (text: string) =>
  enabled ? `\u001b[${open}m${text}\u001b[${close}m` : text;

export const bold = color(1, 22);
export const cyan = color(36, 39);
export const green = color(32, 39);
export const red = color(31, 39);
export const yellow = color(33, 39);

const C_GREEN = '\x1B[32m';
const F_BOLD = '\x1B[1m';
const NO_FORMAT = '\x1B[0m';
const C_DEEPSKYBLUE = '\x1B[38;5;38m';

export const colors = {
  bold: (text: string) => `${F_BOLD}${text}${NO_FORMAT}`,
  cyan: (text: string) => `${F_BOLD}${C_DEEPSKYBLUE}${text}${NO_FORMAT}`,
  green: (text: string) => `${F_BOLD}${C_GREEN}${text}${NO_FORMAT}`,
  yellow: (text: string) => `\x1B[38;5;3m${text}\x1B[39m`
};

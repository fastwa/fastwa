export const monospace = <T extends string>(text: T): `\`\`\`${T}\`\`\`` =>
  `\`\`\`${text}\`\`\``;

export const italic = <T extends string>(text: T): `_${T}_` => `_${text}_`;

export const bold = <T extends string>(text: T): `*${T}*` => `*${text}*`;

export const strikethrough = <T extends string>(text: T): `~${T}~` =>
  `~${text}~`;

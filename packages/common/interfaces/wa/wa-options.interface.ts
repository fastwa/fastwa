import { UserFacingSocketConfig } from "@adiwajshing/baileys";

export type WAOptions = UserFacingSocketConfig & {
  saveCreds?: () => Promise<void>;
};

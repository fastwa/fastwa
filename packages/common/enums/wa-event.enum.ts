import { BaileysEvent } from '@whiskeysockets/baileys';

export enum WAEvent {
  CONNECTION_UPDATE = 'connection.update',
  CREDS_UPDATE = 'creds.update',
  MESSAGING_HISTORY_SET = 'messaging-history.set',
  MESSAGING_HISTORY_STATUS = 'messaging-history.status',
  CHATS_UPSERT = 'chats.upsert',
  CHATS_UPDATE = 'chats.update',
  CHATS_DELETE = 'chats.delete',
  CHATS_LOCK = 'chats.lock',
  LID_MAPPING_UPDATE = 'lid-mapping.update',
  PRESENCE_UPDATE = 'presence.update',
  CONTACTS_UPSERT = 'contacts.upsert',
  CONTACTS_UPDATE = 'contacts.update',
  MESSAGES_DELETE = 'messages.delete',
  MESSAGES_UPDATE = 'messages.update',
  MESSAGES_UPSERT = 'messages.upsert',
  MESSAGES_MEDIA_UPDATE = 'messages.media-update',
  MESSAGES_REACTION = 'messages.reaction',
  MESSAGE_RECEIPT_UPDATE = 'message-receipt.update',
  /** @deprecated Use `MESSAGE_RECEIPT_UPDATE` */
  MESSAGES_RECEIPT_UPDATE = 'message-receipt.update',
  MESSAGE_CAPPING_UPDATE = 'message-capping.update',
  GROUPS_UPSERT = 'groups.upsert',
  GROUPS_UPDATE = 'groups.update',
  GROUP_PARTICIPANTS_UPDATE = 'group-participants.update',
  GROUP_JOIN_REQUEST = 'group.join-request',
  GROUP_MEMBER_TAG_UPDATE = 'group.member-tag.update',
  BLOCKLIST_SET = 'blocklist.set',
  BLOCKLIST_UPDATE = 'blocklist.update',
  CALL = 'call',
  LABELS_EDIT = 'labels.edit',
  LABELS_ASSOCIATION = 'labels.association',
  NEWSLETTER_REACTION = 'newsletter.reaction',
  NEWSLETTER_VIEW = 'newsletter.view',
  NEWSLETTER_PARTICIPANTS_UPDATE = 'newsletter-participants.update',
  NEWSLETTER_SETTINGS_UPDATE = 'newsletter-settings.update',
  SETTINGS_UPDATE = 'settings.update'
}

// Fails to compile when WAEvent drifts from Baileys' events, in either direction
type AssertExtends<T extends U, U> = T;
type _NoUnknownEvents = AssertExtends<`${WAEvent}`, BaileysEvent>;
type _NoMissingEvents = AssertExtends<BaileysEvent, `${WAEvent}`>;

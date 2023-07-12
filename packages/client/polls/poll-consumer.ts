import {
  proto,
  jidNormalizedUser,
  getKeyAuthor,
  decryptPollVote,
  getAggregateVotesInPollMessage
} from '@whiskeysockets/baileys';

export class PollConsumer {
  private getVote(
    pollUpdateMessage: proto.Message.IPollUpdateMessage,
    pollCreationMessage: proto.IMessage,
    pollUpdateMessageKey: proto.IMessageKey,
    senderTimestampMs: any,
    meId?: string
  ) {
    const normalizedMeId = jidNormalizedUser(meId);

    const pollCreatorJid = getKeyAuthor(
      pollUpdateMessage.pollCreationMessageKey,
      normalizedMeId
    );

    const voterJid = getKeyAuthor(pollUpdateMessageKey, normalizedMeId);

    const vote = decryptPollVote(pollUpdateMessage.vote, {
      pollEncKey: pollCreationMessage.messageContextInfo.messageSecret,
      pollCreatorJid,
      voterJid,
      pollMsgId: pollUpdateMessage.pollCreationMessageKey.id
    });

    const messageUpdate = {
      message: pollCreationMessage,
      pollUpdates: [
        {
          vote,
          pollUpdateMessageKey,
          senderTimestampMs
        }
      ]
    };

    return getAggregateVotesInPollMessage(messageUpdate);
  }
}

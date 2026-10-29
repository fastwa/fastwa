import {
  CanActivate,
  ExecutionContext,
  Injectable,
  type FastwaMessage
} from 'fastwa';

// Only lets through messages that carry text: plain text, replies and media
// captions. Reactions, stickers, audio and media without a caption are ignored.
@Injectable()
export class ContentGuard implements CanActivate {
  canActivate(context: ExecutionContext) {
    const { text, reaction } = context
      .switchToAdapter()
      .getMessage<FastwaMessage>();

    return !!text && !reaction;
  }
}

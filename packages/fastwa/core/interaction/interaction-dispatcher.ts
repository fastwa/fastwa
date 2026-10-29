import { FastwaMessage, Interaction } from '../../common';

import { AdapterHost } from '../adapters';
import { FastwaContainer } from '../injector/container';
import { GuardsConsumer, GuardsContext } from '../guards';
import { PipesConsumer } from '../pipes';
import { InteractionFactory } from './interaction-factory';
import { InteractionProxy } from './interaction-proxy';

/**
 * Routes what an adapter receives to collectors and interaction handlers
 */
export class InteractionDispatcher implements AdapterHost {
  private readonly interactionFactory = new InteractionFactory();
  private readonly interactionProxy: InteractionProxy;

  constructor(private readonly container: FastwaContainer) {
    this.interactionProxy = new InteractionProxy(
      this.interactionFactory,
      new GuardsConsumer(),
      new GuardsContext(container),
      new PipesConsumer(),
      container
    );
  }

  get events() {
    return [...this.container.getEvents().keys()];
  }

  public async handleMessage(message: FastwaMessage) {
    // An exclusive collector owns the chat, so commands are not triggered
    if (this.container.getMessageCollectors().dispatch(message)) {
      return;
    }

    const interaction = this.interactionFactory.getInteraction(
      message.text,
      this.container.getCommands()
    );

    if (interaction) {
      await this.handleInteraction(message, interaction);
    }
  }

  public async handleReaction(reaction: FastwaMessage) {
    const interaction = this.container
      .getReactions()
      .get(reaction.reaction?.emoji);

    if (interaction) {
      await this.handleInteraction(reaction, interaction);
    }
  }

  public async handleEvent(event: string, payload: unknown) {
    const interaction = this.container.getEvents().get(event);
    await interaction?.callback.call(interaction.instance, payload);
  }

  private async handleInteraction(
    message: FastwaMessage,
    interaction: Interaction
  ) {
    const handler = this.interactionProxy.createProxy(interaction);
    const response = await handler(message);

    if (response) {
      await this.container.getAdapter().reply(message, response);
    }
  }
}

import type { Args, Awaitable, ChatInputCommand, MessageCommand } from '@sapphire/framework'
import type { AutocompleteInteraction, CommandInteraction, Message } from 'discord.js'

// eslint-disable-next-line no-restricted-imports
import { Command as BaseCommand } from '@sapphire/framework'
import { ApplicationCommandType } from 'discord.js'
import { withSpan } from '#lib/util/tracing'
import { formatInteractionType, setChannelAttributes, setGuildAttributes, setUserAttributes, tracer } from './util'

export class Command<PreParseReturn = Args, O extends Command.Options = Command.Options> extends BaseCommand<PreParseReturn, O> {
  constructor(context: Command.LoaderContext, options: O) {
    super(context, options)

    if (this.messageRun)
      this.messageRun = this.instrumentedMessageRun(this.messageRun.bind(this))
    if (this.chatInputRun)
      this.chatInputRun = this.instrumentedInteractionRun(this.chatInputRun.bind(this))
    if (this.contextMenuRun)
      this.contextMenuRun = this.instrumentedInteractionRun(this.contextMenuRun.bind(this))
    if (this.autocompleteRun)
      this.autocompleteRun = this.instrumentedAutocompleteInteraction(this.autocompleteRun.bind(this))
  }

  private instrumentedMessageRun(
    fn: (message: Message, args: PreParseReturn, context: MessageCommand.RunContext) => Awaitable<unknown>,
  ): (message: Message, args: PreParseReturn, context: MessageCommand.RunContext) => Awaitable<unknown> {
    return async (message, args, context) =>
      withSpan(`command.${this.name}`, async (span) => {
        span.setAttributes({
          'discord.route': `command.${this.name}`,
          'message.id': message.id,
        })
        setUserAttributes(span, message.author)
        setChannelAttributes(span, message.channel)
        setGuildAttributes(span, message.guild)

        return fn(message, args, context)
      }, tracer)
  }

  private instrumentedInteractionRun<T extends CommandInteraction>(
    fn: (interaction: T, context: ChatInputCommand.RunContext) => Awaitable<unknown>,
  ): (interaction: T, context: ChatInputCommand.RunContext) => Awaitable<unknown> {
    return async (interaction, context) => withSpan(`command.${this.name}`, async (span) => {
      span.setAttributes({
        'discord.route': `command.${this.name}`,
        'command.id': interaction.commandId,
        'command.name': interaction.commandName,
        'command.type': this.formatCommandType(interaction.commandType),
      })
      setUserAttributes(span, interaction.user)
      setGuildAttributes(span, interaction.guild)
      setChannelAttributes(span, interaction.channel)

      return fn(interaction, context)
    }, tracer)
  }

  private instrumentedAutocompleteInteraction(
    fn: (interaction: AutocompleteInteraction) => Awaitable<unknown>,
  ): (interaction: AutocompleteInteraction) => Awaitable<unknown> {
    return async interaction => withSpan(`command.${this.name}.autocomplete`, async (span) => {
      span.setAttributes({
        'discord.route': `command.${this.name}`,
        'command.id': interaction.commandId,
        'command.name': interaction.commandName,
        'command.type': this.formatCommandType(interaction.commandType),
        'interaction.type': formatInteractionType(interaction.type),
        'interaction.id': interaction.id,
      })
      setUserAttributes(span, interaction.user)
      setGuildAttributes(span, interaction.guild)
      setChannelAttributes(span, interaction.channel)
      return fn(interaction)
    }, tracer)
  }

  private formatCommandType(type: ApplicationCommandType): string {
    switch (type) {
      case ApplicationCommandType.ChatInput:
        return 'slash'
      case ApplicationCommandType.User:
        return 'context-menu.user'
      case ApplicationCommandType.Message:
        return 'context-menu.message'
      case ApplicationCommandType.PrimaryEntryPoint:
        return 'activity'
    }
  }
}

export namespace Command {
  export type Options = BaseCommand.Options
  export type JSON = BaseCommand.JSON
  export type LoaderContext = BaseCommand.LoaderContext
  export type RunInTypes = BaseCommand.RunInTypes
  export type RunInUnion = BaseCommand.RunInUnion
  export type SpecificRunIn = BaseCommand.SpecificRunIn
  export type ChatInputCommandInteraction = BaseCommand.ChatInputCommandInteraction
  export type ContextMenuCommandInteraction = BaseCommand.ContextMenuCommandInteraction
  export type AutocompleteInteraction = BaseCommand.AutocompleteInteraction
  export type Registry = BaseCommand.Registry
}

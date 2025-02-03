import { SlashCommandBuilder, SlashCommandSubcommandsOnlyBuilder } from '@discordjs/builders';
import { Client, CommandInteraction } from 'discord.js';

export const commands : Command[] = [];

export interface Command {
  data: SlashCommandSubcommandsOnlyBuilder;
  execute: ({ client, interaction }: { client: Client<boolean>; interaction: any }) => Promise<void>;
}




import { SlashCommandBuilder, SlashCommandSubcommandsOnlyBuilder, SlashCommandOptionsOnlyBuilder } from '@discordjs/builders';
import { Client, CommandInteraction } from 'discord.js';

export const commands : Command[] = [];

export interface Command {
  data: SlashCommandSubcommandsOnlyBuilder | SlashCommandOptionsOnlyBuilder;
  execute: ({ client, interaction }: { client: Client<boolean>; interaction: any }) => Promise<void>;
}

export interface ObjectWord {
  character: string;
  emojie : any;
}

export const wordDay : string = '';



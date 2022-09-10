import {  SlashCommandBuilder, CacheType, Interaction } from "discord.js";
import { Bot } from ".";

export interface Command {
  name: string;
  data: SlashCommandBuilder,
  execute(interaction: Interaction<CacheType>, bot: Bot): Promise<void>
}
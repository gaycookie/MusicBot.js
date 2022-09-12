import { joinVoiceChannel } from "@discordjs/voice";
import { SlashCommandBuilder, CacheType, Interaction } from "discord.js";
import { Bot } from "..";
import { Player } from "../player";

module.exports = {
  data: new SlashCommandBuilder().setName("join").setDescription("Joins the voice-channel."),
  async execute(interaction: Interaction<CacheType>, bot: Bot) {
    if (!interaction.isChatInputCommand() || !interaction.guildId) return;
    
    const guild = interaction.guild || await interaction.client.guilds.fetch(interaction.guildId);
    const player = bot.player;

    const member = await guild.members.fetch(interaction.user.id);
    if (!member || !member.voice.channelId) {
      await interaction.reply({ content: "You're not connected to a voice-channel.", ephemeral: true });
      return;
    }

    if (player && player.voiceConnection) {
      await interaction.reply({ content: "I'm already active in a voice-channel.", ephemeral: true });
      return;
    }

    const channel = await guild.channels.fetch(member.voice.channelId);
    if (!channel || !channel.isVoiceBased) {
      await interaction.reply({ content: "I'm not able to join your voice-channel.", ephemeral: true });
      return;
    }

    const connection = joinVoiceChannel({ guildId: channel.guild.id, channelId: channel.id, adapterCreator: channel.guild.voiceAdapterCreator });
    bot.player = new Player(bot, guild.id, connection);
    await interaction.reply({ content: `Joining **${channel.name}**` });
	}
};
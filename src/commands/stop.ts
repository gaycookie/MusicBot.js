import { SlashCommandBuilder, CacheType, Interaction } from "discord.js";
import { Bot } from "..";

module.exports = {
  data: new SlashCommandBuilder().setName("stop").setDescription("Stop the music and clear the queue."),
  async execute(interaction: Interaction<CacheType>, bot: Bot) {
    if (!interaction.isChatInputCommand() || !interaction.guildId) return;

    const guild = interaction.guild || await interaction.client.guilds.fetch(interaction.guildId);
    const player = bot.player;

    if (!player || !player.voiceConnection || !player.voiceConnection.joinConfig.channelId) {
      await interaction.reply({ content: "I'm currently not active in a voice-channel.", ephemeral: true });
      return;
    }

    const member = await guild.members.fetch(interaction.user.id);
    if (player.voiceConnection.joinConfig.channelId != member.voice.channelId) {
      await interaction.reply({ content: "We're not in the same voice-channel.", ephemeral: true });
      return;
    }

    if (!player.currentSong) {
      await interaction.reply({ content: "Currently not playing anything.", ephemeral: true });
      return;
    }

    player.stopMusic();
    await interaction.reply({ content: "Stopped playing music and cleared the queue." });
	}
};
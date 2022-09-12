import { SlashCommandBuilder, CacheType, Interaction } from "discord.js";
import { Bot } from "..";

module.exports = {
  data: new SlashCommandBuilder().setName("shuffle").setDescription("Shuffle the current queue."),
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

    if (player.queue.length < 2) {
      await interaction.reply({ content: "Not enough songs to shuffle.", ephemeral: true });
      return;
    }

    const shuffledQueue = player.shuffleQueue();
    await interaction.reply({ content: `Shuffled ${shuffledQueue.length} songs.` });
	}
};
import { SlashCommandBuilder, CacheType, Interaction } from "discord.js";
import { Bot } from "..";

module.exports = {
  data: new SlashCommandBuilder().setName("skip").setDescription("Skip to the next song in the queue."),
  async execute(interaction: Interaction<CacheType>, bot: Bot) {
    if (!interaction.isChatInputCommand() || !interaction.guildId) return;
    const guild = interaction.guild || await interaction.client.guilds.fetch(interaction.guildId);
    const player = bot.player;

    if (player && player.voiceConnection) {
      const connection = player.voiceConnection;

      if (connection && connection.joinConfig.channelId) {
        const member = await guild.members.fetch(interaction.user.id);

        if (!member || !member.voice.channelId) {
          await interaction.reply({ content: "You're not connected to a voice-channel.", ephemeral: true });
          return;
        }

        const channel = guild.channels.cache.filter(c => c.id == member.voice.channelId).first();
        if (channel && channel.isVoiceBased()) {
          if (channel.id != connection.joinConfig.channelId) {
            await interaction.reply({ content: "You're not in the same channel.", ephemeral: true });
            return;
          }

          if (!player.queue.length) {
            await interaction.reply({ content: "The queue is empty, nothing to skip to.", ephemeral: true });
            return;
          }

          player.skipSong().then(async (song) => {
            if (song) {
              await interaction.reply({ content: `Now playing **${song.songName}**.` });
            } else {
              await interaction.reply({ content: "Nothing to skip to.", ephemeral: true });
            }
          });
        }
      } else {
        await interaction.reply({ content: "I'm currently not active in a voice-channel.", ephemeral: true });
      }
    } else {
      await interaction.reply({ content: "I'm currently not active in a voice-channel.", ephemeral: true });
    }
	}
};
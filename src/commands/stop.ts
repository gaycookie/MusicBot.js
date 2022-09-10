import { SlashCommandBuilder, CacheType, Interaction } from "discord.js";
import { Bot } from "..";

module.exports = {
  data: new SlashCommandBuilder().setName("stop").setDescription("Stop the music and clear the queue."),
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

          player.stopMusic().then(async () => {
            await interaction.reply({ content: "Stopped playing music and cleared the queue." });
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
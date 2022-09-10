import { SlashCommandBuilder, CacheType, Interaction } from "discord.js";
import { Bot } from "..";

module.exports = {
	data: new SlashCommandBuilder().setName("leave").setDescription("Leaves the voice-channel."),
	async execute(interaction: Interaction<CacheType>, bot: Bot) {
    if (!interaction.isChatInputCommand() || !interaction.guildId) return;
    const guild = interaction.guild || await interaction.client.guilds.fetch(interaction.guildId);
    const player = bot.player;

    if (player && player.voiceConnection) {
      const connection = player.voiceConnection;

      if (connection && connection.joinConfig.channelId) {
        const member = await guild.members.fetch(interaction.user.id);

        const channel = await guild.channels.fetch(connection.joinConfig.channelId);
        if (channel != null && member.voice.channelId != channel.id) {
          await interaction.reply({ content: "You can not make me leave! 😈", ephemeral: true });
          return;
        }

        await interaction.reply({ content: `Left **${channel?.name}**` });
        connection.destroy();
      } else {
        await interaction.reply({ content: "I'm not connected to this Discord.", ephemeral: true });
      }
    } else {
      await interaction.reply({ content: "I'm not connected to this Discord.", ephemeral: true });
    }
	}
};
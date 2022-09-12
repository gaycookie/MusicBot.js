import { SlashCommandBuilder, CacheType, Interaction } from "discord.js";
import { Bot } from "..";

module.exports = {
  data: new SlashCommandBuilder().setName("leave").setDescription("Leaves the voice-channel."),
  async execute(interaction: Interaction<CacheType>, bot: Bot) {
    if (!interaction.isChatInputCommand() || !interaction.guildId) return;

    const guild = interaction.guild || await interaction.client.guilds.fetch(interaction.guildId);
    const player = bot.player;

    if (!player || !player.voiceConnection || !player.voiceConnection.joinConfig.channelId) {
      await interaction.reply({ content: "I'm currently not active in a voice-channel.", ephemeral: true });
      return;
    }

    const member = await guild.members.fetch(interaction.user.id);
    if (!member.voice.channelId || member.voice.channelId != player.voiceConnection.joinConfig.channelId) {
      await interaction.reply({ content: "We're not in the same voice-channel.", ephemeral: true });
      return;
    }

    const channel = await guild.channels.fetch(player.voiceConnection.joinConfig.channelId);
    await interaction.reply({ content: `Leaving **${channel?.name}**` });
    player.voiceConnection.destroy();
	}
};
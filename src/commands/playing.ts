import { AudioPlayerStatus } from "@discordjs/voice";
import { SlashCommandBuilder, CacheType, Interaction, EmbedBuilder } from "discord.js";
import { Bot } from "..";
import { Utils } from "../utils";

module.exports = {
  data: new SlashCommandBuilder().setName("playing").setDescription("See what song is playing right now."),
  async execute(interaction: Interaction<CacheType>, bot: Bot) {
    if (!interaction.isChatInputCommand() || !interaction.guildId) return;

    const guild = interaction.guild || await interaction.client.guilds.fetch(interaction.guildId);
    const player = bot.player;

    if (!player || !player.voiceConnection || !player.voiceConnection.joinConfig.channelId) {
      await interaction.reply({ content: "I'm currently not active in a voice-channel.", ephemeral: true });
      return;
    }

    if (!player.currentSong || player.audioPlayer.state.status != AudioPlayerStatus.Playing) {
      await interaction.reply({ content: "I'm not playing anything in this Discord.", ephemeral: true });
      return;
    }

    const embed = new EmbedBuilder({
      title: `Now playing in ${guild.name}`,
      description: `🎵 **[${Utils.textOverflow(player.currentSong.songName, 64)}](${player.currentSong.songUrl})**`,
      footer: { text: `Songs in queue: ${player.queue.length}` },
      fields: [
        { name: "Song Duration", value: `${Utils.fancyDuration(player.currentSong.songDuration)}`, inline: true },
        { name: "Song Requester", value: `${await guild.members.fetch(player.currentSong.requester)}`, inline: true }
      ]
    });

    if (player.queue.length > 0) {
      var upcomingSongsText = "";
      for (let i = 0; i < player.queue.length; i++) {
        if (i < 5) upcomingSongsText += `${i + 1}. [${Utils.textOverflow(player.queue[i].songName, 64)}](${player.queue[i].songUrl})\n`
      }

      embed.addFields({
        name: "Upcoming Song(s)",
        value: upcomingSongsText
      });
    }

    await interaction.reply({ embeds: [embed] });
	}
};
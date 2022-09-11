import { SlashCommandBuilder, CacheType, Interaction } from "discord.js";
import yts from "yt-search";
import { Bot } from "..";
import { YouTubeUtils } from "../youtube";

module.exports = {
  data: new SlashCommandBuilder().setName("playlist").setDescription("Play, make and edit playlists.").addStringOption(option => option.setName("url").setDescription("YouTube playlist URL").setRequired(true)),
  async execute(interaction: Interaction<CacheType>, bot: Bot) {
    if (!interaction.isChatInputCommand() || !interaction.guildId) return;

    const guild = interaction.guild || await interaction.client.guilds.fetch(interaction.guildId);
    const player = bot.player;
    const url = interaction.options.getString("url", true);

    const playlistId = YouTubeUtils.getPlaylistIdFromUrl(url);
    if (!playlistId) {
      await interaction.reply({ content: "That doesn't look like a valid YouTube URL.", ephemeral: true });
      return;
    }

    if (!player || !player.voiceConnection || !player.voiceConnection.joinConfig.channelId) {
      await interaction.reply({ content: "I'm currently not active in a voice-channel.", ephemeral: true });
      return;
    }

    const member = await guild.members.fetch(interaction.user.id);
    if (player.voiceConnection.joinConfig.channelId != member.voice.channelId) {
      await interaction.reply({ content: "We're not in the same voice-channel.", ephemeral: true });
      return;
    }

    const { videos } = await YouTubeUtils.getPlaylistInfoById(playlistId);
    if (!videos.length) {
      await interaction.reply({ content: "No videos were found in this playlist.", ephemeral: true });
      return;
    }

    await interaction.reply({ content: `Loading playlist...` });

    for (let i = 0; i < videos.length; i++) {
      const videoInfo = await YouTubeUtils.getVideoInfoById(videos[i].videoId);

      if (!player.currentSong) {
        player.currentSong = {
          requester: interaction.user.id,
          songDuration: videoInfo.duration.seconds,
          songName: videoInfo.title,
          songUrl: videoInfo.url
        }

        player.playSong(player.currentSong);
      } else {
        player.queue.push({
          requester: interaction.user.id,
          songDuration: videoInfo.duration.seconds,
          songName: videoInfo.title,
          songUrl: videoInfo.url
        });
      }
    }

    await interaction.editReply({ content: `Playlist loaded: ${videos.length} songs queued.` });
  }
}
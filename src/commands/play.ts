import { SlashCommandBuilder, CacheType, Interaction } from "discord.js";
import { Bot } from "..";
import { Song } from "../player";
import { YouTubeUtils } from "../youtube";

module.exports = {
  data: new SlashCommandBuilder().setName("play").setDescription("Plays a song in voice-chat.").addStringOption(option => option.setName("query").setDescription("Song name or URL").setRequired(true)),
  async execute(interaction: Interaction<CacheType>, bot: Bot) {
    if (!interaction.isChatInputCommand() || !interaction.guildId) return;
    
    const guild = interaction.guild || await interaction.client.guilds.fetch(interaction.guildId);
    const query = interaction.options.getString("query", true);
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

    var song!: Song;

    const videoId = YouTubeUtils.getVideoIdFromUrl(query);
    if (videoId) {
      const video = await YouTubeUtils.getVideoInfoById(videoId);

      if (!video) {
        await interaction.reply({ content: "No video was found with this URL.", ephemeral: true });
        return;
      }

      song = {
        requester: interaction.user.id,
        songDuration: video.duration.seconds,
        songName: video.title,
        songUrl: video.url
      }
    } else {
      const { videos } = await YouTubeUtils.findVideosByQuery(query);

      if (!videos.length) {
        await interaction.reply({ content: "No video was found with that term", ephemeral: true });
        return;
      }

      song = {
        requester: interaction.user.id,
        songDuration: videos[0].duration.seconds,
        songName: videos[0].title,
        songUrl: videos[0].url
      }
    }

    if (!player.currentSong) {
      player.currentSong = song;
      player.playSong(player.currentSong);
      await interaction.reply({ content: `Now playing **${song.songName}**.` });
    } else {
      player.queue.push(song);
      await interaction.reply({ content: `**${song.songName}** has been added to the queue.` });
    }
	}
};
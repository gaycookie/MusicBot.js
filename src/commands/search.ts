import { SlashCommandBuilder, CacheType, Interaction } from "discord.js";
import { Utils } from "../utils";
import { Bot } from "..";
import { YouTubeUtils } from "../youtube";

module.exports = {
  data: new SlashCommandBuilder().setName("search").setDescription("Search for a song.").addStringOption(option => option.setName("query").setDescription("Song name or URL").setRequired(true)),
  async execute(interaction: Interaction<CacheType>, bot: Bot) {
    if (!interaction.isChatInputCommand() || !interaction.guildId) return;
    const guild = interaction.guild || await interaction.client.guilds.fetch(interaction.guildId);
    const query = interaction.options.getString("query");

    if (query != null) {
      YouTubeUtils.findVideosByQuery(query).then(async result => {
        var songsMessage = "";

        for (let i = 0; i < 5; i++) {
          songsMessage += `${i + 1}. [${Utils.textOverflow(result.videos[i].title, 64)}](${result.videos[i].url})\n`
        }

        await interaction.reply({ content: songsMessage });
      });
	  }
  }
};
import internal from "stream";
import yts from "yt-search";
import ytdl from "ytdl-core";

export class YouTubeUtils {
  public static downloadStream(url: string): internal.Readable {
    return ytdl(url, { quality: "highestaudio", filter: "audioonly", dlChunkSize: 65536 });
  }

  public static findVideosByQuery(query: string): Promise<yts.SearchResult> {
    return new Promise((resolve, reject) => {
      yts({ query: query }).then(resolve).catch(reject);
    });
  }

  public static getVideoInfoById(id: string): Promise<yts.VideoMetadataResult> {
    return new Promise((resolve, reject) => {
      yts({ videoId: id }).then(resolve).catch(reject);
    });
  }

  public static getPlaylistInfoById(id: string): Promise<yts.PlaylistMetadataResult> {
    return new Promise((resolve, reject) => {
      yts({ listId: id }).then(resolve).catch(reject);
    });
  }

  public static isValidYouTubeUrl(url: string): boolean {
    const longDomainExp = /^(?:https?:\/\/)?(?:www\.)?youtube\.com(?:\S+)?$/;
    const shortDomainExp = /^(?:https?:\/\/)?(?:www\.)?youtu\.be(?:\S+)?$/;

    const matchLong = longDomainExp.test(url);
    const matchShort = shortDomainExp.test(url);

    return (matchLong || matchShort);
  }

  public static getVideoIdFromUrl(url: string): string | undefined {
    if (!this.isValidYouTubeUrl(url)) return undefined;

    const longDomainExp = /[&?]v=([a-z0-9_-]+)/i;
    const shortDomainExp = /\.be\/([^#\&\?]*)/i;

    const matchLongDomain = longDomainExp.exec(url);
    const matchShortDomain = shortDomainExp.exec(url);

    if (matchLongDomain && matchLongDomain[1].length > 0) {
      return matchLongDomain[1];
    } else if (matchShortDomain && matchShortDomain[1].length > 0) {
      return matchShortDomain[1];
    }

    return undefined;
  }

  public static getPlaylistIdFromUrl(url: string): string | undefined {
    if (!this.isValidYouTubeUrl(url)) return undefined;

    const longDomainExp = /[&?]list=([a-z0-9_-]+)/i;
    const matchLongDomain = longDomainExp.exec(url);

    if (matchLongDomain && matchLongDomain[1].length > 0) {
      return matchLongDomain[1];
    }

    return undefined;
  }
}
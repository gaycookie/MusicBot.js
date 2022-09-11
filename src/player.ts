import { AudioPlayer, AudioPlayerStatus, createAudioPlayer, createAudioResource, VoiceConnection } from "@discordjs/voice";
import { Snowflake } from "discord.js";
import { Bot } from ".";
import { YouTubeUtils } from "./youtube";

export interface Song {
  requester: string;
  songName: string;
  songUrl: string;
  songDuration: number;
}

export class Player {
  readonly bot: Bot;
  readonly guildId: Snowflake;
  readonly voiceConnection: VoiceConnection;
  readonly audioPlayer: AudioPlayer = createAudioPlayer();
  
  public queue: Song[] = [];
  public currentSong: Song | undefined = undefined;

  constructor(bot: Bot, guildId: Snowflake, voiceConnection: VoiceConnection) {
    this.bot = bot;
    this.guildId = guildId;
    this.voiceConnection = voiceConnection;
    this.voiceConnection.subscribe(this.audioPlayer);

    this.audioPlayer.on(AudioPlayerStatus.Idle, () => {
      if (this.queue.length > 0) {
        this.currentSong = this.queue.shift();
        
        if (this.currentSong) {
          this.playSong(this.currentSong);
          return;
        }
      }
      
      this.currentSong = undefined;
      this.bot.setSongActivity();
    });
  }

  public shuffleQueue(): Song[] {
    var queue = this.queue;
    
    for (var i = queue.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var temp = queue[i];
      queue[i] = queue[j];
      queue[j] = temp;
    }

    return this.queue = queue;
  }

  public stopMusic(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.currentSong = undefined;
      this.queue = [];

      this.audioPlayer.stop();
      resolve();
    });
  }

  public skipSong(): Promise<Song | undefined> {
    return new Promise((resolve, reject) => {
      if (this.queue.length > 0) {
        this.currentSong = this.queue.shift();

        if (this.currentSong) {
          this.playSong(this.currentSong).then(resolve);
        } else {
          resolve(undefined);
        }
      } else {
        resolve(undefined);
      }
    });
  }

  public playSong(song: Song): Promise<Song | undefined> {
    return new Promise(async (resolve, reject) => {
      const stream = YouTubeUtils.downloadStream(song.songUrl);
      this.audioPlayer.play(createAudioResource(stream));
      this.bot.setSongActivity(song.songName);

      resolve(song);
    });
  }
}
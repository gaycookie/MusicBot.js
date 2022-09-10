import { Client, GatewayIntentBits, Collection, REST, Routes } from "discord.js";
import { Command } from "./command";
import { Player } from "./player";
import { Config } from "./config";
import fs from "fs";
import path from "path";

export class Bot {
  readonly config: Config;
  readonly client: Client;
  readonly commands: Collection<string, Command> = new Collection();
  public player: Player | null = null;

  constructor() {
    this.config = new Config();
    this.client = new Client({ intents: [
        GatewayIntentBits.Guilds, 
        GatewayIntentBits.GuildVoiceStates
      ]
    });

    this.registerCommands();
    this.initializeEvents();
    this.initializeCommands();

    if (this.config.getBotToken() == "") {
      console.error("No bot token was provided in the config.");
      process.exit();
    }

    if (this.config.getClientId() == "") {
      console.error("No client id was provided in the config.");
      process.exit();
    }

    this.client.login(this.config.getBotToken()).catch(err => {
      console.error(err);
      process.exit();
    });
  }

  /**
   * @param {string | undefined} title Leave empty to remove activity.
   */
  public setSongActivity(title?: string): void {
    if (this.client.user) {
      this.client.user.setActivity(title ? { name: title, type: 0 } : undefined);
    }
  }

  private registerCommands(): void {
    fs.readdir(path.join(__dirname, "commands"), (err, files) => {
      if (err) process.exit();

      const cmds = [];
      for (const file of files.filter(file => file.endsWith('.js'))) {
        const command: Command = require(path.join(__dirname, "commands", file));
        cmds.push(command.data.toJSON());
      }

      const rest = new REST({ version: '10' }).setToken(this.config.getBotToken());
      rest.put(Routes.applicationCommands(this.config.getClientId()), { body: cmds })
        .then(() => console.log(`Successfully registered commands.`))
        .catch(err => console.error("Something went wrong: " + err));
    });
  }

  private initializeEvents(): void {
    this.client.once('ready', () => console.log('Ready!'));

    this.client.on('interactionCreate', async interaction => {
      if (!interaction.isChatInputCommand() || !interaction.guildId) return;
    
      const command = this.commands.get(interaction.commandName);
      if (!command) return;
    
      command.execute(interaction, this).catch(async err => {
        console.error(err);
        await interaction.reply({ content: 'There was an error while trying to execute this command!', ephemeral: true });
      });
    });
  }

  private initializeCommands(): void {
    fs.readdir(path.join(__dirname, "commands"), (err, files) => {
      if (err) process.exit();

      for (const file of files.filter(file => file.endsWith('.js'))) {
        const command: Command = require(path.join(__dirname, "commands", file));
        this.commands.set(command.data.name, command);
      }
    });
  }
}

new Bot();
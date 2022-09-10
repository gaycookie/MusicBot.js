export class Config {
  private clientId: string = "";
  private botToken: string = "";

  constructor() {
    Object.assign(this, require("../config.json"));
  }

  public getClientId(): string {
    return this.clientId;
  }

  public getBotToken(): string {
    return this.botToken;
  }
}
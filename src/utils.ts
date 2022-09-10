export class Utils {
  public static fancyDuration(durationInSeconds: number): string {
    const h = Math.floor(durationInSeconds / 3600);
    const m = Math.floor((durationInSeconds % 3600) / 60);
    const s = durationInSeconds % 60;
    return [h, m > 9 ? m : (h ? '0' + m : m || '0'), s > 9 ? s : '0' + s,].filter(a => a).join(':');
  }

  public static textOverflow(text: string, limit: number): string {
    return text.length > limit ? text.substring(0, limit) + "…" : text;
  }
}
import axios from 'axios';
import { parseStringPromise } from 'xml2js';

export class PublicIntelligenceService {
  // Using a sample RSS feed or news API. For production, replace with Kerala Police official press RSS.
  private newsFeedUrl = "https://news.google.com/rss/search?q=Kerala+Police+crime+drugs&hl=en-IN&gl=IN&ceid=IN:en";

  async getLatestIntelligence() {
    try {
      const response = await axios.get(this.newsFeedUrl);
      const result = await parseStringPromise(response.data);
      const items = result.rss.channel[0].item;

      return items.map((item: any) => ({
        title: item.title[0],
        link: item.link[0],
        pubDate: item.pubDate[0],
        source: item.source[0]._
      })).slice(0, 10);
    } catch (error: any) {
      console.error('[IntelligenceService] Error fetching news:', error.message);
      return [
        { title: "Special Drive against Drug Trafficking initiated in Ernakulam", pubDate: new Date().toISOString(), source: "Mock News" },
        { title: "Cyber Cell issues advisory on Financial Frauds", pubDate: new Date().toISOString(), source: "Mock News" }
      ];
    }
  }

  async getPublicCases() {
    // This would typically interface with the CCTNS or a public court registry
    return [
      { id: "FIR-102/2026", court: "First Class Judicial Magistrate", status: "Ongoing", suspect: "Arjun Ajith (Alias)", offense: "NDPS Act Section 21" },
      { id: "FIR-45/2026", court: "District Sessions Court", status: "Charge-sheet Filed", suspect: "Under Identification", offense: "IPC Section 379" }
    ];
  }
}

import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

export class GeminiService {
  static async identifyPartFromImage(imageBuffer: Buffer, mimeType: string) {
    const prompt = `
      Identify this automotive spare part from the image. 
      Provide:
      1. Possible Part Name
      2. General Category (e.g., Engine, Braking, Suspension)
      3. Key visual features identified
      4. Likely compatible car brands if obvious.
      Return the result in a clean JSON format.
    `;

    const result = await model.generateContent([
      prompt,
      {
        inlineData: {
          data: imageBuffer.toString("base64"),
          mimeType,
        },
      },
    ]);

    const response = await result.response;
    return response.text();
  }

  static async enhanceSearchQuery(query: string) {
    const prompt = `
      Convert this user query into a structured automotive search object.
      User Query: "${query}"
      Provide:
      1. part_name
      2. brand (if mentioned)
      3. vehicle_make (if mentioned)
      4. vehicle_model (if mentioned)
      5. year (if mentioned)
      Return only the JSON object.
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return JSON.parse(response.text().replace(/```json|```/g, ""));
  }

  static async parseVin(vin: string) {
    const prompt = `
      Extract vehicle details from this VIN (Vehicle Identification Number): ${vin}
      Provide:
      1. Make
      2. Model
      3. Year
      4. Engine details (if possible)
      5. Trim/Series
      Return as a JSON object.
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return JSON.parse(response.text().replace(/```json|```/g, ""));
  }
}

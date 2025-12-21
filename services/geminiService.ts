
import { GoogleGenAI, Type } from "@google/genai";
import { OCRResultItem } from "../types";

export interface ImageSource {
  base64: string;
  mimeType: string;
}

export const recognizeTariffImages = async (images: ImageSource[]): Promise<OCRResultItem[]> => {
  const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY });

  const prompt = `你是一个专业的电力账单分析助手。请从这些电价表图片（可能是一张或多张连续的页面）中提取价格矩阵。
  提取内容必须包含：用电分类（category，如：大工业、一般工商业）、电压等级（voltage，如：1-10kV、35kV）、以及分时电价（prices，包含tip、peak、flat、valley）。
  请确保价格是纯数字。如果图片中没有某项价格，请填入0。
  
  如果多张图片中包含重复的项目，请合并处理。输出格式必须是严格的 JSON 数组。`;

  try {
    const imageParts = images.map(img => ({
      inlineData: { data: img.base64, mimeType: img.mimeType }
    }));

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: [
        {
          parts: [
            ...imageParts,
            { text: prompt }
          ]
        }
      ],
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              category: { type: Type.STRING, description: "用电分类名称" },
              voltage: { type: Type.STRING, description: "电压等级" },
              prices: {
                type: Type.OBJECT,
                properties: {
                  tip: { type: Type.NUMBER, description: "尖峰电价" },
                  peak: { type: Type.NUMBER, description: "高峰电价" },
                  flat: { type: Type.NUMBER, description: "平段电价" },
                  valley: { type: Type.NUMBER, description: "低谷电价" }
                },
                required: ["tip", "peak", "flat", "valley"]
              }
            },
            required: ["category", "voltage", "prices"]
          }
        }
      }
    });

    const jsonText = response.text;
    if (!jsonText) throw new Error("AI 未返回有效数据");

    const results = JSON.parse(jsonText) as any[];
    return results.map(item => ({
      ...item,
      id: crypto.randomUUID()
    }));
  } catch (error) {
    console.error("Gemini OCR Error:", error);
    throw error;
  }
};

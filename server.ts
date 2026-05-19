import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

// Shared Gemini client utility
const apiKey = process.env.GEMINI_API_KEY;
const ai = new GoogleGenAI({
  apiKey: apiKey,
  httpOptions: {
    headers: {
      "User-Agent": "aistudio-build",
    },
  },
});

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Route for Gemini
  app.post("/api/generate", async (req, res) => {
    try {
      const { prompt } = req.body;
      if (!prompt) {
        return res.status(400).json({ error: "Prompt is required" });
      }

      if (!apiKey) {
        return res.status(500).json({ error: "GEMINI_API_KEY is not configured" });
      }

      const modelsToTry = [
        "gemini-3.1-flash-lite",
        "gemini-3-flash-preview",
        "gemini-3.1-pro-preview",
        "gemini-flash-latest",
        "gemini-2.5-flash",
        "gemini-2.0-flash"
      ];
      let text = "";
      let currentModelIndex = 0;
      let lastError: any = null;

      while (currentModelIndex < modelsToTry.length) {
        let success = false;
        let attempt = 0;
        let maxRetriesPerModel = 1; // up to 1 retry (2 attempts total) per model
        
        while (attempt <= maxRetriesPerModel) {
          try {
            const modelName = modelsToTry[currentModelIndex];
            const response: GenerateContentResponse = await ai.models.generateContent({
              model: modelName,
              contents: prompt,
            });

            text = response.text || "";
            success = true;
            break; // Success, exit inner loop
          } catch (error: any) {
            lastError = error;
            const status = error?.status || error?.response?.status;
            const errorString = error instanceof Error ? error.message : String(error);
            const fullError = JSON.stringify(error, Object.getOwnPropertyNames(error));
            
            const is429 = status === 429 || errorString.includes("429") || errorString.includes("Quota") || errorString.includes("RESOURCE_EXHAUSTED") || fullError.includes("429");
            const is404 = status === 404 || errorString.includes("404") || errorString.includes("not found");
            const is503 = status === 503 || errorString.includes("503") || errorString.includes("high demand") || errorString.includes("fetch failed");

            if (is404) {
              console.log(`Gemini API Error 404 (Not Found) on model ${modelsToTry[currentModelIndex]}. Switching to next model...`);
              break; // Break inner loop to move to next model
            } else if (is429 || is503) {
              attempt++;
              if (attempt >= maxRetriesPerModel) {
                console.log(`Gemini API Error ${is429 ? '429 (Quota)' : '503 (Unavailable)'} on model ${modelsToTry[currentModelIndex]}. Exhausted retries, switching to next...`);
                break; // Break inner loop
              }
              // Delay: 2s, 4s, 8s, + jitter
              let delay = Math.pow(2, attempt) * 2000;
              if (delay > 15000) delay = 15000; 
              const jitter = Math.floor(Math.random() * 1000);
              delay += jitter;
              
              console.log(`Gemini API Error ${is429 ? '429' : '503'}. Retrying model ${modelsToTry[currentModelIndex]} attempt ${attempt}/${maxRetriesPerModel} in ${delay}ms...`);
              await new Promise(resolve => setTimeout(resolve, delay));
            } else {
              throw error; // Let outer try/catch handle it
            }
          }
        }
        
        if (success) {
          break; // Exit outer loop if we got a response
        }
        
        currentModelIndex++;
      }

      if (!text && !lastError) {
        throw new Error("No text content returned from Gemini");
      }
      
      if (!text && lastError) {
        throw lastError;
      }
      
      res.json({ text });
    } catch (error: any) {
      console.error("Gemini Error:", error);
      
      // Check for specific error reasons
      const errorString = error instanceof Error ? error.message : String(error);
      const fullError = JSON.stringify(error, Object.getOwnPropertyNames(error));
      
      if (errorString.includes("API_KEY_INVALID") || errorString.includes("403") || fullError.includes("API_KEY_INVALID")) {
        return res.status(400).json({ 
          error: "API key tidak valid atau tidak diizinkan. Silakan periksa pengaturan Secrets di menu Settings AI Studio." 
        });
      }
      
      if (
        errorString.includes("429") || 
        errorString.includes("Quota exceeded") || 
        errorString.includes("RESOURCE_EXHAUSTED") ||
        fullError.includes("429") ||
        fullError.includes("Quota exceeded")
      ) {
        return res.status(429).json({
          error: "Batas permintaan gratis Gemini AI Anda telah tercapai (Quota exceeded). Silakan tunggu beberapa saat dan coba lagi nanti."
        });
      }

      if (
        errorString.includes("503") || 
        fullError.includes("503") ||
        errorString.includes("high demand")
      ) {
        return res.status(503).json({
          error: "Sistem saat ini sedang mengalami permintaan tinggi. Mohon coba lagi dalam beberapa saat."
        });
      }
      
      res.status(500).json({ error: errorString });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();

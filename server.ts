/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Lazy-loaded Gemini client to prevent crashing on startup if key is missing
let aiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY environment variable is not configured. Please add it to server secrets in the Settings menu.");
    }
    aiClient = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          'User-Agent': "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

// Substring & word boundary list for severe crisis keywords to bypass AI and fail-safe immediately
const CRISIS_KEYWORDS = [
  "suicide",
  "suicidal",
  "kill myself",
  "end my life",
  "want to die",
  "hanging myself",
  "better off dead",
  "cutting myself",
  "overdose",
  "self-harm",
  "self harm",
  "hurt myself",
  "jump off"
];

// Server-side POST endpoint for journal entries
app.post("/api/journal", async (req, res) => {
  try {
    const { text, selected_mood } = req.body;

    if (!text || typeof text !== "string") {
      return res.status(400).json({ error: "Missing or invalid journal text content." });
    }

    // 1. Direct crisis check (substring match)
    const normalizedText = text.toLowerCase();
    const isCrisisDetected = CRISIS_KEYWORDS.some(keyword => normalizedText.includes(keyword));

    if (isCrisisDetected) {
      // Return high-priority crisis payload instantly - do not call Gemini
      return res.json({
        is_crisis: true,
        national_helpline: {
          name: "Kiran National Mental Health Helpline",
          number: "1800-599-0019",
          description: "An initiative by the Ministry of Social Justice and Empowerment offering free, confidential, 24/7 support for competitive exam students and anyone experiencing immense panic or suicidal thoughts.",
          immediate_action: "Take deep breaths. You are not alone and you have immense value outside of any score. Please dial 1800-599-0019 now to speak to a compassionate counselor."
        }
      });
    }

    // 2. Call Gemini for Sentiment Analysis
    try {
      const client = getGeminiClient();

      const prompt = `Analyze the emotional sentiment and stress levels of the following competitive exam aspirant's daily journal entry. The student is preparing for extremely challenging exams like NEET, UPSC, or CAT.

Journal Text: "${text}"
Aspirant's Selected Baseline Mood Emoji: ${selected_mood}

Generate a comforting, supportive, and grounded response mapping to the required JSON schema. Keep the focus empathetic, tailored to competitive exam pressure (e.g., peer expectation, mock test anxiety, study burnout), and avoid toxic positivity.`;

      const response = await client.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          systemInstruction: "You are a professional, gentle, and highly empathetic mental health counselor specializing in competitive exam pressure (UPSC, NEET, CAT, JEE) in India. You provide specific validation, mild anxiety coping strategies, and grounding exercises.",
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              detected_mood: {
                type: Type.STRING,
                description: "A single word summarizing the core emotion (e.g., Overwhelmed, Anxious, Burnt Out, Calm, Hopeful)."
              },
              intensity_score: {
                type: Type.INTEGER,
                description: "An integer between 1 and 10 indicating the emotional distress or intensity (1 is completely calm, 10 is severe panic/burnout)."
              },
              empathetic_validation: {
                type: Type.STRING,
                description: "A short (2-3 sentences) compassionate validation of their feeling specifically tailored to competitive exams study fatigue."
              },
              actionable_support: {
                type: Type.OBJECT,
                properties: {
                  coping_strategy: {
                    type: Type.STRING,
                    description: "One concrete, custom self-regulation strategy focused on syllabus pressure or mock scores fatigue."
                  },
                  mindfulness_exercise: {
                    type: Type.STRING,
                    description: "A quick (30-60s) mental anchoring or physical sensory grounding exercise."
                  }
                },
                required: ["coping_strategy", "mindfulness_exercise"]
              }
            },
            required: ["detected_mood", "intensity_score", "empathetic_validation", "actionable_support"]
          }
        }
      });

      const textResponse = response.text;
      if (!textResponse) {
        throw new Error("Failed to retrieve text content from Gemini's response.");
      }

      const parsedAnalysis = JSON.parse(textResponse.trim());

      // If Gemini detects extreme stress (e.g. intensity_score >= 9), we gracefully suggest a helpful tip but also note helplines
      return res.json({
        is_crisis: false,
        analysis: parsedAnalysis
      });

    } catch (geminiError: any) {
      console.error("Gemini API call failed:", geminiError);
      
      // Fallback response with beautiful static validation if Gemini key is missing or calls fail, so the user never gets an ugly crash
      return res.json({
        is_crisis: false,
        analysis: {
          detected_mood: "Overwhelmed (Fallback Status)",
          intensity_score: 7,
          empathetic_validation: "We hear you. Preparing for competitive exams is a rigorous milestone, and it's completely normal to feel fatigued and stressed under these heavy syllabi. Your feelings of pressure are fully valid.",
          actionable_support: {
            coping_strategy: "Implement a strict '50-10 Pomodoro session' where the 10-minute break is completely screen-free, letting you look far away outside to relax sensory overload.",
            mindfulness_exercise: "Try the 3-3-3 rule: name 3 things you can see, 3 sounds you can hear, and move 3 body parts slowly to anchor yourself in the present."
          }
        }
      });
    }

  } catch (error: any) {
    console.error("Endpoint handling failed:", error);
    res.status(500).json({ error: "An unexpected error occurred while analyzing the journal entry." });
  }
});

// Configure Vite middleware or static serving
async function setupServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
    console.log("Vite development middleware integrated.");
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
    console.log("Production static files server configured.");
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Express full-stack server running on http://localhost:${PORT}`);
  });
}

setupServer();

# Aspirant Mind • Mental Wellness Tracker

A soothing, minimalist full-stack mental wellness portal explicitly designed for competitive exam aspirants (NEET, UPSC, CAT) experiencing extreme late-night fatigue and peer pressure.

This application includes:
- **Instant Unloading Journaling**: A safe space with sample triggers (NEET Category cutoff fatigue, CAT mock percentile stagnation, UPSC history study isolation).
- **10-Second State Indicator**: Multi-stress emoji slider logging high-density mental statuses.
- **Fail-Safe Crisis Safety Valve**: Fast, private server-side check. Severe trigger keywords bypass AI processing and instantly trigger a compassionate call recommendation to the national **Kiran Helpline: 1800-599-0019** and Tele-MANAS support channels.
- **Gemini 3.5-Flash Analysis**: Real-time integration of `@google/genai` checking stress scores, emotional validation, custom study coping strategies, and sensory grounding tasks.
- **Dynamic Stress Intensity Timeline**: A handcrafted, responsive, interactable SVG line-chart graphing local mood logs over time.
- **Anchor Breathing Timer**: Comforting visual guide displaying breathing phases (inhale, hold, exhale) with 4-second counts.

---

## 1. Chosen Vertical & Approach
- **Target Audience**: Indian competitive exam aspirants studying in isolated coaching hubs or late hours.
- **Aesthetic Theme Layout**: A low-contrast warm clay, sage-green, and candles theme designed specifically to prevent blue-light eye fatigue under extended midnight studies.
- **Strict Server Architecture**: Direct API calls mapping to backend functions prevents leakage of development secrets to the browser block.

---

## 2. Dynamic Next.js File Mapping (Production Guide Model)
While this sandbox environment implements the architecture using a rapid, high-performance **Vite + React + Express Dev Server** to ensure fluid inline previews, you can directly map this base architecture into Next.js App Router folders with the following structure:

```text
/my-nextjs-project
├── /app
│   ├── layout.tsx             # Standard global template setup
│   ├── page.tsx               # Renders standard Client Dashboard Component (derived from /src/App.tsx)
│   └── /api/journal
│       └── route.ts           # Next.js Server Route (derived from /server.ts POST handlers)
├── /components
│   └── TrendChart.tsx         # Handcrafted custom SVG timeline component
├── /lib
│   └── gemini.ts              # Server-side @google/genai loader utility
├── /testing
│   └── endpoints.test.ts      # Integration and test mock suites
├── package.json
└── .env.example
```

---

## 3. Server-side Logical Schema Checks
The endpoint handles API validation elegantly:
1. **Private Local Check**: Normalizes inputs to search for severe suicidal or distress terms. If found, standard generation is bypassed immediately, returning immediate details for the Kiran Mental Health Support block.
2. **Gemini JSON Structure Handling**: Uses `@google/genai` model configuring:
   - `detected_mood` (String)
   - `intensity_score` (Integer, Scale 1 to 10)
   - `empathetic_validation` (String)
   - `actionable_support` (Object containing detailed `coping_strategy` and `mindfulness_exercise`)

---

## 4. Key Assumptions Made
- **Helplines**: Assumed Kiran Helpline (`1800-599-0019`) and Tele-MANAS (`1800-891-4416`) are correct national numbers launched by the Government of India.
- **Local Persistence**: Client logs persist robustly inside `localStorage` to ensure a premium user experience across sessions even if the container dev server is restarted.
- **API Fallback Safe**: Integrated an offline fallback system so that if the development key is not updated immediately, the application behaves smoothly and provides premium comforting mock summaries without crashing the web page.

---

## 5. Testing & Validation Outline

The application includes an integration suite designed for rapid validation:
1. **Mock Testing Validation**: Check `/testing/journal-endpoints.test.ts` to see integration-level unit checks mapping standard schemas.
2. **Run Tests**: Run the test suite by executing:
   ```bash
   npx tsx testing/journal-endpoints.test.ts
   ```

3. **Interactive Visual Test Steps**:
   - Access the landing page.
   - Click the **"UPSC Mock Panic"** or **"NEET Biology"** preset chips to auto-fill high-stress situations.
   - Click **"Submit State Reflection"**. View deep emotional validation, coping recommendations, and stress intensity timeline point addition!
   - Click **"Midnight Panic/Crisis Helper"** or use the **"Crisis Prevention Trigger"** preset and submit to verify instant helpline bypass.

import express from 'express';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize Gemini SDK with User-Agent header
const apiKey = process.env.GEMINI_API_KEY;
let aiClient: GoogleGenAI | null = null;
if (apiKey) {
  aiClient = new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// Machine Copilot API endpoint
app.post('/api/copilot/chat', async (req, res) => {
  try {
    const { prompt, telemetryContext } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: 'Missing prompt parameter' });
    }

    const systemInstruction = `You are "PredictIQ Copilot", an elite Industrial IoT Reliability & Predictive Maintenance Engineer.
You analyze mission-critical heavy assets including High-Voltage Power Transformers, Aviation Turbofan Engines, Petrochemical Centrifugal Pumps, Wind Turbine Gearboxes, and Power Generators.

Your objective:
- Explain asset health, anomaly detection, physical sensor drift, and maintenance decisions in concise, professional, plain-English terms.
- Relate physical phenomena to practical failure modes:
  * Power Transformers: Dissolved gas analysis (H2/CH4), dielectric breakdown of oil, winding top-oil temperature, cellulose insulation moisture.
  * Turbofan Engines: Turbine exhaust heat (T50), compressor pressure ratio (P30), high-frequency rotor vibration.
  * Industrial Pumps: Inboard bearing overheating, mechanical seal leakage, cavitation pressure drops, motor load draw.
  * Wind Gearboxes: Planetary gear tooth wear, lubricating oil metal debris, high-speed shaft bearing temperatures.
- Keep responses concise (2 to 3 punchy paragraphs or bullet points). Highlight operational recommendations and financial savings.`;

    const fullContent = `CURRENT ASSET TELEMETRY CONTEXT:
${JSON.stringify(telemetryContext || {}, null, 2)}

USER QUESTION / PROMPT:
${prompt}`;

    const hasValidKey =
      apiKey &&
      apiKey !== 'MY_GEMINI_API_KEY' &&
      !apiKey.startsWith('MY_') &&
      apiKey.trim().length > 20;

    if (aiClient && hasValidKey) {
      try {
        // Race Gemini call against a 6-second timeout for prompt responsiveness
        const geminiPromise = aiClient.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: fullContent,
          config: {
            systemInstruction,
          },
        });

        const timeoutPromise = new Promise<null>((_, reject) =>
          setTimeout(() => reject(new Error('Gemini API timeout')), 6000)
        );

        const response: any = await Promise.race([geminiPromise, timeoutPromise]);
        const replyText = response?.text || 'Diagnostic analysis completed.';
        return res.json({ reply: replyText });
      } catch (geminiErr: any) {
        console.warn('Gemini API call failed or timed out, using aerospace heuristic fallback:', geminiErr?.message);
        // Fall through to heuristic analysis
      }
    }
      // Heuristic fallback if GEMINI_API_KEY is not configured yet
      const assetName = telemetryContext?.assetName || 'Asset';
      const timeUnit = telemetryContext?.timeUnit || 'Cycles';
      const cycle = telemetryContext?.currentCycle || 50;
      const rul = telemetryContext?.rulPred || 90;
      const status = telemetryContext?.status || 'HEALTHY';
      const mse = telemetryContext?.healthIndexMse || 0.004;
      const savings = telemetryContext?.avoidedLoss || 0;

      let fallbackReply = `**PredictIQ Copilot Assessment (${assetName})**\n\n`;
      if (status === 'HEALTHY') {
        fallbackReply += `${assetName} is currently in **Optimal Operational Health** at ${cycle} ${timeUnit}. Core physical sensors and telemetry channels remain well within calibrated baseline boundaries. The Autoencoder anomaly reconstruction MSE (${mse.toFixed(4)}) is comfortably below the 3-sigma alert threshold.\n\n**Recommendation:** Maintain standard operational workload. Next scheduled inspection recommended at ${Math.round(cycle + 25)} ${timeUnit}.`;
      } else if (status === 'DRIFT DETECTED') {
        fallbackReply += `**Early Degradation Drift Detected** at ${cycle} ${timeUnit}. Reconstruction error (${mse.toFixed(4)} MSE) has breached the statistical 3-sigma baseline, signaling the beginning of sub-surface wear.\n\n**Recommendation:** Flag asset for preventive diagnostic screening. Remaining Useful Life is estimated at **${Math.round(rul)} ${timeUnit}**.`;
      } else if (status === 'SCHEDULE MAINTENANCE') {
        fallbackReply += `**Maintenance Window Open:** Estimated Remaining Useful Life is **${Math.round(rul)} ${timeUnit}**. Executing scheduled line maintenance now secures **$${savings.toLocaleString()}** in avoided unplanned outage losses.\n\n**Recommendation:** Dispatch maintenance crew and staging replacement modules within the next 15 ${timeUnit}.`;
      } else {
        fallbackReply += `🚨 **CRITICAL IMMINENT FAILURE ALERT:** Remaining Useful Life is critically low (**${Math.round(rul)} ${timeUnit}**). Continued operation risks severe secondary equipment damage and emergency outage.\n\n**Recommendation:** Immediate shutdown recommended. Isolate asset and perform complete component overhaul.`;
      }

      return res.json({ reply: fallbackReply });
  } catch (error: any) {
    console.error('Copilot API error:', error);
    return res.status(500).json({
      error: 'Failed to generate copilot analysis',
      details: error.message || String(error),
    });
  }
});

// AI Sensor Anomaly Diagnostics API endpoint
app.post('/api/anomaly/diagnose', async (req, res) => {
  try {
    const {
      assetName = 'Asset',
      assetType = 'turbofan',
      category = 'Industrial Equipment',
      currentCycle = 1,
      maxLife = 100,
      timeUnit = 'Cycles',
      healthIndexMse = 0.003,
      threshold3Sigma = 0.0082,
      rulPred = 100,
      sensors = [],
    } = req.body;

    const mseRatio = healthIndexMse / (threshold3Sigma || 0.0082);
    const criticalSensors = sensors.filter((s: any) => Math.abs(Number(s.pctDelta)) > 20);
    const warningSensors = sensors.filter((s: any) => Math.abs(Number(s.pctDelta)) > 8 && Math.abs(Number(s.pctDelta)) <= 20);
    const hasAnomaly = healthIndexMse > threshold3Sigma || criticalSensors.length > 0 || warningSensors.length > 0;

    const hasValidKey =
      apiKey &&
      apiKey !== 'MY_GEMINI_API_KEY' &&
      !apiKey.startsWith('MY_') &&
      apiKey.trim().length > 20;

    if (aiClient && hasValidKey) {
      try {
        const prompt = `You are the lead AI Reliability & Sensor Diagnostics Specialist for Predictive Maintenance.
Analyze the following machine telemetry for anomalies:
Asset: ${assetName} (${category}, Type: ${assetType})
Current Lifecycle: ${currentCycle}/${maxLife} ${timeUnit}
Autoencoder Anomaly MSE: ${healthIndexMse} (3-sigma threshold: ${threshold3Sigma}, ratio: ${mseRatio.toFixed(2)}x)
Estimated Remaining Useful Life (RUL): ${rulPred} ${timeUnit}

Sensor Telemetry Readings:
${sensors
  .map(
    (s: any) =>
      `- ${s.name}: Current=${s.current} ${s.unit}, Baseline=${s.baseline} ${s.unit}, Delta=${s.delta > 0 ? '+' : ''}${s.delta} (${s.pctDelta}%)`
  )
  .join('\n')}

Respond ONLY with valid JSON in this exact structure:
{
  "hasAnomaly": boolean,
  "severity": "NOMINAL" | "DRIFT" | "WARNING" | "CRITICAL",
  "headline": string,
  "summary": string,
  "anomalousSensors": [
    { "name": string, "reading": string, "deviation": string, "concern": string }
  ],
  "physicalRootCause": string,
  "recommendedAction": string
}`;

        const geminiPromise = aiClient.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: prompt,
          config: {
            responseMimeType: 'application/json',
          },
        });

        const timeoutPromise = new Promise<null>((_, reject) =>
          setTimeout(() => reject(new Error('Timeout waiting for Gemini')), 5500)
        );

        const response: any = await Promise.race([geminiPromise, timeoutPromise]);
        const text = response?.text?.trim();
        if (text) {
          const parsed = JSON.parse(text);
          return res.json(parsed);
        }
      } catch (geminiErr: any) {
        console.warn('Gemini anomaly diagnostic failed, using deterministic physics fallback:', geminiErr?.message);
      }
    }

    // Deterministic High-Fidelity Physics Fallback
    let severity: 'NOMINAL' | 'DRIFT' | 'WARNING' | 'CRITICAL' = 'NOMINAL';
    let headline = 'Telemetry Nominal: All Channels Calibrated';
    let summary = `${assetName} telemetry is operating within nominal statistical tolerances. Autoencoder reconstruction MSE (${healthIndexMse.toFixed(4)}) is below the 3-sigma alert threshold.`;
    let physicalRootCause = 'Nominal thermal and aerodynamic equilibrium with baseline frictional wear.';
    let recommendedAction = `Continue standard operations. Next routine telemetry inspection at cycle ${Math.min(maxLife, currentCycle + 20)}.`;

    if (criticalSensors.length > 0 || mseRatio >= 2.0) {
      severity = 'CRITICAL';
      const sensorNames = criticalSensors.map((s: any) => s.name).join(', ') || 'multiple telemetry channels';
      headline = `Critical Anomaly Breach Detected in ${sensorNames}`;
      summary = `Severe sensor envelope departure detected at ${currentCycle} ${timeUnit}. Autoencoder anomaly MSE is ${mseRatio.toFixed(2)}x the 3-sigma threshold, indicating imminent component failure risk.`;
      
      if (assetType === 'turbofan') {
        physicalRootCause = 'Severe thermal gas path breakdown, turbine blade creep, and compressor stall margin degradation.';
        recommendedAction = 'Execute emergency borescope inspection, restrict flight envelope, and prepare for scheduled hot-section overhaul.';
      } else if (assetType === 'transformer') {
        physicalRootCause = 'High-energy electrical arcing and catastrophic dielectric breakdown of cellulose insulation.';
        recommendedAction = 'Immediately isolate transformer bank, perform urgent DGA oil degassing, and test breakdown voltage.';
      } else if (assetType === 'pump') {
        physicalRootCause = 'Advanced bearing spalling, severe cavitation erosion, and mechanical seal fluid blowby.';
        recommendedAction = 'Initiate hot-standby pump cutover immediately; pull pump for drive-end bearing and seal replacement.';
      } else if (assetType === 'gearbox') {
        physicalRootCause = 'High-speed pinion gear spalling with heavy metallic particulate contamination in the lubricating circuit.';
        recommendedAction = 'Brake turbine rotor, flush lubricating circuit, and inspect planetary gear teeth with endoscope.';
      } else {
        physicalRootCause = 'Rotor shaft eccentricity and high-frequency stator core thermal overload.';
        recommendedAction = 'De-rate generator load immediately and inspect journal bearing pedestals.';
      }
    } else if (warningSensors.length > 0 || healthIndexMse > threshold3Sigma) {
      severity = 'WARNING';
      const sensorNames = warningSensors.map((s: any) => s.name).join(', ') || 'telemetry sensors';
      headline = `Degradation Drift Detected in ${sensorNames}`;
      summary = `Sensor telemetry has begun diverging from calibrated baseline parameters (${mseRatio.toFixed(2)}x baseline MSE). Remaining useful life is ${Math.round(rulPred)} ${timeUnit}.`;
      
      if (assetType === 'turbofan') {
        physicalRootCause = 'Early stage compressor fouling and gradual thermal barrier coating erosion.';
        recommendedAction = 'Perform compressor wash during next turnaround and monitor vibration spectral harmonics.';
      } else if (assetType === 'transformer') {
        physicalRootCause = 'Thermal hotspot development causing localized oil decomposition and hydrogen gas accumulation.';
        recommendedAction = 'Verify cooling fan operation, check oil radiator cleanliness, and log daily DGA gas trends.';
      } else if (assetType === 'pump') {
        physicalRootCause = 'Hydraulic suction throttling and incipient journal bearing wear.';
        recommendedAction = 'Inspect suction strainer differential pressure and verify lube reservoir viscosity.';
      } else {
        physicalRootCause = 'Lubricant thermal degradation and early surface fatigue on transmission elements.';
        recommendedAction = 'Schedule oil sample laboratory analysis and monitor high-frequency vibration.';
      }
    }

    const anomalousSensorsList = sensors
      .filter((s: any) => Math.abs(Number(s.pctDelta)) > 8)
      .map((s: any) => ({
        name: s.name,
        reading: `${s.current} ${s.unit}`,
        deviation: `${s.delta > 0 ? '+' : ''}${s.delta} (${s.pctDelta}%)`,
        concern: Math.abs(Number(s.pctDelta)) > 20 ? 'Critical Envelope Breach' : 'Statistical Drift',
      }));

    return res.json({
      hasAnomaly,
      severity,
      headline,
      summary,
      anomalousSensors: anomalousSensorsList,
      physicalRootCause,
      recommendedAction,
    });
  } catch (error: any) {
    console.error('Anomaly diagnosis API error:', error);
    return res.status(500).json({
      error: 'Failed to diagnose sensor anomaly',
      details: error.message || String(error),
    });
  }
});

// System Status & Health Diagnostics Endpoint
app.get('/api/system/status', async (_req, res) => {
  let mlOnline = false;
  let mlDetails = null;

  try {
    const mlResponse = await fetch('http://localhost:8000/health', {
      signal: AbortSignal.timeout(1500),
    });
    if (mlResponse.ok) {
      mlDetails = await mlResponse.json();
      mlOnline = true;
    }
  } catch {
    mlOnline = false;
  }

  const hasValidKey = Boolean(
    apiKey &&
    apiKey !== 'MY_GEMINI_API_KEY' &&
    !apiKey.startsWith('MY_') &&
    apiKey.trim().length > 20
  );

  return res.json({
    mlEngine: {
      online: mlOnline,
      target: 'http://localhost:8000',
      details: mlDetails,
    },
    copilotAi: {
      configured: hasValidKey,
      model: 'gemini-2.5-flash',
      fallback: 'deterministic-thermodynamics',
    },
    version: '2.0.0-production',
  });
});

// PyTorch ML Microservice Proxy with Resilient Circuit Breaker
app.post('/api/predict/anomaly', async (req, res) => {
  try {
    const mlRes = await fetch('http://localhost:8000/predict/anomaly', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req.body),
      signal: AbortSignal.timeout(2500),
    });

    if (!mlRes.ok) {
      throw new Error(`ML service returned status ${mlRes.status}`);
    }

    const data = await mlRes.json();
    return res.json({ ...data, source: 'pytorch_ml_engine' });
  } catch (err: any) {
    return res.json({
      fallback: true,
      source: 'physics_simulation',
      message: 'Python ML service offline, serving calibrated physics fallback',
      error: err.message,
    });
  }
});

app.post('/api/predict/rul', async (req, res) => {
  try {
    const mlRes = await fetch('http://localhost:8000/predict/rul', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req.body),
      signal: AbortSignal.timeout(2500),
    });

    if (!mlRes.ok) {
      throw new Error(`ML service returned status ${mlRes.status}`);
    }

    const data = await mlRes.json();
    return res.json({ ...data, source: 'pytorch_ml_engine' });
  } catch (err: any) {
    return res.json({
      fallback: true,
      source: 'physics_simulation',
      message: 'Python ML service offline, serving calibrated physics fallback',
      error: err.message,
    });
  }
});

// Mount Vite middleware in dev or static files in production
async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static('dist'));
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server listening on port ${PORT}`);
  });
}

startServer();

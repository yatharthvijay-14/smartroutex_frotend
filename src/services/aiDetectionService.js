/**
 * AI Image Detection Engine v2
 * Multi-signal analysis to detect AI-generated images.
 *
 * Signals (in order of importance):
 *   1. EXIF Metadata         – Real phone photos always have rich EXIF. AI images never do.
 *   2. Image Dimensions      – AI generators output at fixed sizes (512, 768, 1024, 1280, 2048).
 *                              Real phone cameras produce irregular dimensions (4032×3024, etc.)
 *   3. Edge Sharpness Map    – AI images have uniform, perfect sharpness everywhere.
 *                              Real photos always have depth-of-field blur variation.
 *   4. Pixel Noise Texture   – Real photos have natural sensor (shot) noise.
 *                              AI renders are unnaturally smooth.
 *   5. Color Histogram       – Real photos have irregular color distributions.
 *                              AI images tend toward suspiciously balanced histograms.
 *   6. File Format           – AI generators commonly export PNG or very high-quality JPEG.
 */

import * as exifr from "exifr";

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

function loadImage(dataUrl) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = dataUrl;
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// SIGNAL 1: EXIF Metadata – most reliable single signal
// ─────────────────────────────────────────────────────────────────────────────
async function analyzeExif(file) {
  try {
    const exif = await exifr.parse(file, {
      pick: ["Make", "Model", "LensModel", "FocalLength", "FNumber", "ExposureTime",
             "ISOSpeedRatings", "ISO", "DateTimeOriginal", "DateTime", "GPSLatitude",
             "GPSLongitude", "Software", "ImageWidth", "ImageHeight", "Orientation",
             "Flash", "WhiteBalance", "MeteringMode"]
    });

    // Zero EXIF → very strong AI signal. Real photos from phones always have EXIF.
    if (!exif || Object.keys(exif).length === 0) {
      return {
        score: 60,
        detail: "No EXIF metadata whatsoever — strongly indicates AI generation or web-stripped image.",
        tags: {},
        hasCamera: false
      };
    }

    // Check for known AI software keywords in Software tag
    const AI_SOFTWARE = [
      "stable diffusion", "midjourney", "dall-e", "dalle", "firefly", "adobe firefly",
      "bing image", "imagen", "dream", "generative", "ai art", "neural", "automatic1111",
      "invokeai", "comfyui", "novelai", "artbreeder", "runwayml", "pixlr ai"
    ];
    const software = (exif.Software || "").toLowerCase();
    if (AI_SOFTWARE.some(kw => software.includes(kw))) {
      return { score: 95, detail: `AI Software tag: "${exif.Software}"`, tags: exif, hasCamera: false };
    }

    const hasCameraModel  = !!(exif.Make || exif.Model);
    const hasLens         = !!(exif.FocalLength || exif.FNumber || exif.LensModel);
    const hasShutter      = !!(exif.ExposureTime);
    const hasISO          = !!(exif.ISOSpeedRatings || exif.ISO);
    const hasDate         = !!(exif.DateTimeOriginal || exif.DateTime);
    const hasGPS          = !!(exif.GPSLatitude);
    const hasFlash        = exif.Flash !== undefined;
    const hasWhiteBalance = exif.WhiteBalance !== undefined;

    let score = 0;
    if (!hasCameraModel)  score += 22;
    if (!hasLens)         score += 10;
    if (!hasShutter)      score += 10;
    if (!hasISO)          score += 8;
    if (!hasDate)         score += 5;
    if (!hasGPS)          score += 3;
    // Camera with NO lens info and NO shutter = suspicious (metadata stripped)
    if (hasCameraModel && !hasLens && !hasShutter) score += 10;

    const detail = hasCameraModel
      ? `Camera: ${exif.Make || ""} ${exif.Model || ""} | ISO: ${exif.ISO || exif.ISOSpeedRatings || "N/A"} | f/${exif.FNumber || "N/A"} | Shutter: ${exif.ExposureTime || "N/A"}s`
      : `Minimal EXIF (${Object.keys(exif).length} tags, no camera model)`;

    return { score, detail, tags: exif, hasCamera: hasCameraModel };

  } catch {
    return {
      score: 40,
      detail: "EXIF unreadable — common in AI images with no embedded metadata.",
      tags: {},
      hasCamera: false
    };
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// SIGNAL 2: Image Dimensions
// AI generators produce images at standard power-of-2 or fixed sizes.
// Real phone cameras produce irregular, large, non-standard dimensions.
// ─────────────────────────────────────────────────────────────────────────────
function analyzeDimensions(width, height) {
  // Known AI generator output sizes
  const AI_SIZES = new Set([
    512, 576, 640, 704, 768, 832, 896, 960, 1024, 1088, 1152,
    1216, 1280, 1344, 1408, 1472, 1536, 1600, 2048, 2560
  ]);

  const AI_PAIRS = [
    [512,512], [512,768], [768,512], [768,768], [768,1024], [1024,768],
    [1024,1024], [1024,1536], [1536,1024], [1280,720], [1920,1080],
    [1024,576], [576,1024], [1344,768], [768,1344], [1216,832], [832,1216],
    [1152,896], [896,1152], [640,960], [960,640], [2048,2048],
    [1024,1024], [512,512]
  ];

  // Check exact AI pair matches
  const isExactAIPair = AI_PAIRS.some(([w, h]) => w === width && h === height);
  if (isExactAIPair) {
    return {
      score: 30,
      detail: `Exact AI generator dimension match: ${width}×${height} (common Stable Diffusion / Midjourney output size)`
    };
  }

  // Check if both dimensions are multiples of 64 (AI generators use 64-pixel grids)
  const bothMult64 = width % 64 === 0 && height % 64 === 0;
  if (bothMult64 && AI_SIZES.has(width) && AI_SIZES.has(height)) {
    return {
      score: 22,
      detail: `Both dimensions (${width}×${height}) are multiples of 64 — standard AI generation grid size`
    };
  }

  // Both divisible by 64 even if not in known set
  if (bothMult64 && width <= 2048 && height <= 2048) {
    return {
      score: 15,
      detail: `Dimensions ${width}×${height} are multiples of 64 — consistent with AI generation`
    };
  }

  // Very standard aspect ratios with small dimensions (web-compressed AI output)
  if (width <= 1200 && height <= 1200 && width % 8 === 0 && height % 8 === 0) {
    return {
      score: 8,
      detail: `Dimensions ${width}×${height} align with common web-distributed AI image sizes`
    };
  }

  // Real phone camera dimensions (irregular, large)
  return {
    score: 0,
    detail: `Dimensions ${width}×${height} — consistent with a real camera (non-standard size)`
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// SIGNAL 3: Edge Sharpness Uniformity
// AI images have perfect, uniform sharpness throughout.
// Real photos always have blur variation due to depth of field.
// ─────────────────────────────────────────────────────────────────────────────
async function analyzeEdgeSharpness(img) {
  try {
    const GRID = 4; // 4×4 grid = 16 patches
    const PATCH = 60;
    const canvas = document.createElement("canvas");
    canvas.width = PATCH;
    canvas.height = PATCH;
    const ctx = canvas.getContext("2d");

    const sharpnessValues = [];
    const stepX = (img.width - PATCH) / (GRID - 1);
    const stepY = (img.height - PATCH) / (GRID - 1);

    for (let gy = 0; gy < GRID; gy++) {
      for (let gx = 0; gx < GRID; gx++) {
        const sx = Math.floor(gx * stepX);
        const sy = Math.floor(gy * stepY);
        ctx.drawImage(img, sx, sy, PATCH, PATCH, 0, 0, PATCH, PATCH);
        const data = ctx.getImageData(0, 0, PATCH, PATCH).data;

        // Sobel edge strength for this patch
        const gray = [];
        for (let i = 0; i < data.length; i += 4) {
          gray.push(0.299 * data[i] + 0.587 * data[i+1] + 0.114 * data[i+2]);
        }

        let edgeSum = 0;
        for (let y = 1; y < PATCH - 1; y++) {
          for (let x = 1; x < PATCH - 1; x++) {
            const gxV = -gray[(y-1)*PATCH+(x-1)] + gray[(y-1)*PATCH+(x+1)]
                       - 2*gray[y*PATCH+(x-1)] + 2*gray[y*PATCH+(x+1)]
                       - gray[(y+1)*PATCH+(x-1)] + gray[(y+1)*PATCH+(x+1)];
            const gyV = -gray[(y-1)*PATCH+(x-1)] - 2*gray[(y-1)*PATCH+x] - gray[(y-1)*PATCH+(x+1)]
                       + gray[(y+1)*PATCH+(x-1)] + 2*gray[(y+1)*PATCH+x] + gray[(y+1)*PATCH+(x+1)];
            edgeSum += Math.sqrt(gxV*gxV + gyV*gyV);
          }
        }
        sharpnessValues.push(edgeSum / ((PATCH-2)*(PATCH-2)));
      }
    }

    const mean = sharpnessValues.reduce((a, b) => a + b, 0) / sharpnessValues.length;
    const variance = sharpnessValues.reduce((a, b) => a + (b - mean)**2, 0) / sharpnessValues.length;
    const cv = mean > 0 ? Math.sqrt(variance) / mean : 0; // Coefficient of variation

    // Low CV = uniform sharpness everywhere = AI-like
    // High CV = uneven sharpness (blur in background/edges) = real photo
    let score = 0;
    if (cv < 0.20) score = 20;       // Extremely uniform = very AI
    else if (cv < 0.35) score = 12;  // Fairly uniform = possibly AI
    else if (cv < 0.50) score = 5;   // Some variation = uncertain
    else score = 0;                   // High variation = likely real

    return {
      score,
      cv: cv.toFixed(3),
      detail: `Edge sharpness uniformity CV=${cv.toFixed(3)} (lower=more uniform=more AI-like; real photos CV>0.5)`
    };
  } catch {
    return { score: 0, cv: 0, detail: "Edge analysis skipped." };
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// SIGNAL 4: Pixel Noise (Laplacian variance)
// ─────────────────────────────────────────────────────────────────────────────
async function analyzePixelNoise(img) {
  try {
    const SIZE = 150;
    const canvas = document.createElement("canvas");
    canvas.width = SIZE; canvas.height = SIZE;
    const ctx = canvas.getContext("2d");
    const sx = Math.max(0, (img.width - SIZE) / 2);
    const sy = Math.max(0, (img.height - SIZE) / 2);
    ctx.drawImage(img, sx, sy, SIZE, SIZE, 0, 0, SIZE, SIZE);

    const data = ctx.getImageData(0, 0, SIZE, SIZE).data;
    const gray = [];
    for (let i = 0; i < data.length; i += 4) {
      gray.push(0.299 * data[i] + 0.587 * data[i+1] + 0.114 * data[i+2]);
    }

    // Laplacian filter to extract noise
    const lap = [0, -1, 0, -1, 4, -1, 0, -1, 0];
    const vals = [];
    for (let y = 1; y < SIZE-1; y++) {
      for (let x = 1; x < SIZE-1; x++) {
        let s = 0, k = 0;
        for (let dy = -1; dy <= 1; dy++)
          for (let dx = -1; dx <= 1; dx++)
            s += lap[k++] * gray[(y+dy)*SIZE+(x+dx)];
        vals.push(Math.abs(s));
      }
    }

    const mean = vals.reduce((a, b) => a + b, 0) / vals.length;
    const std  = Math.sqrt(vals.reduce((a, b) => a + (b-mean)**2, 0) / vals.length);

    // Real phone photos: std ≥ 10 (natural sensor noise)
    // AI images JPEG-compressed: std 4-8 (smooth with JPEG artifacts but no sensor noise)
    // Stock photos / downloads: std 5-9
    let score = 0;
    if (std < 5)       score = 25;
    else if (std < 8)  score = 15;
    else if (std < 12) score = 5;
    else               score = 0;

    return {
      score,
      std: std.toFixed(1),
      detail: `Noise level σ=${std.toFixed(1)} — real phone photos >12; AI/stock images typically <8`
    };
  } catch {
    return { score: 0, std: 0, detail: "Noise analysis skipped." };
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// SIGNAL 5: Color Histogram Irregularity
// ─────────────────────────────────────────────────────────────────────────────
async function analyzeHistogram(img) {
  try {
    const SIZE = 100;
    const canvas = document.createElement("canvas");
    canvas.width = SIZE; canvas.height = SIZE;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(img, 0, 0, SIZE, SIZE);
    const data = ctx.getImageData(0, 0, SIZE, SIZE).data;

    const bins = 16;
    const histR = new Array(bins).fill(0);
    const histG = new Array(bins).fill(0);
    const histB = new Array(bins).fill(0);
    for (let i = 0; i < data.length; i += 4) {
      histR[Math.floor(data[i] / (256/bins))]++;
      histG[Math.floor(data[i+1] / (256/bins))]++;
      histB[Math.floor(data[i+2] / (256/bins))]++;
    }

    const N = SIZE * SIZE;
    const exp = N / bins;
    const chi = ([histR, histG, histB].map(h =>
      h.reduce((s, c) => s + (c - exp)**2 / exp, 0)
    ).reduce((a, b) => a + b, 0)) / 3;

    let score = 0;
    if (chi < 200)       score = 12;
    else if (chi < 600)  score = 6;
    else if (chi < 1500) score = 2;

    return {
      score,
      chi: chi.toFixed(0),
      detail: `Color histogram irregularity χ²=${chi.toFixed(0)} (lower=more uniform=more AI-like; real photos >1500)`
    };
  } catch {
    return { score: 0, chi: 0, detail: "Histogram analysis skipped." };
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// SIGNAL 6: File Format Check
// ─────────────────────────────────────────────────────────────────────────────
function analyzeFormat(file) {
  const type = file.type;
  const ext  = file.name.split(".").pop().toLowerCase();
  const size = file.size;

  if (type === "image/png" || ext === "png") {
    const score = size > 1.5 * 1024 * 1024 ? 15 : 10;
    return { score, detail: `PNG format — AI generators commonly produce PNG output (${(size/1024/1024).toFixed(1)} MB)` };
  }
  if (type === "image/webp" || ext === "webp") {
    return { score: 8, detail: "WebP format — sometimes used by AI art platforms." };
  }
  // JPEG: common for both. No strong signal.
  return {
    score: 0,
    detail: `JPEG format — ${(size/1024).toFixed(0)} KB. Consistent with both real and AI photos.`
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN DETECTION
// ─────────────────────────────────────────────────────────────────────────────
export async function detectAIGeneratedImage(file, dataUrl) {
  // Load image once for dimension + canvas signals
  let img;
  try {
    img = await loadImage(dataUrl);
  } catch {
    img = null;
  }

  const width  = img?.naturalWidth  || 0;
  const height = img?.naturalHeight || 0;

  // Run all signals in parallel
  const [exifResult, noiseResult, histResult, edgeResult] = await Promise.all([
    analyzeExif(file),
    img ? analyzePixelNoise(img) : Promise.resolve({ score: 0, std: 0, detail: "Skipped." }),
    img ? analyzeHistogram(img)  : Promise.resolve({ score: 0, chi: 0, detail: "Skipped." }),
    img ? analyzeEdgeSharpness(img) : Promise.resolve({ score: 0, cv: 0, detail: "Skipped." })
  ]);
  const dimResult    = width  ? analyzeDimensions(width, height) : { score: 0, detail: "Could not read dimensions." };
  const formatResult = analyzeFormat(file);

  // Build signals array with weights
  const signals = [
    { name: "EXIF Metadata",        score: exifResult.score,   max: 95, detail: exifResult.detail,    weight: 0.35 },
    { name: "Image Dimensions",     score: dimResult.score,    max: 30, detail: dimResult.detail,     weight: 0.22 },
    { name: "Edge Sharpness",       score: edgeResult.score,   max: 20, detail: edgeResult.detail,    weight: 0.18 },
    { name: "Pixel Noise",          score: noiseResult.score,  max: 25, detail: noiseResult.detail,   weight: 0.14 },
    { name: "Color Histogram",      score: histResult.score,   max: 12, detail: histResult.detail,    weight: 0.07 },
    { name: "File Format",          score: formatResult.score, max: 15, detail: formatResult.detail,  weight: 0.04 }
  ];

  // Hard override: if AI software in EXIF
  if (exifResult.score >= 90) {
    return {
      isAIGenerated: true,
      confidence: 98,
      verdict: "AI Software Signature Detected in EXIF",
      exifTags: exifResult.tags,
      width, height,
      signals
    };
  }

  // Hard override: if EXACT AI dimension pair + no EXIF = almost certainly AI
  const noExif = !exifResult.hasCamera && exifResult.score >= 40;
  if (noExif && dimResult.score >= 22) {
    const confidence = Math.min(95, 60 + dimResult.score + Math.round(edgeResult.score / 2));
    return {
      isAIGenerated: true,
      confidence,
      verdict: "AI dimensions + missing camera EXIF = strongly AI-generated",
      exifTags: exifResult.tags,
      width, height,
      signals
    };
  }

  // Weighted score
  const rawScore    = signals.reduce((t, s) => t + s.score * s.weight, 0);
  const maxPossible = signals.reduce((t, s) => t + s.max  * s.weight, 0);
  const confidence  = Math.min(99, Math.round((rawScore / maxPossible) * 100));

  // Threshold: 38% → AI (more sensitive than before)
  const isAIGenerated = confidence >= 38;

  let verdict;
  if      (confidence >= 80) verdict = "Almost certainly AI-generated";
  else if (confidence >= 60) verdict = "Very likely AI-generated";
  else if (confidence >= 38) verdict = "Likely AI-generated — upload blocked";
  else if (confidence >= 25) verdict = "Some signals uncertain — possibly real";
  else                       verdict = "Real camera photo verified";

  return { isAIGenerated, confidence, verdict, exifTags: exifResult.tags, width, height, signals };
}

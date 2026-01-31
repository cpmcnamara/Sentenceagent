/**
 * Emotional Arc Analysis
 *
 * Implements narrative emotional trajectory analysis based on:
 * - Kurt Vonnegut's "Shapes of Stories"
 * - Reagan et al. (2016). "The emotional arcs of stories"
 * - Sentiment trajectory analysis
 *
 * The core insight: Great writing has intentional emotional architecture.
 * Strong emotional moments are created through contrast, buildup, and release.
 */

import { detectEmotionsV2, CircumplexPosition, GoEmotion } from '../types/emotional-v2.js';

// =============================================================================
// EMOTIONAL ARC TYPES
// =============================================================================

/**
 * The 6 core emotional arc shapes identified in Reagan et al. (2016)
 * Based on analysis of 1,327 stories from Project Gutenberg
 */
export type EmotionalArcShape =
  | 'rags_to_riches'      // Rise
  | 'riches_to_rags'      // Fall
  | 'man_in_hole'         // Fall then rise
  | 'icarus'              // Rise then fall
  | 'cinderella'          // Rise, fall, rise
  | 'oedipus'             // Fall, rise, fall
  | 'steady'              // Flat/minimal change
  | 'wave';               // Multiple oscillations

export interface EmotionalArc {
  /**
   * The detected arc shape
   */
  shape: EmotionalArcShape;

  /**
   * Confidence in the shape detection (0-1)
   */
  confidence: number;

  /**
   * Sentiment trajectory (valence values at each segment)
   */
  trajectory: number[];

  /**
   * Key moments in the arc
   */
  keyMoments: EmotionalMoment[];

  /**
   * Overall emotional range (max - min valence)
   */
  range: number;

  /**
   * Volatility (standard deviation of valence changes)
   */
  volatility: number;

  /**
   * Peak positions (0-1 through the text)
   */
  peaks: number[];

  /**
   * Valley positions (0-1 through the text)
   */
  valleys: number[];
}

export interface EmotionalMoment {
  position: number;           // 0-1 through text
  type: 'peak' | 'valley' | 'turn' | 'climax';
  valence: number;           // -1 to 1
  arousal: number;           // -1 to 1
  dominantEmotion: GoEmotion;
  text: string;              // The text at this moment
  strength: number;          // How strong is this moment (0-1)
}

// =============================================================================
// ARC ANALYSIS
// =============================================================================

/**
 * Analyze the emotional arc of a text
 */
export function analyzeEmotionalArc(text: string, segments: number = 10): EmotionalArc {
  // Split text into segments
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
  const segmentSize = Math.max(1, Math.ceil(sentences.length / segments));

  const trajectory: number[] = [];
  const arousalTrajectory: number[] = [];
  const segmentEmotions: { text: string; emotions: GoEmotion[]; circumplex: CircumplexPosition }[] = [];

  // Analyze each segment
  for (let i = 0; i < segments; i++) {
    const start = i * segmentSize;
    const end = Math.min(start + segmentSize, sentences.length);
    const segmentText = sentences.slice(start, end).join('. ');

    if (segmentText.trim()) {
      const analysis = detectEmotionsV2(segmentText);
      trajectory.push(analysis.circumplex.valence);
      arousalTrajectory.push(analysis.circumplex.arousal);
      segmentEmotions.push({
        text: segmentText,
        emotions: analysis.emotions,
        circumplex: analysis.circumplex,
      });
    } else {
      trajectory.push(0);
      arousalTrajectory.push(0);
      segmentEmotions.push({
        text: '',
        emotions: ['neutral'],
        circumplex: { valence: 0, arousal: 0 },
      });
    }
  }

  // Detect arc shape
  const { shape, confidence } = detectArcShape(trajectory);

  // Find peaks and valleys
  const peaks = findExtrema(trajectory, 'peak');
  const valleys = findExtrema(trajectory, 'valley');

  // Identify key emotional moments
  const keyMoments = identifyKeyMoments(trajectory, arousalTrajectory, segmentEmotions);

  // Calculate metrics
  const range = Math.max(...trajectory) - Math.min(...trajectory);
  const volatility = calculateVolatility(trajectory);

  return {
    shape,
    confidence,
    trajectory,
    keyMoments,
    range,
    volatility,
    peaks,
    valleys,
  };
}

/**
 * Detect the emotional arc shape
 */
function detectArcShape(trajectory: number[]): { shape: EmotionalArcShape; confidence: number } {
  if (trajectory.length < 3) {
    return { shape: 'steady', confidence: 0.5 };
  }

  const n = trajectory.length;
  const start = trajectory[0];
  const end = trajectory[n - 1];
  const mid = trajectory[Math.floor(n / 2)];
  const range = Math.max(...trajectory) - Math.min(...trajectory);

  // If minimal change, it's steady
  if (range < 0.2) {
    return { shape: 'steady', confidence: 0.8 };
  }

  // Count direction changes
  const directionChanges = countDirectionChanges(trajectory);

  // Simple rise
  if (end > start + 0.3 && directionChanges <= 2) {
    return { shape: 'rags_to_riches', confidence: 0.7 };
  }

  // Simple fall
  if (end < start - 0.3 && directionChanges <= 2) {
    return { shape: 'riches_to_rags', confidence: 0.7 };
  }

  // Man in hole (fall then rise)
  const minIdx = trajectory.indexOf(Math.min(...trajectory));
  if (minIdx > 0 && minIdx < n - 1 && end > trajectory[minIdx] + 0.2) {
    return { shape: 'man_in_hole', confidence: 0.75 };
  }

  // Icarus (rise then fall)
  const maxIdx = trajectory.indexOf(Math.max(...trajectory));
  if (maxIdx > 0 && maxIdx < n - 1 && end < trajectory[maxIdx] - 0.2) {
    return { shape: 'icarus', confidence: 0.75 };
  }

  // Cinderella (rise, fall, rise)
  if (directionChanges >= 2 && end > start) {
    const firstHalf = trajectory.slice(0, Math.floor(n / 2));
    const secondHalf = trajectory.slice(Math.floor(n / 2));
    const firstHalfTrend = firstHalf[firstHalf.length - 1] - firstHalf[0];
    const secondHalfTrend = secondHalf[secondHalf.length - 1] - secondHalf[0];

    if (firstHalfTrend < -0.1 && secondHalfTrend > 0.1) {
      return { shape: 'cinderella', confidence: 0.7 };
    }
  }

  // Oedipus (fall, rise, fall)
  if (directionChanges >= 2 && end < start) {
    return { shape: 'oedipus', confidence: 0.65 };
  }

  // Wave (multiple oscillations)
  if (directionChanges >= 4) {
    return { shape: 'wave', confidence: 0.6 };
  }

  return { shape: 'steady', confidence: 0.4 };
}

function countDirectionChanges(trajectory: number[]): number {
  let changes = 0;
  let increasing = true;

  for (let i = 1; i < trajectory.length; i++) {
    const diff = trajectory[i] - trajectory[i - 1];
    if (Math.abs(diff) > 0.1) {
      const nowIncreasing = diff > 0;
      if (i > 1 && nowIncreasing !== increasing) {
        changes++;
      }
      increasing = nowIncreasing;
    }
  }

  return changes;
}

function findExtrema(trajectory: number[], type: 'peak' | 'valley'): number[] {
  const extrema: number[] = [];
  const threshold = 0.1;

  for (let i = 1; i < trajectory.length - 1; i++) {
    const prev = trajectory[i - 1];
    const curr = trajectory[i];
    const next = trajectory[i + 1];

    if (type === 'peak' && curr > prev + threshold && curr > next + threshold) {
      extrema.push(i / (trajectory.length - 1));
    } else if (type === 'valley' && curr < prev - threshold && curr < next - threshold) {
      extrema.push(i / (trajectory.length - 1));
    }
  }

  return extrema;
}

function calculateVolatility(trajectory: number[]): number {
  if (trajectory.length < 2) return 0;

  const changes: number[] = [];
  for (let i = 1; i < trajectory.length; i++) {
    changes.push(Math.abs(trajectory[i] - trajectory[i - 1]));
  }

  const mean = changes.reduce((a, b) => a + b, 0) / changes.length;
  const variance = changes.reduce((sum, c) => sum + Math.pow(c - mean, 2), 0) / changes.length;

  return Math.sqrt(variance);
}

function identifyKeyMoments(
  valenceTrajectory: number[],
  arousalTrajectory: number[],
  segments: { text: string; emotions: GoEmotion[]; circumplex: CircumplexPosition }[]
): EmotionalMoment[] {
  const moments: EmotionalMoment[] = [];
  const n = valenceTrajectory.length;

  for (let i = 0; i < n; i++) {
    const position = i / (n - 1);
    const valence = valenceTrajectory[i];
    const arousal = arousalTrajectory[i];
    const segment = segments[i];

    // Check if this is a significant moment
    const isPeak = i > 0 && i < n - 1 &&
      valence > valenceTrajectory[i - 1] + 0.1 &&
      valence > valenceTrajectory[i + 1] + 0.1;

    const isValley = i > 0 && i < n - 1 &&
      valence < valenceTrajectory[i - 1] - 0.1 &&
      valence < valenceTrajectory[i + 1] - 0.1;

    const isTurn = i > 0 && i < n - 1 &&
      Math.sign(valenceTrajectory[i] - valenceTrajectory[i - 1]) !==
      Math.sign(valenceTrajectory[i + 1] - valenceTrajectory[i]);

    const isClimax = arousal > 0.5 && Math.abs(valence) > 0.5;

    if (isPeak || isValley || isTurn || isClimax) {
      const type = isClimax ? 'climax' : isPeak ? 'peak' : isValley ? 'valley' : 'turn';
      const strength = Math.sqrt(valence * valence + arousal * arousal);

      moments.push({
        position,
        type,
        valence,
        arousal,
        dominantEmotion: segment.emotions[0] || 'neutral',
        text: segment.text.slice(0, 100) + (segment.text.length > 100 ? '...' : ''),
        strength: Math.min(1, strength),
      });
    }
  }

  return moments;
}

// =============================================================================
// STRONG EMOTIONAL MOMENT DETECTION
// =============================================================================

/**
 * Identify what makes an emotional moment "strong"
 * Based on peak-end rule and emotional contrast
 */
export interface StrongMomentAnalysis {
  isStrong: boolean;
  strength: number;  // 0-1
  factors: StrongMomentFactor[];
  recommendation: string;
}

export interface StrongMomentFactor {
  factor: string;
  present: boolean;
  contribution: number;
  description: string;
}

export function analyzeEmotionalMomentStrength(
  momentText: string,
  precedingText: string,
  followingText?: string
): StrongMomentAnalysis {
  const factors: StrongMomentFactor[] = [];

  const momentAnalysis = detectEmotionsV2(momentText);
  const precedingAnalysis = detectEmotionsV2(precedingText);

  // Factor 1: Emotional contrast with preceding text
  const valenceContrast = Math.abs(momentAnalysis.circumplex.valence - precedingAnalysis.circumplex.valence);
  factors.push({
    factor: 'contrast',
    present: valenceContrast > 0.3,
    contribution: Math.min(0.25, valenceContrast * 0.5),
    description: valenceContrast > 0.3
      ? 'Strong emotional contrast with preceding text'
      : 'Could benefit from more contrast with setup',
  });

  // Factor 2: High arousal (intensity)
  const arousal = momentAnalysis.circumplex.arousal;
  factors.push({
    factor: 'intensity',
    present: arousal > 0.4,
    contribution: Math.min(0.2, arousal * 0.3),
    description: arousal > 0.4
      ? 'High emotional intensity'
      : 'Could be more emotionally intense',
  });

  // Factor 3: Specificity (concrete language)
  const concreteWords = countConcreteWords(momentText);
  const wordCount = momentText.split(/\s+/).length;
  const concreteRatio = concreteWords / Math.max(1, wordCount);
  factors.push({
    factor: 'specificity',
    present: concreteRatio > 0.15,
    contribution: Math.min(0.15, concreteRatio),
    description: concreteRatio > 0.15
      ? 'Uses concrete, specific language'
      : 'Could use more concrete details',
  });

  // Factor 4: Brevity at peak (compression)
  const sentenceLength = wordCount / Math.max(1, (momentText.match(/[.!?]/g) || []).length + 1);
  const isBrief = sentenceLength < 12;
  factors.push({
    factor: 'compression',
    present: isBrief,
    contribution: isBrief ? 0.15 : 0.05,
    description: isBrief
      ? 'Punchy, compressed delivery'
      : 'Consider tightening for more impact',
  });

  // Factor 5: Structural emphasis (punctuation, rhythm)
  const hasEmphasis = /[!—:]/.test(momentText) || /\.\s+[A-Z][a-z]+\./.test(momentText);
  factors.push({
    factor: 'emphasis',
    present: hasEmphasis,
    contribution: hasEmphasis ? 0.1 : 0,
    description: hasEmphasis
      ? 'Uses structural emphasis (punctuation, rhythm)'
      : 'Could use punctuation/structure for emphasis',
  });

  // Factor 6: Position (end of section = more memorable)
  // Can't fully assess without more context, but short sentences at end are strong
  const endsShort = momentText.trim().split(/[.!?]+/).pop()?.split(/\s+/).length || 0;
  const hasStrongEnd = endsShort < 8 && endsShort > 0;
  factors.push({
    factor: 'landing',
    present: hasStrongEnd,
    contribution: hasStrongEnd ? 0.15 : 0.05,
    description: hasStrongEnd
      ? 'Strong short landing'
      : 'Consider a shorter final punch',
  });

  // Calculate total strength
  const strength = factors.reduce((sum, f) => sum + f.contribution, 0);
  const isStrong = strength >= 0.5;

  // Generate recommendation
  const weakFactors = factors.filter(f => !f.present);
  const recommendation = isStrong
    ? 'This is a strong emotional moment. The combination of factors creates impact.'
    : weakFactors.length > 0
      ? `To strengthen: ${weakFactors.slice(0, 2).map(f => f.description).join('. ')}`
      : 'Consider adding more emotional contrast or intensity.';

  return {
    isStrong,
    strength: Math.min(1, strength),
    factors,
    recommendation,
  };
}

function countConcreteWords(text: string): number {
  // Concrete words: sensory, specific nouns, action verbs
  const concretePatterns = [
    /\b(see|saw|look|watch|stare|glance)\b/gi,
    /\b(hear|heard|listen|sound|noise)\b/gi,
    /\b(feel|felt|touch|cold|hot|warm|rough|smooth)\b/gi,
    /\b(smell|taste|bitter|sweet|sour)\b/gi,
    /\b(walk|run|jump|sit|stand|fall|grab|push|pull)\b/gi,
    /\b(door|window|table|chair|floor|wall|hand|face|eye)\b/gi,
    /\b(red|blue|green|white|black|dark|light|bright)\b/gi,
  ];

  let count = 0;
  for (const pattern of concretePatterns) {
    const matches = text.match(pattern);
    if (matches) count += matches.length;
  }

  return count;
}

// =============================================================================
// EMOTIONAL PACING RECOMMENDATIONS
// =============================================================================

export interface EmotionalPacingAdvice {
  currentPacing: 'too_flat' | 'too_volatile' | 'well_paced' | 'front_loaded' | 'back_loaded';
  recommendations: string[];
  suggestedArc: EmotionalArcShape;
}

export function analyzeEmotionalPacing(arc: EmotionalArc): EmotionalPacingAdvice {
  const recommendations: string[] = [];
  let currentPacing: EmotionalPacingAdvice['currentPacing'] = 'well_paced';
  let suggestedArc = arc.shape;

  // Check for flat pacing
  if (arc.range < 0.3) {
    currentPacing = 'too_flat';
    recommendations.push('Add emotional contrast - the piece feels emotionally flat');
    recommendations.push('Consider a "man in hole" structure: tension then resolution');
    suggestedArc = 'man_in_hole';
  }

  // Check for excessive volatility
  if (arc.volatility > 0.4) {
    currentPacing = 'too_volatile';
    recommendations.push('Reduce emotional whiplash - let moments breathe');
    recommendations.push('Consolidate peaks for more impact');
  }

  // Check for front-loaded emotion
  if (arc.peaks.length > 0 && arc.peaks[0] < 0.3) {
    if (arc.trajectory[arc.trajectory.length - 1] < arc.trajectory[0]) {
      currentPacing = 'front_loaded';
      recommendations.push('Save your strongest moments for later');
      recommendations.push('The ending should be at least as strong as the opening');
    }
  }

  // Check for back-loaded (often good, but could use setup)
  if (arc.peaks.length > 0 && arc.peaks[arc.peaks.length - 1] > 0.8) {
    if (arc.valleys.length === 0 || Math.min(...arc.valleys) > 0.5) {
      currentPacing = 'back_loaded';
      recommendations.push('Consider adding a valley/tension point earlier to create contrast');
    }
  }

  // Arc-specific advice
  if (arc.shape === 'steady' && arc.range >= 0.3) {
    recommendations.push('You have emotional range but no clear arc shape');
    recommendations.push('Try organizing moments into a clear rise or rise-fall structure');
  }

  if (arc.keyMoments.length === 0) {
    recommendations.push('No clear emotional peaks detected');
    recommendations.push('Identify your most important moment and amplify it');
  }

  if (currentPacing === 'well_paced' && recommendations.length === 0) {
    recommendations.push('Emotional pacing is effective');
    recommendations.push(`The ${arc.shape.replace('_', ' ')} structure is working`);
  }

  return {
    currentPacing,
    recommendations,
    suggestedArc,
  };
}

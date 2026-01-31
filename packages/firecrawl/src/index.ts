/**
 * Firecrawl Integration for Rhythm Pattern Miner
 * Handles URL fetching and text extraction
 */

import FirecrawlApp from '@mendable/firecrawl-js';

export interface ExtractedContent {
  url: string;
  title: string;
  markdown: string;
  paragraphs: string[];
  sentences: string[];
  fetchedAt: string;
  success: boolean;
  error?: string;
}

export interface FirecrawlConfig {
  apiKey: string;
  timeout?: number;
}

export class FirecrawlClient {
  private client: FirecrawlApp;
  private timeout: number;

  constructor(config: FirecrawlConfig) {
    this.client = new FirecrawlApp({ apiKey: config.apiKey });
    this.timeout = config.timeout ?? 30000;
  }

  /**
   * Scrape a URL and extract clean text content
   */
  async scrapeUrl(url: string): Promise<ExtractedContent> {
    try {
      const result = await this.client.scrapeUrl(url, {
        formats: ['markdown'],
      }) as any; // Type assertion due to SDK type inconsistencies

      // Handle both old and new SDK response structures
      const data = result.data || result;
      const markdown = data.markdown || '';
      const metadata = data.metadata || {};

      if (!result.success || !markdown) {
        return {
          url,
          title: '',
          markdown: '',
          paragraphs: [],
          sentences: [],
          fetchedAt: new Date().toISOString(),
          success: false,
          error: result.error || 'Failed to extract content from URL',
        };
      }

      const title = metadata.title || '';
      const paragraphs = this.extractParagraphs(markdown);
      const sentences = this.extractSentences(paragraphs);

      return {
        url,
        title,
        markdown,
        paragraphs,
        sentences,
        fetchedAt: new Date().toISOString(),
        success: true,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      return {
        url,
        title: '',
        markdown: '',
        paragraphs: [],
        sentences: [],
        fetchedAt: new Date().toISOString(),
        success: false,
        error: errorMessage,
      };
    }
  }

  /**
   * Extract paragraphs from markdown content
   */
  private extractParagraphs(markdown: string): string[] {
    // Remove markdown formatting
    let text = markdown
      // Remove headers
      .replace(/^#{1,6}\s+/gm, '')
      // Remove links but keep text
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
      // Remove images
      .replace(/!\[[^\]]*\]\([^)]+\)/g, '')
      // Remove bold/italic
      .replace(/\*\*([^*]+)\*\*/g, '$1')
      .replace(/\*([^*]+)\*/g, '$1')
      .replace(/__([^_]+)__/g, '$1')
      .replace(/_([^_]+)_/g, '$1')
      // Remove code blocks
      .replace(/```[\s\S]*?```/g, '')
      .replace(/`([^`]+)`/g, '$1')
      // Remove blockquotes marker
      .replace(/^>\s+/gm, '')
      // Remove list markers
      .replace(/^[\s]*[-*+]\s+/gm, '')
      .replace(/^[\s]*\d+\.\s+/gm, '')
      // Remove horizontal rules
      .replace(/^[-*_]{3,}$/gm, '')
      // Clean up multiple newlines
      .replace(/\n{3,}/g, '\n\n');

    // Split into paragraphs (double newline separated)
    const rawParagraphs = text.split(/\n\n+/);

    // Filter and clean paragraphs
    const paragraphs = rawParagraphs
      .map(p => p.trim().replace(/\n/g, ' ').replace(/\s+/g, ' '))
      .filter(p => {
        // Must have at least 20 characters
        if (p.length < 20) return false;
        // Must have at least one sentence-ending punctuation
        if (!/[.!?]/.test(p)) return false;
        // Skip if it looks like navigation/menu
        if (/^(home|about|contact|menu|skip|search)/i.test(p)) return false;
        // Skip if it's mostly special characters
        const alphaRatio = (p.match(/[a-zA-Z]/g)?.length ?? 0) / p.length;
        if (alphaRatio < 0.5) return false;
        return true;
      });

    return paragraphs;
  }

  /**
   * Extract individual sentences from paragraphs
   */
  private extractSentences(paragraphs: string[]): string[] {
    const sentences: string[] = [];

    for (const paragraph of paragraphs) {
      // Split on sentence boundaries
      // This regex handles: periods, exclamation marks, question marks
      // while being careful about abbreviations
      const sentenceMatches = paragraph.match(
        /[^.!?]*[.!?]+(?:\s+|$)|[^.!?]+$/g
      );

      if (sentenceMatches) {
        for (const sentence of sentenceMatches) {
          const cleaned = sentence.trim();
          // Must be substantial
          if (cleaned.length >= 10 && cleaned.split(/\s+/).length >= 3) {
            sentences.push(cleaned);
          }
        }
      }
    }

    return sentences;
  }

  /**
   * Test if a URL is accessible
   */
  async testUrl(url: string): Promise<{ success: boolean; message: string }> {
    try {
      const result = await this.scrapeUrl(url);
      if (result.success) {
        return {
          success: true,
          message: `Successfully extracted ${result.paragraphs.length} paragraphs and ${result.sentences.length} sentences`,
        };
      }
      return {
        success: false,
        message: result.error || 'Unknown error',
      };
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }
}

/**
 * Process pasted text directly (fallback when Firecrawl isn't needed)
 */
export function processText(text: string): ExtractedContent {
  // Split into paragraphs
  const paragraphs = text
    .split(/\n\n+/)
    .map(p => p.trim().replace(/\n/g, ' ').replace(/\s+/g, ' '))
    .filter(p => p.length >= 20 && /[.!?]/.test(p));

  // Extract sentences
  const sentences: string[] = [];
  for (const paragraph of paragraphs) {
    const sentenceMatches = paragraph.match(/[^.!?]*[.!?]+(?:\s+|$)|[^.!?]+$/g);
    if (sentenceMatches) {
      for (const sentence of sentenceMatches) {
        const cleaned = sentence.trim();
        if (cleaned.length >= 10 && cleaned.split(/\s+/).length >= 3) {
          sentences.push(cleaned);
        }
      }
    }
  }

  return {
    url: 'paste://local',
    title: 'Pasted Content',
    markdown: text,
    paragraphs,
    sentences,
    fetchedAt: new Date().toISOString(),
    success: true,
  };
}

/**
 * Create a Firecrawl client from environment variables
 */
export function createClient(): FirecrawlClient {
  const apiKey = process.env.FIRECRAWL_API_KEY;
  if (!apiKey) {
    throw new Error('FIRECRAWL_API_KEY environment variable is required');
  }
  return new FirecrawlClient({ apiKey });
}

export default FirecrawlClient;

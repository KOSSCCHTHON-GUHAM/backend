import OpenAI from 'openai';
import aiClient from '../config/aiClient';

const MAX_PAGE_CHARS = 24000;
const MAX_AI_TEXT_CHARS = 12000;

export interface PostingDraft {
  title: string;
  summary: string;
  categories: string[];
  deadline: string | null;
  region: string | null;
  activityMethod: string | null;
  recruitCount: number | null;
  gives: string[];
  needs: string[];
  tags: string[];
}

interface SourceAnalysisInput {
  url: string;
  image: Express.Multer.File;
  model?: string;
}

const asStringArray = (value: unknown): string[] =>
  Array.isArray(value)
    ? value.filter((item): item is string => typeof item === 'string').map((item) => item.trim()).filter(Boolean)
    : [];

const asNullableString = (value: unknown): string | null =>
  typeof value === 'string' && value.trim() ? value.trim() : null;

const parseDraft = (content: string): PostingDraft => {
  const json = content.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/\s*```$/, '').trim();
  const value: unknown = JSON.parse(json);
  if (typeof value !== 'object' || value === null) throw new Error('AI가 올바른 JSON을 반환하지 않았습니다.');

  const result = value as Record<string, unknown>;
  return {
    title: typeof result.title === 'string' ? result.title.trim() : '',
    summary: typeof result.summary === 'string' ? result.summary.trim() : '',
    categories: asStringArray(result.categories),
    deadline: asNullableString(result.deadline),
    region: asNullableString(result.region),
    activityMethod: asNullableString(result.activityMethod),
    recruitCount: typeof result.recruitCount === 'number' && Number.isInteger(result.recruitCount) ? result.recruitCount : null,
    gives: asStringArray(result.gives),
    needs: asStringArray(result.needs),
    tags: asStringArray(result.tags),
  };
};

export class SourceAnalysisService {
  private validateUrl(rawUrl: string): URL {
    let url: URL;
    try {
      url = new URL(rawUrl);
    } catch {
      throw new Error('올바른 URL을 입력해 주세요.');
    }

    if (!['http:', 'https:'].includes(url.protocol)) throw new Error('http 또는 https 링크만 분석할 수 있습니다.');

    const host = url.hostname.toLowerCase();
    if (
      host === 'localhost' || host === '::1' || /^127\./.test(host) || /^0\./.test(host)
      || /^10\./.test(host) || /^192\.168\./.test(host) || /^169\.254\./.test(host)
      || /^172\.(1[6-9]|2\d|3[0-1])\./.test(host)
    ) {
      throw new Error('내부 서버 주소는 분석할 수 없습니다.');
    }
    return url;
  }

  private htmlToText(html: string): string {
    return html
      .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, ' ')
      .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, ' ')
      .replace(/<[^>]+>/g, ' ')
      .replace(/&nbsp;/gi, ' ')
      .replace(/&amp;/gi, '&')
      .replace(/\s+/g, ' ')
      .trim();
  }

  private async readUrl(rawUrl: string): Promise<string> {
    const url = this.validateUrl(rawUrl);
    const response = await fetch(url, {
      headers: { 'User-Agent': 'GUHAM-Source-Analyzer/1.0' },
      redirect: 'manual',
      signal: AbortSignal.timeout(10000),
    });

    if (response.status >= 300 && response.status < 400) throw new Error('리디렉션된 링크는 최종 주소를 다시 입력해 주세요.');
    if (!response.ok) throw new Error(`링크 내용을 가져오지 못했습니다. (HTTP ${response.status})`);

    const contentType = response.headers.get('content-type') || '';
    if (!contentType.includes('text/html') && !contentType.includes('text/plain')) {
      throw new Error('현재 링크 분석은 웹페이지 또는 텍스트 링크만 지원합니다.');
    }

    const text = this.htmlToText((await response.text()).slice(0, MAX_PAGE_CHARS));
    if (!text) throw new Error('링크에서 분석할 텍스트를 찾지 못했습니다.');
    return text;
  }

  async createPostingDraft(input: SourceAnalysisInput): Promise<PostingDraft> {
    const urlText = await this.readUrl(input.url);
    const text = urlText.slice(0, MAX_AI_TEXT_CHARS);
    const content: OpenAI.Chat.Completions.ChatCompletionContentPart[] = [
      {
        type: 'text',
        text: `아래 공모전 또는 프로젝트 자료를 바탕으로 게시글 초안을 작성해 주세요. 링크 텍스트와 이미지가 함께 있으면 두 자료를 교차 확인하세요. 자료에 없는 사실은 추측하지 마세요. deadline은 YYYY-MM-DD 또는 null, recruitCount는 정수 또는 null로 작성하세요. 오직 유효한 JSON 객체만 반환하세요. JSON 필드는 정확히 title (string), summary (Korean string), categories (string array), deadline (YYYY-MM-DD string or null), region (string or null), activityMethod (string or null), recruitCount (integer or null), gives (string array), needs (string array), tags (string array)만 사용하세요.\n\n자료 텍스트:\n${text || '(이미지 자료만 제공됨)'}`,
      },
    ];

    const imageData = input.image.buffer.toString('base64');
    content.push({
      type: 'image_url',
      image_url: { url: `data:${input.image.mimetype};base64,${imageData}` },
    });

    const response = await aiClient.chat.completions.create({
      model: input.model || process.env.AI_MODEL || 'nova-2-lite',
      temperature: 0.2,
      messages: [{ role: 'user', content }],
    });

    return parseDraft(response.choices[0]?.message.content || '');
  }
}

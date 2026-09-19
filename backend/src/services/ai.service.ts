import { lookup } from 'dns/promises';
import aiClient from '../config/aiClient';

export interface AnalyzeResult { giveTags: string[]; needTags: string[]; summary: string }
export interface DraftResult {
  title: string; category: string; recruitCount: number; content: string;
  giveTags: string[]; needTags: string[]; activityRegion: string;
  activityMethod: string; activityHours: string; relatedLinks: string[]; warnings: string[];
}

const parseJson = <T>(raw: string): T => {
  const start = raw.indexOf('{');
  const end = raw.lastIndexOf('}');
  if (start < 0 || end < start) throw new Error('AI 응답에서 JSON 객체를 찾을 수 없습니다.');
  return JSON.parse(raw.slice(start, end + 1)) as T;
};
const isPrivateAddress = (address: string): boolean => /^(127\.|10\.|0\.|169\.254\.|192\.168\.|172\.(1[6-9]|2\d|3[01])\.|::1$|fc|fd|fe80)/i.test(address);

const fetchLinkText = async (rawUrl: string): Promise<string> => {
  const url = new URL(rawUrl);
  if (!['http:', 'https:'].includes(url.protocol)) throw new Error('HTTP(S) 링크만 지원합니다.');
  const addresses = await lookup(url.hostname, { all: true });
  if (addresses.some(({ address }) => isPrivateAddress(address))) throw new Error('내부 네트워크 주소는 분석할 수 없습니다.');
  const response = await fetch(url, { headers: { 'User-Agent': 'GUHAM-LinkAnalyzer/1.0' }, redirect: 'follow', signal: AbortSignal.timeout(7000) });
  if (!response.ok) throw new Error(`링크 응답 오류(${response.status})`);
  const type = response.headers.get('content-type') ?? '';
  if (!type.includes('text/html') && !type.includes('text/plain') && !type.includes('application/json')) throw new Error('텍스트 형식의 링크만 분석할 수 있습니다.');
  return (await response.text()).replace(/<script[\s\S]*?<\/script>/gi, ' ').replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').slice(0, 12000);
};

export class AiService {
  private readonly model = process.env.AI_MODEL || 'claude-sonnet-4-6';

  async analyzePost(title: string, category: string, content: string): Promise<AnalyzeResult> {
    const response = await aiClient.chat.completions.create({ model: this.model, messages: [
      { role: 'system', content: 'GUHAM 포스팅에서 제공 역량(GIVE)과 필요한 역량(NEED)을 표준 기술 태그로 추출한다. JSON만 반환한다: {"giveTags":string[],"needTags":string[],"summary":string}' },
      { role: 'user', content: `제목: ${title}\n카테고리: ${category}\n내용: ${content}` },
    ], response_format: { type: 'json_object' } });
    return parseJson<AnalyzeResult>(response.choices[0]?.message.content ?? '{}');
  }

  async normalizeProfile(customGiveText = '', customInterestText = ''): Promise<{ normalizedGiveTags: string[]; normalizedInterestTags: string[] }> {
    if (!customGiveText.trim() && !customInterestText.trim()) return { normalizedGiveTags: [], normalizedInterestTags: [] };
    const response = await aiClient.chat.completions.create({ model: this.model, messages: [
      { role: 'system', content: '사용자의 자유 입력을 간결한 한국어/영문 표준 태그로 정규화한다. JSON만 반환한다: {"normalizedGiveTags":string[],"normalizedInterestTags":string[]}' },
      { role: 'user', content: `GIVE: ${customGiveText}\n관심 분야: ${customInterestText}` },
    ], response_format: { type: 'json_object' } });
    return parseJson(response.choices[0]?.message.content ?? '{}');
  }

  async createDraft(files: Express.Multer.File[], links: string[]): Promise<DraftResult> {
    const warnings: string[] = [];
    const linkContents = await Promise.all(links.map(async (link) => {
      try { return `URL: ${link}\n본문: ${await fetchLinkText(link)}`; }
      catch (error) { warnings.push(`${link}: ${error instanceof Error ? error.message : '분석 실패'}`); return `URL: ${link}`; }
    }));
    const prompt = `첨부 자료를 바탕으로 팀원 모집 포스팅 초안을 작성해라. 추측이 필요한 값은 빈 문자열로 둔다. JSON만 반환한다.\n형식: {"title":string,"category":string,"recruitCount":number,"content":string,"giveTags":string[],"needTags":string[],"activityRegion":string,"activityMethod":string,"activityHours":string}\n${linkContents.join('\n\n')}`;
    const parts: any[] = [{ type: 'text', text: prompt }];
    for (const file of files) parts.push({ type: 'image_url', image_url: { url: `data:${file.mimetype};base64,${file.buffer.toString('base64')}` } });
    const response = await aiClient.chat.completions.create({ model: this.model, messages: [{ role: 'user', content: parts }], response_format: { type: 'json_object' } });
    const draft = parseJson<Omit<DraftResult, 'relatedLinks' | 'warnings'>>(response.choices[0]?.message.content ?? '{}');
    return { ...draft, relatedLinks: links, warnings };
  }

  async embedding(text: string): Promise<number[] | undefined> {
    const model = process.env.AI_EMBEDDING_MODEL;
    if (!model || !text.trim()) return undefined;
    const response = await aiClient.embeddings.create({ model, input: text.slice(0, 8000) });
    return response.data[0]?.embedding;
  }

  async semanticSimilarity(left: string, right: string): Promise<number> {
    const response = await aiClient.chat.completions.create({
      model: this.model,
      messages: [
        { role: 'system', content: '두 텍스트의 팀 프로젝트 역량/관심 분야 의미 유사도를 0~1 사이 숫자로 평가한다. JSON만 반환한다: {"score":number}' },
        { role: 'user', content: `텍스트 A:\n${left}\n\n텍스트 B:\n${right}` },
      ],
      response_format: { type: 'json_object' },
    });
    const parsed = parseJson<{ score?: number; similarity_score?: number }>(response.choices[0]?.message.content ?? '{}');
    const score = parsed.score ?? parsed.similarity_score;
    if (typeof score !== 'number' || !Number.isFinite(score)) throw new Error('AI 유사도 점수가 올바르지 않습니다.');
    return Math.min(1, Math.max(0, score));
  }

  async chat(message: string, model = this.model): Promise<{ content: string; model: string; usage: object }> {
    const response = await aiClient.chat.completions.create({ model, messages: [{ role: 'user', content: message }] });
    return { content: response.choices[0]?.message.content ?? '', model: response.model, usage: response.usage ?? {} };
  }

  async listModels(): Promise<string[]> {
    const response = await aiClient.models.list();
    return response.data.map((item) => item.id);
  }
}

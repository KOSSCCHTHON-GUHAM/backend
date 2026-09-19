import { boards, profiles } from '../data/memoryStore';
import { UserProfile } from '../types/api';
import { AiService } from './ai.service';

const normalize = (value: string): string => value.trim().toLowerCase();
const overlap = (left: string[], right: string[]): { ratio: number; matched: string[] } => {
  const rightSet = new Set(right.map(normalize));
  const matched = [...new Set(left.filter((tag) => rightSet.has(normalize(tag))))];
  return { ratio: matched.length / Math.max(1, new Set(left.map(normalize)).size), matched };
};
const lexicalSimilarity = (left: string, right: string): number => {
  const tokens = (text: string) => new Set(text.toLowerCase().split(/[^\p{L}\p{N}+#.]+/u).filter((item) => item.length > 1));
  const a = tokens(left); const b = tokens(right);
  return [...a].filter((item) => b.has(item)).length / Math.max(1, new Set([...a, ...b]).size);
};
const cosine = (a: number[], b: number[]): number => {
  if (!a.length || a.length !== b.length) return 0;
  const dot = a.reduce((sum, value, index) => sum + value * b[index], 0);
  const mag = (v: number[]) => Math.sqrt(v.reduce((sum, value) => sum + value * value, 0));
  return dot / Math.max(Number.EPSILON, mag(a) * mag(b));
};
const publicUser = (profile?: UserProfile) => profile ? { id: profile.id, nickname: profile.nickname, giveFields: profile.giveFields } : { id: '', nickname: '알 수 없음', giveFields: [] };

export class RecommendationService {
  constructor(private readonly ai = new AiService()) {}

  private async semantic(left: string, right: string): Promise<number> {
    try {
      const [a, b] = await Promise.all([this.ai.embedding(left), this.ai.embedding(right)]);
      if (a && b) return Math.max(0, cosine(a, b));
    } catch (error) { console.warn('[recommendation] embedding unavailable:', error); }
    try { return await this.ai.semanticSimilarity(left, right); }
    catch (error) {
      console.warn('[recommendation] AI similarity fallback:', error);
      return lexicalSimilarity(left, right);
    }
  }

  async boardsForUser(userId: string, limit: number, category?: string, keyword?: string) {
    const profile = profiles.get(userId);
    if (!profile) return [];
    const userTags = [...profile.giveFields, ...profile.normalizedGiveTags];
    const userText = [...userTags, profile.customGiveText ?? '', ...profile.interests, profile.customInterestText ?? ''].join(' ');
    const candidates = [...boards.values()].filter((board) => board.authorId !== userId)
      .filter((board) => !category || category === 'ALL' || board.category === category)
      .filter((board) => !keyword || `${board.title} ${board.content} ${board.giveTags} ${board.needTags}`.toLowerCase().includes(keyword.toLowerCase()));
    const results = await Promise.all(candidates.map(async (board) => {
      const semantic = await this.semantic(userText, `${board.title} ${board.content} ${board.needTags.join(' ')}`);
      const tags = overlap(userTags, board.needTags);
      const interest = overlap([...profile.interests, ...profile.normalizedInterestTags], [board.category, ...board.giveTags, ...board.needTags]).ratio;
      const region = profile.regions.includes(board.activityRegion) ? 1 : 0;
      const ageDays = Math.max(0, (Date.now() - new Date(board.createdAt).getTime()) / 86400000);
      const recency = Math.max(0, 1 - ageDays / 30);
      const matchScore = Math.round((semantic * 60 + Math.max(tags.ratio, interest) * 20 + region * 10 + recency * 10) * 10) / 10;
      return { ...board, author: publicUser(profiles.get(board.authorId)), matchScore, recommendationReasons: [...(tags.matched.length ? [`필요 역량 ${tags.matched.join(', ')} 일치`] : []), ...(region ? ['선호 활동 지역 일치'] : []), ...(semantic >= 0.5 ? ['GIVE와 모집 내용의 의미가 유사함'] : [])] };
    }));
    return results.sort((a, b) => b.matchScore - a.matchScore).slice(0, limit);
  }

  async usersForBoard(boardId: string, requesterId: string, limit: number) {
    const board = boards.get(boardId);
    if (!board || board.authorId !== requesterId) return undefined;
    const results = await Promise.all([...profiles.values()].filter((profile) => profile.id !== requesterId && profile.onboardingCompleted).map(async (profile) => {
      const give = [...profile.giveFields, ...profile.normalizedGiveTags];
      const semantic = await this.semantic(`${board.title} ${board.content} ${board.needTags.join(' ')}`, `${give.join(' ')} ${profile.customGiveText ?? ''}`);
      const tags = overlap(board.needTags, give);
      const region = profile.regions.includes(board.activityRegion) ? 1 : 0;
      const interests = overlap([board.category], [...profile.interests, ...profile.normalizedInterestTags]).ratio;
      const matchScore = Math.round((semantic * 60 + tags.ratio * 25 + region * 10 + interests * 5) * 10) / 10;
      return { user: publicUser(profile), matchScore, matchedTags: tags.matched, recommendationReasons: [...(tags.matched.length ? [`GIVE 역량 ${tags.matched.join(', ')} 일치`] : []), ...(region ? ['활동 지역 일치'] : []), ...(interests ? ['관심 분야 일치'] : [])] };
    }));
    return results.sort((a, b) => b.matchScore - a.matchScore).slice(0, limit).map((item, index) => ({ rank: index + 1, ...item }));
  }
}

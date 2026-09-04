import { extractConditionTags } from './petConditionTags';
import { guessPetStatus } from './petStatus';

// 동물보호법상 맹견으로 지정된 5종(및 잡종) - 도사견 계열 표기 편차를 감안해 넉넉히 매칭
const DANGEROUS_BREED_KEYWORDS = [
  '도사', '핏불', '스태퍼드셔', '스태포드셔', '로트와일러', '마스티프', '아메리칸 불리',
];

// 등록된 강아지 프로필과 장소의 동반 조건(자유 텍스트에서 추출한 태그)을 대조해
// "이 강아지가 실제로 방문 가능한지"를 판단한다. petConditionTags.js가 이미 뽑아둔
// 태그(대형견 제한/체중 제한/실내 불가/맹견 제한)를 강아지 크기·견종과 비교하는 정도의
// 휴리스틱이며, 100% 정확한 판정이 아니라 "빠른 참고용" 힌트임을 전제로 한다.
export function evaluateDogVisit(dog, pet) {
  if (!dog || !pet) return null;

  const tagKeys = new Set(extractConditionTags(pet).map((tag) => tag.key));
  const reasons = [];

  if (tagKeys.has('dangerous-breed-limit') && dog.breed &&
    DANGEROUS_BREED_KEYWORDS.some((keyword) => dog.breed.includes(keyword))) {
    reasons.push('맹견 지정 견종은 출입이 제한될 수 있어요');
  }

  if (tagKeys.has('large-dog-limit') && dog.sizeClass === 'large') {
    reasons.push('대형견 실내 이용 여부 확인이 필요해요');
  }

  if (tagKeys.has('weight-limit')) {
    reasons.push('체중 제한이 있어요. 방문 전 확인해주세요');
  }

  if (tagKeys.has('indoor-limit')) {
    reasons.push('실내 동반이 제한될 수 있어요');
  }

  if (reasons.length > 0) return { level: 'caution', reasons };
  if (guessPetStatus(pet) === 'ok') return { level: 'ok', reasons: [] };
  return { level: 'unknown', reasons: [] };
}

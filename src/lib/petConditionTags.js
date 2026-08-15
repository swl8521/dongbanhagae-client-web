// TourAPI의 동반 조건 필드(acmpyPsblCpam, etcAcmpyInfo 등)는 구조화된 값이 아니라
// 자유 텍스트라서, 자주 등장하는 표현을 키워드로 잡아 짧은 태그로 요약한다.
// (100% 정확한 파싱은 아니고 "빠르게 훑어볼 힌트" 수준)
const RULES = [
  { key: 'all-breeds', test: /전\s*견종/, label: '전견종 가능', tone: 'positive' },
  { key: 'muzzle', test: /입마개/, label: '입마개 필수', tone: 'warning' },
  { key: 'leash', test: /목줄|리드줄/, label: '목줄 착용', tone: 'warning' },
  { key: 'waste-bag', test: /배변\s*(봉투|처리)/, label: '배변봉투 지참', tone: 'info' },
  { key: 'vaccination', test: /접종/, label: '접종 확인', tone: 'info' },
  { key: 'carrier', test: /이동장|케이지/, label: '이동장 필요', tone: 'info' },
  { key: 'dangerous-breed-limit', test: /맹견.*(제한|불가|금지)/, label: '맹견 제한', tone: 'warning' },
  { key: 'large-dog-limit', test: /대형견.*(제한|불가|금지)/, label: '대형견 제한', tone: 'warning' },
  { key: 'weight-limit', test: /(\d+)\s*kg/i, label: '체중 제한', tone: 'warning' },
  { key: 'indoor-limit', test: /실내.*(불가|제한)/, label: '실내 동반 불가', tone: 'warning' },
];

export function extractConditionTags(pet) {
  if (!pet) return [];

  const text = [
    pet.acmpyPsblCpam,
    pet.etcAcmpyInfo,
    pet.acmpyNeedMtr,
    pet.relaAcdntRiskMtr,
    pet.relaPosesFclty,
    pet.relaFrnshPrdlst,
    pet.relaPurcPrdlst,
    pet.relaRntlPrdlst,
  ]
    .filter(Boolean)
    .join(' ');
  if (!text) return [];

  return RULES.filter((rule) => rule.test.test(text)).map((rule) => ({
    key: rule.key,
    label: rule.label,
    tone: rule.tone,
  }));
}

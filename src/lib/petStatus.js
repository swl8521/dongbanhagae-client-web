// TourAPI 응답 필드명은 표준 필드(title/addr1/firstimage 등)는 안정적이지만,
// 반려동물 조건 관련 필드는 실제 승인 후 응답을 보고 정확히 매핑해야 함.
// 지금은 방어적으로 여러 후보 키를 확인하고, 없으면 'unknown' 처리.
export function guessPetStatus(item) {
  const raw = (item?.acmpyPsblCpam || item?.acmpyTypeCd || '').toString();
  if (raw) {
    if (raw.includes('가능') || raw.includes('전체')) return 'ok';
    return 'limited';
  }
  // acmpyPsblCpam/acmpyTypeCd가 비어 있어도 etcAcmpyInfo(예: "장애우 안내견만 이용가능")에
  // 실제 동반 조건 텍스트가 있으면 그건 정보가 없는 게 아니라 조건부 정보가 있는 것이므로
  // "조회필요"(unknown) 대신 조건부로 처리한다.
  if ((item?.etcAcmpyInfo || item?.acmpyNeedMtr || '').toString().trim()) return 'limited';
  return 'unknown';
}

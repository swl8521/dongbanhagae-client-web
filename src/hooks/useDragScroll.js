import { useEffect, useRef } from 'react';

// 필터 칩 목록처럼 overflow-x: auto인 영역은 모바일에서는 스와이프로 넘어가지만
// 데스크탑에서는 마우스 휠 가로 스크롤이나 스크롤바가 없으면 이동할 방법이 없다.
// 마우스로 눌러서 좌우로 끄는 동작(드래그 스크롤)을 추가해준다.
export function useDragScroll() {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const state = { isDown: false, startX: 0, scrollLeft: 0, dragged: false };

    function onPointerDown(e) {
      if (e.pointerType === 'touch') return; // 터치는 기본 스와이프 스크롤에 맡긴다
      state.isDown = true;
      state.dragged = false;
      state.startX = e.clientX;
      state.scrollLeft = el.scrollLeft;
    }

    function onPointerMove(e) {
      if (!state.isDown) return;
      const dx = e.clientX - state.startX;
      if (Math.abs(dx) > 3) state.dragged = true;
      el.scrollLeft = state.scrollLeft - dx;
    }

    function onPointerUp() {
      state.isDown = false;
    }

    // 드래그로 끝난 클릭은 칩 선택(필터 변경)으로 이어지지 않도록 막는다.
    function onClickCapture(e) {
      if (state.dragged) {
        e.stopPropagation();
        e.preventDefault();
        state.dragged = false;
      }
    }

    el.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);
    el.addEventListener('click', onClickCapture, true);

    return () => {
      el.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
      el.removeEventListener('click', onClickCapture, true);
    };
  }, []);

  return ref;
}

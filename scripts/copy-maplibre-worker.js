// maplibre-gl-worker.mjs가 상대 경로(./maplibre-gl-shared.mjs)로 sibling 파일을 import하기
// 때문에, Vite의 ?url 임포트(파일 하나만 해시된 이름으로 복사)로는 이 관계가 깨진다.
// public/에 두 파일을 원본 이름 그대로 함께 복사해 상대 경로가 그대로 유지되게 한다.
// maplibre-gl 버전을 올릴 때마다 이 스크립트가 최신 워커 파일을 다시 복사해준다.
import { copyFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const rootDir = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const srcDir = path.join(rootDir, 'node_modules', 'maplibre-gl', 'dist');
const destDir = path.join(rootDir, 'public');

for (const file of ['maplibre-gl-worker.mjs', 'maplibre-gl-shared.mjs']) {
  copyFileSync(path.join(srcDir, file), path.join(destDir, file));
}

console.log('[copy-maplibre-worker] maplibre-gl 워커 파일을 public/에 복사했습니다.');

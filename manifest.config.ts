import { ManifestV3Export } from '@crxjs/vite-plugin';

const manifest = {
  manifest_version: 3,
  name: 'HSU 시간표 마슐사',
  version: '1.2.6',
  description: '한성대학교 종합정보시스템 시간표 및 수업계획서 조회 페이지의 가독성을 높입니다.',
  action: {
    default_popup: 'index.html',
  },
  icons: {
    '16': 'images/icon/16.png',
    '32': 'images/icon/32.png',
    '48': 'images/icon/48.png',
    '128': 'images/icon/128.png',
  },
  content_scripts: [
    {
      matches: ['https://info.hansung.ac.kr/jsp_21/student/kyomu/**'],
      js: ['src/content/index.tsx'],
    },
  ],
  web_accessible_resources: [
    {
      resources: ['assets/*', 'assets/*.css', '*.webp', '*.png', '*.jpg', '*.jpeg', '*.gif'],
      matches: ['*://*/*'],
    },
  ],
  permissions: ['storage'],
} as ManifestV3Export;

export default manifest;

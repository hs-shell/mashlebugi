import { defineConfig, type DefaultTheme } from 'vitepress';

function guideSidebar(basic: string, advanced: string, faq: string, notice: string, label: string, prefix = ''): DefaultTheme.SidebarItem[] {
  return [{ text: label, items: [
    { text: notice, link: `${prefix}/guide/notice` },
    { text: basic, link: `${prefix}/guide/basic` },
    { text: advanced, link: `${prefix}/guide/advanced` },
    { text: faq, link: `${prefix}/guide/faq` },
  ]}];
}

function updatesSidebar(label: string, changelog: string, prefix = ''): DefaultTheme.SidebarItem[] {
  return [{ text: label, items: [{ text: changelog, link: `${prefix}/updates/changelog` }] }];
}

export default defineConfig({
  title: '마슐부기',
  base: '/mashlebugi/',
  description: 'mashlebugi 사용 가이드 및 업데이트 내역',

  head: [
    ['link', { rel: 'icon', href: '/mashlebugi/favicon.png', type: 'image/png' }],
    ['link', { rel: 'stylesheet', href: 'https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard-jp.min.css' }],
  ],

  locales: {
    root: {
      label: '한국어',
      lang: 'ko-KR',
      themeConfig: {
        nav: [
          { text: '가이드', link: '/guide/basic' },
          { text: '업데이트', link: '/updates/changelog' },
          { text: '개인정보처리방침', link: '/policy/privacy' },
        ],
        sidebar: {
          '/guide/': guideSidebar('간단 사용 설명서', '고급 사용 설명서', 'FAQ', '공지사항', '가이드'),
          '/updates/': updatesSidebar('업데이트', '업데이트 로그'),
          '/policy/': [{ text: '정책', items: [{ text: '개인정보 처리방침', link: '/policy/privacy' }] }],
        },
        outline: { label: '목차' },
        docFooter: { prev: '이전', next: '다음' },
      },
    },
  },

  themeConfig: {
    socialLinks: [{ icon: 'github', link: 'https://github.com/hs-shell/mashlebugi' }],
  },
});

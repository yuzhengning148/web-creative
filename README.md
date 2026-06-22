# Web Creative

网页动效 & 创意前端作品集。每个项目独立一个文件夹，可直接用任意静态服务器运行。

> **Author:** 咖啡色的猫 / [@yuzhengning148](https://github.com/yuzhengning148)

## 项目列表

| # | 项目 | 技术栈 | 说明 |
|---|------|--------|------|
| 001 | landing-reveal | GSAP + HTML/CSS | 服装品牌登陆页，预加载图片轮播 + 文字入场动画 |
| 002 | anime-warp-slider | Three.js + GLSL + GSAP | 动漫海报 WebGL 透镜变形滑动切换 |

## 运行

```bash
cd <project-folder>
npx serve .
```

## 声明

- 本仓库代码用于个人学习与技术展示，非盈利用途。
- `002-anime-warp-slider` 中的动漫图片来源于各画师创作，版权归原作者所有。图片通过 [Wallhaven](https://wallhaven.cc) 收集，仅供学习演示。如需移除，请联系我。

## 致谢

- [GSAP](https://gsap.com) — 动画引擎
- [Three.js](https://threejs.org) — WebGL 框架
- [Wallhaven](https://wallhaven.cc) — 图片素材来源
- 所有原作画师 — 感谢你们的创作

## 目录结构

```
web-creative/
├── README.md
├── LICENSE
├── .gitignore
├── 001-landing-reveal/       # GSAP Preloader + Landing Page
│   ├── index.html
│   ├── styles.css
│   ├── script.js
│   └── assets/
├── 002-anime-warp-slider/    # Anime Poster Warp Slider
│   ├── index.html
│   ├── styles.css
│   ├── script.js
│   ├── shaders.js
│   ├── slides.js
│   └── assets/
└── ...
```

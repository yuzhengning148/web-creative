# Web Creative

网页动效 & 创意前端作品集。每个项目独立一个文件夹，可直接用任意静态服务器运行。

> **Author:** 咖啡色的猫 / [@yuzhengning148](https://github.com/yuzhengning148)

## 项目列表

| # | 项目 | 技术栈 | 说明 |
|---|------|--------|------|
| 001 | landing-reveal | GSAP + HTML/CSS | 咖啡色的猫 Portfolio，预加载渐变动画 + 文字入场特效 |
| 002 | anime-warp-slider | Three.js + GLSL + GSAP | 动漫海报 WebGL 透镜变形滑动切换 |
| 003 | backdoor-meet | — | — |
| 004 | anime-stack-slider | Three.js + HTML/CSS | EVA × 咒术回战 动漫壁纸 3D 堆叠轮播，速度驱动扭曲动效 + 磁性吸附 |
| 005 | motion-systems | Vite + Vanilla JS | 动效设计工作室页面，包含预加载、内容循环与技术栈交互 |
| 006 | mocha-cat-studio | Next.js + Three.js + GSAP | 咖啡色的猫个人混合作品集上一版，含 WebGL 轮播、立方体与环形图库 |

## 运行

静态项目进入对应目录后可运行 `npx serve .`。`005` 与 `006` 请先阅读各自目录中的 README，并使用 npm 启动。

## 声明

- 本仓库代码用于个人学习与技术展示，非盈利用途。
- `002-anime-warp-slider`、`004-anime-stack-slider` 中的动漫图片来源于各画师创作，版权归原作者所有。图片通过 [Wallhaven](https://wallhaven.cc) 收集，仅供学习演示。如需移除，请联系我。

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
├── 001-landing-reveal/       # GSAP Preloader + Hero Landing (咖啡色的猫)
│   ├── index.html
│   ├── style.css
│   ├── script.js
│   └── src/
│       └── images/
├── 002-anime-warp-slider/    # Anime Poster Warp Slider
│   ├── index.html
│   ├── styles.css
│   ├── script.js
│   ├── shaders.js
│   ├── slides.js
│   └── assets/
├── 003-backdoor-meet/        # ...
│   ├── index.html
│   ├── styles.css
│   ├── script.js
│   └── assets/
├── 004-anime-stack-slider/   # EVA × JJK 3D Stack Slider
│   ├── index.html
│   ├── styles.css
│   ├── script.js
│   └── assets/
├── 005-motion-systems/       # Vite motion studio experiment
└── 006-mocha-cat-studio/     # Mocha Cat Studio legacy portfolio
    ├── public/
    ├── scripts/
    ├── src/
    └── package.json
```

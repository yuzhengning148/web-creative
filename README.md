# Web Creative

网页动效 & 创意前端作品集。每个项目独立一个文件夹，可直接用任意静态服务器运行。

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

## 目录结构

```
web-creative/
├── README.md
├── .gitignore
├── 001-landing-reveal/       # TTTISE Outfit Landing Page
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

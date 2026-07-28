# 006 · Mocha Cat Studio Legacy

咖啡色的猫个人工作室与混合作品集的上一版归档。这个版本保留全屏轮播、WebGL 转场、立方体、环形图库和联系页，作为第六个网页创意作品独立保存。

## 本地运行

```bash
npm install
npm run dev
```

访问 `http://localhost:3000`。首页由 `public/home.html` 提供，联系页由 `public/contact.html` 提供，Next.js 负责本地服务与路由转发。

## 常用检查

```bash
npm run verify-site
npm run check-assets
npm run lint
npm run build
```

`verify-site` 会阻止旧品牌、旧邮箱和失效占位链接重新混入页面。`check-assets` 会检查首页与联系页引用的本地资源是否完整。

## 内容与联系

- 品牌：Mocha Cat Studio（咖啡色的猫）
- 邮箱：`zzzzchen.gong@foxmail.com`
- 联系表单：静态站点会打开访客的邮件应用并预填内容，不会伪装成已经发送成功
- 品牌与产品方向：见 `PRODUCT.md`
- 视觉资产位置与替换顺序：见 `ASSET_MAP.md`

## 主要文件

- `public/home.html`：首页结构、样式与交互
- `public/contact.html`：联系页与邮件草稿表单
- `public/images/`：当前全部图片和视频资产
- `public/images/mocha/`：从高清 wallpaper 原图生成的网页副本
- `public/mocha-cat-cursor.*`：Mocha Cat 自定义鼠标样式
- `scripts/apply-mocha-cat-branding.mjs`：旧模板重新导入时的品牌替换保护
- `scripts/build-wallpaper-assets.mjs`：批量生成首屏、导航、画廊与实验区图片
- `scripts/verify-site.mjs`：品牌与链接残留检查

当前 wallpaper 被作为视觉气质参考，而不是原创项目。公开上线前请确认素材授权；替换正式作品时优先沿用 `public/images/mocha/` 的目录结构，以免破坏 WebGL、轮播与懒加载逻辑。

此目录只保存上一版，新设计版继续在本地项目中迭代，二者互不覆盖。

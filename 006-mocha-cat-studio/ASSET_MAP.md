# Mocha Cat 视觉资产映射

网站当前使用 `/Users/chenx/Desktop/chenx/素材/wallpaper` 中的 39 张 16:9 高清图片。原图约 165MB，保持原样不动；网页副本统一生成到 `public/images/mocha/`，共约 11MB。

## 生成方式

```bash
npm run build-wallpaper-assets -- "/Users/chenx/Desktop/chenx/素材/wallpaper"
```

生成脚本为 `scripts/build-wallpaper-assets.mjs`。它只读取源目录，并覆盖 `public/images/mocha/` 中对应的派生文件。

## 首页首屏

| 画面 | 源文件 | 网页文件 |
| --- | --- | --- |
| 秋日停格 | `动漫类/anime_01.jpg` | `hero/01-autumn-pause-*` |
| 蓝色森林 | `风景类/scenery_03.jpg` | `hero/02-blue-forest-*` |
| 纸上怪梦 | `动漫类/anime_17.jpg` | `hero/03-paper-monsters-*` |
| 山水之间 | `风景类/scenery_15.jpg` | `hero/04-quiet-mountains-*` |
| 水下白日梦 | `动漫类/anime_13.jpg` | `hero/05-underwater-daydream-*` |

每组包含 1920px 桌面图、960px 移动图和 480px 缩略图。首屏不再加载原模板视频。

## Mood Archive

六张主图位于 `public/images/mocha/gallery/`：

1. 春日花园
2. 霓虹城市
3. 蓝色梦境
4. 雪地旅途
5. 彩色通勤
6. 暮色海岸

这些图片目前被明确呈现为视觉参考与气质收藏，不冒充 Mocha Cat 的原创项目。正式作品加入后，可以保留同一路径替换图片，也可以改回作品标题和详情链接。

## 导航与实验区

- `public/images/mocha/nav/01.jpg` 至 `10.jpg`：展开菜单缩略图，560px
- `public/images/mocha/company/01.jpg` 至 `12.jpg`：About 动态词条预览，760px
- `public/images/mocha/ring/01.jpg` 至 `25.jpg`：环形画廊，640px
- `public/images/mocha/cube/01.jpg` 至 `06.jpg`：桌面和移动立方体，900px

## 氛围资产

`public/images/mocha/atmosphere/` 包含加载图、首屏角落图、About 背景、实验区背景、环形中心图、作品区背景、页脚图和社交分享图。原模板的可见视频与图片已不再被首页或联系页引用。

## 上线提醒

这些文件是“找到的素材”。正式公开或商业使用前，需要确认每张图片的作者、来源和使用授权；如果授权不明确，建议继续将它们作为本地视觉参考，并在上线前换成自有或已授权作品。

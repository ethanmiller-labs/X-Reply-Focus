# Changelog

## 1.2.2

- Fix the panel not appearing on posts containing quoted posts or article previews.
- Resolve the outer post from a valid time permalink, skipping unlinked quote timestamps, quote containers and media/analytics links.
- 修复包含引用帖或文章预览时，引用时间干扰主帖识别、导致插件面板不显示的问题。

## 1.2.1

- Keep the original post filter active when X opens a reply composer at `/compose/post` or `/compose/tweet`.
- Keep filtering loaded comments when the focal post is temporarily removed during timeline rendering.
- Do not apply the previous post filter on other users' posts, unrelated pages, or standalone compose pages.

## 1.2.1 修复说明

- 修复打开回复弹窗后，背景中已隐藏的评论重新出现的问题。
- 主帖在滚动或刷新评论时暂时移出页面，筛选仍持续生效。
- 回复弹窗不会影响输入；其他人的帖子与独立发帖页面保持不筛选。

# Changelog

## 1.2.1

- Keep the original post filter active when X opens a reply composer at `/compose/post` or `/compose/tweet`.
- Keep filtering loaded comments when the focal post is temporarily removed during timeline rendering.
- Do not apply the previous post filter on other users' posts, unrelated pages, or standalone compose pages.

## 1.2.1 修复说明

- 修复打开回复弹窗后，背景中已隐藏的评论重新出现的问题。
- 主帖在滚动或刷新评论时暂时移出页面，筛选仍持续生效。
- 回复弹窗不会影响输入；其他人的帖子与独立发帖页面保持不筛选。

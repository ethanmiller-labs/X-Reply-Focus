# X Reply Focus

[中文说明](安装与使用说明.md) · [English guide](Installation%20and%20Usage.md)

A lightweight Chrome extension that hides comments you have already replied to on your own X posts. It follows X's interface language, with Chinese and English support.

在自己的 X 帖子下，一键隐藏已回复的评论，保留尚未回复的留言。自动跟随 X 界面显示中文或英文。

## Features / 功能

- One-click **Hide replied / Show all**. 一键隐藏已回复 / 显示全部。
- Keeps a follower's next unanswered message visible, including messages in an existing reply thread. 同一粉丝后续未回复的留言仍保留。
- Appears only on your own post detail pages. 仅在自己的帖子详情页显示。
- Updates as X loads more comments. 随 X 加载评论自动更新。
- Stores preferences and detected reply history locally. No server, analytics, or cookie access. 本机存储，无服务器、统计或 Cookie 读取。

## Install / 安装

1. Download and extract this repository. 下载并解压本仓库。
2. Open `chrome://extensions` and enable **Developer mode**. 打开扩展程序页面，开启开发者模式。
3. Click **Load unpacked** and select the folder containing `manifest.json`. 点击“加载已解压的扩展程序”，选择插件目录。
4. Refresh X and open one of your own posts. 刷新 X，打开自己的帖子。

## Limitations / 识别范围

Only replies loaded by X can be detected. Unloaded historical replies may remain undetected. Deleting a reply on X does not automatically clear its local history entry.

仅能识别 X 已加载的回复。未加载的历史回复可能无法确认；删除 X 上的回复后，本机记录不会自动撤销。

## Author / 作者

Developed by / 开发者：**有点想法的阿熊 [@HeyCuriousBear](https://x.com/HeyCuriousBear)**

An independent third-party extension, not affiliated with X.

独立开发的第三方插件，与 X 官方无关联。

Version / 版本：1.2.2

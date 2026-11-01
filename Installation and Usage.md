# X Reply Focus

Hide comments you have already replied to on your own X posts, so you can focus on unanswered messages. Works with different accounts and is not tied to the developer's account.

## Author

Developed by **有点想法的阿熊 (@HeyCuriousBear)**.

Author profile: https://x.com/HeyCuriousBear

X Reply Focus is an independently developed third-party extension and is not affiliated with X.

## Installation

1. Extract the ZIP file, if needed.
2. Open `chrome://extensions` in Chrome and enable **Developer mode**.
3. Click **Load unpacked** and select the **X Reply Focus** folder containing `manifest.json`.
4. Refresh X and open one of your own posts.

## Usage

1. Find the **X Reply Focus** panel below your post.
2. Click **Hide replied** to hide comments confirmed as replied to, along with your own replies. Unanswered messages remain visible.
3. Click **Show all** to restore the full comment list.

The panel appears only on your own post detail pages. Other people's posts are not filtered. X's **Show replies** controls remain available while filtering is on. Loaded reply controls are expanded automatically; newly revealed unanswered messages remain visible, while answered comments stay hidden.

If someone leaves another message, it stays visible until you reply to that particular message—even if it belongs to the earlier conversation thread.

Your username is detected automatically. To override it, open **Account settings** and enter an `@username`; leave it blank to restore automatic detection. The filter preference and reply history are stored locally. Newly loaded comments are checked automatically as you scroll.

## Interface language

The extension follows X's interface language: Chinese on Chinese X pages and English on English X pages. No separate language setting is required. Changes to X's interface language are applied automatically, including after X reloads the page. Other languages currently use English.

For the Chinese guide, see `安装与使用说明.md`.

## Updating

1. Replace the files in the existing extension folder with the new version.
2. Open `chrome://extensions`, find **X Reply Focus**, and click the **Reload** button (circular arrow).
3. Refresh X.

If reloading fails after moving the extension folder, remove the old extension and use **Load unpacked** to select the new folder.

## Detection limits

Only replies loaded by X can be detected. Historical replies that are not loaded, collapsed, or not returned by X may go undetected; their comments remain visible. The extension does not scroll or post comments automatically. Each filter activation expands up to 30 loaded branches, once per branch. For additional pages, failed loads, or branches beyond this limit, you can still click **Show replies** manually.

Deleting a reply on X does not automatically remove its local history entry. To start detection again, clear the local reply history in **Account settings**, then refresh the post.

## Privacy

Runs only on `x.com` and `twitter.com`. Does not read cookies, upload data, post replies, or modify posts on X. Account settings, the filter preference, and confirmed comment IDs are stored only on your device.

Version: 1.3.0

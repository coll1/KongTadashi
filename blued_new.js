/**
 * Blued New Flash Image Redirect
 * 针对 cdn.qing2000.com 域名优化
 */

const url = $request.url;
const logName = "[BluedFlashNew]";

(async () => {
    if (!url) {
        $done({});
        return;
    }

    console.log(`${logName} 捕获到闪照: ${url}`);

    // 1. 尝试写入剪贴板 (防止跳转后 Safari 报错需要二次手动输入)
    if (typeof $clipboard !== "undefined") {
        $clipboard.write(url);
        console.log(`${logName} 链接已写入剪贴板`);
    }

    // 2. 发送系统通知
    $notification.post(
        "检测到新版闪照",
        "链接已复制，准备跳转 Safari",
        "如果跳转失败，请手动在浏览器粘贴访问。\n链接：" + url
    );

    // 3. 核心逻辑：使用 307 临时重定向强制跳转
    // 这样在 App 尝试加载图片时，会直接触发系统层面的 URL 唤起
    $done({
        status: "HTTP/1.1 307 Temporary Redirect",
        headers: {
            "Location": url,
            "X-Redirect-By": "Gemini-Script"
        },
        body: ""
    });
})();

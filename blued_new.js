/**
 * Blued Flash Redirect - Anti-Loop Version
 * 解决无限套娃方案：通过 User-Agent 过滤
 */

const url = $request.url;
const ua = $request.headers['User-Agent'] || $request.headers['user-agent'] || "";

// 检查是否为 Safari 或非 Blued 流量
// Blued 的 UA 通常包含 "Blued" 或 "BlueCity" 字样
const isSafari = ua.includes("Safari") || ua.includes("AppleWebKit") && !ua.includes("Blued");

if (!url || isSafari) {
    // 如果是浏览器访问，直接放行，不弹通知，不走逻辑
    $done({});
} else {
    // 只有在 App 内部触发时才执行逻辑
    if (typeof $clipboard !== "undefined") {
        $clipboard.write(url);
    }
    $notification.post("检测到闪照", "链接已复制", "请前往 Safari 粘贴查看");
    $done({});
}

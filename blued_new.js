/**
 * Blued Flash Redirect - Fix Clipboard & Anti-Loop
 * 修复：通知带链接、增强剪贴板兼容性、防止套娃
 */

const url = $request.url;
const logName = "[BluedFlash]";

(async () => {
    if (!url || !url.includes("private-flash-photo")) {
        return $done({});
    }

    // --- 1. 防止套娃逻辑 (10秒内重复请求不处理) ---
    const lastTime = $persistentStore.read(url);
    const currentTime = Date.now();

    if (lastTime && (currentTime - parseInt(lastTime) < 10000)) {
        console.log(`${logName} 检查到重复请求，跳过逻辑: ${url}`);
        return $done({});
    }

    // 记录本次处理时间
    $persistentStore.write(currentTime.toString(), url);

    // --- 2. 执行核心逻辑 ---
    console.log(`${logName} 捕获成功: ${url}`);

    // 尝试写入剪贴板 (兼容性写法)
    try {
        if (typeof $clipboard !== "undefined") {
            // 某些版本 Surge 需要显式调用 write
            $clipboard.write(url);
        }
    } catch (e) {
        console.log(`${logName} 剪贴板写入失败: ${e}`);
    }

    // --- 3. 推送通知 (包含原始链接) ---
    // 在通知中展示 URL，方便点击或手动复制
    $notification.post(
        "检测到新版闪照", 
        "链接已尝试复制到剪贴板", 
        `原始链接：${url}`
    );

    // --- 4. 立即结束，不阻塞 App 加载 ---
    $done({});
})();

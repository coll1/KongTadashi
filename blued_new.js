/**
 * Blued Flash Redirect - Stable Logic
 * 功能：纯通知、带20秒冷却时间、无跳转、无剪贴板干扰
 */

const url = $request.url;
const logName = "[BluedFlash]";
const COOLDOWN_TIME = 20000; // 冷却时间 20 秒

(async () => {
    if (!url || !url.includes("private-flash-photo")) {
        return $done({});
    }

    // --- 1. 冷却逻辑：20秒内重复链接不捕获 ---
    const lastTime = $persistentStore.read(url);
    const currentTime = Date.now();

    if (lastTime && (currentTime - parseInt(lastTime) < COOLDOWN_TIME)) {
        console.log(`${logName} 20秒内重复请求，静默处理: ${url}`);
        return $done({});
    }

    // 记录本次处理时间（存入持久化数据）
    $persistentStore.write(currentTime.toString(), url);

    // --- 2. 核心通知逻辑 ---
    console.log(`${logName} 捕获成功，发送通知: ${url}`);

    $notification.post(
        "检测到闪照请求",
        "链接已捕获（20s内重复点击将不再提醒）",
        `原始链接：${url}`
    );

    // --- 3. 结束脚本，确保 App 加载图片流畅 ---
    $done({});
})();

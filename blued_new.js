/**
 * Blued Flash Redirect - The Ultimate Anti-Loop Version
 * 方案：使用 $persistentStore 实现 URL 访问去重
 */

const url = $request.url;
const logName = "[BluedAntiLoop]";

// 1. 基础判断
if (!url || !url.includes("private-flash-photo")) {
    $done({});
} else {
    // 2. 获取该 URL 的上一次捕获时间
    const lastTime = $persistentStore.read(url);
    const currentTime = Date.now();

    // 3. 逻辑判断：如果该 URL 在 10 秒内被捕获过，说明是 Safari 重复访问或重定向，直接放行
    if (lastTime && (currentTime - parseInt(lastTime) < 10000)) {
        console.log(`${logName} 拦截到重复请求 (套娃)，已自动放行: ${url}`);
        $done({});
    } else {
        // 4. 首次捕获逻辑
        // 记录当前时间戳到持久化存储
        $persistentStore.write(currentTime.toString(), url);
        
        console.log(`${logName} 首次捕获闪照，执行通知逻辑`);

        // 执行写入剪贴板
        if (typeof $clipboard !== "undefined") {
            $clipboard.write(url);
        }

        // 发送通知
        $notification.post("检测到闪照", "链接已复制", "请前往 Safari 粘贴查看 (10秒内重复访问将不再弹窗)");

        // 5. 结束脚本并放行
        $done({});
    }
}

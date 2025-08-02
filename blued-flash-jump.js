let url = $request.url;
let headers = $request.headers;

function notify(title = "", subtitle = "", content = "", open_url) {
    let opts = {};
    if (open_url) opts["open-url"] = open_url;
    if (Object.keys(opts).length === 0) {
        $notification.post(title, subtitle, content);
    } else {
        $notification.post(title, subtitle, content, opts);
    }
}

notify("📸 Blued 闪照已捕获", "点击跳转到浏览器打开原图", url, url);
console.log("捕获闪照链接: " + url);
$done({});

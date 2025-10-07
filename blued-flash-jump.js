/**
 * Blued 闪照跳转通知（Surge 专用）
 * by coll1 @ https://github.com/coll1/KongTadashi
 *
 * - 保留 query（签名）优先打开带签名的完整 URL
 * - HEAD -> GET 检查 URL 状态
 * - 200 时跳转打开；403 / AccessDenied 时复制链接到剪贴板并通知
 */

;(async () => {
  const log = (...a) => console.log('[BluedNotify]', ...a);

  const req = $request || {};
  const url = req.url || '';
  if (!url) return $done();

  const file = decodeURIComponent((url.split('?')[0].split('/').pop()) || '');
  const title = 'Blued 闪照检测';
  const subtitle = file || '检测到闪照请求';
  const openUrl = url; // 保留签名 query 参数

  // 快速通知
  const notify = (msg) => $notification.post(title, subtitle, msg);

  // 检查链接状态
  function checkUrl(u, cb) {
    $httpClient.head(u, (err, resp, body) => {
      if (err || !resp) {
        return $httpClient.get(u, (e2, r2, b2) => {
          if (e2 || !r2) return cb(e2 || new Error('No response'));
          cb(null, { status: r2.status || r2.statusCode, body: b2 || '' });
        });
      }
      const status = resp.status || resp.statusCode;
      if (status === 405) {
        return $httpClient.get(u, (e3, r3, b3) => {
          if (e3 || !r3) return cb(e3 || new Error('No response'));
          cb(null, { status: r3.status || r3.statusCode, body: b3 || '' });
        });
      }
      cb(null, { status, body: body || '' });
    });
  }

  // 跳转（优先 $done({url})，否则 302）
  function redirect(u) {
    try {
      $done({ url: u });
      log('Redirect ->', u);
    } catch (e) {
      try {
        $done({ status: 302, headers: { Location: u }, body: '' });
      } catch (e2) {
        $done();
      }
    }
  }

  // 主流程
  checkUrl(openUrl, (err, res) => {
    if (err || !res) {
      notify(`检测失败：${err?.message || '未知'}\n尝试打开：${openUrl}`);
      log('checkUrl error', err);
      redirect(openUrl);
      return;
    }

    const status = res.status;
    const bodySnippet = (res.body || '').toLowerCase().slice(0, 400);
    log('HTTP status:', status, 'snippet:', bodySnippet.slice(0,200));

    if (status === 200) {
      notify(`状态：200 OK\n正在打开原图（Safari）：\n${openUrl}`);
      redirect(openUrl);
      return;
    }

    if (status === 403 || bodySnippet.includes('accessdenied') || bodySnippet.includes('access denied')) {
      try {
        // Surge 支持 $clipboard.write
        if (typeof $clipboard !== 'undefined' && typeof $clipboard.write === 'function') {
          $clipboard.write(openUrl);
          notify(`签名失效/受保护 (HTTP ${status})，已复制完整链接到剪贴板，请在 Safari 粘贴打开。\n\n${openUrl}`);
          log('AccessDenied -> URL copied to clipboard');
        } else if (typeof $clipboard !== 'undefined' && typeof $clipboard.writeText === 'function') {
          $clipboard.writeText(openUrl);
          notify(`签名失效/受保护 (HTTP ${status})，已复制完整链接到剪贴板，请在 Safari 粘贴打开。\n\n${openUrl}`);
          log('AccessDenied -> URL copied via writeText');
        } else {
          notify(`签名失效/受保护 (HTTP ${status})，未能复制到剪贴板，请手动复制以下链接并在 Safari 打开：\n\n${openUrl}`);
          log('AccessDenied -> clipboard API not available');
        }
      } catch (e) {
        notify(`签名失效 (HTTP ${status})，尝试复制到剪贴板失败。\n请手动复制并打开：\n\n${openUrl}`);
        log('clipboard write failed', e);
      }

      // 仍尝试跳转一次（客户端可能被拒绝，但尝试无妨）
      redirect(openUrl);
      return;
    }

    // 其它状态
    notify(`HTTP ${status}\n尝试打开：${openUrl}\n响应片段：${bodySnippet || '无'}`);
    redirect(openUrl);
  });

})();

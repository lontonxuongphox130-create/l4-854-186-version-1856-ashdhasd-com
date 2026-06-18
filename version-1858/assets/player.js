import { H as Hls } from './hls.js';

(function () {
  function begin(root) {
    if (!root || root.dataset.ready === '1') {
      const videoReady = root && root.querySelector('video');
      if (videoReady) videoReady.play().catch(function () {});
      return;
    }

    const video = root.querySelector('video');
    const status = root.querySelector('[data-player-status]');
    const src = root.dataset.stream;
    if (!video || !src) return;

    root.dataset.ready = '1';
    root.classList.add('is-playing');
    if (status) status.textContent = '正在加载影片';

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = src;
      video.play().catch(function () {
        if (status) status.textContent = '点击视频区域继续播放';
      });
      return;
    }

    if (Hls && Hls.isSupported()) {
      const hls = new Hls({ enableWorker: true, lowLatencyMode: true });
      hls.loadSource(src);
      hls.attachMedia(video);
      hls.on(Hls.Events.MANIFEST_PARSED, function () {
        video.play().catch(function () {
          if (status) status.textContent = '点击视频区域继续播放';
        });
      });
      hls.on(Hls.Events.ERROR, function (_, data) {
        if (data && data.fatal && status) {
          status.textContent = '播放暂时不可用，请稍后再试';
        }
      });
      root.hlsPlayer = hls;
      return;
    }

    video.src = src;
    video.play().catch(function () {
      if (status) status.textContent = '点击视频区域继续播放';
    });
  }

  document.querySelectorAll('[data-player]').forEach(function (root) {
    const button = root.querySelector('[data-play-button]');
    const video = root.querySelector('video');

    if (button) {
      button.addEventListener('click', function (event) {
        event.preventDefault();
        begin(root);
      });
    }

    root.addEventListener('click', function (event) {
      if (event.target.closest('[data-play-button]')) return;
      if (!root.dataset.ready) begin(root);
    });

    if (video) {
      video.addEventListener('play', function () {
        root.classList.add('is-playing');
        const status = root.querySelector('[data-player-status]');
        if (status) status.textContent = '';
      });
    }
  });
})();

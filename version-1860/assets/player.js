(function () {
  function initPlayer(box) {
    var video = box.querySelector('.movie-video');
    var button = box.querySelector('.player-cover');
    var source = box.getAttribute('data-m3u8');
    var loaded = false;
    var hls = null;

    function fail() {
      box.classList.add('error');
      if (button) {
        button.innerHTML = '<span>播放暂时无法启动</span>';
      }
    }

    function load() {
      if (!video || !source) {
        fail();
        return false;
      }

      if (loaded) {
        return true;
      }

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
        loaded = true;
        return true;
      }

      if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(source);
        hls.attachMedia(video);
        hls.on(window.Hls.Events.ERROR, function (event, data) {
          if (data && data.fatal) {
            fail();
          }
        });
        loaded = true;
        return true;
      }

      fail();
      return false;
    }

    function play() {
      if (!load()) {
        return;
      }

      box.classList.add('playing');
      var promise = video.play();

      if (promise && typeof promise.catch === 'function') {
        promise.catch(function () {
          box.classList.remove('playing');
        });
      }
    }

    if (button) {
      button.addEventListener('click', play);
    }

    if (video) {
      video.addEventListener('play', function () {
        box.classList.add('playing');
      });

      video.addEventListener('pause', function () {
        if (!video.ended) {
          box.classList.remove('playing');
        }
      });

      video.addEventListener('ended', function () {
        box.classList.remove('playing');
      });
    }

    window.addEventListener('beforeunload', function () {
      if (hls) {
        hls.destroy();
      }
    });
  }

  document.querySelectorAll('.video-player-box').forEach(initPlayer);
})();

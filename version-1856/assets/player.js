(function () {
  var shell = document.querySelector('[data-player]');

  if (!shell) {
    return;
  }

  var video = shell.querySelector('video');
  var button = shell.querySelector('.play-overlay');
  var source = shell.getAttribute('data-src');
  var hls = null;
  var attached = false;

  function attachSource() {
    if (attached || !video || !source) {
      return;
    }

    attached = true;

    if (window.Hls && window.Hls.isSupported()) {
      hls = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true
      });

      hls.loadSource(source);
      hls.attachMedia(video);

      hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
        shell.classList.add('is-ready');
      });

      hls.on(window.Hls.Events.ERROR, function (event, data) {
        if (!data || !data.fatal || !hls) {
          return;
        }

        if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
          hls.startLoad();
        } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
          hls.recoverMediaError();
        } else {
          hls.destroy();
          hls = null;
        }
      });
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = source;
      shell.classList.add('is-ready');
    }
  }

  function playMovie() {
    attachSource();

    if (!video) {
      return;
    }

    var playRequest = video.play();

    if (playRequest && typeof playRequest.catch === 'function') {
      playRequest.catch(function () {});
    }
  }

  if (button) {
    button.addEventListener('click', playMovie);
  }

  if (video) {
    video.addEventListener('click', function () {
      if (video.paused) {
        playMovie();
      }
    });

    video.addEventListener('play', function () {
      shell.classList.add('is-playing');
      shell.classList.add('is-ready');
    });

    video.addEventListener('pause', function () {
      shell.classList.remove('is-playing');
    });
  }

  window.addEventListener('beforeunload', function () {
    if (hls) {
      hls.destroy();
    }
  });
})();

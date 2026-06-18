(function () {
  var hlsPromise = null;

  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  ready(function () {
    document.querySelectorAll("[data-player]").forEach(setupPlayer);
  });

  function setupPlayer(shell) {
    var video = shell.querySelector("video");
    var button = shell.querySelector(".player-start");
    var status = shell.querySelector(".player-status");
    var source = shell.getAttribute("data-src");
    var poster = shell.getAttribute("data-poster");
    var hlsInstance = null;

    if (!video || !button || !source) {
      return;
    }

    if (poster) {
      video.poster = poster;
    }

    button.addEventListener("click", function () {
      setStatus(status, "正在初始化播放源…");
      attachSource(video, source)
        .then(function (instance) {
          hlsInstance = instance || hlsInstance;
          shell.classList.add("is-playing");
          setStatus(status, "播放源已载入");
          return video.play();
        })
        .catch(function () {
          shell.classList.remove("is-playing");
          setStatus(status, "当前浏览器暂时无法载入该播放源");
        });
    });

    video.addEventListener("play", function () {
      shell.classList.add("is-playing");
    });

    video.addEventListener("pause", function () {
      if (video.currentTime === 0 || video.ended) {
        shell.classList.remove("is-playing");
      }
    });

    window.addEventListener("pagehide", function () {
      if (hlsInstance && typeof hlsInstance.destroy === "function") {
        hlsInstance.destroy();
      }
    });
  }

  function attachSource(video, source) {
    if (video.getAttribute("data-ready") === "true") {
      return Promise.resolve(null);
    }

    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = source;
      video.setAttribute("data-ready", "true");
      return Promise.resolve(null);
    }

    return loadHls().then(function (Hls) {
      if (!Hls || !Hls.isSupported()) {
        throw new Error("HLS is not supported");
      }

      var hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true,
        backBufferLength: 90
      });

      hls.loadSource(source);
      hls.attachMedia(video);
      video.setAttribute("data-ready", "true");

      hls.on(Hls.Events.ERROR, function (event, data) {
        if (!data || !data.fatal) {
          return;
        }

        if (data.type === Hls.ErrorTypes.NETWORK_ERROR) {
          hls.startLoad();
        } else if (data.type === Hls.ErrorTypes.MEDIA_ERROR) {
          hls.recoverMediaError();
        } else {
          hls.destroy();
        }
      });

      return hls;
    });
  }

  function loadHls() {
    if (window.Hls) {
      return Promise.resolve(window.Hls);
    }

    if (!hlsPromise) {
      hlsPromise = loadLocalHls().catch(loadCdnHls);
    }

    return hlsPromise;
  }

  function loadLocalHls() {
    var currentScript = document.currentScript || document.querySelector("script[src$='player.js']");
    var scriptUrl = currentScript ? currentScript.src : "";
    var vendorUrl = new URL("hls-vendor.js", scriptUrl).toString();

    return import(vendorUrl).then(function (module) {
      return module.H;
    });
  }

  function loadCdnHls() {
    return new Promise(function (resolve, reject) {
      if (window.Hls) {
        resolve(window.Hls);
        return;
      }

      var script = document.createElement("script");
      script.src = "https://cdn.jsdelivr.net/npm/hls.js@1/dist/hls.min.js";
      script.async = true;
      script.onload = function () {
        resolve(window.Hls);
      };
      script.onerror = reject;
      document.head.appendChild(script);
    });
  }

  function setStatus(element, message) {
    if (element) {
      element.textContent = message;
    }
  }
})();

var mainCss = null;
(function(configModule, cssModule) {
  var query = function(str) {
    return document.querySelector(str);
  };

  window.addEventListener("load", function(e) {
    mainCss = new cssModule.Css({
      url: configModule.homepage,
      urlPattern: configModule.urlPattern,
      filename: configModule.cssFilename,
      webview: query("#content-webview"),
      form: query("#css-form"),
      urlInput: query("#location"),
      urlPatternInput: query("#location-regex"),
      cssInput: query("#css-contents")
    });
  });
})(config, css);

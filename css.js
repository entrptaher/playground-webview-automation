var css = (function(configModule) {
  var Css = function({
    url,
    urlPattern, // URL matching regular expression
    filename, // Name of file from which initial CSS should be loaded
    webview, // Webview DOM node
    form, // Form DOM node
    urlInput,
    urlPatternInput, // Input node for URL matching regular expression
    cssInput
  }) {
    // Input (textarea) node for CSS
    this.url = url;
    this.urlPattern = urlPattern;
    this.filename = filename;
    this.webview = webview;
    this.form = form;
    this.urlInput = urlInput;
    this.urlPatternInput = urlPatternInput;
    this.cssInput = cssInput;
    this.loadOnStop = false;
    this.cssString = "";

    this.init();
  };

  Css.prototype.init = function() {
    
    // Load "homepage"
    this.webview.src = configModule.homepage;
    
    (function(css) {

      // Hook up CSS injection for each page load
      css.webview.addEventListener("loadcommit", function(e) {
        return css.doLoadCommit(e);
      });
      css.webview.addEventListener("loadstop", function(e) {
        return css.doLoadStop(e);
      });
      // Update state and reload when committing to new URL pattern and CSS
      css.form.addEventListener("submit", function(e) {
        e.preventDefault();

        var url = css.urlInput.value;
        var urlPattern = css.urlPatternInput.value;
        var cssString = css.cssInput.value;

        css.urlPattern = new RegExp(urlPattern);
        css.cssString = cssString;

        chrome.storage.local.set({
          url: url,
          urlPattern: urlPattern,
          cssString: cssString
        });
        
        if(css.webview.src !== url){
          css.webview.src = url
        } else {
          css.webview.reload();
        }

      });

      chrome.storage.local.get(["url", "urlPattern", "cssString"], function(data) {
        if(data.url){
          if(css.webview.src !== data.url){
            css.webview.src = data.url
          }
          css.urlInput.value = data.url;
          css.urlInput.removeAttribute("disabled");
        }else{
          if(css.webview.src !== css.url){
            css.webview.src = css.url
          }
          css.urlInput.value = css.url;
          css.urlInput.removeAttribute("disabled");
        }

        if (data.cssString) {
          // Prepare css string from local storage
          css.cssString = data.cssString;
          css.cssInput.value = data.cssString;
          css.cssInput.removeAttribute("disabled");
        } else {
          // Fetch initial CSS file
          (function(xhr) {
            xhr.addEventListener("readystatechange", function(e) {
              if (xhr.readyState == 4) {
                css.cssInput.value = xhr.responseText;
                css.cssInput.removeAttribute("disabled");
              }
            });
            xhr.open("GET", "inject.css", true);
            xhr.send();
          })(new XMLHttpRequest());
        }

        if (data.urlPattern) {
          // Prepare URL pattern from local storage
          css.urlPattern = new RegExp(data.urlPattern);
          css.urlPatternInput.value = data.urlPattern;
        } else {
          // Use default pattern (injected into Css object already)
          css.urlPatternInput.value = css.urlPattern.source;
        }
        css.urlPatternInput.removeAttribute("disabled");
      });
    })(this);
  };

  Css.prototype.doLoadCommit = function(e) {
    if (e.url.match(this.urlPattern) !== null) {
      this.loadOnStop = true;
    }
  };

  Css.prototype.doLoadStop = function(e) {
    if (this.loadOnStop) {
      this.injectCss();
      this.loadOnStop = false;
    }
  };

  Css.prototype.injectCss = function() {
    if (this.cssString) {
      this.webview.insertCSS({ code: this.cssString });
    } else {
      // On initial load, cssString may not be ready yet;
      // use the initial file instead
      this.webview.insertCSS({ file: this.filename });
    }
  };

  return { Css: Css };
})(config);

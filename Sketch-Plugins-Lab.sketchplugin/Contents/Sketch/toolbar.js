const sketch = require('sketch');
const UI = require('sketch/ui');
@import 'MochaJSDelegate.js';

var showToolbar = function(context, data, lable) {

  var panelWidth = 80;
  var panelHeight = 240;

  function getImage(size, name) {
    log("⚠️img geting!");
    var isRetinaDisplay = NSScreen.mainScreen().backingScaleFactor() > 1 ? true : false;
    var suffix = isRetinaDisplay ? '@2x' : '';
    log("⚠️suffix"+suffix);
    var assetsURL = context.plugin.url().URLByAppendingPathComponent("Contents").URLByAppendingPathComponent("Resources").URLByAppendingPathComponent("assets");
    log(assetsURL);
    var imageURL = assetsURL.URLByAppendingPathComponent("images").URLByAppendingPathComponent("icons").URLByAppendingPathComponent(name + suffix + '.png');
    log(imageURL);
    var image = NSImage.alloc().initWithContentsOfURL(imageURL);
    log("⚠️img get!");
    return image
  }

  function addButton(rect, name, callAction) {
    log("⚠️btn adding!");
    var button = NSButton.alloc().initWithFrame(rect),
      image = getImage(rect.size, name);
    button.setImage(image);
    button.setBordered(false);
    button.sizeToFit();
    button.setButtonType(NSMomentaryChangeButton)
    button.setCOSJSTargetFunction(callAction);
    button.setAction("callAction:");
    log("⚠️btn get!");
    return button;
  }

  // Create an NSThread dictionary with a specific identifier
  var threadDictionary = NSThread.mainThread().threadDictionary();
  var identifier = "com.wujiahao.Plugins.SketchPluginsLab";

  // If there's already a panel, prevent the plugin from running
  if (threadDictionary[identifier]) {
    log("⚙️Toolbar already exist");
    return;
  }

  // Create the panel and set its appearance
  var panel = NSPanel.alloc().init();
  var locationX = NSScreen.mainScreen().frame().size.width - 220 - panelWidth;
  var locationY = NSScreen.mainScreen().frame().size.height - 103 - panelHeight;
  panel.setFrame_display(NSMakeRect(locationX, locationY, panelWidth, panelHeight), true);
  panel.setStyleMask(NSTexturedBackgroundWindowMask | NSTitledWindowMask | NSClosableWindowMask | NSFullSizeContentViewWindowMask);
  panel.setBackgroundColor(NSColor.whiteColor());

  // Set the panel's title and title bar appearance
  panel.title = "";
  panel.titlebarAppearsTransparent = true;

  // Center and focus the panel
  // panel.center();
  panel.becomeKeyWindow();
  panel.makeKeyAndOrderFront(nil);
  panel.setLevel(NSFloatingWindowLevel);
  panel.setMovableByWindowBackground(true);


  // Make the plugin's code stick around (since it's a floating panel)
  COScript.currentCOScript().setShouldKeepAround_(true);
  log("⚙️Keep around -> true");

  // Hide the Minimize and Zoom button
  panel.standardWindowButton(NSWindowMiniaturizeButton).setHidden(true);
  panel.standardWindowButton(NSWindowZoomButton).setHidden(true);

  // Create the blurred background
  var vibrancy = NSVisualEffectView.alloc().initWithFrame(NSMakeRect(0, 0, panelWidth, panelHeight));
  vibrancy.setAppearance(NSAppearance.appearanceNamed(NSAppearanceNameVibrantLight));
  vibrancy.setBlendingMode(NSVisualEffectBlendingModeBehindWindow);

  // Add the blurred background to the panel
  panel.contentView().addSubview(vibrancy);

  // Add a closeButton
  var closeButton = panel.standardWindowButton(NSWindowCloseButton);

  // Assign a function to the Close button
  closeButton.setCOSJSTargetFunction(function(sender) {

    // Keep around -> False
    COScript.currentCOScript().setShouldKeepAround_(false);
    log("⚙️Keep around -> False");

    // Close panel
    panel.close();
    log("⚙️Toolbar closed");

    // Remove the reference to the panel
    threadDictionary.removeObjectForKey(identifier);
    log("⚙️Toolbar threadDictionary removed");
  });

  // ⚠️⚠️ Testing
  var rectangleButton = addButton(NSMakeRect(11, 79, 24, 24), "rectangle",
    function (sender) {
      log("⚠️⚠️ Testing");
      context.document.actionsController().actionForID("MSRectangleShapeAction").doPerformAction(null);
      NSApplication.sharedApplication().mainWindow().makeKeyAndOrderFront(null);
    });
  panel.contentView().addSubview(rectangleButton);
  // ⚠️⚠️ Testing

  // After creating the panel, store a reference to it
  threadDictionary[identifier] = panel;
  log("⚙️Toolbar launch success");

  // Create the WebView with a request to a Web page in Contents/Resources/
  var webView = WebView.alloc().initWithFrame(NSMakeRect(0, 0, 80, 80)); //0,0,panelWidth,panelHeight-44 0, 0, 80, 80
  var request = NSURLRequest.requestWithURL(context.plugin.urlForResourceNamed("toolbarWebView.html"));
  webView.mainFrame().loadRequest(request);

  // Prevent it from drawing a white background
  webView.setDrawsBackground(false);

  // Add it to the panel
  panel.contentView().addSubview(webView);
  log("⚙️webView launch success");

  // Access the Web page's JavaScript environment
  var windowObject = webView.windowScriptObject();

  // Create the delegate
  var delegate = new MochaJSDelegate({

    // Listen for URL changes
    "webView:didChangeLocationWithinPageForFrame:": (function(webView, webFrame) {

      // Extract the URL hash (without #) by executing JavaScript in the Web page
      var hash = windowObject.evaluateWebScript("window.location.hash.substring(1)");
      log("🐷 URL hash: " + hash);

      // Parse the hash's JSON content
      var data = JSON.parse(hash);

      // Launch a Sketch action and focus the main window
      context.document.actionsController().actionForID(data.action).doPerformAction(null);
      NSApplication.sharedApplication().mainWindow().makeKeyAndOrderFront(null);

    }),

    // istening to when the Web page is done loading,
    "webView:didFinishLoadForFrame:": (function(webView, webFrame) {

      // Get the current selection
      var selection = context.selection;

      if (selection.length == 1) {

        // Send the CSS attributes as a string to the Web page
        windowObject.evaluateWebScript("updatePreview('" + selection[0].CSSAttributes().join(" ") + "')");
      } else {

        // Or send an empty string to the Web page
        windowObject.evaluateWebScript("updatePreview(' ')");
      }
    })
  });

  // Set the delegate on the WebView
  webView.setFrameLoadDelegate_(delegate.getClassInstance());

};

var onSelectionChanged = function(context, data, lable) {
  var threadDictionary = NSThread.mainThread().threadDictionary();
  var identifier = "com.wujiahao.Plugins.SketchPluginsLab";

  // Check if there's a panel opened or not
  if (threadDictionary[identifier]) {

    // Access the panel from the reference and the WebView
    var panel = threadDictionary[identifier];
    var webView = panel.contentView().subviews()[2];

    // Access the Web page's JavaScript environment
    var windowObject = webView.windowScriptObject();

    // Get the current selection and update the CSS preview accordingly
    var selection = context.actionContext.document.selectedLayers().layers();
    if (selection.length == 1) {
      windowObject.evaluateWebScript("updatePreview('" + selection[0].CSSAttributes().join(" ") + "')");
    } else {
      windowObject.evaluateWebScript("updatePreview(' ')");
    }
  }
};

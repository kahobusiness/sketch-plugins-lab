//
//  SketchPluginsLab.js
//  SketchPluginsLab
//
//  Created by 吴嘉豪 on 2018/6/25.
//  Copyright © 2018年 吴嘉豪. All rights reserved.
//

var SketchPluginsLab_FrameworkPath = SketchPluginsLab_FrameworkPath || COScript.currentCOScript().env().scriptURL.path().stringByDeletingLastPathComponent();
var SketchPluginsLab_Log = SketchPluginsLab_Log || log;

(function() {
 
 var mocha = Mocha.sharedRuntime();
 var frameworkName = "SketchPluginsLab";
 var directory = SketchPluginsLab_FrameworkPath;
 
 if (mocha.valueForKey(frameworkName)) {
 SketchPluginsLab_Log("😎 loadFramework: `" + frameworkName + "` already loaded.");
 return true;
 } else if ([mocha loadFrameworkWithName:frameworkName inDirectory:directory]) {
 SketchPluginsLab_Log("✅ loadFramework: `" + frameworkName + "` success!");
 mocha.setValue_forKey_(true, frameworkName);
 return true;
 } else {
 SketchPluginsLab_Log("❌ loadFramework: `" + frameworkName + "` failed!: " + directory + ". Please define SketchPluginsLab_FrameworkPath if you're trying to @import in a custom plugin");
 return false;
 }
 })();

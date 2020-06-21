"use strict";
exports.__esModule = true;
var errorhandler_1 = require("errorhandler");
var app_1 = require("./app");
app_1["default"].use(errorhandler_1["default"]());
var server = app_1["default"].listen(3000, function () {
    console.log("App is running at http://localhost:%d", 3000);
    console.log("Press CTRL-C to stop\n");
});
exports["default"] = server;

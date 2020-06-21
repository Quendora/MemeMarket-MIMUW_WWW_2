"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
exports.__esModule = true;
exports.checkIfUserStartedQuiz = exports.changePassword = exports.checkIfUserExists = exports.addNewUser = void 0;
var sqlite = require("sqlite3");
var promisify = require("util").promisify;
var all = function (db) { return promisify((db.all.bind(db))); };
var get = function (db) { return promisify((db.get.bind(db))); };
var CryptoTS = require("crypto-ts");
var supertajnyklucz = "supertajnyklucz123";
function addNewUser(db, login, pass) {
    return __awaiter(this, void 0, void 0, function () {
        var encryptedPass, err_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    encryptedPass = CryptoTS.AES.encrypt(pass, supertajnyklucz).toString();
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, all(db)("INSERT OR REPLACE INTO authorize (login, pass) VALUES (?, ?);", login, encryptedPass)];
                case 2:
                    _a.sent();
                    return [3 /*break*/, 4];
                case 3:
                    err_1 = _a.sent();
                    throw new Error("ERROR while creating new user " + login);
                case 4: return [2 /*return*/];
            }
        });
    });
}
exports.addNewUser = addNewUser;
function checkIfUserExists(db, login, pass) {
    return __awaiter(this, void 0, void 0, function () {
        var row, err_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, get(db)("SELECT * FROM authorize WHERE login = ?;", login)];
                case 1:
                    row = _a.sent();
                    if (row == null || !row.hasOwnProperty('pass'))
                        return [2 /*return*/, false];
                    return [2 /*return*/, CryptoTS.AES.decrypt(row["pass"], supertajnyklucz).toString(CryptoTS.enc.Utf8) === pass];
                case 2:
                    err_2 = _a.sent();
                    throw new Error("ERROR while checking if user exists");
                case 3: return [2 /*return*/];
            }
        });
    });
}
exports.checkIfUserExists = checkIfUserExists;
function saveNewPassInDb(db, login, pass) {
    return __awaiter(this, void 0, void 0, function () {
        var err_3;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, addNewUser(db, login, pass)];
                case 1:
                    _a.sent();
                    return [3 /*break*/, 3];
                case 2:
                    err_3 = _a.sent();
                    throw new Error("ERROR while saving new password");
                case 3: return [2 /*return*/];
            }
        });
    });
}
function deleteAllUserSessions(login) {
    return __awaiter(this, void 0, void 0, function () {
        var db, searchFor, err_4;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    db = null;
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, 4, 5]);
                    db = new sqlite.Database('sessions');
                    searchFor = "%\"authorised\":\"" + login + "\"%";
                    return [4 /*yield*/, all(db)("DELETE FROM sessions WHERE sess LIKE ?;", searchFor)];
                case 2:
                    _a.sent();
                    return [3 /*break*/, 5];
                case 3:
                    err_4 = _a.sent();
                    throw new Error("ERROR while deleting all user sessions");
                case 4:
                    if (db)
                        db.close();
                    return [7 /*endfinally*/];
                case 5: return [2 /*return*/];
            }
        });
    });
}
function changePassword(db, login, reqBody) {
    return __awaiter(this, void 0, void 0, function () {
        var oldpassword, newpassword1, newpassword2, errors;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    oldpassword = reqBody.oldpassword || '';
                    newpassword1 = reqBody.newpassword1 || '';
                    newpassword2 = reqBody.newpassword2 || '';
                    errors = {};
                    if (!(oldpassword === '')) return [3 /*break*/, 1];
                    errors["oldpassword"] = "Hasło nie może być puste";
                    return [3 /*break*/, 3];
                case 1: return [4 /*yield*/, checkIfUserExists(db, login, oldpassword)];
                case 2:
                    if (!(_a.sent())) {
                        errors["oldpassword"] = "Błędne hasło";
                    }
                    _a.label = 3;
                case 3:
                    if (newpassword1 === '') {
                        errors["newpassword1"] = "Hasło nie może być puste";
                    }
                    if (newpassword2 === '') {
                        errors["newpassword2"] = "Hasło nie może być puste";
                    }
                    else if (newpassword1 !== newpassword2) {
                        errors["newpassword2"] = "Hasła do siebie nie pasują";
                    }
                    if (!(Object.keys(errors).length === 0)) return [3 /*break*/, 6];
                    return [4 /*yield*/, saveNewPassInDb(db, login, newpassword1)];
                case 4:
                    _a.sent();
                    return [4 /*yield*/, deleteAllUserSessions(login)];
                case 5:
                    _a.sent();
                    _a.label = 6;
                case 6: return [2 /*return*/, { errors: errors, values: { oldpassword: oldpassword,
                            newpassword1: newpassword1, newpassword2: newpassword2 } }];
            }
        });
    });
}
exports.changePassword = changePassword;
function checkIfUserStartedQuiz(readDb, quizId, login) {
    return __awaiter(this, void 0, void 0, function () {
        var db, searchForQuiz, searchForUser, rows, quizHeader, regex, mostRecentTime, _i, rows_1, row, err_5;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    db = null;
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 4, 5, 6]);
                    db = new sqlite.Database('sessions');
                    searchForQuiz = "%\"" + quizId + "\":%";
                    searchForUser = "%\"authorised\":\"" + login + "\"%";
                    return [4 /*yield*/, all(db)("SELECT * FROM sessions WHERE sess LIKE ? AND sess LIKE ?;", searchForQuiz, searchForUser)];
                case 2:
                    rows = _a.sent();
                    if (!rows)
                        return [2 /*return*/, false];
                    return [4 /*yield*/, get(readDb)("SELECT * FROM quiz WHERE id = ?;", quizId)];
                case 3:
                    quizHeader = _a.sent();
                    regex = "\"" + quizId + "\":([0-9]+)";
                    mostRecentTime = 0;
                    for (_i = 0, rows_1 = rows; _i < rows_1.length; _i++) {
                        row = rows_1[_i];
                        mostRecentTime = Math.max(mostRecentTime, row["sess"].match(regex)[1]);
                    }
                    return [2 /*return*/, quizHeader['time'] > (Date.now() - mostRecentTime) / 1000];
                case 4:
                    err_5 = _a.sent();
                    throw new Error("ERROR while checking if user started quiz");
                case 5:
                    if (db)
                        db.close();
                    return [7 /*endfinally*/];
                case 6: return [2 /*return*/];
            }
        });
    });
}
exports.checkIfUserStartedQuiz = checkIfUserStartedQuiz;

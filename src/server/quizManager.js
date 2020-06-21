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
exports.checkNumberValidity = exports.checkTextValidity = exports.checkIfUserSolvedQuiz = exports.makeQuizSummaryWithStatistics = exports.getUserQuizzesList = exports.makeQuizSummary = exports.checkAnswersValidity = exports.getQuizJSON = exports.getQuizList = exports.saveUserQuiz = exports.addToLeaderboard = exports.addUserAnswers = exports.addNewQuiz = exports.saveSingleQuizQuestion = void 0;
var promisify = require("util").promisify;
var all = function (db) { return promisify((db.all.bind(db))); };
var get = function (db) { return promisify((db.get.bind(db))); };
function delay(ms) {
    return new Promise(function (resolve) { return setTimeout(resolve, ms); });
}
function saveNewQuizInQuizTable(db, quiz) {
    return __awaiter(this, void 0, void 0, function () {
        var request, params;
        return __generator(this, function (_a) {
            if (quiz.hasOwnProperty("id")) {
                request = "INSERT OR REPLACE INTO quiz (id, time, noQuestions, name) VALUES (?, ?, ?, ?);";
                params = [quiz['id'], quiz['time'], quiz['noQuestions'], quiz['name']];
            }
            else {
                request = "INSERT OR REPLACE INTO quiz (time, noQuestions, name) VALUES (?, ?, ?);";
                params = [quiz['time'], quiz['noQuestions'], quiz['name']];
            }
            return [2 /*return*/, new Promise(function (resolve, reject) {
                    db.run(request, params, function (err) {
                        if (err) {
                            if (err['code'] == 'SQLITE_BUSY')
                                reject(err);
                            else
                                reject("DB Error while adding quiz to quiz table");
                            return;
                        }
                        resolve(this.lastID);
                    });
                })];
        });
    });
}
function saveSingleQuizQuestion(db, ans, quizId) {
    return __awaiter(this, void 0, void 0, function () {
        var err_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, all(db)("INSERT OR REPLACE INTO quizQuestions \n            (quizId, questionNum, question, corrAnswer, penalty) VALUES (?, ?, ?, ?, ?);", quizId, ans['number'], ans['question'], ans['corrAnswer'], ans['penalty'])];
                case 1:
                    _a.sent();
                    return [3 /*break*/, 3];
                case 2:
                    err_1 = _a.sent();
                    if (err_1['code'] == 'SQLITE_BUSY')
                        throw err_1;
                    else
                        throw new Error("ERROR while adding single answer");
                    return [3 /*break*/, 3];
                case 3: return [2 /*return*/];
            }
        });
    });
}
exports.saveSingleQuizQuestion = saveSingleQuizQuestion;
function addNewQuiz(db, quiz) {
    return __awaiter(this, void 0, void 0, function () {
        var quizId, questions, _i, questions_1, q, err_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    quizId = 0;
                    questions = quiz["questions"];
                    _a.label = 1;
                case 1:
                    if (!true) return [3 /*break*/, 17];
                    _a.label = 2;
                case 2:
                    _a.trys.push([2, 11, , 16]);
                    return [4 /*yield*/, db.run("BEGIN EXCLUSIVE TRANSACTION")];
                case 3:
                    _a.sent();
                    return [4 /*yield*/, saveNewQuizInQuizTable(db, quiz)];
                case 4:
                    quizId = _a.sent();
                    _i = 0, questions_1 = questions;
                    _a.label = 5;
                case 5:
                    if (!(_i < questions_1.length)) return [3 /*break*/, 8];
                    q = questions_1[_i];
                    return [4 /*yield*/, saveSingleQuizQuestion(db, q, quizId)];
                case 6:
                    _a.sent();
                    _a.label = 7;
                case 7:
                    _i++;
                    return [3 /*break*/, 5];
                case 8: return [4 /*yield*/, db.run("COMMIT TRANSACTION")];
                case 9:
                    _a.sent();
                    return [4 /*yield*/, delay(200)];
                case 10:
                    _a.sent();
                    return [3 /*break*/, 17];
                case 11:
                    err_2 = _a.sent();
                    if (!(err_2['code'] == 'SQLITE_BUSY')) return [3 /*break*/, 14];
                    return [4 /*yield*/, db.run("ROLLBACK")];
                case 12:
                    _a.sent();
                    return [4 /*yield*/, delay(500)];
                case 13:
                    _a.sent();
                    return [3 /*break*/, 15];
                case 14: throw err_2;
                case 15: return [3 /*break*/, 16];
                case 16: return [3 /*break*/, 1];
                case 17: return [2 /*return*/];
            }
        });
    });
}
exports.addNewQuiz = addNewQuiz;
function addUserAnswers(db, answers, time, quizId, login) {
    return __awaiter(this, void 0, void 0, function () {
        var penaltySum, timeSum, questions, i, q, valid, err_3;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    penaltySum = 0, timeSum = 0;
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 7, , 8]);
                    return [4 /*yield*/, all(db)("SELECT questionNum, corrAnswer\n            FROM quizQuestions WHERE quizId = ? ORDER BY questionNum ASC;", quizId)];
                case 2:
                    questions = _a.sent();
                    i = 0;
                    _a.label = 3;
                case 3:
                    if (!(i < answers.length)) return [3 /*break*/, 6];
                    q = answers[i];
                    penaltySum += q["penalty"];
                    timeSum += q["timeSpent"];
                    valid = q['answer'] === questions[i]['corrAnswer'] ? 1 : 0;
                    return [4 /*yield*/, all(db)("INSERT OR REPLACE INTO userAnswers \n            (quizId, questionNum, login, answer, time, valid) VALUES (?, ?, ?, ?, ?, ?);", quizId, i, login, q['answer'], q["timeSpent"], valid)];
                case 4:
                    _a.sent();
                    _a.label = 5;
                case 5:
                    i++;
                    return [3 /*break*/, 3];
                case 6: return [2 /*return*/, [penaltySum, timeSum]];
                case 7:
                    err_3 = _a.sent();
                    if (err_3['code'] == 'SQLITE_BUSY')
                        throw err_3;
                    else
                        throw new Error("ERROR while adding user answers");
                    return [3 /*break*/, 8];
                case 8: return [2 /*return*/];
            }
        });
    });
}
exports.addUserAnswers = addUserAnswers;
function addToLeaderboard(db, quizId, login, score) {
    return __awaiter(this, void 0, void 0, function () {
        var err_4;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, all(db)("INSERT OR REPLACE INTO leaderboard (quizId, login, score) VALUES (?, ?, ?);", quizId, login, score)];
                case 1:
                    _a.sent();
                    return [3 /*break*/, 3];
                case 2:
                    err_4 = _a.sent();
                    if (err_4['code'] == 'SQLITE_BUSY')
                        throw err_4;
                    else
                        throw err_4;
                    return [3 /*break*/, 3];
                case 3: return [2 /*return*/];
            }
        });
    });
}
exports.addToLeaderboard = addToLeaderboard;
function saveUserQuiz(db, userAns, time, quizId, login) {
    return __awaiter(this, void 0, void 0, function () {
        var quizHeader, _a, penaltySum, timeSum, err_5;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    if (!true) return [3 /*break*/, 13];
                    _b.label = 1;
                case 1:
                    _b.trys.push([1, 7, , 12]);
                    return [4 /*yield*/, get(db)("SELECT * FROM quiz WHERE id = ?;", quizId)];
                case 2:
                    quizHeader = _b.sent();
                    return [4 /*yield*/, db.run("BEGIN EXCLUSIVE TRANSACTION")];
                case 3:
                    _b.sent();
                    return [4 /*yield*/, addUserAnswers(db, userAns, time, quizId, login)];
                case 4:
                    _a = _b.sent(), penaltySum = _a[0], timeSum = _a[1];
                    return [4 /*yield*/, addToLeaderboard(db, quizId, login, quizHeader["time"] - timeSum - penaltySum)];
                case 5:
                    _b.sent();
                    return [4 /*yield*/, db.run("COMMIT TRANSACTION")];
                case 6:
                    _b.sent();
                    return [3 /*break*/, 13];
                case 7:
                    err_5 = _b.sent();
                    if (!(err_5['code'] == 'SQLITE_BUSY')) return [3 /*break*/, 10];
                    return [4 /*yield*/, db.run("ROLLBACK")];
                case 8:
                    _b.sent();
                    return [4 /*yield*/, delay(500)];
                case 9:
                    _b.sent();
                    return [3 /*break*/, 11];
                case 10: throw err_5;
                case 11: return [3 /*break*/, 12];
                case 12: return [3 /*break*/, 0];
                case 13: return [2 /*return*/];
            }
        });
    });
}
exports.saveUserQuiz = saveUserQuiz;
function getQuizList(db, login) {
    return __awaiter(this, void 0, void 0, function () {
        var err_6;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, all(db)("SELECT id, name FROM quiz WHERE id NOT IN \n            (SELECT quizId FROM leaderboard WHERE login = ?);", login)];
                case 1: return [2 /*return*/, _a.sent()];
                case 2:
                    err_6 = _a.sent();
                    throw new Error("ERROR while getting quiz list");
                case 3: return [2 /*return*/];
            }
        });
    });
}
exports.getQuizList = getQuizList;
function getQuizJSON(db, quizId) {
    return __awaiter(this, void 0, void 0, function () {
        var quizHeader, questions, id, time, noQuestions, name_1, quiz, err_7;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 3, , 4]);
                    return [4 /*yield*/, get(db)("SELECT * FROM quiz WHERE id = ?;", quizId)];
                case 1:
                    quizHeader = _a.sent();
                    return [4 /*yield*/, all(db)("SELECT questionNum, question, corrAnswer, penalty\n            FROM quizQuestions WHERE quizId = ? ORDER BY questionNum ASC;", quizId)];
                case 2:
                    questions = _a.sent();
                    id = quizHeader['id'], time = quizHeader['time'], noQuestions = quizHeader['noQuestions'], name_1 = quizHeader['name'];
                    quiz = { id: id, time: time, noQuestions: noQuestions, name: name_1, questions: questions };
                    return [2 /*return*/, quiz];
                case 3:
                    err_7 = _a.sent();
                    throw new Error("ERROR while getting quiz JSON");
                case 4: return [2 /*return*/];
            }
        });
    });
}
exports.getQuizJSON = getQuizJSON;
function checkAnswersValidity(db, quizId, answers, time) {
    return __awaiter(this, void 0, void 0, function () {
        var questions, response, i, responseAns, err_8;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, all(db)("SELECT questionNum, question, corrAnswer, penalty\n            FROM quizQuestions WHERE quizId = ? ORDER BY questionNum ASC;", quizId)];
                case 1:
                    questions = _a.sent();
                    response = new /** @class */ (function () {
                        function class_1() {
                        }
                        return class_1;
                    }());
                    response.answers = [];
                    for (i = 0; i < answers.length; i++) {
                        responseAns = new /** @class */ (function () {
                            function class_2() {
                            }
                            return class_2;
                        }());
                        responseAns.answer = answers[i].answer;
                        responseAns.timeSpent = Math.round(answers[i].timeSpent * time / 100);
                        responseAns.penalty = answers[i].answer === questions[i].corrAnswer ? 0 : questions[i].penalty;
                        response.answers.push(responseAns);
                    }
                    return [2 /*return*/, response];
                case 2:
                    err_8 = _a.sent();
                    throw new Error("ERROR while getting quiz JSON");
                case 3: return [2 /*return*/];
            }
        });
    });
}
exports.checkAnswersValidity = checkAnswersValidity;
function makeQuizSummary(db, quizId, login) {
    return __awaiter(this, void 0, void 0, function () {
        var quizHeader, questions, userAnswers, timeSum, quizSummary, i, singleSummary, err_9;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 4, , 5]);
                    return [4 /*yield*/, get(db)("SELECT time FROM quiz WHERE id = ?;", quizId)];
                case 1:
                    quizHeader = _a.sent();
                    return [4 /*yield*/, all(db)("SELECT question, corrAnswer, penalty\n            FROM quizQuestions WHERE quizId = ? ORDER BY questionNum ASC;", quizId)];
                case 2:
                    questions = _a.sent();
                    return [4 /*yield*/, all(db)("SELECT answer, time FROM userAnswers \n            WHERE quizId = ? AND login = ? ORDER BY questionNum ASC;", quizId, login)];
                case 3:
                    userAnswers = _a.sent();
                    timeSum = 0;
                    quizSummary = [];
                    for (i = 0; i < questions.length; i++) {
                        singleSummary = {
                            question: questions[i].question,
                            answer: userAnswers[i].answer,
                            time: userAnswers[i].time,
                            penalty: questions[i].corrAnswer === userAnswers[i].answer ? -1 : questions[i].penalty
                        };
                        timeSum += userAnswers[i].time;
                        quizSummary.push(singleSummary);
                    }
                    return [2 /*return*/, { answers: quizSummary, timeLeft: quizHeader['time'] - timeSum }];
                case 4:
                    err_9 = _a.sent();
                    throw new Error("ERROR while getting quiz JSON");
                case 5: return [2 /*return*/];
            }
        });
    });
}
exports.makeQuizSummary = makeQuizSummary;
function getUserQuizzesList(db, login) {
    return __awaiter(this, void 0, void 0, function () {
        var err_10;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, all(db)("SELECT userQuiz.quizId AS id, quiz.name AS name FROM \n            (SELECT quizId FROM leaderboard WHERE login = ?) AS userQuiz\n            LEFT JOIN (SELECT id, name FROM quiz) AS quiz ON userQuiz.quizid = quiz.id;", login)];
                case 1: return [2 /*return*/, _a.sent()];
                case 2:
                    err_10 = _a.sent();
                    throw new Error("ERROR while getting user quizzes list");
                case 3: return [2 /*return*/];
            }
        });
    });
}
exports.getUserQuizzesList = getUserQuizzesList;
function fillSummaryWithUserStats(db, result, questions, userAnswers, quizId) {
    return __awaiter(this, void 0, void 0, function () {
        var avgTimes, j, avg, i, err_11;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, all(db)("SELECT questionNum, AVG(time) AS avg FROM userAnswers \n        WHERE quizId = ? AND valid = ? GROUP BY questionNum ORDER BY questionNum ASC", quizId, 1)];
                case 1:
                    avgTimes = _a.sent();
                    j = 0, avg = void 0;
                    for (i = 0; i < questions.length; i++) {
                        if (j < avgTimes.length && avgTimes[j].questionNum === i) {
                            avg = avgTimes[j].avg;
                            j++;
                        }
                        else
                            avg = -1;
                        result['userStats'].push({
                            question: questions[i].question,
                            answer: userAnswers[i].answer,
                            corrAnswer: questions[i].corrAnswer,
                            time: userAnswers[i].time,
                            avg: avg,
                            penalty: questions[i].penalty,
                            valid: userAnswers[i].valid == 1
                        });
                    }
                    return [3 /*break*/, 3];
                case 2:
                    err_11 = _a.sent();
                    throw err_11;
                case 3: return [2 /*return*/];
            }
        });
    });
}
function fillSummaryWithBestStats(db, result, questions, userAnswers, bestUsers, quizId) {
    return __awaiter(this, void 0, void 0, function () {
        var bestAnswers, i, k, j, err_12;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, all(db)("SELECT login, answer, time\n            FROM userAnswers WHERE quizId = ? AND login IN \n            (SELECT login FROM leaderboard \n            WHERE quizId = ? ORDER BY score DESC LIMIT 5)\n            ORDER BY login, questionNum ASC;", quizId, quizId)];
                case 1:
                    bestAnswers = _a.sent();
                    console.log(bestAnswers);
                    console.log(bestUsers);
                    for (i = 0; i < bestUsers.length; i++) {
                        result['bestStats'].push({
                            login: bestUsers[i]['login'],
                            score: bestUsers[i]['score'],
                            stats: []
                        });
                        k = void 0;
                        for (k = 0; k < bestAnswers.length; k += questions.length)
                            if (bestAnswers[k]['login'] === bestUsers[i]['login'])
                                break;
                        for (j = 0; j < questions.length; j++) {
                            result['bestStats'][i]["stats"].push({
                                question: questions[j].question,
                                time: bestAnswers[k + j]['time']
                            });
                        }
                    }
                    return [3 /*break*/, 3];
                case 2:
                    err_12 = _a.sent();
                    throw new Error("ERROR while summarizing best stats");
                case 3: return [2 /*return*/];
            }
        });
    });
}
function makeQuizSummaryWithStatistics(db, login, quizId) {
    return __awaiter(this, void 0, void 0, function () {
        var questions, userAnswers, bestUsers, score, result, err_13;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 7, , 8]);
                    return [4 /*yield*/, all(db)("SELECT question, corrAnswer, penalty\n            FROM quizQuestions WHERE quizId = ? ORDER BY questionNum ASC;", quizId)];
                case 1:
                    questions = _a.sent();
                    return [4 /*yield*/, all(db)("SELECT answer, valid, time FROM userAnswers \n            WHERE quizId = ? AND login = ? ORDER BY questionNum ASC;", quizId, login)];
                case 2:
                    userAnswers = _a.sent();
                    return [4 /*yield*/, all(db)("SELECT login, score FROM leaderboard \n            WHERE quizId = ? ORDER BY score DESC LIMIT 5;", quizId)];
                case 3:
                    bestUsers = _a.sent();
                    return [4 /*yield*/, get(db)("SELECT score FROM leaderboard \n            WHERE quizId = ? AND login = ?;", quizId, login)];
                case 4:
                    score = _a.sent();
                    result = {
                        score: score['score'],
                        userStats: [],
                        bestStats: []
                    };
                    return [4 /*yield*/, fillSummaryWithBestStats(db, result, questions, userAnswers, bestUsers, quizId)];
                case 5:
                    _a.sent();
                    return [4 /*yield*/, fillSummaryWithUserStats(db, result, questions, userAnswers, quizId)];
                case 6:
                    _a.sent();
                    return [2 /*return*/, result];
                case 7:
                    err_13 = _a.sent();
                    throw err_13;
                case 8: return [2 /*return*/];
            }
        });
    });
}
exports.makeQuizSummaryWithStatistics = makeQuizSummaryWithStatistics;
function checkIfUserSolvedQuiz(db, login, quizId) {
    return __awaiter(this, void 0, void 0, function () {
        var err_14;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, get(db)("SELECT * FROM leaderboard WHERE login = ? AND quizId = ?", login, quizId)];
                case 1: return [2 /*return*/, _a.sent()];
                case 2:
                    err_14 = _a.sent();
                    throw new Error("ERROR while checking if user solved quiz");
                case 3: return [2 /*return*/];
            }
        });
    });
}
exports.checkIfUserSolvedQuiz = checkIfUserSolvedQuiz;
function checkTextValidity(txt) {
    for (var _i = 0, txt_1 = txt; _i < txt_1.length; _i++) {
        var char = txt_1[_i];
        if ((char >= '0' && char <= '9') || (char >= 'a' && char <= 'z') || (char >= 'A' && char <= 'Z')) {
            return true;
        }
    }
    throw new Error("Invalid");
}
exports.checkTextValidity = checkTextValidity;
function checkNumberValidity(txt) {
    for (var _i = 0, txt_2 = txt; _i < txt_2.length; _i++) {
        var char = txt_2[_i];
        if (!(char >= '0' && char <= '9')) {
            throw new Error("Invalid");
        }
    }
    return true;
}
exports.checkNumberValidity = checkNumberValidity;

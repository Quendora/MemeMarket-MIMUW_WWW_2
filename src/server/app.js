"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
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
var express_1 = require("express");
var cookie_parser_1 = require("cookie-parser");
var csurf_1 = require("csurf");
var sqlite = require("sqlite3");
var express_session_1 = require("express-session");
var path_1 = require("path");
var server_1 = require("./server");
var users_1 = require("./users");
var quizManager_1 = require("./quizManager");
var sqliteStore = require('connect-sqlite3')(express_session_1["default"]);
var app = express_1["default"]();
var csrfProtection = csurf_1["default"]({ cookie: true });
sqlite.verbose();
var supertajnyklucz = "321zculkynjatrepus";
var readDb = new sqlite.Database('quiz.db', sqlite.OPEN_READWRITE);
process.once('SIGINT', function (code) {
    readDb.close();
    server_1["default"].close();
});
app.use(cookie_parser_1["default"](supertajnyklucz));
app.use(express_session_1["default"]({
    secret: supertajnyklucz,
    cookie: { maxAge: 1000 * 60 * 1000 },
    resave: false,
    saveUninitialized: true,
    store: new sqliteStore()
}));
app.use(express_1["default"].static(path_1["default"].join(__dirname, '/../../static')));
app.use(express_1["default"].static(path_1["default"].join(__dirname, '/../../dist/server')));
app.use(express_1["default"].static(path_1["default"].join(__dirname, '/../../dist/front')));
app.use(express_1["default"].urlencoded({ extended: true }));
app.use(require("body-parser").json());
app.set('view engine', 'pug');
app.get('/', csrfProtection, function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        res.render('index', { title: "Strona główna", authorised: req.session.authorised, csrfToken: req.csrfToken() });
        return [2 /*return*/];
    });
}); });
app.get('/login', csrfProtection, function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        res.render('login', { title: "Logowanie", login: '', password: '', authorised: req.session.authorised, csrfToken: req.csrfToken() });
        return [2 /*return*/];
    });
}); });
app.post('/login', csrfProtection, function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var login, password, userExists;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                login = req.body.login;
                password = req.body.password;
                return [4 /*yield*/, users_1.checkIfUserExists(readDb, login, password)];
            case 1:
                userExists = _a.sent();
                if (userExists) {
                    req.session.authorised = login;
                    req.session.quizzes = req.session.quizzes || {};
                    res.redirect('/');
                }
                else {
                    res.render('login', { title: "Logowanie", login: '', password: '',
                        authorised: req.session.authorised, csrfToken: req.csrfToken() });
                }
                return [2 /*return*/];
        }
    });
}); });
app.post('/logout', csrfProtection, function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        req.session.authorised = "";
        res.redirect('/');
        return [2 /*return*/];
    });
}); });
app.post('/makeQuiz', csrfProtection, function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var quiz, i, numbers, db;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                quiz = {};
                try {
                    quizManager_1.checkTextValidity(req.body.name);
                    quizManager_1.checkNumberValidity(req.body.time);
                    quiz["name"] = req.body.name;
                    quiz["time"] = req.body.time;
                    quiz["noQuestions"] = req.session.qNum;
                    quiz["questions"] = [];
                    for (i = 0; i < req.session.qNum; i++) {
                        quizManager_1.checkTextValidity(req.body["que" + i]);
                        quizManager_1.checkTextValidity(req.body["ans" + i]);
                        quizManager_1.checkNumberValidity(req.body["pen" + i]);
                        quiz["questions"].push({
                            number: i + 1,
                            question: req.body["que" + i],
                            corrAnswer: req.body["ans" + i],
                            penalty: req.body["pen" + i]
                        });
                    }
                }
                catch (err) {
                    numbers = Array.from(Array(parseInt(req.session.qNum, 10)).keys());
                    res.render('quizMaker', { title: "QuizMaker", numbers: numbers, authorised: req.session.authorised, csrfToken: req.csrfToken() });
                    return [2 /*return*/];
                }
                db = new sqlite.Database('quiz.db', sqlite.OPEN_READWRITE);
                console.log(quiz);
                return [4 /*yield*/, quizManager_1.addNewQuiz(db, quiz)];
            case 1:
                _a.sent();
                db.close();
                res.redirect('/');
                return [2 /*return*/];
        }
    });
}); });
app.get('/prepareQuiz', csrfProtection, function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        res.render('prepareQuiz', { title: "QuizMaker",
            authorised: req.session.authorised, csrfToken: req.csrfToken() });
        return [2 /*return*/];
    });
}); });
app.post('/prepareQuiz', csrfProtection, function (req, res, next) { return __awaiter(void 0, void 0, void 0, function () {
    var numbers;
    return __generator(this, function (_a) {
        if (!req.session.authorised)
            next();
        if (!quizManager_1.checkNumberValidity(req.body.qNum)) {
            res.redirect('/prepareQuiz');
            return [2 /*return*/];
        }
        numbers = Array.from(Array(parseInt(req.body.qNum, 10)).keys());
        req.session.qNum = req.body.qNum;
        res.render('quizMaker', { title: "QuizMaker", numbers: numbers, authorised: req.session.authorised, csrfToken: req.csrfToken() });
        return [2 /*return*/];
    });
}); });
app.post('/changepass', csrfProtection, function (req, res, next) { return __awaiter(void 0, void 0, void 0, function () {
    var db, _a, errors, values, err_1;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                db = new sqlite.Database('quiz.db', sqlite.OPEN_READWRITE);
                _b.label = 1;
            case 1:
                _b.trys.push([1, 3, 4, 5]);
                return [4 /*yield*/, users_1.changePassword(db, req.session.authorised, req.body)];
            case 2:
                _a = _b.sent(), errors = _a.errors, values = _a.values;
                if (Object.keys(errors).length === 0) {
                    req.session.authorised = "";
                    res.redirect('/');
                }
                else {
                    res.render('change_pass', __assign(__assign({ title: "Zmiana hasła", authorised: req.session.authorised, errors: errors, oldpassword: '' }, values), { csrfToken: req.csrfToken() }));
                }
                return [3 /*break*/, 5];
            case 3:
                err_1 = _b.sent();
                console.log(err_1);
                next();
                return [3 /*break*/, 5];
            case 4:
                db.close();
                return [7 /*endfinally*/];
            case 5: return [2 /*return*/];
        }
    });
}); });
app.get('/changepass', csrfProtection, function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        res.render('change_pass', { title: "Zmiana hasła", authorised: req.session.authorised,
            errors: {}, oldpassword: '', newpassword1: '', newpassword2: '', csrfToken: req.csrfToken() });
        return [2 /*return*/];
    });
}); });
app.post('/choosequiz', csrfProtection, function (req, res, next) { return __awaiter(void 0, void 0, void 0, function () {
    var quizzes, filteredQuizzes, _i, quizzes_1, q, err_2;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 6, , 7]);
                return [4 /*yield*/, quizManager_1.getQuizList(readDb, req.session.authorised)];
            case 1:
                quizzes = _a.sent();
                filteredQuizzes = [];
                _i = 0, quizzes_1 = quizzes;
                _a.label = 2;
            case 2:
                if (!(_i < quizzes_1.length)) return [3 /*break*/, 5];
                q = quizzes_1[_i];
                return [4 /*yield*/, users_1.checkIfUserStartedQuiz(readDb, q["id"], req.session.authorised)];
            case 3:
                if (!(_a.sent()))
                    filteredQuizzes.push(q);
                _a.label = 4;
            case 4:
                _i++;
                return [3 /*break*/, 2];
            case 5:
                res.render('quiz', { title: "Wybierz quiz", quizzes: filteredQuizzes,
                    authorised: req.session.authorised, csrfToken: req.csrfToken() });
                return [3 /*break*/, 7];
            case 6:
                err_2 = _a.sent();
                console.log(err_2);
                next();
                return [3 /*break*/, 7];
            case 7: return [2 /*return*/];
        }
    });
}); });
app.post('/bestResults', csrfProtection, function (req, res, next) { return __awaiter(void 0, void 0, void 0, function () {
    var quizzes, err_3;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                if (!req.session.authorised)
                    next();
                _a.label = 1;
            case 1:
                _a.trys.push([1, 3, , 4]);
                return [4 /*yield*/, quizManager_1.getUserQuizzesList(readDb, req.session.authorised)];
            case 2:
                quizzes = _a.sent();
                res.render('bestResults', { title: "Wybierz quiz", quizzes: quizzes, authorised: req.session.authorised, csrfToken: req.csrfToken() });
                return [3 /*break*/, 4];
            case 3:
                err_3 = _a.sent();
                console.log(err_3);
                next();
                return [3 /*break*/, 4];
            case 4: return [2 /*return*/];
        }
    });
}); });
app.get('/results/:quizId(\\d+)', csrfProtection, function (req, res, next) { return __awaiter(void 0, void 0, void 0, function () {
    var quizId, summary, err_4;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                if (!req.session.authorised)
                    next();
                _a.label = 1;
            case 1:
                _a.trys.push([1, 3, , 4]);
                quizId = parseInt(req.params.quizId, 10);
                if (isNaN(quizId))
                    next();
                return [4 /*yield*/, quizManager_1.makeQuizSummaryWithStatistics(readDb, req.session.authorised, quizId)];
            case 2:
                summary = _a.sent();
                res.render('singleResult', { title: "Statystyki", summary: summary });
                return [3 /*break*/, 4];
            case 3:
                err_4 = _a.sent();
                console.log(err_4);
                next();
                return [3 /*break*/, 4];
            case 4: return [2 /*return*/];
        }
    });
}); });
app.get('/quiz/:quizId(\\d+)', csrfProtection, function (req, res, next) { return __awaiter(void 0, void 0, void 0, function () {
    var quizId, _a, quiz, err_5;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                if (!req.session.authorised)
                    next();
                _b.label = 1;
            case 1:
                _b.trys.push([1, 5, , 6]);
                quizId = parseInt(req.params.quizId, 10);
                _a = isNaN(quizId);
                if (_a) return [3 /*break*/, 3];
                return [4 /*yield*/, users_1.checkIfUserStartedQuiz(readDb, req.params.quizId, req.session.authorised)];
            case 2:
                _a = (_b.sent());
                _b.label = 3;
            case 3:
                if (_a) {
                    res.send({ error: "ERROR" });
                    return [2 /*return*/];
                }
                return [4 /*yield*/, quizManager_1.getQuizJSON(readDb, quizId)];
            case 4:
                quiz = _b.sent();
                req.session.quizzes[quizId] = Date.now();
                res.setHeader('CSRF-Header', req.csrfToken());
                res.send(quiz);
                return [3 /*break*/, 6];
            case 5:
                err_5 = _b.sent();
                console.log(err_5);
                next();
                return [3 /*break*/, 6];
            case 6: return [2 /*return*/];
        }
    });
}); });
app.post('/cancel/:quizId(\\d+)', csrfProtection, function (req, res, next) { return __awaiter(void 0, void 0, void 0, function () {
    var quizId;
    return __generator(this, function (_a) {
        if (!req.session.authorised)
            next();
        try {
            quizId = parseInt(req.params.quizId, 10);
            if (isNaN(quizId))
                next();
            req.session.quizzes[quizId] = undefined;
            res.send();
        }
        catch (err) {
            console.log(err);
            next();
        }
        return [2 /*return*/];
    });
}); });
app.post('/submit/:quizId(\\d+)', csrfProtection, function (req, res, next) { return __awaiter(void 0, void 0, void 0, function () {
    var db, quizId, quizTime, response, result, err_6;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                if (!req.session.authorised)
                    next();
                _a.label = 1;
            case 1:
                _a.trys.push([1, 8, 9, 10]);
                quizId = parseInt(req.params.quizId, 10);
                if (isNaN(quizId))
                    next();
                return [4 /*yield*/, quizManager_1.checkIfUserSolvedQuiz(readDb, req.session.authorised, quizId)];
            case 2:
                if (!_a.sent()) return [3 /*break*/, 3];
                res.send({ error: "ERROR" });
                return [3 /*break*/, 7];
            case 3:
                db = new sqlite.Database('quiz.db', sqlite.OPEN_READWRITE);
                quizTime = Math.floor((Date.now() - req.session.quizzes[quizId]) / 1000);
                req.session.quizzes[quizId] = undefined;
                return [4 /*yield*/, quizManager_1.checkAnswersValidity(db, quizId, req.body, quizTime)];
            case 4:
                response = _a.sent();
                return [4 /*yield*/, quizManager_1.saveUserQuiz(db, response.answers, quizTime, quizId, req.session.authorised)];
            case 5:
                _a.sent();
                return [4 /*yield*/, quizManager_1.makeQuizSummary(readDb, quizId, req.session.authorised)];
            case 6:
                result = _a.sent();
                res.send(result);
                _a.label = 7;
            case 7: return [3 /*break*/, 10];
            case 8:
                err_6 = _a.sent();
                console.log(err_6);
                next();
                return [3 /*break*/, 10];
            case 9:
                if (db)
                    db.close();
                return [7 /*endfinally*/];
            case 10: return [2 /*return*/];
        }
    });
}); });
app.use(function (err, req, res, next) {
    res.status(500).render('error', { authorised: req.session.authorised });
});
app.use(function (req, res) {
    res.status(404);
    res.render('404', { authorised: req.session.authorised });
});
exports["default"] = app;

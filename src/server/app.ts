import express from 'express';
import cookieParser from 'cookie-parser';
import csurf from 'csurf';
import * as sqlite from 'sqlite3';
import session from 'express-session';
import path from 'path'
import server from "./server";

import {checkIfUserStartedQuiz, checkIfUserExists, changePassword} from "./users";
import {
    addNewQuiz,
    checkAnswersValidity, checkIfUserSolvedQuiz, checkNumberValidity, checkTextValidity,
    getQuizJSON,
    getQuizList,
    getUserQuizzesList,
    makeQuizSummary, makeQuizSummaryWithStatistics,
    Response,
    saveUserQuiz
} from "./quizManager";

const sqliteStore = require('connect-sqlite3')(session);

const app = express();
const csrfProtection = csurf({cookie: true});

sqlite.verbose();
const supertajnyklucz = "321zculkynjatrepus";

const readDb = new sqlite.Database('quiz.db', sqlite.OPEN_READWRITE);
process.once('SIGINT', function (code) {
    readDb.close();
    server.close();
});

app.use(cookieParser(supertajnyklucz));
app.use(session({
    secret: supertajnyklucz,
    cookie: { maxAge: 1000 * 60 * 1000},
    resave: false,
    saveUninitialized: true,
    store: new sqliteStore(),
}));
app.use(express.static(path.join(__dirname, '/../../static')))
app.use(express.static(path.join(__dirname, '/../../dist/server')))
app.use(express.static(path.join(__dirname, '/../../dist/front')))
app.use(express.urlencoded({ extended: true }));
app.use(require("body-parser").json());


app.set('view engine', 'pug');
app.get('/', csrfProtection, async (req, res) => {
    res.render('index', {title: "Strona główna", authorised: req.session.authorised,
        csrfToken: req.csrfToken()});
});
app.get('/login', csrfProtection, async (req, res) => {
    res.render('login', {title: "Logowanie", login: '', password: '',
        authorised: req.session.authorised, csrfToken: req.csrfToken()});
});
app.post('/login', csrfProtection, async (req, res) => {
    const login = req.body.login;
    const password = req.body.password;
    const userExists = await checkIfUserExists(readDb, login, password);
    if (userExists) {
        req.session.authorised = login;
        req.session.quizzes = req.session.quizzes || {};
        res.redirect('/');
    } else {
        res.render('login', {title: "Logowanie", login: '', password: '',
            authorised: req.session.authorised, csrfToken: req.csrfToken()});
    }
});
app.post('/logout', csrfProtection, async (req, res) => {
    req.session.authorised = "";
    res.redirect('/');
});
app.post('/makeQuiz', csrfProtection, async (req, res) => {
    const quiz: object = {};
    try {
        checkTextValidity(req.body.name)
        checkNumberValidity(req.body.time)
        quiz["name"] = req.body.name;
        quiz["time"] = req.body.time;
        quiz["noQuestions"] = req.session.qNum;
        quiz["questions"] = [];

        for (let i: number = 0; i < req.session.qNum; i++) {
            checkTextValidity(req.body["que" + i]);
            checkTextValidity(req.body["ans" + i]);
            checkNumberValidity(req.body["pen" + i]);
            quiz["questions"].push({
                number: i + 1,
                question: req.body["que" + i],
                corrAnswer: req.body["ans" + i],
                penalty: req.body["pen" + i]
            })
        }
    } catch (err) {
        const numbers = Array.from(Array(parseInt(req.session.qNum, 10)).keys());
        res.render('quizMaker', {title: "QuizMaker", numbers,
            authorised: req.session.authorised, csrfToken: req.csrfToken()});
        return;
    }

    const db = new sqlite.Database('quiz.db', sqlite.OPEN_READWRITE);
    await addNewQuiz(db, quiz);
    db.close();

    res.redirect('/');
});
app.get('/prepareQuiz', csrfProtection, async (req, res) => {
    res.render('prepareQuiz', {title: "QuizMaker",
        authorised: req.session.authorised, csrfToken: req.csrfToken()});
});
app.post('/prepareQuiz', csrfProtection, async (req, res, next) => {
    if (!req.session.authorised) next();

    if (!checkNumberValidity(req.body.qNum)) {
        res.redirect('/prepareQuiz');
        return;
    }

    const numbers = Array.from(Array(parseInt(req.body.qNum, 10)).keys());
    req.session.qNum = req.body.qNum;
    res.render('quizMaker', {title: "QuizMaker", numbers,
        authorised: req.session.authorised, csrfToken: req.csrfToken()});
});
app.post('/changepass', csrfProtection, async (req, res, next) => {
    const db = new sqlite.Database('quiz.db', sqlite.OPEN_READWRITE);

    try {
        const { errors, values } = await changePassword(db, req.session.authorised, req.body)
        if (Object.keys(errors).length === 0) {
            req.session.authorised = "";
            res.redirect('/');
        } else {
            res.render('change_pass', {title: "Zmiana hasła", authorised: req.session.authorised,
                errors: errors, oldpassword: '', ...values, csrfToken: req.csrfToken()});
        }
    } catch (err) {
        console.log(err);
        next();
    } finally {
        db.close();
    }
});
app.get('/changepass', csrfProtection, async (req, res) => {
    res.render('change_pass', {title: "Zmiana hasła", authorised: req.session.authorised,
        errors: {}, oldpassword: '', newpassword1: '', newpassword2: '', csrfToken: req.csrfToken()})
});
app.post('/choosequiz', csrfProtection, async (req, res, next) => {
    try {
        const quizzes: any[] = await getQuizList(readDb, req.session.authorised);
        const filteredQuizzes: any[] = [];
        for (const q of quizzes) {
            if (!(await checkIfUserStartedQuiz(readDb, q["id"], req.session.authorised)))
                filteredQuizzes.push(q);
        }
        res.render('quiz', {title: "Wybierz quiz", quizzes: filteredQuizzes,
            authorised: req.session.authorised, csrfToken: req.csrfToken()});
    } catch(err) {
        console.log(err);
        next();
    }
});

app.post('/bestResults', csrfProtection, async (req, res, next) => {
    if (!req.session.authorised) next();
    try {
        const quizzes: any[] = await getUserQuizzesList(readDb, req.session.authorised);
        res.render('bestResults', {title: "Wybierz quiz", quizzes,
            authorised: req.session.authorised, csrfToken: req.csrfToken()});
    } catch(err) {
        console.log(err);
        next();
    }
});


app.get('/results/:quizId(\\d+)', csrfProtection, async (req, res, next) => {
    if (!req.session.authorised) next();
    try {
        const quizId = parseInt(req.params.quizId, 10);
        if (isNaN(quizId)) next();

        const summary: object = await makeQuizSummaryWithStatistics(readDb,
            req.session.authorised, quizId);
        res.render('singleResult', {title: "Statystyki", summary, authorised: req.session.authorised});
    } catch (err) {
        console.log(err);
        next();
    }
});

app.get('/quiz/:quizId(\\d+)', csrfProtection, async (req, res, next) => {
    if (!req.session.authorised) next();
    try {
        const quizId = parseInt(req.params.quizId, 10);
        if (isNaN(quizId) || await checkIfUserStartedQuiz(readDb,
            req.params.quizId, req.session.authorised)) {
            res.send({error: "ERROR"});
            return;
        }

        const quiz = await getQuizJSON(readDb, quizId);
        req.session.quizzes[quizId] = Date.now();
        res.setHeader('CSRF-Header', req.csrfToken());
        res.send(quiz);
    } catch (err) {
        console.log(err);
        next();
    }
});

app.post('/cancel/:quizId(\\d+)', csrfProtection, async (req, res, next) => {
    if (!req.session.authorised) next();
    try {
        const quizId = parseInt(req.params.quizId, 10);
        if (isNaN(quizId)) next();
        req.session.quizzes[quizId] = undefined;
        res.send();
    } catch (err) {
        console.log(err);
        next();
    }
});

app.post('/submit/:quizId(\\d+)', csrfProtection, async (req, res, next) => {
    let db;
    if (!req.session.authorised) next();
    try {
        const quizId = parseInt(req.params.quizId, 10);
        if (isNaN(quizId)) next();

        if (await checkIfUserSolvedQuiz(readDb, req.session.authorised, quizId)) {
            res.send({error: "ERROR"});
        } else {
            db = new sqlite.Database('quiz.db', sqlite.OPEN_READWRITE);
            const quizTime = Math.floor((Date.now() - req.session.quizzes[quizId]) / 1000);
            req.session.quizzes[quizId] = undefined;
            const response: Response = await checkAnswersValidity(db, quizId, req.body, quizTime);
            await saveUserQuiz(db, response.answers, quizTime, quizId, req.session.authorised);

            const result: object = await makeQuizSummary(readDb, quizId, req.session.authorised);
            res.send(result);
        }
    } catch (err) {
        console.log(err);
        next();
    } finally {
        if(db) db.close();
    }
});

app.use((err, req, res, next) => {
    res.status(500).render('error', {authorised: req.session.authorised});
});
app.use((req, res) => {
    res.status(404);
    res.render('404', {authorised: req.session.authorised})
});


export default app;
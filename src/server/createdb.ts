import * as sqlite from "sqlite3";
import {addNewUser} from './users';
import { quizJSON } from './quizJson';
import {addNewQuiz} from "./quizManager";
const { promisify } = require("util");
const all = (db) => promisify((db.all.bind(db)));
const run = (db) => promisify((db.run.bind(db)));

async function createTableQuizIfNeeded(db: sqlite.Database): Promise<void> {
    try {
        const rows = await all(db)(`SELECT COUNT(*) AS cnt FROM sqlite_master WHERE type='table' and name='quiz'`);
        if (rows[0].cnt === 1) {
            console.log('Table quiz already exist.');
        } else {
            await run(db)(`CREATE TABLE quiz
                (id INTEGER PRIMARY KEY,
                time INTEGER NOT NULL,
                noQuestions INTEGER NOT NULL,
                name TEXT NOT NULL);`);
        }
    } catch (err) {
        throw new Error("ERROR while creating quiz table")
    }
}

async function createTableQuizQuestionsIfNeeded(db: sqlite.Database): Promise<void> {
    try {
        const rows = await all(db)(`SELECT COUNT(*) AS cnt FROM sqlite_master WHERE type='table' and name='quizQuestions'`);
        if (rows[0].cnt === 1) {
            console.log('Table quizQuestions already exist.');
        } else {
            await run(db)(`CREATE TABLE quizQuestions
                (quizId INTEGER NOT NULL,
                questionNum INTEGER NOT NULL,
                question TEXT NOT NULL,
                corrAnswer TEXT NOT NULL,
                penalty INTEGER NOT NULL,
                FOREIGN KEY (quizId) REFERENCES quiz (id),
                PRIMARY KEY (quizId, questionNum));`);
        }
    } catch (err) {
        throw new Error("ERROR while creating quizQuestions table")
    }
}

async function createTableAuthorizeIfNeeded(db: sqlite.Database): Promise<void> {
    try {
        const rows = await all(db)(`SELECT COUNT(*) AS cnt FROM sqlite_master WHERE type='table' and name='authorize'`);
        if (rows[0].cnt === 1) {
            console.log('Table authorize already exist.');
        } else {
            await run(db)(`CREATE TABLE authorize
                (login TEXT PRIMARY KEY,
                pass TEXT NOT NULL);`);
        }
    } catch (err) {
        throw new Error("ERROR while creating authorize table")
    }
}

async function createTableUserAnswersIfNeeded(db: sqlite.Database): Promise<void> {
    try {
        const rows = await all(db)(`SELECT COUNT(*) AS cnt FROM sqlite_master WHERE type='table' and name='userAnswers'`);
        if (rows[0].cnt === 1) {
            console.log('Table userAnswers already exist.');
        } else {
            await run(db)(`CREATE TABLE userAnswers
                (quizId INTEGER NOT NULL,
                questionNum INTEGER NOT NULL,
                login TEXT NOT NULL,
                answer TEXT NOT NULL,
                time INTEGER NOT NULL,
                valid INTEGER NOT NULL,
                FOREIGN KEY (quizId) REFERENCES quiz (id),
                FOREIGN KEY (questionNum) REFERENCES quizQuestions (questionNum),
                FOREIGN KEY (login) REFERENCES authorize (login),
                PRIMARY KEY (quizId, questionNum, login));`);
        }
    } catch (err) {
        throw new Error("ERROR while creating userAnswers table")
    }
}

async function createTableLeaderboardIfNeeded(db: sqlite.Database): Promise<void> {
    try {
        const rows = await all(db)(`SELECT COUNT(*) AS cnt FROM sqlite_master WHERE type='table' and name='leaderboard'`);
        if (rows[0].cnt === 1) {
            console.log('Table leaderboard already exist.');
        } else {
            await run(db)(`CREATE TABLE leaderboard
                (quizId INTEGER NOT NULL,
                login TEXT NOT NULL,
                score TEXT NOT NULL,
                FOREIGN KEY (quizId) REFERENCES quiz (id),
                FOREIGN KEY (login) REFERENCES authorize (login),
                PRIMARY KEY (quizId, login));`);
        }
    } catch (err) {
        throw new Error("ERROR while creating leaderboard table")
    }
}

async function loadQuizes(db: sqlite.Database): Promise<void> {
    try {
        await addNewQuiz(db, quizJSON[0]);
        await addNewQuiz(db, quizJSON[1]);
    } catch (err) {
        throw new Error("ERROR while loading quiz")
    }
}

export async function create(){
    try {
        const db = new sqlite.Database('quiz.db');
        await createTableQuizIfNeeded(db);
        await createTableQuizQuestionsIfNeeded(db);
        await createTableAuthorizeIfNeeded(db);
        await createTableUserAnswersIfNeeded(db);
        await createTableLeaderboardIfNeeded(db);
        await addNewUser(db, "user1", "user1");
        await addNewUser(db, "user2", "user2");
        await loadQuizes(db);
    } catch (err) { console.log(err) }
}

create().
then(r => { console.log("TABLES OK") }).
catch(r => { console.log ("ERROR WHILE CREATING TABLES")})


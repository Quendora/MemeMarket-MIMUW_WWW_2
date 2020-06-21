import * as sqlite from "sqlite3";
const { promisify } = require("util");
const all = (db) => promisify((db.all.bind(db)));
const get = (db) => promisify((db.get.bind(db)));

interface ResponseAnswer {
    answer: string;
    timeSpent: number;
    penalty: number
}

export interface Response {
    answers: ResponseAnswer[]
}

function delay(ms: number) {
    return new Promise( resolve => setTimeout(resolve, ms) );
}

async function saveNewQuizInQuizTable(db: sqlite.Database, quiz: any): Promise<number> {
    let request: string;
    let params: string[];
    if (quiz.hasOwnProperty("id")) {
        request = `INSERT OR REPLACE INTO quiz (id, time, noQuestions, name) VALUES (?, ?, ?, ?);`
        params = [quiz['id'], quiz['time'], quiz['noQuestions'], quiz['name']]
    } else {
        request = `INSERT OR REPLACE INTO quiz (time, noQuestions, name) VALUES (?, ?, ?);`
        params = [quiz['time'], quiz['noQuestions'], quiz['name']]
    }

    return new Promise((resolve, reject) => {
        db.run(request, params,
            function (err) {
                if(err) {
                    if (err['code'] === 'SQLITE_BUSY') reject(err);
                    else reject(`DB Error while adding quiz to quiz table`);
                    return;
                }
                resolve(this.lastID);
            });
    });
}

export async function saveSingleQuizQuestion(db: sqlite.Database, ans: any, quizId: number): Promise<void> {
    try {
        await all(db)(`INSERT OR REPLACE INTO quizQuestions 
            (quizId, questionNum, question, corrAnswer, penalty) VALUES (?, ?, ?, ?, ?);`,
            quizId, ans['number'], ans['question'], ans['corrAnswer'], ans['penalty']);
    } catch (err) {
        if (err['code'] === 'SQLITE_BUSY') throw err;
        else throw new Error("ERROR while adding single answer");
    }
}

export async function addNewQuiz(db: sqlite.Database, quiz: any): Promise<void> {
    let quizId: number = 0;
    const questions: any[] = quiz["questions"];
    while (true) {
        try {
            await db.run(`BEGIN EXCLUSIVE TRANSACTION`);
            quizId = await saveNewQuizInQuizTable(db, quiz);
            for (const q of questions) await saveSingleQuizQuestion(db, q, quizId);
            await db.run(`COMMIT TRANSACTION`);
            await delay(200);
            break;
        } catch (err) {
            if (err['code'] === 'SQLITE_BUSY') {
                await db.run(`ROLLBACK`);
                await delay(500);
            } else throw err;
        }
    }
}


export async function addUserAnswers(db: sqlite.Database, answers: any, time: number,
     quizId: number, login: string): Promise<[number, number]> {
    let penaltySum: number = 0
    let timeSum: number = 0;
    try {
        const questions: any[] = await all(db)(`SELECT questionNum, corrAnswer
            FROM quizQuestions WHERE quizId = ? ORDER BY questionNum ASC;`, quizId);

        for (let i: number = 0; i < answers.length; i++) {
            const q: ResponseAnswer = answers[i];
            penaltySum += q["penalty"];
            timeSum += q["timeSpent"];
            const valid: number = q['answer'] === questions[i]['corrAnswer'] ? 1 : 0;
            await all(db)(`INSERT OR REPLACE INTO userAnswers 
            (quizId, questionNum, login, answer, time, valid) VALUES (?, ?, ?, ?, ?, ?);`,
                quizId, i, login, q['answer'], q["timeSpent"], valid);
        }
        return [penaltySum, timeSum];
    } catch (err) {
        if (err['code'] === 'SQLITE_BUSY') throw err;
        else throw new Error("ERROR while adding user answers");
    }
}

export async function addToLeaderboard(db: sqlite.Database, quizId: number,
   login: string, score: number): Promise<void> {
    try {
        await all(db)(`INSERT OR REPLACE INTO leaderboard (quizId, login, score) VALUES (?, ?, ?);`,
            quizId, login, score);
    } catch (err) {
        if (err['code'] === 'SQLITE_BUSY') throw err;
        else throw err;
    }
}

export async function saveUserQuiz(db: sqlite.Database, userAns: any, time: number,
   quizId: number, login: string): Promise<void> {
    while (true) {
        try {
            const quizHeader = await get(db)(`SELECT * FROM quiz WHERE id = ?;`, quizId);
            await db.run(`BEGIN EXCLUSIVE TRANSACTION`);
            const [penaltySum, timeSum] = await addUserAnswers(db, userAns, time, quizId, login);
            await addToLeaderboard(db, quizId, login, quizHeader["time"] - timeSum - penaltySum);
            await db.run(`COMMIT TRANSACTION`);
            break;
        } catch (err) {
            if (err['code'] === 'SQLITE_BUSY') {
                await db.run(`ROLLBACK`);
                await delay(500);
            } else throw err;
        }
    }
}

export async function getQuizList(db: sqlite.Database, login: string): Promise<any[]> {
    try {
        return await all(db)(`SELECT id, name FROM quiz WHERE id NOT IN 
            (SELECT quizId FROM leaderboard WHERE login = ?);`, login);
    } catch (err) {
        throw new Error("ERROR while getting quiz list");
    }
}

export async function getQuizJSON(db: sqlite.Database, quizId: number): Promise<object> {
    try {
        const quizHeader = await get(db)(`SELECT * FROM quiz WHERE id = ?;`, quizId);
        const questions: any[] = await all(db)(`SELECT questionNum, question, corrAnswer, penalty
            FROM quizQuestions WHERE quizId = ? ORDER BY questionNum ASC;`, quizId);
        const id = quizHeader['id'];
        const time = quizHeader['time'];
        const noQuestions = quizHeader['noQuestions'];
        const name = quizHeader['name'];
        return { id, time, noQuestions, name, questions }
    } catch (err) {
        throw new Error("ERROR while getting quiz JSON");
    }
}

export async function checkAnswersValidity(db: sqlite.Database, quizId: number,
    answers: ResponseAnswer[], time: number): Promise<Response> {
    try {
        const questions: any[] = await all(db)(`SELECT questionNum, question, corrAnswer, penalty
            FROM quizQuestions WHERE quizId = ? ORDER BY questionNum ASC;`, quizId);

        const response: Response = new class implements Response {
            answers: ResponseAnswer[];
            id: number;
        }
        response.answers = [];

        for (let i: number = 0; i < answers.length; i++) {
            const responseAns = new class implements ResponseAnswer {
                answer: string;
                timeSpent: number;
                penalty: number;
            }
            responseAns.answer = answers[i].answer;
            responseAns.timeSpent = Math.round(answers[i].timeSpent * time / 100);
            responseAns.penalty = answers[i].answer === questions[i].corrAnswer ? 0 : questions[i].penalty;
            response.answers.push(responseAns);
        }
        return response;

    } catch (err) {
        throw new Error("ERROR while getting quiz JSON");
    }
}

export async function makeQuizSummary(db: sqlite.Database, quizId: number, login: string): Promise<object> {
    try {
        const quizHeader = await get(db)(`SELECT time FROM quiz WHERE id = ?;`, quizId);
        const questions: any[] = await all(db)(`SELECT question, corrAnswer, penalty
            FROM quizQuestions WHERE quizId = ? ORDER BY questionNum ASC;`, quizId);
        const userAnswers: any[] = await all(db)(`SELECT answer, time FROM userAnswers 
            WHERE quizId = ? AND login = ? ORDER BY questionNum ASC;`, quizId, login);
        let timeSum: number = 0;

        const quizSummary: object[] = [];
        for (let i: number = 0; i < questions.length; i++) {
            const singleSummary = {
                question: questions[i].question,
                answer: userAnswers[i].answer,
                time: userAnswers[i].time,
                penalty: questions[i].corrAnswer === userAnswers[i].answer ? -1 : questions[i].penalty
            }
            timeSum += userAnswers[i].time;
            quizSummary.push(singleSummary);
        }

        return { answers: quizSummary, timeLeft: quizHeader['time'] - timeSum }

    } catch (err) {
        throw new Error("ERROR while getting quiz JSON");
    }
}

export async function getUserQuizzesList(db: sqlite.Database, login: string): Promise<any[]> {
    try {
        return await all(db)(`SELECT userQuiz.quizId AS id, quiz.name AS name FROM 
            (SELECT quizId FROM leaderboard WHERE login = ?) AS userQuiz
            LEFT JOIN (SELECT id, name FROM quiz) AS quiz ON userQuiz.quizid = quiz.id;`, login);
    } catch (err) {
        throw new Error("ERROR while getting user quizzes list");
    }
}

async function fillSummaryWithUserStats(db: sqlite.Database, result: object,
    questions: any[], userAnswers: any[], quizId: number): Promise<void> {

    try {
        const avgTimes: any[] = await all(db)(`SELECT questionNum, AVG(time) AS avg FROM userAnswers 
        WHERE quizId = ? AND valid = ? GROUP BY questionNum ORDER BY questionNum ASC`, quizId, 1);

        let j: number = 0;
        let avg;
        for (let i: number = 0; i < questions.length; i++) {
            if (j < avgTimes.length && avgTimes[j].questionNum === i) {
                avg = avgTimes[j].avg;
                j++;
            } else avg = -1;
            result['userStats'].push({
                question: questions[i].question,
                answer: userAnswers[i].answer,
                corrAnswer: questions[i].corrAnswer,
                time: userAnswers[i].time,
                avg: avg,
                penalty: questions[i].penalty,
                valid: userAnswers[i].valid === 1
            })
        }
    } catch(err) {
        throw err;
    }
}

async function fillSummaryWithBestStats(db: sqlite.Database, result: object,
    questions: any[], userAnswers: any[], bestUsers: any[], quizId: number): Promise<void> {

    try {
        const bestAnswers: any[] = await all(db)(`SELECT login, answer, time
            FROM userAnswers WHERE quizId = ? AND login IN 
            (SELECT login FROM leaderboard 
            WHERE quizId = ? ORDER BY score DESC LIMIT 5)
            ORDER BY login, questionNum ASC;`, quizId, quizId);

        for (let i: number = 0; i < bestUsers.length; i++) {
            result['bestStats'].push({
                login: bestUsers[i]['login'],
                score: bestUsers[i]['score'],
                stats: []
            })

            let k: number;
            for (k = 0; k < bestAnswers.length; k += questions.length)
                if (bestAnswers[k]['login'] === bestUsers[i]['login']) break;

            for (let j: number = 0; j < questions.length; j++) {
                result['bestStats'][i]["stats"].push({
                    question: questions[j].question,
                    time: bestAnswers[k + j]['time']
                })
            }
        }
    } catch(err) {
        throw new Error("ERROR while summarizing best stats")
    }
}


export async function makeQuizSummaryWithStatistics(db: sqlite.Database, login: string, quizId: number): Promise<object> {
    try {
        const questions: any[] = await all(db)(`SELECT question, corrAnswer, penalty
            FROM quizQuestions WHERE quizId = ? ORDER BY questionNum ASC;`, quizId);
        const userAnswers: any[] = await all(db)(`SELECT answer, valid, time FROM userAnswers 
            WHERE quizId = ? AND login = ? ORDER BY questionNum ASC;`, quizId, login);
        const bestUsers: any[] = await all(db)(`SELECT login, score FROM leaderboard 
            WHERE quizId = ? ORDER BY score DESC LIMIT 5;`, quizId);
        const score = await get(db)(`SELECT score FROM leaderboard 
            WHERE quizId = ? AND login = ?;`, quizId, login);

        const result: object = {
            score: score['score'],
            userStats: [],
            bestStats: []
        };

        await fillSummaryWithBestStats(db, result, questions, userAnswers, bestUsers, quizId);
        await fillSummaryWithUserStats(db, result, questions, userAnswers, quizId);

        return result;

    } catch (err) {
        throw err
    }
}

export async function checkIfUserSolvedQuiz(db: sqlite.Database, login: string, quizId: number): Promise<boolean> {
    try {
        return await get(db)(`SELECT * FROM leaderboard WHERE login = ? AND quizId = ?`, login, quizId);
    } catch (err) {
        throw new Error("ERROR while checking if user solved quiz");
    }
}

export function checkTextValidity(txt: string): boolean {
    for (const char of txt)
        if ((char >= '0' && char <= '9') || (char >= 'a' && char <= 'z') || (char >= 'A' && char <= 'Z')) {
            return true;
        }
    throw new Error("Invalid");
}

export function checkNumberValidity(txt: string): boolean {
    for (const char of txt)
        if (!(char >= '0' && char <= '9')) {
            throw new Error("Invalid");
        }
    return true;
}

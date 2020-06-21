import * as sqlite from "sqlite3";
import {log} from "util";
const { promisify } = require("util");
const all = (db) => promisify((db.all.bind(db)));
const get = (db) => promisify((db.get.bind(db)));

const CryptoTS = require("crypto-ts");
const supertajnyklucz = "supertajnyklucz123";

export async function addNewUser(db: sqlite.Database, login: string, pass: string): Promise<void> {
    const encryptedPass = CryptoTS.AES.encrypt(pass, supertajnyklucz).toString();

    try {
        await all(db)(`INSERT OR REPLACE INTO authorize (login, pass) VALUES (?, ?);`, login, encryptedPass);
    } catch (err) {
        throw new Error("ERROR while creating new user " + login);
    }
}

export async function checkIfUserExists(db: sqlite.Database, login: string, pass: string): Promise<boolean> {
    try {
        const row = await get(db)(`SELECT * FROM authorize WHERE login = ?;`, login);
        if (row == null || !row.hasOwnProperty('pass')) return false;
        return CryptoTS.AES.decrypt(row["pass"], supertajnyklucz).toString(CryptoTS.enc.Utf8) === pass;
    } catch (err) {
        throw new Error("ERROR while checking if user exists");
    }
}

async function saveNewPassInDb(db: sqlite.Database, login: string, pass: string): Promise<void> {
    try {
        await addNewUser(db, login, pass);
    } catch (err) {
        throw new Error("ERROR while saving new password");
    }
}

async function deleteAllUserSessions(login: string): Promise<void> {
    let db = null;
    try {
        db = new sqlite.Database('sessions');
        const searchFor: string = "%\"authorised\":\"" + login + "\"%";
        await all(db)(`DELETE FROM sessions WHERE sess LIKE ?;`, searchFor);
    } catch (err) {
        throw new Error("ERROR while deleting all user sessions");
    } finally {
        if (db) db.close();
    }
}

export async function changePassword(db: sqlite.Database, login: string, reqBody: any) {
    const oldpassword: string = reqBody.oldpassword || '';
    const newpassword1: string = reqBody.newpassword1 || '';
    const newpassword2: string = reqBody.newpassword2 || '';
    const errors: { oldpassword?: string, newpassword1?: string, newpassword2?: string } = {}

    if (oldpassword === '') {
        errors["oldpassword"] = "Hasło nie może być puste";
    } else if (! (await checkIfUserExists(db, login, oldpassword))) {
        errors["oldpassword"] = "Błędne hasło";
    }

    if (newpassword1 === '') {
        errors["newpassword1"] = "Hasło nie może być puste";
    }

    if (newpassword2 === '') {
        errors["newpassword2"] = "Hasło nie może być puste";
    } else if (newpassword1 !== newpassword2) {
        errors["newpassword2"] = "Hasła do siebie nie pasują";
    }

    if (Object.keys(errors).length === 0) {
        await saveNewPassInDb(db, login, newpassword1);
        await deleteAllUserSessions(login);
    }

    return {errors: errors, values: {oldpassword: oldpassword,
            newpassword1: newpassword1, newpassword2: newpassword2}};
}

export async function checkIfUserStartedQuiz(readDb: sqlite.Database, quizId: string, login: string): Promise<boolean> {
    let db = null;
    try {
        db = new sqlite.Database('sessions');
        const searchForQuiz: string = "%\"" + quizId + "\":%";
        const searchForUser: string = "%\"authorised\":\"" + login + "\"%";
        const rows: any[] = await all(db)(`SELECT * FROM sessions WHERE sess LIKE ? AND sess LIKE ?;`,
            searchForQuiz, searchForUser);
        if (!rows) return false;

        const quizHeader = await get(readDb)(`SELECT * FROM quiz WHERE id = ?;`, quizId);
        const regex = "\"" + quizId + "\":([0-9]+)"
        let mostRecentTime: number = 0;

        for (const row of rows) mostRecentTime = Math.max(mostRecentTime, row["sess"].match(regex)[1]);

        return quizHeader['time'] > (Date.now() - mostRecentTime) / 1000
    } catch (err) {
        throw new Error("ERROR while checking if user started quiz");
    } finally {
        if (db) db.close();
    }
}

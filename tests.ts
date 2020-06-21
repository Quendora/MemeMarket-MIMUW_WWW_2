import { expect } from 'chai';
import {driver, Builder, ThenableWebDriver, WebDriver, IWebDriverOptionsCookie} from "mocha-webdriver";

const path = 'http://localhost:1500/';

function delay(ms: number) {
    return new Promise( resolve => setTimeout(resolve, ms) );
}

async function logIn(driv: WebDriver, login: string, pass: string) {
    await driv.find('#usr_panel').click();
    await driv.find('#log').sendKeys(login);
    await driv.find('#pass').sendKeys(pass);
    await driv.find('#zaloguj').click();
}

describe('punkt 2 - zmieniamy haslo i sprawdzamy czy uzytkownicy zostali wylogowani', function () {
    let driver1: ThenableWebDriver = undefined;
    let driver2: ThenableWebDriver = undefined;

    beforeEach(async function() {
        this.timeout(10000);
        driver1 = new Builder().forBrowser('firefox').build();
        driver2 = new Builder().forBrowser('firefox').build();
        await driver1.get(path);
        await logIn(driver1, "user1", "user1");
    });

    afterEach(async function() {
        await driver1.close();
        await driver2.close();
        driver1 = undefined;
        driver2 = undefined;
    });

    it('zmieniamy haslo i sprawdzamy czy uztykownicy są wylogowani', async function() {
        let cookieS1: IWebDriverOptionsCookie = await driver1.manage().getCookie("connect.sid");
        await driver1.manage().deleteCookie("connect.sid");

        await driver2.get(path);
        await logIn(driver2, "user1", "user1");

        await driver2.find('#usr_panel').click();
        await driver2.find('#changePass').click();
        await driver2.find('#oldpassword').sendKeys("user1");
        await driver2.find('#newpassword1').sendKeys("user1");
        await driver2.find('#newpassword2').sendKeys("user1");
        await driver2.find('[type=submit]').click();

        expect(await driver2.find('#usr_name').getText()).to.be.equal("Guest");

        await driver1.manage().addCookie({ name: cookieS1.name, value: cookieS1.value });
        await driver1.navigate().refresh();
        expect(await driver1.find('#usr_name').getText()).to.be.equal("Guest");
    });
});

describe('punkt 3 - przechodzimy quiz i sprawdzamy czy czasy wyslane przez serwer sa (w przyblizeniu) dobre', function () {

    beforeEach(async function() {
        this.timeout(10000);
        await driver.get(path);
        await logIn(driver, "user2", "user2");
    });

    it('sprawdzamy, czy czas wyslany przez serwer sie zgadza', async function() {
        expect(await driver.find('#start_quiz')).to.be.not.null;
        await driver.find('#start_quiz').click();
        await driver.find('li[class="quizToChoose"]').click();

        let times: number[] = []
        let qNum: number = 0;

        while (await driver.find('#stop_quiz').getAttribute("disabled")) {
            await driver.find("#answer_text").sendKeys(123);
            await delay((qNum + 1) * 700);
            times.push((qNum + 1) * 0.7);
            await driver.find('#next_question').click();
            qNum++;
        }

        await driver.find('#stop_quiz').click();

        for (let i: number = 0; i < qNum; i++) {
            let time: number = parseInt(await driver.find('#answTime' + i).getText(), 10);
            expect(time >= times[i] - 1.5 && time <= times[i] + 1.5).to.be.true;
        }

        expect(await driver.find('#summaryView').isDisplayed()).to.be.true;
    });
});

describe('punkt 6 - nie da sie 2 razy rozwiazac tego samego quizu', function () {
    let driver1: ThenableWebDriver = undefined;
    let driver2: ThenableWebDriver = undefined;

    beforeEach(async function() {
        this.timeout(10000);
        driver1 = new Builder().forBrowser('firefox').build();
        driver2 = new Builder().forBrowser('firefox').build();
        await driver1.get(path);
        await driver2.get(path);

        await logIn(driver2, "user1", "user1");
        await logIn(driver1, "user1", "user1");
    });

    afterEach(async function() {
        await driver1.close();
        await driver2.close();
        driver1 = undefined;
        driver2 = undefined;
    });

    it('nie da sie rozpoczac quizu ktory zostal juz rozpoczety', async function() {
        expect(await driver2.find('#start_quiz')).to.be.not.null;
        await driver2.find('#start_quiz').click();

        expect(await driver1.find('#start_quiz')).to.be.not.null;
        await driver1.find('#start_quiz').click();

        await driver2.find('li[class="quizToChoose"]').click();
        expect(await driver2.find('#cancel_quiz').isDisplayed()).to.be.true;

        await driver1.find('li[class="quizToChoose"]').click();
        expect(await driver1.find('#error_mess').isDisplayed()).to.be.true;

        await driver2.find('#cancel_quiz').click();
    });
});
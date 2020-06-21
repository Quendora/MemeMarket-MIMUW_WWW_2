// import { quizJSON } from "./quizJson.js";
import {Answer, QuizViewManager} from "./quizViewManager.js";
import { SummaryViewManger } from "./summaryViewManger.js";
// import { QuizManager } from "../server/quizManager.js";
// import { BestResultsViewManager } from "./bestResultsViewManager.js";
//
// let mainView: HTMLInputElement = document.getElementById("mainView") as HTMLInputElement;
const quizView: HTMLInputElement = document.getElementById("quizView") as HTMLInputElement;
const chooseQuiz: HTMLInputElement = document.getElementsByClassName("chooseQuiz")[0] as HTMLInputElement;
const summaryView: HTMLInputElement = document.getElementById("summaryView") as HTMLInputElement;
// let bestResultsView: HTMLInputElement = document.getElementById("bestResultsView") as HTMLInputElement;
//
const homeButton: HTMLInputElement = document.getElementById('home') as HTMLInputElement;
const nextQuestionButton: HTMLInputElement = document.getElementById("next_question") as HTMLInputElement;
const previousQuestionButton: HTMLInputElement = document.getElementById("previous_question") as HTMLInputElement;
const stopButton: HTMLInputElement = document.getElementById("stop_quiz") as HTMLInputElement;
const cancelButton: HTMLInputElement = document.getElementById("cancel_quiz") as HTMLInputElement;
const answerInput: HTMLInputElement = document.getElementById("answer_text") as HTMLInputElement;
const error: HTMLInputElement = document.getElementById("error") as HTMLInputElement;
// let showBestResultButton: HTMLInputElement = document.getElementById("best_results") as HTMLInputElement;
// let goBackToMainViewButton: HTMLInputElement = document.getElementById("goBackToMainView") as HTMLInputElement;
// let saveScoreButton: HTMLInputElement = document.getElementById("save_score") as HTMLInputElement;
// let saveStatisticsButton: HTMLInputElement = document.getElementById("save_statistics") as HTMLInputElement;
//
// let quizViewManager: QuizViewManager, summaryViewManger: SummaryViewManger, indexedDBManager: QuizManager = new QuizManager();
let quizViewManager: QuizViewManager;
let summaryViewManger: SummaryViewManger;

const elements = document.getElementsByClassName("quizToChoose");
let csrfToken;

for (let i = 0; i < elements.length; i++) {
    const elem = elements[i] as HTMLInputElement;
    elem.addEventListener("click", async (event: MouseEvent) => {
        const quizNum = elem.getElementsByTagName('p')[0].innerHTML;
        const quizResponse = await fetch('/quiz/' + quizNum, {method: 'GET'});
        const quiz = await quizResponse.json();

        if (quiz.hasOwnProperty("error")) {
            error.style.display = "inline";
        } else {
            csrfToken = quizResponse.headers.get('CSRF-Header');
            chooseQuiz.style.display = "none";
            quizView.style.display = "grid";

            quizViewManager = new QuizViewManager(quiz,
                nextQuestionButton, previousQuestionButton, stopButton, cancelButton);

            quizViewManager.startQuiz();
        }
        chooseQuiz.style.display = "none";
    });
}

cancelButton.addEventListener("click", async (event: MouseEvent) => {
    quizViewManager.stopQuiz();

    await fetch('/cancel/' + quizViewManager.quizJSON['id'], {
        method: 'POST',
        headers: {'CSRF-Token': csrfToken},
    });

    homeButton.click();
});

document.onkeydown = function (e: KeyboardEvent) {
    if (quizView.style.display === "grid") {

        if (e.key === "Enter" || e.key === "ArrowRight") {
            if (nextQuestionButton.disabled) {
                if (! stopButton.disabled && e.key === "Enter") stopButton.click();
            } else nextQuestionButton.click();
        } else if (e.key === "ArrowLeft" && !previousQuestionButton.disabled) {
            previousQuestionButton.click();
        }
    }
};

stopButton.addEventListener("click", async(event: MouseEvent) => {
    quizViewManager.stopQuiz();
    const answers: Answer[] = quizViewManager.answers;
    const quiz = quizViewManager.quizJSON;
    const quizTime = quiz['time'] - quizViewManager.timeLeft;

    for (let i: number = 0; i < answers.length; i++)
        answers[i].timeSpent = Math.round(answers[i].timeSpent * 100 / quizTime);

    const res = await fetch('/submit/' + quiz['id'], {
        method: 'POST',
        headers: {"Content-Type": "application/json", 'CSRF-Token': csrfToken},
        body: JSON.stringify(answers)
    });

    const quizSummary: Object = await res.json();

    if (quizSummary.hasOwnProperty("error")) {
        error.style.display = "inline";
    } else {
        summaryViewManger = new SummaryViewManger(quizSummary);
        summaryViewManger.summary();

        summaryView.style.display = "grid";
    }
    quizView.style.display = "none";
});

answerInput.addEventListener("input", (event: MouseEvent) => {
    quizViewManager.handleAnswerInput();
});

nextQuestionButton.addEventListener("click", (event: MouseEvent) => {
    quizViewManager.nextQuestion();
});

previousQuestionButton.addEventListener("click", (event: MouseEvent) => {
    quizViewManager.previousQuestion();
});
export { QuizViewManager, Answer };

class Answer {
    answer: string;
    timeSpent: number;

    constructor() {
        this.answer = "";
        this.timeSpent = 0;
    }
}

class QuizViewManager {
    quizJSON;
    answers: Answer[];
    currentQuestionNumber: number;
    lastMeasuredTime: number;
    numberOfQuestions:number;

    nextQuestionButton: HTMLInputElement;
    previousQuestionButton: HTMLInputElement;
    stopButton: HTMLInputElement;
    cancelButton: HTMLInputElement;

    answerField: HTMLInputElement;

    timer;
    timeout;
    timeLeft: number;

    constructor(quizJSON, nextQuestionButton: HTMLInputElement, previousQuestionButton: HTMLInputElement,
                stopButton: HTMLInputElement, cancelButton: HTMLInputElement) {
        this.quizJSON = quizJSON;
        this.nextQuestionButton = nextQuestionButton;
        this.previousQuestionButton = previousQuestionButton;
        this.stopButton = stopButton;
        this.cancelButton = cancelButton;

        this.numberOfQuestions = parseInt(quizJSON["noQuestions"], 10);
        this.currentQuestionNumber = 0;
        this.lastMeasuredTime = undefined;
        this.answers = new Array(this.numberOfQuestions);

        this.answerField = document.getElementById("answer_text") as HTMLInputElement;

        for (let i: number = 0; i < this.numberOfQuestions; i++) {
            (this.answers)[i] = new Answer();
        }
    }

    private saveAnswerForQuestion() {
        this.answerField.value = this.answerField.value.replace(/\D+/g, "");
        this.answers[this.currentQuestionNumber].answer = this.answerField.value;
    }

    private countTimeForQuestion() {
        const endTime: number = performance.now();
        const secondsSpent: number = Math.round((endTime - this.lastMeasuredTime) / 1000);

        this.answers[this.currentQuestionNumber].timeSpent += secondsSpent;
    }

    private getTimeStringAndSet(time: number, remainingTime: HTMLInputElement) {
        remainingTime.innerHTML = new Date(1000 * time).toISOString().substr(14, 5);
    }

    private doTimeout(counter: number) {
        this.timeLeft = counter;

        const remainingTime: HTMLInputElement = document.getElementById("remaining_time_num") as HTMLInputElement;
        this.getTimeStringAndSet(this.timeLeft, remainingTime);

        this.timer = setInterval(() => {
            this.timeLeft = this.timeLeft - 1;
            this.getTimeStringAndSet(this.timeLeft, remainingTime);
        }, 1000);

        this.timeout = setTimeout(() => {
            clearInterval(this.timer);
            this.getTimeStringAndSet(0, remainingTime);

            if (this.stopButton.disabled) this.stopButton.disabled = false;
            console.log("click");
            this.stopButton.click();
        }, counter * 1000);
    }

    private appendInnerText(id: string, text: any) {
        const htmlElement: HTMLInputElement = document.getElementById(id) as HTMLInputElement;
        htmlElement.innerHTML = text;
    }

    private appendQuestion() {
        const questionNumber: number = this.currentQuestionNumber;
        this.appendInnerText("question_num_num", questionNumber + 1);

        this.appendInnerText("penalty_num", this.quizJSON['questions'][questionNumber]['penalty']);
        this.appendInnerText("question_text", this.quizJSON['questions'][questionNumber]['question']);
        const answerText: HTMLInputElement = document.getElementById("answer_text") as HTMLInputElement;

        answerText.value = (this.answers)[this.currentQuestionNumber].answer;
        this.answerField.focus()
    }

    private setButtons() {
        this.nextQuestionButton.disabled = false;
        this.previousQuestionButton.disabled = false;

        switch (this.currentQuestionNumber) {
            case this.numberOfQuestions - 1:
                this.nextQuestionButton.disabled = true;
                break;
            case 0:
                this.previousQuestionButton.disabled = true;
                break;
            default:
                this.nextQuestionButton.disabled = false;
                this.previousQuestionButton.disabled = false;
                break;
        }
    }

    private changeQuestion(nextQuestion: boolean) {
        this.countTimeForQuestion();

        if (nextQuestion) this.currentQuestionNumber++;
        else this.currentQuestionNumber--;

        this.lastMeasuredTime = performance.now();
        this.appendQuestion()

        this.setButtons();
    }

    private checkStopButton() {
        let disableStopButton: boolean = false;

        for (const answer of this.answers) {
            if (answer.answer === "") {
                disableStopButton = true;
            }
        }

        this.stopButton.disabled = disableStopButton;
    }

    stopQuiz() {
        this.countTimeForQuestion();
        clearInterval(this.timer);
        clearTimeout(this.timeout);
    }

    handleAnswerInput() {
        this.saveAnswerForQuestion();
        this.checkStopButton();
    }

    previousQuestion() {
        this.changeQuestion(false);
    }

    nextQuestion() {
        this.changeQuestion(true);
    }

    startQuiz() {
        this.stopButton.disabled = true;
        console.log("lol")

        this.appendInnerText("quizViewHeader", "<b>" + this.quizJSON['name'] + "</b>");
        this.appendInnerText("num_of_questions_num", this.numberOfQuestions);

        this.setButtons();

        this.lastMeasuredTime = performance.now();
        this.appendQuestion();
        this.doTimeout(this.quizJSON['time']);
    }
}

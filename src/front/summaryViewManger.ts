export { SummaryViewManger }

class SummaryViewManger {
    answers: object[];
    tableBody: HTMLInputElement;
    penaltySum: number;
    timeLeft: number;

    constructor(quizSummary: object) {
        this.answers = quizSummary['answers'];
        this.timeLeft = quizSummary['timeLeft'];
        this.penaltySum = 0;
        this.tableBody = document.getElementById("summaryTableBody") as HTMLInputElement;
    }

    private createTdAndAppend(innerText: any, tr: HTMLTableRowElement, num: number) {
        const td: HTMLTableDataCellElement = document.createElement("td");
        td.innerText = innerText;
        td.style.border = "2px solid black";
        td.style.borderCollapse = "collapse";

        if (num !== -1) td.id = "answTime" + num;

        tr.appendChild(td);
    }

    private showSingleAnswerSummary(questionNumber: number) {
        const singleSummary: object = (this.answers)[questionNumber];

        const tr: HTMLTableRowElement = document.createElement("tr");

        this.createTdAndAppend(singleSummary['question'], tr, -1);
        this.createTdAndAppend(singleSummary['answer'], tr, -1);
        this.createTdAndAppend(singleSummary['time'], tr, questionNumber);

        if (singleSummary['penalty'] !== -1) {
            this.penaltySum += singleSummary["penalty"];
            this.createTdAndAppend(singleSummary["penalty"], tr, -1);
            tr.style.backgroundColor = "#f1807d";
        } else {
            tr.style.backgroundColor = "lightgreen";
        }

        this.tableBody.appendChild(tr);
    }

    private appendInnerBoldText(id: string, text: string) {
        const htmlElement: HTMLInputElement = document.getElementById(id) as HTMLInputElement;
        htmlElement.innerHTML = "<b>" + text + "</b>";
    }


    summary() {
        this.tableBody.textContent = "";
        this.appendInnerBoldText("timeLeft", "POZOSTAŁY CZAS: " + this.timeLeft);

        for (let i: number = 0; i < this.answers.length; i++) {
            this.showSingleAnswerSummary(i);
        }

        this.appendInnerBoldText("penaltySum", "SUMA KARY: " + this.penaltySum);
        this.appendInnerBoldText("totalScore", "WYNIK: " + (this.timeLeft - this.penaltySum));

    }
}
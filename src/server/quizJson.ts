const jsonString: string = '{\n' +
    '    "quiz": [\n' +
    '    {\n' +
    '      "id" : "1",\n' +
    '      "name" : "Liczyć każdy może",\n' +
    '      "time" : "30",\n' +
    '      "noQuestions" : "5",\n' +
    '      "questions" : [\n' +
    '        {\n' +
    '          "number": 1,\n' +
    '          "question": "2 + 3 =",\n' +
    '          "corrAnswer": "5",\n' +
    '          "penalty" : 5\n' +
    '        },\n' +
    '        {\n' +
    '          "number": 2,\n' +
    '          "question": "12 * 12 =",\n' +
    '          "corrAnswer": "144",\n' +
    '          "penalty" : 8\n' +
    '        },\n' +
    '        {\n' +
    '          "number": 3,\n' +
    '          "question": "7 * 8 =",\n' +
    '          "corrAnswer": "56",\n' +
    '          "penalty" : 5\n' +
    '        },\n' +
    '        {\n' +
    '          "number": 4,\n' +
    '          "question": "15 * 16 =",\n' +
    '          "corrAnswer": "240",\n' +
    '          "penalty" : 10\n' +
    '        },\n' +
    '        {\n' +
    '          "number": 5,\n' +
    '          "question": "0 / 2 =",\n' +
    '          "corrAnswer": "0",\n' +
    '          "penalty" : 6\n' +
    '        }\n' +
    '      ]\n' +
    '    },\n' +
    '    {\n' +
    '      "id" : "2",\n' +
    '      "name" : "Wciąż można liczyć",\n' +
    '      "time" : "40",\n' +
    '      "noQuestions" : "6",\n' +
    '      "questions" : [\n' +
    '        {\n' +
    '          "number": 1,\n' +
    '          "question": "13 * 13 =",\n' +
    '          "corrAnswer": "169",\n' +
    '          "penalty" : 4\n' +
    '        },\n' +
    '        {\n' +
    '          "number": 2,\n' +
    '          "question": "2^6 =",\n' +
    '          "corrAnswer": "64",\n' +
    '          "penalty" : 3\n' +
    '        },\n' +
    '        {\n' +
    '          "number": 3,\n' +
    '          "question": "1 * 1 =",\n' +
    '          "corrAnswer": "1",\n' +
    '          "penalty" : 5\n' +
    '        },\n' +
    '        {\n' +
    '          "number": 4,\n' +
    '          "question": "10 * 10 =",\n' +
    '          "corrAnswer": "100",\n' +
    '          "penalty" : 4\n' +
    '        },\n' +    '        ' +
    '        {\n' +
    '          "number": 5,\n' +
    '          "question": "3^4 =",\n' +
    '          "corrAnswer": "81",\n' +
    '          "penalty" : 3\n' +
    '        },\n' +
    '        {\n' +
    '          "number": 6,\n' +
    '          "question": "0 * 1 =",\n' +
    '          "corrAnswer": "0",\n' +
    '          "penalty" : 5\n' +
    '        }\n' +
    '      ]\n' +
    '    }\n' +
    '  ]\n' +
    '}'

const quizJSON: JSON = JSON.parse(jsonString).quiz;

export { quizJSON };
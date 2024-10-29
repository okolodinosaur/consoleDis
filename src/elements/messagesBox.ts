import * as blessed from "blessed";

export function getErrorMessageBox(message: string) {
    const errorBox = blessed.box({
        name: "errorBox",
        label: "Error",
        top: `center`,
        left: `center`,
        width: 34,
        height: 7,
        tags: true,
        style: {
            fg: "white",
            border: {
                fg: "red",
            },
            focus: {
                bg: "magenta",
                border: {
                    fg: "red",
                },
            },
        },
        border: {
            type: "line",
        },
        focusable: true,
        content: message + "!\n\n\n  Press CTRL+C",
        padding: { left: 2, top: 1 },
    });

    return errorBox;
}

export function getQuestionBox() {
    const question = blessed.question({
        name: "question",
        top: `center`,
        left: `center`,
        width: 34,
        height: 7,
        tags: true,
        style: {
            fg: "white",
            border: {
                fg: "red",
            },
            focus: {
                bg: "magenta",
                border: {
                    fg: "red",
                },
            },
        },
        border: {
            type: "line",
        },
        focusable: true,
        padding: { left: 2, top: 1 },
    });

    return question;
}

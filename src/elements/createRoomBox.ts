import * as blessed from "blessed";

export const createRoomBox = blessed.box({
    name: "createRoomBox",
    label: "New room",
    top: `center`,
    left: `center`,
    width: 30,
    height: 5, // +2 to list items amount
    tags: true,
    style: {
        fg: "white",
        border: {
            fg: "yellow",
        },
        focus: {
            bg: "magenta",
            border: {
                fg: "green",
            },
        },
    },
    border: {
        type: "line",
    },
    focusable: true,
});

const inputBox = blessed.textbox({
    name: "inputBox",
    top: "center",
    left: "center",
    width: "80%",
    height: 3,
    border: {
        type: "line",
    },
    label: "Enter name:",
    style: {
        border: {
            fg: "cyan",
        },
        focus: {
            border: {
                fg: "green",
            },
        },
    },
    input: true,
});

createRoomBox.append(inputBox);

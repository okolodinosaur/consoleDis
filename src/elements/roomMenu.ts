import * as blessed from "blessed";

export const roomMenuBox = blessed.box({
    name: "roomMenuBox",
    top: 15,
    left: 1,
    width: "200",
    height: 6, // +2 to list items amount
    label: "Menu",
    style: {
        fg: "white",
        bg: "black",
        border: {
            fg: "yellow",
        },
        focus: {
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

const buttons = ["Create", "Join"].map((text, index) => {
    const button = blessed.button({
        name: text,
        content: text,
        width: "40%",
        height: 1,
        padding: { left: 2 },
        shrink: false,
        style: {
            bg: "blue",
            bold: true,
            focus: {
                bg: "cyan",
            },
            hover: {
                bg: "red",
            },
        },
        top: Math.floor(index / 2) * 2,
        left: (index % 2) * 14,
    });

    roomMenuBox.append(button);
    return button;
});

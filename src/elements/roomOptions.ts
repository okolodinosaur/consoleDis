import * as blessed from "blessed";

export function createRoomOptionsBox(ofTop: number) {
    const roomOptionsBox = blessed.box({
        name: "roomOptionsBox",
        label: "Options",
        top: `10+${ofTop}`,
        left: 15,
        width: 10,
        height: 6, // +2 to list items amount
        style: {
            fg: "white",
            bg: "blue",
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

    const list = blessed.list({
        name: "options",
        parent: roomOptionsBox,
        left: 0,
        width: "100%-2",
        height: "100%-2",
        items: ["Enter", "Exit", "Remove", "Back"],
        style: {
            selected: {
                bg: "green",
                fg: "white",
            },
            item: {
                fg: "white",
                bg: "blue",
            },
        },
    });

    roomOptionsBox.append(list);

    return roomOptionsBox;
}

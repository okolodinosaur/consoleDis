import * as blessed from "blessed";

export const roomListBox = blessed.box({
    name: "roomListBox",
    top: "10",
    left: 1,
    width: "200",
    height: 15, // +2 to list items amount
    label: "Rooms",
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
    name: "roomList",
    parent: roomListBox,
    left: 0,
    width: "100%-2",
    height: "100%-2",
    items: ["room0", "room1", "room2", "room3", "room4"],
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

roomListBox.append(list);

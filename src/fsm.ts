import { assign, createActor, createMachine } from "xstate";
import * as blessed from "blessed";

import { screen } from "./elements/screen";
import { roomListBox } from "./elements/roomList";
import { addExitListener } from "./systems";
import { createRoomOptionsBox } from "./elements/roomOptions";
import { roomMenuBox } from "./elements/roomMenu";
import { getCreateRoomBox } from "./elements/createRoomBox";
import { getErrorMessageBox } from "./elements/errorMessageBox";

const toggleMachine = createMachine(
    {
        /** @xstate-layout N4IgpgJg5mDOIC5QBcD2UoBswDoCWAdnsgMQDaADALqKgAOqsxeqBtIAHogEwCsvOCgHYAHAEY+AGhABPRGIoA2QRVXDF3AJwBmTQBZe2gL5HpaDNhwAnVKgC2AGTyxSN+zlR1kLArEo0kEAYmb1Z2LgQAWjFlEWEY7gpNRW09bW0KXmk5BETNHG4xXg09IV4RDV4xERMzdCxcN0dnUgBrMBkcOgBDGAhUAHcCf3Zg5jDAiK1tHEURMsM9TKFFMSFsxCqBNVUV6f1eWpBzButbOwB5Lx9YEiaPa9ZYHAAhboBjVpHAsdC2ScQkS0BWqZQ2CG0iVmSlE2l4ehEmk0FBEh1Mx3qliaAFkwAQAK4kdqdHowfF0b70Rjjf6gCIxIQ4ETccRSWSbIoqNR7HQHI4nLHnXEEnDvKxgbrIMBEjrWPBQAAWyEpQWpf3CiAy+SEyXmWXZCBE2kZZW5Gl5Bn5mMaQrx+NF4sl0uJODxUqsKt+Pg1hpEKiEOt4QiSq2NinBml43BwZQk3ADhUUvE0VosNvswvtACtUIQZZ1sAAzZXUUZq70AiFibVJyrg0SMvhm-aW9EC9N2TMOiVSgBK5xeqA4+ddBHdnvLEzpiE00dn1XEIkXS2T4Ikiny3FSpQoBlK5VTpxxdu7ToAcmABv37CQwFYbB7Sz9J7TOPJuMpk8a9AkMlttGueg6DgmgiHoSz6NWigUGsJjogQqAQHA7DtmWIQVtOUTaPMIFiHCwb8HCFSpOC0TCCBSJIlG2gJGB3CHpYhDEGhNI+tU4YGkCFA4EBlFbsG0HwkIDEdk4LgseqlbVJo4KJjg6QKXMOhCGsegiWc9hXH88DPuhU5vlhui4fhmSGOUKR6LJcIFNBigrKoBjBmk6nHgSEkYQZkRCNGNFsjk5TRrwajcCyS7VNoigubaIpij2YDufpERAno8kSPqOQrPkOzqC2aJ1GmGmdieOaEAlr4RGkygfsUfmIAGYg4EFzYWnlGIFa59qxU6152IOERUnp5XyIyiJKOkfCaNULIpGupkxtu5RLlUqxRRmJ5dVKF5XucZU+j+jWiGIMQaH+RQAQaeFVPN4FOUJB5ttahVdneD64rAsC9PFumsZWWgjSyaxgcsqzrBdQYpVu4FJD+yQwcJcFAA */
        id: "toggle",
        initial: "init",
        context: {
            screen,
            roomListBox,
            roomListCounter: 0,
            roomOptionsCounter: 0,
            selectedRoom: "",
            createRoomBox: {} as blessed.Widgets.BoxElement,
            roomOptionsBox: {} as blessed.Widgets.BoxElement,
        },
        states: {
            init: {
                always: "roomList",
                entry: ["initMainScene"],
            },

            roomList: {
                entry: ["focusOnRoomList", "render"],

                on: {
                    "room.options": {
                        actions: assign({
                            selectedRoom: ({ event }) => event.roomName,
                        }),
                        target: "roomOptions",
                    },

                    "key.pagedown": "roomMenu",
                },

                exit: ["unActiveRoomList"],
            },

            roomOptions: {
                entry: ["createRoomOptionBox", "render"],
                on: {
                    "room.options.Back": {
                        target: "roomList",
                    },
                },
                exit: ["unActiveRoomOptionBox"],
            },

            roomMenu: {
                entry: ["focusOnRoomMenu", "render"],
                exit: ["unActiveRoomMenu"],
                initial: "create",

                states: {
                    create: {
                        entry: ["focusOnRoomMenuButtonCreate", "render"],
                        on: {
                            "key.right": "join",
                            "key.enter": "createRoomBox",
                        },
                        exit: ["unActiveRoomMenuButtons"],
                    },

                    join: {
                        entry: ["focusOnRoomMenuButtonJoin", "render"],

                        on: {
                            "key.left": "create",
                        },
                        exit: ["unActiveRoomMenuButtons"],
                    },

                    createRoomBox: {
                        entry: ["createRoomBox", "unActiveRoomMenu", "focusNewRoomInput", "render"],
                        exit: ["unActiveCreateRoomBox"],

                        on: {
                            "key.enter": "createNewRoom",
                        },
                    },

                    createNewRoom: {
                        entry: ["createNewRoom"],

                        on: {
                            error: "errorMessage",
                        },
                    },

                    errorMessage: {
                        entry: ["showErrorBox", "render"],
                        exit: ["destroyErrorBox"],
                    },
                },

                on: {
                    "key.pageup": {
                        target: "roomList",
                        reenter: true,
                    },
                },
            },
        },
    },
    {
        actions: {
            initMainScene: (machine) => {
                machine.context.screen.append(roomListBox);
                machine.context.screen.append(roomMenuBox);
            },
            focusOnRoomList: (machine) => {
                machine.context.roomListBox.style = {
                    border: {
                        fg: "green",
                    },
                };
                const list = machine.context.roomListBox.children.find(
                    (node) => node.options.name == "roomList",
                ) as blessed.Widgets.ListElement;
                if (!list) throw Error("No room list");

                list.focus();

                list.key("up", () => {
                    if (machine.context.roomListCounter > 0) {
                        list.select(--machine.context.roomListCounter);
                        machine.context.screen.render();
                    }
                });
                list.key("down", () => {
                    if (machine.context.roomListCounter < list.options.items.length - 1) {
                        list.select(++machine.context.roomListCounter);
                        machine.context.screen.render();
                    }
                });
                list.key("enter", () => {
                    const selectedItem = list.getItem(machine.context.roomListCounter);
                    actor.send({ type: "room.options", roomName: selectedItem.getText() });
                    machine.context.screen.render();
                });

                list.on("keypress", (ch, key) => {
                    switch (key.name) {
                        case "pagedown":
                            actor.send({
                                type: `key.pagedown`,
                            });
                            break;
                    }
                });

                addExitListener(list);
            },
            unActiveRoomList: (machine) => {
                machine.context.roomListBox.style = {
                    border: {
                        fg: "yellow",
                    },
                };

                const list = machine.context.roomListBox.children.find(
                    (node) => node.options.name == "roomList",
                ) as blessed.Widgets.ListElement;
                list.removeAllListeners();
                list.free();
            },
            createRoomOptionBox: (machine) => {
                const roomOptionsBox = createRoomOptionsBox(machine.context.roomListCounter);
                machine.context.roomOptionsBox = roomOptionsBox;
                roomOptionsBox.style = {
                    border: {
                        fg: "green",
                    },
                };

                const options = roomOptionsBox.children.find(
                    (node) => node.options.name == "options",
                ) as blessed.Widgets.ListElement;
                if (!options) throw Error("No room options");

                machine.context.screen.append(roomOptionsBox);
                options.focus();

                options.key("up", () => {
                    if (machine.context.roomOptionsCounter > 0) {
                        options.select(--machine.context.roomOptionsCounter);
                        machine.context.screen.render();
                    }
                });
                options.key("down", () => {
                    if (machine.context.roomOptionsCounter < 4) {
                        options.select(++machine.context.roomOptionsCounter);
                        machine.context.screen.render();
                    }
                });
                options.key("enter", () => {
                    const selectedOption = options.getItem(machine.context.roomOptionsCounter);
                    actor.send({
                        type: `room.options.${selectedOption.getText()}`,
                    });
                });

                addExitListener(options);
            },
            unActiveRoomOptionBox: (machine) => {
                machine.context.roomOptionsBox.destroy();
                machine.context.roomOptionsCounter = 0;
            },
            focusOnRoomMenu: (machine) => {
                roomMenuBox.style = {
                    border: {
                        fg: "green",
                    },
                };
            },
            focusOnRoomMenuButtonCreate: (machine) => {
                const button = roomMenuBox.children.find(
                    (node) => node.options.name == "Create",
                ) as blessed.Widgets.ButtonElement;
                if (!button) throw Error(`No button Create`);

                button.focus();

                button.on("keypress", (ch, key) => {
                    switch (key.name) {
                        case "right":
                            actor.send({
                                type: `key.right`,
                            });
                            break;
                        case "enter":
                            actor.send({
                                type: `key.enter`,
                            });
                            break;
                        case "pageup":
                            actor.send({
                                type: `key.pageup`,
                            });
                            break;
                    }
                });

                addExitListener(button);
            },
            focusOnRoomMenuButtonJoin: (machine) => {
                const button = roomMenuBox.children.find(
                    (node) => node.options.name == "Join",
                ) as blessed.Widgets.ButtonElement;

                if (!button) throw Error(`No button Join`);

                button.focus();

                button.on("keypress", (ch, key) => {
                    switch (key.name) {
                        case "left":
                            actor.send({
                                type: `key.left`,
                            });
                            break;
                        case "enter":
                            break;
                        case "pageup":
                            actor.send({
                                type: `key.pageup`,
                            });
                            break;
                    }
                });

                addExitListener(button);
            },
            unActiveRoomMenuButtons: (machine) => {
                roomMenuBox.children.forEach((node) => {
                    node.removeAllListeners("keypress");
                });
            },
            unActiveRoomMenu: (machine) => {
                roomMenuBox.style = {
                    border: {
                        fg: "yellow",
                    },
                };
            },
            createRoomBox: (machine) => {
                machine.context.createRoomBox = getCreateRoomBox();
                machine.context.createRoomBox.style = {
                    border: {
                        fg: "green",
                    },
                };
                screen.append(machine.context.createRoomBox);
                addExitListener(machine.context.createRoomBox);
            },
            focusNewRoomInput: (machine) => {
                const input = machine.context.createRoomBox.children.find(
                    (node) => node.options.name == "inputBox",
                ) as blessed.Widgets.TextboxElement;

                if (!input) throw Error(`No input element`);

                input.focus();
                input.readInput();

                input.on("keypress", (ch, key) => {
                    switch (key.name) {
                        case "enter":
                            const message = input.getValue();
                            input.clearValue();
                            actor.send({ type: "key.enter", roomName: message });
                            break;
                    }
                });
                addExitListener(input);
            },
            unActiveCreateRoomBox: (machine) => {
                machine.context.createRoomBox.destroy();
            },
            createNewRoom: async (machine) => {
                try {
                    const roomName = machine.event.roomName;
                    if (!roomName) throw new Error("Room name no exist");

                    const list = machine.context.roomListBox.children.find(
                        (node) => node.options.name == "roomList",
                    ) as blessed.Widgets.ListElement;
                    if (!list) throw new Error("No room list");

                    if (list.options.items.includes(roomName))
                        throw new Error("This room name already exist");

                    //TODO: Add logic to create new room on server

                    list.addItem(roomName);

                    actor.send({ type: "key.pageup" });
                } catch (error) {
                    actor.send({ type: "error", message: (error as Error).message });
                }
            },
            showErrorBox: (machine) => {
                const errorBox = getErrorMessageBox(machine.event.message);
                errorBox.focus();
                screen.append(errorBox);

                errorBox.key("C-c", function () {
                    actor.send({ type: "key.pageup" });
                });
            },
            destroyErrorBox: (machine) => {
                machine.context.screen.children
                    .find((node) => node.options.name == "errorBox")
                    .destroy();
            },
            render: (machine) => machine.context.screen.render(),
        },
    },
);

export const actor = createActor(toggleMachine);

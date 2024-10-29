import { assign, createActor, createMachine } from "xstate";
import * as blessed from "blessed";

import { screen } from "./elements/screen";
import { roomListBox } from "./elements/roomList";
import { addExitListener } from "./systems";
import { createRoomOptionsBox } from "./elements/roomOptions";
import { roomMenuBox } from "./elements/roomMenu";
import { getCreateRoomBox } from "./elements/createRoomBox";
import { getErrorMessageBox, getQuestionBox } from "./elements/messagesBox";

const toggleMachine = createMachine(
    {
        /** @xstate-layout N4IgpgJg5mDOIC5QBcD2UoBswDoCWAdnsgMQDaADALqKgAOqsxeqBtIAHogGwCMALDgCsvId34UATEIAcAdhkBOXgBoQAT0QBaOYpyiAzPwOSZ-GVKFC5AXxtq0GbDgBOqVAFsAMnlik3njiodMgsBLCUNEggDEyhrOxcCAYmODJCivy8BgLcinKS3NxqmgiShcKSRkaKYjLc6QZ2DuhYuAHevqQA1mDqOHQAhjAQqADuBJHsscwJ0UkKvDi1ObxyBnIU3BRWJYiSipI4WUUG9YflFLzNII5tru4eAPIhYbAkHUGvrLA4AEKDADG3Sm0Rm8TY80QKSO6Uy2Vy+UKxQ00PKxzk3CEB2Mh0UFH4Nzuzg6Lwh70+wXJOAASmAPKgAG5gUH0RizSGgJJaKrCRYFbgGQUiPh7BD8bE4Iy8KoEraiImtEmPACyYAIAFcSL1+kMYBq6KyYuyIYlEItlkJVutNttdqiylllrwilbarwKBRlJJFU52qr1RqcICXGBBsgwNq+q48FAABbII3gsJmhDZSSCOS8eqSCgGT0HAxiq2CE5Y-EbSQFa72W5K-2eNWa4Oh8ORnU4dURlxJk0pqFpkyZ7PcXP5qSKIsOofLRRz-jl-hVGRNWvEhseJtBgBWqEIUf62AAZonqNM+3MuYhsgY9ASinPsbfpDIxeYDM7yxYpLxROlffcHRbi2YYRjSjx-KgHAHp2BDdr2cT9leaaYjIlqFkuWLZNwchijOc7zouy6ri0foPI2gYgW2AByYBjOBngkGALhuD2Z5ghenKcPsMoUDgFByAoMhmMJmK1HhGaznOZhyFkkgepkAEkvSTJgAxHgAIoanAEIfI8dIMsyCEcqmWhGDgo5CAS2HYSKYoFEcEqyVI1RyEISntCpzLqVpOlhHpngGapZC8FEbKIZe3FlIo3BSvi4hiPmS7pPw9nok5EhVMYblXB5rheWpjzkOx4UmQOfCCCIYgnMo+RZPZZwWbouYelIKXcHYtYEKgEBwOw67nhFXHcjFUrZYcIiYlsEpijyLo4Fmuj8FNwmTsteWEMQg1lch2ZLJOvCZCkGQbFZU6lFoMp6PJS2iDaOxLnlHQ+H422mgOQhLvoWaHGYOyYmsYryYIBExXkz4VrYa71uRzzfOEb1IVFWjmPo5gLgYIh5q6r4OtIH4Svw+Q4SI9RWCRdZkUBgaI5FSSTkc2yHG5MhrPIv5ioKxwET9XqFm5T0Bs2IagWAtPDYgigWBZfMs2zWaqNOv4WRm+QK3t4iCxRza7oQ4upgIVjCAuWbLTIVYCLjpQSnoRNznwjRSOshLQ1TQtBiLbbqZBSSle9u3LbFWbpCKmOyeUQNE1Jc5VLaD1Q6RgHu1REa0fRjz6wO2bKMIo6FEYol5EIeFSPxnp5qzC5IkUWubpRzGsWqsCwMMYscUNqblNmMvKFaslubIKKlFWQjR4Jv4ay7ifKYZhWeL5fhI8mdPaKjrkTWs2ziDNDpWkcUjiAcuYCSuCeU4BBXqZnu18SfXruiuJiY4rpQrkcsiTnky38HJ7mdUAA */
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

                    "room.options.Remove": "removeRoomQuestion",
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

            removeRoomQuestion: {
                entry: ["showRemoveRoomBox", "render"],

                on: {
                    roomRemove: [
                        {
                            target: "removeRoom",
                            guard: "isRoomRemove",
                        },
                        {
                            target: "roomList",
                            reenter: true,
                        },
                    ],
                },
            },

            removeRoom: {
                always: {
                    target: "roomList",
                    reenter: true,
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
            // Room options box
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
            showRemoveRoomBox: (machine) => {
                const question = getQuestionBox();
                question.ask(`Remove ${machine.context.selectedRoom} room?`, (err, value) => {
                    actor.send({ type: "roomRemove", remove: value == "true" ? true : false });
                });
                screen.append(question);
            },
            // Room menu
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
            // Create room menu
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
            // Error box
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
        guards: {
            isRoomRemove: (machine) => {
                return machine.event.remove;
            },
        },
    },
);

export const actor = createActor(toggleMachine);

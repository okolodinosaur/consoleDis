import { assign, createActor, createMachine } from "xstate";
import * as blessed from "blessed";

import { screen } from "./elements/screen";
import { roomListBox } from "./elements/roomList";
import { addExitListener } from "./systems";
import { createRoomOptionsBox } from "./elements/roomOptions";
import { roomMenuBox } from "./elements/roomMenu";
import { createRoomBox } from "./elements/createRoomBox";

const toggleMachine = createMachine(
    {
        /** @xstate-layout N4IgpgJg5mDOIC5QBcD2UoBswDoCWAdnsgMQDaADALqKgAOqsxeqBtIAHogEwCsvOCgHYAHAEY+AGhABPRGIoA2QRVXDF3AJwBmTQBZe2gL5HpaDNhwAnVKgC2AGTyxSN+zlR1kLArEo0kEAYmb1Z2LgQAWjFlEWEY7gpNRW09bW0KXmk5BETNHG4xXg09IV4RDV4xERMzdCxcN0dnUgBrMBkcOgBDGAhUAHcCf3Zg5jDAiL0xfO1edX4M3kSY7MRlsQL51SENHX1eWpBzButbOwB5Lx9YEiaPa9ZYHAAhboBjVpHAsdC2SfWAlEEiyskQeiSODmilEcz0Ik0mgoIkOpmO9UsTQAsmACABXEjtTo9GB4ujfeiMcb-UARbhaQTAqRghAbLZqXZaXQGI4nTHnHH4nDvKxgbrIMCEjrWPBQAAWyApQSpf3CiG0Qm0OF4ekUIjKawQIgh7J2e25qLqFkaAtxeOFovFkqJOFxEqsSt+PjVCDEBhwiMK+r0iNDmiEhs0yxwZQk3CEQkKil4ml5GJt9kF9oAVqhCFLOtgAGaK6ijFXegEIbQiLVVYrMnKifJlDnmg4mNEEVAQODsPlgcshSu0xCRXQUHDTOZCTKGcopPSG6LCANh7TcFJiWF6NPW-BEZBD6k+6qKZeJKdh7gapSZUp705NJwuY+qqvVTSGpNQ9LpPU6EI267miA5nPYVx-PAPwVhMo5RKk3BTmIM5znMFSpN+KIFIoSi7KoBiziBVpPra+JviOnBjiI2qVIa5R6GuiIVEi8Ipooj78pmdoOmKEoUXBVHVvkaQGiyCabNsZpch2oHpuBdhZjguaEAJNJCdsghFHR4lCIxajSfsPJyfu2I8SKfFgAASucLyoBElLDoJETiDgigQikG4ptU3AVIaCjlAUqQGCIoVVIoYidkYQA */
        id: "toggle",
        initial: "init",
        context: {
            screen,
            roomListBox,
            roomListCounter: 0,
            roomOptionsCounter: 0,
            selectedRoom: "",
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
                        console.log(machine.context.roomListCounter);
                        machine.context.screen.render();
                    }
                });
                list.key("down", () => {
                    if (machine.context.roomListCounter < list.options.items.length) {
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
                createRoomBox.style = {
                    border: {
                        fg: "green",
                    },
                };
                screen.append(createRoomBox);
                addExitListener(createRoomBox);
            },
            focusNewRoomInput: (machine) => {
                const input = createRoomBox.children.find(
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

                            const list = machine.context.roomListBox.children.find(
                                (node) => node.options.name == "roomList",
                            ) as blessed.Widgets.ListElement;
                            if (!list) throw Error("No room list");

                            list.addItem(message);

                            actor.send({ type: "key.pageup" });
                            break;
                    }
                });
                addExitListener(input);
            },
            unActiveCreateRoomBox: (machine) => {
                createRoomBox.destroy();
            },
            render: (machine) => machine.context.screen.render(),
        },
    },
);

export const actor = createActor(toggleMachine);

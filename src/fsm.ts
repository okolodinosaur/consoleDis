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
        /** @xstate-layout N4IgpgJg5mDOIC5QBcD2UoBswDoCWAdnsgMQDaADALqKgAOqsxeqBtIAHogEwCsvOCgHYAHAEY+AGhABPRGIoA2QRVXDF3AJwBmTQBZe2gL5HpaDNhwAnVKgC2AGTyxSN+zlR1kLArEo0kEAYmb1Z2LgQAWgVtHG4xESFeaTkEeKEcEV5FUW1ePRFNTQoskzN0LFw3R2dSAGswGRw6AEMYCFQAdwJ-dmDmMMCI7QoBUQlk2UQ9bViktSENHX1DMpBzSutbOwB5Lx9YEmqPfdZYHAAhFoBjOt7A-tC2IcR+HHGpKYQ9Ck0cPJyIjyBSKJV4aw2lmqAFkwAQAK4kBpNVoweF0e70RgDZ6gCLcLSCD6TVK8eJxXgLJa6AwQipQ7awhE4a5WMAtZBgJGNax4KAAC2QmKC2Ke4UQ2iEsXyikSJMQIh+FKpWhp4NM63pVUZcPhOAAVqhCNymtgAGZC6h9UU+cUIbRAnC8MTZT6pUR-eaqRaqlZ0iza+xMvWs9mck04OGcqzCx62l4IMQGHBFeJylKIHSxNTe6l+tYEVAQODsSFga0heN4xCRbhCMQppRumsKDJFdvcSVKUZ6IT+zaEYgVnF2hKKDNRbgUHB6duaTtCbv5PsastbexOFzDsUJhKaCfxZSzY+ynT1oR6fsM+x7J7wB42wbVyedxsaeX2xQCSkq5YGYyrlq652MG25VpwNYiE674TrwWQqL+apXoGIG6iybIcuWD6Vk+EH2n8MxJBOQj1k6OY+n+6rlAGwHBgaRq4iKOGMREP6CC6MFfCRegIbmvq0oBNEwmhoaYQAStsFyoBEWLMaOYh-JxqQKLwGQ5uo-HqiYQA */
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
                        entry: ["createRoomBox", "unActiveRoomMenu", "render"],
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
                    if (machine.context.roomListCounter < 5) {
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
                // createRoomBox.focus();
                addExitListener(createRoomBox);
            },
            render: (machine) => machine.context.screen.render(),
        },
    },
);

export const actor = createActor(toggleMachine);

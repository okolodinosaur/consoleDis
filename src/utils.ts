import * as blessed from "blessed";

// Создаем экран
const screen = blessed.screen({
    smartCSR: true,
});

// Создаем окно для ввода
const inputBox = blessed.textbox({
    parent: screen,
    name: "inputBox",
    top: "500",
    left: "center",
    width: "50%",
    height: "shrink", // высота подстраивается под содержимое
    border: {
        type: "line",
    },
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
    // inputOnFocus: true,
});

const showBox = blessed.box({
    top: "100",
    left: "center",
    width: "50%",
    height: "400",
    name: "Messages",
    label: "This is label",
    // fg: "white", // text content color
    // bg: "blue",
    style: {
        fg: "white",
        bg: "blue",
        border: {
            fg: "blue",
        },
    },
    border: {
        type: "line",
    },
    content: "Hello {bold}world{/bold}!",
    tags: true,
    scrollable: true,
    // alwaysScroll: true,
});

const testLogs = blessed.box({
    top: "100",
    left: "0",
    width: "200",
    height: "400",
    label: "Test scroll logs",
    style: {
        fg: "white",
        bg: "blue",
        border: {
            fg: "red",
        },
    },
    border: {
        type: "line",
    },
    scrollable: true,
});

const buttonsBox = blessed.box({
    parent: screen,
    name: "buttonsBox",
    top: "100",
    right: "0",
    width: "200",
    height: 8, // +2 to list items amount
    label: "Menu",
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
    // parent: buttonsBox,
    left: 0,
    width: "100%-2",
    height: "100%-2", // Увеличиваем высоту для отображения всех пунктов
    items: ["Пункт 1", "Пункт 2", "Пункт 3", "Пункт 4", "Пункт 4", "Пункт 4"],
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

// Добавляем текстовое поле на экран
screen.append(showBox);
screen.append(inputBox);
screen.append(testLogs);
buttonsBox.append(list);
screen.append(buttonsBox);

// Устанавливаем фокус на текстовое поле
// inputBox.focus()

// Обработка нажатия клавиш
inputBox.key("enter", function () {
    const message = inputBox.getValue();

    if (message == "q") return process.exit(0);

    inputBox.clearValue();
    addMessage(message, showBox);
    inputBox.readInput();
});

inputBox.on("keypress", (ch, key) => {
    switch (key.name) {
        case "pageup":
            buttonsBox.style = {
                border: {
                    fg: "green",
                },
            };
            list.focus();
            // screen.render()
            break;
    }
});

list.on("keypress", (ch, key) => {
    switch (key.name) {
        case "pagedown":
            buttonsBox.style = {
                border: {
                    fg: "yellow",
                },
            };
            inputBox.focus();
            inputBox.readInput();
            break;
    }
});

let currentItem: number = 0;

list.key("up", () => {
    addMessage(`up: ${currentItem}`, showBox);

    if (currentItem > 0) {
        list.select(--currentItem);
        screen.render();
    }
});

list.key("down", () => {
    addMessage(`down: ${currentItem}`, showBox);

    if (currentItem < 5) {
        list.select(++currentItem);
        screen.render();
    }
});

// Обработка нажатия клавиши Enter на списке
list.key("enter", () => {
    const selectedItem = list.getItem(currentItem);
    const selectedText = selectedItem.getText();
    addMessage(`Выбран: ${selectedText}`, showBox);
    screen.render();
});

// Отображаем экран
screen.render();

const addMessage = (message: string, box: blessed.Widgets.BoxElement) => {
    // Добавляем новое сообщение
    const currentContent = box.getContent();
    const newContent = currentContent + `\n${message}`;

    box.setContent(newContent);

    const lineCount = newContent.split("\n").length;
    box.scrollTo(lineCount);
};

let counter = 0;
setInterval(() => addMessage(String(counter++), testLogs), 1000);

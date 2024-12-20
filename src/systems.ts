import * as blessed from "blessed";

export function addExitListener(node: blessed.Widgets.BoxElement) {
    node.key("C-c", function () {
        return process.exit(0);
    });
}

export function addItemInList(list: blessed.Widgets.ListElement, item: string) {}

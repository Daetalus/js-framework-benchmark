/*jslint nomen: true, indent: 2, maxerr: 3 */
/*global window, document, rJS, RSVP */
(function (window, document, rJS, RSVP) {
    "use strict";

    var startTime;
    var lastMeasure;
    var startMeasure = function (name) {
        startTime = performance.now();
        lastMeasure = name;
    }
    var stopMeasure = function () {
        var last = lastMeasure;
        if (lastMeasure) {
            window.setTimeout(function () {
                lastMeasure = null;
                var stop = performance.now();
                var duration = 0;
                console.log(last + " took " + (stop - startTime));
            }, 0);
        }
    }

    function _random(max) {
        return Math.round(Math.random() * 1000) % max;
    }

    class Store {
        constructor() {
            this.data = [];
            this.backup = null;
            this.selected = null;
            this.id = 1;
        }
        buildData(count = 1000) {
            var adjectives = ["pretty", "large", "big", "small", "tall", "short", "long", "handsome", "plain", "quaint", "clean", "elegant", "easy", "angry", "crazy", "helpful", "mushy", "odd", "unsightly", "adorable", "important", "inexpensive", "cheap", "expensive", "fancy"];
            var colours = ["red", "yellow", "blue", "green", "pink", "brown", "purple", "brown", "white", "black", "orange"];
            var nouns = ["table", "chair", "house", "bbq", "desk", "car", "pony", "cookie", "sandwich", "burger", "pizza", "mouse", "keyboard"];
            var data = [];
            for (var i = 0; i < count; i++)
                data.push({ id: this.id++, label: adjectives[_random(adjectives.length)] + " " + colours[_random(colours.length)] + " " + nouns[_random(nouns.length)] });
            return data;
        }
        updateData(mod = 10) {
            for (let i = 0; i < this.data.length; i += 10) {
                this.data[i].label += ' !!!';
            }
        }
        delete(id) {
            const idx = this.data.findIndex(d => d.id == id);
            this.data = this.data.filter((e, i) => i != idx);
            return this;
        }
        run(amount) {
            this.data = this.buildData(amount);
            this.selected = null;
        }
        add() {
            this.data = this.data.concat(this.buildData(1000));
            this.selected = null;
        }
        update() {
            this.updateData();
            this.selected = null;
        }
        select(id) {
            this.selected = id;
        }
        hideAll() {
            this.backup = this.data;
            this.data = [];
            this.selected = null;
        }
        showAll() {
            this.data = this.backup;
            this.backup = null;
            this.selected = null;
        }
        runLots() {
            this.data = this.buildData(10000);
            this.selected = null;
        }
        clear() {
            this.data = [];
            this.selected = null;
        }
        swapRows() {
            if (this.data.length > 998) {
                var a = this.data[1];
                this.data[1] = this.data[998];
                this.data[998] = a;
            }
        }
    }

    function createRow(data) {
        let tr = document.createElement("tr");
        tr.data_id = data.id;
        let td1 = document.createElement("td");
        td1.className = "col-md-1";
        td1.innerText = data.id;
        tr.appendChild(td1);

        let td2 = document.createElement("td");
        td2.className = "col-md-4";
        tr.appendChild(td2);
        let a2 = document.createElement("a");
        a2.className = "lbl";
        td2.appendChild(a2);
        a2.innerText = data.label;

        let td3 = document.createElement("td");
        td3.className = "col-md-1";
        tr.appendChild(td3);
        let a = document.createElement("a");
        a.className = "remove";
        td3.appendChild(a);
        let span = document.createElement("span");
        span.className = "glyphicon glyphicon-remove remove";
        span.setAttribute("aria-hidden", "true");
        a.appendChild(span);

        let td5 = document.createElement("td");
        td5.className = "col-md-6";
        tr.appendChild(td5)

        return tr;
    }

    rJS(window)
        /////////////////////////////
        // ready
        /////////////////////////////
        .ready(function () {
            var gadget = this;
            gadget.rows = [],
                gadget.data = [];
            gadget.store = new Store();
            gadget.tbody = document.getElementById("tbody");
            console.log("READY - dependencies loaded");
            console.log("Tbody!!!");
            console.log(gadget.tbody);

            return new RSVP.Queue()
                .push(function () {
                    return gadget.changeState({ "counter": 123 });
                })
                .push(function () {
                    console.log("READY - gadget configuration");
                    console.log(gadget.state);
                    console.log(gadget.element);
                })
        })

        .declareMethod("updateRows", function () {
            var gadget = this;
            for (let i = 0; i < gadget.rows.length; i++) {
                if (gadget.data[i] !== gadget.store.data[i]) {
                    let tr = gadget.rows[i];
                    let data = gadget.store.data[i];
                    tr.data_id = data.id;
                    tr.childNodes[0].innerText = data.id;
                    tr.childNodes[1].childNodes[0].innerText = data.label;
                    gadget.data[i] = gadget.store.data[i];
                }
            }
        })
        .declareMethod("appendRows", function () {
            var gadget = this;
            var rows = gadget.rows, s_data = gadget.store.data, data = gadget.data, tbody = gadget.tbody;
            for (let i = rows.length; i < s_data.length; i++) {
                let tr = createRow(s_data[i]);
                rows[i] = tr;
                data[i] = s_data[i];
                tbody.appendChild(tr);
            }
        })
        .declareMethod("removeAllRows", function () {
            var gadget = this;
            gadget.tbody.textContent = "";
        })
        .declareMethod("unselect", function () {
            var gadget = this;
            if (gadget.selectedRow !== undefined) {
                gadget.selectedRow.className = "";
                gadget.selectedRow = undefined;
            }
        })

        /////////////////////////////
        // gadget event binding
        /////////////////////////////
        .onEvent("click", function (evt) {
            var gadget = this;
            console.log(evt.target.id);
            if (evt.target.id === "run") {
                evt.preventDefault();
                startMeasure("run");
                gadget.store.clear();
                gadget.store.run(1000);
                return gadget.updateRows()
                    .push(function () {
                        return gadget.appendRows();
                    })
                    .push(function () {
                        return gadget.unselect();
                    })
                    .push(function () {
                        return stopMeasure();
                    });
            }
            else if (evt.target.id === "add") {
                startMeasure("add");
                gadget.store.add();
                return gadget.appendRows()
                    .push(function () {
                        return stopMeasure();
                    })
            }
            else if (evt.target.id === "clear") {
                startMeasure("clear");
                gadget.store.clear();
                gadget.rows = [];
                gadget.data = [];
                return gadget.removeAllRows()
                    .push(function () {
                        return gadget.unselect();
                    })
                    .push(function () {
                        return stopMeasure();
                    });
            } else if (evt.target.id === "update") {
                evt.preventDefault();
                startMeasure("update");
                gadget.store.update();
                for (let i = 0; i < gadget.data.length; i += 10) {
                    gadget.rows[i].childNodes[1].childNodes[0].innerText = gadget.store.data[i].label;
                }
                stopMeasure();
            } else if (evt.target.id === "hideall") {
                evt.preventDefault();
                gadget.store.hideAll();
            } else if (evt.target.id === "showall") {
                evt.preventDefault();
                gadget.store.showAll();
            } else if (evt.target.id === "runlots") {
                evt.preventDefault();
                startMeasure("runLots");
                gadget.store.runLots();
                return gadget.updateRows()
                    .push(function () {
                        return gadget.appendRows();
                    })
                    .push(function () {
                        return gadget.unselect();
                    })
                    .push(function () {
                        return stopMeasure();
                    })
            } else if (evt.target.id === "swaprows") {
                evt.preventDefault();
                startMeasure("swapRows");
                let old_selection = gadget.store.selected;
                gadget.store.swapRows();
                return gadget.updateRows()
                    .push(function () {
                        return gadget.unselect();
                    })
                    .push(function () {
                        if (old_selection >= 0) {
                            let idx = gadget.store.data.findIndex(d => d.id === old_selection);
                            if (idx > 0) {
                                gadget.store.select(gadget.data[idx].id);
                                gadget.selectedRow = gadget.rows[idx];
                                gadget.selectedRow.className = "danger";
                            }
                        }
                        return stopMeasure();
                    })

            } else if (evt.target.id === "remove") {
                evt.preventDefault();
                let id = getParentId(e.target);
                let idx = this.findIdx(id);
                startMeasure("delete");

                // Faster, shift all rows below the row that should be deleted rows one up and drop the last row
                for (let i = gadget.rows.length - 2; i >= idx; i--) {
                    let tr = gadget.rows[i];
                    let data = gadget.store.data[i + 1];
                    tr.data_id = data.id;
                    tr.childNodes[0].innerText = data.id;
                    tr.childNodes[1].childNodes[0].innerText = data.label;
                    gadget.data[i] = gadget.store.data[i];
                }
                gadget.store.delete(gadget.data[idx].id);
                gadget.data.splice(idx, 1);
                gadget.rows.pop().remove();

                stopMeasure();
            } else if (evt.target.id === ".lbl") {
                evt.preventDefault();
                let id = getParentId(e.target);
                let idx = gadget.findIdx(id);
                gadget.select(idx);
            }
        }
        , false, true)
}(window, document, rJS, RSVP));
/*jslint nomen: true, indent: 2, maxerr: 3 */
/*global window, document, rJS, RSVP, loopEventListener, promiseEventListener */
(function (window, document, rJS, RSVP) {
    "use strict";
  
    var startTime;
    var lastMeasure;
    var startMeasure = function(name) {
        startTime = performance.now();
        lastMeasure = name;
    }
    var stopMeasure = function() {
        var last = lastMeasure;
        if (lastMeasure) {
            window.setTimeout(function () {
                lastMeasure = null;
                var stop = performance.now();
                var duration = 0;
                console.log(last+" took "+(stop-startTime));
            }, 0);
        }
    }
    
    function _random(max) {
        return Math.round(Math.random()*1000)%max;
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
                data.push({id: this.id++, label: adjectives[_random(adjectives.length)] + " " + colours[_random(colours.length)] + " " + nouns[_random(nouns.length)] });
            return data;
        }
        updateData(mod = 10) {
            for (let i=0;i<this.data.length;i+=10) {
                this.data[i].label += ' !!!';
                // this.data[i] = Object.assign({}, this.data[i], {label: this.data[i].label +' !!!'});
            }
        }
        delete(id) {
            const idx = this.data.findIndex(d => d.id==id);
            this.data = this.data.filter((e,i) => i!=idx);
            return this;
        }
        run(amount) {
            this.data = this.buildData(amount);
            console.log("Hello?");
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
            if(this.data.length > 998) {
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

        let td2 =  document.createElement("td");
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
        span.setAttribute("aria-hidden","true");
        a.appendChild(span);

        let td5 = document.createElement("td");
        td5.className = "col-md-6";
        tr.appendChild(td5)

        return tr;
    }

    rJS(window)
      
      /////////////////////////////
      // state
      /////////////////////////////
      .setState({key: ""})
  
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
            return gadget.changeState({"counter": 123});
          })
          .push(function () {
            console.log("READY - gadget configuration");
            console.log(gadget.state);
            console.log(gadget.element);
          })
       })
      
       .declareMethod("updateRows", function () {
            var gadget = this;
            for(let i=0;i<gadget.rows.length;i++) {
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
            for(let i=rows.length;i<s_data.length; i++) {
                let tr = createRow(s_data[i]);
                rows[i] = tr;
                data[i] = s_data[i];
                tbody.appendChild(tr);
            }
        })

      /////////////////////////////
      // gadget event binding
      /////////////////////////////
      .onEvent("click", function (evt) {
        var gadget = this;
        if (evt.target.id === "run") {
            console.log(evt.target.id);	
            evt.preventDefault();
            startMeasure("run");
            gadget.store.run(1000);
            gadget.updateRows();
            gadget.appendRows();
            stopMeasure();
        }
      }
      , false, true)
  

}(window, document, rJS, RSVP));
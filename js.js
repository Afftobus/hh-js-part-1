const myAmazingGraph = {
    n: (xs) => xs.length,
    gg: function(m){},
    m: (xs, n) => xs.reduce((store, item) => item + store, 0) / n,
    m2: (xs, n) => xs.reduce((store, item) => item * store, 1) / n,
    v: (m, m2) => m*m - m2,
    xs: () => [1, 2, 3],
}


const Graph = {
    connetivity     : null,
    graph           : null,
    callStack       : null,
    results         : null,

    receiveGraphLazy(graph) { // чисто запоминаем результаты, не считаем ничего
        this.graph          = graph;
        this.connetivity    = [];
        this.results        = null;
        return this;
    },

    receiveGraphEager(graph) { // запоминаем граф и сразу считаем все узлы
        this.graph          = graph;
        this.connetivity    = [];
        this.results        = null;
        for (key in this.graph) {
            this.calcVertex(this.graph[key].name);
        }
        return this;
    },

    calcVertex(vertex, recalc) {    // считаем конкретный узел,
                                    // опция recalc позволяет пересчитать весь путь до узла
        if(!this.graph || typeof this.graph !== "object" || typeof this.graph[vertex] !== 'function')
            throw "Bad graph vertex, please use receiveGraphLazy or receiveGraphEager before calculate vertex ";

        if(typeof recalc === 'undefined')
            recalc = false;

        this.callStack = [];

        if (recalc)
        {
            this.connetivity    = [];
            this.results        = [];
        }

        return this.__getVertex(vertex);
    },


    __parseArgs(func) {  //да, я сдался и пошел простым путём парсинга формальных параметров
        if (typeof func !== 'function')
            throw "Bad parameter type in function __parseArgs";

        let args =
            this.graph[func.name].toString()
                .replace(/((\/\/.*$)|(\/\*[\s\S]*?\*\/)|(\s))/mg,'')
                .match(/[^\(]*\(\s*([^\)]*)\)/m)[1];

        if (args == "")
            return [];
        else
            return args.split(/,/);

    },

    __getArgs(vertex){  // считаем агрументы для узла
        //console.log("count " + vertex);

        if (typeof this.connetivity[vertex] === 'undefined')
        {
            //console.log("calc connectivity of " + vertex);
            this.connetivity[vertex] = this.__parseArgs(this.graph[vertex]);
        }

        let args = [];
        for (let i=0; i<this.connetivity[vertex].length; i++)
        {
            let arg = this.connetivity[vertex][i];

            if (arg !==  "")
                args.push(this.__getVertex(arg))
        }
        return args;
    },

    __getVertex(vertex){    // находим значение для узла

        //console.log("__getVertex = " + vertex);
        if (this.callStack[vertex])
        {
            console.log("Callstack:");
            console.log(this.callStack);
            throw ("Circle connectivity detected on vertex " + vertex);
        }
        this.callStack[vertex] = true;

        if (this.results === null)
            this.results = [];

        let result = null;

        if (typeof this.results[vertex] === 'undefined')
            result = this.results[vertex]
                = this.graph[vertex](...this.__getArgs(vertex));
        else
            result = this.results[vertex];

        this.callStack[vertex] = false;

        return result;
    }

};

Graph.receiveGraphLazy(myAmazingGraph);
Graph.receiveGraphEager(myAmazingGraph);
console.log("--------");
console.log("result = " + Graph.calcVertex('v'));
console.log("--------");
console.log("result = " + Graph.calcVertex('m2',true));

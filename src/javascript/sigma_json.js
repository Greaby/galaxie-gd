const forceAtlas2 = require("graphology-layout-forceatlas2");

const BASE_SIZE = 3;

module.exports = (graph) => {
    forceAtlas2.assign(graph, {
        iterations: 1000,
        adjustSizes: true,
    });

    graph.forEachNode((node, attributes) => {
        graph.setNodeAttribute(
            node,
            "size",
            BASE_SIZE * Math.sqrt(graph.degree(node))
        );
    });

    return graph.export();
};

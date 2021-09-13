const forceAtlas2 = require("graphology-layout-forceatlas2");

const BASE_SIZE = 3;

module.exports = (graph) => {
    const positions = forceAtlas2(graph, {
        iterations: 1000,
        adjustSizes: true,
    });

    let nodes = [];
    graph.forEachNode((node, attributes) => {
        nodes.push({
            id: parseInt(node),
            label: attributes.label,
            size: BASE_SIZE * Math.sqrt(graph.degree(node)),
            x: positions[node].x,
            y: positions[node].y,
            slug: attributes.slug,
            type: attributes.type,
        });
    });

    let edges = [];
    let id = 0;
    graph.forEachEdge(
        (
            edge,
            attributes,
            source,
            target,
            sourceAttributes,
            targetAttributes
        ) => {
            edges.push({
                id,
                source,
                target,
            });
            id += 1;
        }
    );

    return { nodes: nodes, edges: edges };
};

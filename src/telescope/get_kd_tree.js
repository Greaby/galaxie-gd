const { kdTree } = require("kd-tree-javascript");
const calculate_force_atlas = require("./calculate_force_atlas");

const distance = (a, b) => {
    return Math.pow(a.x - b.x, 2) + Math.pow(a.y - b.y, 2);
};

module.exports = (graph) => {
    let kd_tree_graph = graph.copy();

    kd_tree_graph.forEachNode((node, attributes) => {
        if (attributes.isolated) {
            kd_tree_graph.dropNode(node);
        }
    });

    calculate_force_atlas(kd_tree_graph);

    const points = kd_tree_graph
        .filterNodes((_node, attributes) => attributes.cat == "ressource")
        .map((node) => {
            return {
                x: kd_tree_graph.getNodeAttribute(node, "x"),
                y: kd_tree_graph.getNodeAttribute(node, "y"),
                id: node,
            };
        });

    return [new kdTree(points, distance, ["x", "y"]), kd_tree_graph];
};

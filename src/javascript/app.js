import Graph from "graphology";
import Sigma from "sigma";

const loadSigma = async (json_file) => {
    let data = await fetch(json_file).then((response) => response.json());
    const graph = new Graph();
    graph.import(data);

    const container = document.getElementById("graph-container");
    const renderer = new Sigma(graph, container);

    renderer.on("clickNode", ({ node, captor, event }) => {
        let slug = graph.getNodeAttribute(node, "slug");
        let type = graph.getNodeAttribute(node, "type");
        window.location = `./${type}-${slug}.html`;
    });
};

let json_file = "/index.json";

if (window.location.pathname !== "/") {
    json_file = window.location.pathname.replace(".html", ".json");
}

loadSigma(json_file);

// let sigma_instance = null;
// const loadSigma = (json_file) => {
//     if (sigma_instance !== null) {
//         sigma_instance.kill();
//     }

//     sigma.parsers.json(
//         json_file,
//         {
//             container: "graph-container",
//             settings: {
//                 nodesPowRatio: 0.75,
//                 maxNodeSize: 20,
//                 //defaultNodeColor: "#ec5148",
//                 labelThreshold: 5,
//             },
//         },
//         (s) => {
//             sigma_instance = s;

//             s.graph.nodes().forEach((node) => {
//                 switch (node.type.charAt(0)) {
//                     case "r":
//                         node.color = "#485922";
//                         break;
//                     case "t":
//                         node.color = "#798C35";
//                         break;
//                     case "a":
//                         node.color = "#B4BF5E";
//                         break;
//                 }
//             });
//             s.refresh({ skipIndexation: true });

//             s.bind("clickNode", function (event) {
//                 const node = event.data.node;

//                 loadSigma(`./${node.type}-${node.slug}.json`);
//                 loadPage(`${node.type}-${node.slug}`);
//             });
//         }
//     );
// };

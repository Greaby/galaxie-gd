let sigma_instance = null;
const loadSigma = (json_file) => {
    if (sigma_instance !== null) {
        sigma_instance.kill();
    }

    sigma.parsers.json(
        json_file,
        {
            container: "graph-container",
            settings: {
                nodesPowRatio: 0.75,
                maxNodeSize: 20,
                //defaultNodeColor: "#ec5148",
                labelThreshold: 5,
            },
        },
        (s) => {
            sigma_instance = s;

            s.graph.nodes().forEach((node) => {
                switch (node.slug.charAt(0)) {
                    case "r":
                        node.color = "#485922";
                        break;
                    case "t":
                        node.color = "#798C35";
                        break;
                    case "a":
                        node.color = "#B4BF5E";
                        break;
                }
            });
            s.refresh({ skipIndexation: true });

            s.bind("clickNode", function (event) {
                const node = event.data.node;

                loadSigma(`./${node.slug}.json`);
                loadPage(node.slug);
            });
        }
    );
};

const loadPage = (slug) => {
    fetch(`./${slug}.html`)
        .then((response) => {
            if (response.ok) {
                return response.text();
            }
        })
        .then((text) => {
            if (text) {
                const pageContent = document.querySelector("#page-content");
                pageContent.innerHTML = text;
            }
        });
};

loadSigma("./graph.json");

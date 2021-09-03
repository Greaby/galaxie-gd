var fs = require("fs");
const MarkdownIt = require("markdown-it");
const MarkdownItOEmbed = require("markdown-it-oembed");
const meta = require("markdown-it-meta");
const { parse } = require("querystring");
const slugify = require("slugify");
const Graph = require("graphology");
const forceAtlas2 = require("graphology-layout-forceatlas2");

const DIR_DIST = "dist";
const DIR_RESSOURCE = "ressources";

const BASE_SIZE = 5;

let id = 0;
let node_ids = [];
let getID = (node_name = null) => {
    if (node_name !== null && node_ids[node_name] !== undefined) {
        return node_ids[node_name];
    }

    id += 1;

    node_ids[node_name] = id.toString();
    return node_ids[node_name];
};

let getTagID = (title) => {
    const slug = `tag-${slugify(title, { lower: true, strict: true })}`;
    return [slug, getID(slug)];
};

let getAuthorID = (title) => {
    const slug = `author-${slugify(title, { lower: true, strict: true })}`;
    return [slug, getID(slug)];
};

let getRessourceID = (title) => {
    const slug = `ressource-${slugify(title, { lower: true, strict: true })}`;
    return [slug, getID(slug)];
};

let generateSigmaJSON = (graph) => {
    const positions = forceAtlas2(graph, { iterations: 500 });

    let nodes = [];
    graph.forEachNode((node, attributes) => {
        nodes.push({
            id: node,
            label: attributes.label,
            size: BASE_SIZE * Math.sqrt(graph.degree(node)),
            x: positions[node].x,
            y: positions[node].y,
            slug: attributes.slug,
        });
    });

    let edges = [];
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
                id: getID(),
                source: source,
                target: target,
            });
        }
    );

    return { nodes: nodes, edges: edges };
};

const initDistFolder = () => {
    // Init dist structure
    if (fs.existsSync(DIR_DIST)) {
        fs.rmSync(DIR_DIST, { recursive: true });
    }
    fs.mkdirSync(DIR_DIST);
};

const parseFiles = async () => {
    const graph = new Graph();

    const fileNames = await fs.promises.readdir(DIR_RESSOURCE);

    let citations = [];
    for (let index = 0; index < fileNames.length; index++) {
        const fileName = fileNames[index].replace(".md", "");

        console.log(`parse ${fileName}`);

        const content = await fs.promises.readFile(
            `${DIR_RESSOURCE}/${fileName}.md`,
            "utf-8"
        );

        const md = new MarkdownIt({
            linkify: true,
            breaks: false,
        });
        md.use(meta);
        md.use(MarkdownItOEmbed);

        let rendered = await md.renderAsync(content);

        rendered = `<h2>${md.meta.title}</h2>${rendered}`;

        let [slug, ressourceID] = getRessourceID(fileName);

        // save html file
        fs.writeFile(`${DIR_DIST}/${slug}.html`, rendered, function (err) {
            if (err) return console.log(err);
        });

        if (!graph.hasNode(ressourceID)) {
            console.log(`add node ${slug}`);
            graph.addNode(ressourceID, {
                label: md.meta.title,
                x: Math.floor(Math.random() * 100),
                y: Math.floor(Math.random() * 100),
                slug: slug,
            });
        }

        if (md.meta.citations) {
            md.meta.citations.forEach((citation) => {
                citations.push([ressourceID, getID(citation)]);
            });
        }

        md.meta.authors.forEach((author) => {
            let [slug, authorID] = getAuthorID(author);
            if (!graph.hasNode(authorID)) {
                console.log(`add node ${slug}`);
                graph.addNode(authorID, {
                    label: author,
                    x: Math.floor(Math.random() * 100),
                    y: Math.floor(Math.random() * 100),
                    slug: slug,
                });
            }

            graph.addEdge(authorID, ressourceID);
        });

        md.meta.tags.forEach((tag) => {
            const [slug, tagID] = getTagID(tag);
            if (!graph.hasNode(tagID)) {
                console.log(`add node ${slug}`);
                graph.addNode(tagID, {
                    label: tag,
                    x: Math.floor(Math.random() * 100),
                    y: Math.floor(Math.random() * 100),
                    slug: slug,
                });
            }
            graph.addEdge(tagID, ressourceID);
        });
    }

    citations.forEach(([source, target]) => {
        graph.addEdge(source, target);
    });

    // save main graph
    fs.writeFile(
        `${DIR_DIST}/graph.json`,
        JSON.stringify(generateSigmaJSON(graph)),
        function (err) {
            if (err) return console.log(err);
        }
    );

    // save sub graphs
    graph.forEachNode((node, attributes) => {
        const subGraph = new Graph();

        subGraph.addNode(node, attributes);

        graph.forEachNeighbor(node, function (neighbor, attributes) {
            if (!subGraph.hasNode(neighbor)) {
                subGraph.addNode(neighbor, attributes);
            }
            subGraph.addEdge(node, neighbor);

            graph.forEachNeighbor(
                neighbor,
                function (secondNeighbor, attributes) {
                    if (!subGraph.hasNode(secondNeighbor)) {
                        subGraph.addNode(secondNeighbor, attributes);
                    }

                    subGraph.addEdge(neighbor, secondNeighbor);
                }
            );
        });

        fs.writeFile(
            `${DIR_DIST}/${attributes.slug}.json`,
            JSON.stringify(generateSigmaJSON(subGraph)),
            function (err) {
                if (err) return console.log(err);
            }
        );
    });
};

initDistFolder();
parseFiles();
return;

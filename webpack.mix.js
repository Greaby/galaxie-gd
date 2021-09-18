let mix = require("laravel-mix");
var fs = require("fs");

const Twig = require("twig");
const slugify = require("slugify");
const { Graph } = require("graphology");
const pagerank = require("graphology-pagerank");

const generateSigmaJSON = require("./src/javascript/sigma_json");
const parseMarkdownFile = require("./src/javascript/parse_markdown_file");

const timestamp = Date.now();
const BASE_SIZE = 3;

const DIR_DIST = "dist";
const DATA_FOLDER = "data";
const DIR_RESSOURCE = "data/ressources";

let id_index = 0;
let node_ids = [];

let files_to_render = [];

let getID = (title, type = null) => {
    let slug = slugify(title, { lower: true, strict: true });
    let key = [type, slug].filter((n) => n).join("-");

    let id = null;
    if (key !== null && node_ids[key] !== undefined) {
        id = node_ids[key];
    } else {
        id = id_index;
        node_ids[key] = id;
        id_index += 1;
    }

    return { slug, id };
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
        if (fileNames[index][0] === ".") {
            continue;
        }

        const file_data = await parseMarkdownFile(
            `${DATA_FOLDER}/ressources/${fileNames[index]}`
        );
        const { slug, id } = getID(
            fileNames[index].replace(".md", ""),
            "ressource"
        );

        files_to_render.push({
            type: "ressource",
            id: id,
            title: file_data.env.title,
            slug: slug,
            content: file_data.render,
        });

        if (!graph.hasNode(id)) {
            console.log(`add node ${slug}`);
            graph.addNode(id, {
                label: file_data.env.title,
                x: Math.floor(Math.random() * 100),
                y: Math.floor(Math.random() * 100),
                slug: slug,
                type: "ressource",
            });
        }

        if (file_data.meta.citations) {
            file_data.meta.citations.forEach((citation) => {
                let [type, slug] = citation.split(":");
                citations.push([id, type, slug]);
            });
        }

        file_data.meta.authors.forEach(async (author) => {
            let { slug, id: authorID } = getID(author, "author");
            if (!graph.hasNode(authorID)) {
                console.log(`add author node ${slug}`);
                graph.addNode(authorID, {
                    label: author,
                    x: Math.floor(Math.random() * 100),
                    y: Math.floor(Math.random() * 100),
                    slug: slug,
                    type: "author",
                });

                let content = `<h1>${author}</h1>`;

                if (fs.existsSync(`data/authors/${slug}.md`)) {
                    const author_data = await parseMarkdownFile(
                        `data/authors/${slug}.md`
                    );

                    content = author_data.render;
                }

                files_to_render.push({
                    type: "author",
                    id: authorID,
                    title: author,
                    slug: slug,
                    content: content,
                });
            }

            graph.addEdge(authorID, id);
            graph.addEdge(id, authorID);
        });

        file_data.meta.tags.forEach(async (tag) => {
            const { slug, id: tagID } = getID(tag, "tag");
            if (!graph.hasNode(tagID)) {
                console.log(`add tag node ${slug}`);
                graph.addNode(tagID, {
                    label: tag,
                    x: Math.floor(Math.random() * 100),
                    y: Math.floor(Math.random() * 100),
                    slug: slug,
                    type: "tag",
                });

                let content = `<h1>${tag}</h1>`;

                if (fs.existsSync(`data/tags/${slug}.md`)) {
                    const tag_data = await parseMarkdownFile(
                        `data/tags/${slug}.md`
                    );

                    content = tag_data.render;
                }

                files_to_render.push({
                    type: "tag",
                    id: tagID,
                    title: tag,
                    slug: slug,
                    content: content,
                });
            }
            graph.addEdge(tagID, id);
            graph.addEdge(id, tagID);
        });
    }

    citations.forEach(([source_id, type, slug]) => {
        let { id: target_id } = getID(slug, type);

        if (graph.hasNode(target_id)) {
            console.log(`add citation ${source_id}->${slug}`);
            graph.addEdge(source_id, target_id);
        }
    });

    pagerank.assign(graph);
    const ranks = graph.nodes().map((node) => {
        return graph.getNodeAttribute(node, "pagerank");
    });

    const min_rank = Math.min(...ranks);
    const max_rank = Math.max(...ranks);

    const MIN_SIZE = 5;
    const MAX_SIZE = 25;

    const lerp = (x, y, a) => x * (1 - a) + y * a;
    const clamp = (a, min = 0, max = 1) => Math.min(max, Math.max(min, a));
    const invlerp = (x, y, a) => clamp((a - x) / (y - x));
    const range = (x1, y1, x2, y2, a) => lerp(x2, y2, invlerp(x1, y1, a));

    // set node size
    graph.forEachNode((node, attributes) => {
        graph.setNodeAttribute(
            node,
            "size",
            Math.round(
                range(
                    min_rank,
                    max_rank,
                    MIN_SIZE,
                    MAX_SIZE,
                    attributes.pagerank
                )
            )
        );
    });

    // save main graph
    fs.writeFile(
        `${DIR_DIST}/index.json`,
        JSON.stringify(generateSigmaJSON(graph)),
        function (err) {
            if (err) return console.log(err);
        }
    );

    // render html files
    files_to_render.forEach((data) => {
        let links = [];
        let added_nodes = [];
        graph.forEachNeighbor(data.id, function (neighbor, attributes) {
            if (neighbor != data.id && !added_nodes.includes(neighbor)) {
                added_nodes.push(neighbor);
                links.push({
                    type: attributes.type,
                    slug: attributes.slug,
                    title: attributes.label,
                    rank: attributes.pagerank,
                });
            }

            graph.forEachNeighbor(
                neighbor,
                function (secondNeighbor, attributes) {
                    if (
                        secondNeighbor != data.id &&
                        !added_nodes.includes(secondNeighbor)
                    ) {
                        added_nodes.push(secondNeighbor);
                        links.push({
                            type: attributes.type,
                            slug: attributes.slug,
                            title: attributes.label,
                            rank: attributes.pagerank,
                        });
                    }
                }
            );
        });

        links = links.sort((a, b) => (a.rank > b.rank ? -1 : 1)).slice(0, 5);

        Twig.renderFile(
            "./src/template.twig",
            {
                timestamp,
                content: data.content,
                title: data.title,
                links: links,
            },
            (err, html) => {
                fs.writeFile(
                    `${DIR_DIST}/${data.type}-${data.slug}.html`,
                    html,
                    function (err) {
                        if (err) return console.log(err);
                    }
                );
            }
        );
    });

    // save main markdown
    let main_data = await parseMarkdownFile(`${DATA_FOLDER}/index.md`);

    Twig.renderFile(
        "./src/template.twig",
        { timestamp, content: main_data.render },
        (err, html) => {
            fs.writeFile(`${DIR_DIST}/index.html`, html, function (err) {
                if (err) return console.log(err);
            });
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

        let file_name = [attributes.type, attributes.slug]
            .filter((n) => n)
            .join("-");

        fs.writeFile(
            `${DIR_DIST}/${file_name}.json`,
            JSON.stringify(generateSigmaJSON(subGraph)),
            function (err) {
                if (err) return console.log(err);
            }
        );
    });
};

initDistFolder();
parseFiles();

// build sass and js
mix.setPublicPath(DIR_DIST);
mix.setResourceRoot(".");
mix.options({
    legacyNodePolyfills: false,
});
mix.webpackConfig({
    resolve: { fallback: { http: false } },
    output: {
        filename: "js/[name].js",
        chunkFilename: "js/chunks/[name].js",
    },
});
mix.sass("src/scss/app.scss", "");
mix.js("src/javascript/app.js", "");
mix.disableNotifications();

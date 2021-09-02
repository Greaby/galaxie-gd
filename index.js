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

const BASE_SIZE = 10;

let id = 0;
let getID = () => {
    id += 1;
    return id;
};

let getTagID = (title) => {
    const slug = slugify(title, { lower: true });
    return `t:${slug}`;
};

let getAuthorID = (title) => {
    const slug = slugify(title, { lower: true });
    return `a:${slug}`;
};

let getRessourceID = (title) => {
    const slug = slugify(title, { lower: true });
    return `r:${slug}`;
};

const initDistFolder = () => {
    // Init dist structure
    if (fs.existsSync(DIR_DIST)) {
        fs.rmdirSync(DIR_DIST, { recursive: true });
    }
    fs.mkdirSync(DIR_DIST);
    fs.mkdirSync(DIR_DIST + "/" + DIR_RESSOURCE);
};

const parseFiles = async () => {
    const graph = new Graph();

    const fileNames = await fs.promises.readdir(DIR_RESSOURCE);

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

        // save html file
        fs.writeFile(`${DIR_DIST}/${fileName}.html`, rendered, function (err) {
            if (err) return console.log(err);
        });

        let ressourceID = getRessourceID(fileName);

        if (!graph.hasNode(ressourceID)) {
            console.log(`add node ${ressourceID}`);
            graph.addNode(ressourceID, {
                label: md.meta.title,
                x: Math.floor(Math.random() * 100),
                y: Math.floor(Math.random() * 100),
            });
        }

        md.meta.authors.forEach((author) => {
            let authorID = getAuthorID(author);
            if (!graph.hasNode(authorID)) {
                graph.addNode(authorID, {
                    label: author,
                    x: Math.floor(Math.random() * 100),
                    y: Math.floor(Math.random() * 100),
                });
            }

            graph.addEdge(ressourceID, authorID);
        });

        md.meta.tags.forEach((tag) => {
            const tagID = getTagID(tag);
            if (!graph.hasNode(tagID)) {
                console.log(`add node ${tagID}`);
                graph.addNode(tagID, {
                    label: tag,
                    x: Math.floor(Math.random() * 100),
                    y: Math.floor(Math.random() * 100),
                });
            }
            graph.addEdge(ressourceID, tagID);
        });
    }

    const positions = forceAtlas2(graph, { iterations: 500 });

    graph.forEachNode((node) => {
        graph.updateNode(node, (attr) => {
            return {
                ...attr,
                size: BASE_SIZE * Math.sqrt(graph.degree(node)),
                x: positions[node].x,
                y: positions[node].y,
            };
        });
    });

    fs.writeFile(
        `${DIR_DIST}/graph.json`,
        JSON.stringify(graph.export()),
        function (err) {
            if (err) return console.log(err);
        }
    );
};

initDistFolder();
parseFiles();
return;

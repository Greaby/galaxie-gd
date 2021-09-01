var fs = require("fs");
const MarkdownIt = require("markdown-it");
const MarkdownItOEmbed = require("markdown-it-oembed");
const meta = require("markdown-it-meta");
const { parse } = require("querystring");

const DIRNAME = "ressources/";
const DIR_DIST = "dist/";

let id = 0;
let getID = () => {
    id += 1;
    return id;
};

let parseFiles = async () => {
    if (fs.existsSync(DIR_DIST)) {
        fs.rmdirSync(DIR_DIST, { recursive: true });
    }

    fs.mkdirSync(DIR_DIST);

    const fileNames = await fs.promises.readdir(DIRNAME);
    console.log(fileNames);

    let edges = [];
    let nodes = {};
    for (let index = 0; index < fileNames.length; index++) {
        const fileName = fileNames[index].replace(".md", "");
        const content = await fs.promises.readFile(
            DIRNAME + fileName + ".md",
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
        fs.writeFile(DIR_DIST + fileName + ".html", rendered, function (err) {
            if (err) return console.log(err);
        });

        nodes["r:" + fileName] = {
            label: md.meta.title,
            id: "r:" + fileName,
            x: Math.floor(Math.random() * 100),
            y: Math.floor(Math.random() * 100),
            size: 16,
        };

        md.meta.authors.forEach((author) => {
            nodes["a:" + author] = {
                label: author,
                id: "a:" + author,
                x: Math.floor(Math.random() * 100),
                y: Math.floor(Math.random() * 100),
                size: 16,
            };

            edges.push({
                source: "r:" + fileName,
                target: "a:" + author,
                id: getID(),
            });
        });

        md.meta.tags.forEach((tag) => {
            nodes["t:" + tag] = {
                label: tag,
                id: "t:" + tag,
                x: Math.floor(Math.random() * 100),
                y: Math.floor(Math.random() * 100),
                size: 16,
            };
            edges.push({
                source: "r:" + fileName,
                target: "t:" + tag,
                id: getID(),
            });
        });
    }

    console.log(edges);

    fs.writeFile(
        DIR_DIST + "graph" + ".json",
        JSON.stringify({ edges: edges, nodes: Object.values(nodes) }),
        function (err) {
            if (err) return console.log(err);
        }
    );
};
parseFiles();
return;

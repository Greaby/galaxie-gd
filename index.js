var fs = require("fs");
const MarkdownIt = require("markdown-it");
const MarkdownItOEmbed = require("markdown-it-oembed");
const meta = require("markdown-it-meta");
const { parse } = require("querystring");

const DIRNAME = "ressources/";
const DIR_DIST = "dist/";

let parseFiles = async () => {
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

    nodes["r:" + fileName] = { title: md.meta.title, id: "r:" + fileName };

    md.meta.authors.forEach((author) => {
      nodes["a:" + author] = { title: author, id: "a:" + author };

      edges.push({
        source: "r:" + fileName,
        target: "a:" + author,
      });
    });

    md.meta.tags.forEach((tag) => {
      nodes["t:" + tag] = { title: tag, id: "t:" + tag };
      edges.push({
        source: "r:" + fileName,
        target: "t:" + tag,
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

fs.readdir(DIRNAME, async function (err, filenames) {
  if (err) {
    onError(err);
    return;
  }

  let promises = [];
  console.log(filenames);

  let edges = await filenames.map(async function (filename) {
    filename = filename.replace(".md", "");

    let aaa = [];

    await fs.promises.readFile(
      DIRNAME + filename + ".md",
      "utf-8",
      async function (err, content) {
        if (err) {
          onError(err);
          return;
        }

        const md = new MarkdownIt({
          linkify: true,
          breaks: false,
        });
        // Add markdown-it-meta
        md.use(meta);
        md.use(MarkdownItOEmbed);
        let renderedDocument = await md.renderAsync(content);

        fs.writeFile(
          DIR_DIST + filename + ".html",
          renderedDocument,
          function (err) {
            if (err) return console.log(err);
          }
        );

        //promises.push(promise);

        md.meta.authors.forEach((author) => {
          aaa.push({ from: filename, to: author });
        });
        return renderedDocument;
      }
    );

    console.log(aaa);

    return aaa;
  });

  console.log(edges);
});

module.exports = {
    base_url: "https://greaby.github.io/galaxie-gd/",

    language: "fr",

    seed: "galaxie-gd",

    folders: {
        dist: "dist",
        data: "data",
        ressources: "data/ressources",
    },

    labels: {
        project_title: "Galaxie GD",
        see_also: "Voir aussi",
        search: "Rechercher",
    },

    ressource: {
        color: "#D24335",
    },

    current_node: {
        color: "#F2C84B",
    },

    metadata: {
        tag: {
            label: "Tags",
            color: "#87AA66",
            display_on_page: true,
            display_on_graph: true,
        },
        author: {
            label: "Auteur·e·s",
            color: "#4CB3D2",
            display_on_page: true,
            display_on_graph: true,
        },
    },
    hide_isolated_metadata: true,
    isolated_metadata_threshold: 2,

    graph: {
        node_min_size: 5,
        node_max_size: 25,
    },
};

# Paysage GD

<p>
    <a href="https://github.com/Greaby/galaxie-gd/issues">
      <img alt="Issues" src="https://img.shields.io/github/issues/greaby/galaxie-gd?color=D94D4C" />
    </a>
    <a href="https://github.com/Greaby/galaxie-gd/pulls">
      <img alt="Pull requests" src="https://img.shields.io/github/issues-pr/greaby/galaxie-gd?color=ECA539" />
    </a>
</p>

https://greaby.github.io/galaxie-gd/

Ce projet permet, au travers d’une carte interactive, d’explorer les différentes ressources (vidéos, articles de blog, podcasts, etc.) francophones traitant et analysant le jeu vidéo.

Les ressources sont représentées sous forme de fiche en Markdown avec des métadonnées telles que les auteurs et les sujets traités. Le moteur [Telescope](https://github.com/greaby/telescope) est utilisé pour générer les pages et le graph automatique à chaque modification.

[![Readme Card](https://github-readme-stats.vercel.app/api/pin/?username=greaby&repo=telescope)](https://github.com/greaby/telescope)


# Comment contribuer ?

Cette documentation est collaborative, chacun est libre de proposer de nouvelles ressources, des modifications et corrections.

Pour ajouter un contenu, copiez le template de fiche se trouvant dans `data/template.md`. Le template utilise le format [Markdown](https://guides.github.com/features/mastering-markdown/) avec des métadonnées en [YAML front matter](https://fr.wikipedia.org/wiki/YAML) en en-tête. Il est possible de créer des fiches de ressources, d’auteurs et de tags.

Les fichiers de ressources seront automatiquement parsés pour générer le graph. Le nom du fichier de ressource est libre, la bonne pratique est de créer un slug du titre de la ressource. Par exemple:

`Titre de ma ressource` devient `titre-de-ma-ressource.md`

Les fichiers d’auteurs et de tags sont parsés seulement si ceux-ci sont présents dans au moins une ressource. Elles n'ont pas besoin d'avoir le markup Yaml en en-tête.

Le slug doit correspondre à celui généré par le moteur (visible dans l’URL). Par exemple:

`author-mon-auteur.html` devient `mon-auteur.md`

Une fois vos fiches créées, envoyez une [pull-request](https://github.com/Greaby/galaxie-gd/pulls). Dès que celle-ci sera validée, le site sera mis à jour avec votre contenu.


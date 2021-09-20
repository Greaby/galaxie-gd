# Comment contribuer ?

Cette documentation est collaborative, chacun est libre de proposer de nouvelles ressources, des modifications et corrections.

Pour ajouter un contenu, copiez le template de fiche se trouvant dans `data/template.md`. Le template utilise le format [Markdown](https://guides.github.com/features/mastering-markdown/) avec des métadonnées en [YAML front matter](https://fr.wikipedia.org/wiki/YAML) en en-tête. Il est possible de créer des fiches de ressources, d’auteurs et de tags.

Les fichiers de ressources seront automatiquement parsés pour générer le graph. Le nom du fichier de ressource est libre, la bonne pratique est de créer un slug du titre de la ressource. Par exemple:

`Titre de ma ressource` devient `titre-de-ma-ressource.md`

Les fichiers d’auteurs et de tags sont parsés seulement si ceux-ci sont présents dans au moins une ressource. Elles n'ont pas besoin d'avoir le markup Yaml en en-tête.

Le slug doit correspondre à celui généré par le moteur (visible dans l’URL). Par exemple:

`author-mon-auteur.html` devient `mon-auteur.md`

Une fois vos fiches créées, envoyez une [pull-request](https://github.com/Greaby/galaxie-gd/pulls). Dès que celle-ci sera validée, le site sera mis à jour avec votre contenu.

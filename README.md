# Application de révision

Cette application Web permet d'enregistrer des leçons et de planifier les dates de révision. Les données sont stockées localement dans le navigateur via `localStorage`.

## Lancer l'application

1. Ouvrir `index.html` dans un navigateur moderne.
2. Ajouter des leçons via le formulaire (titre, matière, description, date de première révision, taux d'apprentissage en jours).
3. Les leçons apparaissent dans le calendrier. Vous pouvez afficher la vue semaine ou mois et naviguer grâce aux boutons.
4. Chaque journée peut contenir jusqu'à dix leçons. Lorsqu'une leçon est révisée, une fenêtre propose quatre choix d’évaluation. Selon votre réponse, la nouvelle date est calculée par `date actuelle + k^n` où `n` est le taux d'apprentissage (augmenté de 1) et `k` vaut 1.2, 1, 0.5 ou 0.01.
5. Les leçons peuvent être modifiées via le bouton **Modifier** affiché dans le calendrier.

Aucune installation supplémentaire n'est requise.
L'interface est basée sur Bootstrap pour un rendu plus agréable.

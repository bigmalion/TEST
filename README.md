# Application de révision

Cette application Web permet d'enregistrer des leçons et de planifier les dates de révision. Les données sont stockées localement dans le navigateur via `localStorage`.

## Lancer l'application

1. Ouvrir `index.html` dans un navigateur moderne.
2. Ajouter des leçons via le formulaire (titre, matière, description, date de première révision, taux d'apprentissage en jours).
3. Les leçons apparaissent dans le calendrier. Vous pouvez afficher la vue semaine ou mois et naviguer grâce aux boutons.
4. Chaque journée peut contenir jusqu'à dix leçons. Lorsqu'une leçon est révisée, une fenêtre propose quatre choix d’évaluation. Selon votre réponse, la nouvelle date est calculée par `date actuelle + k^n` où `n` est le taux d'apprentissage (augmenté de 1) et `k` vaut 1.2, 1, 0.5 ou 0.01.
5. Les leçons peuvent être modifiées, y compris leur taux d'apprentissage, via le bouton **Modifier**.
6. Un onglet **Statistiques** affiche le nombre total de leçons, leur taux d'apprentissage moyen et un histogramme du nombre de révisions.
7. L'onglet **Tâches** (sélectionné par défaut) permet d'organiser sa journée avec une liste de choses à faire. Chaque tâche possède un minuteur (bouton Play/Stop) qui incrémente automatiquement le temps réalisé. L'onglet actif est mémorisé pour la prochaine ouverture de la page.

Aucune installation supplémentaire n'est requise.
L'interface est basée sur Bootstrap pour un rendu plus agréable.

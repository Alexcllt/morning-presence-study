# Morning Presence V4.1 — Questionnaire enrichi

## Modifications
- Ajout du genre après le pays
- Ajout de l’usage actuel de produits pour paraître moins fatigué
- Question conditionnelle sur le type de produit utilisé
- Reformulation de la question sur le bénéfice principal
- Progression automatiquement adaptée à la question conditionnelle
- Design V4, devises locales, cinq langues, A/B test et Google Sheets conservés

## Mise à jour GitHub recommandée
Remplacez uniquement :
- `data.js`
- `app.js`

Le design (`index.html` et `styles.css`) ne change pas.

## Important pour app.js
Le fichier fourni contient le placeholder :

`PASTE_GOOGLE_APPS_SCRIPT_WEB_APP_URL_HERE`

Avant de l’envoyer sur GitHub, remettez votre URL Google Apps Script se terminant par `/exec`.

## Test rapide
1. Sélectionnez « Jamais » à la question sur l’usage de produits : la question sur les types de produits doit être ignorée.
2. Sélectionnez « Occasionnellement » : la question conditionnelle doit apparaître.
3. Envoyez une réponse et vérifiez les nouvelles colonnes dans Google Sheets :
   - `gender`
   - `product_use`
   - `product_types`

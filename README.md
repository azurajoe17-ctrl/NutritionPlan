# NutritionPlan – Food Nutrition Application

Electron desktop app using Spoonacular recipe nutrition data, student-written diet suggestions, calorie calculation, and localStorage CRUD.

## Setup (Windows / VS Code)
1. Install Node.js LTS and open this folder in VS Code.
2. Copy `renderer/config.example.js` to `renderer/config.js` (already included in download).
3. Replace `PASTE_YOUR_SPOONACULAR_API_KEY_HERE` with your own Spoonacular API key. Do **not** commit this file to GitHub.
4. Open VS Code Terminal and run `npm install` then `npm start`.
5. Search for `chicken`, choose a diet goal, calculate servings, add a food, then edit/delete it in Food Intake Records.

## Notes
- Uses `https://api.spoonacular.com/recipes/complexSearch` with `addRecipeNutrition=true`.
- API results are recipes, and nutrient amounts are **per recipe serving**, not per 100 g. API availability, plan access, and quota may vary.
- LocalStorage persists records and last suggestions between launches on the same computer/profile.
- This is an educational food journal, not a medical diet recommendation.
- API keys in client-side applications are visible to the app user; this configuration is suitable for a local class project, not a production deployment.

## Suggested tests
- Blank search; invalid key; no results; successful search; missing nutrition; no matching diet; zero/negative servings; create/edit/delete; reopen app and verify persistence.

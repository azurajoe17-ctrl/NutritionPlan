const queryInput = document.getElementById('query');
const resultsEl = document.getElementById('results');
const statusEl = document.getElementById('status');
const suggestionsEl = document.getElementById('suggestions');

let foods = [];

function nutrient(recipe, name) {

    const n = recipe.nutrition?.nutrients?.find(
        item => item.name.toLowerCase() === name.toLowerCase()
    );

    return Number.isFinite(Number(n?.amount))
        ? Number(n.amount)
        : null;
}

function normalizeRecipe(recipe) {

    return {
        id: recipe.id,
        name: recipe.title,
        image: recipe.image,
        calories: nutrient(recipe, 'Calories'),
        protein: nutrient(recipe, 'Protein'),
        carbs: nutrient(recipe, 'Carbohydrates'),
        fat: nutrient(recipe, 'Fat')
    };
}

function nutritionReady(food) {

    return ['calories', 'protein', 'carbs', 'fat'].every(
        k => food[k] !== null && food[k] >= 0
    );

}

function foodCard(food) {

    const article = document.createElement('article');
    article.className = 'food-card';

    if (food.image && /^https:\/\//.test(food.image)) {

        const img = document.createElement('img');

        img.src = food.image;
        img.alt = food.name;
        img.loading = 'lazy';

        article.appendChild(img);

    }

    const body = document.createElement('div');
    body.className = 'food-body';
    const title = document.createElement('h3');
    title.textContent = food.name;
    body.appendChild(title);
    const desc = document.createElement('p');
    desc.className = 'muted';
    desc.textContent = nutritionReady(food)
        ? `${round1(food.calories)} kcal · ` +
          `Protein ${round1(food.protein)} g · ` +
          `Carbs ${round1(food.carbs)} g · ` +
          `Fat ${round1(food.fat)} g (per serving)`
        : 'Nutrition data unavailable for this result';
    body.appendChild(desc);

    if (nutritionReady(food)) {
        const row = document.createElement('div');
        row.className = 'inline-row';


        const qty = document.createElement('input');

        qty.type = 'number';
        qty.min = '0.1';
        qty.max = '100';
        qty.step = '0.1';
        qty.value = '1';

        qty.setAttribute(
            'aria-label',
            'Number of servings'
        );

        const calc = document.createElement('button');

        calc.textContent = 'Calculate';
        calc.className = 'secondary';
        const add = document.createElement('button');
        add.textContent = 'Add to diary';
        const output = document.createElement('p');
        output.className = 'calculation';

        calc.addEventListener('click', () => {

            const n = Number(qty.value);

            output.textContent =
                n > 0 && n <= 100 && Number.isFinite(n)
                    ? `Total calories: ${round1(food.calories * n)} ` +
                      `kcal for ${n} serving(s)`
                    : 'Enter servings between 0.1 and 100.';
        });

        add.addEventListener('click', () => {

            const n = Number(qty.value);

            if (
                !Number.isFinite(n) ||
                n < 0.1 ||
                n > 100
            ) {

                output.textContent =
                    'Enter servings between 0.1 and 100.';
                return;
            }

            try {
                const records = getRecords();
                records.push(
                    new FoodRecord({
                        ...food,
                        servings: n,
                        source: 'Spoonacular'
                    })
                );

                saveRecords(records);
                output.textContent =
                    'Saved! Open Food Intake Records to view or edit.';

            } catch {

                output.textContent =
                    'Could not save the record.';
            }
        });

        row.append(qty, calc, add);
        body.append(row, output);
    }

    article.appendChild(body);
    return article;
}


// 8. SEARCH FOOD USING SPOONACULAR API

async function searchFoods() {
    const query = queryInput.value.trim();
    const key = window.NUTRITION_CONFIG?.apiKey?.trim();

    if (!query) {
        statusEl.textContent = 'Please enter a food name.';
        return;
    }

    if (
        !key ||
        key === 'PASTE_YOUR_SPOONACULAR_API_KEY_HERE'
    ) {

        statusEl.textContent =
            'Add your Spoonacular API key in renderer/config.js first.';
        return;
    }

    statusEl.textContent = 'Searching Spoonacular...';
    resultsEl.replaceChildren();
    foods = [];

    document.getElementById('resultCount').textContent = '';

    try {

        const url = new URL(
            'https://api.spoonacular.com/recipes/complexSearch'
        );

        url.search = new URLSearchParams({
            query,
            number: '8',
            addRecipeNutrition: 'true',
            apiKey: key
        }).toString();

        const response = await fetch(url);

        if (!response.ok) {

            throw new Error(
                response.status === 402
                    ? 'API quota exceeded. Try again later.'
                    : `API request failed (${response.status}).`
            );
        }

        const data = await response.json();
        if (!Array.isArray(data.results)) {
            throw new Error('Unexpected API response.');
        }

        foods = data.results.map(normalizeRecipe);

        statusEl.textContent = foods.length
            ? 'Results loaded successfully.'
            : 'No foods found. Try another search term.';

        document.getElementById('resultCount').textContent =
            `${foods.length} result(s)`;

        foods.forEach(food => {
            resultsEl.appendChild(foodCard(food));
        });

        if (!foods.length) {
            resultsEl.textContent = 'No results available.';
        }

    } catch (error) {

        statusEl.textContent =
            error.message ||
            'Could not load food data. Check internet connection and API key.';
        resultsEl.textContent = 'Search unavailable.';
    }
}

function suggestFoods() {

    const diet = document.getElementById('diet').value;

    if (!foods.length) {
        suggestionsEl.textContent = 'Search for food first.';
        return;
    }

    const suitable = foods.filter(food => {

        if (!nutritionReady(food)) {
            return false;
        }

        if (diet === 'protein') {
            return food.protein >= 20;
        } else if (diet === 'fat') {
            return food.fat <= 10;
        } else if (diet === 'carb') {
            return food.carbs <= 30;
        } else {
            return food.calories >= 200 &&
                   food.calories <= 700;
        }
    });

    const names = suitable.map(food => food.name);

    suggestionsEl.textContent = names.length
        ? `Suggested: ${names.join(' • ')}`
        : 'No suitable suggestions for this goal among current results.';

    localStorage.setItem(
        SUGGESTION_KEY,
        JSON.stringify({
            diet,
            names,
            searched: queryInput.value.trim()
        })
    );
}

document.getElementById('searchBtn')
    .addEventListener('click', searchFoods);

queryInput.addEventListener('keydown', e => {

    if (e.key === 'Enter') {
        searchFoods();
    }
});

document.getElementById('suggestBtn')
    .addEventListener('click', suggestFoods);

try {

    const saved = JSON.parse(
        localStorage.getItem(SUGGESTION_KEY)
    );

    if (saved?.names) {

        suggestionsEl.textContent =
            `Last saved suggestions (${saved.diet}): ` +
            `${saved.names.join(' • ') || 'None available'}`;
    }

} catch {

}
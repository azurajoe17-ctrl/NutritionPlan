class FoodRecord {
    constructor({
        id,
        name,
        servings,
        calories,
        protein,
        carbs,
        fat,
        source = 'Manual'
    }) {

        this.id = id || (
            globalThis.crypto?.randomUUID?.() ||
            String(Date.now()) + Math.random()
        );

        this.name = name.trim();
        this.servings = Number(servings);
        this.calories = Number(calories);
        this.protein = Number(protein);
        this.carbs = Number(carbs);
        this.fat = Number(fat);
        this.source = source;
    }

    total(field) {
        return this.servings * this[field];

    }
}

const STORAGE_KEY = 'nutritionplan_records_v1';

const SUGGESTION_KEY = 'nutritionplan_suggestions_v1';

function getRecords() {

    try {

        const data = JSON.parse(
            localStorage.getItem(STORAGE_KEY) || '[]'
        );

        return Array.isArray(data) ? data : [];

    } catch {

        return [];
    }
}

function saveRecords(records) {

    localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(records)
    );
}

function validNonnegative(value, max = 10000) {

    return (
        Number.isFinite(Number(value)) &&
        String(value).trim() !== '' &&
        Number(value) >= 0 &&
        Number(value) <= max
    );
}

function round1(n) {

    return (
        Math.round(n * 10) / 10
    ).toFixed(1);
}

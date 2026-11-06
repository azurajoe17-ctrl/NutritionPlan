const form = document.getElementById('foodForm');
const list = document.getElementById('recordList');
const feedback = document.getElementById('formStatus');

const fields = ['calories', 'protein', 'carbs', 'fat'];

function clearForm() {

    form.reset();
    document.getElementById('editId').value = '';
    document.getElementById('saveBtn').textContent = 'Save record';

}

function render() {

    const records = getRecords();
    list.replaceChildren();
    document.getElementById('recordCount').textContent =
        `${records.length} saved record(s)`;

    const sums = Object.fromEntries(
        fields.map(field => [
            field,
            records.reduce(
                (sum, record) =>
                    sum + Number(record.servings) * Number(record[field]),
                0
            )
        ])
    );

    document.getElementById('totals')
        .querySelectorAll('strong')
        .forEach((el, index) => {

            const key = fields[index];

            el.textContent =
                `${round1(sums[key])} ${key === 'calories' ? 'kcal' : 'g'}`;
        });

    if (!records.length) {

        const empty = document.createElement('div');
        empty.className = 'empty';
        empty.textContent =
            'No records yet. Add a food above or search on Explore Food.';

        list.appendChild(empty);
        return;
    }

    records.forEach(record => {

        const row = document.createElement('article');
        row.className = 'record';

        const info = document.createElement('div');

        const heading = document.createElement('h3');
        heading.textContent = record.name;

        const details = document.createElement('p');
        details.className = 'muted';

        details.textContent =
            `${record.servings} serving(s) · ` +
            `${round1(record.servings * record.calories)} kcal · ` +
            `${record.source}`;

        info.append(heading, details);

        const buttons = document.createElement('div');
        buttons.className = 'actions';

        const edit = document.createElement('button');
        edit.className = 'secondary';
        edit.textContent = 'Edit';

        edit.addEventListener('click', () => {

            document.getElementById('editId').value = record.id;
            document.getElementById('foodName').value = record.name;
            document.getElementById('servings').value = record.servings;

            fields.forEach(k => {
                document.getElementById(k).value = record[k];

            });

            document.getElementById('saveBtn').textContent =
                'Update record';

            feedback.textContent = `Editing ${record.name}`;

            window.scrollTo({
                top: 250,
                behavior: 'smooth'
            });
        });

        const del = document.createElement('button');
        del.className = 'danger';
        del.textContent = 'Delete';

        del.addEventListener('click', () => {

            if (!confirm(`Delete ${record.name}?`)) {
                return;
            }

            saveRecords(
                getRecords().filter(
                    item => item.id !== record.id
                )
            );

            clearForm();
            feedback.textContent = 'Record deleted.';
            render();
        });

        buttons.append(edit, del);
        row.append(info, buttons);
        list.appendChild(row);
    });
}

form.addEventListener('submit', e => {

    e.preventDefault();

    const name = document.getElementById('foodName').value.trim();
    const servings = document.getElementById('servings').value;

    if (
        !name ||
        !validNonnegative(servings, 100) ||
        Number(servings) < 0.1 ||
        fields.some(k =>
            !validNonnegative(
                document.getElementById(k).value,
                10000
            )
        )
    ) {

        feedback.textContent =
            'Enter a food name, servings between 0.1 and 100, ' +
            'and valid non-negative nutrition values.';

        return;
    }

    const id = document.getElementById('editId').value;
    const records = getRecords();
    const old = records.find(r => r.id === id);

    const record = new FoodRecord({
        id: id || undefined,
        name,
        servings,

        ...Object.fromEntries(
            fields.map(k => [
                k,
                document.getElementById(k).value
            ])
        ),

        source: old?.source || 'Manual'

    });

    if (id) {

        const index = records.findIndex(r => r.id === id);

        if (index < 0) {
            feedback.textContent = 'Record no longer exists.';
            return;
        }
        records[index] = record;

    } else {
        records.push(record);

    }

    try {

        saveRecords(records);

        feedback.textContent = id
            ? 'Record updated successfully.'
            : 'Record added successfully.';

        clearForm();

        render();

    } catch {

        feedback.textContent =
            'Unable to save. Check application storage.';

    }
});

document.getElementById('cancelBtn')
    .addEventListener('click', () => {

        clearForm();

        feedback.textContent = 'Form cleared.';

    });

render();

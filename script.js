const form = document.getElementById('lesson-form');
const calendarGrid = document.getElementById('calendar-grid');
const currentPeriod = document.getElementById('current-period');
const prevBtn = document.getElementById('prev');
const nextBtn = document.getElementById('next');
const toggleViewBtn = document.getElementById('toggle-view');
const reviewModal = new bootstrap.Modal(document.getElementById('reviewModal'));
const editModal = new bootstrap.Modal(document.getElementById('editModal'));
const taskEditModal = new bootstrap.Modal(document.getElementById('taskEditModal'));
const reviewButtons = document.querySelectorAll('.review-choice');
const editForm = document.getElementById('edit-form');
const statsTotal = document.getElementById('stats-total');
const statsAverage = document.getElementById('stats-average');
const taskForm = document.getElementById('task-form');
const tasksContainer = document.getElementById('tasks-container');
const taskEditForm = document.getElementById('task-edit-form');
const statsChartCanvas = document.getElementById('stats-chart');

let currentReviewId = null;
let currentEditId = null;
let currentTaskEditId = null;

let tasks = JSON.parse(localStorage.getItem('tasks') || '[]');
let timers = {};
let history = JSON.parse(localStorage.getItem('history') || '[]');
let statsChart = null;

let lessons = JSON.parse(localStorage.getItem('lessons') || '[]');
let currentDate = new Date();
let view = 'month'; // or 'week'

function saveLessons() {
    localStorage.setItem('lessons', JSON.stringify(lessons));
}

function saveTasks() {
    localStorage.setItem('tasks', JSON.stringify(tasks));
}

function saveHistory() {
    localStorage.setItem('history', JSON.stringify(history));
}

function renderStats() {
    statsTotal.textContent = lessons.length;
    const avg = lessons.length ? lessons.reduce((s, l) => s + l.rate, 0) / lessons.length : 0;
    statsAverage.textContent = avg.toFixed(2);

    const sorted = history.slice().sort((a,b) => a.date.localeCompare(b.date));
    const labels = sorted.map(h => h.date);
    const values = sorted.map(h => h.count);
    if (statsChart) {
        statsChart.data.labels = labels;
        statsChart.data.datasets[0].data = values;
        statsChart.update();
    } else if (statsChartCanvas) {
        statsChart = new Chart(statsChartCanvas, {
            type: 'bar',
            data: { labels, datasets: [{ label: 'Révisions', data: values, backgroundColor: '#0d6efd' }] },
            options: { scales: { y: { beginAtZero: true } } }
        });
    }
}

function renderTasks() {
    tasksContainer.innerHTML = '';
    tasks.forEach(t => {
        const item = document.createElement('div');
        item.className = 'list-group-item d-flex align-items-center';
        const ratio = document.createElement('span');
        ratio.className = 'me-2';
        ratio.textContent = `${Math.floor(t.actual/60)}/${t.expected} min`;
        const validate = document.createElement('button');
        validate.className = 'btn btn-success btn-sm me-2';
        validate.textContent = 'Valider';
        validate.onclick = () => { t.done = true; saveTasks(); renderTasks(); };
        const play = document.createElement('button');
        play.className = 'btn btn-secondary btn-sm ms-auto me-2';
        play.textContent = timers[t.id] ? 'Stop' : 'Play';
        play.onclick = () => toggleTimer(t.id);
        const editBtn = document.createElement('button');
        editBtn.className = 'btn btn-outline-secondary btn-sm';
        editBtn.textContent = 'Modifier';
        editBtn.onclick = () => openTaskEdit(t.id);
        item.appendChild(ratio);
        item.appendChild(validate);
        item.appendChild(play);
        item.appendChild(editBtn);
        const info = document.createElement('span');
        info.className = 'ms-2 flex-grow-1';
        info.textContent = `${t.title} (${t.subject})`;
        item.appendChild(info);
        if (t.done) item.classList.add('opacity-50');
        tasksContainer.appendChild(item);
    });
}

taskForm?.addEventListener('submit', e => {
    e.preventDefault();
    const task = {
        id: Date.now(),
        title: document.getElementById('task-title').value,
        subject: document.getElementById('task-subject').value,
        description: document.getElementById('task-desc').value,
        expected: parseInt(document.getElementById('task-expected').value,10),
        actual: 0,
        done: false,
        start: document.getElementById('task-start').value
    };
    tasks.push(task);
    saveTasks();
    taskForm.reset();
    renderTasks();
});

function openTaskEdit(id) {
    const t = tasks.find(ts => ts.id === id);
    if (!t) return;
    currentTaskEditId = id;
    document.getElementById('task-edit-title').value = t.title;
    document.getElementById('task-edit-subject').value = t.subject;
    document.getElementById('task-edit-desc').value = t.description;
    document.getElementById('task-edit-expected').value = t.expected;
    document.getElementById('task-edit-start').value = t.start;
    taskEditModal.show();
}

taskEditForm?.addEventListener('submit', e => {
    e.preventDefault();
    const t = tasks.find(ts => ts.id === currentTaskEditId);
    if (!t) return;
    t.title = document.getElementById('task-edit-title').value;
    t.subject = document.getElementById('task-edit-subject').value;
    t.description = document.getElementById('task-edit-desc').value;
    t.expected = parseInt(document.getElementById('task-edit-expected').value,10);
    t.start = document.getElementById('task-edit-start').value;
    saveTasks();
    taskEditModal.hide();
    renderTasks();
});

function toggleTimer(id) {
    if (timers[id]) {
        clearInterval(timers[id]);
        delete timers[id];
    } else {
        timers[id] = setInterval(() => {
            const t = tasks.find(ts => ts.id === id);
            if (t) {
                t.actual += 1;
                saveTasks();
                renderTasks();
            }
        }, 1000);
    }
    renderTasks();
}

form.addEventListener('submit', e => {
    e.preventDefault();
    const dateVal = document.getElementById('date').value;
    if (getLessonsForDay(dateVal).length >= 10) {
        alert('Maximum de leçons atteint pour ce jour');
        return;
    }
    const lesson = {
        id: Date.now(),
        title: document.getElementById('title').value,
        subject: document.getElementById('subject').value,
        description: document.getElementById('description').value,
        nextReview: dateVal,
        rate: parseInt(document.getElementById('learningRate').value, 10)
    };
    lessons.push(lesson);
    saveLessons();
    form.reset();
    renderCalendar();
    renderStats();
});

function getLessonsForDay(dateStr) {
    return lessons.filter(l => l.nextReview === dateStr);
}

function addDays(date, days) {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
}

function markReviewed(id) {
    currentReviewId = id;
    reviewModal.show();
}

reviewButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        const k = parseFloat(btn.getAttribute('data-value'));
        const lesson = lessons.find(l => l.id === currentReviewId);
        if (lesson) {
            lesson.rate += 1;
            const n = lesson.rate;
            const days = Math.ceil(Math.pow(k, n));
            lesson.nextReview = addDays(new Date(), days).toISOString().slice(0,10);
            const today = new Date().toISOString().slice(0,10);
            const rec = history.find(h => h.date === today);
            if (rec) rec.count += 1; else history.push({date: today, count:1});
            saveHistory();
            saveLessons();
            renderCalendar();
            renderStats();
        }
        reviewModal.hide();
    });
});

function openEdit(id) {
    const lesson = lessons.find(l => l.id === id);
    if (!lesson) return;
    currentEditId = id;
    document.getElementById('edit-title').value = lesson.title;
    document.getElementById('edit-subject').value = lesson.subject;
    document.getElementById('edit-description').value = lesson.description;
    document.getElementById('edit-date').value = lesson.nextReview;
    document.getElementById('edit-rate').value = lesson.rate;
    editModal.show();
}

editForm.addEventListener('submit', e => {
    e.preventDefault();
    const lesson = lessons.find(l => l.id === currentEditId);
    if (!lesson) return;
    const newDate = document.getElementById('edit-date').value;
    if (lesson.nextReview !== newDate && getLessonsForDay(newDate).length >= 10) {
        alert('Maximum de leçons atteint pour ce jour');
        return;
    }
    lesson.title = document.getElementById('edit-title').value;
    lesson.subject = document.getElementById('edit-subject').value;
    lesson.description = document.getElementById('edit-description').value;
    lesson.nextReview = newDate;
    lesson.rate = parseInt(document.getElementById('edit-rate').value, 10);
    saveLessons();
    editModal.hide();
    renderCalendar();
    renderStats();
});

function renderCalendar() {
    calendarGrid.innerHTML = '';
    calendarGrid.classList.toggle('week-view', view === 'week');
    calendarGrid.classList.toggle('month-view', view === 'month');
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const start = new Date(year, month, 1);

    let startDay = start.getDay();
    if (startDay === 0) startDay = 7; // make Monday first

    let daysInMonth = new Date(year, month + 1, 0).getDate();

    let days = [];
    if (view === 'week') {
        // start from Monday of current week
        const day = new Date(currentDate);
        const diff = day.getDay() === 0 ? -6 : 1 - day.getDay();
        const monday = addDays(day, diff);
        for (let i = 0; i < 7; i++) {
            const d = addDays(monday, i);
            days.push(d);
        }
        currentPeriod.textContent = `Semaine du ${monday.toLocaleDateString()}`;
    } else {
        // month view
        for (let i = 1; i <= daysInMonth; i++) {
            days.push(new Date(year, month, i));
        }
        currentPeriod.textContent = `${currentDate.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}`;
    }

    days.forEach(d => {
        const dateStr = d.toISOString().slice(0,10);
        const dayDiv = document.createElement('div');
        dayDiv.className = 'day col border p-1';
        const header = document.createElement('div');
        header.className = 'day-header fw-bold';
        header.textContent = d.getDate();
        dayDiv.appendChild(header);

        const ls = getLessonsForDay(dateStr);
        ls.forEach(l => {
            const div = document.createElement('div');
            div.className = 'lesson bg-light border-start border-primary ps-1 mb-1 small';
            div.textContent = `${l.title} (${l.subject}) `;
            const revBtn = document.createElement('button');
            revBtn.className = 'btn btn-sm btn-success ms-1';
            revBtn.textContent = 'Révisé';
            revBtn.onclick = () => markReviewed(l.id);
            const editBtn = document.createElement('button');
            editBtn.className = 'btn btn-sm btn-outline-secondary ms-1';
            editBtn.textContent = 'Modifier';
            editBtn.onclick = () => openEdit(l.id);
            div.appendChild(revBtn);
            div.appendChild(editBtn);
            dayDiv.appendChild(div);
        });

        calendarGrid.appendChild(dayDiv);
    });
    renderStats();
}

prevBtn.addEventListener('click', () => {
    if (view === 'week') {
        currentDate = addDays(currentDate, -7);
    } else {
        currentDate.setMonth(currentDate.getMonth() - 1);
    }
    renderCalendar();
});

nextBtn.addEventListener('click', () => {
    if (view === 'week') {
        currentDate = addDays(currentDate, 7);
    } else {
        currentDate.setMonth(currentDate.getMonth() + 1);
    }
    renderCalendar();
});

toggleViewBtn.addEventListener('click', () => {
    view = view === 'week' ? 'month' : 'week';
    renderCalendar();
});

// initial render
renderCalendar();
renderStats();
renderTasks();

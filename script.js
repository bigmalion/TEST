const form = document.getElementById('lesson-form');
const calendarGrid = document.getElementById('calendar-grid');
const currentPeriod = document.getElementById('current-period');
const prevBtn = document.getElementById('prev');
const nextBtn = document.getElementById('next');
const toggleViewBtn = document.getElementById('toggle-view');
const reviewModal = new bootstrap.Modal(document.getElementById('reviewModal'));
const editModal = new bootstrap.Modal(document.getElementById('editModal'));
const reviewButtons = document.querySelectorAll('.review-choice');
const editForm = document.getElementById('edit-form');
const statsTotal = document.getElementById('stats-total');
const statsAverage = document.getElementById('stats-average');

let currentReviewId = null;
let currentEditId = null;

let lessons = JSON.parse(localStorage.getItem('lessons') || '[]');
let currentDate = new Date();
let view = 'month'; // or 'week'

function saveLessons() {
    localStorage.setItem('lessons', JSON.stringify(lessons));
}

function renderStats() {
    statsTotal.textContent = lessons.length;
    const avg = lessons.length ? lessons.reduce((s, l) => s + l.rate, 0) / lessons.length : 0;
    statsAverage.textContent = avg.toFixed(2);
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
const form = document.getElementById('lesson-form');
const calendarGrid = document.getElementById('calendar-grid');
const currentPeriod = document.getElementById('current-period');
const prevBtn = document.getElementById('prev');
const nextBtn = document.getElementById('next');
const toggleViewBtn = document.getElementById('toggle-view');

let lessons = JSON.parse(localStorage.getItem('lessons') || '[]');
let currentDate = new Date();
let view = 'month'; // or 'week'

function saveLessons() {
    localStorage.setItem('lessons', JSON.stringify(lessons));
}

form.addEventListener('submit', e => {
    e.preventDefault();
    const lesson = {
        id: Date.now(),
        title: document.getElementById('title').value,
        subject: document.getElementById('subject').value,
        description: document.getElementById('description').value,
        nextReview: document.getElementById('date').value,
        rate: parseInt(document.getElementById('learningRate').value, 10)
    };
    lessons.push(lesson);
    saveLessons();
    form.reset();
    renderCalendar();
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
    const lesson = lessons.find(l => l.id === id);
    if (lesson) {
        const next = addDays(new Date(), lesson.rate);
        lesson.nextReview = next.toISOString().slice(0,10);
        saveLessons();
        renderCalendar();
    }
}

function renderCalendar() {
    calendarGrid.innerHTML = '';
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
        dayDiv.className = 'day';
        const header = document.createElement('div');
        header.className = 'day-header';
        header.textContent = d.getDate();
        dayDiv.appendChild(header);

        const ls = getLessonsForDay(dateStr);
        ls.forEach(l => {
            const div = document.createElement('div');
            div.className = 'lesson';
            div.textContent = `${l.title} (${l.subject}) `;
            const btn = document.createElement('button');
            btn.textContent = 'Révisé';
            btn.onclick = () => markReviewed(l.id);
            div.appendChild(btn);
            dayDiv.appendChild(div);
        });

        calendarGrid.appendChild(dayDiv);
    });
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

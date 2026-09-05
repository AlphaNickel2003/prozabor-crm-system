document.addEventListener('DOMContentLoaded', function () {

    // DOM-ссылки
    const sectionDeals = document.getElementById('section-deals');
    const sectionTasks = document.getElementById('section-tasks');
    const dealsTableBody = document.getElementById('dealsTableBody');
    const dealsEmpty = document.getElementById('dealsEmpty');

    const taskToday = document.getElementById('taskToday');
    const taskTomorrow = document.getElementById('taskTomorrow');
    const taskWeek = document.getElementById('taskWeek');
    const tasksEmpty = document.getElementById('tasksEmpty');
    const taskOverdue = document.getElementById('taskOverdue');

    // Модалки
    const formModalOverlay = document.getElementById('formModalOverlay');
    const detailsModalOverlay = document.getElementById('detailsModalOverlay');
    const confirmModalOverlay = document.getElementById('confirmModalOverlay');
    const closeFormModalBtn = document.getElementById('closeFormModalBtn');
    const closeDetailsModalBtn = document.getElementById('closeDetailsModalBtn');
    const closeConfirmModalBtn = document.getElementById('closeConfirmModalBtn');

    // Форма
    const dealForm = document.getElementById('dealForm');
    const editId = document.getElementById('editId');
    const formModalTitle = document.getElementById('formModalTitle');
    const formSubmitBtn = document.getElementById('formSubmitBtn');

    // Поля формы
    const fCustomersName = document.getElementById('customersName');
    const fCustomersPhoneNumber = document.getElementById('customersPhoneNumber');
    const fLocation = document.getElementById('location');
    const fDescription = document.getElementById('description');
    const fDateTask = document.getElementById('dateTask');

    // Кнопки сайдбара
    const sidebarBtns = document.querySelectorAll('.sidebar-btn');
    const addBtn = document.getElementById('openModalBtn');

    // Детали
    const detailId = document.getElementById('detailId');
    const detailName = document.getElementById('detailName');
    const detailPhone = document.getElementById('detailPhone');
    const detailLocation = document.getElementById('detailLocation');
    const detailDescription = document.getElementById('detailDescription');
    const detailDateTask = document.getElementById('detailDateTask');
    const editDealBtn = document.getElementById('editDealBtn');
    const deleteDealBtn = document.getElementById('deleteDealBtn');

    // Подтверждение удаления
    const confirmDeleteYes = document.getElementById('confirmDeleteYes');
    const confirmDeleteNo = document.getElementById('confirmDeleteNo');

    // Переменные для хранения текущего удаляемого ID
    let deleteTargetId = null;

    //Функции

    // Форматирование даты
    function formatDate(dateString) {
        if (!dateString) return '—';
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return '—';
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        return `${hours}:${minutes} ${day}.${month}.${year}`;
    }

    // Форматирование для input datetime-local
    function toInputDateTime(dateString) {
        if (!dateString) return '';
        const d = new Date(dateString);
        return d.toISOString().slice(0, 16);
    }

    // Загрузка всех заявок (для таблицы)
    async function loadDeals() {
        try {
            const response = await fetch('/api/deals');
            if (!response.ok) throw new Error('Ошибка загрузки заявок');
            const deals = await response.json();
            renderDealsTable(deals);
        } catch (e) {
            console.error(e);
            alert('Не удалось загрузить заявки');
        }
    }

    // Рендер таблицы
    function renderDealsTable(deals) {
        dealsTableBody.innerHTML = '';
        if (!deals || deals.length === 0) {
            dealsEmpty.style.display = 'block';
            return;
        }
        dealsEmpty.style.display = 'none';
        deals.forEach(deal => {
            const tr = document.createElement('tr');
            tr.dataset.id = deal.id;
            tr.innerHTML = `
                <td>${deal.id}</td>
                <td>${deal.customersName || ''}</td>
                <td>${deal.customersPhoneNumber || ''}</td>
                <td>${deal.location || ''}</td>
            `;
            tr.addEventListener('click', () => openDetails(deal.id));
            dealsTableBody.appendChild(tr);
        });
    }

    // Загрузка задач (для трёх колонок)
    async function loadTasks() {
        try {
            const response = await fetch('/api/deals');
            if (!response.ok) throw new Error('Ошибка загрузки задач');
            const deals = await response.json();
            renderTasks(deals);
        } catch (e) {
            console.error(e);
            alert('Не удалось загрузить задачи');
        }
    }

    // Рендер задач по колонкам
    function renderTasks(deals) {
        // текущий момент и вычисление дат
        const now = new Date();
        const today = new Date(now);
        today.setHours(0, 0, 0, 0);

        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        const dayAfterTomorrow = new Date(today);
        dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 2);
        const weekEnd = new Date(dayAfterTomorrow);
        weekEnd.setDate(weekEnd.getDate() + 7);

        // Просроченные: дата+время < текущий момент (включая сегодняшние, если время прошло)
        const overdueList = deals
            .filter(d => d.dateTask && new Date(d.dateTask) < now)
            .sort((a, b) => new Date(a.dateTask) - new Date(b.dateTask));

        // Сегодня: дата сегодня И время >= текущего (т.е. ещё не наступило)
        const todayList = deals
            .filter(d => {
                if (!d.dateTask) return false;
                const dt = new Date(d.dateTask);
                return dt >= now && dt.toDateString() === today.toDateString();
            })
            .sort((a, b) => new Date(a.dateTask) - new Date(b.dateTask));

        // Завтра: дата завтра
        const tomorrowList = deals
            .filter(d => d.dateTask && new Date(d.dateTask).toDateString() === tomorrow.toDateString())
            .sort((a, b) => new Date(a.dateTask) - new Date(b.dateTask));

        // Неделя: с afterTomorrow по weekEnd включительно
        const weekList = deals
            .filter(d => {
                if (!d.dateTask) return false;
                const dt = new Date(d.dateTask);
                return dt >= dayAfterTomorrow && dt <= weekEnd;
            })
            .sort((a, b) => new Date(a.dateTask) - new Date(b.dateTask));

        // Вспомогательная функция создания карточки
        function createTaskCard(deal) {
            const card = document.createElement('div');
            card.className = 'task-card';
            card.dataset.id = deal.id;
            const time = deal.dateTask ? new Date(deal.dateTask).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'}) : '';
            card.innerHTML = `
                <div class="task-time">${time}</div>
                <div class="task-name">${deal.customersName || ''}</div>
                <div class="task-phone">${deal.customersPhoneNumber || ''}</div>
                <div class="task-location">${deal.location || ''}</div>
            `;
            card.addEventListener('click', () => openDetails(deal.id));
            return card;
        }

        // Очищаем контейнеры и вставляем заголовки
        function resetContainer(container, title) {
            container.innerHTML = `<h3>${title}</h3>`;
        }
        resetContainer(taskToday, 'Сегодня');
        resetContainer(taskTomorrow, 'Завтра');
        resetContainer(taskWeek, 'Неделя');

        // Блок просроченных: полностью очищаем и заполняем, если есть записи
        taskOverdue.innerHTML = '';
        if (overdueList.length > 0) {
            taskOverdue.style.display = 'block';
            // Заголовок
            const title = document.createElement('h3');
            title.textContent = 'Просрочено';
            taskOverdue.appendChild(title);
            // Карточки
            overdueList.forEach(d => taskOverdue.appendChild(createTaskCard(d)));
        } else {
            taskOverdue.style.display = 'none';
        }

        // Заполняем три основные колонки
        todayList.forEach(d => taskToday.appendChild(createTaskCard(d)));
        tomorrowList.forEach(d => taskTomorrow.appendChild(createTaskCard(d)));
        weekList.forEach(d => taskWeek.appendChild(createTaskCard(d)));

        // Сообщение "Нет задач", если все четыре списка пусты
        if (overdueList.length === 0 && todayList.length === 0 && tomorrowList.length === 0 && weekList.length === 0) {
            tasksEmpty.style.display = 'block';
        } else {
            tasksEmpty.style.display = 'none';
        }
    }

    // Обновить все данные (после создания, редактирования, удаления)
    function refreshAll() {
        loadDeals();
        loadTasks();
    }

    // Переключение разделов
    sidebarBtns.forEach(btn => {
        btn.addEventListener('click', function () {
            sidebarBtns.forEach(b => b.classList.remove('active'));
            this.classList.add('active');

            const tab = this.dataset.tab;
            if (tab === 'deals') {
                sectionDeals.classList.add('active');
                sectionTasks.classList.remove('active');
                loadDeals();
            } else if (tab === 'tasks') {
                sectionDeals.classList.remove('active');
                sectionTasks.classList.add('active');
                loadTasks();
            }
        });
    });

    // Модалка создания
    function openCreateModal() {
        editId.value = '0';
        formModalTitle.textContent = 'Новая заявка';
        formSubmitBtn.textContent = 'Создать';
        dealForm.reset();
        formModalOverlay.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    function closeFormModal() {
        formModalOverlay.classList.remove('active');
        document.body.style.overflow = '';
    }

    addBtn.addEventListener('click', openCreateModal);
    closeFormModalBtn.addEventListener('click', closeFormModal);
    formModalOverlay.addEventListener('click', function (e) {
    // Закрываем только если кликнули именно по фону и нет выделенного текста
        if (e.target === this && !window.getSelection().toString()) {
            closeFormModal();
        }
    });

    // Отправка формы (создание/редактирование)
    dealForm.addEventListener('submit', async function (e) {
        e.preventDefault();

        const id = parseInt(editId.value) || 0;
        const payload = {
            customersName: fCustomersName.value.trim(),
            customersPhoneNumber: fCustomersPhoneNumber.value.trim(),
            location: fLocation.value.trim(),
            description: fDescription.value.trim(),
            dateTask: fDateTask.value
        };

        if (!payload.customersName || !payload.customersPhoneNumber || !payload.dateTask) {
            alert('Поля "Имя клиента", "Телефон" и "Дата задачи" обязательны');
            return;
        }

        const method = id === 0 ? 'POST' : 'PUT';
        const url = id === 0 ? '/api/deals' : `/api/deals/${id}`;

        try {
            const response = await fetch(url, {
                method: method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(errorText || 'Ошибка сохранения');
            }

            closeFormModal();
            refreshAll();
        } catch (error) {
            console.error(error);
            alert('Не удалось сохранить заявку: ' + error.message);
        }
    });

    // Открытие деталей
    let currentDetailId = null;

    async function openDetails(id) {
        currentDetailId = id;
        try {
            const response = await fetch(`/api/deals/${id}`);
            if (!response.ok) {
                if (response.status === 404) {
                    alert('Заявка не найдена. Возможно, она была удалена.');
                    refreshAll();
                    return;
                }
                throw new Error('Ошибка загрузки');
            }
            const deal = await response.json();

            detailId.textContent = deal.id;
            detailName.textContent = deal.customersName || '';
            detailPhone.textContent = deal.customersPhoneNumber || '';
            detailLocation.textContent = deal.location || '—';
            detailDescription.textContent = deal.description || '—';
            detailDateTask.textContent = formatDate(deal.dateTask);

            detailsModalOverlay.classList.add('active');
            document.body.style.overflow = 'hidden';
        } catch (e) {
            console.error(e);
            alert('Не удалось загрузить детали');
        }
    }

    closeDetailsModalBtn.addEventListener('click', function () {
        detailsModalOverlay.classList.remove('active');
        document.body.style.overflow = '';
    });
    detailsModalOverlay.addEventListener('click', function (e) {
        if (e.target === this) {
            this.classList.remove('active');
            document.body.style.overflow = '';
        }
    });

    // Редактирование
    editDealBtn.addEventListener('click', function () {
        if (!currentDetailId) return;
        // Закрыть детали, открыть форму с данными
        detailsModalOverlay.classList.remove('active');
        document.body.style.overflow = '';

        fetch(`/api/deals/${currentDetailId}`)
            .then(res => res.json())
            .then(deal => {
                editId.value = deal.id;
                formModalTitle.textContent = 'Редактирование заявки';
                formSubmitBtn.textContent = 'Сохранить';
                fCustomersName.value = deal.customersName || '';
                fCustomersPhoneNumber.value = deal.customersPhoneNumber || '';
                fLocation.value = deal.location || '';
                fDescription.value = deal.description || '';
                fDateTask.value = toInputDateTime(deal.dateTask);
                formModalOverlay.classList.add('active');
                document.body.style.overflow = 'hidden';
            })
            .catch(e => {
                console.error(e);
                alert('Не удалось загрузить данные для редактирования');
            });
    });

    // Удаление (без закрытия модалки деталей)
    deleteDealBtn.addEventListener('click', function () {
        if (!currentDetailId) return;
        deleteTargetId = currentDetailId;
        // НЕ закрываем detailsModalOverlay, показываем подтверждение поверх
        confirmModalOverlay.classList.add('active');
        document.body.style.overflow = 'hidden';
    });

    // Подтверждение удаления
    confirmDeleteYes.addEventListener('click', async function () {
        if (!deleteTargetId) return;
        try {
            const response = await fetch(`/api/deals/${deleteTargetId}`, { method: 'DELETE' });
            if (!response.ok) {
                const err = await response.text();
                throw new Error(err);
            }
            // Закрываем оба модальных окна
            confirmModalOverlay.classList.remove('active');
            detailsModalOverlay.classList.remove('active');
            document.body.style.overflow = '';
            deleteTargetId = null;
            refreshAll();
        } catch (e) {
            console.error(e);
            alert('Не удалось удалить заявку: ' + e.message);
            // При ошибке закрываем только подтверждение, детали остаются
            confirmModalOverlay.classList.remove('active');
            document.body.style.overflow = '';
            // но детали остаются открытыми
        }
    });

    confirmDeleteNo.addEventListener('click', function () {
        confirmModalOverlay.classList.remove('active');
        document.body.style.overflow = '';
        deleteTargetId = null;
        // Детали остаются открытыми
    });

    closeConfirmModalBtn.addEventListener('click', function () {
        confirmModalOverlay.classList.remove('active');
        document.body.style.overflow = '';
        deleteTargetId = null;
        // Детали остаются открытыми
    });

    confirmModalOverlay.addEventListener('click', function (e) {
        if (e.target === this) {
            this.classList.remove('active');
            document.body.style.overflow = '';
            deleteTargetId = null;
            // Детали остаются открытыми
        }
    });

    // Инициализация
    // По умолчанию активна вкладка "Все заявки"
    document.querySelector('.sidebar-btn[data-tab="deals"]').classList.add('active');
    sectionDeals.classList.add('active');
    loadDeals();
    // Подгружаем задачи в фоне
    loadTasks();

});
// Форматирование даты в формате HH:mm dd.MM.yyyy
function formatDate(dateString) {
    if (!dateString) return '—';
    const date = new Date(dateString);
    // Проверка на валидность даты
    if (isNaN(date.getTime())) return '—';
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${hours}:${minutes} ${day}.${month}.${year}`;
}

document.addEventListener('DOMContentLoaded', function () {
    // Переключение вкладок
    const sidebarButtons = document.querySelectorAll('.sidebar-btn');
    const tabContents = {
        deals: document.getElementById('tab-deals'),
        tasks: document.getElementById('tab-tasks')
    };

    sidebarButtons.forEach(btn => {
        btn.addEventListener('click', function () {
            // Убираем active у всех кнопок
            sidebarButtons.forEach(b => b.classList.remove('active'));
            this.classList.add('active');

            // Прячем все вкладки
            Object.values(tabContents).forEach(tab => tab.classList.remove('active'));

            // Показываем нужную
            const tabId = this.dataset.tab;
            if (tabContents[tabId]) {
                tabContents[tabId].classList.add('active');
            }
        });
    });

    // Модальное окно
    const modalOverlay = document.getElementById('modalOverlay');
    const openModalBtn = document.getElementById('openModalBtn');
    const closeModalBtn = document.getElementById('closeModalBtn');

    function openModal() {
        modalOverlay.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    function closeModal() {
        modalOverlay.classList.remove('active');
        document.body.style.overflow = '';
        document.getElementById('createDealForm').reset();
    }

    openModalBtn.addEventListener('click', openModal);
    closeModalBtn.addEventListener('click', closeModal);
    modalOverlay.addEventListener('click', function (e) {
        if (e.target === modalOverlay) closeModal();
    });

    // Отправка формы
    const form = document.getElementById('createDealForm');
    form.addEventListener('submit', async function (e) {
        e.preventDefault();

        const formData = new FormData(form);
        const data = {
            customersName: formData.get('customersName'),
            customersPhoneNumber: formData.get('customersPhoneNumber'),
            location: formData.get('location'),
            description: formData.get('description') || null,
            nextCall: formData.get('nextCall') || null
        };

        try {
            const response = await fetch('/Home/CreateDeal', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify(data)
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(errorText || 'Ошибка при создании заявки');
            }

            const newDeal = await response.json();

            // Добавляем новую строку в таблицу
            const tbody = document.getElementById('dealsTableBody');
            const row = document.createElement('tr');
            row.dataset.id = newDeal.id;
            row.innerHTML = `
                <td>${newDeal.id}</td>
                <td>${newDeal.customersName}</td>
                <td>${newDeal.customersPhoneNumber}</td>
                <td>${newDeal.location}</td>
            `;
            tbody.prepend(row);

            closeModal();
            // Небольшое уведомление (можно улучшить)
            alert('Заявка успешно создана!');
        } catch (error) {
            console.error('Ошибка:', error);
            alert('Не удалось создать заявку: ' + error.message);
        }
    });
    
});

// Обработчик клика на строке таблицы (делегирование)
document.getElementById('dealsTableBody').addEventListener('click', async function (e) {
    // Находим ближайший <tr> – строку таблицы
    const row = e.target.closest('tr');
    if (!row) return;

    // Получаем id из data-атрибута
    const id = row.dataset.id;
    if (!id) return;

    try {
        // Отправляем GET-запрос на сервер для получения деталей сделки
        const response = await fetch(`/Home/GetDeal/${id}`, {   // путь зависит от вашего маршрута
            method: 'GET',
            headers: {
                'Accept': 'application/json'
            }
        });

        // Если статус 404 – сделка не найдена (возможно, удалена)
        if (response.status === 404) {
            // Удаляем строку из таблицы
            row.remove();
            alert('Эта заявка была удалена другим пользователем. Строка удалена из списка.');
            return;
        }

        // Если другой статус ошибки
        if (!response.ok) {
            throw new Error(`Ошибка загрузки: ${response.status}`);
        }

        // Получаем данные сделки в формате JSON
        const deal = await response.json();

        // Открываем модальное окно с деталями
        showDealDetails(deal);
    } catch (error) {
        console.error('Ошибка при получении сделки:', error);
        alert('Не удалось загрузить данные заявки. Попробуйте позже.');
    }
});

// Функция показа деталей
function showDealDetails(deal) {
    document.getElementById('detailId').textContent = deal.id;
    document.getElementById('detailName').textContent = deal.customersName;
    document.getElementById('detailPhone').textContent = deal.customersPhoneNumber;
    document.getElementById('detailLocation').textContent = deal.location || '—';
    document.getElementById('detailDescription').textContent = deal.description || '—';
    document.getElementById('detailCreatedAt').textContent = formatDate(deal.createdAt);
    document.getElementById('detailNextCall').textContent = deal.nextCall ? formatDate(deal.nextCall) : '—';

    document.getElementById('detailsModalOverlay').classList.add('active');
    document.body.style.overflow = 'hidden';
}

// Закрытие модального окна деталей
document.getElementById('closeDetailsModalBtn').addEventListener('click', function () {
    document.getElementById('detailsModalOverlay').classList.remove('active');
    document.body.style.overflow = '';
});

// Закрытие по клику на overlay
document.getElementById('detailsModalOverlay').addEventListener('click', function (e) {
    if (e.target === this) {
        this.classList.remove('active');
        document.body.style.overflow = '';
    }
});
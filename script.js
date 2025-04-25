let token = localStorage.getItem('token') || "";
let selectedCarId = null;

function register() {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    fetch('https://carfix-backend.onrender.com/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
    })
    .then(res => res.json())
    .then(data => alert(data.message))
    .catch(err => console.error("Ошибка регистрации:", err));
}

function login() {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    fetch('https://carfix-backend.onrender.com/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
    })
    .then(res => res.json())
    .then(data => {
        if (data.token) {
            localStorage.setItem('token', data.token);
            token = data.token;
            loadCars();
            document.getElementById('logout').style.display = 'block';
        } else {
            alert('Ошибка входа');
        }
    })
    .catch(err => console.error("Ошибка авторизации:", err));
}

function loadCars() {
    if (!token) {
        console.error("Нет токена, доступ запрещён!");
        return;
    }

    fetch('https://carfix-backend.onrender.com/cars', {
        headers: { 'Authorization': `Bearer ${token}` }
    })
    .then(res => {
        if (!res.ok) throw new Error("Ошибка авторизации или доступа");
        return res.json();
    })
    .then(cars => {
        console.log("Полученные данные:", cars);
        if (!Array.isArray(cars)) {
            console.error("Ошибка: сервер не вернул массив!");
            return;
        }
        document.getElementById('auth').style.display = 'none';
        document.getElementById('dashboard').style.display = 'block';

        let list = document.getElementById('cars-list');
        list.innerHTML = '';
        cars.forEach(car => {
            let div = document.createElement('div');
            div.innerHTML = `${car.make} (${car.year}) - ${car.plate} 
                <button onclick="viewMaintenance(${car.id})">ТО</button>
                <button onclick="deleteCar(${car.id})">Удалить</button>`;
            list.appendChild(div);
        });
    })
    .catch(err => console.error("Ошибка загрузки машин:", err));
}
function showAddCarForm() {
    document.getElementById("add-car").style.display = "block";
    document.getElementById("dashboard").style.display = "none";
}
function hideAddCarForm() {
    document.getElementById("add-car").style.display = "none";
    document.getElementById("dashboard").style.display = "block";
    document.getElementById('car-make').value = '';
    document.getElementById('car-year').value = '';
    document.getElementById('car-vin').value = '';
    document.getElementById('car-plate').value = '';
}

function addCar() {
    if (!token) {
        console.error("Нет токена, доступ запрещён!");
        return;
    }

    const make = document.getElementById('car-make').value;
    const year = document.getElementById('car-year').value;
    const vin = document.getElementById('car-vin').value;
    const plate = document.getElementById('car-plate').value;

    console.log("Добавляем машину:", { make, year, vin, plate });

    fetch('https://carfix-backend.onrender.com/cars', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ make, year, vin, plate })
    })
    .then(res => res.json())
    .then(data => {
        console.log("Ответ сервера:", data);
        loadCars();
        hideAddCarForm()
    })
    .catch(err => console.error("Ошибка при добавлении машины:", err));
}

function showDashboard() {
    document.getElementById("dashboard").style.display = "block";
    document.getElementById("add-car").style.display = "none";
    document.getElementById("maintenance").style.display = "none";
    document.getElementById("auth").style.display = "none";
    document.getElementById("logout").style.display = "block";
    document.getElementById("add-maintenance").style.display = "none";
    loadCars();
}

function deleteCar(id) {
    if (!token) {
        console.error("Нет токена, доступ запрещён!");
        return;
    }

    fetch(`https://carfix-backend.onrender.com/cars/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
    })
    .then(() => loadCars())
    .catch(err => console.error("Ошибка при удалении машины:", err));
}

function viewMaintenance(carId) {
    if (!token) {
        console.error("Нет токена, доступ запрещён!");
        return;
    }

    selectedCarId = carId;
    fetch(`https://carfix-backend.onrender.com/maintenance?car_id=${carId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
    })
    .then(res => res.json())
    .then(records => {
        document.getElementById('dashboard').style.display = 'none';
        document.getElementById('maintenance').style.display = 'block';

        let list = document.getElementById('maintenance-list');
        if (!list) {
            console.error("maintenance-list не найден в HTML!");
            return;
        }

        list.innerHTML = '';
        records.forEach(record => {
            let div = document.createElement('div');
            div.innerHTML = `${record.date}, ${record.mileage} км - ${record.details}
                <button onclick="deleteMaintenance(${record.id})">✖</button>`;
            list.appendChild(div);
        });
    })
    .catch(err => console.error("Ошибка загрузки ТО:", err));
}

function showAddMaintenanceForm() {
    document.getElementById("add-maintenance").style.display = "block";
    document.getElementById("dashboard").style.display = "none";
}
function showMaintenance() {
    document.getElementById("maintenance").style.display = "block";
    document.getElementById("add-maintenance").style.display = "none";
    document.getElementById("dashboard").style.display = "none";
}

function addMaintenance() {
    if (!token) {
        console.error("Нет токена, доступ запрещён!");
        return;
    }

    const date = document.getElementById('maintenance-date').value;
    const mileage = document.getElementById('maintenance-mileage').value;
    const details = document.getElementById('maintenance-details').value;
    
    fetch('https://carfix-backend.onrender.com/maintenance', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ car_id: selectedCarId, date, mileage, details })
    })
    .then(() => viewMaintenance(selectedCarId))
    .catch(err => console.error("Ошибка при добавлении ТО:", err));
    document.getElementById('maintenance-date').value = '';
    document.getElementById('maintenance-mileage').value = '';
    document.getElementById('maintenance-details').value = '';
    document.getElementById("add-maintenance").style.display = "none";
    document.getElementById("maintenance").style.display = "block";
}

function deleteMaintenance(id) {
    if (!token) {
        console.error("Нет токена, доступ запрещён!");
        return;
    }

    fetch(`https://carfix-backend.onrender.com/maintenance/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
    })
    .then(() => viewMaintenance(selectedCarId))
    .catch(err => console.error("Ошибка при удалении ТО:", err));
}

function logout() {
    localStorage.removeItem('token'); 
    token = ""; // Очищаем токен

    document.getElementById('auth').style.display = 'block';
    document.getElementById('dashboard').style.display = 'none';
    document.getElementById('add-car').style.display = 'none';
    document.getElementById('maintenance').style.display = 'none';
    document.getElementById('logout').style.display = 'none';
}

// Если токен есть, загружаем машины
if (token) {
    loadCars();
}

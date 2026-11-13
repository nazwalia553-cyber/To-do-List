
// ======================================
// MY TO-DO LIST
// ======================================

// Mengambil elemen HTML
const taskForm = document.getElementById("taskForm");
const taskInput = document.getElementById("taskInput");
const taskList = document.getElementById("taskList");
const message = document.getElementById("message");
const emptyMessage = document.getElementById("emptyMessage");

// Elemen ringkasan
const totalTasks = document.getElementById("totalTasks");
const activeTasks = document.getElementById("activeTasks");
const completedTasks = document.getElementById("completedTasks");

// Tombol filter
const filterButtons = document.querySelectorAll(".filter-btn");

// Mengambil data dari localStorage
const STORAGE_KEY = "myTodoTasks";

function loadTasks() {
    try {
        const savedTasks = localStorage.getItem(STORAGE_KEY);

        if (!savedTasks) {
            return [];
        }

        const parsedTasks = JSON.parse(savedTasks);

        if (!Array.isArray(parsedTasks)) {
            return [];
        }

        return parsedTasks.filter(task =>
            task &&
            typeof task.id === "string" &&
            typeof task.name === "string" &&
            typeof task.completed === "boolean"
        );

    } catch (error) {
        console.error("Gagal membaca data:", error);
        return [];
    }
}

// Menyimpan data
let tasks = loadTasks();

// Filter yang sedang digunakan
let currentFilter = "all";

// Menampilkan pesan
function showMessage(text, type = "error") {
    message.textContent = text;
    message.className = "message " + type;
}

// Menghapus pesan
function clearMessage() {
    message.textContent = "";
    message.className = "message";
}

// Menyimpan tugas ke browser
function saveTasks() {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
        return true;

    } catch (error) {
        console.error("Gagal menyimpan data:", error);
        showMessage("Data gagal disimpan. Periksa penyimpanan browser.");
        return false;
    }
}

// Membuat ID tugas
function createId() {
    if (typeof crypto.randomUUID === "function") {
        return crypto.randomUUID();
    }

    return Date.now().toString() + Math.random().toString(36).slice(2);
}

// Menambahkan tugas
taskForm.addEventListener("submit", function(event) {
    event.preventDefault();

    const taskName = taskInput.value.trim();

    // Validasi input kosong
    if (taskName === "") {
        showMessage("Nama tugas tidak boleh kosong!");
        taskInput.focus();
        return;
    }

    // Validasi panjang tugas
    if (taskName.length > 100) {
        showMessage("Nama tugas maksimal 100 karakter!");
        return;
    }

    const newTask = {
        id: createId(),
        name: taskName,
        completed: false
    };

    tasks.push(newTask);

    if (saveTasks()) {
        taskInput.value = "";
        clearMessage();
        currentFilter = "all";
        updateFilterButtons();
        renderTasks();
        taskInput.focus();
    }
});

// Menampilkan daftar tugas
function renderTasks() {
    taskList.innerHTML = "";

    // Filter tugas
    let filteredTasks = tasks.filter(task => {
        if (currentFilter === "active") {
            return !task.completed;
        }

        if (currentFilter === "completed") {
            return task.completed;
        }

        return true;
    });

    // Menampilkan pesan jika kosong
    emptyMessage.classList.toggle(
        "hidden",
        filteredTasks.length > 0
    );

    // Mengubah pesan sesuai filter
    const emptyText = emptyMessage.querySelector("p");

    if (filteredTasks.length === 0) {
        if (tasks.length === 0) {
            emptyText.textContent =
                "Belum ada tugas. Yuk, tambahkan tugas pertamamu!";
        } else {
            emptyText.textContent =
                "Tidak ada tugas pada kategori ini.";
        }
    }

    // Membuat elemen tugas
    filteredTasks.forEach(task => {

        const li = document.createElement("li");
        li.className = "task-item";

        if (task.completed) {
            li.classList.add("completed");
        }

        // Checkbox
        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.className = "task-checkbox";
        checkbox.checked = task.completed;
        checkbox.setAttribute(
            "aria-label",
            "Tandai " + task.name + " selesai"
        );

        checkbox.addEventListener("change", function() {
            toggleTask(task.id);
        });

        // Nama tugas
        const name = document.createElement("span");
        name.className = "task-name";
        name.textContent = task.name;

        // Tombol aksi
        const actions = document.createElement("div");
        actions.className = "task-actions";

        // Tombol edit
        const editButton = document.createElement("button");
        editButton.type = "button";
        editButton.className = "edit-btn";
        editButton.textContent = "Edit";
        editButton.setAttribute("aria-label", "Edit " + task.name);

        editButton.addEventListener("click", function() {
            editTask(task.id);
        });

        // Tombol hapus
        const deleteButton = document.createElement("button");
        deleteButton.type = "button";
        deleteButton.className = "delete-btn";
        deleteButton.textContent = "Hapus";
        deleteButton.setAttribute("aria-label", "Hapus " + task.name);

        deleteButton.addEventListener("click", function() {
            deleteTask(task.id);
        });

        // Menggabungkan elemen
        actions.append(editButton, deleteButton);
        li.append(checkbox, name, actions);

        taskList.appendChild(li);
    });

    updateSummary();
}

// Mengubah status tugas
function toggleTask(id) {
    const task = tasks.find(task => task.id === id);

    if (!task) {
        return;
    }

    task.completed = !task.completed;

    if (saveTasks()) {
        clearMessage();
        renderTasks();
    }
}

// Mengedit tugas
function editTask(id) {
    const task = tasks.find(task => task.id === id);

    if (!task) {
        return;
    }

    const newName = prompt("Masukkan nama tugas baru:", task.name);

    // Jika pengguna menekan Cancel
    if (newName === null) {
        return;
    }

    const updatedName = newName.trim();

    if (updatedName === "") {
        showMessage("Nama tugas tidak boleh kosong!");
        return;
    }

    if (updatedName.length > 100) {
        showMessage("Nama tugas maksimal 100 karakter!");
        return;
    }

    task.name = updatedName;

    if (saveTasks()) {
        clearMessage();
        renderTasks();
    }
}

// Menghapus tugas
function deleteTask(id) {
    const confirmation = confirm(
        "Apakah kamu yakin ingin menghapus tugas ini?"
    );

    if (!confirmation) {
        return;
    }

    const previousTasks = tasks;
    tasks = tasks.filter(task => task.id !== id);

    if (saveTasks()) {
        clearMessage();
        renderTasks();
    } else {
        tasks = previousTasks;
        renderTasks();
    }
}

// Menghitung jumlah tugas
function updateSummary() {
    const total = tasks.length;

    const completed = tasks.filter(
        task => task.completed
    ).length;

    const active = total - completed;

    totalTasks.textContent = total;
    activeTasks.textContent = active;
    completedTasks.textContent = completed;
}

// Mengatur tombol filter
function updateFilterButtons() {
    filterButtons.forEach(button => {
        button.classList.toggle(
            "active",
            button.dataset.filter === currentFilter
        );

        button.setAttribute(
            "aria-pressed",
            button.dataset.filter === currentFilter
                ? "true"
                : "false"
        );
    });
}

// Event tombol filter
filterButtons.forEach(button => {
    button.addEventListener("click", function() {
        currentFilter = this.dataset.filter;

        updateFilterButtons();
        clearMessage();
        renderTasks();
    });
});

// Menampilkan data ketika aplikasi dibuka
updateFilterButtons();
renderTasks();

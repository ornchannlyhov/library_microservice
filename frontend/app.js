// API Base URLs
const API = {
    users: 'http://localhost:3001',
    books: 'http://localhost:3002',
    loans: 'http://localhost:3003'
};

// State
let users = [];
let books = [];
let loans = [];
let editingId = null;
let currentType = null;

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    lucide.createIcons();
    setupTabs();
    loadAllData();
});

// Tab Navigation
function setupTabs() {
    document.querySelectorAll('.nav-tab').forEach(tab => {
        tab.addEventListener('click', () => {
            document.querySelectorAll('.nav-tab').forEach(t => t.classList.remove('active'));
            document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
            tab.classList.add('active');
            document.getElementById(tab.dataset.tab).classList.add('active');
        });
    });
}

// Load All Data
async function loadAllData() {
    await Promise.all([loadUsers(), loadBooks(), loadLoans()]);
}

// Users
async function loadUsers() {
    try {
        const res = await fetch(`${API.users}/users`);
        users = await res.json();
        renderUsers();
    } catch (e) {
        showToast('Failed to load users', 'error');
    }
}

function renderUsers() {
    const tbody = document.getElementById('users-table');
    const empty = document.getElementById('users-empty');

    if (users.length === 0) {
        tbody.innerHTML = '';
        empty.style.display = 'block';
        lucide.createIcons();
        return;
    }

    empty.style.display = 'none';
    tbody.innerHTML = users.map(user => `
        <tr>
            <td><strong>${escapeHtml(user.name)}</strong></td>
            <td>${escapeHtml(user.email)}</td>
            <td>
                <div class="actions">
                    <button class="btn btn-icon" onclick="editUser('${user._id}')" title="Edit">
                        <i data-lucide="pencil"></i>
                    </button>
                    <button class="btn btn-icon danger" onclick="deleteUser('${user._id}')" title="Delete">
                        <i data-lucide="trash-2"></i>
                    </button>
                </div>
            </td>
        </tr>
    `).join('');
    lucide.createIcons();
}

async function deleteUser(id) {
    if (!confirm('Delete this user?')) return;
    try {
        await fetch(`${API.users}/users/${id}`, { method: 'DELETE' });
        showToast('User deleted', 'success');
        loadUsers();
    } catch (e) {
        showToast('Failed to delete user', 'error');
    }
}

function editUser(id) {
    const user = users.find(u => u._id === id);
    editingId = id;
    showModal('user', user);
}

// Books
async function loadBooks() {
    try {
        const res = await fetch(`${API.books}/books`);
        books = await res.json();
        renderBooks();
    } catch (e) {
        showToast('Failed to load books', 'error');
    }
}

function renderBooks() {
    const tbody = document.getElementById('books-table');
    const empty = document.getElementById('books-empty');

    if (books.length === 0) {
        tbody.innerHTML = '';
        empty.style.display = 'block';
        lucide.createIcons();
        return;
    }

    empty.style.display = 'none';
    tbody.innerHTML = books.map(book => `
        <tr>
            <td><strong>${escapeHtml(book.title)}</strong></td>
            <td>${escapeHtml(book.author)}</td>
            <td>
                <div class="actions">
                    <button class="btn btn-icon" onclick="editBook('${book._id}')" title="Edit">
                        <i data-lucide="pencil"></i>
                    </button>
                    <button class="btn btn-icon danger" onclick="deleteBook('${book._id}')" title="Delete">
                        <i data-lucide="trash-2"></i>
                    </button>
                </div>
            </td>
        </tr>
    `).join('');
    lucide.createIcons();
}

async function deleteBook(id) {
    if (!confirm('Delete this book?')) return;
    try {
        await fetch(`${API.books}/books/${id}`, { method: 'DELETE' });
        showToast('Book deleted', 'success');
        loadBooks();
    } catch (e) {
        showToast('Failed to delete book', 'error');
    }
}

function editBook(id) {
    const book = books.find(b => b._id === id);
    editingId = id;
    showModal('book', book);
}

// Loans
async function loadLoans() {
    try {
        const res = await fetch(`${API.loans}/loans`);
        loans = await res.json();
        renderLoans();
    } catch (e) {
        showToast('Failed to load loans', 'error');
    }
}

function renderLoans() {
    const tbody = document.getElementById('loans-table');
    const empty = document.getElementById('loans-empty');

    if (loans.length === 0) {
        tbody.innerHTML = '';
        empty.style.display = 'block';
        lucide.createIcons();
        return;
    }

    empty.style.display = 'none';
    tbody.innerHTML = loans.map(loan => `
        <tr>
            <td><strong>${escapeHtml(loan.userName || 'Unknown')}</strong></td>
            <td>${escapeHtml(loan.bookTitle || 'Unknown')}</td>
            <td>${new Date(loan.date).toLocaleDateString()}</td>
            <td>
                <button class="btn btn-icon danger" onclick="returnBook('${loan._id}')" title="Return Book">
                    <i data-lucide="undo-2"></i>
                </button>
            </td>
        </tr>
    `).join('');
    lucide.createIcons();
}

async function returnBook(id) {
    if (!confirm('Return this book?')) return;
    try {
        await fetch(`${API.loans}/loans/${id}`, { method: 'DELETE' });
        showToast('Book returned successfully', 'success');
        loadLoans();
    } catch (e) {
        showToast('Failed to return book', 'error');
    }
}

// Modal
function showModal(type, data = null) {
    currentType = type;
    editingId = data ? data._id : null;

    const modal = document.getElementById('modal');
    const title = document.getElementById('modal-title');
    const fields = document.getElementById('form-fields');

    switch (type) {
        case 'user':
            title.textContent = data ? 'Edit User' : 'Add User';
            fields.innerHTML = `
                <div class="form-group">
                    <label>Name</label>
                    <input type="text" name="name" value="${data?.name || ''}" required>
                </div>
                <div class="form-group">
                    <label>Email</label>
                    <input type="email" name="email" value="${data?.email || ''}" required>
                </div>
            `;
            break;
        case 'book':
            title.textContent = data ? 'Edit Book' : 'Add Book';
            fields.innerHTML = `
                <div class="form-group">
                    <label>Title</label>
                    <input type="text" name="title" value="${data?.title || ''}" required>
                </div>
                <div class="form-group">
                    <label>Author</label>
                    <input type="text" name="author" value="${data?.author || ''}" required>
                </div>
            `;
            break;
        case 'loan':
            title.textContent = 'New Loan';
            const availableBooks = books.filter(b => !loans.find(l => l.bookId === b._id));
            fields.innerHTML = `
                <div class="form-group">
                    <label>User</label>
                    <select name="userId" required>
                        <option value="">Select a user</option>
                        ${users.map(u => `<option value="${u._id}">${escapeHtml(u.name)}</option>`).join('')}
                    </select>
                </div>
                <div class="form-group">
                    <label>Book</label>
                    <select name="bookId" required>
                        <option value="">Select a book</option>
                        ${availableBooks.map(b => `<option value="${b._id}">${escapeHtml(b.title)}</option>`).join('')}
                    </select>
                </div>
            `;
            break;
    }

    modal.classList.add('active');
    lucide.createIcons();
    document.getElementById('modal-form').onsubmit = handleSubmit;
}

function closeModal() {
    document.getElementById('modal').classList.remove('active');
    editingId = null;
    currentType = null;
}

async function handleSubmit(e) {
    e.preventDefault();
    const form = e.target;
    const formData = new FormData(form);
    const data = Object.fromEntries(formData);

    try {
        let url, method;

        switch (currentType) {
            case 'user':
                url = editingId ? `${API.users}/users/${editingId}` : `${API.users}/users`;
                method = editingId ? 'PUT' : 'POST';
                break;
            case 'book':
                url = editingId ? `${API.books}/books/${editingId}` : `${API.books}/books`;
                method = editingId ? 'PUT' : 'POST';
                break;
            case 'loan':
                url = `${API.loans}/loans`;
                method = 'POST';
                break;
        }

        const res = await fetch(url, {
            method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });

        if (!res.ok) {
            const err = await res.json();
            throw new Error(err.error || 'Failed');
        }

        showToast(editingId ? 'Updated successfully' : 'Created successfully', 'success');
        closeModal();
        loadAllData();
    } catch (e) {
        showToast(e.message, 'error');
    }
}

// Toast
function showToast(message, type = 'success') {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.className = `toast ${type} show`;
    setTimeout(() => toast.classList.remove('show'), 3000);
}

// Utility
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text || '';
    return div.innerHTML;
}

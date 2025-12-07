// API Base URLs
const API = {
    users: 'http://localhost:3001',
    books: 'http://localhost:3002',
    loans: 'http://localhost:3003',
    reviews: 'http://localhost:3004'
};

// State
let users = [];
let books = [];
let loans = [];
let reviews = [];
let bookStats = {};  // Store rating stats for each book
let editingId = null;
let currentType = null;
let selectedRating = 0;

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
            lucide.createIcons();
        });
    });
}

// Load All Data
async function loadAllData() {
    await Promise.all([loadUsers(), loadBooks(), loadLoans(), loadReviews()]);
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
        
        // Load stats for each book
        for (const book of books) {
            try {
                const statsRes = await fetch(`${API.reviews}/reviews/stats/${book._id}`);
                bookStats[book._id] = await statsRes.json();
            } catch {
                bookStats[book._id] = { averageRating: 0, totalReviews: 0 };
            }
        }
        
        renderBooks();
    } catch (e) {
        showToast('Failed to load books', 'error');
    }
}

function renderBooks() {
    const container = document.getElementById('books-table').parentElement;
    const empty = document.getElementById('books-empty');

    if (books.length === 0) {
        container.innerHTML = '';
        empty.style.display = 'block';
        lucide.createIcons();
        return;
    }

    empty.style.display = 'none';
    
    // Create book cards instead of table
    container.innerHTML = `
        <div class="book-grid">
            ${books.map(book => {
                const stats = bookStats[book._id] || { averageRating: 0, totalReviews: 0 };
                return `
                    <div class="book-card">
                        <div class="book-card-header">
                            <div class="book-card-title">${escapeHtml(book.title)}</div>
                            <div class="book-card-author">by ${escapeHtml(book.author)}</div>
                        </div>
                        <div class="book-card-rating">
                            ${renderStars(stats.averageRating)}
                            <span class="rating-text">${stats.averageRating.toFixed(1)}</span>
                            <span class="review-count">(${stats.totalReviews} ${stats.totalReviews === 1 ? 'review' : 'reviews'})</span>
                        </div>
                        <div class="book-card-actions">
                            <button class="btn btn-icon" onclick="editBook('${book._id}')" title="Edit">
                                <i data-lucide="pencil"></i>
                            </button>
                            <button class="btn btn-icon danger" onclick="deleteBook('${book._id}')" title="Delete">
                                <i data-lucide="trash-2"></i>
                            </button>
                        </div>
                    </div>
                `;
            }).join('')}
        </div>
    `;
    lucide.createIcons();
}

function renderStars(rating) {
    const fullStars = Math.floor(rating);
    const stars = [];
    
    for (let i = 0; i < 5; i++) {
        if (i < fullStars) {
            stars.push('<svg class="star" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>');
        } else {
            stars.push('<svg class="star empty" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>');
        }
    }
    
    return `<div class="star-rating">${stars.join('')}</div>`;
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

// Reviews
async function loadReviews() {
    try {
        const res = await fetch(`${API.reviews}/reviews`);
        reviews = await res.json();
        renderReviews();
    } catch (e) {
        showToast('Failed to load reviews', 'error');
    }
}

function renderReviews() {
    const container = document.getElementById('reviews-container');
    const empty = document.getElementById('reviews-empty');

    if (reviews.length === 0) {
        container.innerHTML = '';
        empty.style.display = 'block';
        lucide.createIcons();
        return;
    }

    empty.style.display = 'none';
    container.innerHTML = `
        <div class="reviews-grid">
            ${reviews.map(review => `
                <div class="review-card">
                    <div class="review-header">
                        <div class="review-user">
                            <div class="review-avatar">${getInitials(review.userName)}</div>
                            <div class="review-user-info">
                                <h4>${escapeHtml(review.userName)}</h4>
                                <div class="review-date">${formatDate(review.createdAt)}</div>
                            </div>
                        </div>
                        ${renderStars(review.rating)}
                    </div>
                    ${review.reviewText ? `<div class="review-text">${escapeHtml(review.reviewText)}</div>` : ''}
                    <div class="review-book-title">📚 ${escapeHtml(review.bookTitle)}</div>
                </div>
            `).join('')}
        </div>
    `;
    lucide.createIcons();
}

function getInitials(name) {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
}

function formatDate(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (days === 0) return 'Today';
    if (days === 1) return 'Yesterday';
    if (days < 7) return `${days} days ago`;
    return date.toLocaleDateString();
}

async function deleteReview(id) {
    if (!confirm('Delete this review?')) return;
    try {
        await fetch(`${API.reviews}/reviews/${id}`, { method: 'DELETE' });
        showToast('Review deleted', 'success');
        loadReviews();
        loadBooks(); // Refresh book stats
    } catch (e) {
        showToast('Failed to delete review', 'error');
    }
}

// Modal
function showModal(type, data = null) {
    currentType = type;
    editingId = data ? data._id : null;
    selectedRating = 0;

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
        case 'review':
            title.textContent = 'Add Review';
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
                        ${books.map(b => `<option value="${b._id}">${escapeHtml(b.title)}</option>`).join('')}
                    </select>
                </div>
                <div class="form-group">
                    <label>Rating</label>
                    <div class="rating-selector" id="rating-selector">
                        ${[1, 2, 3, 4, 5].map(i => `
                            <svg class="star" data-rating="${i}" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                            </svg>
                        `).join('')}
                    </div>
                    <input type="hidden" name="rating" id="rating-input" required>
                </div>
                <div class="form-group">
                    <label>Review (optional)</label>
                    <textarea name="reviewText" rows="4" placeholder="Share your thoughts about this book..."></textarea>
                </div>
            `;
            
            // Setup star rating interaction
            setTimeout(() => {
                const stars = document.querySelectorAll('#rating-selector .star');
                stars.forEach((star, index) => {
                    star.addEventListener('click', () => {
                        selectedRating = index + 1;
                        document.getElementById('rating-input').value = selectedRating;
                        updateStarSelection();
                    });
                    
                    star.addEventListener('mouseenter', () => {
                        stars.forEach((s, i) => {
                            if (i <= index) {
                                s.classList.add('hover');
                            } else {
                                s.classList.remove('hover');
                            }
                        });
                    });
                });
                
                document.getElementById('rating-selector').addEventListener('mouseleave', () => {
                    stars.forEach(s => s.classList.remove('hover'));
                    updateStarSelection();
                });
                
                function updateStarSelection() {
                    stars.forEach((s, i) => {
                        if (i < selectedRating) {
                            s.classList.add('selected');
                        } else {
                            s.classList.remove('selected');
                        }
                    });
                }
            }, 100);
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
    selectedRating = 0;
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
            case 'review':
                if (!data.rating) {
                    showToast('Please select a rating', 'error');
                    return;
                }
                url = `${API.reviews}/reviews`;
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

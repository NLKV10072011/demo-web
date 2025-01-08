// Chế độ tối
document.getElementById('darkModeToggle')?.addEventListener('click', () => {
    document.body.classList.toggle('dark-mode');
});

// Hàm kiểm tra định dạng email
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Đăng ký
document.getElementById('registerForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();

    const name = document.getElementById('name').value.trim();
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    const role = document.getElementById('role').value;
    const teacherPassword = document.getElementById('teacherPassword')?.value; // Chỉ lấy nếu có

    if (!name || !email || !password || !confirmPassword) {
        return alert('Vui lòng điền đầy đủ thông tin.');
    }

    if (!isValidEmail(email)) {
        return alert('Email không hợp lệ.');
    }

    if (password.length < 6) {
        return alert("Mật khẩu phải chứa ít nhất 6 ký tự");
    }

    if (password !== confirmPassword) {
        return alert('Mật khẩu không khớp!');
    }

    if (role === 'teacher' && teacherPassword !== '1234') {
        return alert('Mật mã giáo viên không chính xác!');
    }

    try {
        const response = await fetch('/api/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, email, password, role })
        });

        const data = await response.json();
        if (response.ok) {
            alert(data.message);
            window.location.href = 'login.html';
        } else {
            alert(data.message);
        }
    } catch (error) {
        console.error("Lỗi đăng ký:", error);
        alert('Lỗi kết nối đến server.');
    }
});

// Đăng nhập
document.getElementById('loginForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();

    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;

    if (!email || !password) {
        return alert('Vui lòng điền đầy đủ thông tin.');
    }

    try {
        const response = await fetch('/api/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });

        if (!response.ok) {
            const errorData = await response.json();
            return alert(errorData.message || 'Đăng nhập thất bại.'); // Hiển thị thông báo lỗi chi tiết từ server nếu có
        }
        const user = await response.json();
        localStorage.setItem('currentUser', JSON.stringify(user));
        window.location.href = user.role === 'teacher' ? 'teacher.html' : 'student.html';
    } catch (error) {
        console.error("Lỗi đăng nhập:", error);
        alert('Lỗi kết nối đến server.');
    }
});

// Gửi lời chúc
document.getElementById('wishForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();

    const wishText = document.getElementById('wish').value.trim();
    if (!wishText) {
        return alert("Vui lòng nhập lời chúc.");
    }
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));

    if (!currentUser) {
        return alert("Bạn cần đăng nhập để gửi lời chúc.");
    }

    const wish = {
        name: currentUser.name,
        wish: wishText,
        date: new Date().toLocaleString()
    };

    try {
        const response = await fetch('/api/wishes', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(wish)
        });
        const data = await response.json();
        alert(data.message);
        document.getElementById('wish').value = ""; // Clear input after submit
        loadWishesForTeacher(); // Update the wish list immediately
    } catch (error) {
        console.error("Lỗi gửi lời chúc:", error);
        alert('Lỗi kết nối đến server.');
    }
});

// Hiển thị lời chúc
async function loadWishesForTeacher() {
    const wishList = document.getElementById('wishList');
    if (!wishList) return;

    try {
        const response = await fetch('/api/wishes');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const wishes = await response.json();
        wishList.innerHTML = ''; // Xóa nội dung cũ
        wishes.forEach(wish => {
            const li = document.createElement('li');
            li.innerHTML = `<strong>${wish.name}</strong>: ${wish.wish} <br><small>${wish.date}</small>`;
            wishList.appendChild(li);
        });
    } catch (error) {
        console.error("Lỗi lấy lời chúc:", error);
        wishList.innerHTML = "<p>Không thể tải lời chúc.</p>"; // Hiển thị thông báo lỗi trên giao diện
    }
}

document.addEventListener('DOMContentLoaded', loadWishesForTeacher);

// Tìm kiếm thành viên
document.getElementById('searchInput')?.addEventListener('keyup', () => {
    const searchValue = document.getElementById('searchInput').value.trim().toLowerCase();
    const memberCards = document.querySelectorAll('.member-card');

    memberCards.forEach(card => {
        const name = card.querySelector('h3').textContent.trim().toLowerCase();
        const hobby = card.querySelector('p').textContent.trim().toLowerCase();
        const cardVisible = name.includes(searchValue) || hobby.includes(searchValue);
        card.style.display = cardVisible ? 'block' : 'none';
    });
});
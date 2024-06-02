document.addEventListener("DOMContentLoaded", function () {
    const form = document.getElementById('book');
    const incompleteReadBookList = document.getElementById('incompleteReadBook');
    const completeReadBookList = document.getElementById('completeReadBook');
    const searchInput = document.getElementById('searchBook');
    const searchSubmit = document.getElementById('searchSubmit');

    const deleteDialog = document.getElementById('deleteDialog');
    const confirmDelete = document.getElementById('confirmDelete');
    const cancelDelete = document.getElementById('cancelDelete');
    let bookToDelete = null;

    const editDialog = document.getElementById('editDialog');
    const editForm = document.getElementById('editForm');
    const editBookTitle = document.getElementById('editBookTitle');
    const editBookAuthor = document.getElementById('editBookAuthor');
    const editBookYear = document.getElementById('editBookYear');
    const editBookIsComplete = document.getElementById('editBookIsComplete');
    let bookToEdit = null;

    // Event listener untuk menangani pengiriman form penambahan buku
    form.addEventListener('submit', function (event) {
        event.preventDefault(); // Mencegah pengiriman form

        // Mendapatkan nilai input dari form
        const bookTitle = document.getElementById('bookTitle').value;
        const bookAuthor = document.getElementById('bookAuthor').value;
        const bookYear = document.getElementById('bookYear').value;
        const isComplete = document.getElementById('bookIsComplete').checked;

        // Membuat objek data buku
        const bookData = {
            id: +new Date(), // ID unik menggunakan timestamp
            title: bookTitle,
            author: bookAuthor,
            year: parseInt(bookYear),
            isComplete: isComplete
        };

        // Menambahkan buku ke rak
        addBookToShelf(bookData);
        saveToLocalStorage();
        clearForm();
    });

    // Event listener untuk tombol submit pencarian
    searchSubmit.addEventListener('click', function (event) {
        event.preventDefault(); // Mencegah pengiriman form

        const query = searchInput.value.toLowerCase();
        searchBooks(query);
    });

    // Fungsi untuk menambahkan buku ke rak
    function addBookToShelf(book) {
        const bookList = book.isComplete ? completeReadBookList : incompleteReadBookList;

        // Membuat elemen artikel untuk buku
        const article = document.createElement('article');
        article.classList.add('book_item');
        article.dataset.id = book.id;

        // Menambahkan informasi buku ke dalam elemen artikel
        const bookInfo = `
            <h3>${book.title}</h3>
            <p>Penulis: ${book.author}</p>
            <p>Tahun: ${parseInt(book.year)}</p>
        `;
        article.innerHTML = bookInfo;

        // Membuat elemen aksi untuk buku
        const action = document.createElement('div');
        action.classList.add('action');

        // Membuat tombol untuk menandai buku selesai/belum selesai dibaca
        const buttonComplete = document.createElement('button');
        buttonComplete.textContent = book.isComplete ? 'Belum selesai dibaca' : 'Selesai dibaca';
        buttonComplete.classList.add(book.isComplete ? 'red' : 'green');
        buttonComplete.addEventListener('click', function () {
            moveBook(article, book.isComplete); // Memindahkan buku ke rak yang sesuai
            book.isComplete = !book.isComplete; // Mengubah status buku
            saveToLocalStorage(); // Menyimpan data buku ke localStorage
        });

        // Membuat tombol untuk menghapus buku
        const buttonDelete = document.createElement('button');
        buttonDelete.textContent = 'Hapus Buku';
        buttonDelete.classList.add('red');
        buttonDelete.style.backgroundColor = "#C62828";
        buttonDelete.addEventListener('click', function () {
            bookToDelete = article;
            deleteDialog.showModal();
        });

        // Membuat tombol untuk mengedit buku
        const buttonEdit = document.createElement('button');
        buttonEdit.textContent = 'Edit Buku';
        buttonEdit.classList.add('green');
        buttonEdit.style.backgroundColor = "#4CAF50";
        buttonEdit.addEventListener('click', function () {
            bookToEdit = book;
            editBookTitle.value = book.title;
            editBookAuthor.value = book.author;
            editBookYear.value = book.year;
            editBookIsComplete.checked = book.isComplete;
            editDialog.showModal(); // Menampilkan dialog edit
        });

        // Menambahkan tombol aksi ke dalam elemen aksi
        action.appendChild(buttonComplete);
        action.appendChild(buttonEdit);
        action.appendChild(buttonDelete);
        article.appendChild(action);
        bookList.appendChild(article);
    }

    // Fungsi untuk memindahkan buku ke rak yang sesuai
    function moveBook(book, isComplete) {
        const destinationList = isComplete ? incompleteReadBookList : completeReadBookList;
        const oppositeList = isComplete ? completeReadBookList : incompleteReadBookList;

        // Mengubah teks tombol berdasarkan status buku
        book.querySelector('.action button').textContent = isComplete ? 'Selesai dibaca' : 'Belum selesai dibaca';
        book.querySelector('.action button').classList.toggle('red');
        book.querySelector('.action button').classList.toggle('green');
        destinationList.appendChild(book); // Memindahkan buku ke rak yang sesuai

        if (oppositeList.contains(book)) {
            oppositeList.removeChild(book);
        }
    }

    // Fungsi untuk menghapus buku dari rak
    function deleteBook(book) {
        const bookList = book.parentElement;
        bookList.removeChild(book);
    }

    // Fungsi untuk mengosongkan form penambahan buku
    function clearForm() {
        document.getElementById('bookTitle').value = '';
        document.getElementById('bookAuthor').value = '';
        document.getElementById('bookYear').value = '';
        document.getElementById('bookIsComplete').checked = false;
    }

    // Fungsi untuk menyimpan data buku ke localStorage
    function saveToLocalStorage() {
        const incompleteBooks = Array.from(incompleteReadBookList.children).map(book => {
            return {
                id: parseInt(book.dataset.id), // Konversi ID buku ke angka
                title: book.querySelector('h3').textContent,
                author: book.querySelector('p:nth-of-type(1)').textContent.slice(9),
                year: parseInt(book.querySelector('p:nth-of-type(2)').textContent.slice(7)),
                isComplete: false
            };
        });

        const completeBooks = Array.from(completeReadBookList.children).map(book => {
            return {
                id: parseInt(book.dataset.id), // Konversi ID buku ke angka
                title: book.querySelector('h3').textContent,
                author: book.querySelector('p:nth-of-type(1)').textContent.slice(9),
                year: parseInt(book.querySelector('p:nth-of-type(2)').textContent.slice(7)),
                isComplete: true
            };
        });

        localStorage.setItem('incompleteBooks', JSON.stringify(incompleteBooks));
        localStorage.setItem('completeBooks', JSON.stringify(completeBooks));
    }

    // Fungsi untuk memuat data buku dari localStorage
    function loadFromLocalStorage() {
        const incompleteBooks = JSON.parse(localStorage.getItem('incompleteBooks')) || [];
        const completeBooks = JSON.parse(localStorage.getItem('completeBooks')) || [];

        incompleteBooks.forEach(book => {
            book.year = parseInt(book.year); // Konversi tahun ke angka jika memungkinkan
            book.id = parseInt(book.id); // Konversi ID ke angka jika memungkinkan
            addBookToShelf(book);
        });

        completeBooks.forEach(book => {
            book.year = parseInt(book.year); // Konversi tahun ke angka jika memungkinkan
            book.id = parseInt(book.id); // Konversi ID ke angka jika memungkinkan
            addBookToShelf(book);
        });
    }

    // Fungsi untuk menghapus data buku dari localStorage
    function removeFromLocalStorage(book) {
        const incompleteBooks = JSON.parse(localStorage.getItem('incompleteBooks')) || [];
        const completeBooks = JSON.parse(localStorage.getItem('completeBooks')) || [];

        const index = incompleteBooks.findIndex(item => item.id === parseInt(book.dataset.id));
        if (index !== -1) {
            incompleteBooks.splice(index, 1);
            localStorage.setItem('incompleteBooks', JSON.stringify(incompleteBooks));
            return;
        }

        const index2 = completeBooks.findIndex(item => item.id === parseInt(book.dataset.id));
        if (index2 !== -1) {
            completeBooks.splice(index2, 1);
            localStorage.setItem('completeBooks', JSON.stringify(completeBooks));
            return;
        }
    }

    // Fungsi untuk melakukan pencarian buku
    function searchBooks(query) {
        const allBooks = Array.from(incompleteReadBookList.children).concat(Array.from(completeReadBookList.children));
        allBooks.forEach(book => {
            const title = book.querySelector('h3').textContent.toLowerCase();
            if (title.includes(query)) {
                book.style.display = '';
            } else {
                book.style.display = 'none';
            }
        });
    }

    // Event listener untuk tombol konfirmasi hapus
    confirmDelete.addEventListener('click', function () {
        deleteBook(bookToDelete);
        removeFromLocalStorage(bookToDelete);
        deleteDialog.close();
    });

    // Event listener untuk tombol batalkan hapus
    cancelDelete.addEventListener('click', function () {
        deleteDialog.close();
    });

    // Event listener untuk submit form edit
    editForm.addEventListener('submit', function (event) {
        event.preventDefault();

        // Mengupdate data buku dengan nilai dari form edit
        bookToEdit.title = editBookTitle.value;
        bookToEdit.author = editBookAuthor.value;
        bookToEdit.year = editBookYear.value;
        bookToEdit.isComplete = editBookIsComplete.checked;

        // Memperbarui tampilan buku di rak
        const bookElement = document.querySelector(`[data-id='${bookToEdit.id}']`);
        bookElement.querySelector('h3').textContent = bookToEdit.title;
        bookElement.querySelector('p:nth-of-type(1)').textContent = `Penulis: ${bookToEdit.author}`;
        bookElement.querySelector('p:nth-of-type(2)').textContent = `Tahun: ${bookToEdit.year}`;

        // Memindahkan buku ke rak yang sesuai
        moveBook(bookElement, !bookToEdit.isComplete);
        saveToLocalStorage(); // Menyimpan data buku ke localStorage
        editDialog.close(); // Menutup dialog edit
    });

    loadFromLocalStorage(); // Memuat data buku dari localStorage
});

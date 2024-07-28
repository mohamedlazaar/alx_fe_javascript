let quotes = [];
const quoteDisplay = document.getElementById('quoteDisplay');
const newQuoteBtn = document.getElementById('newQuote');
const categorySelect = document.getElementById('categorySelect');
const categoryFilter = document.getElementById('categoryFilter');

function loadQuotes() {
    const storedQuotes = localStorage.getItem('quotes');
    if (storedQuotes) {
        quotes = JSON.parse(storedQuotes);
    }
}

function saveQuotes() {
    localStorage.setItem('quotes', JSON.stringify(quotes));
}

function showRandomQuote() {
    if (quotes.length === 0) return;
    
    const selectedCategory = categoryFilter.value;
    const filteredQuotes = selectedCategory === 'all' 
        ? quotes 
        : quotes.filter(quote => quote.category === selectedCategory);
    
    if (filteredQuotes.length === 0) {
        quoteDisplay.textContent = "No quotes available for the selected category.";
        return;
    }
    
    const randomIndex = Math.floor(Math.random() * filteredQuotes.length);
    const randomQuote = filteredQuotes[randomIndex];
    quoteDisplay.textContent = `"${randomQuote.text}" - ${randomQuote.author}`;
}

function updateCategorySelect() {
    const categories = [...new Set(quotes.map(quote => quote.category))];
    categorySelect.innerHTML = categories.map(category => 
        `<option value="${category}">${category}</option>`
    ).join('');
}
function updateCategoryFilter() {
    const categories = [...new Set(quotes.map(quote => quote.category))];
    const currentFilter = localStorage.getItem('categoryFilter') || 'all';
    
    categoryFilter.innerHTML = `
        <option value="all">All Categories</option>
        ${categories.map(category => 
            `<option value="${category}">${category}</option>`
        ).join('')}
    `;
    
    categoryFilter.value = currentFilter;
}
function filterQuotes() {
    const selectedCategory = categoryFilter.value;
    localStorage.setItem('categoryFilter', selectedCategory);
    showRandomQuote();
}

function populateCategories() {
    updateCategorySelect();
    updateCategoryFilter();
}

function addQuote(text, author, category) {
    quotes.push({ text, author, category });
    saveQuotes();
    populateCategories();
    showRandomQuote();
}
function createAddQuoteForm() {
    const form = document.getElementById('addQuoteForm');
    form.innerHTML = `
        <input type="text" id="quoteText" placeholder="Enter quote text" required>
        <input type="text" id="quoteAuthor" placeholder="Enter author" required>
        <input type="text" id="quoteCategory" placeholder="Enter category" required>
        <button onclick="handleAddQuote()">Add Quote</button>
    `;
}

function handleAddQuote() {
    const text = document.getElementById('quoteText').value;
    const author = document.getElementById('quoteAuthor').value;
    const category = document.getElementById('quoteCategory').value;
    if (text && author && category) {
        addQuote(text, author, category);
        document.getElementById('quoteText').value = '';
        document.getElementById('quoteAuthor').value = '';
        document.getElementById('quoteCategory').value = '';
    }
}

function exportToJsonFile() {
    const jsonString = JSON.stringify(quotes, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'quotes.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

function importFromJsonFile(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            try {
        const importedQuotes = JSON.parse(e.target.result);
        quotes = quotes.concat(importedQuotes);
        saveQuotes();
        populateCategories();
        showRandomQuote();
        alert('Quotes imported successfully!');
            } catch (error) {
                alert('Error importing quotes. Please check the file format.');
                console.error('Import error:', error);
            }
        };
        reader.readAsText(file);
    }
}

newQuoteBtn.addEventListener('click', showRandomQuote);
categorySelect.addEventListener('change', showRandomQuote);
categoryFilter.addEventListener('change', filterQuotes);
document.getElementById('exportQuotes').addEventListener('click', exportToJsonFile);
document.getElementById('importFile').addEventListener('change', importFromJsonFile);

function initializeApp() {
    loadQuotes();
    populateCategories();
    createAddQuoteForm();
    showRandomQuote();
}

initializeApp();
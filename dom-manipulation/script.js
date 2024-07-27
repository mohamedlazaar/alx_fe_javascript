let quotes = [];

// DOM elements
const quoteDisplay = document.getElementById('quoteDisplay');
const newQuoteBtn = document.getElementById('newQuote');
const categorySelect = document.getElementById('categorySelect');
const addQuoteForm = document.getElementById('addQuoteForm');

// Load quotes from local storage
function loadQuotes() {
    const storedQuotes = localStorage.getItem('quotes');
    if (storedQuotes) {
        quotes = JSON.parse(storedQuotes);
    }
}

// Save quotes to local storage
function saveQuotes() {
    localStorage.setItem('quotes', JSON.stringify(quotes));
}

// Function to show a random quote
function showRandomQuote() {
    const selectedCategory = categorySelect.value;
    const filteredQuotes = selectedCategory === 'All' 
        ? quotes 
        : quotes.filter(quote => quote.category === selectedCategory);
    
    if (filteredQuotes.length === 0) {
        quoteDisplay.textContent = "No quotes available for this category.";
        return;
    }

    const randomIndex = Math.floor(Math.random() * filteredQuotes.length);
    const randomQuote = filteredQuotes[randomIndex];
    
    quoteDisplay.innerHTML = `"${randomQuote.text}" <br><em>- ${randomQuote.category}</em>`;

    // Save last viewed quote to session storage
    sessionStorage.setItem('lastViewedQuote', JSON.stringify(randomQuote));
}

// Function to update category select options
function updateCategorySelect() {
    const categories = ['All', ...new Set(quotes.map(quote => quote.category))];
    categorySelect.innerHTML = '';
    categories.forEach(category => {
        const option = document.createElement('option');
        option.value = category;
        option.textContent = category;
        categorySelect.appendChild(option);
    });
}

// Function to create add quote form
function createAddQuoteForm() {
    addQuoteForm.innerHTML = '';

    const formTitle = document.createElement('h3');
    formTitle.textContent = 'Add New Quote';
    addQuoteForm.appendChild(formTitle);

    const quoteInput = document.createElement('input');
    quoteInput.type = 'text';
    quoteInput.id = 'newQuoteText';
    quoteInput.placeholder = 'Enter a new quote';
    quoteInput.required = true;
    addQuoteForm.appendChild(quoteInput);

    const categoryInput = document.createElement('input');
    categoryInput.type = 'text';
    categoryInput.id = 'newQuoteCategory';
    categoryInput.placeholder = 'Enter quote category';
    categoryInput.required = true;
    addQuoteForm.appendChild(categoryInput);

    const addButton = document.createElement('button');
    addButton.textContent = 'Add Quote';
    addButton.onclick = addQuote;
    addQuoteForm.appendChild(addButton);
}

// Function to add a new quote
function addQuote() {
    const newQuoteText = document.getElementById('newQuoteText');
    const newQuoteCategory = document.getElementById('newQuoteCategory');

    if (newQuoteText.value && newQuoteCategory.value) {
        const newQuote = {
            text: newQuoteText.value,
            category: newQuoteCategory.value
        };
        quotes.push(newQuote);

        saveQuotes();
        updateCategorySelect();
        showRandomQuote();

        newQuoteText.value = '';
        newQuoteCategory.value = '';
    }
}

// Function to export quotes to JSON file
function exportToJson() {
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

// Function to import quotes from JSON file
function importFromJsonFile(event) {
    const fileReader = new FileReader();
    fileReader.onload = function(event) {
        const importedQuotes = JSON.parse(event.target.result);
        quotes.push(...importedQuotes);
        saveQuotes();
        updateCategorySelect();
        showRandomQuote();
        alert('Quotes imported successfully!');
    };
    fileReader.readAsText(event.target.files[0]);
}

// Event listeners
newQuoteBtn.addEventListener('click', showRandomQuote);
categorySelect.addEventListener('change', showRandomQuote);

// Initialize the application
loadQuotes();
updateCategorySelect();
createAddQuoteForm();
showRandomQuote();

// Create export button
const exportBtn = document.createElement('button');
exportBtn.textContent = 'Export Quotes';
exportBtn.onclick = exportToJson;
document.body.appendChild(exportBtn);

// Create import input
const importInput = document.createElement('input');
importInput.type = 'file';
importInput.id = 'importFile';
importInput.accept = '.json';
importInput.onchange = importFromJsonFile;
document.body.appendChild(importInput);
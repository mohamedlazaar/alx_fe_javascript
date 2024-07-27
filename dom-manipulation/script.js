// Initial quotes array
let quotes = [
    { text: "Be the change you wish to see in the world.", category: "Inspirational" },
    { text: "The only way to do great work is to love what you do.", category: "Motivational" },
    { text: "In three words I can sum up everything I've learned about life: it goes on.", category: "Life" }
];

const quoteDisplay = document.getElementById('quoteDisplay')
const newQuoteBtn = document.getElementById('newQuote');
const categorySelect = document.getElementById('categorySelect')
const addQuoteForm = document.getElementById('addQuoteForm');

function showRandomQuote(){
    const selectedCategory = categorySelect.value;
    const filteredQuotes = selectedCategory == "ALL" ? quotes :
    quotes.filter(quote => quote.category == selectedCategory);
    if (filteredQuotes.length === 0) {
        quoteDisplay.textContent = "No quotes available for this category.";
        return;
    }
    const randomQuotes = filteredQuotes[Math.floor(Math.random() * filteredQuotes.length)];
    quoteDisplay.innerHtml = `"${randomQuotes.text}" <br><em>- ${randomQuotes.category}</em>`;


}
function updateCategorySelected(){
    const categories = ['ALL', ...new Set(quotes.map(quote => quote.category))]
    categorySelect.innerHTML = categories.map(category=>
        `<option value="${category}">${category}</option>`)
        .join('');
}
// Function to create add quote form
function createAddQuoteForm() {
    addQuoteForm.innerHTML = ''; // Clear existing content

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

        // Update the DOM to reflect the new quote
        const quoteElement = document.createElement('div');
        quoteElement.innerHTML = `"${newQuote.text}" <br><em>- ${newQuote.category}</em>`;
        quoteDisplay.appendChild(quoteElement);

        newQuoteText.value = '';
        newQuoteCategory.value = '';

        updateCategorySelected();
    }
}
newQuoteBtn.addEventListener('click', showRandomQuote)
categorySelect.addEventListener('change', showRandomQuote)
createAddQuoteForm()
updateCategorySelected()
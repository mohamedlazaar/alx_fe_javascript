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
function createAddQuoteForm(){
    addQuoteForm.innerHTML = 
    `        <h3>Add New Quote</h3>
    <input type="text" id="newQuoteText" placeholder="Enter a new quote" required>
    <input type="text" id="newQuoteCategory" placeholder="Enter quote category" required>
    <button onclick="addQuote()">Add Quote</button>`
}
function updateCategorySelected(){
    const categories = ['ALL', ...new Set(quotes.map(quote => quote.category))]
    categorySelect.innerHTML = categories.map(category=>
        `<option value="${category}">${category}</option>`)
        .join('');
}
function addQuotes(){
    const newQuoteText = document.getElementById('newQuoteText').value;
    const newQuoteCategory = document.getElementById('newQuoteCategory').value;
    if(newQuoteText && newQuoteCategory){
        quotes.push({
            text: newQuoteText,
            category: newQuoteCategory
        })
        newQuoteCategory= '';
        newQuoteText = '';
        updateCategorySelected()
        showRandomQuote();

    }
}
newQuoteBtn.addEventListener('click', showRandomQuote)
categorySelect.addEventListener('change', showRandomQuote)
createAddQuoteForm()
updateCategorySelected()
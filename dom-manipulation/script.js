document.addEventListener('DOMContentLoaded', () => {
    const API_URL = 'https://jsonplaceholder.typicode.com/posts';
    const SYNC_INTERVAL = 60000; // 1 minute
    let quotes = [];
    
    const quoteDisplay = document.getElementById('quoteDisplay');
    const newQuoteBtn = document.getElementById('newQuote');
    const categorySelect = document.getElementById('categorySelect');
    const categoryFilter = document.getElementById('categoryFilter');
    const notificationArea = document.getElementById('notificationArea');

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

    // Show a random quote
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

    // Update category select options
    function updateCategorySelect() {
        const categories = [...new Set(quotes.map(quote => quote.category))];
        categorySelect.innerHTML = categories.map(category => 
            `<option value="${category}">${category}</option>`
        ).join('');
    }

    // Update category filter options
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

    // Filter quotes by category
    function filterQuotes() {
        const selectedCategory = categoryFilter.value;
        localStorage.setItem('categoryFilter', selectedCategory);
        showRandomQuote();
    }

    // Add a new quote
    function addQuote(text, author, category) {
        const newQuote = { id: Date.now(), text, author, category };
        quotes.push(newQuote);
        saveQuotes();
        updateCategorySelect();
        updateCategoryFilter();
        showRandomQuote();
        postQuoteToServer(newQuote);
        syncWithServer();
    }

    // Create form for adding new quotes
    function createAddQuoteForm() {
        const form = document.getElementById('addQuoteForm');
        form.innerHTML = `
            <input type="text" id="quoteText" placeholder="Enter quote text" required>
            <input type="text" id="quoteAuthor" placeholder="Enter author" required>
            <input type="text" id="quoteCategory" placeholder="Enter category" required>
            <button type="button" id="addQuoteButton">Add Quote</button>
        `;
        document.getElementById('addQuoteButton').addEventListener('click', handleAddQuote);
    }

    // Handle adding new quotes
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

    // Export quotes to JSON file
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

    // Import quotes from JSON file
    function importFromJsonFile(event) {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                try {
                    const importedQuotes = JSON.parse(e.target.result);
                    quotes = quotes.concat(importedQuotes);
                    saveQuotes();
                    updateCategorySelect();
                    updateCategoryFilter();
                    showRandomQuote();
                    syncWithServer();
                    notifyUser('Quotes imported successfully!');
                } catch (error) {
                    notifyUser('Error importing quotes. Please check the file format.');
                    console.error('Import error:', error);
                }
            };
            reader.readAsText(file);
        }
    }

    // Fetch quotes from the server
    async function fetchQuotesFromServer() {
        try {
            const response = await fetch(API_URL);
            if (!response.ok) throw new Error('Network response was not ok');
            const serverQuotes = await response.json();
            return serverQuotes.map(q => ({
                id: q.id,
                text: q.title,
                author: 'Unknown',
                category: 'General'
            }));
        } catch (error) {
            console.error('Error fetching quotes from server:', error);
            return [];
        }
    }

    // Post new quote to the server
    async function postQuoteToServer(quote) {
        try {
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    title: quote.text,
                    body: quote.author,
                    userId: 1,
                }),
            });

            if (!response.ok) throw new Error('Network response was not ok');
            const data = await response.json();
            console.log('Quote posted to server:', data);
            return data;
        } catch (error) {
            console.error('Error posting quote to server:', error);
        }
    }

    // Sync quotes with the server
    async function syncQuotes() {
        try {
            const serverQuotes = await fetchQuotesFromServer();
            const newLocalQuotes = quotes.filter(localQuote => 
                !serverQuotes.some(serverQuote => serverQuote.id === localQuote.id)
            );

            for (const newQuote of newLocalQuotes) {
                await postQuoteToServer(newQuote);
            }

            const mergedQuotes = mergeQuotes(quotes, serverQuotes);

            if (JSON.stringify(mergedQuotes) !== JSON.stringify(quotes)) {
                quotes = mergedQuotes;
                saveQuotes();
                updateCategorySelect();
                updateCategoryFilter();
                showRandomQuote();
                notifyUser('Quotes synced with server!');
            }
        } catch (error) {
            console.error('Error syncing quotes:', error);
            notifyUser('Failed to sync quotes with the server. Please try again later.');
        }
    }

    // Merge local and server quotes
    function mergeQuotes(localQuotes, serverQuotes) {
        const mergedQuotes = [...localQuotes];
        serverQuotes.forEach(serverQuote => {
            const localIndex = mergedQuotes.findIndex(q => q.id === serverQuote.id);
            if (localIndex === -1) {
                mergedQuotes.push(serverQuote);
            } else {
                mergedQuotes[localIndex] = serverQuote;
            }
        });
        return mergedQuotes;
    }

    // Notify user with a message
    function notifyUser(message) {
        notificationArea.textContent = message;
        notificationArea.classList.add('show');
        setTimeout(() => {
            notificationArea.classList.remove('show');
        }, 3000);
    }

    // Event listeners
    newQuoteBtn.addEventListener('click', showRandomQuote);
    categoryFilter.addEventListener('change', filterQuotes);
    document.getElementById('exportQuotes').addEventListener('click', exportToJsonFile);
    document.getElementById('importFile').addEventListener('change', importFromJsonFile);

    // Initial setup
    loadQuotes();
    updateCategorySelect();
    updateCategoryFilter();
    showRandomQuote();
    createAddQuoteForm();
    setInterval(syncQuotes, SYNC_INTERVAL);
});

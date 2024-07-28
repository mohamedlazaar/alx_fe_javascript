let quotes = [];
const quoteDisplay = document.getElementById('quoteDisplay');
const newQuoteBtn = document.getElementById('newQuote');
const categorySelect = document.getElementById('categorySelect');
const categoryFilter = document.getElementById('categoryFilter');
const notificationArea = document.getElementById('notificationArea');
const syncQuotesBtn = document.getElementById('syncQuotes');

const API_URL = 'https://jsonplaceholder.typicode.com/posts';
const SYNC_INTERVAL = 60000; // 1 minute

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

function addQuote(text, author, category) {
    const newQuote = { id: Date.now(), text, author, category };
    quotes.push(newQuote);
    saveQuotes();
    updateCategorySelect();
    updateCategoryFilter();
    showRandomQuote();
    postQuoteToServer(newQuote);
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
                updateCategorySelect();
                updateCategoryFilter();
                showRandomQuote();
                syncQuotes();
                notifyUser('Quotes imported successfully!');
            } catch (error) {
                notifyUser('Error importing quotes. Please check the file format.');
                console.error('Import error:', error);
            }
        };
        reader.readAsText(file);
    }
}

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
                userId: 1, // This is required by JSONPlaceholder
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
            const conflicts = identifyConflicts(quotes, serverQuotes);
            
            if (conflicts.length > 0) {
                notifyUser(`${conflicts.length} quote(s) have conflicts. Click to resolve.`, true);
            } else {
                quotes = mergedQuotes;
                saveQuotes();
                updateCategorySelect();
                updateCategoryFilter();
                showRandomQuote();
                notifyUser('Quotes have been updated from the server.');
            }
        } else {
            notifyUser('Quotes are up to date.');
        }
    } catch (error) {
        console.error('Error syncing quotes:', error);
        notifyUser('Failed to sync quotes with the server. Please try again later.');
    }
}

function identifyConflicts(localQuotes, serverQuotes) {
    return localQuotes.filter(localQuote => {
        const serverQuote = serverQuotes.find(sq => sq.id === localQuote.id);
        return serverQuote && (serverQuote.text !== localQuote.text || serverQuote.author !== localQuote.author);
    });
}

function mergeQuotes(localQuotes, serverQuotes) {
    const mergedQuotes = [...localQuotes];
    
    serverQuotes.forEach(serverQuote => {
        const localIndex = mergedQuotes.findIndex(q => q.id === serverQuote.id);
        if (localIndex === -1) {
            mergedQuotes.push(serverQuote);
        } else {
            // Check for conflicts
            if (mergedQuotes[localIndex].text !== serverQuote.text || 
                mergedQuotes[localIndex].author !== serverQuote.author) {
                // In case of conflict, we'll keep the server version, but we could
                // also choose to keep the local version or implement a more complex
                // merging strategy
                mergedQuotes[localIndex] = serverQuote;
            }
        }
    });
    
    return mergedQuotes;
}

function notifyUser(message, isConflict = false) {
    notificationArea.textContent = message;
    notificationArea.style.display = 'block';
    notificationArea.style.backgroundColor = isConflict ? '#ffcccc' : '#ccffcc';
    
    if (isConflict) {
        const resolveButton = document.createElement('button');
        resolveButton.textContent = 'Resolve Conflict';
        resolveButton.onclick = manuallyResolveConflict;
        notificationArea.appendChild(resolveButton);
    }

    setTimeout(() => {
        notificationArea.style.display = 'none';
        notificationArea.innerHTML = ''; // Clear any added buttons
    }, 5000);
}

function manuallyResolveConflict() {
    // This function would open a UI for manual conflict resolution
    // For now, we'll just log a message
    console.log('Manual conflict resolution would be handled here');
    notifyUser('Conflict resolved. Syncing with server...', false);
    syncQuotes();
}

function initializeApp() {
    loadQuotes();
    updateCategorySelect();
    updateCategoryFilter();
    createAddQuoteForm();
    showRandomQuote();
    syncQuotes(); // Initial sync
    setInterval(syncQuotes, SYNC_INTERVAL);
}

newQuoteBtn.addEventListener('click', showRandomQuote);
categorySelect.addEventListener('change', showRandomQuote);
categoryFilter.addEventListener('change', filterQuotes);
document.getElementById('exportQuotes').addEventListener('click', exportToJsonFile);
document.getElementById('importFile').addEventListener('change', importFromJsonFile);
syncQuotesBtn.addEventListener('click', syncQuotes);

initializeApp();
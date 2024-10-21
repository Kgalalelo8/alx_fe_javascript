let quotes = JSON.parse(localStorage.getItem('quotes')) || [];

// Simulated server API URL
const API_URL = "https://jsonplaceholder.typicode.com/posts"; // Mock API

async function fetchQuotesFromServer() {
    try {
        const response = await fetch(API_URL);
        const data = await response.json();
        return data.map(item => ({ text: item.title, category: 'General' }));
    } catch (error) {
        console.error("Error fetching quotes:", error);
        return [];
    }
}

setInterval(async () => {
    const serverQuotes = await fetchQuotesFromServer();
    syncQuotesWithServer(serverQuotes);
}, 30000); // Check every 30 seconds

function syncQuotesWithServer(serverQuotes) {
    const localQuotes = JSON.parse(localStorage.getItem('quotes')) || [];
    let conflicts = [];

    serverQuotes.forEach(serverQuote => {
        const index = localQuotes.findIndex(localQuote => localQuote.text === serverQuote.text);
        if (index === -1) {
            localQuotes.push(serverQuote); // New quote from server
        } else {
            conflicts.push({ local: localQuotes[index], server: serverQuote });
            alert(`Conflict detected for: '${serverQuote.text}'`);
        }
    });

    // Show conflicts if any
    if (conflicts.length > 0) {
        displayConflicts(conflicts);
    }

    localStorage.setItem('quotes', JSON.stringify(localQuotes));
    populateCategories();
    filterQuotes();
}

function displayConflicts(conflicts) {
    const conflictList = document.getElementById('conflictList');
    conflictList.innerHTML = '';
    conflicts.forEach(conflict => {
        const li = document.createElement('li');
        li.innerText = `${conflict.local.text} (Local) vs ${conflict.server.text} (Server)`;
        conflictList.appendChild(li);
    });
    document.getElementById('conflictResolution').style.display = 'block';
}

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
    const randomIndex = Math.floor(Math.random() * quotes.length);
    const quote = quotes[randomIndex];
    document.getElementById('quoteDisplay').innerText = `"${quote.text}" - ${quote.category}`;
    sessionStorage.setItem('lastViewedQuote', JSON.stringify(quote));
}

function addQuote() {
    const newQuoteText = document.getElementById('newQuoteText').value;
    const newQuoteCategory = document.getElementById('newQuoteCategory').value;

    if (newQuoteText && newQuoteCategory) {
        const newQuote = { text: newQuoteText, category: newQuoteCategory };
        quotes.push(newQuote);
        saveQuotes();
        populateCategories();
        document.getElementById('newQuoteText').value = '';
        document.getElementById('newQuoteCategory').value = '';
        alert('Quote added successfully!');
    } else {
        alert('Please fill in both fields.');
    }
}

function exportQuotes() {
    const json = JSON.stringify(quotes, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'quotes.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
}

function importFromJsonFile(event) {
    const fileReader = new FileReader();
    fileReader.onload = function(event) {
        const importedQuotes = JSON.parse(event.target.result);
        quotes.push(...importedQuotes);
        saveQuotes();
        populateCategories();
        alert('Quotes imported successfully!');
    };
    fileReader.readAsText(event.target.files[0]);
}

function populateCategories() {
    const categoryFilter = document.getElementById('categoryFilter');
    const categories = new Set(quotes.map(quote => quote.category));
    categoryFilter.innerHTML = '<option value="all">All Categories</option>'; // Reset options

    categories.forEach(category => {
        const option = document.createElement('option');
        option.value = category;
        option.textContent = category;
        categoryFilter.appendChild(option);
    });

    const lastSelectedCategory = localStorage.getItem('lastSelectedCategory') || 'all';
    categoryFilter.value = lastSelectedCategory;
    filterQuotes(); // Filter quotes based on last selected category
}

function filterQuotes() {
    const selectedCategory = document.getElementById('categoryFilter').value;
    const filteredQuotes = selectedCategory === 'all' ? quotes : quotes.filter(quote => quote.category === selectedCategory);
    
    const randomQuoteIndex = Math.floor(Math.random() * filteredQuotes.length);
    const quote = filteredQuotes[randomQuoteIndex] || { text: "No quotes available.", category: "" };
    document.getElementById('quoteDisplay').innerText = `"${quote.text}" - ${quote.category}`;
    
    localStorage.setItem('lastSelectedCategory', selectedCategory);
}

document.getElementById('newQuote').addEventListener('click', showRandomQuote);
document.getElementById('exportQuotes').addEventListener('click', exportQuotes);
document.getElementById('importFile').addEventListener('change', importFromJsonFile);
loadQuotes();
populateCategories();

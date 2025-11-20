// Card pairs: word and image URL
const cardPairs = [
    { word: "Apple", image: "🍎" },
    { word: "Dog", image: "🐕" },
    { word: "House", image: "🏠" },
    { word: "Car", image: "🚗" },
    { word: "Sun", image: "☀️" },
    { word: "Moon", image: "🌙" },
       

];

let cards = [];
let flipped = [];
let matched = [];
let moveCount = 0;
let canFlip = true;

function initGame() {
    // Duplicate cards (word and image pair)
    cards = [];
    cardPairs.forEach(pair => {
        cards.push({ ...pair, id: `word-${pair.word}`, type: 'word' });
        cards.push({ ...pair, id: `image-${pair.word}`, type: 'image' });
    });
    
    // Shuffle cards
    cards.sort(() => Math.random() - 0.5);
    
    // Reset game state
    flipped = [];
    matched = [];
    moveCount = 0;
    canFlip = true;
    
    updateStats();
    renderBoard();
}

function renderBoard() {
    const board = document.getElementById('gameBoard');
    board.innerHTML = '';
    
    cards.forEach((card, index) => {
        const cardElement = document.createElement('div');
        cardElement.className = 'card';
        cardElement.dataset.index = index;
        
        if (matched.includes(index)) {
            cardElement.classList.add('matched');
        } else if (flipped.includes(index)) {
            cardElement.classList.add('flipped');
            cardElement.innerHTML = card.type === 'word' 
                ? `<span class="card-text">${card.word}</span>` 
                : `<span class="card-emoji">${card.image}</span>`;
        } else {
            cardElement.innerHTML = '<span class="card-back">?</span>';
        }
        
        cardElement.onclick = () => flipCard(index);
        board.appendChild(cardElement);
    });
}

function flipCard(index) {
    if (!canFlip || flipped.includes(index) || matched.includes(index)) {
        return;
    }
    
    flipped.push(index);
    renderBoard();
    
    if (flipped.length === 2) {
        canFlip = false;
        checkMatch();
    }
}

function checkMatch() {
    const [idx1, idx2] = flipped;
    const card1 = cards[idx1];
    const card2 = cards[idx2];
    
    moveCount++;
    
    // Check if cards match (same word, different types)
    const isMatch = card1.word === card2.word && card1.type !== card2.type;
    
    if (isMatch) {
        matched.push(idx1, idx2);
        flipped = [];
        updateStats();
        
        // Check for win
        if (matched.length === cards.length) {
            setTimeout(showWin, 500);
        } else {
            canFlip = true;
            renderBoard();
        }
    } else {
        // Not a match, flip back after delay
        setTimeout(() => {
            flipped = [];
            canFlip = true;
            updateStats();
            renderBoard();
        }, 1000);
    }
}

function updateStats() {
    document.getElementById('matchCount').textContent = matched.length / 2;
    document.getElementById('moveCount').textContent = moveCount;
}

function resetGame() {
    document.getElementById('gameBoard').style.display = 'block';
    document.getElementById('winMessage').style.display = 'none';
    initGame();
}

function showWin() {
    document.getElementById('gameBoard').style.display = 'none';
    document.getElementById('winMessage').style.display = 'block';
    document.getElementById('finalMoves').textContent = moveCount;
}

// Initialize game on page load
initGame();

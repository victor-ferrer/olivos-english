let data = JSON.parse(localStorage.getItem('sentencesData')) || { lists: [] };

if (!data.lists) {
    data = { lists: [] };
    saveData();
}

data.lists.forEach(list => {
    list.sentences.forEach(sentence => {
        sentence.userAnswer = '';
        sentence.revealed = false;
    });
});

function saveData() {
    localStorage.setItem('sentencesData', JSON.stringify(data));
}

function createList() {
    const input = document.getElementById('newListInput');
    const title = input.value.trim();
    
    if (title) {
        data.lists.push({
            id: Date.now(),
            title: title,
            sentences: [],
            collapsed: false
        });
        saveData();
        input.value = '';
        render();
    }
}

function deleteList(listId) {
    if (confirm('Are you sure you want to delete this list?')) {
        data.lists = data.lists.filter(list => list.id !== listId);
        saveData();
        render();
    }
}

function toggleList(listId) {
    const list = data.lists.find(l => l.id === listId);
    if (list) {
        list.collapsed = !list.collapsed;
        saveData();
        render();
    }
}

function addSentence() {
    const listSelect = document.getElementById('listSelect');
    const sentenceInput = document.getElementById('sentenceInput');
    const answerInput = document.getElementById('answerInput');
    const listId = parseInt(listSelect.value);
    const sentence = sentenceInput.value.trim();
    const answer = answerInput.value.trim();
    
    if (!listId) {
        alert('Please select a list first!');
        return;
    }
    
    if (sentence && answer) {
        if (!sentence.includes('___')) {
            alert('Please use ___ to mark the gap in your sentence!');
            return;
        }
        
        const list = data.lists.find(l => l.id === listId);
        if (list) {
            list.sentences.unshift({
                id: Date.now(),
                sentence: sentence,
                answer: answer,
                userAnswer: '',
                revealed: false
            });
            saveData();
            sentenceInput.value = '';
            answerInput.value = '';
            render();
            sentenceInput.focus();
        }
    }
}

function deleteSentence(listId, sentenceId) {
    const list = data.lists.find(l => l.id === listId);
    if (list) {
        list.sentences = list.sentences.filter(s => s.id !== sentenceId);
        saveData();
        render();
    }
}

function updateAnswer(listId, sentenceId, value) {
    const list = data.lists.find(l => l.id === listId);
    if (list) {
        const sentence = list.sentences.find(s => s.id === sentenceId);
        if (sentence) {
            sentence.userAnswer = value;
            saveData();
        }
    }
}

function checkAnswer(listId, sentenceId) {
    const list = data.lists.find(l => l.id === listId);
    if (list) {
        const sentence = list.sentences.find(s => s.id === sentenceId);
        if (sentence) {
            const input = document.querySelector(`input[data-id="${sentenceId}"]`);
            const userAnswer = sentence.userAnswer.trim().toLowerCase();
            const correctAnswer = sentence.answer.trim().toLowerCase();
            
            if (userAnswer === correctAnswer) {
                input.classList.remove('incorrect');
                input.classList.add('correct');
                setTimeout(() => alert('Correct! ✅'), 100);
            } else {
                input.classList.remove('correct');
                input.classList.add('incorrect');
                setTimeout(() => alert('Try again! ❌'), 100);
            }
        }
    }
}

function revealAnswer(listId, sentenceId) {
    const list = data.lists.find(l => l.id === listId);
    if (list) {
        const sentence = list.sentences.find(s => s.id === sentenceId);
        if (sentence) {
            sentence.revealed = true;
            sentence.userAnswer = sentence.answer;
            saveData();
            render();
        }
    }
}

function resetAnswer(listId, sentenceId) {
    const list = data.lists.find(l => l.id === listId);
    if (list) {
        const sentence = list.sentences.find(s => s.id === sentenceId);
        if (sentence) {
            sentence.userAnswer = '';
            sentence.revealed = false;
            saveData();
            render();
        }
    }
}

function renderListSelect() {
    const select = document.getElementById('listSelect');
    const currentValue = select.value;
    
    select.innerHTML = '<option value="">Select a list...</option>' +
        data.lists.map(list => 
            `<option value="${list.id}">${list.title}</option>`
        ).join('');
    
    if (currentValue) {
        select.value = currentValue;
    }
}

function render() {
    renderListSelect();
    
    const container = document.getElementById('listsContainer');
    
    if (data.lists.length === 0) {
        container.innerHTML = '<div class="empty-state">No lists yet! Create your first list above.</div>';
        return;
    }
    
    container.innerHTML = data.lists.map(list => {
        const sentencesHtml = list.sentences.length === 0 
            ? '<div class="empty-state">No sentences in this list yet.</div>'
            : list.sentences.map(item => {
                const parts = item.sentence.split('___');
                const displaySentence = parts[0] + 
                    `<input type="text" class="gap-input" data-id="${item.id}" 
                            value="${item.userAnswer}" 
                            oninput="updateAnswer(${list.id}, ${item.id}, this.value)"
                            placeholder="...">` + 
                    (parts[1] || '');
                
                return `
                    <div class="sentence-item">
                        <div class="sentence-display">${displaySentence}</div>
                        ${item.revealed ? `<div class="answer-key">✅ Answer: ${item.answer}</div>` : ''}
                        <div class="sentence-controls">
                            <button class="small-btn check-btn" onclick="checkAnswer(${list.id}, ${item.id})">Check</button>
                            <button class="small-btn reveal-btn" onclick="revealAnswer(${list.id}, ${item.id})">Reveal Answer</button>
                            <button class="small-btn reset-btn" onclick="resetAnswer(${list.id}, ${item.id})">Reset</button>
                            <button class="small-btn delete-btn" onclick="deleteSentence(${list.id}, ${item.id})">Delete</button>
                        </div>
                    </div>
                `;
            }).join('');
        
        return `
            <div>
                <div class="list-header" onclick="toggleList(${list.id})">
                    <div class="list-title">${list.title}</div>
                    <div class="list-controls">
                        <span class="list-count">${list.sentences.length} sentences</span>
                        <button class="delete-list-btn" onclick="event.stopPropagation(); deleteList(${list.id})">Delete List</button>
                        <span class="toggle-icon ${list.collapsed ? 'collapsed' : ''}">▼</span>
                    </div>
                </div>
                <div class="list-content ${list.collapsed ? 'collapsed' : ''}">
                    ${sentencesHtml}
                </div>
            </div>
        `;
    }).join('');
}

document.getElementById('newListInput').addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        createList();
    }
});

document.getElementById('sentenceInput').addEventListener('keypress', function(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        document.getElementById('answerInput').focus();
    }
});

document.getElementById('answerInput').addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        addSentence();
    }
});

function exportData() {
    const dataStr = JSON.stringify(data, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    const date = new Date().toISOString().split('T')[0];
    a.href = url;
    a.download = `sentences-backup-${date}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

function importData(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const importedData = JSON.parse(e.target.result);
            if (importedData.lists && Array.isArray(importedData.lists)) {
                if (confirm('This will replace all your current lists. Continue?')) {
                    data = importedData;
                    data.lists.forEach(list => {
                        list.sentences.forEach(sentence => {
                            sentence.userAnswer = '';
                            sentence.revealed = false;
                        });
                    });
                    saveData();
                    render();
                    alert('Data imported successfully!');
                }
            } else {
                alert('Invalid backup file format!');
            }
        } catch (error) {
            alert('Error reading backup file!');
        }
    };
    reader.readAsText(file);
    event.target.value = '';
}

render();

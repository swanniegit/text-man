document.addEventListener('DOMContentLoaded', function() {
    const generateBtn = document.getElementById('generate-btn');
    const exportBtn = document.getElementById('export-btn');
    const logoutBtn = document.getElementById('logout-btn');
    const aiPrepositionsBtn = document.getElementById('ai-prepositions-btn');
    const aiVerbsBtn = document.getElementById('ai-verbs-btn');
    const aiNounsBtn = document.getElementById('ai-nouns-btn');
    const aiAdjectivesBtn = document.getElementById('ai-adjectives-btn');
    const originalTextArea = document.getElementById('original-text');
    const wordsToRemoveInput = document.getElementById('words-to-remove');
    const exerciseContainer = document.getElementById('exercise-container');
    const textWithBlanks = document.getElementById('text-with-blanks');
    const wordBank = document.getElementById('word-bank');

    let currentExerciseData = null;

    generateBtn.addEventListener('click', generateExercise);
    exportBtn.addEventListener('click', exportToWord);
    logoutBtn.addEventListener('click', logout);
    aiPrepositionsBtn.addEventListener('click', () => aiExtractWordType('prepositions'));
    aiVerbsBtn.addEventListener('click', () => aiExtractWordType('verbs'));
    aiNounsBtn.addEventListener('click', () => aiExtractWordType('nouns'));
    aiAdjectivesBtn.addEventListener('click', () => aiExtractWordType('adjectives'));

    function generateExercise() {
        const originalText = originalTextArea.value.trim();
        let wordsToRemove = wordsToRemoveInput.value
            .split(',')
            .map(word => word.trim())
            .filter(word => word.length > 0);

        if (!originalText) {
            alert('Please enter some text first.');
            return;
        }

        if (wordsToRemove.length === 0) {
            alert('Please enter words to remove.');
            return;
        }

        const { textWithBlankSpaces, removedWords, blankData } = processText(originalText, wordsToRemove);
        
        // Store data for export
        currentExerciseData = {
            originalText,
            textWithBlanks: textWithBlankSpaces,
            removedWords,
            blankData
        };
        
        displayTextWithBlanks(textWithBlankSpaces);
        displayWordBank(removedWords);
        
        exerciseContainer.style.display = 'flex';
    }

    function processText(text, wordsToRemove) {
        const removedWords = [];
        const blankData = [];
        
        // Find all occurrences of words to remove with their positions
        const wordsWithPositions = [];
        
        wordsToRemove.forEach(wordToRemove => {
            const regex = new RegExp('\\b' + escapeRegExp(wordToRemove) + '\\b', 'gi');
            let match;
            while ((match = regex.exec(text)) !== null) {
                wordsWithPositions.push({
                    word: match[0],
                    start: match.index,
                    end: match.index + match[0].length
                });
            }
        });
        
        // Sort by position in text to maintain sequential order
        wordsWithPositions.sort((a, b) => a.start - b.start);
        
        // Create blank data for export
        wordsWithPositions.forEach((wordInfo, index) => {
            blankData.push({
                number: index + 1,
                word: wordInfo.word
            });
        });
        
        // Replace words with numbered blanks in reverse order to maintain positions
        let processedText = text;
        for (let i = wordsWithPositions.length - 1; i >= 0; i--) {
            const wordInfo = wordsWithPositions[i];
            removedWords.push(wordInfo.word);
            
            // Find the correct sequential number for this position
            const sequentialNumber = wordsWithPositions.findIndex(item => item.start === wordInfo.start) + 1;
            
            processedText = processedText.substring(0, wordInfo.start) + 
                          `<span class="blank">${sequentialNumber}.</span>` + 
                          processedText.substring(wordInfo.end);
        }
        
        // Reverse the removedWords array to match the original text order
        removedWords.reverse();

        return {
            textWithBlankSpaces: processedText,
            removedWords: shuffleArray([...removedWords]),
            blankData: blankData
        };
    }

    function escapeRegExp(string) {
        return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }

    function getPrepositionsFromText(text) {
        // Common English prepositions
        const allPrepositions = [
            'in', 'on', 'at', 'by', 'for', 'with', 'to', 'from', 'of', 'about',
            'under', 'over', 'through', 'between', 'among', 'during', 'before',
            'after', 'above', 'below', 'across', 'around', 'behind', 'beside',
            'near', 'against', 'toward', 'towards', 'within', 'without', 'upon',
            'into', 'onto', 'out', 'off', 'up', 'down', 'along', 'throughout',
            'beyond', 'beneath', 'inside', 'outside', 'except', 'despite',
            'regarding', 'concerning', 'according', 'including', 'excluding'
        ];

        const foundPrepositions = [];
        const words = text.toLowerCase().match(/\b\w+\b/g) || [];
        
        allPrepositions.forEach(prep => {
            if (words.includes(prep)) {
                foundPrepositions.push(prep);
            }
        });

        return foundPrepositions;
    }

    function shuffleArray(array) {
        const shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    }

    function displayTextWithBlanks(text) {
        textWithBlanks.innerHTML = text;
    }

    function displayWordBank(words) {
        wordBank.innerHTML = '';
        
        if (words.length === 0) {
            wordBank.innerHTML = '<p>No words found to remove.</p>';
            return;
        }

        words.forEach(word => {
            const wordItem = document.createElement('div');
            wordItem.className = 'word-item';
            wordItem.textContent = word;
            wordBank.appendChild(wordItem);
        });
    }

    async function exportToWord() {
        if (!currentExerciseData) {
            alert('Please generate an exercise first.');
            return;
        }

        try {
            const { Document, Packer, Paragraph, Table, TableRow, TableCell, TextRun, WidthType } = docx;

            // Get text with blanks (clean HTML and add underscores)
            const textWithBlanks = currentExerciseData.textWithBlanks.replace(/<span class="blank">(\d+)\.<\/span>/g, '$1 ____');
            
            // Create word bank paragraphs (one word per line)
            const wordBankParagraphs = currentExerciseData.removedWords.map(word => 
                new Paragraph({ children: [new TextRun(word)] })
            );

            // Create single row table
            const tableRow = new TableRow({
                children: [
                    new TableCell({
                        children: [new Paragraph({ children: [new TextRun(textWithBlanks)] })],
                        width: { size: 50, type: WidthType.PERCENTAGE }
                    }),
                    new TableCell({
                        children: [new Paragraph({ children: [new TextRun(" ")] })],
                        width: { size: 25, type: WidthType.PERCENTAGE }
                    }),
                    new TableCell({
                        children: wordBankParagraphs,
                        width: { size: 25, type: WidthType.PERCENTAGE }
                    })
                ]
            });

            // Create the document
            const doc = new Document({
                sections: [{
                    children: [
                        new Table({
                            rows: [tableRow],
                            width: { size: 100, type: WidthType.PERCENTAGE }
                        })
                    ]
                }]
            });

            // Generate and save the document
            const buffer = await Packer.toBlob(doc);
            saveAs(buffer, "fill-in-the-blanks-exercise.docx");

        } catch (error) {
            console.error('Export error:', error);
            alert('Error exporting to Word. Please try again.');
        }
    }


    async function aiExtractWordType(wordType) {
        const originalText = originalTextArea.value.trim();
        
        if (!originalText) {
            alert('Please enter some text first.');
            return;
        }

        // Get the correct button based on word type
        let button;
        switch(wordType) {
            case 'prepositions': button = aiPrepositionsBtn; break;
            case 'verbs': button = aiVerbsBtn; break;
            case 'nouns': button = aiNounsBtn; break;
            case 'adjectives': button = aiAdjectivesBtn; break;
        }

        // Disable button and show loading
        button.disabled = true;
        const originalText_btn = button.textContent;
        button.textContent = 'Extracting...';

        try {
            const response = await fetch('/api/extract-words', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    text: originalText,
                    wordType: wordType
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'API request failed');
            }

            const data = await response.json();
            const extractedWords = data.words;
            
            // Put the AI extracted words in the input field
            wordsToRemoveInput.value = extractedWords;
            
        } catch (error) {
            console.error(`OpenAI ${wordType} extraction error:`, error);
            alert(`OpenAI ${wordType} extraction failed. Please check your API key and connection, or enter words manually.`);
        } finally {
            // Re-enable button
            button.disabled = false;
            button.textContent = originalText_btn;
        }
    }

    // Logout function
    function logout() {
        localStorage.removeItem('isLoggedIn');
        localStorage.removeItem('username');
        localStorage.removeItem('loginTime');
        window.location.replace('login.html');
    }

    // Make logout function global so the logout button can access it
    window.logout = logout;
});
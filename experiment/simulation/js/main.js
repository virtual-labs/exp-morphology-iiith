// Google Analytics
(function(i, s, o, g, r, a, m) {
    i['GoogleAnalyticsObject'] = r;
    i[r] = i[r] || function() {
        (i[r].q = i[r].q || []).push(arguments)
    }, i[r].l = 1 * new Date();
    a = s.createElement(o), m = s.getElementsByTagName(o)[0];
    a.async = 1;
    a.src = g;
    m.parentNode.insertBefore(a, m)
})(window, document, 'script', '//www.google-analytics.com/analytics.js', 'ga');
ga('create', 'UA-67558473-1', 'auto');
ga('send', 'pageview');

// Morphological Analysis Data Manager
class MorphologyAnalyzer {
    constructor() {
        this.rootWords = new Map();
        this.paradigmData = new Map();
        this.answerOptions = [];
        this.currentRoot = null;
        this.currentParadigm = null;
        this.correctAnswers = [];
        this.userAnswers = [];
        this.isInitialized = false;
    }

    // Load data from text files (replacing PHP file reading)
    async loadData() {
        try {
            console.log('Loading data files...');
            
            // Load options (root words)
            const optionsResponse = await fetch('Exp3/options.txt');
            if (!optionsResponse.ok) {
                throw new Error(`Failed to load options.txt: ${optionsResponse.status}`);
            }
            const optionsText = await optionsResponse.text();
            console.log('Options text loaded, first 200 chars:', optionsText.substring(0, 200));
            this.parseOptions(optionsText);

            // Load paradigm data
            const paradigmResponse = await fetch('Exp3/paradigm.txt');
            if (!paradigmResponse.ok) {
                throw new Error(`Failed to load paradigm.txt: ${paradigmResponse.status}`);
            }
            const paradigmText = await paradigmResponse.text();
            console.log('Paradigm text loaded, first 200 chars:', paradigmText.substring(0, 200));
            this.parseParadigm(paradigmText);

            // Load answer options
            const answersResponse = await fetch('Exp3/answers_opt.txt');
            if (!answersResponse.ok) {
                throw new Error(`Failed to load answers_opt.txt: ${answersResponse.status}`);
            }
            const answersText = await answersResponse.text();
            console.log('Answers text loaded, first 200 chars:', answersText.substring(0, 200));
            this.parseAnswerOptions(answersText);

            this.isInitialized = true;
            console.log('Data loaded successfully');
            console.log('Root words:', Array.from(this.rootWords.entries()));
            console.log('Paradigm data:', Array.from(this.paradigmData.entries()));
            console.log('Answer options:', this.answerOptions);
            return true;
        } catch (error) {
            console.error('Error loading data:', error);
            return false;
        }
    }

    // Parse options.txt file
    parseOptions(text) {
        const lines = text.trim().split('\n');
        console.log('Parsing options:', lines);
        
        lines.forEach(line => {
            const parts = line.trim().split(/\s+/);
            if (parts.length >= 2) {
                const paradigmId = parts[0];
                const word = parts[1];
                this.rootWords.set(word, paradigmId);
                console.log(`Added root word: ${word} -> paradigm ${paradigmId}`);
            }
        });
    }

    // Parse paradigm.txt file
    parseParadigm(text) {
        const lines = text.trim().split('\n');
        console.log('Parsing paradigm lines:', lines.length);
        
        lines.forEach((line, lineIndex) => {
            const parts = line.trim().split(/\s+/);
            console.log(`Line ${lineIndex + 1}: "${line.trim()}" -> ${parts.length} parts`);
            
            if (parts.length >= 10) {
                const paradigmId = parts[0];
                const rootWord = parts[1];
                const tokens = parts.slice(2, 10).map(t => t.trim());
                const deletes = tokens.slice(0, 4);
                const adds = tokens.slice(4, 8);
                this.paradigmData.set(paradigmId, {
                    root: rootWord,
                    transformations: { deletes, adds }
                });
                console.log(`Added paradigm ${paradigmId}: root="${rootWord}", deletes=`, deletes, 'adds=', adds);
            } else {
                console.warn(`Line ${lineIndex + 1} has insufficient parts (${parts.length}):`, parts);
            }
        });
    }

    // Parse answers_opt.txt file
    parseAnswerOptions(text) {
        // Split by newlines and filter out empty lines, trim each option
        this.answerOptions = text.trim().split('\n')
            .map(opt => opt.trim())
            .filter(opt => opt.length > 0);
        console.log('Answer options parsed:', this.answerOptions.length, 'options');
        console.log('First 10 options:', this.answerOptions.slice(0, 10));
    }

    // Get root words for dropdown
    getRootWords() {
        return Array.from(this.rootWords.keys());
    }

    // Get paradigm for selected root
    getParadigm(rootWord) {
        const paradigmId = this.rootWords.get(rootWord);
        console.log(`Getting paradigm for ${rootWord}: paradigm ID ${paradigmId}`);
        
        if (paradigmId) {
            const paradigm = this.paradigmData.get(paradigmId);
            console.log('Found paradigm:', paradigm);
            return paradigm;
        }
        return null;
    }

    // Generate word forms table
    generateWordFormsTable(rootWord) {
        const paradigm = this.getParadigm(rootWord);
        if (!paradigm) return null;

        const deletes = paradigm.transformations.deletes;
        const adds = paradigm.transformations.adds;

        const forms = [
            { number: 'Singular', case: 'Direct', index: 0 },
            { number: 'Singular', case: 'Oblique', index: 1 },
            { number: 'Plural', case: 'Direct', index: 2 },
            { number: 'Plural', case: 'Oblique', index: 3 }
        ];

        return forms.map(form => ({
            word: this.applyDeleteAdd(rootWord, deletes[form.index], adds[form.index]),
            root: rootWord,
            number: form.number,
            case: form.case,
            transformation: { del: deletes[form.index], add: adds[form.index] }
        }));
    }

    // Apply delete + add to form the target word
    applyDeleteAdd(root, delSuffix, addSuffix) {
        console.log(`Generating word form: root="${root}", delete="${delSuffix}", add="${addSuffix}"`);
        const NONE = '(none)';
        const shouldDelete = delSuffix && delSuffix !== NONE;
        const shouldAdd = addSuffix && addSuffix !== NONE;

        let base = root;
        if (shouldDelete) {
            if (root.endsWith(delSuffix)) {
                base = root.slice(0, root.length - delSuffix.length);
                console.log(`Deleted suffix "${delSuffix}": "${root}" -> "${base}"`);
            } else {
                console.log(`Delete suffix "${delSuffix}" not found at end of "${root}". Leaving root unchanged.`);
            }
        }

        if (shouldAdd) {
            const result = base + addSuffix;
            console.log(`Added suffix "${addSuffix}": "${base}" -> "${result}"`);
            return result;
        }

        return base;
    }

    // Get correct answers for current paradigm
    getCorrectAnswers(rootWord) {
        const paradigm = this.getParadigm(rootWord);
        if (!paradigm) return [];

        const { deletes, adds } = paradigm.transformations;
        return [
            deletes[0], // delete singular direct
            adds[0],    // add singular direct
            deletes[1], // delete singular oblique
            adds[1],    // add singular oblique
            deletes[2], // delete plural direct
            adds[2],    // add plural direct
            deletes[3], // delete plural oblique
            adds[3]     // add plural oblique
        ];
    }

    // Check user answers
    checkAnswers(userAnswers) {
        const results = [];
        const correct = this.correctAnswers;
        
        console.log('Checking answers:', userAnswers);
        console.log('Correct answers:', correct);
        
        for (let i = 0; i < 8; i++) {
            const isCorrect = userAnswers[i] === correct[i];
            results.push(isCorrect);
            console.log(`Answer ${i}: ${userAnswers[i]} vs ${correct[i]} = ${isCorrect}`);
        }
        
        return results;
    }

    // Helper function to check if an answer is correct
    isAnswerCorrect(userAnswer, correctAnswer) {
        // If user hasn't selected anything, it's always incorrect
        if (userAnswer === '' || userAnswer === 'Select...') {
            return false;
        }
        
        if (userAnswer === correctAnswer) {
            return true;
        }
        
        // Handle special case where "(none)" and empty string should be equivalent
        if ((userAnswer === '(none)') && 
            (correctAnswer === '' || correctAnswer === '(none)' || correctAnswer === 'Select...')) {
            return true;
        }
        
        return false;
    }

    // Validate paradigm data for consistency
    validateParadigmData() {
        console.log('Validating paradigm data...');
        for (const [paradigmId, paradigm] of this.paradigmData.entries()) {
            const { deletes, adds } = paradigm.transformations;
            const root = paradigm.root;

            // Basic sanity checks
            if (!Array.isArray(deletes) || !Array.isArray(adds) || deletes.length !== 4 || adds.length !== 4) {
                console.warn(`WARNING: Paradigm ${paradigmId} has malformed transformations.`);
                continue;
            }

            // Ensure tokens are non-empty strings ("(none)" is allowed)
            [...deletes, ...adds].forEach(tok => {
                if (typeof tok !== 'string' || tok.length === 0) {
                    console.warn(`WARNING: Paradigm ${paradigmId} contains an empty transformation token.`);
                }
            });

            // Log useful info
            console.log(`Paradigm ${paradigmId}: root="${root}", deletes=${JSON.stringify(deletes)}, adds=${JSON.stringify(adds)}`);
        }
        console.log('Paradigm data validation complete.');
    }
}

// DOM Elements
const rootSelection = document.getElementById('rootSelection');
const paradigmSection = document.getElementById('paradigmSection');
const paradigmTable = document.getElementById('paradigmTable');
const addDeleteSection = document.getElementById('addDeleteSection');
const addDeleteTableBody = document.getElementById('addDeleteTableBody');
const submitButton = document.getElementById('submitButton');
const getAnswerButton = document.getElementById('getAnswerButton');
const resetButton = document.getElementById('resetButton');
const feedback = document.getElementById('feedback');
const correctAnswer = document.getElementById('correctAnswer');
const checkHeader = document.getElementById('checkHeader');

// Initialize the analyzer
const analyzer = new MorphologyAnalyzer();

// Initialize the application
async function initializeApp() {
    console.log('Initializing app...');
    
    try {
        const loaded = await analyzer.loadData();
        if (!loaded) {
            showFeedback('Error loading data. Please refresh the page.', 'error');
            console.error('Failed to load data');
            return;
        }

        // Verify data was loaded
        if (analyzer.rootWords.size === 0) {
            console.error('No root words loaded!');
            showFeedback('No data loaded. Please check the data files.', 'error');
            return;
        }

        populateRootWordsDropdown();
        setupEventListeners();
        setupInstructionsPanel();
        
        console.log('App initialized successfully');
        console.log('Total root words available:', analyzer.rootWords.size);
    } catch (error) {
        console.error('Error during initialization:', error);
        showFeedback('Error initializing application: ' + error.message, 'error');
    }
}

// Populate root words dropdown
function populateRootWordsDropdown() {
    const rootWords = analyzer.getRootWords();
    console.log('Populating dropdown with root words:', rootWords);
    
    // Clear existing options
    rootSelection.innerHTML = '';
    
    // Add default option
    const defaultOption = document.createElement('option');
    defaultOption.value = '';
    defaultOption.textContent = 'Select a root word...';
    rootSelection.appendChild(defaultOption);
    
    // Add root word options
    rootWords.forEach((word, index) => {
        const option = document.createElement('option');
        option.value = word;
        option.textContent = word;
        // Add data attribute for debugging
        option.setAttribute('data-index', index);
        rootSelection.appendChild(option);
        console.log(`Added option ${index + 1}: "${word}" (length: ${word.length})`);
    });
    
    console.log('Dropdown populated with', rootWords.length, 'words');
    console.log('Total options in dropdown:', rootSelection.options.length);
    
    // Verify options are visible
    if (rootSelection.options.length <= 1) {
        console.error('Dropdown has no word options!');
        showFeedback('No words available in dropdown. Please check data files.', 'error');
    }
}

// Handle root word selection
function handleRootSelection() {
    const selectedRoot = rootSelection.value;
    console.log('Root selected:', selectedRoot);
    
    if (!selectedRoot) {
        hideParadigmSection();
        hideAddDeleteSection();
        return;
    }

    analyzer.currentRoot = selectedRoot;
    analyzer.currentParadigm = analyzer.getParadigm(selectedRoot);
    analyzer.correctAnswers = analyzer.getCorrectAnswers(selectedRoot);
    
    console.log('Current paradigm:', analyzer.currentParadigm);
    console.log('Correct answers:', analyzer.correctAnswers);
    
    showParadigmTable(selectedRoot);
    showAddDeleteTable();
    clearFeedback();
    clearResults();
}

// Show paradigm table
function showParadigmTable(rootWord) {
    const wordForms = analyzer.generateWordFormsTable(rootWord);
    if (!wordForms) return null;

    console.log('Generating paradigm table for:', rootWord);
    console.log('Word forms:', wordForms);

    let tableHTML = `
        <table class="paradigm-display-table">
            <thead>
                <tr>
                    <th>Word</th>
                    <th>Root</th>
                    <th>Number</th>
                    <th>Case</th>
                </tr>
            </thead>
            <tbody>
    `;

    wordForms.forEach((form, index) => {
        console.log(`Form ${index}: word="${form.word}", root="${form.root}", number="${form.number}", case="${form.case}"`);
        tableHTML += `
            <tr>
                <td>${form.word || '(empty)'}</td>
                <td>${form.root || '(empty)'}</td>
                <td>${form.number}</td>
                <td>${form.case}</td>
            </tr>
        `;
    });

    tableHTML += '</tbody></table>';
    paradigmTable.innerHTML = tableHTML;
    paradigmSection.style.display = 'block';
}

// Show add-delete table
function showAddDeleteTable() {
    const categories = [
        { number: 'sing', case: 'dr', label: 'Singular Direct', fullNumber: 'Singular', fullCase: 'Direct' },
        { number: 'sing', case: 'ob', label: 'Singular Oblique', fullNumber: 'Singular', fullCase: 'Oblique' },
        { number: 'plu', case: 'dr', label: 'Plural Direct', fullNumber: 'Plural', fullCase: 'Direct' },
        { number: 'plu', case: 'ob', label: 'Plural Oblique', fullNumber: 'Plural', fullCase: 'Oblique' }
    ];

    console.log('Creating add-delete table with options:', analyzer.answerOptions);

    // Set the header text to "Results"
    if (checkHeader) {
        checkHeader.innerHTML = '<b>Results</b>';
    }

    let tableHTML = '';
    categories.forEach((cat, index) => {
        tableHTML += `
            <tr>
                <td>
                    <select id="del${cat.number}${cat.case}" class="select-box">
                        <option value="">Select...</option>
                        ${analyzer.answerOptions.map(opt => `<option value="${opt}">${opt}</option>`).join('')}
                    </select>
                </td>
                <td>
                    <select id="add${cat.number}${cat.case}" class="select-box">
                        <option value="">Select...</option>
                        ${analyzer.answerOptions.map(opt => `<option value="${opt}">${opt}</option>`).join('')}
                    </select>
                </td>
                <td>${cat.fullNumber}</td>
                <td>${cat.fullCase}</td>
                <td id="check${index}" class="check-cell">-</td>
            </tr>
        `;
    });

    addDeleteTableBody.innerHTML = tableHTML;
    addDeleteSection.style.display = 'block';
    submitButton.disabled = false;
    
    // Clear all dropdowns to default empty state
    const allSelects = addDeleteTableBody.querySelectorAll('select');
    allSelects.forEach(select => {
        select.selectedIndex = 0;
    });
    
    // Add event listeners for real-time color updates
    setupDropdownEventListeners();
}

// Setup event listeners for dropdowns to update colors in real-time
function setupDropdownEventListeners() {
    const deleteSelects = [
        document.getElementById('delsingdr'),
        document.getElementById('delsingob'),
        document.getElementById('delpludr'),
        document.getElementById('delpluob')
    ];
    
    const addSelects = [
        document.getElementById('addsingdr'),
        document.getElementById('addsingob'),
        document.getElementById('addpludr'),
        document.getElementById('addpluob')
    ];
    
    // Add change event listeners to all dropdowns - but don't update colors in real-time
    [...deleteSelects, ...addSelects].forEach((select, index) => {
        if (select) {
            select.addEventListener('change', () => {
                // Don't update colors in real-time - only after submit
                // updateDropdownColor(select, index);
            });
        }
    });
}

// Update individual dropdown color based on current selection
function updateDropdownColor(select, index) {
    if (!analyzer.correctAnswers.length) return;
    
    const userValue = select.value;
    const correctValue = analyzer.correctAnswers[index];
    const isCorrect = userValue === correctValue;
    
    // Remove existing classes
    select.classList.remove('correct', 'incorrect');
    
    // Reset inline styles
    select.style.backgroundColor = '';
    select.style.borderColor = '';
    
    if (userValue === '') {
        // No selection - neutral state
        return;
    }
    
    if (isCorrect) {
        // Correct answer - green
        select.classList.add('correct');
        select.style.backgroundColor = '#e8f5e9';
        select.style.borderColor = '#4CAF50';
    } else {
        // Wrong answer - red
        select.classList.add('incorrect');
        select.style.backgroundColor = '#ffebee';
        select.style.borderColor = '#f44336';
    }
}

// Handle form submission
function handleSubmit() {
    console.log('Submit button clicked');
    
    if (!analyzer.currentRoot) {
        console.log('No root selected');
        return;
    }

    // Collect user answers in Add-Delete format
    // Format: [del_sing_dr, add_sing_dr, del_sing_ob, add_sing_ob, del_plu_dr, add_plu_dr, del_plu_ob, add_plu_ob]
    const userAnswers = [
        document.getElementById('delsingdr').value,    // Delete singular direct
        document.getElementById('addsingdr').value,    // Add singular direct
        document.getElementById('delsingob').value,    // Delete singular oblique
        document.getElementById('addsingob').value,    // Add singular oblique
        document.getElementById('delpludr').value,     // Delete plural direct
        document.getElementById('addpludr').value,     // Add plural direct
        document.getElementById('delpluob').value,     // Delete plural oblique
        document.getElementById('addpluob').value      // Add plural oblique
    ];

    console.log('User answers collected:', userAnswers);

    // Check if all fields are filled
    const emptyFields = userAnswers.filter(answer => answer === '' || answer === 'Select...');
    if (emptyFields.length > 0) {
        showFeedback('❌ Please fill in all fields before submitting. You have ' + emptyFields.length + ' unanswered questions.', 'error');
        return;
    }

    analyzer.userAnswers = userAnswers;
    const results = analyzer.checkAnswers(userAnswers);
    
    console.log('Check results:', results);
    
    // Update UI with results
    updateCheckResults(results);
    
    // Show feedback
    const allCorrect = results.every(result => result);
    if (allCorrect) {
        showFeedback('✅ Correct! All transformations are correct.', 'success');
        getAnswerButton.style.display = 'none';
    } else {
        showFeedback('❌ Some transformations are incorrect. Review your answers or use "Get Answer" to see the correct transformations.', 'error');
        getAnswerButton.style.display = 'inline-flex';
        getAnswerButton.disabled = false;
    }
    
    // Update header to show "Results" clearly
    if (checkHeader) {
    checkHeader.innerHTML = '<b>Results</b>';
    }
}

// Update check results in the table
function updateCheckResults(results) {
    // Get all select elements
    const deleteSelects = [
        document.getElementById('delsingdr'),
        document.getElementById('delsingob'),
        document.getElementById('delpludr'),
        document.getElementById('delpluob')
    ];
    
    const addSelects = [
        document.getElementById('addsingdr'),
        document.getElementById('addsingob'),
        document.getElementById('addpludr'),
        document.getElementById('addpluob')
    ];
    
    // Update visual feedback for dropdowns - only after submit
    for (let i = 0; i < 4; i++) {
        const checkCell = document.getElementById(`check${i}`);
        const deleteCorrect = results[i * 2];     // Delete answer (even indices: 0, 2, 4, 6)
        const addCorrect = results[i * 2 + 1];   // Add answer (odd indices: 1, 3, 5, 7)
        
        // Update dropdown styles - highlight wrong answers after submit
        if (deleteSelects[i]) {
            const userValue = deleteSelects[i].value;
            const correctValue = analyzer.correctAnswers[i * 2];
            const isCorrect = analyzer.isAnswerCorrect(userValue, correctValue);
            
            // Remove existing classes
            deleteSelects[i].classList.remove('correct', 'incorrect');
            deleteSelects[i].style.backgroundColor = '';
            deleteSelects[i].style.borderColor = '';
            
            // Always show styling for answered questions
            if (userValue !== '' && userValue !== 'Select...') {
                if (isCorrect) {
                    deleteSelects[i].classList.add('correct');
                    deleteSelects[i].style.backgroundColor = '#e8f5e9';
                    deleteSelects[i].style.borderColor = '#4CAF50';
                } else {
                    deleteSelects[i].classList.add('incorrect');
                    deleteSelects[i].style.backgroundColor = '#ffebee';
                    deleteSelects[i].style.borderColor = '#f44336';
                }
            } else {
                // No selection made - mark as incorrect
                deleteSelects[i].classList.add('incorrect');
                deleteSelects[i].style.backgroundColor = '#ffebee';
                deleteSelects[i].style.borderColor = '#f44336';
            }
        }
        
        if (addSelects[i]) {
            const userValue = addSelects[i].value;
            const correctValue = analyzer.correctAnswers[i * 2 + 1];
            const isCorrect = analyzer.isAnswerCorrect(userValue, correctValue);
            
            // Remove existing classes
            addSelects[i].classList.remove('correct', 'incorrect');
            addSelects[i].style.backgroundColor = '';
            addSelects[i].style.borderColor = '';
            
            // Always show styling for answered questions
            if (userValue !== '' && userValue !== 'Select...') {
                if (isCorrect) {
                    addSelects[i].classList.add('correct');
                    addSelects[i].style.backgroundColor = '#e8f5e9';
                    addSelects[i].style.borderColor = '#4CAF50';
                } else {
                    addSelects[i].classList.add('incorrect');
                    addSelects[i].style.backgroundColor = '#ffebee';
                    addSelects[i].style.borderColor = '#f44336';
                }
            } else {
                // No selection made - mark as incorrect
                addSelects[i].classList.add('incorrect');
                addSelects[i].style.backgroundColor = '#ffebee';
                addSelects[i].style.borderColor = '#f44336';
            }
        }
        
        // Update check cell - both delete and add must be correct
        if (deleteCorrect && addCorrect) {
            checkCell.innerHTML = '<i class="fas fa-check-circle" style="color: #4CAF50; font-size: 1.2em;"></i>';
            console.log(`Row ${i}: Both delete and add correct - showing green checkmark`);
        } else {
            checkCell.innerHTML = '<i class="fas fa-times-circle" style="color: #F44336; font-size: 1.2em;"></i>';
            console.log(`Row ${i}: Delete correct: ${deleteCorrect}, Add correct: ${addCorrect} - showing red X`);
        }
    }
}

// Show correct answers
function showCorrectAnswers() {
    if (!analyzer.correctAnswers.length) {
        console.log('No correct answers available');
        return;
    }

    console.log('Showing correct answers:', analyzer.correctAnswers);

    // Clear any existing feedback or notifications
    clearFeedback();

    let answerHTML = `
        <h4>Correct Add-Delete Table for "${analyzer.currentRoot}"</h4>
        <table class="correct-answer-table">
            <thead>
                <tr>
                    <th>Delete</th>
                    <th>Add</th>
                    <th>Number</th>
                    <th>Case</th>
                </tr>
            </thead>
            <tbody>
    `;

    const categories = [
        { number: 'Singular', case: 'Direct', index: 0 },
        { number: 'Singular', case: 'Oblique', index: 1 },
        { number: 'Plural', case: 'Direct', index: 2 },
        { number: 'Plural', case: 'Oblique', index: 3 }
    ];

    categories.forEach((cat, index) => {
        const deleteIndex = index * 2;
        const addIndex = index * 2 + 1;
        answerHTML += `
            <tr>
                <td>${analyzer.correctAnswers[deleteIndex] || '(none)'}</td>
                <td>${analyzer.correctAnswers[addIndex] || '(none)'}</td>
                <td>${cat.number}</td>
                <td>${cat.case}</td>
            </tr>
        `;
    });

    answerHTML += '</tbody></table>';
    correctAnswer.innerHTML = answerHTML;
    correctAnswer.style.display = 'block';
}

// Reset the simulation
function resetSimulation() {
    console.log('Resetting simulation');
    
    rootSelection.selectedIndex = 0;
    hideParadigmSection();
    hideAddDeleteSection();
    clearFeedback();
    clearResults();
    analyzer.currentRoot = null;
    analyzer.currentParadigm = null;
    analyzer.correctAnswers = [];
    analyzer.userAnswers = [];
    submitButton.disabled = true;
    getAnswerButton.style.display = 'none';
    
    // Set header to show "Results"
    if (checkHeader) {
        checkHeader.innerHTML = '<b>Results</b>';
    }
    
    // Clear correct answer display
    correctAnswer.innerHTML = '';
    correctAnswer.style.display = 'none';
}

// Utility functions
function hideParadigmSection() {
    paradigmSection.style.display = 'none';
}

function hideAddDeleteSection() {
    addDeleteSection.style.display = 'none';
}

function clearFeedback() {
    feedback.innerHTML = '';
    feedback.className = 'feedback-container';
}

function clearResults() {
    correctAnswer.innerHTML = '';
    correctAnswer.style.display = 'none';
    
    // Reset header to show "Results"
    if (checkHeader) {
        checkHeader.innerHTML = '<b>Results</b>';
    }
    
    // Clear check marks and show placeholder text
    for (let i = 0; i < 4; i++) {
        const checkCell = document.getElementById(`check${i}`);
        if (checkCell) {
            checkCell.innerHTML = '-';
        }
    }
    
    // Clear all dropdown selections and reset styling
    const allSelects = addDeleteTableBody.querySelectorAll('select');
    allSelects.forEach(select => {
        select.selectedIndex = 0;
        select.classList.remove('correct', 'incorrect');
        // Reset inline styles
        select.style.backgroundColor = '';
        select.style.borderColor = '';
    });
}

function showFeedback(message, type) {
    feedback.innerHTML = message;
    feedback.className = `feedback-container ${type}`;
}

// Setup event listeners
function setupEventListeners() {
    console.log('Setting up event listeners');
    
    rootSelection.addEventListener('change', handleRootSelection);
    submitButton.addEventListener('click', handleSubmit);
    getAnswerButton.addEventListener('click', showCorrectAnswers);
    resetButton.addEventListener('click', resetSimulation);
}

// Setup instructions panel
function setupInstructionsPanel() {
    const instructionsTab = document.getElementById('instructionsTab');
    const instructionsContent = document.getElementById('instructionsContent');
    const arrowIcon = instructionsTab.querySelector('.arrow-icon');
    
    if (instructionsTab && instructionsContent && arrowIcon) {
        // Set default state: collapsed, arrow pointing down
        instructionsContent.classList.add('collapsed');
        instructionsTab.classList.add('collapsed');
        arrowIcon.classList.remove('fa-chevron-up');
        arrowIcon.classList.add('fa-chevron-down');
        
        instructionsTab.addEventListener('click', () => {
            instructionsContent.classList.toggle('collapsed');
            instructionsTab.classList.toggle('collapsed');
            
            // Toggle arrow direction based on collapsed state
            if (instructionsContent.classList.contains('collapsed')) {
                // Collapsed: arrow points down
                arrowIcon.classList.remove('fa-chevron-up');
                arrowIcon.classList.add('fa-chevron-down');
            } else {
                // Expanded: arrow points up
                arrowIcon.classList.remove('fa-chevron-down');
                arrowIcon.classList.add('fa-chevron-up');
            }
        });
    }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', initializeApp);

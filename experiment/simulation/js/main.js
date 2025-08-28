// Google Analytics
(function (i, s, o, g, r, a, m) {
  i["GoogleAnalyticsObject"] = r;
  (i[r] =
    i[r] ||
    function () {
      (i[r].q = i[r].q || []).push(arguments);
    }),
    (i[r].l = 1 * new Date());
  (a = s.createElement(o)), (m = s.getElementsByTagName(o)[0]);
  a.async = 1;
  a.src = g;
  m.parentNode.insertBefore(a, m);
})(window, document, "script", "//www.google-analytics.com/analytics.js", "ga");
ga("create", "UA-67558473-1", "auto");
ga("send", "pageview");

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
      console.log("Loading data files...");

      // Load options (root words)
      const optionsResponse = await fetch("Exp3/options.txt");
      if (!optionsResponse.ok) {
        throw new Error(
          `Failed to load options.txt: ${optionsResponse.status}`
        );
      }
      const optionsText = await optionsResponse.text();
      console.log(
        "Options text loaded, first 200 chars:",
        optionsText.substring(0, 200)
      );
      console.log("Options text total length:", optionsText.length);
      this.parseOptions(optionsText);
      console.log("After parseOptions - rootWords size:", this.rootWords.size);
      console.log("Root words map:", Array.from(this.rootWords.entries()));

      // Load paradigm data
      const paradigmResponse = await fetch("Exp3/paradigm.txt");
      if (!paradigmResponse.ok) {
        throw new Error(
          `Failed to load paradigm.txt: ${paradigmResponse.status}`
        );
      }
      const paradigmText = await paradigmResponse.text();
      console.log(
        "Paradigm text loaded, first 200 chars:",
        paradigmText.substring(0, 200)
      );
      console.log("Paradigm text total length:", paradigmText.length);
      this.parseParadigm(paradigmText);
      console.log(
        "After parseParadigm - paradigmData size:",
        this.paradigmData.size
      );
      console.log(
        "Paradigm data map:",
        Array.from(this.paradigmData.entries())
      );

      // Load answer options
      const answersResponse = await fetch("Exp3/answers_opt.txt");
      if (!answersResponse.ok) {
        throw new Error(
          `Failed to load answers_opt.txt: ${answersResponse.status}`
        );
      }
      const answersText = await answersResponse.text();
      console.log(
        "Answers text loaded, first 200 chars:",
        answersText.substring(0, 200)
      );
      console.log("Answers text total length:", answersText.length);
      this.parseAnswerOptions(answersText);

      this.isInitialized = true;
      console.log("Data loaded successfully");
      console.log("Final root words:", Array.from(this.rootWords.entries()));
      console.log(
        "Final paradigm data:",
        Array.from(this.paradigmData.entries())
      );
      console.log("Final answer options:", this.answerOptions);
      return true;
    } catch (error) {
      console.error("Error loading data:", error);
      return false;
    }
  }

  // Parse options.txt file
  parseOptions(text) {
    const lines = text.trim().split("\n");
    console.log("Parsing options:", lines);
    console.log("Total lines to parse:", lines.length);

    lines.forEach((line, index) => {
      const parts = line.trim().split(/\s+/);
      console.log(
        `Line ${index + 1}: "${line.trim()}" -> parts: [${parts.join(", ")}]`
      );

      if (parts.length >= 2) {
        const prefixNumber = parts[0]; // This is the prefix number (1, 2, 3, 4)
        const word = parts[1];
        this.rootWords.set(word, prefixNumber);
        console.log(
          `Added root word: ${word} -> prefix number ${prefixNumber}`
        );
      } else {
        console.warn(
          `Line ${index + 1} has insufficient parts (${parts.length}):`,
          parts
        );
      }
    });

    console.log(
      "parseOptions completed. Total root words:",
      this.rootWords.size
    );
  }

  // Parse paradigm.txt file
  parseParadigm(text) {
    const lines = text.trim().split("\n");
    console.log("Parsing paradigm lines:", lines.length);
    console.log("First few lines:", lines.slice(0, 3));

    lines.forEach((line, lineIndex) => {
      const parts = line.trim().split(/\s+/);
      console.log(
        `Line ${lineIndex + 1}: "${line.trim()}" -> ${
          parts.length
        } parts: [${parts.join(", ")}]`
      );

      if (parts.length >= 10) {
        const prefixNumber = parts[0]; // This is the prefix number (1, 2, 3, 4)
        const rootWord = parts[1];
        const transformations = parts.slice(2, 10).map((t) => t.trim());

        console.log(
          `Processing line ${
            lineIndex + 1
          }: Prefix=${prefixNumber}, Root=${rootWord}, Transformations=[${transformations.join(
            ", "
          )}]`
        );

        this.paradigmData.set(prefixNumber, {
          root: rootWord,
          transformations: transformations,
        });
        console.log(
          `Added paradigm for prefix ${prefixNumber}: root="${rootWord}", transformations=`,
          transformations
        );
      } else {
        console.warn(
          `Line ${lineIndex + 1} has insufficient parts (${parts.length}):`,
          parts
        );
      }
    });

    console.log(
      "parseParadigm completed. Total paradigms:",
      this.paradigmData.size
    );
    console.log(
      "Sample paradigm data:",
      Array.from(this.paradigmData.entries()).slice(0, 2)
    );
  }

  // Parse answers_opt.txt file
  parseAnswerOptions(text) {
    // Split by newlines and filter out empty lines, trim each option
    this.answerOptions = text
      .trim()
      .split("\n")
      .map((opt) => opt.trim())
      .filter((opt) => opt.length > 0);
    console.log("Answer options parsed:", this.answerOptions.length, "options");
    console.log("First 10 options:", this.answerOptions.slice(0, 10));
  }

  // Get root words for dropdown
  getRootWords() {
    return Array.from(this.rootWords.keys());
  }

  // Get paradigm for selected root
  getParadigm(rootWord) {
    const prefixNumber = this.rootWords.get(rootWord);
    console.log(
      `Getting paradigm for ${rootWord}: prefix number ${prefixNumber}`
    );
    console.log("Available root words:", Array.from(this.rootWords.keys()));
    console.log(
      "Available paradigm prefixes:",
      Array.from(this.paradigmData.keys())
    );

    if (prefixNumber) {
      const paradigm = this.paradigmData.get(prefixNumber);
      console.log("Found paradigm:", paradigm);
      if (!paradigm) {
        console.error(
          `Paradigm for prefix ${prefixNumber} not found in paradigmData`
        );
        console.log(
          "Available paradigms:",
          Array.from(this.paradigmData.entries())
        );
      }
      return paradigm;
    } else {
      console.error(`Root word ${rootWord} not found in rootWords`);
      console.log("Available root words:", Array.from(this.rootWords.keys()));
    }
    return null;
  }

  // Generate word forms table
  generateWordFormsTable(rootWord) {
    console.log(`generateWordFormsTable called with rootWord: ${rootWord}`);
    const paradigm = this.getParadigm(rootWord);
    console.log("Retrieved paradigm:", paradigm);

    if (!paradigm) {
      console.error("No paradigm found for rootWord:", rootWord);
      return null;
    }

    const transformations = paradigm.transformations;
    console.log("Transformations from paradigm:", transformations);
    console.log("Transformations length:", transformations.length);

    const forms = [
      { number: "singular", case: "direct", index: 0 },
      { number: "singular", case: "oblique", index: 1 },
      { number: "plural", case: "direct", index: 2 },
      { number: "plural", case: "oblique", index: 3 },
    ];

    const result = forms.map((form) => {
      const deleteIndex = form.index * 2;
      const addIndex = form.index * 2 + 1;
      const deleteOp = transformations[deleteIndex] || "";
      const addOp = transformations[addIndex] || "";

      console.log(
        `Form ${form.index}: ${form.number} ${form.case} -> delete: "${deleteOp}", add: "${addOp}"`
      );

      return {
        deleteOp: deleteOp,
        addOp: addOp,
        number: form.number,
        case: form.case,
      };
    });

    console.log("Generated result:", result);
    return result;
  }

  // Apply delete + add to form the target word
  applyDeleteAdd(root, delSuffix, addSuffix) {
    console.log(
      `Generating word form: root="${root}", delete="${delSuffix}", add="${addSuffix}"`
    );

    let result = root;

    // Handle delete operation
    if (delSuffix && delSuffix !== "") {
      if (root.endsWith(delSuffix)) {
        result = root.slice(0, root.length - delSuffix.length);
        console.log(`Deleted suffix "${delSuffix}": "${root}" -> "${result}"`);
      } else {
        console.log(
          `Delete suffix "${delSuffix}" not found at end of "${root}". Keeping root unchanged.`
        );
        result = root;
      }
    }

    // Handle add operation
    if (addSuffix && addSuffix !== "") {
      result = result + addSuffix;
      console.log(`Added suffix "${addSuffix}": "${result}" -> "${result}"`);
    }

    console.log(`Final result: "${root}" -> "${result}"`);
    return result;
  }

  // Get correct answers for current paradigm
  getCorrectAnswers(rootWord) {
    const paradigm = this.getParadigm(rootWord);
    if (!paradigm) return [];

    const { transformations } = paradigm;
    const answers = [];

    // The new format has 8 transformations: [del_sing_dr, add_sing_dr, del_sing_ob, add_sing_ob, del_plu_dr, add_plu_dr, del_plu_ob, add_plu_ob]
    // This maps directly to the 8 UI fields

    answers.push(transformations[0], transformations[1]); // Singular Direct: delete, add
    answers.push(transformations[2], transformations[3]); // Singular Oblique: delete, add
    answers.push(transformations[4], transformations[5]); // Plural Direct: delete, add
    answers.push(transformations[6], transformations[7]); // Plural Oblique: delete, add

    return answers;
  }

  // Calculate what needs to be deleted and added to transform root into target
  calculateTransformation(root, target) {
    console.log(`Calculating transformation: "${root}" -> "${target}"`);

    // If root and target are the same, show the transformation operations
    if (root === target) {
      // For words that end with a suffix (like लड़की ends with ई), show remove and add that suffix
      // For words without a suffix (like पुस्तक), show empty operations
      if (root.length > 3) {
        // Assuming most Hindi words are at least 3 characters
        // Check if the word ends with common Hindi suffixes
        const commonSuffixes = ["ी", "ा", "े", "ो", "ं", "ाँ", "ें", "ों"];
        for (const suffix of commonSuffixes) {
          if (root.endsWith(suffix)) {
            return { deleteOp: suffix, addOp: suffix };
          }
        }
      }
      return { deleteOp: "", addOp: "" };
    }

    // Find the longest common prefix between root and target
    let commonPrefix = "";
    let minLength = Math.min(root.length, target.length);

    for (let i = 0; i < minLength; i++) {
      if (root[i] === target[i]) {
        commonPrefix += root[i];
      } else {
        break;
      }
    }

    // Calculate what to delete from root (everything after the common prefix)
    let deleteOp = "";
    if (commonPrefix.length < root.length) {
      deleteOp = root.substring(commonPrefix.length);
    }

    // Calculate what to add after the common prefix
    let addOp = "";
    if (commonPrefix.length < target.length) {
      addOp = target.substring(commonPrefix.length);
    }

    console.log(
      `Transformation: root="${root}", target="${target}", commonPrefix="${commonPrefix}", delete="${deleteOp}", add="${addOp}"`
    );
    return { deleteOp, addOp };
  }

  // Check user answers
  checkAnswers(userAnswers) {
    const results = [];
    const correct = this.correctAnswers;

    console.log("Checking answers:", userAnswers);
    console.log("Correct answers:", correct);

    for (let i = 0; i < 8; i++) {
      const isCorrect = userAnswers[i] === correct[i];
      results.push(isCorrect);
      console.log(
        `Answer ${i}: ${userAnswers[i]} vs ${correct[i]} = ${isCorrect}`
      );
    }

    return results;
  }

  // Helper function to check if an answer is correct
  isAnswerCorrect(userAnswer, correctAnswer) {
    // If user hasn't selected anything, it's always incorrect
    if (userAnswer === "" || userAnswer === "Select...") {
      return false;
    }

    if (userAnswer === correctAnswer) {
      return true;
    }

    return false;
  }

  // Validate paradigm data for consistency
  validateParadigmData() {
    console.log("Validating paradigm data...");
    for (const [paradigmId, paradigm] of this.paradigmData.entries()) {
      const transformations = paradigm.transformations;
      const root = paradigm.root;

      // Basic sanity checks
      if (!Array.isArray(transformations) || transformations.length !== 8) {
        console.warn(
          `WARNING: Paradigm ${paradigmId} has malformed transformations.`
        );
        continue;
      }

      // Ensure tokens are non-empty strings
      transformations.forEach((transformation) => {
        if (typeof transformation !== "string") {
          console.warn(
            `WARNING: Paradigm ${paradigmId} contains a non-string transformation.`
          );
        }
      });

      // Log useful info
      console.log(
        `Paradigm ${paradigmId}: root="${root}", transformations=${JSON.stringify(
          transformations
        )}`
      );
    }
    console.log("Paradigm data validation complete.");
  }
}

// DOM Elements
const rootSelection = document.getElementById("rootSelection");
const addDeleteSection = document.getElementById("addDeleteSection");
const addDeleteTableBody = document.getElementById("addDeleteTableBody");
const submitButton = document.getElementById("submitButton");
const getAnswerButton = document.getElementById("getAnswerButton");
const resetButton = document.getElementById("resetButton");
const feedback = document.getElementById("feedback");
const correctAnswer = document.getElementById("correctAnswer");
const checkHeader = document.getElementById("checkHeader");

// Initialize the application when DOM is loaded
function initializeApp() {
  console.log("Initializing application...");

  // Initialize the morphology analyzer
  window.morphologyAnalyzer = new MorphologyAnalyzer();

  // Load data
  morphologyAnalyzer
    .loadData()
    .then((success) => {
      if (success) {
        console.log("Application initialized successfully");
        // Populate the root word dropdown
        populateRootWordsDropdown();
        // Setup event listeners
        setupEventListeners();
        // Setup instructions panel
        setupInstructionsPanel();
      } else {
        console.error("Failed to initialize application");
        showFeedback("Failed to load data. Please refresh the page.", "error");
      }
    })
    .catch((error) => {
      console.error("Error during initialization:", error);
      showFeedback(
        "Error initializing application. Please refresh the page.",
        "error"
      );
    });
}

// Populate root words dropdown
function populateRootWordsDropdown() {
  const rootWords = morphologyAnalyzer.getRootWords();
  console.log("Populating dropdown with root words:", rootWords);

  // Clear existing options
  rootSelection.innerHTML = '<option value="">Select a root word...</option>';

  // Add root words
  rootWords.forEach((word) => {
    const option = document.createElement("option");
    option.value = word;
    option.textContent = word;
    rootSelection.appendChild(option);
  });

  console.log("Dropdown populated with", rootWords.length, "words");
}

// Handle root word selection
function handleRootSelection() {
  const selectedRoot = rootSelection.value;
  console.log("Root selected:", selectedRoot);

  if (!selectedRoot) {
    hideAddDeleteSection();
    return;
  }

  console.log(
    "Current root words map:",
    Array.from(morphologyAnalyzer.rootWords.entries())
  );
  console.log(
    "Current paradigm data map:",
    Array.from(morphologyAnalyzer.paradigmData.entries())
  );

  morphologyAnalyzer.currentRoot = selectedRoot;
  morphologyAnalyzer.currentParadigm =
    morphologyAnalyzer.getParadigm(selectedRoot);
  morphologyAnalyzer.correctAnswers =
    morphologyAnalyzer.getCorrectAnswers(selectedRoot);

  console.log("Current paradigm:", morphologyAnalyzer.currentParadigm);
  console.log("Correct answers:", morphologyAnalyzer.correctAnswers);

  if (!morphologyAnalyzer.currentParadigm) {
    console.error("No paradigm found for word:", selectedRoot);
    showFeedback("Error: No paradigm data found for this word.", "error");
    return;
  }

  showAddDeleteTable();
  clearFeedback();
  clearResults();
}

// Show add-delete table
function showAddDeleteTable() {
  const categories = [
    {
      number: "sing",
      case: "dr",
      label: "Singular Direct",
      fullNumber: "Singular",
      fullCase: "Direct",
    },
    {
      number: "sing",
      case: "ob",
      label: "Singular Oblique",
      fullNumber: "Singular",
      fullCase: "Oblique",
    },
    {
      number: "plu",
      case: "dr",
      label: "Plural Direct",
      fullNumber: "Plural",
      fullCase: "Direct",
    },
    {
      number: "plu",
      case: "ob",
      label: "Plural Oblique",
      fullNumber: "Plural",
      fullCase: "Oblique",
    },
  ];

  console.log(
    "Creating add-delete table with options:",
    morphologyAnalyzer.answerOptions
  );

  // Set the header text to "Results"
  if (checkHeader) {
    checkHeader.innerHTML = "<b>Results</b>";
  }

  let tableHTML = "";
  categories.forEach((cat, index) => {
    tableHTML += `
            <tr>
                <td>
                    <select id="del${cat.number}${cat.case}" class="select-box">
                        <option value="">Select...</option>
                        ${morphologyAnalyzer.answerOptions
                          .map(
                            (opt) => `<option value="${opt}">${opt}</option>`
                          )
                          .join("")}
                    </select>
                </td>
                <td>
                    <select id="add${cat.number}${cat.case}" class="select-box">
                        <option value="">Select...</option>
                        ${morphologyAnalyzer.answerOptions
                          .map(
                            (opt) => `<option value="${opt}">${opt}</option>`
                          )
                          .join("")}
                    </select>
                </td>
                <td>${cat.fullNumber}</td>
                <td>${cat.fullCase}</td>
                <td id="check${index}" class="check-cell">-</td>
            </tr>
        `;
  });

  addDeleteTableBody.innerHTML = tableHTML;
  addDeleteSection.style.display = "block";
  submitButton.disabled = false;

  // Clear all dropdowns to default empty state
  const allSelects = addDeleteTableBody.querySelectorAll("select");
  allSelects.forEach((select) => {
    select.selectedIndex = 0;
  });

  // Add event listeners for real-time color updates
  setupDropdownEventListeners();
}

// Setup event listeners for dropdowns to update colors in real-time
function setupDropdownEventListeners() {
  const deleteSelects = [
    document.getElementById("delsingdr"),
    document.getElementById("delsingob"),
    document.getElementById("delpludr"),
    document.getElementById("delpluob"),
  ];

  const addSelects = [
    document.getElementById("addsingdr"),
    document.getElementById("addsingob"),
    document.getElementById("addpludr"),
    document.getElementById("addpluob"),
  ];

  // Add change event listeners to all dropdowns with validation
  [...deleteSelects, ...addSelects].forEach((select, index) => {
    if (select) {
      select.addEventListener("change", () => {
        // Validate to prevent redundant operations
      });
    }
  });
}

// Validate dropdown selections to prevent redundant operations

// Show warning for redundant operations

// Update individual dropdown color based on current selection
function updateDropdownColor(select, index) {
  if (!morphologyAnalyzer.correctAnswers.length) return;

  const userValue = select.value;
  const correctValue = morphologyAnalyzer.correctAnswers[index];
  const isCorrect = userValue === correctValue;

  // Remove existing classes
  select.classList.remove("correct", "incorrect");

  // Reset inline styles
  select.style.backgroundColor = "";
  select.style.borderColor = "";

  if (userValue === "") {
    // No selection - neutral state
    return;
  }

  if (isCorrect) {
    // Correct answer - green
    select.classList.add("correct");
    select.style.backgroundColor = "#e8f5e9";
    select.style.borderColor = "#4CAF50";
  } else {
    // Wrong answer - red
    select.classList.add("incorrect");
    select.style.backgroundColor = "#ffebee";
    select.style.borderColor = "#f44336";
  }
}

// Handle form submission
function handleSubmit() {
  console.log("Submit button clicked");

  if (!morphologyAnalyzer.currentRoot) {
    console.log("No root selected");
    return;
  }

  // Collect user answers in Add-Delete format
  // Format: [del_sing_dr, add_sing_dr, del_sing_ob, add_sing_ob, del_plu_dr, add_plu_dr, del_plu_ob, add_plu_ob]
  const userAnswers = [
    document.getElementById("delsingdr").value, // Delete singular direct
    document.getElementById("addsingdr").value, // Add singular direct
    document.getElementById("delsingob").value, // Delete singular oblique
    document.getElementById("addsingob").value, // Add singular oblique
    document.getElementById("delpludr").value, // Delete plural direct
    document.getElementById("addpludr").value, // Add plural direct
    document.getElementById("delpluob").value, // Delete plural oblique
    document.getElementById("addpluob").value, // Add plural oblique
  ];

  console.log("User answers collected:", userAnswers);

  // Check if all fields are filled
  const emptyFields = userAnswers.filter(
    (answer) => answer === "" || answer === "Select..."
  );
  if (emptyFields.length > 0) {
    showFeedback(
      "❌ Please fill in all fields before submitting. You have " +
        emptyFields.length +
        " unanswered questions.",
      "error"
    );
    return;
  }

  morphologyAnalyzer.userAnswers = userAnswers;
  const results = morphologyAnalyzer.checkAnswers(userAnswers);

  console.log("Check results:", results);

  // Update UI with results
  updateCheckResults(results);

  // Show feedback
  const allCorrect = results.every((result) => result);
  if (allCorrect) {
    showFeedback("✅ Correct! All transformations are correct.", "success");
    getAnswerButton.style.display = "none";
  } else {
    showFeedback(
      '❌ Some transformations are incorrect. Review your answers or use "Get Answer" to see the correct transformations.',
      "error"
    );
    getAnswerButton.style.display = "inline-flex";
    getAnswerButton.disabled = false;
  }

  // Update header to show "Results" clearly
  if (checkHeader) {
    checkHeader.innerHTML = "<b>Results</b>";
  }
}

// Check if user answers contain redundant operations

// Update check results in the table
function updateCheckResults(results) {
  // Get all select elements
  const deleteSelects = [
    document.getElementById("delsingdr"),
    document.getElementById("delsingob"),
    document.getElementById("delpludr"),
    document.getElementById("delpluob"),
  ];

  const addSelects = [
    document.getElementById("addsingdr"),
    document.getElementById("addsingob"),
    document.getElementById("addpludr"),
    document.getElementById("addpluob"),
  ];

  // Update visual feedback for dropdowns - only after submit
  for (let i = 0; i < 4; i++) {
    const checkCell = document.getElementById(`check${i}`);
    const deleteCorrect = results[i * 2]; // Delete answer (even indices: 0, 2, 4, 6)
    const addCorrect = results[i * 2 + 1]; // Add answer (odd indices: 1, 3, 5, 7)

    // Update dropdown styles - highlight wrong answers after submit
    if (deleteSelects[i]) {
      const userValue = deleteSelects[i].value;
      const correctValue = morphologyAnalyzer.correctAnswers[i * 2];
      const isCorrect = morphologyAnalyzer.isAnswerCorrect(
        userValue,
        correctValue
      );

      // Remove existing classes
      deleteSelects[i].classList.remove("correct", "incorrect");
      deleteSelects[i].style.backgroundColor = "";
      deleteSelects[i].style.borderColor = "";

      // Always show styling for answered questions
      if (userValue !== "" && userValue !== "Select...") {
        if (isCorrect) {
          deleteSelects[i].classList.add("correct");
          deleteSelects[i].style.backgroundColor = "#e8f5e9";
          deleteSelects[i].style.borderColor = "#4CAF50";
        } else {
          deleteSelects[i].classList.add("incorrect");
          deleteSelects[i].style.backgroundColor = "#ffebee";
          deleteSelects[i].style.borderColor = "#f44336";
        }
      } else {
        // No selection made - mark as incorrect
        deleteSelects[i].classList.add("incorrect");
        deleteSelects[i].style.backgroundColor = "#ffebee";
        deleteSelects[i].style.borderColor = "#f44336";
      }
    }

    if (addSelects[i]) {
      const userValue = addSelects[i].value;
      const correctValue = morphologyAnalyzer.correctAnswers[i * 2 + 1];
      const isCorrect = morphologyAnalyzer.isAnswerCorrect(
        userValue,
        correctValue
      );

      // Remove existing classes
      addSelects[i].classList.remove("correct", "incorrect");
      addSelects[i].style.backgroundColor = "";
      addSelects[i].style.borderColor = "";

      // Always show styling for answered questions
      if (userValue !== "" && userValue !== "Select...") {
        if (isCorrect) {
          addSelects[i].classList.add("correct");
          addSelects[i].style.backgroundColor = "#e8f5e9";
          addSelects[i].style.borderColor = "#4CAF50";
        } else {
          addSelects[i].classList.add("incorrect");
          addSelects[i].style.backgroundColor = "#ffebee";
          addSelects[i].style.borderColor = "#f44336";
        }
      } else {
        // No selection made - mark as incorrect
        addSelects[i].classList.add("incorrect");
        addSelects[i].style.backgroundColor = "#ffebee";
        addSelects[i].style.borderColor = "#f44336";
      }
    }

    // Update check cell - both delete and add must be correct
    if (deleteCorrect && addCorrect) {
      checkCell.innerHTML =
        '<i class="fas fa-check-circle" style="color: #4CAF50; font-size: 1.2em;"></i>';
      console.log(
        `Row ${i}: Both delete and add correct - showing green checkmark`
      );
    } else {
      checkCell.innerHTML =
        '<i class="fas fa-times-circle" style="color: #F44336; font-size: 1.2em;"></i>';
      console.log(
        `Row ${i}: Delete correct: ${deleteCorrect}, Add correct: ${addCorrect} - showing red X`
      );
    }
  }
}

// Show correct answers
function showCorrectAnswers() {
  if (!morphologyAnalyzer.correctAnswers.length) {
    console.log("No correct answers available");
    return;
  }

  console.log("Showing correct answers:", morphologyAnalyzer.correctAnswers);

  // Clear any existing feedback or notifications
  clearFeedback();

  let answerHTML = `
        <h4>Correct Add-Delete Table for "${morphologyAnalyzer.currentRoot}"</h4>
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
    { number: "Singular", case: "Direct", index: 0 },
    { number: "Singular", case: "Oblique", index: 1 },
    { number: "Plural", case: "Direct", index: 2 },
    { number: "Plural", case: "Oblique", index: 3 },
  ];

  categories.forEach((cat, index) => {
    const deleteIndex = index * 2;
    const addIndex = index * 2 + 1;
    answerHTML += `
                <tr>
                    <td>${
                      morphologyAnalyzer.correctAnswers[deleteIndex] || ""
                    }</td>
                    <td>${
                      morphologyAnalyzer.correctAnswers[addIndex] || ""
                    }</td>
                    <td>${cat.number}</td>
                    <td>${cat.case}</td>
                </tr>
            `;
  });

  answerHTML += "</tbody></table>";
  correctAnswer.innerHTML = answerHTML;
  correctAnswer.style.display = "block";
}

// Reset the simulation
function resetSimulation() {
  console.log("Resetting simulation");

  rootSelection.selectedIndex = 0;
  hideAddDeleteSection();
  clearFeedback();
  clearResults();
  morphologyAnalyzer.currentRoot = null;
  morphologyAnalyzer.currentParadigm = null;
  morphologyAnalyzer.correctAnswers = [];
  morphologyAnalyzer.userAnswers = [];
  submitButton.disabled = true;
  getAnswerButton.style.display = "none";

  // Set header to show "Results"
  if (checkHeader) {
    checkHeader.innerHTML = "<b>Results</b>";
  }

  // Clear correct answer display
  correctAnswer.innerHTML = "";
  correctAnswer.style.display = "none";
}

// Utility functions

function hideAddDeleteSection() {
  addDeleteSection.style.display = "none";
}

function clearFeedback() {
  feedback.innerHTML = "";
  feedback.className = "feedback-container";
}

function clearResults() {
  correctAnswer.innerHTML = "";
  correctAnswer.style.display = "none";

  // Reset header to show "Results"
  if (checkHeader) {
    checkHeader.innerHTML = "<b>Results</b>";
  }

  // Clear check marks and show placeholder text
  for (let i = 0; i < 4; i++) {
    const checkCell = document.getElementById(`check${i}`);
    if (checkCell) {
      checkCell.innerHTML = "-";
    }
  }

  // Clear all dropdown selections and reset styling
  const allSelects = addDeleteTableBody.querySelectorAll("select");
  allSelects.forEach((select) => {
    select.selectedIndex = 0;
    select.classList.remove("correct", "incorrect");
    // Reset inline styles
    select.style.backgroundColor = "";
    select.style.borderColor = "";
  });
}

function showFeedback(message, type) {
  feedback.innerHTML = message;
  feedback.className = `feedback-container ${type}`;
}

// Setup event listeners
function setupEventListeners() {
  console.log("Setting up event listeners");

  rootSelection.addEventListener("change", handleRootSelection);
  submitButton.addEventListener("click", handleSubmit);
  getAnswerButton.addEventListener("click", showCorrectAnswers);
  resetButton.addEventListener("click", resetSimulation);
}

// Setup instructions panel
function setupInstructionsPanel() {
  const instructionsTab = document.getElementById("instructionsTab");
  const instructionsContent = document.getElementById("instructionsContent");
  const arrowIcon = instructionsTab.querySelector(".arrow-icon");

  if (instructionsTab && instructionsContent && arrowIcon) {
    // Set default state: collapsed, arrow pointing down
    instructionsContent.classList.add("collapsed");
    instructionsTab.classList.add("collapsed");
    arrowIcon.classList.remove("fa-chevron-up");
    arrowIcon.classList.add("fa-chevron-down");

    instructionsTab.addEventListener("click", () => {
      instructionsContent.classList.toggle("collapsed");
      instructionsTab.classList.toggle("collapsed");

      // Toggle arrow direction based on collapsed state
      if (instructionsContent.classList.contains("collapsed")) {
        // Collapsed: arrow points down
        arrowIcon.classList.remove("fa-chevron-up");
        arrowIcon.classList.add("fa-chevron-down");
      } else {
        // Expanded: arrow points up
        arrowIcon.classList.remove("fa-chevron-down");
        arrowIcon.classList.add("fa-chevron-up");
      }
    });
  }
}

// Initialize the application when DOM is loaded
document.addEventListener("DOMContentLoaded", initializeApp);

function save(filename, data, fileType = "text/html") {
  try {
    const blob = new Blob([data], {
      type: fileType,
    });
    const elem = window.document.createElement("a");

    elem.href = window.URL.createObjectURL(blob);
    elem.download = filename;

    document.body.appendChild(elem);
    elem.click();

    document.body.removeChild(elem);
    window.URL.revokeObjectURL(elem.href);
  } catch (error) {
    throw error;
  }
}

async function copy(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (err) {
    return false;
  }
}

// errorMessage should/needs to be defined already when importing this lib
function showError(message) {
  if (typeof errorMessage !== 'undefined') {
    errorMessage.textContent = message;
    errorMessage.classList.remove("hidden");
  } else {
    console.error("Error: " + message);
  }
}

function hideError() {
  if (typeof errorMessage !== 'undefined') {
    errorMessage.classList.add("hidden");
  }
}

function validateNumber(value) {
  const num = Number(value);
  if (isNaN(num) || num <= 0) {
    throw new Error(`Input must be a (positive) number.`);
  }
  return num;
}

function createImageUploader(container, onFileSelected) {
  container.innerHTML = `
        <input type="file" accept="image/*" style="display: none;" class="image-input" />
        <label class="drop-zone">
            <div class="preview-box">
                <p class="upload-text">Click to select an image</p>
            </div>
        </label>
    `;

  let isCleared = false;

  const input = container.querySelector(".image-input");
  const dropZone = container.querySelector(".drop-zone");
  const previewBox = container.querySelector(".preview-box");
  const uploadText = container.querySelector(".upload-text");

  const handleFile = (file) => {
    if (file && file.type.startsWith("image/")) {
      isCleared = false;
      const imageURL = URL.createObjectURL(file);
      previewBox.style.backgroundImage = `url('${imageURL}')`;
      uploadText.style.display = "none";
      if (onFileSelected) onFileSelected(file);
    }
  };

  previewBox.addEventListener("click", () => {
    input.click();
  });

  input.addEventListener("cancel", () => {
    isCleared = true;
    input.value = ""; // Clear the input value if the user cancels the file selection
    previewBox.style.backgroundImage = "";
    uploadText.style.display = "block";
  });

  input.addEventListener("change", (e) => {
    handleFile(e.target.files[0]);
  });

  dropZone.addEventListener("dragover", (e) => {
    e.preventDefault();
    dropZone.classList.add("drag-over");
  });

  dropZone.addEventListener("dragleave", () => {
    dropZone.classList.remove("drag-over");
  });

  dropZone.addEventListener("drop", (e) => {
    e.preventDefault();
    dropZone.classList.remove("drag-over");
    handleFile(e.dataTransfer.files[0]);
  });

  return {
    input,
    previewBox,
    uploadText,
    getFile: () => input.files[0],
    getIsCleared: () => isCleared,
    resetCleared: () => {
      isCleared = false;
    },
  };
}

const fileToBase64 = async (file) => {
  if (!file) return null;

  const arrayBuffer = await file.arrayBuffer();
  const bytes = new Uint8Array(arrayBuffer);
  let binary = "";
  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });
  return `data:${file.type};base64,${btoa(binary)}`;
};

function createSetTemplate(type = "quiz") {
  return {
    name: "Untitled Quiz",
    description: "No description provided.",
    image: false,
    questions: [],
    type: type,
  };
}

function createDevQuiz() {
  return {
    name: "DEV QUIZ",
    description:
      "For testing purposes only. This quiz contains all question types and variants (images, no images).",
    image: false,
    type: "quiz",
    questions: [
      {
        id: crypto.randomUUID(),
        text: "What is the capital of France?",
        type: "multiple-choice",
        options: [
          {
            text: "London",
            correct: false,
            image:
              "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?q=80&w=1470&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
          },
          {
            text: "Berlin",
            correct: false,
            image:
              "https://images.unsplash.com/photo-1599946347371-68eb71b16afc?q=80&w=1470&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
          },
          {
            text: "Paris",
            correct: true,
            image:
              "https://images.unsplash.com/photo-1550340499-a6c60fc8287c?q=80&w=1470&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
          },
          {
            text: "Madrid",
            correct: false,
            image:
              "https://images.unsplash.com/photo-1543783207-ec64e4d95325?q=80&w=1470&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
          },
        ],
        expectedAnswer: "Paris",
        image: null,
      },
      {
        id: crypto.randomUUID(),
        text: "Which of these are primary colors? (Select all that apply)",
        type: "multiple-response",
        options: [
          { text: "Red", correct: true },
          { text: "Green", correct: false },
          { text: "Blue", correct: true },
          { text: "Yellow", correct: false },
        ],
        expectedAnswer: "Red, Blue",
        image: null,
      },
      {
        id: crypto.randomUUID(),
        text: "The Earth is flat.",
        type: "true-false",
        options: [
          { text: "True", correct: false },
          { text: "False", correct: true },
        ],
        expectedAnswer: "False",
        image: null,
      },
      {
        id: crypto.randomUUID(),
        text: "What is the square root of 64?",
        type: "short-answer",
        options: [],
        expectedAnswer: "8",
        image: null,
      },
      {
        id: crypto.randomUUID(),
        text: "Describe the process of photosynthesis in detail.",
        type: "long-answer",
        options: [],
        expectedAnswer:
          "The process by which green plants and some other organisms use sunlight to synthesize foods with the help of chlorophyll pigments.",
        image: null,
      },
      {
        id: crypto.randomUUID(),
        text: "Which planet is known as the Red Planet? (Image variant)",
        type: "multiple-choice",
        options: [
          { text: "Venus", correct: false },
          { text: "Mars", correct: true },
          { text: "Jupiter", correct: false },
          { text: "Saturn", correct: false },
        ],
        expectedAnswer: "Mars",
        image:
          "https://images.unsplash.com/photo-1701014159024-f9781490a228?q=80&w=1528&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
      },
    ],
  };
}

function initState(returnOnly = false) {
  const initialState = {
    sets: {
      i0: {
        name: "Untitled Quiz",
        description: "No description provided.",
        image: false,
        questions: [],
        type: "quiz",
        oneWay: false,
      },
    },
    userPrefs: {
      theme: "dark",
      language: "en",
    },
    activeSetResponses: {
      questions: {},
    },
    activeSetSubmissions: {},
    currentSet: "i0",
    currentIndex: -1,
  };

  if (returnOnly) {
    return initialState;
  }

  localforage.setItem("appState", initialState).then(function () {
    console.log("Initial state created:", initialState);
  });
}

function pluralHelper(count, thing) {
  return count === 1 ? `1 ${thing}` : `${count} ${thing}s`;
}

function loadTheme(prefs = "light") {
  const themeToggle = document.getElementById("theme");
  if (themeToggle) {
    themeToggle.checked = (prefs !== "light");
  }
  console.log("loaded", prefs);
}

const capitalize = (str) => str.charAt(0).toUpperCase() + str.slice(1);

/**
 * STATE MANAGEMENT SYSTEM
 * Intercepts updates to state, handles local persistence, 
 * and tracks dirty changes for server syncing.
 */

async function getState() {
    const state = await localforage.getItem("appState");
    return state || initState(true);
}

async function saveFullState(state) {
    await localforage.setItem("appState", state);
}

/**
 * Updates a value in the state object using a dot-notation path.
 * @param {string} path - e.g., "userPrefs.theme" or "sets.i0.name"
 * @param {any} value - The new value
 */
async function updateState(path, value) {
    const state = await getState();
    const keys = path.split('.');
    let current = state;

    for (let i = 0; i < keys.length - 1; i++) {
        const key = keys[i];
        if (!current[key]) current[key] = {};
        current = current[key];
    }

    const lastKey = keys[keys.length - 1];
    const oldValue = current[lastKey];
    current[lastKey] = value;

    // Only mark dirty and save if value actually changed
    if (JSON.stringify(oldValue) !== JSON.stringify(value)) {
        await saveFullState(state);
        await queueChange(path, value);
    }
    
    return state;
}

/**
 * Tracks changes that need to be synced to the server.
 */
async function queueChange(path, value) {
    const queue = await localforage.getItem("syncQueue") || [];
    
    // Remove any existing pending changes for this same path to avoid redundant updates
    const filteredQueue = queue.filter(item => item.path !== path);
    
    filteredQueue.push({
        id: crypto.randomUUID(),
        path: path,
        value: value,
        timestamp: Date.now(),
        synced: false
    });
    
    await localforage.setItem("syncQueue", filteredQueue);
}

/**
 * Returns all items that are currently 'dirty' (not synced).
 */
async function getDirtyItems() {
    const queue = await localforage.getItem("syncQueue") || [];
    return queue.filter(item => !item.synced);
}

/**
 * Marks a specific change as synced.
 */
async function markAsSynced(changeId) {
    const queue = await localforage.getItem("syncQueue") || [];
    const updatedQueue = queue.map(item => {
        if (item.id === changeId) return { ...item, synced: true };
        return item;
    });
    await localforage.setItem("syncQueue", updatedQueue);
}

/**
 * Placeholder for server sync logic.
 * When implemented, this will iterate through dirty items and push to API.
 */
async function syncWithServer() {
    if (!navigator.onLine) {
        console.log("Offline: Sync postponed.");
        return;
    }

    const dirty = await getDirtyItems();
    if (dirty.length === 0) return;

    console.log(`Syncing ${dirty.length} changes to server...`);
    
    // Default behavior for now: just mark them as synced since server is not ready
    for (const change of dirty) {
        // await api.patch(change.path, change.value);
        await markAsSynced(change.id);
    }
    console.log("Sync complete.");
}

// Listen for online event to trigger sync
window.addEventListener('online', syncWithServer);

import {
  loadTheme,
  createImageUploader,
  fileToBase64,
  createSetTemplate,
  initState,
  getState,
  saveFullState,
  updateState,
  generateNavbar,
} from "./lib.js";

document.addEventListener("DOMContentLoaded", async () => {
  const nav = generateNavbar();
  document.body.prepend(nav);

  // STATE
  let state = await getState();

  async function saveState() {
    await saveFullState(state);
    renderSetInfo();
  }

  // DOM ELEMENTS
  const questionListEl = document.querySelector(".question-list");
  const noQuestionEl = document.createElement("small");
  noQuestionEl.textContent = "No question yet.";
  questionListEl.appendChild(noQuestionEl);

  const addQuestionBtn = document.getElementById("add-question-btn");
  const questionTextEl = document.getElementById("questionText");
  const typeSelectEl = document.getElementById("type");
  const feedbackSelectEl = document.getElementById("feedback");
  const requiredCheckEl = document.getElementById("required");
  const changeableCheckEl = document.getElementById("changeable");
  const answerOptionsEl = document.querySelector(".answer-options");
  const addOptionBtn = document.getElementById("add-option-btn");
  const saveQuestionBtn = document.getElementById("save-question-btn");
  const previewQuizBtn = document.getElementById("preview-set");
  const editQuizBtn = document.getElementById("edit-set");
  const editQuizDialog = document.getElementById("edit-set-dialog");
  const questionUploader = createImageUploader(document.getElementById("question-uploader"));
  const quizInfoUploader = createImageUploader(document.getElementById("quiz-info-uploader"));
  const quizTitleInput = document.getElementById("quiz-title");
  const quizDescInput = document.getElementById("quiz-desc");
  const quizDescChars = document.getElementById("char-count");
  const quizTypeSelect = document.getElementById("quiz-type");
  const saveQuizInfoBtn = document.getElementById("save-quiz-info");
  const deleteSetBtn = document.getElementById("delete-set");
  const quizOnlyOptions = document.getElementById("quiz-only-options");
  const oneWayOnly = document.getElementById("one-way-quiz");

  // QUESTION TYPE CONFIG
  const QUESTION_TYPES = {
    "multiple-choice": {
      needsOptions: true,
      singleCorrect: true,
      defaultOptions: () => [
        { text: "", correct: false },
        { text: "", correct: false },
        { text: "", correct: false },
        { text: "", correct: false },
      ],
    },
    "multiple-response": {
      needsOptions: true,
      singleCorrect: false,
      defaultOptions: () => [
        { text: "", correct: false },
        { text: "", correct: false },
        { text: "", correct: false },
        { text: "", correct: false },
      ],
    },
    "true-false": {
      needsOptions: true,
      singleCorrect: true,
      defaultOptions: () => [
        { text: "True", correct: false },
        { text: "False", correct: false },
      ],
    },
    "short-answer": {
      needsOptions: false,
      singleCorrect: false,
      defaultOptions: () => [],
    },
    "long-answer": {
      needsOptions: false,
      singleCorrect: false,
      defaultOptions: () => [],
    },
  };

  function renderOptionsUI(question) {
    answerOptionsEl.innerHTML = "";
    const cfg = QUESTION_TYPES[question.type];

    if (cfg.needsOptions) {
      answerOptionsEl.style.display = "flex";
      addOptionBtn.style.display = "inline-block";

      question.options.forEach((opt, idx) => {
        const row = document.createElement("div");
        row.className = "answer-row";

        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.checked = !!opt.correct;
        checkbox.addEventListener("change", () => {
          opt.correct = checkbox.checked;
        });

        const textInput = document.createElement("input");
        textInput.type = "text";
        textInput.placeholder = "Option text...";
        textInput.value = opt.text || "";
        textInput.addEventListener("input", () => {
          opt.text = textInput.value;
        });

        const removeBtn = document.createElement("button");
        removeBtn.type = "button";
        removeBtn.textContent = "×";
        removeBtn.classList.add("btn");
        removeBtn.addEventListener("click", () => {
          question.options.splice(idx, 1);
          if (!question.options.length && cfg.needsOptions) {
            question.options.push({ text: "", correct: false });
          }
          renderOptionsUI(question);
        });

        const imageContainer = document.createElement("div");
        const uploader = createImageUploader(imageContainer, async (file) => {
          opt.image = await fileToBase64(file);
        });
        if (opt.image) {
          uploader.previewBox.style.backgroundImage = `url('${opt.image}')`;
          uploader.uploadText.style.display = "none";
        }

        row.appendChild(checkbox);
        row.appendChild(imageContainer);
        row.appendChild(textInput);
        row.appendChild(removeBtn);
        answerOptionsEl.appendChild(row);
      });
    } else {
      answerOptionsEl.style.display = "block";
      addOptionBtn.style.display = "none";
      const inputElement =
        question.type === "long-answer"
          ? (() => {
              const ta = document.createElement("textarea");
              ta.rows = 5;
              return ta;
            })()
          : document.createElement("input");
      if (question.type === "short-answer") {
        inputElement.type = "text";
      }
      inputElement.placeholder = "Expected answer (optional)…";
      inputElement.value = question.expectedAnswer || "";
      inputElement.addEventListener("input", () => {
        question.expectedAnswer = inputElement.value;
      });
      answerOptionsEl.appendChild(inputElement);

      const validationDiv = document.createElement("div");
      validationDiv.style.marginTop = "10px";
      validationDiv.innerHTML = "<label>Validation options</label>";

      const vTypeDiv = document.createElement("div");
      const vType = question.validationType || "text";
      vTypeDiv.innerHTML = `
                            <div class="row" style="flex-direction: row; gap: 10px;">
                                <label><input type="radio" name="qValType" value="text" ${vType === "text" ? "checked" : ""}> Text</label>
                                <label><input type="radio" name="qValType" value="number" ${vType === "number" ? "checked" : ""}> Number</label>
                            </div>
                        `;
      vTypeDiv.querySelectorAll("input").forEach((i) =>
        i.addEventListener("change", (e) => {
          question.validationType = e.target.value;
        }),
      );

      const vMode = document.createElement("select");
      const currentMode = question.validationMode || "exact match";
      ["Exact Match", "Lazy Match", "Contains", "Regex"].forEach((t) => {
        const o = document.createElement("option");
        o.value = t.toLowerCase();
        o.text = t;
        if (o.value === currentMode) o.selected = true;
        vMode.appendChild(o);
      });
      vMode.addEventListener("change", (e) => {
        question.validationMode = e.target.value;
      });

      validationDiv.appendChild(vTypeDiv);
      validationDiv.appendChild(vMode);
      answerOptionsEl.appendChild(validationDiv);
    }
  }

  function createQuestion(type = "multiple-choice") {
    const cfg = QUESTION_TYPES[type];
    return {
      id: crypto.randomUUID(),
      text: "",
      type,
      options: cfg.defaultOptions(),
      expectedAnswer: "",
      validationType: "text",
      validationMode: "exact match",
      feedback: "submitted",
      required: false,
      changeable: true,
      image: null,
    };
  }

  function getQuestions() {
    return state.sets[state.currentSet]?.questions || [];
  }

  // RENDERING
  function renderSetInfo() {
    const quiz = state.sets[state.currentSet];
    if (!quiz) return;
    quizTitleInput.value = quiz.name || "";
    quizDescInput.value = quiz.description || "";
    quizTypeSelect.value = quiz.type || "quiz";

    if (quiz.image) {
      quizInfoUploader.previewBox.style.backgroundImage = `url('${quiz.image}')`;
      quizInfoUploader.uploadText.style.display = "none";
    } else {
      quizInfoUploader.previewBox.style.backgroundImage = "";
      quizInfoUploader.uploadText.style.display = "block";
    }
    quizInfoUploader.input.value = "";
    quizInfoUploader.resetCleared();

    oneWayOnly.checked = !quiz.oneWay;
    quizOnlyOptions.style.display = quiz.type === "quiz" ? "block" : "none";
  }

  function renderQuestionList() {
    questionListEl.querySelectorAll(".question-item").forEach((el) => el.remove());

    const questions = getQuestions();
    questions.forEach((q, idx) => {
      const item = document.createElement("div");
      item.className = "question-item";
      item.textContent = `Question ${idx + 1}`;
      item.dataset.id = q.id;

      const remove = document.createElement("button");
      remove.textContent = "Remove";
      remove.classList.add("btn", "remove-question-button");

      remove.addEventListener("click", async (e) => {
        e.stopPropagation();
        const index = questions.findIndex((quest) => quest.id === q.id);
        if (index !== -1) {
          questions.splice(index, 1);
          await saveState();
          renderQuestionList();
          if (state.currentIndex >= questions.length) {
            state.currentIndex = questions.length - 1;
          }
          if (state.currentIndex >= 0) {
            loadQuestion(state.currentIndex);
          } else {
            answerOptionsEl.innerHTML = "";
            questionTextEl.value = "";
          }
        }
      });

      item.append(remove);
      if (idx === state.currentIndex) {
        item.style.backgroundColor = "var(--surface-lighter)";
        item.style.borderColor = "var(--accent)";
      }
      questionListEl.insertBefore(item, noQuestionEl);
    });
    noQuestionEl.style.display = questions.length ? "none" : "block";
  }

  function loadQuestion(index) {
    const questions = getQuestions();
    if (index < 0 || index >= questions.length) return;
    state.currentIndex = index;
    const q = questions[index];
    questionTextEl.value = q.text || "";
    typeSelectEl.value = q.type;
    feedbackSelectEl.value = q.feedback || "submitted";
    requiredCheckEl.checked = !!q.required;
    changeableCheckEl.checked = q.changeable !== false;

    if (q.image) {
      questionUploader.previewBox.style.backgroundImage = `url('${q.image}')`;
      questionUploader.uploadText.style.display = "none";
    } else {
      questionUploader.previewBox.style.backgroundImage = "";
      questionUploader.uploadText.style.display = "block";
    }
    questionUploader.input.value = "";
    questionUploader.resetCleared();

    renderOptionsUI(q);
    renderQuestionList();
  }

  async function saveCurrentQuestion() {
    const questions = getQuestions();
    if (state.currentIndex < 0 || state.currentIndex >= questions.length) return;
    const q = questions[state.currentIndex];

    q.type = typeSelectEl.value;
    q.feedback = feedbackSelectEl.value;
    q.required = requiredCheckEl.checked;
    q.changeable = changeableCheckEl.checked;
    q.text = questionTextEl.value.trim();

    const questionFile = questionUploader.getFile();
    if (questionFile) {
      q.image = await fileToBase64(questionFile);
    } else if (questionUploader.getIsCleared()) {
      q.image = null;
    }
    questionUploader.resetCleared();

    await saveState();
    renderQuestionList();
  }

  // EVENTS
  editQuizBtn.addEventListener("click", () => {
    renderSetInfo();
    editQuizDialog.showModal();
  });

  addQuestionBtn.addEventListener("click", async () => {
    const newQ = createQuestion(typeSelectEl.value);
    const questions = getQuestions();
    questions.push(newQ);
    await saveState();
    loadQuestion(questions.length - 1);
  });

  saveQuestionBtn.addEventListener("click", async () => {
    await saveCurrentQuestion();
    alert("Question saved!");
  });

  questionListEl.addEventListener("click", async (e) => {
    const item = e.target.closest(".question-item");
    if (!item) return;

    await saveCurrentQuestion();
    const id = item.dataset.id;
    const questions = getQuestions();
    const idx = questions.findIndex((q) => q.id === id);
    if (idx !== -1) {
      loadQuestion(idx);
    }
  });

  typeSelectEl.addEventListener("change", () => {
    if (state.currentIndex < 0 || state.currentIndex >= getQuestions().length) return;

    const q = getQuestions()[state.currentIndex];
    const newType = typeSelectEl.value;
    const cfg = QUESTION_TYPES[newType];

    q.type = newType;
    q.options = cfg.defaultOptions();
    renderOptionsUI(q);
  });

  addOptionBtn.addEventListener("click", () => {
    if (state.currentIndex < 0 || state.currentIndex >= getQuestions().length) return;

    const q = getQuestions()[state.currentIndex];
    const cfg = QUESTION_TYPES[q.type];
    if (!cfg.needsOptions) return;
    q.options.push({ text: "", correct: false });
    renderOptionsUI(q);
  });

  quizDescInput.addEventListener("input", function () {
    const length = this.value.length;
    const maxLength = this.maxLength;
    quizDescChars.textContent = `${length}/${maxLength}`;
    quizDescChars.style.color = length >= maxLength ? "red" : "var(--text)";
  });

  saveQuizInfoBtn.addEventListener("click", async () => {
    const quiz = state.sets[state.currentSet];
    quiz.name = quizTitleInput.value.trim();
    quiz.description = quizDescInput.value.trim();

    const quizFile = quizInfoUploader.getFile();
    if (quizFile) {
      quiz.image = await fileToBase64(quizFile);
    } else if (quizInfoUploader.getIsCleared()) {
      quiz.image = null;
    }
    quizInfoUploader.resetCleared();
    quiz.oneWay = !oneWayOnly.checked;

    await saveState();
    editQuizDialog.close();
  });

  deleteSetBtn.addEventListener("click", async () => {
    if (confirm("Are you sure you want to delete this quiz set?")) {
      delete state.sets[state.currentSet];
      const remaining = Object.keys(state.sets);
      if (remaining.length === 0) {
        const id = `i${Date.now()}`;
        state.sets[id] = createSetTemplate("quiz");
        state.currentSet = id;
      } else {
        state.currentSet = remaining[0];
      }
      await saveState();
      window.location.href = "./index.html";
    }
  });

  quizTypeSelect.addEventListener("change", async () => {
    if (confirm("Changing type will reset questions. Continue?")) {
      state.sets[state.currentSet].type = quizTypeSelect.value;
      await saveState();
    } else {
      quizTypeSelect.value = state.sets[state.currentSet].type;
    }
  });

  previewQuizBtn.addEventListener("click", () => {
    window.location.href = `./quiz.html?set=${state.currentSet}&preview`;
  });

  // INITIALIZE
  async function initializeApp() {
    // load theme
    loadTheme(state.userPrefs.theme);
    const setParam = new URLSearchParams(window.location.search).get("set");
    if (setParam) {
      state.currentSet = setParam;
    } else {
      const type = new URLSearchParams(window.location.search).get("type") || "quiz";
      const newSetId = `i${Date.now()}`;
      state.currentSet = newSetId;
      state.sets[newSetId] = createSetTemplate(type);
      await saveState();
    }

    if (!state.sets[state.currentSet]) {
      state.sets[state.currentSet] = createSetTemplate("quiz");
      await saveState();
    }

    if (!state.sets[state.currentSet].questions?.length) {
      state.sets[state.currentSet].questions = [createQuestion()];
      await saveState();
    }

    renderSetInfo();
    renderQuestionList();
    loadQuestion(0);
  }

  await initializeApp();
});


/* SpendWise Academy — Evaluation 2 */
(() => {
  "use strict";

  const STORAGE_KEY = "spendwise.academy.progress.v1";
  const TOTAL_TAX_LESSONS = 5;

  const defaultState = {
    xp: 320,
    lessonsCompleted: {
      budgeting: 5,
      income: 5,
      taxation: 2,
      "advanced-tax": 0,
      equities: 0
    },
    quizResults: [],
    lastOpenedModule: null
  };

  let state;

  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    state = saved ? JSON.parse(saved) : structuredClone(defaultState);

    state.lessonsCompleted ||= {};
    state.lessonsCompleted.taxation ??= 2;
    state.lessonsCompleted.equities ??= 0;
    state.quizResults ||= [];
    state.xp = Number(state.xp) || 0;
  } catch (error) {
    console.warn("Could not load saved progress:", error);
    state = structuredClone(defaultState);
  }

  function saveProgress() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (error) {
      console.error("Could not save progress:", error);
    }
  }

  function updateXP() {
    const display = document.querySelector(".text-771");
    if (display) display.textContent = `${state.xp} / 500 XP`;
  }

  function updateTaxationCard() {
    const resumeButton = document.querySelector(".button-748");
    if (!resumeButton) return;

    // Find the card containing the Taxation Resume button.
    let card = resumeButton.parentElement;

    while (
      card &&
      card !== document.body &&
      !card.textContent.includes("Introduction to Indian Taxation")
    ) {
      card = card.parentElement;
    }

    if (!card) return;

    const completed = Math.min(
      state.lessonsCompleted.taxation || 0,
      TOTAL_TAX_LESSONS
    );

    // Update only the text node, preserving buttons and their listeners.
    const walker = document.createTreeWalker(
      card,
      NodeFilter.SHOW_TEXT
    );

    let node;

    while ((node = walker.nextNode())) {
      if (/\d+\s+of\s+5\s+Lessons/i.test(node.nodeValue)) {
        node.nodeValue = node.nodeValue.replace(
          /\d+\s+of\s+5\s+Lessons/i,
          `${completed} of 5 Lessons`
        );
      }
    }

    if (completed >= TOTAL_TAX_LESSONS) {
      resumeButton.textContent = "Review";
    } else {
      resumeButton.textContent = "Resume";
    }
  }

  function exportProgress() {
    const payload = {
      app: "SpendWise Academy",
      exportedAt: new Date().toISOString(),
      progress: state
    };

    const blob = new Blob(
      [JSON.stringify(payload, null, 2)],
      { type: "application/json" }
    );

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = "spendwise-academy-progress.json";
    document.body.appendChild(link);
    link.click();
    link.remove();

    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  function resetProgress() {
    if (!confirm("Reset saved Academy progress to the demo state?")) {
      return;
    }

    state = structuredClone(defaultState);
    saveProgress();
    location.reload();
  }

  
function addProgressButtons() {
    if (document.querySelector(".academy-tools")) return;

    const body = document.querySelector(".body-700");
    if (!body || !body.parentElement) return;

    const toolbar = document.createElement("section");
    toolbar.className = "academy-tools";

    toolbar.style.cssText = `
      display:flex;
      align-items:center;
      justify-content:space-between;
      flex-wrap:wrap;
      gap:18px;
      margin:12px 24px;
      padding:18px 22px;
      background:linear-gradient(135deg, #ffffff, #f8fafc);
      border:1px solid #e2e8f0;
      border-radius:16px;
      box-shadow:0 4px 16px rgba(15, 23, 42, 0.05);
      font-family:Arial,sans-serif;
      box-sizing:border-box;
    `;

    toolbar.innerHTML = `
      <style>
        .academy-tools .workspace-heading {
          display:flex;
          align-items:center;
          gap:12px;
          min-width:180px;
        }

        .academy-tools .workspace-icon {
          width:42px;
          height:42px;
          display:flex;
          align-items:center;
          justify-content:center;
          border-radius:12px;
          background:#eef4fa;
          color:#14243b;
          font-size:20px;
          flex-shrink:0;
        }

        .academy-tools .workspace-title {
          margin:0;
          color:#14243b;
          font-size:15px;
          font-weight:700;
        }

        .academy-tools .workspace-subtitle {
          margin:5px 0 0;
          color:#8492a6;
          font-size:12px;
        }

        .academy-tools .workspace-actions {
          display:flex;
          align-items:center;
          flex-wrap:wrap;
          gap:10px;
        }

        .academy-tools .workspace-btn {
          display:flex;
          align-items:center;
          justify-content:center;
          gap:8px;
          padding:11px 16px;
          border-radius:10px;
          font-size:13px;
          font-weight:600;
          cursor:pointer;
          transition:all 0.2s ease;
        }

        .academy-tools .export-btn {
          background:#14243b;
          color:#fff;
          border:1px solid #14243b;
          box-shadow:0 3px 8px rgba(20,36,59,0.15);
        }

        .academy-tools .export-btn:hover {
          background:#203b5d;
          transform:translateY(-2px);
          box-shadow:0 5px 12px rgba(20,36,59,0.2);
        }

        .academy-tools .reset-btn {
          background:#fff;
          color:#475569;
          border:1px solid #d8e0e9;
        }

        .academy-tools .reset-btn:hover {
          background:#f1f5f9;
          border-color:#94a3b8;
          transform:translateY(-2px);
        }

        .academy-tools .workspace-btn:focus-visible {
          outline:3px solid #38bdf8;
          outline-offset:3px;
        }

        @media (max-width:600px) {
          .academy-tools {
            align-items:stretch !important;
            margin:12px !important;
          }

          .academy-tools .workspace-actions {
            width:100%;
          }

          .academy-tools .workspace-btn {
            flex:1;
          }
        }
      </style>

      <div class="workspace-heading">
        <div class="workspace-icon">▤</div>
        <div>
          <p class="workspace-title">Your Learning Workspace</p>
          <p class="workspace-subtitle">
            Manage and back up your learning progress
          </p>
        </div>
      </div>

      <div class="workspace-actions">
        <button type="button"
          id="academy-export"
          class="workspace-btn export-btn">
          <span>↓</span>
          Export Progress
        </button>

        <button type="button"
          id="academy-reset"
          class="workspace-btn reset-btn">
          <span>↻</span>
          Reset Demo Progress
        </button>
      </div>
    `;

    body.parentElement.insertBefore(toolbar, body);

    toolbar.querySelector("#academy-export")
      .addEventListener("click", exportProgress);

    toolbar.querySelector("#academy-reset")
      .addEventListener("click", resetProgress);
}


  const lessons = [
    {
      title: "Introduction to Indian Taxation",
      content: "Income tax is a tax on taxable income. Understanding the applicable financial year and tax rules is an important first step.",
      points: [
        "Identify the relevant financial year.",
        "Understand taxable income.",
        "Keep income-related documents organised."
      ],
      question: "What should you identify before calculating tax?",
      options: [
        "The relevant financial year and applicable rules",
        "Only your bank balance",
        "Only your monthly expenses"
      ],
      answer: 0,
      explanation: "Correct. The relevant financial year and applicable rules provide the basis for tax calculations."
    },
    {
      title: "Understanding Taxable Income",
      content: "Taxable income is determined using applicable tax rules. Different income sources and eligible deductions may affect the calculation.",
      points: [
        "Identify your income sources.",
        "Check which deductions are eligible.",
        "Keep supporting documents."
      ],
      question: "What may affect the calculation of taxable income?",
      options: [
        "Your favourite colour",
        "Applicable rules and eligible deductions",
        "The number of apps on your phone"
      ],
      answer: 1,
      explanation: "Correct. Applicable rules and eligible deductions can affect taxable income."
    },
    {
      title: "Understanding Tax Regimes",
      content: "India's tax regime rules determine how income is taxed and which deductions or exemptions may apply. Compare the applicable provisions before making a decision.",
      points: [
        "Check the rules for the relevant year.",
        "Review deductions and exemptions.",
        "Compare options using your own circumstances."
      ],
      question: "How should you compare tax regimes?",
      options: [
        "Assume both always produce the same result",
        "Choose randomly",
        "Compare applicable rules and your circumstances"
      ],
      answer: 2,
      explanation: "Correct. The outcome depends on applicable provisions and individual circumstances."
    },
    {
      title: "Deductions and Records",
      content: "Deductions are subject to eligibility conditions and applicable limits. Accurate records help you substantiate information reported in a return.",
      points: [
        "Verify eligibility before claiming deductions.",
        "Retain relevant receipts and statements.",
        "Check applicable limits and conditions."
      ],
      question: "Why should you maintain investment and tax records?",
      options: [
        "To support accurate reporting and eligible claims",
        "To guarantee a refund",
        "Because records remove every tax obligation"
      ],
      answer: 0,
      explanation: "Correct. Records help support accurate reporting and eligible claims."
    },
    {
      title: "Preparing to File a Return",
      content: "Before submitting a return, review the information entered, verify supporting records and consult current official guidance where needed.",
      points: [
        "Review income and reported details.",
        "Verify deductions and supporting records.",
        "Check current official guidance before submission."
      ],
      question: "What should you do before submitting a return?",
      options: [
        "Skip checking the details",
        "Verify the information and applicable requirements",
        "Assume every pre-filled value is correct"
      ],
      answer: 1,
      explanation: "Correct. Verify the details and applicable requirements before submission."
    }
  ];

  function openTaxationLesson() {
    const oldModal = document.querySelector("#taxation-modal");
    if (oldModal) oldModal.remove();

    state.lastOpenedModule = "taxation";
    saveProgress();

    const completed = Math.min(
      Math.max(state.lessonsCompleted.taxation || 0, 0),
      lessons.length
    );

    // Start at the first incomplete lesson. If all are done, allow review.
    let current = Math.min(completed, lessons.length - 1);
    const answered = {};
    const correctThisSession = new Set();

    const modal = document.createElement("div");
    modal.id = "taxation-modal";
    modal.style.cssText = `
      position:fixed;
      inset:0;
      z-index:9999;
      background:rgba(2,6,23,.75);
      display:flex;
      align-items:center;
      justify-content:center;
      padding:20px;
      font-family:Arial,sans-serif;
    `;

    document.body.appendChild(modal);

    function closeModal() {
      modal.remove();
      updateXP();
      updateTaxationCard();
    }

    function renderLesson() {
      const lesson = lessons[current];
      const previousAnswer = answered[current];

      modal.innerHTML = `
        <section style="
          background:#fff;color:#0f172a;width:100%;
          max-width:720px;max-height:85vh;overflow-y:auto;
          padding:28px;border-radius:16px;box-sizing:border-box;
        ">
          <button id="tax-close" type="button"
            style="float:right;padding:8px 12px;">
            Close ✕
          </button>

          <p style="color:#0e7490;font-weight:bold;">
            SPENDWISE ACADEMY
          </p>
          <h2>Introduction to Indian Taxation &amp; Regimes</h2>
          <p>Lesson ${current + 1} of ${lessons.length}</p>

          <div style="height:6px;background:#e2e8f0;border-radius:6px;">
            <div style="
              height:6px;
              width:${((current + 1) / lessons.length) * 100}%;
              background:#0e7490;border-radius:6px;
            "></div>
          </div>

          <h3>${lesson.title}</h3>
          <p>${lesson.content}</p>
          <ul>${lesson.points.map(p => `<li>${p}</li>`).join("")}</ul>

          <hr>
          <h3>Knowledge Check</h3>
          <p>${lesson.question}</p>

          ${lesson.options.map((option, index) => `
            <label style="display:block;margin:12px 0;">
              <input type="radio" name="tax-answer" value="${index}"
                ${previousAnswer === index ? "checked" : ""}>
              ${option}
            </label>
          `).join("")}

          <button id="tax-check" type="button" style="
            background:#0e7490;color:white;border:0;border-radius:8px;
            padding:12px 18px;cursor:pointer;margin-top:12px;
          ">Check Answer</button>

          <p id="tax-feedback" role="status" aria-live="polite"></p>

          <div style="
            display:flex;justify-content:space-between;
            gap:12px;margin-top:20px;
          ">
            <button id="tax-prev" type="button"
              ${current === 0 ? "disabled" : ""}
              style="padding:10px 16px;">
              ← Previous
            </button>

            <button id="tax-next" type="button" style="
              padding:10px 16px;background:#0f172a;color:white;
              border:0;border-radius:8px;
            ">
              ${current === lessons.length - 1 ? "Finish" : "Next →"}
            </button>
          </div>
        </section>
      `;

      modal.querySelector("#tax-close")
        .addEventListener("click", closeModal);

      modal.querySelector("#tax-prev").addEventListener("click", () => {
        if (current > 0) {
          current--;
          renderLesson();
        }
      });

      modal.querySelector("#tax-check").addEventListener("click", () => {
        const selected = modal.querySelector(
          'input[name="tax-answer"]:checked'
        );
        const feedback = modal.querySelector("#tax-feedback");

        if (!selected) {
          feedback.textContent = "Please select an answer first.";
          feedback.style.color = "#b45309";
          return;
        }

        const choice = Number(selected.value);
        const isCorrect = choice === lesson.answer;
        answered[current] = choice;

        state.quizResults.push({
          moduleId: "taxation",
          lesson: current + 1,
          question: lesson.question,
          selectedAnswer: lesson.options[choice],
          correct: isCorrect,
          submittedAt: new Date().toISOString()
        });

        if (isCorrect) {
          feedback.textContent = lesson.explanation;
          feedback.style.color = "#047857";

          // Award XP only when completing a previously incomplete lesson.
          if (
            current >= state.lessonsCompleted.taxation &&
            !correctThisSession.has(current)
          ) {
            state.lessonsCompleted.taxation = current + 1;
            state.xp += 20;
            correctThisSession.add(current);
          }
        } else {
          feedback.textContent =
            "Not quite. Review the lesson and try again.";
          feedback.style.color = "#b91c1c";
        }

        saveProgress();
        updateXP();
        updateTaxationCard();
      });

      modal.querySelector("#tax-next").addEventListener("click", () => {
        const isCompleted = current < state.lessonsCompleted.taxation;

        if (!isCompleted && !correctThisSession.has(current)) {
          const feedback = modal.querySelector("#tax-feedback");
          feedback.textContent =
            "Please answer correctly before continuing.";
          feedback.style.color = "#b45309";
          return;
        }

        if (current < lessons.length - 1) {
          current++;
          renderLesson();
        } else {
          state.lessonsCompleted.taxation = Math.max(
            state.lessonsCompleted.taxation || 0,
            lessons.length
          );
          saveProgress();
          closeModal();
        }
      });
    }

    modal.addEventListener("click", event => {
      if (event.target === modal) closeModal();
    });

    renderLesson();
  }

  const equitiesLessons = [
  {
    title: "Introduction to Stock Markets",
    content: "A stock market is a place where shares of companies are bought and sold.",
    question: "What does buying a share represent?",
    options: ["Ownership in a company", "A guaranteed salary", "A bank deposit"],
    answer: 0
  },
  {
    title: "Understanding Shares",
    content: "A share represents a unit of ownership in a company.",
    question: "Can share prices fall?",
    options: ["Never", "Yes, prices fluctuate", "Only on Sundays"],
    answer: 1
  },
  {
    title: "Stock Market Indices",
    content: "Nifty 50 and Sensex track selected groups of Indian stocks.",
    question: "What does an index track?",
    options: ["A group of stocks", "Bank account passwords", "Fixed salaries"],
    answer: 0
  },
  {
    title: "Risk and Diversification",
    content: "Diversification spreads investments across different assets. It cannot remove all risk.",
    question: "What is a benefit of diversification?",
    options: ["Guaranteed profit", "No risk at all", "Reduced concentration risk"],
    answer: 2
  },
  {
    title: "Long-Term Investing",
    content: "Stock-market returns are uncertain and losses are possible.",
    question: "Are stock-market returns guaranteed?",
    options: ["Always", "No", "Only for beginners"],
    answer: 1
  }
];


function openEquitiesLesson() {
  const oldModal = document.querySelector("#equities-modal");
  if (oldModal) oldModal.remove();

  state.lessonsCompleted ||= {};
  state.lessonsCompleted.equities ??= 0;
  state.quizResults ||= [];
  state.lastOpenedModule = "equities";
  saveProgress();

  let current = Math.min(
    state.lessonsCompleted.equities,
    equitiesLessons.length - 1
  );

  const correctThisSession = new Set();
  const modal = document.createElement("div");

  modal.id = "equities-modal";
  modal.style.cssText = `
    position: fixed;
    inset: 0;
    z-index: 10000;
    background: rgba(2, 6, 23, .75);
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 20px;
    font-family: Arial, sans-serif;
  `;

  document.body.appendChild(modal);

  function closeModal() {
    saveProgress();
    updateXP();
    updateEquitiesCard();
    modal.remove();
  }

  function render() {
    const lesson = equitiesLessons[current];

    modal.innerHTML = `
      <section style="
        background: white;
        color: #0f172a;
        width: 100%;
        max-width: 650px;
        max-height: 85vh;
        overflow-y: auto;
        padding: 25px;
        border-radius: 16px;
        box-sizing: border-box;
      ">
        <button type="button" id="eq-close" style="float:right">
          Close ✕
        </button>

        <p style="color:#0e7490;font-weight:bold">
          SPENDWISE ACADEMY · EQUITIES
        </p>

        <h2>Introduction to Equities &amp; Stock Markets</h2>
        <p>Lesson ${current + 1} of ${equitiesLessons.length}</p>

        <div style="height:6px;background:#e2e8f0;border-radius:6px">
          <div style="
            height:6px;
            width:${((current + 1) / equitiesLessons.length) * 100}%;
            background:#0e7490;
            border-radius:6px;
          "></div>
        </div>

        <h3>${lesson.title}</h3>
        <p>${lesson.content}</p>

        <hr>
        <h3>Knowledge Check</h3>
        <p>${lesson.question}</p>
    

        ${lesson.options.map((option, i) => `
          <label style="display:block;margin:12px 0">
            <input type="radio" name="eq-answer" value="${i}">
            ${option}
          </label>
        `).join("")}

        <button type="button" id="eq-check" style="
          background:#0e7490;color:white;border:0;
          border-radius:8px;padding:10px 16px;cursor:pointer;
        ">Check Answer</button>

        <p id="eq-feedback" role="status" aria-live="polite"></p>

        
<div style="display:flex;justify-content:space-between;align-items:center;gap:12px;margin-top:16px;">
  <button type="button" id="eq-prev"
    style="padding:10px 16px;border:1px solid #cbd5e1;border-radius:8px;background:#f1f5f9;color:#0f172a;cursor:pointer;">
    ← Previous Lesson
  </button>

  <button type="button" id="eq-next"
    style="background:#0f172a;color:white;border:0;border-radius:8px;padding:10px 16px;cursor:pointer;">
    ${current === equitiesLessons.length - 1
      ? "Finish Module"
      : "Next Lesson →"}
  </button>
</div>

      </section>
    `;

    modal.querySelector("#eq-close").addEventListener(
      "click",
      closeModal
    );

    modal.querySelector("#eq-prev").addEventListener("click", () => {
    if (current > 0) {
    current--;
    render();
    }
    });


    modal.querySelector("#eq-check").addEventListener("click", () => {
      const selected = modal.querySelector(
        'input[name="eq-answer"]:checked'
      );
      const feedback = modal.querySelector("#eq-feedback");

      if (!selected) {
        feedback.textContent = "Please select an answer first.";
        feedback.style.color = "#b45309";
        return;
      }

      const selectedIndex = Number(selected.value);
      const isCorrect = selectedIndex === lesson.answer;

      state.quizResults.push({
        moduleId: "equities",
        lesson: current + 1,
        question: lesson.question,
        selectedAnswer: lesson.options[selectedIndex],
        correct: isCorrect,
        submittedAt: new Date().toISOString()
      });

      if (isCorrect) {
        feedback.textContent = "Correct! Well done.";
        feedback.style.color = "#047857";

        // Award 20 XP only once per newly completed lesson.
        if (
          current >= state.lessonsCompleted.equities &&
          !correctThisSession.has(current)
        ) {
          state.lessonsCompleted.equities = current + 1;
          state.xp += 20;
          correctThisSession.add(current);
        }
      } else {
        feedback.textContent = "Incorrect. Review and try again.";
        feedback.style.color = "#b91c1c";
      }

      saveProgress();
      updateXP();
      updateEquitiesCard();
    });

    modal.querySelector("#eq-next").addEventListener("click", () => {
      const completed = current < state.lessonsCompleted.equities;

      if (!completed && !correctThisSession.has(current)) {
        const feedback = modal.querySelector("#eq-feedback");
        feedback.textContent = "Answer correctly before continuing.";
        feedback.style.color = "#b45309";
        return;
      }

      if (current < equitiesLessons.length - 1) {
        current++;
        render();
      } else {
        saveProgress();
        closeModal();
      }
    });
  }

  modal.addEventListener("click", event => {
    if (event.target === modal) closeModal();
  });

  render();
}

function updateEquitiesCard() {
  const card = document.querySelector(".node-5-equities-node");
  if (!card) return;

  const completed = Math.min(
    Number(state.lessonsCompleted.equities) || 0,
    equitiesLessons.length
  );

  let progress = card.querySelector(".equities-progress");

  if (!progress) {
    progress = document.createElement("p");
    progress.className = "equities-progress";
    progress.style.cssText =
      "font-size:13px;color:#64748b;margin:8px 12px;";
    card.appendChild(progress);
  }

  progress.textContent =
    `${completed} of ${equitiesLessons.length} lessons completed`;

  const button = card.querySelector(".equities-start-button");

  if (button) {
    button.textContent =
      completed === equitiesLessons.length ? "Review" :
      completed > 0 ? "Continue Learning" : "Start Learning";
  }
}


function addEquitiesButton() {
  const card = document.querySelector(".node-5-equities-node");
  if (!card || card.querySelector(".equities-start-button")) return;

  const button = document.createElement("button");
  button.type = "button";
  button.className = "equities-start-button";
  button.textContent = "Start Learning";
  button.style.cssText =
    "background:#0e7490;color:white;border:0;border-radius:8px;" +
    "padding:10px 16px;cursor:pointer;margin:12px;";

  button.addEventListener("click", openEquitiesLesson);
  card.appendChild(button);
}

  function init() {
    addProgressButtons();
    updateXP();
    updateTaxationCard();
    addEquitiesButton();
    updateEquitiesCard();

    const resumeButton = document.querySelector(".button-748");

    if (resumeButton) {
      resumeButton.style.cursor = "pointer";
      resumeButton.setAttribute("role", "button");
      resumeButton.setAttribute("tabindex", "0");

      resumeButton.addEventListener("click", openTaxationLesson);

      resumeButton.addEventListener("keydown", event => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          openTaxationLesson();
        }
      });
    }

    console.log("SpendWise Academy initialized.");
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();

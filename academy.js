
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
      justify-content:flex-start;
      flex-wrap:wrap;
      gap:10px;
      margin:12px 24px;
      padding:12px 16px;
      background:#fff;
      border:1px solid #e2e8f0;
      border-radius:12px;
      font-family:Arial,sans-serif;
    `;

    toolbar.innerHTML = `
      <p><strong>Your learning workspace</strong></p>
      <button type="button" id="academy-export">
        Export progress JSON
      </button>
      <button type="button" id="academy-reset">
        Reset demo progress
      </button>
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

  function init() {
    addProgressButtons();
    updateXP();
    updateTaxationCard();

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

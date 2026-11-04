
document.addEventListener("DOMContentLoaded", async function () {
        console.log("SpendWise JavaScript connected!");

    // SEARCH TRANSACTIONS
    const searchBox = document.querySelector(".input-297");
    const transactionContainer = document.querySelector(".container-385");

    let searchInput = searchBox?.querySelector("input");

    if (searchBox && !searchInput) {
        searchInput = document.createElement("input");
        searchInput.type = "text";
        searchInput.placeholder = "Search transactions...";
        searchInput.setAttribute("aria-label", "Search transactions");

        searchInput.style.cssText =
            "width:100%;height:100%;border:none;outline:none;background:transparent;font:inherit;color:inherit;padding:0;box-sizing:border-box;";

        searchBox.replaceChildren(searchInput);
    }

    const getTransactions = () => {
        return transactionContainer
            ? Array.from(transactionContainer.children)
            : [];
    };

    function filterTransactions() {
        const query = searchInput?.value.trim().toLowerCase() || "";

        getTransactions().forEach(function (card) {
            const matchesSearch = card.textContent
                .toLowerCase()
                .includes(query);

            const matchesUpcoming =
                card.dataset.upcomingHidden !== "true";

            card.style.setProperty(
                "display",
                matchesSearch && matchesUpcoming ? "" : "none",
                "important"
            );
        });
    }

    searchInput?.addEventListener("input", filterTransactions);


    // STYLISH ADD / EDIT TRANSACTION FORM
    function showTransactionForm(options = {}) {
        document.querySelector("#transaction-modal")?.remove();

        const isEditing = options.mode === "edit";

        const modal = document.createElement("div");
        modal.id = "transaction-modal";

        modal.innerHTML = `
            <div class="transaction-backdrop">
                <div class="transaction-modal-card" role="dialog"
                    aria-modal="true"
                    aria-labelledby="transaction-modal-title">

                    <button type="button" class="transaction-close"
                        aria-label="Close">×</button>

                    <div class="transaction-icon">＋</div>

                    <p class="transaction-eyebrow">
                        SPENDWISE • MONEY MANAGER
                    </p>

                    <h2 id="transaction-modal-title">
                        ${isEditing ? "Edit transaction" : "Add a transaction"}
                    </h2>

                    <p class="transaction-subtitle">
                        Keep track of where your money goes.
                    </p>

                    <form id="transaction-form">
                        <label for="transaction-name">
                            Transaction name
                        </label>

                        <input
                            id="transaction-name"
                            type="text"
                            placeholder="e.g. Coffee, Shopping, Netflix"
                            maxlength="60"
                            required
                        >

                        <label for="transaction-amount">
                            Amount (₹)
                        </label>

                        <div class="amount-input-wrap">
                            <span>₹</span>
                            <input
                                id="transaction-amount"
                                type="number"
                                placeholder="0.00"
                                min="0.01"
                                step="0.01"
                                required
                            >
                        </div>

                        <div class="transaction-form-actions">
                            <button type="button"
                                class="transaction-cancel">
                                Cancel
                            </button>

                            <button type="submit"
                                class="transaction-save">
                                ${isEditing ? "Save changes" : "Add transaction"}
                                <span>→</span>
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        const nameInput = modal.querySelector("#transaction-name");
        const amountInput = modal.querySelector("#transaction-amount");

        nameInput.value = options.name || "";
        amountInput.value = options.amount ?? "";

        function closeModal() {
            modal.remove();
        }

        modal.querySelector(".transaction-close")
            .addEventListener("click", closeModal);

        modal.querySelector(".transaction-cancel")
            .addEventListener("click", closeModal);

        modal.querySelector(".transaction-backdrop")
            .addEventListener("click", function (event) {
                if (event.target === this) {
                    closeModal();
                }
            });

        modal.querySelector("#transaction-form")
            .addEventListener("submit", function (event) {
                event.preventDefault();

                const name = nameInput.value.trim();
                const amount = Number(amountInput.value);

                if (
                    !name ||
                    !Number.isFinite(amount) ||
                    amount <= 0
                ) {
                    alert("Please enter a valid name and amount.");
                    return;
                }

                options.onSave(name, amount);
                closeModal();
            });

        nameInput.focus();
    }


    // CREATE A NEW TRANSACTION CARD
    
async function createTransaction(name, amount, id) {
    if (!transactionContainer) return;

    const card = document.createElement("div");
    card.className = "background-border-386 transaction-added-card";
    card.dataset.transactionId = id;

    card.style.cssText = `
        padding: 18px;
        margin-top: 12px;
        border: 1px solid #e2e8f0;
        border-radius: 14px;
        background: white;
        color: #0f172a;
    `;

    const title = document.createElement("p");
    title.className = "transaction-name";
    title.textContent = name;
    title.style.cssText = "font-size:16px;font-weight:700;margin:0 0 8px;";

    const price = document.createElement("p");
    price.className = "transaction-amount";
    price.dataset.amount = amount;
    price.textContent = "₹" + amount.toLocaleString("en-IN", {
        maximumFractionDigits: 2
    });
    price.style.cssText = "font-size:15px;font-weight:600;margin:0 0 12px;color:#0f766e;";

    const actions = document.createElement("div");
    actions.className = "transaction-actions";
    actions.style.cssText = "display:flex;gap:8px;margin-top:10px;";

    const editButton = document.createElement("button");
    editButton.type = "button";
    editButton.textContent = "Edit";

    const deleteButton = document.createElement("button");
    deleteButton.type = "button";
    deleteButton.textContent = "Delete";

    styleActionButton(editButton);
    styleActionButton(deleteButton);

    editButton.addEventListener("click", function () {
        showTransactionForm({
            mode: "edit",
            name: title.textContent,
            amount: price.dataset.amount,
            onSave: async function (updatedName, updatedAmount) {
                try {
                    const response = await fetch(
                        `/api/transactions/${encodeURIComponent(id)}`,
                        {
                            method: "PUT",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({
                                title: updatedName,
                                amount: updatedAmount
                            })
                        }
                    );

                    if (!response.ok) throw new Error("Update failed.");

                    title.textContent = updatedName;
                    price.dataset.amount = updatedAmount;
                    price.textContent = "₹" + updatedAmount.toLocaleString(
                        "en-IN", { maximumFractionDigits: 2 }
                    );

                    filterTransactions();
                } catch (error) {
                    alert("Could not update transaction. Please try again.");
                }
            }
        });
    });

    deleteButton.addEventListener("click", async function () {
        if (!confirm("Delete this transaction?")) return;

        try {
            const response = await fetch(
                `/api/transactions/${encodeURIComponent(id)}`,
                { method: "DELETE" }
            );

            if (!response.ok) throw new Error("Delete failed.");

            card.remove();
            filterTransactions();
        } catch (error) {
            alert("Could not delete transaction. Please try again.");
        }
    });

    actions.append(editButton, deleteButton);
    card.append(title, price, actions);
    transactionContainer.appendChild(card);

    filterTransactions();
}



    // STYLE EDIT AND DELETE BUTTONS
    function styleActionButton(button) {
        button.style.cssText = `
            padding: 7px 12px;
            border: 1px solid #cbd5e1;
            border-radius: 8px;
            background: white;
            color: #0f172a;
            cursor: pointer;
            font: inherit;
        `;
    }


    // UPCOMING 7 DAYS FILTER
    const upcomingButton = document.querySelector(".node-332");
    const upcomingList = document.querySelector(".container-334");

    let upcomingActive = false;

    if (upcomingButton && upcomingList) {
        upcomingButton.style.cursor = "pointer";
        upcomingButton.setAttribute("role", "button");
        upcomingButton.setAttribute("tabindex", "0");
        upcomingButton.setAttribute("aria-pressed", "false");

        function toggleUpcoming() {
            upcomingActive = !upcomingActive;

            Array.from(upcomingList.children).forEach(function (card) {
                const dueText = card.textContent.toLowerCase();
                const isNextWeek = dueText.includes("next week");

                card.style.setProperty(
                    "display",
                    upcomingActive && isNextWeek ? "none" : "",
                    "important"
                );
            });

            upcomingButton.setAttribute(
                "aria-pressed",
                String(upcomingActive)
            );

            upcomingButton.style.background = upcomingActive
                ? "#ccfbf1"
                : "";

            upcomingButton.style.borderColor = upcomingActive
                ? "#0d9488"
                : "";

            upcomingButton.style.borderRadius = "10px";
            upcomingButton.style.padding = "8px 12px";
            upcomingButton.style.transition = "all 0.2s ease";
        }

        upcomingButton.addEventListener("click", toggleUpcoming);

        upcomingButton.addEventListener("keydown", function (event) {
            if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                toggleUpcoming();
            }
        });
    }


    // PROFILE MENU
    const profile = document.querySelector(".node-303");

    if (profile) {
        profile.style.cursor = "pointer";

        const menu = document.createElement("div");
        menu.hidden = true;

        menu.style.cssText = `
            position:absolute;
            right:20px;
            top:70px;
            z-index:1000;
            background:white;
            border:1px solid #e2e8f0;
            border-radius:12px;
            padding:14px 18px;
            box-shadow:0 8px 24px #0002;
            color:#0f172a;
            min-width:180px;
        `;

        menu.innerHTML = `
            <p style="font-weight:700;margin-bottom:8px">
                Mahak Jain
            </p>
            <p style="font-size:13px;margin-bottom:10px">
                SpendWise Account
            </p>
            <button type="button" id="profileDetails"
                style="padding:7px 10px;cursor:pointer">
                Account details
            </button>
            <button type="button" id="closeProfile"
                style="padding:7px 10px;cursor:pointer">
                Close
            </button>
        `;

        profile.style.position = "relative";
        profile.appendChild(menu);

        profile.addEventListener("click", function (event) {
            if (event.target.closest("button")) return;
            menu.hidden = !menu.hidden;
        });

        menu.querySelector("#closeProfile")
            .addEventListener("click", function () {
                menu.hidden = true;
            });

        menu.querySelector("#profileDetails")
            .addEventListener("click", function () {
                alert("Account: Mahak Jain\nConnected node: SBI • 4521");
            });
    }


    // ADD TRANSACTION BUTTON
    if (transactionContainer) {
        const heading = document.querySelector(".text-381")
            ?.parentElement;

        if (heading && !document.querySelector("#addTransaction")) {
            const addButton = document.createElement("button");

            addButton.id = "addTransaction";
            addButton.type = "button";
            addButton.textContent = "+ Add Transaction";

            addButton.style.cssText = `
                padding:10px 14px;
                border:0;
                border-radius:8px;
                background:#0f766e;
                color:white;
                cursor:pointer;
                margin:10px 0;
                font:inherit;
                font-weight:600;
            `;

            heading.appendChild(addButton);

            // Only the stylish form opens. No old prompt() calls.
            addButton.addEventListener("click", function () {
                showTransactionForm({
                    mode: "add",
                    
onSave: async function (name, amount) {
    try {
        const response = await fetch("/api/transactions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                title: name,
                amount: amount
            })
        });

        if (!response.ok) {
            throw new Error("Save failed");
        }

        const saved = await response.json();

        await createTransaction(
            saved.title,
            saved.amount,
            saved.id
        );
    } catch (error) {
        console.error(error);
        alert("Could not save transaction. Please try again.");
    }
}

                });
            });
        }

        // ADD EDIT AND DELETE TO THE ORIGINAL TRANSACTIONS
        getTransactions().forEach(function (card) {
            if (card.querySelector(".transaction-actions")) return;

            const titleElement = card.querySelector(
                ".heading-4-392, .heading-4-404, .heading-4-416"
            );

            const amountElement = card.querySelector(
                ".container-396, .container-408, .container-420"
            );

            if (!titleElement || !amountElement) return;

            const actions = document.createElement("div");
            actions.className = "transaction-actions";
            actions.style.cssText =
                "display:flex;gap:8px;margin-top:8px;";

            const editButton = document.createElement("button");
            editButton.type = "button";
            editButton.textContent = "Edit";

            const deleteButton = document.createElement("button");
            deleteButton.type = "button";
            deleteButton.textContent = "Delete";

            styleActionButton(editButton);
            styleActionButton(deleteButton);

            editButton.addEventListener("click", function () {
                const originalName = titleElement.textContent.trim();

                const originalAmount = Number(
                    amountElement.textContent.replace(/[₹,\s]/g, "")
                );

                showTransactionForm({
                    mode: "edit",
                    name: originalName,
                    amount: Number.isFinite(originalAmount)
                        ? originalAmount
                        : "",
                    onSave: function (updatedName, updatedAmount) {
                        const textNode = titleElement.querySelector("p");
                        const target = textNode || titleElement;
                        target.textContent = updatedName;

                        amountElement.textContent =
                            "₹" + updatedAmount.toLocaleString("en-IN", {
                                maximumFractionDigits: 2
                            });

                        filterTransactions();
                    }
                });
            });

            deleteButton.addEventListener("click", function () {
                if (confirm("Delete this transaction?")) {
                    card.remove();
                    filterTransactions();
                }
            });

            actions.append(editButton, deleteButton);
            card.appendChild(actions);
        });
    }

    filterTransactions();

    
try {
    const response = await fetch("/api/transactions");

    if (!response.ok) {
        throw new Error("Could not load transactions");
    }

    const savedTransactions = await response.json();

    for (const transaction of savedTransactions) {
        const exists = transactionContainer &&
            Array.from(transactionContainer.children).some(
                card => card.dataset.transactionId === transaction.id
            );

        if (!exists) {
            await createTransaction(
                transaction.title,
                transaction.amount,
                transaction.id
            );
        }
    }
} catch (error) {
    console.error("Could not load transactions:", error);
}

filterTransactions();

console.log("SpendWise JSON connection ready.");

});

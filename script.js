// ========================================
// BUDGET TRACKER - script.js
// Complete Mobile PWA Version
// ========================================


// ========================================
// DOM ELEMENTS
// ========================================

const form = document.getElementById("transactionForm");

const description = document.getElementById("description");
const amount = document.getElementById("amount");
const type = document.getElementById("type");
const category = document.getElementById("category");
const date = document.getElementById("date");

const incomeText = document.getElementById("income");
const expenseText = document.getElementById("expense");
const balanceText = document.getElementById("balance");

const transactionList =
    document.getElementById("transactionList");

const searchInput =
    document.getElementById("search");

const monthFilter =
    document.getElementById("monthFilter");

const themeToggle =
    document.getElementById("themeToggle");

const exportBtn =
    document.getElementById("exportBtn");

const importBtn =
    document.getElementById("importBtn");

const importFile =
    document.getElementById("importFile");

const installBtn =
    document.getElementById("installBtn");

const typeButtons =
    document.querySelectorAll(".type-option");


// ========================================
// TRANSACTION STORAGE
// ========================================

let transactions =
    JSON.parse(
        localStorage.getItem("transactions")
    ) || [];


// ========================================
// INSTALL APP / PWA
// ========================================

let deferredPrompt = null;


// Browser tells us that the app can be installed

window.addEventListener(
    "beforeinstallprompt",
    (event) => {

        // Prevent automatic browser prompt
        event.preventDefault();

        // Save the event
        deferredPrompt = event;

        // Show our custom button
        if (installBtn) {
            installBtn.style.display = "block";
        }

    }
);


// User taps Install App

if (installBtn) {

    installBtn.addEventListener(
        "click",
        async () => {

            if (!deferredPrompt) {

                alert(
                    "The app is not ready to be installed yet."
                );

                return;

            }

            // Show native install prompt
            deferredPrompt.prompt();

            // Wait for user's choice
            const result =
                await deferredPrompt.userChoice;

            console.log(
                "Install result:",
                result.outcome
            );

            // Prompt can only be used once
            deferredPrompt = null;

            // Hide button
            installBtn.style.display = "none";

        }
    );

}


// Detect successful installation

window.addEventListener(
    "appinstalled",
    () => {

        console.log(
            "✅ Budget Tracker installed."
        );

        deferredPrompt = null;

        if (installBtn) {
            installBtn.style.display = "none";
        }

    }
);


// ========================================
// SERVICE WORKER
// ========================================

if ("serviceWorker" in navigator) {

    window.addEventListener(
        "load",
        () => {

            navigator.serviceWorker
                .register("./service-worker.js")
                .then(() => {

                    console.log(
                        "✅ Service Worker registered."
                    );

                })
                .catch(error => {

                    console.error(
                        "Service Worker registration failed:",
                        error
                    );

                });

        }
    );

}


// ========================================
// PESO FORMAT
// ========================================

function peso(value) {

    return Number(value).toLocaleString(
        "en-PH",
        {
            style: "currency",
            currency: "PHP"
        }
    );

}


// ========================================
// SAVE TRANSACTIONS
// ========================================

function saveTransactions() {

    localStorage.setItem(
        "transactions",
        JSON.stringify(transactions)
    );

}


// ========================================
// DEFAULT DATE
// ========================================

if (date) {

    date.valueAsDate = new Date();

}


// ========================================
// INCOME / EXPENSE SELECTOR
// ========================================

function setTransactionType(selectedType) {

    // Update hidden input
    type.value = selectedType;


    // Update buttons

    typeButtons.forEach(button => {

        button.classList.remove("active");

        if (
            button.dataset.type === selectedType
        ) {

            button.classList.add("active");

        }

    });

}


// Handle Income / Expense buttons

typeButtons.forEach(button => {

    button.addEventListener(
        "click",
        () => {

            setTransactionType(
                button.dataset.type
            );

        }
    );

});


// ========================================
// ADD TRANSACTION
// ========================================

form.addEventListener(
    "submit",
    function(event) {

        event.preventDefault();


        // Validation

        if (
            description.value.trim() === "" ||
            amount.value === ""
        ) {

            alert(
                "Please complete the form."
            );

            return;

        }


        const transaction = {

            id: Date.now(),

            description:
                description.value.trim(),

            amount:
                Number(amount.value),

            type:
                type.value,

            category:
                category.value,

            date:
                date.value

        };


        // Add transaction

        transactions.push(transaction);


        // Save

        saveTransactions();


        // Update everything

        updateAll();


        // Reset form

        form.reset();


        // Reset date

        date.valueAsDate =
            new Date();


        // Reset type to Income

        setTransactionType(
            "income"
        );

    }
);


// ========================================
// UPDATE EVERYTHING
// ========================================

function updateAll() {

    renderTransactions();

    updateDashboard();

    updateChart();

}


// ========================================
// DASHBOARD
// ========================================

function updateDashboard() {

    let income = 0;

    let expense = 0;


    transactions.forEach(item => {

        if (item.type === "income") {

            income += Number(item.amount);

        }

        else {

            expense += Number(item.amount);

        }

    });


    incomeText.textContent =
        peso(income);

    expenseText.textContent =
        peso(expense);

    balanceText.textContent =
        peso(income - expense);

}


// ========================================
// ESCAPE HTML
// Prevents broken HTML from descriptions
// ========================================

function escapeHTML(value) {

    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

}


// ========================================
// CATEGORY ICON
// ========================================

function categoryIcon(categoryName) {

    const icons = {

        Salary: "💼",

        Food: "🍔",

        Transportation: "🚗",

        Bills: "🧾",

        Shopping: "🛒",

        Entertainment: "🎮",

        Savings: "🏦",

        Health: "❤️",

        Budget: "📊",

        Others: "📦"

    };


    return icons[categoryName] || "📦";

}


// ========================================
// RENDER TRANSACTIONS
// ========================================

function renderTransactions() {

    let filtered =
        [...transactions];


    // ====================================
    // SEARCH
    // ====================================

    const keyword =
        searchInput.value
            .trim()
            .toLowerCase();


    if (keyword !== "") {

        filtered =
            filtered.filter(item => {

                return (

                    item.description
                        .toLowerCase()
                        .includes(keyword)

                    ||

                    item.category
                        .toLowerCase()
                        .includes(keyword)

                    ||

                    item.type
                        .toLowerCase()
                        .includes(keyword)

                );

            });

    }


    // ====================================
    // MONTH FILTER
    // ====================================

    if (monthFilter.value !== "") {

        filtered =
            filtered.filter(item =>

                item.date.startsWith(
                    monthFilter.value
                )

            );

    }


    // Newest first

    filtered.sort(
        (a, b) =>
            Number(b.id) - Number(a.id)
    );


    // Clear list

    transactionList.innerHTML = "";


    // No results

    if (filtered.length === 0) {

        transactionList.innerHTML = `

            <p style="
                text-align:center;
                padding:25px;
                color:var(--subtext);
            ">

                ${
                    transactions.length === 0
                    ? "No transactions yet."
                    : "No matching transactions."
                }

            </p>

        `;

        return;

    }


    // ====================================
    // CREATE TRANSACTION CARDS
    // ====================================

    filtered.forEach(item => {

        const div =
            document.createElement("div");

        div.className =
            "transaction";


        const safeDescription =
            escapeHTML(
                item.description
            );

        const safeCategory =
            escapeHTML(
                item.category
            );

        const safeDate =
            escapeHTML(
                item.date
            );


        const icon =
            categoryIcon(
                item.category
            );


        const isIncome =
            item.type === "income";


        div.innerHTML = `

            <div class="transaction-left">

                <span class="transaction-title">

                    ${safeDescription}

                </span>


                <span class="transaction-category">

                    ${icon}
                    ${safeCategory}

                </span>


                <span class="transaction-date">

                    📅 ${safeDate}

                </span>

            </div>


            <div class="transaction-right">


                <span class="${
                    isIncome
                    ? "amount-income"
                    : "amount-expense"
                }">

                    ${
                        isIncome
                        ? "+"
                        : "-"
                    }

                    ${peso(item.amount)}

                </span>


                <button
                    class="edit-btn"
                    type="button"
                    onclick="editTransaction(${item.id})"
                    aria-label="Edit transaction"
                >

                    ✏️

                </button>


                <button
                    class="delete-btn"
                    type="button"
                    onclick="deleteTransaction(${item.id})"
                    aria-label="Delete transaction"
                >

                    🗑️

                </button>

            </div>

        `;


        transactionList.appendChild(
            div
        );

    });

}


// ========================================
// SEARCH
// ========================================

searchInput.addEventListener(
    "input",
    renderTransactions
);


// ========================================
// MONTH FILTER
// ========================================

monthFilter.addEventListener(
    "change",
    renderTransactions
);


// ========================================
// DELETE TRANSACTION
// ========================================

function deleteTransaction(id) {

    const confirmed =
        confirm(
            "Delete this transaction?"
        );


    if (!confirmed) {
        return;
    }


    transactions =
        transactions.filter(
            item =>
                Number(item.id) !== Number(id)
        );


    saveTransactions();

    updateAll();

}


// ========================================
// EDIT TRANSACTION
// ========================================

function editTransaction(id) {

    const item =
        transactions.find(
            transaction =>
                Number(transaction.id) ===
                Number(id)
        );


    if (!item) {
        return;
    }


    // Put data back into form

    description.value =
        item.description;

    amount.value =
        item.amount;

    category.value =
        item.category;

    date.value =
        item.date;


    // Set Income / Expense button

    setTransactionType(
        item.type
    );


    // Remove old transaction

    transactions =
        transactions.filter(
            transaction =>
                Number(transaction.id) !==
                Number(id)
        );


    saveTransactions();

    updateAll();


    // Scroll to form

    window.scrollTo({

        top: 0,

        behavior: "smooth"

    });


    // Focus description

    setTimeout(
        () => description.focus(),
        400
    );

}


// ========================================
// CHART
// ========================================

let expenseChart = null;


function updateChart() {

    const canvas =
        document.getElementById(
            "expenseChart"
        );


    if (!canvas) {
        return;
    }


    const totals = {};


    transactions.forEach(item => {

        if (
            item.type !== "expense"
        ) {

            return;

        }


        if (
            !totals[item.category]
        ) {

            totals[item.category] =
                0;

        }


        totals[item.category] +=
            Number(item.amount);

    });


    const labels =
        Object.keys(totals);

    const values =
        Object.values(totals);


    const ctx =
        canvas.getContext("2d");


    // Destroy previous chart

    if (expenseChart) {

        expenseChart.destroy();

    }


    // No expense data

    if (labels.length === 0) {

        return;

    }


    expenseChart =
        new Chart(
            ctx,
            {

                type: "pie",

                data: {

                    labels: labels,

                    datasets: [{

                        data: values,

                        borderWidth: 1

                    }]

                },

                options: {

                    responsive: true,

                    maintainAspectRatio: false,

                    plugins: {

                        legend: {

                            position:
                                "bottom"

                        }

                    }

                }

            }
        );

}


// ========================================
// DARK MODE
// ========================================

const savedTheme =
    localStorage.getItem(
        "theme"
    );


if (savedTheme === "dark") {

    document.body.classList.add(
        "dark"
    );

    themeToggle.textContent =
        "☀️";

}


themeToggle.addEventListener(
    "click",
    () => {

        document.body.classList.toggle(
            "dark"
        );


        const dark =
            document.body.classList.contains(
                "dark"
            );


        themeToggle.textContent =
            dark
            ? "☀️"
            : "🌙";


        localStorage.setItem(
            "theme",
            dark
            ? "dark"
            : "light"
        );

    }
);


// ========================================
// EXPORT CSV
// ========================================

exportBtn.addEventListener(
    "click",
    () => {

        if (
            transactions.length === 0
        ) {

            alert(
                "No transactions to export."
            );

            return;

        }


        let csv =
            "Description,Amount,Type,Category,Date\n";


        transactions.forEach(item => {

            const description =
                `"${String(item.description)
                    .replace(/"/g, '""')}"`;

            const type =
                `"${item.type}"`;

            const category =
                `"${String(item.category)
                    .replace(/"/g, '""')}"`;

            const date =
                `"${item.date}"`;


            csv +=
                `${description},${item.amount},${type},${category},${date}\n`;

        });


        const blob =
            new Blob(
                [csv],
                {
                    type:
                        "text/csv;charset=utf-8;"
                }
            );


        const url =
            URL.createObjectURL(
                blob
            );


        const link =
            document.createElement("a");


        link.href = url;

        link.download =
            "budget-transactions.csv";


        document.body.appendChild(
            link
        );


        link.click();


        document.body.removeChild(
            link
        );


        URL.revokeObjectURL(
            url
        );

    }
);


// ========================================
// IMPORT CSV
// ========================================

importBtn.addEventListener(
    "click",
    () => {

        importFile.click();

    }
);


importFile.addEventListener(
    "change",
    event => {

        const file =
            event.target.files[0];


        if (!file) {
            return;
        }


        const reader =
            new FileReader();


        reader.onload =
            function(event) {

                const text =
                    event.target.result.trim();


                if (!text) {

                    alert(
                        "The file is empty."
                    );

                    return;

                }


                const lines =
                    text.split(/\r?\n/);


                // Remove header

                lines.shift();


                const imported = [];


                lines.forEach(line => {

                    /*
                     * Handles simple CSV files.
                     */

                    const columns =
                        line.match(
                            /(".*?"|[^",]+)(?=\s*,|\s*$)/g
                        );


                    if (
                        !columns ||
                        columns.length < 5
                    ) {

                        return;

                    }


                    const clean =
                        columns.map(value =>

                            value
                                .trim()
                                .replace(/^"|"$/g, "")
                                .replace(/""/g, '"')

                        );


                    const importedAmount =
                        Number(clean[1]);


                    if (
                        !clean[0] ||
                        isNaN(importedAmount)
                    ) {

                        return;

                    }


                    imported.push({

                        id:
                            Date.now() +
                            Math.random(),

                        description:
                            clean[0],

                        amount:
                            importedAmount,

                        type:
                            clean[2] === "income"
                            ? "income"
                            : "expense",

                        category:
                            clean[3] ||
                            "Others",

                        date:
                            clean[4] ||
                            new Date()
                                .toISOString()
                                .split("T")[0]

                    });

                });


                if (
                    imported.length === 0
                ) {

                    alert(
                        "No valid transactions found."
                    );

                    return;

                }


                const merge =
                    confirm(
                        "Press OK to merge with existing data.\n\nPress Cancel to replace all existing data."
                    );


                if (merge) {

                    transactions.push(
                        ...imported
                    );

                }

                else {

                    transactions =
                        imported;

                }


                saveTransactions();

                updateAll();


                alert(
                    imported.length +
                    " transaction(s) imported successfully."
                );


                // Reset file input

                importFile.value = "";

            };


        reader.readAsText(file);

    }
);


// ========================================
// INITIALIZE APP
// ========================================

setTransactionType("income");

renderTransactions();

updateDashboard();

updateChart();


console.log(
    "✅ Budget Tracker initialized."
);
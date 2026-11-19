# SPENDWISE
webdev project 

## SIP calculator

The calculator on `money-upi.html` is implemented in `money-upi.js`. It converts the annual return percentage into a monthly rate (`annual return / 100 / 12`) and the investment duration into months (`years * 12`). For a monthly investment `P`, monthly rate `r`, and `n` months, it estimates the future value with `P * (((1 + r)^n - 1) / r) * (1 + r)`. The final factor assumes each monthly contribution is made at the beginning of the month. If the return is 0%, the calculator instead uses `P * n`. The amount invested is `P * n`, and estimated returns are future value minus amount invested.

## Saving transaction entries

Open `money-management.html` and add entries under **Your saved entries**. On `money-upi.html`, use **Save calculation** in the SIP calculator to save the entered monthly amount, expected return, duration, and calculated totals to the same entries. All entries are stored in the current browser and remain available after reloading the page. The three UPI transactions shown under **Reconciled UPI Streams** are included automatically. Select **Export JSON** or **Export all entries JSON** to download the shared data as `spendwise-entries.json`. Browser storage is local to this browser, so export a backup before clearing site data or switching devices.

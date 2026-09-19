document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('loan-form');
    const amountInput = document.getElementById('loan-amount');
    const interestInput = document.getElementById('loan-interest');
    const yearsInput = document.getElementById('loan-years');
    const errorBox = document.getElementById('form-error');

    const out = {
        principal: document.getElementById('principal'),
        rate: document.getElementById('annual-rate'),
        terms: document.getElementById('loan-terms'),
        monthly: document.getElementById('monthly-pay'),
        total: document.getElementById('total-pay'),
        interest: document.getElementById('total-interest'),
    };

    // Indian Rupee formatting: commas + exactly two decimals (e.g. ₹5,00,000.00)
    const inr = (value) =>
        '₹' + value.toLocaleString('en-IN', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        });

    const plain = (value) =>
        value.toLocaleString('en-IN', { maximumFractionDigits: 2 });

    function showError(message, badInput) {
        errorBox.textContent = message;
        [amountInput, interestInput, yearsInput].forEach((el) => el.classList.remove('invalid'));
        if (badInput) {
            badInput.classList.add('invalid');
            badInput.focus();
        }
    }

    function clearError() {
        showError('');
    }

    function resetResults() {
        out.principal.textContent = '₹0';
        out.rate.textContent = '0%';
        out.terms.textContent = '0 Years';
        out.monthly.textContent = '₹0';
        out.total.textContent = '₹0';
        out.interest.textContent = '₹0';
    }

    // Standard EMI formula: EMI = P × r × (1+r)^n / ((1+r)^n − 1)
    function calculateEmi(principal, annualRate, years) {
        const n = Math.round(years * 12);          // total monthly instalments
        const r = annualRate / 12 / 100;           // monthly interest rate

        if (r === 0) return { emi: principal / n, n };   // interest-free edge case

        const factor = Math.pow(1 + r, n);
        const emi = (principal * r * factor) / (factor - 1);
        return { emi, n };
    }

    form.addEventListener('submit', (event) => {
        event.preventDefault();

        const rawAmount = amountInput.value.trim();
        const rawInterest = interestInput.value.trim();
        const rawYears = yearsInput.value.trim();

        // ----- Validation -----
        if (rawAmount === '' || Number(rawAmount) <= 0) {
            return showError('Enter a loan amount greater than 0.', amountInput);
        }
        if (rawInterest === '' || Number(rawInterest) < 0) {
            return showError('Enter an interest rate of 0% or more.', interestInput);
        }
        if (rawYears === '' || Number(rawYears) <= 0) {
            return showError('Enter the years to pay as a number greater than 0.', yearsInput);
        }

        const principal = Number(rawAmount);
        const rate = Number(rawInterest);
        const years = Number(rawYears);

        if (Math.round(years * 12) < 1) {
            return showError('The repayment period must be at least 1 month.', yearsInput);
        }

        clearError();

        // ----- Calculation -----
        const { emi, n } = calculateEmi(principal, rate, years);
        const totalPayment = emi * n;
        const totalInterest = totalPayment - principal;

        // ----- Display -----
        out.principal.textContent = inr(principal);
        out.rate.textContent = plain(rate) + '%';
        out.terms.textContent = plain(years) + (years === 1 ? ' Year' : ' Years');
        out.monthly.textContent = inr(emi);
        out.total.textContent = inr(totalPayment);
        out.interest.textContent = inr(totalInterest);
    });

    form.addEventListener('reset', () => {
        clearError();
        resetResults();
    });
});

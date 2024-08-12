const form = document.getElementById('swap-form');
const fromCurrency = document.getElementById('from-currency');
const toCurrency = document.getElementById('to-currency');
const fromAmount = document.getElementById('from-amount');
const toAmount = document.getElementById('to-amount');
const contentArea = document.getElementById('content-area');
const navButtons = document.querySelectorAll('.nav-button');
const swapIcon = document.querySelector('.swap-icon');
const loadingIndicator = document.getElementById('loading');

// Mock exchange rates (replace with real API in production)
let exchangeRates = {
    btc_xmr: 150,
    xmr_btc: 1 / 150
};

async function fetchExchangeRates() {
    showLoading();
    try {
        const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,monero&vs_currencies=usd');
        const data = await response.json();
        exchangeRates.btc_xmr = data.bitcoin.usd / data.monero.usd; 
        exchangeRates.xmr_btc = data.monero.usd / data.bitcoin.usd;
    } catch (error) {
        console.error('Error fetching exchange rates:', error);
        alert('Failed to fetch exchange rates. Using mock rates.');
    } finally {
        hideLoading();
    }
}

function showLoading() {
    loadingIndicator.style.display = 'block';
}

function hideLoading() {
    loadingIndicator.style.display = 'none';
}

function updateEstimatedReceive() {
    const fromCurr = fromCurrency.value;
    const toCurr = toCurrency.value;
    const inputAmount = new BigNumber(fromAmount.value);

    if (fromCurr === toCurr) {
        toAmount.value = inputAmount.toFixed(8);
    } else {
        const rate = new BigNumber(exchangeRates[`${fromCurr}_${toCurr}`]);
        const result = inputAmount.times(rate);
        toAmount.value = result.toFixed(8);
    }
}

function swapCurrencies() {
    const tempCurrency = fromCurrency.value;
    fromCurrency.value = toCurrency.value;
    toCurrency.value = tempCurrency;

    const tempAmount = fromAmount.value;
    fromAmount.value = toAmount.value;
    toAmount.value = tempAmount;

    updateEstimatedReceive();
}

fromCurrency.addEventListener('change', updateEstimatedReceive);
toCurrency.addEventListener('change', updateEstimatedReceive);
fromAmount.addEventListener('input', updateEstimatedReceive);

swapIcon.addEventListener('click', swapCurrencies);

form.addEventListener('submit', (e) => {
    e.preventDefault();
    if (parseFloat(fromAmount.value) <= 0) {
        alert('Please enter a valid amount to swap.');
        return;
    }
    alert('Swap initiated! In a real implementation, this would connect to the atomic swap protocol.');
});

// Navigation functionality
navButtons.forEach(button => {
    button.addEventListener('click', () => {
        navButtons.forEach(btn => btn.classList.remove('active'));
        button.classList.add('active');
        const view = button.getAttribute('data-view');
        updateContent(view);
    });
});

// Function to update content based on the selected view
function updateContent(view) {
    let content = '';
    switch(view) {
        case 'dashboard':
            content = `
                <h2>Dashboard</h2>
                <p>Welcome to your AtomicSwap dashboard. Here you can view your account overview and recent activity.</p>
            `;
            break;
        case 'wallet':
            content = `
                <h2>Wallet</h2>
                <p>Manage your BTC and XMR balances here. You can deposit, withdraw, and view your transaction history.</p>
            `;
            break;
        case 'history':
            content = `
                <h2>Transaction History</h2>
                <p>View your past swaps and transactions here.</p>
            `;
            break;
        case 'home':
        default:
            // Load the main content directly from the index.html
            content = `
                <div class="welcome-message">
                    <h2>Welcome to AtomicSwap</h2>
                    <p>AtomicSwap is a secure and decentralized platform for exchanging Bitcoin (BTC) and Monero (XMR) without intermediaries. Our atomic swap technology ensures that your trades are safe, private, and efficient.</p>
                    <h3>Features:</h3>
                    <ul class="features-list">
                        <li>Trustless exchanges between BTC and XMR</li>
                        <li>No registration required</li>
                        <li>Low fees</li>
                        <li>Enhanced privacy</li>
                    </ul>
                    <p>Get started by using the Swap interface below or check your Dashboard for an overview of your account.</p>
                </div>
                <div id="swap-interface" class="exchange-form">
                    <form id="swap-form">
                        <div class="form-row">
                            <div class="form-column">
                                <div class="form-group">
                                    <label for="from-currency">From:</label>
                                    <select id="from-currency">
                                        <option value="btc">Bitcoin (BTC)</option>
                                        <option value="xmr">Monero (XMR)</option>
                                    </select>
                                </div>
                                <div class="form-group">
                                    <label for="from-amount">Amount:</label>
                                    <input type="number" id="from-amount" step="0.00000001" min="0" required>
                                </div>
                            </div>
                            <div class="form-column">
                                <div class="form-group">
                                    <label for="to-currency">To:</label>
                                    <select id="to-currency">
                                        <option value="xmr">Monero (XMR)</option>
                                        <option value="btc">Bitcoin (BTC)</option>
                                    </select>
                                </div>
                                <div class="form-group">
                                    <label for="to-amount">Estimated to receive:</label>
                                    <input type="number" id="to-amount" readonly>
                                </div>
                            </div>
                        </div>
                        <div class="swap-icon">⇄</div>
                        <div class="center-button">
                            <button type="submit">Initiate Swap</button>
                        </div>
                    </form>
                </div>
            `;
            break;
    }
    contentArea.innerHTML = content;

    // Reinitialize event listeners for the swap icon and form if needed
    if (view === 'home') {
        document.querySelector('#swap-interface .swap-icon').addEventListener('click', swapCurrencies);
        document.getElementById('swap-form').addEventListener('submit', (e) => {
            e.preventDefault();
            alert('Swap initiated! In a real implementation, this would connect to the atomic swap protocol.');
        });
        fromCurrency.addEventListener('change', updateEstimatedReceive);
        toCurrency.addEventListener('change', updateEstimatedReceive);
        fromAmount.addEventListener('input', updateEstimatedReceive);
    }
}

// Initialize estimated receive and fetch exchange rates
fetchExchangeRates();
updateEstimatedReceive();


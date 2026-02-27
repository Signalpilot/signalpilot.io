"""
Quantitative primitives — formulas from the reference sheet.

Every formula is a pure function with no side effects and no external dependencies.
Strategies import what they need. Nothing here talks to APIs or manages state.
"""
import math

# ── Section 1: Core Probability (#01, #04, #05, #10) ─────────────

def log_odds(p: float) -> float:
    """#10 — Log-Odds Transform: logit(p) = ln(p / (1-p))
    Maps probability [0,1] → real line [-inf, +inf].
    Useful for comparing edges across different price levels.
    """
    p = max(1e-9, min(1 - 1e-9, p))
    return math.log(p / (1 - p))


def inv_log_odds(logit: float) -> float:
    """Inverse of #10 — convert log-odds back to probability."""
    return 1.0 / (1.0 + math.exp(-logit))


def shannon_entropy(probs: list[float]) -> float:
    """#05 — Shannon Entropy: H = -Σ p_i × log(p_i)
    Measures uncertainty in a probability distribution.
    Higher = more uncertain. Max for binary = 1.0 (at p=0.5).
    """
    h = 0.0
    for p in probs:
        if p > 0:
            h -= p * math.log2(p)
    return h


def bayes_update(prior: float, likelihood_ratio: float) -> float:
    """#01 — Bayes' Theorem in odds form.
    posterior_odds = prior_odds × likelihood_ratio
    """
    prior_odds = prior / (1 - prior) if prior < 1 else 1e9
    posterior_odds = prior_odds * likelihood_ratio
    return posterior_odds / (1 + posterior_odds)


# ── Section 2: Edge & Position Sizing (#02, #03, #11, #38) ───────

def expected_value(p_win: float, profit: float, loss: float) -> float:
    """#02 — Expected Value: EV = P_win × Profit - P_loss × Loss"""
    return p_win * profit - (1 - p_win) * loss


def kelly_fraction(p_win: float, odds: float) -> float:
    """#03 — Kelly Criterion: f* = (p × b - q) / b
    p = probability of winning
    b = net odds (e.g. for 2:1 payout, b = 2.0)
    Returns optimal fraction of bankroll to bet.
    """
    q = 1 - p_win
    f = (p_win * odds - q) / odds
    return max(0.0, f)


def empirical_kelly(kelly_f: float, edge_mean: float, edge_std: float) -> float:
    """#11 — Empirical Kelly: f_empirical = f_kelly × (1 - CV_edge)
    CV_edge = σ_edge / μ_edge (coefficient of variation)
    Shrinks Kelly by how noisy your edge estimate is.
    """
    if edge_mean <= 0 or edge_std <= 0:
        return 0.0
    cv = edge_std / edge_mean
    return kelly_f * max(0.0, 1.0 - cv)


def half_kelly(p_win: float, odds: float) -> float:
    """Half-Kelly — industry standard conservative sizing.
    Full Kelly is mathematically optimal but max drawdown is brutal.
    Half-Kelly cuts expected return ~25% but drawdown ~50%.
    """
    return kelly_fraction(p_win, odds) * 0.5


def kelly_for_arb(net_profit_per_share: float, cost_per_share: float,
                  p_both_fill: float = 0.90, p_partial: float = 0.08,
                  slippage_unwind: float = 0.02) -> float:
    """Kelly for arb — multi-outcome model since classic Kelly doesn't apply.

    Classic Kelly assumes binary win/loss, but arb has three outcomes:
    1. Both legs fill (p=0.90) → profit = net_profit_per_share
    2. One leg fills, other doesn't (p=0.08) → loss = slippage to unwind
    3. Neither fills (p=0.02) → loss = 0

    Uses generalized Kelly: f* = EV / variance (then half it).
    Returns fraction of capital to allocate.
    """
    if cost_per_share <= 0 or net_profit_per_share <= 0:
        return 0.0

    ev = (p_both_fill * net_profit_per_share
          - p_partial * slippage_unwind)

    if ev <= 0:
        return 0.0

    variance = (p_both_fill * net_profit_per_share ** 2
                + p_partial * slippage_unwind ** 2
                - ev ** 2)

    if variance <= 0:
        return 0.0

    # Generalized Kelly, then half it for safety
    f = (ev / variance) * 0.5
    # Cap at 25% of capital — even good arbs shouldn't take the whole bankroll
    return min(f, 0.25)


def kelly_for_directional(p_win: float, entry_price: float, fee: float) -> float:
    """Kelly for directional trades (latency arb, MM fills).
    Payout is $1.00 on win, $0.00 on loss (binary market).
    """
    if entry_price <= 0 or entry_price >= 1:
        return 0.0
    cost = entry_price + fee
    profit_if_win = 1.0 - cost
    if profit_if_win <= 0:
        return 0.0
    odds = profit_if_win / cost
    return half_kelly(p_win, odds)


def max_drawdown(equity_curve: list[float]) -> float:
    """#38 — Maximum Drawdown: MDD = max_t (peak_t - equity_t) / peak_t"""
    if len(equity_curve) < 2:
        return 0.0
    peak = equity_curve[0]
    mdd = 0.0
    for eq in equity_curve:
        if eq > peak:
            peak = eq
        dd = (peak - eq) / peak if peak > 0 else 0
        if dd > mdd:
            mdd = dd
    return mdd


# ── Section 3: Arbitrage Detection (#06, #12, #39, #40, #41) ─────

def arb_invariant_violation(yes_price: float, no_price: float,
                            fee_yes: float = 0.0, fee_no: float = 0.0) -> float:
    """#06 — Arbitrage Invariant: P(YES) + P(NO) = $1.00
    Returns: positive number = profit per share, negative = no arb.
    """
    return 1.0 - yes_price - no_price - fee_yes - fee_no


def vpin(buy_volume: float, sell_volume: float) -> float:
    """#12 — Volume-Synchronized Probability of Informed Trading.
    VPIN = |V_buy - V_sell| / (V_buy + V_sell)

    High VPIN (>0.7) = toxic flow. Widen spreads or pull quotes.
    Low VPIN (<0.3) = safe to provide liquidity.
    """
    total = buy_volume + sell_volume
    if total == 0:
        return 0.0
    return abs(buy_volume - sell_volume) / total


def calibration_error(predicted_prob: float, empirical_freq: float) -> float:
    """#41 — Mispricing Function: M(p,t) = C(p,t) - p/100
    Positive M = market underpriced (buy)
    Negative M = market overpriced (sell/short)
    """
    return empirical_freq - predicted_prob


# ── Section 4: Market Making (#08, #09) ──────────────────────────

def avellaneda_stoikov_reservation(
    mid: float, inventory: float, gamma: float,
    sigma: float, time_remaining: float,
) -> float:
    """#08 — Avellaneda-Stoikov Reservation Price.
    z = s - q × γ × σ² × (T - t)

    s = midpoint
    q = inventory (positive = long, negative = short)
    γ = risk aversion parameter (higher = more conservative)
    σ = volatility of the asset
    T - t = time remaining until end of session
    """
    return mid - inventory * gamma * sigma * sigma * time_remaining


def avellaneda_stoikov_spread(
    gamma: float, sigma: float, time_remaining: float, kappa: float,
) -> float:
    """#09 — Avellaneda-Stoikov Optimal Spread.
    δ = γσ²(T-t) + (2/γ) × ln(1 + γ/κ)

    γ = risk aversion
    σ = volatility
    T - t = time remaining
    κ = order arrival intensity (higher = more frequent fills)
    """
    if gamma <= 0 or kappa <= 0:
        return 0.04  # Fallback to 4-cent spread
    variance_term = gamma * sigma * sigma * time_remaining
    intensity_term = (2.0 / gamma) * math.log(1.0 + gamma / kappa)
    return variance_term + intensity_term


def as_bid_ask(
    mid: float, inventory: float, gamma: float,
    sigma: float, time_remaining: float, kappa: float,
) -> tuple[float, float]:
    """Convenience: compute A-S bid and ask prices in one call."""
    reservation = avellaneda_stoikov_reservation(
        mid, inventory, gamma, sigma, time_remaining)
    spread = avellaneda_stoikov_spread(gamma, sigma, time_remaining, kappa)
    half_spread = spread / 2.0
    bid = round(max(0.01, reservation - half_spread), 4)
    ask = round(min(0.99, reservation + half_spread), 4)
    return bid, ask


def estimate_sigma(price_samples: list[float]) -> float:
    """Estimate volatility from recent price samples (standard deviation of returns)."""
    if len(price_samples) < 5:
        return 0.02  # Default volatility
    returns = []
    for i in range(1, len(price_samples)):
        if price_samples[i - 1] > 0:
            returns.append(
                (price_samples[i] - price_samples[i - 1]) / price_samples[i - 1]
            )
    if not returns:
        return 0.02
    mean_r = sum(returns) / len(returns)
    var = sum((r - mean_r) ** 2 for r in returns) / len(returns)
    return max(0.001, math.sqrt(var))


# ── Section 6: Backtesting Validation (#15, #16, #17, #18) ───────

def sharpe_ratio(returns: list[float], risk_free: float = 0.0) -> float:
    """Annualized Sharpe Ratio from a list of per-trade returns."""
    if len(returns) < 2:
        return 0.0
    mean_r = sum(returns) / len(returns) - risk_free
    var = sum((r - mean_r - risk_free) ** 2 for r in returns) / (len(returns) - 1)
    std = math.sqrt(var) if var > 0 else 1e-9
    return mean_r / std


def sharpe_std_error(sr: float, n: int) -> float:
    """#15 — Standard Error of Sharpe Ratio: SE(SR) = √((1 + SR²/2) / n)"""
    if n <= 0:
        return float("inf")
    return math.sqrt((1.0 + sr * sr / 2.0) / n)


def probabilistic_sharpe_ratio(
    sr_observed: float, sr_benchmark: float, n: int,
    skewness: float = 0.0, kurtosis: float = 3.0,
) -> float:
    """#16 — Probabilistic Sharpe Ratio.
    PSR[SR*] = Φ[(SR - SR*) × √(T-1) / √(1 - γ₃·SR + (γ₄-1)/4 × SR²)]

    Returns probability that the true SR exceeds the benchmark.
    > 0.95 means your strategy is statistically significant.
    """
    if n <= 1:
        return 0.5
    excess_kurtosis = kurtosis - 3.0
    denominator = 1.0 - skewness * sr_observed + (excess_kurtosis / 4.0) * sr_observed ** 2
    if denominator <= 0:
        denominator = 1e-9
    z = (sr_observed - sr_benchmark) * math.sqrt(n - 1) / math.sqrt(denominator)
    return _norm_cdf(z)


def deflated_sharpe_ratio(
    sr_observed: float, sr_zero: float, n: int,
    skewness: float = 0.0, kurtosis: float = 3.0,
) -> float:
    """#17 — Deflated Sharpe Ratio — adjusts for multiple testing.
    sr_zero = expected max SR under null hypothesis (from number of trials).
    """
    return probabilistic_sharpe_ratio(sr_observed, sr_zero, n, skewness, kurtosis)


def expected_max_sr(num_trials: int, n_returns: int) -> float:
    """Expected maximum Sharpe Ratio under the null (all strategies are random).
    Used as sr_zero in Deflated Sharpe Ratio.
    E[max SR] ≈ √(2 × ln(num_trials)) - [γ + ln(ln(num_trials))] / [2 × √(2 × ln(num_trials))]
    where γ ≈ 0.5772 (Euler-Mascheroni constant).
    """
    if num_trials <= 1:
        return 0.0
    euler = 0.5772156649
    log_k = math.log(num_trials)
    sqrt_term = math.sqrt(2.0 * log_k)
    if sqrt_term == 0:
        return 0.0
    correction = (euler + math.log(log_k)) / (2.0 * sqrt_term)
    return (sqrt_term - correction) * sharpe_std_error(0, n_returns)


def walk_forward_efficiency(is_performance: float, oos_performance: float) -> float:
    """#14 — Walk-Forward Efficiency: WFE = OOS / IS.
    Healthy: 0.5 to 1.0. Below 0.3 = likely overfit.
    """
    if is_performance == 0:
        return 0.0
    return oos_performance / is_performance


# ── Internal helpers ─────────────────────────────────────────────

def _norm_cdf(x: float) -> float:
    """Standard normal CDF approximation (Abramowitz and Stegun)."""
    return 0.5 * (1.0 + math.erf(x / math.sqrt(2.0)))


# ── Section 4b: Naive Bayes Signal Model (#04) ───────────────────

def naive_bayes_posterior(
    prior_up: float,
    features: list[float],
    likelihoods_up: list[tuple[float, float]],
    likelihoods_down: list[tuple[float, float]],
) -> float:
    """#04 — Naive Bayes: P(UP | features) ∝ P(UP) × ∏ P(feature_i | UP)

    For continuous features, models each as Gaussian with (mean, std).
    likelihoods_up[i] = (mean_when_UP, std_when_UP)
    likelihoods_down[i] = (mean_when_DOWN, std_when_DOWN)

    Returns posterior probability of UP.
    """
    log_prob_up = math.log(max(prior_up, 1e-9))
    log_prob_down = math.log(max(1 - prior_up, 1e-9))

    for feat, (mu_up, std_up), (mu_down, std_down) in zip(
        features, likelihoods_up, likelihoods_down
    ):
        log_prob_up += _log_gaussian(feat, mu_up, std_up)
        log_prob_down += _log_gaussian(feat, mu_down, std_down)

    # Log-sum-exp for numerical stability
    max_log = max(log_prob_up, log_prob_down)
    prob_up = math.exp(log_prob_up - max_log)
    prob_down = math.exp(log_prob_down - max_log)
    total = prob_up + prob_down
    return prob_up / total if total > 0 else 0.5


def _log_gaussian(x: float, mu: float, sigma: float) -> float:
    """Log of Gaussian PDF. Avoids underflow."""
    sigma = max(sigma, 1e-9)
    return -0.5 * math.log(2 * math.pi * sigma * sigma) - (x - mu) ** 2 / (2 * sigma * sigma)


# ── Section 7: Factor / Black-Litterman (#19, #22-#25) ──────────

def bl_equilibrium_returns(
    risk_aversion: float,
    cov_matrix: list[list[float]],
    market_weights: list[float],
) -> list[float]:
    """#22 — Black-Litterman Equilibrium Returns: Π = δ × Σ × w_mkt

    δ = risk aversion (typically 2.5 for equities, higher for prediction markets)
    Σ = covariance matrix (N×N)
    w_mkt = market cap weights (N×1)

    Returns implied equilibrium returns (N×1).
    """
    n = len(market_weights)
    pi = [0.0] * n
    for i in range(n):
        for j in range(n):
            pi[i] += risk_aversion * cov_matrix[i][j] * market_weights[j]
    return pi


def bl_posterior(
    equilibrium: list[float],
    tau: float,
    cov_matrix: list[list[float]],
    views: list[float],
    view_matrix: list[list[float]],
    omega: list[list[float]],
) -> list[float]:
    """#25 — Black-Litterman Posterior Mean (simplified for diagonal Ω).

    equilibrium = Π (implied returns from #22)
    tau = uncertainty scalar (typically 0.05)
    cov_matrix = Σ (N×N asset covariance)
    views = Q (K×1 investor views on returns)
    view_matrix = P (K×N picking matrix)
    omega = Ω (K×K view uncertainty, diagonal)

    Returns posterior expected returns (N×1).

    Full formula: μ_post = [(τΣ)^-1 + P'Ω^-1P]^-1 × [(τΣ)^-1Π + P'Ω^-1Q]

    For simplicity, this uses the equivalent closed-form:
    μ_post = Π + τΣP'(τPΣP' + Ω)^-1(Q - PΠ)
    """
    n = len(equilibrium)
    k = len(views)

    # τΣP' (N×K)
    tau_sigma_pt = [[0.0] * k for _ in range(n)]
    for i in range(n):
        for j in range(k):
            for l in range(n):
                tau_sigma_pt[i][j] += tau * cov_matrix[i][l] * view_matrix[j][l]

    # PτΣP' + Ω (K×K)
    middle = [[0.0] * k for _ in range(k)]
    for i in range(k):
        for j in range(k):
            for l in range(n):
                middle[i][j] += view_matrix[i][l] * tau_sigma_pt[l][j]
            middle[i][j] += omega[i][j]

    # Invert middle (K×K) — for small K use analytic formula
    if k == 1:
        inv_middle = [[1.0 / middle[0][0]]] if middle[0][0] != 0 else [[0.0]]
    elif k == 2:
        inv_middle = _invert_2x2(middle)
    else:
        inv_middle = _invert_nxn(middle)

    # Q - PΠ (K×1)
    q_minus_p_pi = [0.0] * k
    for i in range(k):
        p_pi = sum(view_matrix[i][j] * equilibrium[j] for j in range(n))
        q_minus_p_pi[i] = views[i] - p_pi

    # inv_middle × (Q - PΠ) (K×1)
    inv_times_diff = [0.0] * k
    for i in range(k):
        for j in range(k):
            inv_times_diff[i] += inv_middle[i][j] * q_minus_p_pi[j]

    # Final: Π + τΣP' × inv_middle × (Q-PΠ)
    posterior = list(equilibrium)
    for i in range(n):
        for j in range(k):
            posterior[i] += tau_sigma_pt[i][j] * inv_times_diff[j]

    return posterior


def bl_allocate(
    posterior_returns: list[float],
    cov_matrix: list[list[float]],
    risk_aversion: float,
    total_capital: float,
) -> list[float]:
    """Compute optimal allocation from B-L posterior returns.
    w* = (δΣ)^-1 × μ_post

    Returns dollar allocation per asset.
    """
    n = len(posterior_returns)
    # Invert δΣ
    scaled_cov = [[risk_aversion * cov_matrix[i][j] for j in range(n)] for i in range(n)]
    inv_cov = _invert_nxn(scaled_cov)

    weights = [0.0] * n
    for i in range(n):
        for j in range(n):
            weights[i] += inv_cov[i][j] * posterior_returns[j]

    # Normalize to sum to 1, then scale by capital
    total_w = sum(abs(w) for w in weights)
    if total_w > 0:
        weights = [w / total_w for w in weights]

    return [w * total_capital for w in weights]


# ── Section 5: Walk-Forward Validation (#13, #14, #18) ───────────

def walk_forward_splits(
    n_samples: int,
    in_sample_size: int,
    out_of_sample_size: int,
) -> list[tuple[tuple[int, int], tuple[int, int]]]:
    """#13 — Walk-Forward Steps: K = ⌊(T - W_IS) / W_OOS⌋

    Returns list of (is_range, oos_range) index tuples.
    Each tuple is (start_idx, end_idx).
    """
    splits = []
    start = 0
    while start + in_sample_size + out_of_sample_size <= n_samples:
        is_start = start
        is_end = start + in_sample_size
        oos_start = is_end
        oos_end = is_end + out_of_sample_size
        splits.append(((is_start, is_end), (oos_start, oos_end)))
        start += out_of_sample_size
    return splits


def probability_of_backtest_overfitting(
    is_sharpes: list[float],
    oos_sharpes: list[float],
) -> float:
    """#18 — Probability of Backtest Overfitting (simplified).
    PBO = fraction of configurations where best IS performer has negative OOS.

    is_sharpes[i] = in-sample Sharpe for configuration i
    oos_sharpes[i] = out-of-sample Sharpe for same configuration

    Higher PBO = more overfit. PBO > 0.5 = likely overfit.
    """
    if not is_sharpes or len(is_sharpes) != len(oos_sharpes):
        return 0.0

    best_is_idx = max(range(len(is_sharpes)), key=lambda i: is_sharpes[i])
    # Rank-based: count how many times the best IS rank has negative OOS
    # With single run, simplify to: did the best IS strategy have positive OOS?
    if oos_sharpes[best_is_idx] <= 0:
        return 1.0
    return 0.0


# ── Matrix helpers (pure Python, no numpy) ───────────────────────

def _invert_2x2(m: list[list[float]]) -> list[list[float]]:
    det = m[0][0] * m[1][1] - m[0][1] * m[1][0]
    if abs(det) < 1e-12:
        return [[0.0, 0.0], [0.0, 0.0]]
    inv_det = 1.0 / det
    return [
        [m[1][1] * inv_det, -m[0][1] * inv_det],
        [-m[1][0] * inv_det, m[0][0] * inv_det],
    ]


def _invert_nxn(matrix: list[list[float]]) -> list[list[float]]:
    """Gauss-Jordan inversion for small matrices."""
    n = len(matrix)
    # Augmented matrix [A | I]
    aug = [row[:] + [1.0 if i == j else 0.0 for j in range(n)] for i, row in enumerate(matrix)]

    for col in range(n):
        # Find pivot
        max_row = col
        for row in range(col + 1, n):
            if abs(aug[row][col]) > abs(aug[max_row][col]):
                max_row = row
        aug[col], aug[max_row] = aug[max_row], aug[col]

        pivot = aug[col][col]
        if abs(pivot) < 1e-12:
            continue

        for j in range(2 * n):
            aug[col][j] /= pivot

        for row in range(n):
            if row == col:
                continue
            factor = aug[row][col]
            for j in range(2 * n):
                aug[row][j] -= factor * aug[col][j]

    return [row[n:] for row in aug]


# ── Section 8: Frank-Wolfe / Bregman Arbitrage (#28-#34, #50, #51) ─

def negrisk_bregman_arb(
    prices: list[float],
    fees: list[float] | None = None,
) -> dict:
    """#29, #34 — Closed-form Bregman projection for NegRisk (mutually exclusive) markets.

    For events where exactly one outcome pays $1.00:
    - Marginal polytope = probability simplex {mu >= 0, sum = 1}
    - KL projection = normalization: mu*_i = theta_i / sum(theta)
    - D_KL(mu* || theta) = -ln(sum(theta)) = ln(1/S)
    - Dollar profit per share set = 1 - S - fees

    Returns dict with projection, divergence, profit, and trade direction.
    """
    n = len(prices)
    if fees is None:
        fees = [0.0] * n

    s = sum(prices)
    total_fees = sum(fees)

    if s <= 0:
        return {"has_arb": False, "reason": "all prices zero"}

    mu_star = [p / s for p in prices]
    kl_divergence = -math.log(s) if 0 < s < 1 else 0.0
    dollar_profit = 1.0 - s - total_fees

    return {
        "has_arb": dollar_profit > 0,
        "mu_star": mu_star,
        "sum_prices": s,
        "kl_divergence": max(0.0, kl_divergence),
        "dollar_profit_per_set": dollar_profit,
        "total_fees": total_fees,
        "trade": "BUY_ALL" if dollar_profit > 0 else "NONE",
        "n_outcomes": n,
    }


def frank_wolfe_bregman_project(
    theta: list[float],
    constraints: list[tuple[list[int], float]],
    max_iter: int = 100,
    tol: float = 1e-6,
) -> dict:
    """#28-#33 — Frank-Wolfe Bregman projection for combinatorial constraints.

    For cross-market arbitrage where outcomes have logical dependencies
    (e.g., "Trump wins primary" implies "Trump wins election"):
    the marginal polytope has constraints beyond the simplex.

    Each constraint is (indices, upper_bound):
      sum(mu[i] for i in indices) <= upper_bound

    Returns projected mu*, KL divergence, convergence info.
    """
    n = len(theta)
    mu = [1.0 / n] * n
    theta_safe = [max(p, 1e-10) for p in theta]
    gap = float("inf")

    for t in range(max_iter):
        # Gradient of D_KL(mu || theta) w.r.t. mu
        grad = [math.log(max(mu[i], 1e-10) / theta_safe[i]) + 1.0 for i in range(n)]

        # LMO: find feasible vertex minimizing <grad, v>
        vertex = _fw_lmo(grad, n, constraints)

        # Duality gap
        gap = sum(grad[i] * (mu[i] - vertex[i]) for i in range(n))
        if gap < tol:
            break

        # Step size via line search
        gamma = _fw_kl_line_search(mu, vertex, theta_safe, n)

        # Update
        mu = [(1 - gamma) * mu[i] + gamma * vertex[i] for i in range(n)]

    kl_div = sum(
        mu[i] * math.log(max(mu[i], 1e-10) / theta_safe[i])
        for i in range(n) if mu[i] > 1e-10
    )

    return {
        "mu_star": mu,
        "kl_divergence": kl_div,
        "duality_gap": gap,
        "iterations": t + 1 if 't' in dir() else 0,
        "converged": gap < tol,
    }


def alpha_extraction_condition(
    kl_divergence: float, total_fees: float, slippage_estimate: float = 0.002,
) -> bool:
    """#50 — Alpha-extraction condition: D_KL(mu* || theta) > fees + slippage."""
    return kl_divergence > total_fees + slippage_estimate


def near_arbitrage_free(kl_divergence: float, epsilon: float = 0.005) -> bool:
    """#51 — Near-arbitrage-free condition: D_KL < epsilon means market is efficient."""
    return kl_divergence < epsilon


def _fw_lmo(
    grad: list[float], n: int, constraints: list[tuple[list[int], float]],
) -> list[float]:
    """Linear minimization oracle over the constrained polytope."""
    # Try each unit vector and pick the feasible one with lowest cost
    best_cost = float("inf")
    best_vertex = [1.0 / n] * n

    for j in range(n):
        v = [0.0] * n
        v[j] = 1.0
        feasible = True
        for indices, bound in constraints:
            if sum(v[i] for i in indices) > bound + 1e-9:
                feasible = False
                break
        if feasible:
            cost = sum(grad[i] * v[i] for i in range(n))
            if cost < best_cost:
                best_cost = cost
                best_vertex = v[:]

    return best_vertex


def _fw_kl_line_search(
    mu: list[float], vertex: list[float], theta: list[float], n: int, steps: int = 20,
) -> float:
    """Approximate line search for KL divergence minimization."""
    best_gamma = 0.0
    best_kl = float("inf")

    for s in range(steps + 1):
        gamma = s / steps
        trial = [(1 - gamma) * mu[i] + gamma * vertex[i] for i in range(n)]
        kl = sum(
            trial[i] * math.log(max(trial[i], 1e-10) / theta[i])
            for i in range(n) if trial[i] > 1e-10
        )
        if kl < best_kl:
            best_kl = kl
            best_gamma = gamma

    return best_gamma

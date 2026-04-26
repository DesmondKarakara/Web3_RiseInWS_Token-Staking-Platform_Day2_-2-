# 🧪 Testing & Verification Guide

## Pre-Deployment Testing Checklist

Use this checklist to verify everything works before deploying to production.

## Phase 1: Environment Setup Verification

### Prerequisites Check
```bash
# Verify Node.js version
node --version  # Should be 18+

# Verify npm is installed
npm --version

# Verify Freighter is installed
# - Check browser extensions
# - Should show Freighter extension

# Verify testnet setup
# - Open Freighter
# - Switch to TESTNET
# - Have at least 10 XLM in account
```

### Dependencies Installation
```bash
cd client
npm install

# Verify installation
npm list | head -20

# Check critical dependencies
npm list @stellar/stellar-sdk
npm list @stellar/freighter-api
```

## Phase 2: Local Development Testing

### Start Dev Server
```bash
cd client
npm run dev

# Should see:
# ✓ Ready in 3.2s
# - Local: http://localhost:3000

# Open browser and verify:
# - Page loads without errors
# - No console errors
# - UI is responsive
```

### Test Wallet Connection
```
1. Open http://localhost:3000
2. Click "Connect Wallet" button
3. Freighter popup should appear
4. Approve access
5. Wallet address should display in navbar
6. Should show truncated address format
```

### Test Data Loading
```
1. After connecting wallet
2. Go to "Stats" tab
3. Should see:
   - Your staking position
   - Global platform stats
   - APY percentage
4. Click "Refresh Data"
5. Data should update
```

## Phase 3: Contract Interaction Testing

### Test Staking (With Sufficient Balance)

```
Prerequisites:
- Have 20+ XLM in testnet account
- Have 50+ tokens in wallet
- Contract is initialized
- User has approved contract to spend tokens

Steps:
1. Go to "Stake" tab
2. Enter amount: 10
3. Click "Stake Tokens"
4. Freighter popup appears
5. Click "Approve" in Freighter
6. Should see "Awaiting signature..." message
7. Wait for confirmation
8. Should see success message
9. Go to Stats tab
10. Verify "Your Position" shows staked amount

Expected Results:
✓ Transaction hash displays
✓ Success notification appears
✓ Wallet balance decreases
✓ Staked position increases
✓ No console errors
```

### Test Reward Accrual

```
Prerequisites:
- Have active stake
- Reward rate is set properly

Steps:
1. Record current pending rewards
2. Wait 30 seconds
3. Click "Refresh Data"
4. Pending rewards should increase
5. Repeat 2-3 times

Expected Results:
✓ Rewards increase with each refresh
✓ Rate is consistent
✓ Calculations are accurate
```

### Test Claim Rewards

```
Prerequisites:
- Have pending rewards > 0

Steps:
1. Go to "Rewards" tab
2. Click "Claim Rewards"
3. Sign in Freighter
4. Wait for confirmation
5. Go to Stats tab
6. Check pending rewards = 0

Expected Results:
✓ Pending rewards transferred
✓ Wallet balance increases
✓ Success notification shows
```

### Test Compound Staking

```
Prerequisites:
- Have pending rewards > 0
- Have extra tokens to stake

Steps:
1. Go to "Rewards" tab
2. Enter extra amount: 5
3. Click "Compound"
4. Sign in Freighter
5. Wait for confirmation
6. Check stats

Expected Results:
✓ Staked amount increases by (pending_rewards + extra)
✓ Pending rewards reset to 0
✓ Transaction confirms
```

### Test Unstaking

```
Prerequisites:
- Have staked amount > amount to unstake

Steps:
1. Go to "Unstake" tab
2. Enter amount: 5
3. Click "Unstake Tokens"
4. Sign in Freighter
5. Wait for confirmation
6. Check stats

Expected Results:
✓ Staked amount decreases
✓ Wallet receives (staked + pending_rewards)
✓ Success notification shows
```

## Phase 4: Error Handling Testing

### Test Invalid Inputs
```
Test Case: Invalid Amount
1. Go to "Stake" tab
2. Enter: "abc"
3. Should see error message
4. Button should be disabled

Test Case: Amount Too Large
1. Enter: "99999999"
2. Should see error message
3. Verify against max available

Test Case: Zero Amount
1. Enter: "0"
2. Should see error message
3. Button should be disabled

Test Case: Too Many Decimals
1. Enter: "10.12345678"
2. Should see error message
3. Note max precision
```

### Test Transaction Failures
```
Test Case: Insufficient Balance
1. Enter amount > wallet balance
2. Click stake
3. Should see clear error message
4. Transaction should not submit

Test Case: Insufficient Stake
1. Try to unstake more than staked
2. Should see error
3. Suggest maximum amount

Test Case: Network Error (simulate)
1. Disconnect internet
2. Try to refresh data
3. Should show "Network error"
4. Offer retry button
```

### Test Signature Rejection
```
1. Click "Stake Tokens"
2. In Freighter popup, click "Decline"
3. Should show message about rejection
4. App should return to normal state
5. Should be able to retry
```

## Phase 5: UI/UX Testing

### Responsive Design
```
Test on different screen sizes:
- Mobile (375px): ✓ Readable, buttons clickable
- Tablet (768px): ✓ Proper spacing
- Desktop (1024px+): ✓ Full layout

Test orientation:
- Portrait: ✓ Works well
- Landscape: ✓ Works well
```

### Loading States
```
1. Click any action button
2. Button should show loading spinner
3. Button should be disabled
4. Should not allow multiple clicks
5. After completion, state resets
```

### Animations
```
1. Check fade-in animations on load
2. Check button shimmer effect
3. Check card hover effects
4. Check notification slide-in
5. Verify smooth transitions
```

### Accessibility
```
1. Tab through all buttons
2. All interactive elements should be reachable
3. Links should have visible focus state
4. Error messages should be clear
5. Color contrast should be adequate
```

## Phase 6: Data Accuracy Testing

### Calculation Verification
```
Test Case: Amount Conversion
- User input: 10 tokens
- Contract amount: 100000000 (10 * 10^7)
- Display: Should show 10.0000

Test Case: APY Calculation
- Reward rate: 1000000 (0.000001/sec)
- Total staked: 1000000000 (100 tokens)
- Expected APY: ~31.5%
- Actual: Should be within 0.1%

Test Case: Reward Accumulation
- Staked: 10 tokens
- Reward rate: 1000000/sec
- After 60 seconds: Should earn ~0.06 tokens
- Tolerance: ±0.01 tokens
```

### Amount Precision
```
1. Stake 1.1111111 tokens
2. Display should show exactly: 1.1111111
3. Claim rewards: should preserve precision
4. Unstake: should calculate correctly
5. No rounding errors
```

## Phase 7: Performance Testing

### Load Time
```
- Initial page load: < 3 seconds
- Wallet connection: < 2 seconds
- Data refresh: < 5 seconds
- Transaction submission: < 10 seconds
```

### Memory Usage
```
1. Open DevTools → Performance tab
2. Check memory during:
   - Page load
   - Data refresh (10 times)
   - Transaction submission
3. No memory leaks (memory should stabilize)
```

### Network Requests
```
1. Open DevTools → Network tab
2. Load page
3. Should see:
   - RPC calls to soroban-testnet.stellar.org
   - No failed requests (404, 500)
   - Reasonable response times
```

## Phase 8: Security Testing

### Sensitive Data
```
✓ No private keys in localStorage
✓ No mnemonic phrases in state
✓ No unencrypted sensitive data
✓ Wallet address only (public)
```

### Input Validation
```
✓ All user inputs validated
✓ XSS protection (React escaping)
✓ No SQL injection possible
✓ No contract injection
```

### Transaction Verification
```
✓ User sees transaction details
✓ User signs in Freighter (not in-app)
✓ Transaction is immutable after signing
✓ No way to modify submitted transaction
```

## Phase 9: Cross-Browser Testing

### Chrome
```
✓ Page loads
✓ Freighter connects
✓ Transactions submit
✓ No console errors
```

### Firefox
```
✓ Page loads
✓ Freighter connects
✓ Transactions submit
✓ No console errors
```

### Edge
```
✓ Page loads
✓ Freighter connects
✓ Transactions submit
✓ No console errors
```

### Safari
```
✓ Page loads
✓ Freighter connects
✓ Transactions submit
✓ No console errors
```

## Phase 10: Final Integration Test

### Complete User Journey
```
1. [ ] Connect wallet
2. [ ] View stats
3. [ ] Approve contract (if needed)
4. [ ] Stake 10 tokens
5. [ ] Wait 30 seconds
6. [ ] Claim rewards
7. [ ] Compound stake (add 5 more)
8. [ ] View updated stats
9. [ ] Unstake 5 tokens
10. [ ] Verify final balance

Expected:
- All steps succeed
- No console errors
- All notifications appear
- Data is accurate
```

## Test Report Template

```markdown
# Test Report - [Date]

## Environment
- Node Version: 
- Browser: 
- Network: Testnet
- Contract Address: CA5TD6RXA5ETYQ6UM46XMBAGFMIFGTUFKY6DIQQLOZ56EESSGJM5HQLU

## Tests Passed
- [ ] Phase 1: Environment Setup
- [ ] Phase 2: Local Development
- [ ] Phase 3: Contract Interactions
- [ ] Phase 4: Error Handling
- [ ] Phase 5: UI/UX
- [ ] Phase 6: Data Accuracy
- [ ] Phase 7: Performance
- [ ] Phase 8: Security
- [ ] Phase 9: Cross-Browser
- [ ] Phase 10: Integration

## Issues Found
1. Issue #1: [Description]
   - Severity: [High/Medium/Low]
   - Steps to reproduce: [Steps]
   - Expected: [Expected behavior]
   - Actual: [Actual behavior]
   - Status: [New/In Progress/Fixed/Closed]

## Ready for Production
- [ ] Yes - All tests passed, no critical issues
- [ ] Conditional - Waiting for issue fixes
- [ ] No - Critical issues present

## Sign-off
Tester: ________________  
Date: ________________  
```

## Running Automated Tests

```bash
# Run all tests
npm run test

# Run specific test file
npm run test -- transactionUtils.test.ts

# Run with coverage
npm run test:coverage

# Watch mode for development
npm run test:watch
```

## Continuous Integration

After deploying, set up automated testing:

```yaml
# .github/workflows/test.yml
name: Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '18'
      - run: npm install
      - run: npm run lint
      - run: npm run test:coverage
      - run: npm run build
```

## Sign-off Checklist

Before deploying to production:

- [ ] All manual tests completed
- [ ] All automated tests passing
- [ ] Code reviewed
- [ ] Performance acceptable
- [ ] Security audit completed
- [ ] Documentation updated
- [ ] Error handling verified
- [ ] Backup plan documented
- [ ] Monitoring configured
- [ ] Rollback procedure ready

---

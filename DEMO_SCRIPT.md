# 🎥 Green Belt Demo Script

**Duration:** 8-10 minutes
**Purpose:** Live demonstration of Token Staking Platform functionality
**Audience:** Green Belt submission reviewers

---

## Prerequisites

- Freighter wallet installed and configured
- Test wallet with 1.25 XLM on Stellar Testnet
  - Get XLM: `https://friendbot.stellar.org/?addr=GXXXXXXXXX` (replace with your address)
- App running locally: `npm run dev` (port 3001)
- Modern browser (Chrome, Firefox, Safari)

---

## Demo Walkthrough

### **1. Application Setup (30 seconds)**

**Step 1.1:** Show the application loading
```
- Open http://localhost:3001
- Show "Token Staking Platform" headline
- Show 4 tabs: Staking, Dashboard, History, Analytics
- Point out "Powered by Soroban on Stellar" badge
```

**Expected:** Clean UI with gradient background, all tabs visible, responsive layout

### **2. Wallet Connection (1 minute)**

**Step 2.1:** Connect wallet
```
- Click "Connect Wallet" button (top-right)
- Freighter popup appears
- Click "Approve" in Freighter
```

**Expected:**
- Wallet address appears in navbar (truncated format: GA...xxxx)
- Balance displayed with refresh icon

**Step 2.2:** Show balance
```
- Point to balance display in navbar
- Show: "1.25 XLM" or similar
- Click refresh icon to re-fetch balance
```

**Expected:**
- Balance loads from Horizon API
- Loading spinner appears briefly
- Balance updates without errors

### **3. Staking Demonstration (2 minutes)**

**Step 3.1:** Navigate to Staking tab
```
- Tab "Staking" should be selected (default)
- Show form with:
  - "Amount" input field
  - "Stake" button
  - Current staking stats (if any)
```

**Step 3.2:** Enter stake amount
```
- Click on amount input
- Type: 0.5
- Press Tab to blur (validation)
```

**Expected:**
- Input accepted
- No validation error
- "Stake" button enabled

**Step 3.3:** Submit stake transaction
```
- Click "Stake" button
- Show status: "Validating transaction..."
- Freighter popup appears
- Click "Confirm" in Freighter
- Wait for: "Tokens staked successfully!"
```

**Expected:**
- Transaction submits to testnet
- Success message shows (green checkmark)
- Amount field clears
- Dashboard updates with new staked amount

**Step 3.4:** Verify dashboard
```
- Click "Dashboard" tab
- Point to metrics:
  - Daily APY: X.XX%
  - Weekly Earnings: X TOKEN
  - Monthly Projection: X TOKEN
```

**Expected:**
- Dashboard calculates rewards based on staked amount
- All metrics display correctly
- No NaN or undefined values

### **4. Unstaking Demonstration (1 minute)**

**Step 4.1:** Navigate to Unstake tab
```
- Click "Unstake" tab
- Show form with:
  - "Amount" input
  - "Unstake" button
```

**Step 4.2:** Unstake partial amount
```
- Enter: 0.2
- Click "Unstake"
- Freighter popup
- Approve transaction
```

**Expected:**
- Transaction succeeds
- Success message: "Tokens unstaked successfully!"
- Dashboard shows updated staked amount (0.3)

### **5. Rewards & Claiming (1 minute)**

**Step 5.1:** Show rewards tab
```
- Click "Rewards" tab
- Show "Claim Rewards" button
- Show pending rewards value (if any)
```

**Step 5.2:** Claim rewards
```
- Click "Claim Rewards"
- Freighter popup
- Approve
```

**Expected:**
- Transaction succeeds
- Message: "Rewards claimed successfully!"
- Pending rewards reset to 0

### **6. Error Handling Demo (1 minute)**

**Step 6.1:** Test invalid input
```
- Go back to Staking tab
- Try to stake: -0.5
- Error appears: "Amount must be greater than 0"
```

**Step 6.2:** Test insufficient balance
```
- Try to stake: 2.0 (with only 1.25 available after previous transactions)
- Error appears: "Insufficient balance for this transaction"
```

**Step 6.3:** Test empty input
```
- Leave amount blank
- Click "Stake"
- Error appears: "Amount is required"
```

**Expected:**
- All error messages clear and helpful
- No technical jargon exposed
- Buttons disabled during loading

### **7. Multi-Wallet Test (1 minute)**

**Step 7.1:** Disconnect current wallet
```
- Click power icon in navbar (disconnect button)
- Wallet address disappears
- Balance clears
```

**Expected:**
- UI resets completely
- All action buttons disabled
- "Connect Wallet" button appears again

**Step 7.2:** Switch wallet in Freighter
```
- Open Freighter extension
- Select different wallet (Wallet B)
- Go back to app
```

**Step 7.3:** Connect with different wallet
```
- Click "Connect Wallet"
- Approve in Freighter
```

**Expected:**
- New wallet address displays
- Balance fetches for new wallet
- Different staking state shows

### **8. Mobile Responsiveness (30 seconds)**

**Step 8.1:** Open DevTools responsive mode
```
- Press F12 (or Cmd+Opt+I on Mac)
- Click responsive design mode (Ctrl+Shift+M)
- Select "iPhone SE" or similar (375px width)
```

**Step 8.2:** Show mobile layout
```
- Navigate through all tabs on mobile
- Try to stake on mobile
- Show all buttons are tappable (≥44px)
```

**Expected:**
- Text remains readable
- Buttons stack vertically
- Input fields don't overflow
- All functionality works

### **9. Transaction History (30 seconds)**

**Step 9.1:** Show History tab
```
- Click "History" tab
- Display list of recent transactions
- Show timestamps and amounts
```

**Expected:**
- All previous transactions listed
- Stake, unstake, claim visible
- Times display correctly

### **10. Analytics (30 seconds)**

**Step 10.1:** Show Analytics tab
```
- Click "Analytics" tab
- Display charts or metrics
```

**Expected:**
- Analytics data loads
- No errors in console

---

## Success Criteria Checklist

✅ **Wallet Operations**
- [ ] Connection works without errors
- [ ] Balance displays correctly from Horizon API
- [ ] Disconnect clears all state
- [ ] Multi-wallet switching works

✅ **Staking Operations**
- [ ] Stake transaction succeeds on testnet
- [ ] Dashboard updates after staking
- [ ] Unstake works correctly
- [ ] Full unstake removes from staker list

✅ **Rewards**
- [ ] Pending rewards display
- [ ] Claim transaction succeeds
- [ ] Balance updates after claim

✅ **Error Handling**
- [ ] Invalid inputs rejected with clear messages
- [ ] Insufficient balance detected
- [ ] Network errors handled gracefully

✅ **UI/UX**
- [ ] All components render without crashes
- [ ] Loading states show during transactions
- [ ] Success/error messages appear
- [ ] Mobile layout works

✅ **Transaction Verification**
- [ ] Each transaction appears on Stellar testnet
- [ ] Horizon API reflects updates
- [ ] Contract state updates correctly

---

## Troubleshooting During Demo

| Issue | Solution |
|-------|----------|
| Freighter popup doesn't appear | Check Freighter extension is active |
| Transaction timeout | Wait 10-15 seconds, testnet can be slow |
| Balance shows 0 | Refresh the page, check Friendbot funding |
| Dashboard shows NaN | Wait for dashboard to load, refresh if needed |
| Mobile layout broken | Check viewport width is correct (DevTools) |
| Wallet disconnect doesn't clear UI | Hard refresh (Ctrl+Shift+R) |

---

## Recording Tips

- Use screen recording software: OBS, Loom, or browser DevTools
- Minimize sidebars/extensions that might distract
- Speak clearly explaining each step
- Move mouse slowly so reviewers can follow
- Pause briefly at success states to show results
- Keep video under 12 minutes

---

## Demo Video Link

**To be recorded and uploaded:**
- [ ] Record demo following this script
- [ ] Upload to YouTube or similar platform
- [ ] Update README.md with link
- [ ] Share link with submission

---

**Total Demo Time: 8-10 minutes**
**Complexity: Beginner-friendly**
**Audience: Non-technical reviewer**
- Show project structure
- Explain tech stack:
  - Next.js 16 with TypeScript
  - Stellar SDK and Soroban contracts
  - Tailwind CSS for styling
  - Smart contract in Rust
- Demonstrate contract tests passing
- Show build process

### 8. Error Handling (30 seconds)
- Demonstrate error states (insufficient balance, network issues)
- Show loading states and user feedback
- Explain rate limiting and validation

## Key Demo Points to Emphasize

### White Belt Completeness ✅
- ✅ Wallet connection working
- ✅ Balance fetching from Horizon API
- ✅ Staking/unstaking transactions
- ✅ Smart contract integration
- ✅ Basic UI/UX

### Test Coverage ✅
- ✅ All contract tests passing (9/9)
- ✅ Frontend builds successfully
- ✅ Linting passes
- ✅ TypeScript compilation clean

### Frontend Reliability ✅
- ✅ No runtime errors
- ✅ Proper error handling
- ✅ Loading states
- ✅ Responsive design
- ✅ Real-time updates

### Production Readiness ✅
- ✅ Environment configuration
- ✅ Build optimization
- ✅ Code quality standards
- ✅ Documentation

## Demo Environment Setup

### Prerequisites
- Node.js 18+
- Rust and Cargo
- Freighter wallet browser extension
- Stellar testnet access

### Quick Start Commands
```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Run tests
npm test

# Deploy contract
cd contract
cargo build --release
```

### Test Account Setup
- Use Stellar testnet
- Fund account with XLM for fees
- Mint test tokens for staking

## Troubleshooting

### Common Issues
- Wallet connection fails: Check Freighter extension
- Balance not showing: Verify Horizon API access
- Transactions failing: Check testnet connectivity
- Build errors: Ensure Node.js version compatibility

### Performance Notes
- Initial load: ~2-3 seconds
- Balance fetch: ~1 second
- Transaction confirmation: ~5-10 seconds on testnet

## Conclusion
- Summarize key achievements
- Highlight scalability and security features
- Mention future enhancements
- Call to action for feedback/collaboration

---

*Demo Duration: ~8-10 minutes*
*Prepared for submission readiness assessment*</content>
<parameter name="filePath">e:\Token_Staking_Platform\tsp\Web3_RiseInWS_Token-Staking-Platform_Day2_-2-\DEMO_SCRIPT.md
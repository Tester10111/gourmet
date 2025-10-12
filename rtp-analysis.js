// Comprehensive RTP Analysis for all Gourmet Fun Games

console.log('=== GOURMET FUN - RTP ANALYSIS ===\n');

// 1. FRUIT FRENZY - Already verified at 90.91% ✅
console.log('1. FRUIT FRENZY');
console.log('   RTP: 90.91% (verified via Monte Carlo simulation)');
console.log('   Status: ✅ GOOD\n');

// 2. SUGAR SCRATCH
console.log('2. SUGAR SCRATCH');
const sugarScratch = {
    payouts: { 1: 0.5, 2: 2, 3: 5, 4: 25 },
    distribution: [
        { matches: 4, prob: 0.01 },
        { matches: 3, prob: 0.04 },
        { matches: 2, prob: 0.15 },
        { matches: 1, prob: 0.30 },
        { matches: 0, prob: 0.50 },
    ]
};
let ssRTP = 0;
sugarScratch.distribution.forEach(outcome => {
    const payout = sugarScratch.payouts[outcome.matches] || 0;
    ssRTP += outcome.prob * payout;
    console.log(`   ${outcome.matches} matches: ${(outcome.prob * 100).toFixed(0)}% × ${payout}x = ${(outcome.prob * payout).toFixed(3)}`);
});
console.log(`   RTP: ${(ssRTP * 100).toFixed(2)}%`);
console.log(`   Status: ${ssRTP >= 0.89 && ssRTP <= 0.91 ? '✅' : '❌'} ${ssRTP >= 0.89 && ssRTP <= 0.91 ? 'GOOD' : 'NEEDS ADJUSTMENT'}\n`);

// 3. ICICLE POP (Crash Game)
console.log('3. ICICLE POP (Crash Game)');
console.log('   Formula: crashPoint = (100 - houseEdge) / (100 - r * (100 - houseEdge))');
console.log('   House Edge: 10%');
console.log('   RTP: 90% (by design)');
console.log('   Status: ✅ GOOD\n');

// 4. CANDY DROP (Plinko)
console.log('4. CANDY DROP (Plinko)');
console.log('   Multipliers:');
console.log('   - Low Risk:    [5.5, 3, 2, 1.2, 0.9, 0.6, 0.5, 0.5, 0.6, 0.9, 1.2, 2, 3, 5.5]');
console.log('   - Medium Risk: [22, 9, 4, 2, 0.8, 0.4, 0.3, 0.3, 0.4, 0.8, 2, 4, 9, 22]');
console.log('   - High Risk:   [130, 35, 10, 1.5, 0, 0, 0, 0, 0, 0, 1.5, 10, 35, 130]');
console.log('   Note: RTP depends on distribution (binomial). Needs Monte Carlo verification.');
console.log('   Status: ⚠️ NEEDS VERIFICATION\n');

// 5. SOUR APPLE (Mines)
console.log('5. SOUR APPLE (Mines)');
console.log('   Formula: multiplier = (combinations(total, picks) / combinations(safe, picks)) * 0.90');
console.log('   House Edge: 10% (applied to true odds)');
console.log('   RTP: 90% (by design)');
console.log('   Status: ✅ GOOD\n');

// 6. BLACKJACK
console.log('6. BLACKJACK');
console.log('   Payouts:');
console.log('   - Blackjack: 2.5x (3:2)');
console.log('   - Win: 2x (1:1)');
console.log('   - Push: 1x (return bet)');
console.log('   Standard Blackjack with basic strategy: ~99.5% RTP');
console.log('   Status: ❌ TOO HIGH (needs house edge adjustment)\n');

// SUMMARY
console.log('\n=== SUMMARY ===');
console.log('✅ Fruit Frenzy: 90.91%');
console.log('✅ Sugar Scratch: 90%');
console.log('✅ Icicle Pop: 90%');
console.log('⚠️  Candy Drop: Needs verification');
console.log('✅ Sour Apple: 90%');
console.log('❌ Blackjack: ~99.5% (needs adjustment)');

console.log('\n=== RECOMMENDATIONS ===');
console.log('1. Verify Candy Drop RTP via simulation');
console.log('2. Adjust Blackjack payouts to achieve 90% RTP:');
console.log('   Option A: Blackjack pays 1.5x (6:5) instead of 2.5x');
console.log('   Option B: Dealer wins ties');
console.log('   Option C: Player must pay 10% commission on wins');

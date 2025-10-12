// Candy Drop RTP Calculator (Plinko Simulation)

const ROWS = 13;

const MULTIPLIERS = {
    low:    [5.5, 3, 2, 1.2, 0.9, 0.6, 0.5, 0.5, 0.6, 0.9, 1.2, 2, 3, 5.5],
    medium: [22, 9, 4, 2, 0.8, 0.4, 0.3, 0.3, 0.4, 0.8, 2, 4, 9, 22],
    high:   [130, 35, 10, 1.5, 0, 0, 0, 0, 0, 0, 1.5, 10, 35, 130]
};

function simulateDrop(startCol = ROWS / 2) {
    let currentCol = startCol;

    // Simulate bouncing through pegs
    for (let row = 0; row < ROWS; row++) {
        // 50/50 chance to go left or right
        currentCol += (Math.random() < 0.5 ? -0.5 : 0.5);
    }

    // Determine which bucket
    const bucketIndex = Math.floor(currentCol);
    const safeBucketIndex = Math.max(0, Math.min(13, bucketIndex));

    return safeBucketIndex;
}

function calculateRTP(riskLevel, numSimulations = 1000000) {
    const multipliers = MULTIPLIERS[riskLevel];
    let totalPayout = 0;

    for (let i = 0; i < numSimulations; i++) {
        const bucketIndex = simulateDrop();
        totalPayout += multipliers[bucketIndex];
    }

    const avgPayout = totalPayout / numSimulations;
    const rtp = avgPayout * 100;

    return { rtp, avgPayout };
}

console.log('=== CANDY DROP RTP SIMULATION ===\n');

['low', 'medium', 'high'].forEach(risk => {
    console.log(`${risk.toUpperCase()} RISK:`);
    const result = calculateRTP(risk, 1000000);
    console.log(`  Average Payout: ${result.avgPayout.toFixed(4)}x`);
    console.log(`  RTP: ${result.rtp.toFixed(2)}%`);
    console.log(`  Status: ${result.rtp >= 89 && result.rtp <= 91 ? '✅' : '❌'} ${result.rtp >= 89 && result.rtp <= 91 ? 'GOOD' : 'NEEDS ADJUSTMENT'}\n`);
});

// Calculate adjustment factors
console.log('=== ADJUSTMENT FACTORS FOR 90% RTP ===\n');
['low', 'medium', 'high'].forEach(risk => {
    const result = calculateRTP(risk, 1000000);
    const adjustmentFactor = 90 / result.rtp;
    console.log(`${risk.toUpperCase()} RISK: Multiply all multipliers by ${adjustmentFactor.toFixed(4)}`);
});

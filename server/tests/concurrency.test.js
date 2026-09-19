const { bookTicket } = require('../src/services/reservation');

/**
 * PHASE 4: Verification (Concurrency Control)
 * Simulates two users attempting to book the very last seat at the exact same millisecond.
 */
async function runConcurrencyTest() {
    console.log("Starting Concurrency Test...");
    console.log("Simulating two users trying to book the same seat (Seat ID: 42) at the exact same millisecond.");

    const scheduleId = 101;
    const seatId = 42; 

    const user1Booking = bookTicket(
        1, // userId
        scheduleId,
        seatId,
        "Alice Smith",
        28,
        "Female"
    );

    const user2Booking = bookTicket(
        2, // userId
        scheduleId,
        seatId,
        "Bob Jones",
        32,
        "Male"
    );

    // Fire both requests concurrently
    const results = await Promise.allSettled([user1Booking, user2Booking]);

    console.log("\n=== TEST RESULTS ===");
    
    results.forEach((result, index) => {
        const user = index === 0 ? "User 1 (Alice)" : "User 2 (Bob)";
        if (result.status === "fulfilled") {
            console.log(`✅ [SUCCESS] ${user} successfully booked the seat. Ticket ID: ${result.value.ticket.id}`);
        } else {
            console.log(`❌ [FAILED] ${user} failed to book. Error: ${result.reason.message}`);
        }
    });

    // Verification Logic
    const successCount = results.filter(r => r.status === "fulfilled").length;
    const failCount = results.filter(r => r.status === "rejected").length;

    console.log("\n=== SUMMARY ===");
    if (successCount === 1 && failCount === 1) {
        console.log("🏆 Concurrency Test PASSED: Only one user could book the seat. Database transactions successfully prevented double-booking.");
    } else {
        console.log("⚠️ Concurrency Test FAILED: Concurrency issue detected. Both users succeeded, or both failed unexpectedly.");
    }
}

// Execute the test if run directly
if (require.main === module) {
    runConcurrencyTest()
        .then(() => {
            console.log("Test execution completed.");
            process.exit(0);
        })
        .catch(err => {
            console.error("Test execution encountered a fatal error:", err);
            process.exit(1);
        });
}

module.exports = { runConcurrencyTest };

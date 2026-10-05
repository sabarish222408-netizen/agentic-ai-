// agent.js

async function verifyWithAgent(question, aiAnswer) {

    console.log("🤖 Agent started");

    // STEP 1 — Analyze input
    console.log("1️⃣ Analyzing AI answer...");

    const claims = extractClaims(aiAnswer);

    // STEP 2 — Research
    console.log("2️⃣ Research agent started...");

    const evidence = await researchClaims(claims);

    // STEP 3 — Verify
    console.log("3️⃣ Verification agent started...");

    const verifiedClaims =
        verifyClaims(claims, evidence);

    // STEP 4 — Generate final report
    console.log("4️⃣ Generating final report...");

    return {
        question: question,
        originalAnswer: aiAnswer,
        claims: verifiedClaims
    };
}


// ------------------------------------
// CLAIM EXTRACTION AGENT
// ------------------------------------

function extractClaims(answer) {

    return answer
        .split(/[.!?]/)
        .map(sentence => sentence.trim())
        .filter(sentence => sentence.length > 10)
        .map((sentence, index) => ({
            id: index + 1,
            text: sentence
        }));
}


// ------------------------------------
// RESEARCH AGENT
// ------------------------------------

async function researchClaims(claims) {

    // Demo evidence for now.
    // Later connect this to a real search/API.

    return claims.map(claim => ({
        claimId: claim.id,

        sources: [
            {
                title: "Verification Source",
                url: "https://example.com"
            }
        ],

        evidence:
            "Evidence collected for this claim."
    }));
}


// ------------------------------------
// VERIFICATION AGENT
// ------------------------------------

function verifyClaims(claims, evidence) {

    return claims.map(claim => {

        const claimEvidence =
            evidence.find(
                item => item.claimId === claim.id
            );

        return {

            id: claim.id,

            claim: claim.text,

            status: "NEEDS_REVIEW",

            confidence: "Medium",

            evidence:
                claimEvidence.evidence,

            sources:
                claimEvidence.sources
        };
    });
}


// Export
window.verifyWithAgent =
    verifyWithAgent;
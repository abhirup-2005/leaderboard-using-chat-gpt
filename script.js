const SHEET_URL =
  "https://docs.google.com/spreadsheets/d/e/2PACX-1vREoOJcRvBQYqDlGB236JdFGax7LNag1b_GaHyMwzFxUC2BTa8C6xdc7S_SH4UvTyuzimjsYAJBg1K7/pub?output=csv";

const leaderboard = document.getElementById("leaderboard");
const lastUpdatedEl = document.getElementById("lastUpdated");

// ✅ Minimal CSV parser that handles quoted fields and commas inside text
function parseCSV(text) {
  const rows = [];
  let currentRow = [];
  let currentCell = "";
  let insideQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const nextChar = text[i + 1];

    if (char === '"' && insideQuotes && nextChar === '"') {
      currentCell += '"';
      i++;
    } else if (char === '"') {
      insideQuotes = !insideQuotes;
    } else if (char === "," && !insideQuotes) {
      currentRow.push(currentCell);
      currentCell = "";
    } else if (char === "\n" && !insideQuotes) {
      currentRow.push(currentCell);
      rows.push(currentRow);
      currentRow = [];
      currentCell = "";
    } else {
      currentCell += char;
    }
  }
  if (currentCell || currentRow.length) currentRow.push(currentCell);
  if (currentRow.length) rows.push(currentRow);
  return rows;
}

async function fetchLeaderboard() {
  try {
    const res = await fetch(SHEET_URL + "&t=" + Date.now()); // prevent caching
    const text = await res.text();

    const rows = parseCSV(text);
    const headers = rows.shift().map(h => h.trim());

    const tsIndex = headers.findIndex(h => h.toLowerCase().includes("timestamp"));
    const nameIndex = headers.findIndex(h => h.toLowerCase().includes("name"));
    const scoreIndex = headers.findIndex(h => h.toLowerCase().includes("score"));

    if (tsIndex === -1 || nameIndex === -1 || scoreIndex === -1) {
      throw new Error("Missing required columns (Timestamp, Name, Score)");
    }

    const rawData = rows
      .map(r => ({
        name: r[nameIndex]?.trim(),
        score: parseFloat(r[scoreIndex]) || 0,
        timestamp: new Date(r[tsIndex]),
      }))
      .filter(e => e.name && !isNaN(e.timestamp));

    // Aggregate scores by name
    const playerMap = new Map();
    for (let entry of rawData) {
      if (!playerMap.has(entry.name)) {
        playerMap.set(entry.name, {
          name: entry.name,
          totalScore: entry.score,
          lastTime: entry.timestamp,
        });
      } else {
        const existing = playerMap.get(entry.name);
        existing.totalScore += entry.score;
        if (entry.timestamp > existing.lastTime) existing.lastTime = entry.timestamp;
      }
    }

    const data = Array.from(playerMap.values());

    // Sort by total score desc, then by earliest submission
    data.sort((a, b) => {
      if (b.totalScore !== a.totalScore) return b.totalScore - a.totalScore;
      return a.lastTime - b.lastTime;
    });

    // Render leaderboard
    leaderboard.innerHTML = data.map((entry, index) => {
      const formattedTime = entry.lastTime.toLocaleString("en-IN", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        day: "2-digit",
        month: "short",
      });
      return `
        <div class="entry ${index === 0 ? "top1" : index === 1 ? "top2" : index === 2 ? "top3" : ""}">
          <span class="rank">${index + 1}.</span>
          <span class="name">${entry.name}</span>
          <span class="score">${entry.totalScore}</span>
          <span class="time">${formattedTime}</span>
        </div>
      `;
    }).join("");

    // Last updated
    const now = new Date();
    if (lastUpdatedEl) {
      lastUpdatedEl.textContent =
        "Last updated: " +
        now.toLocaleString("en-IN", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          day: "2-digit",
          month: "short",
        });
    }
  } catch (err) {
    console.error("⚠️ Error:", err);
    leaderboard.innerHTML = "<p style='color:red'>⚠️ Failed to load leaderboard.</p>";
    if (lastUpdatedEl) {
      lastUpdatedEl.textContent =
        "⚠️ Failed to update at " + new Date().toLocaleTimeString();
    }
  }
}

function initTiltEffect() {
    const card = document.getElementById('leaderboard');
    const maxTilt = 10; // Maximum tilt angle in degrees

    card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        // Calculate tilt angles based on mouse position
        const xRatio = (x / rect.width - 0.5) * 2; // -1 to 1
        const yRatio = (y / rect.height - 0.5) * 2; // -1 to 1
        
        // Invert the angles for natural tilting effect
        const tiltX = -yRatio * maxTilt;
        const tiltY = xRatio * maxTilt;

        // Apply the transform
        card.style.transform = `rotateX(${tiltX}deg) rotateY(${tiltY}deg)`;
    });

    // Reset transform when mouse leaves
    card.addEventListener('mouseleave', () => {
        card.style.transform = 'rotateX(0deg) rotateY(0deg)';
    });
}

// Call this function after the leaderboard content is loaded
document.addEventListener('DOMContentLoaded', initTiltEffect);

fetchLeaderboard();
setInterval(fetchLeaderboard, 30000);

// Display current month and year
const monthDisplay = document.getElementById("monthDisplay");
const now = new Date();
const options = { month: 'long', year: 'numeric' };
monthDisplay.textContent = now.toLocaleDateString('en-US', options);

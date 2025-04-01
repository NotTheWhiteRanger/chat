// main.js

// Import Firebase modules using ES modules (v9 modular style)
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.1/firebase-app.js";
import { getDatabase, ref, set } from "https://www.gstatic.com/firebasejs/9.22.1/firebase-database.js";

// Firebase configuration (same as your main website)
const firebaseConfig = {
  apiKey: "AIzaSyD2B6KZgtYQPE4K-JF5GQszp5wjNgX6_MY",
  authDomain: "new-chat-8d4f4.firebaseapp.com",
  databaseURL: "https://new-chat-8d4f4-default-rtdb.firebaseio.com",
  projectId: "new-chat-8d4f4",
  storageBucket: "new-chat-8d4f4.firebasestorage.app",
  messagingSenderId: "825077448854",
  appId: "1:825077448854:web:3906174c00e1f6604782b7"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

// --- Simulated Deck and Hand Management ---

// Simulated deck: an array of card names (for demo purposes)
const deck = [
  "Lightning Bolt",
  "Counterspell",
  "Llanowar Elves",
  "Giant Growth",
  "Dark Ritual",
  "Serra Angel",
  "Shivan Dragon",
  "Birds of Paradise",
  "Sol Ring",
  "Time Walk",
  "Ancestral Recall",
  "Black Lotus",
  "Mox Sapphire",
  "Mox Jet",
  "Mox Ruby",
  "Mox Emerald",
  "Mox Pearl"
];

// Player's hand will hold the card names
let playerHand = [];

// Variable to track the currently selected card for click-based play
let selectedCard = null;

// Utility to generate a random game ID
function generateGameId() {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

// Initialize game: draw starting hand (7 cards) and render hand
function initializeGame() {
  for (let i = 0; i < 7; i++) {
    drawCard();
  }
  renderHand();
}

// Draw a card from the deck
function drawCard() {
  const randomIndex = Math.floor(Math.random() * deck.length);
  const card = deck[randomIndex];
  playerHand.push(card);
  renderHand();
}

// Render player's hand inside the #hand-cards container
function renderHand() {
  const handContainer = document.getElementById("hand-cards");
  handContainer.innerHTML = "";
  playerHand.forEach((card, index) => {
    const cardDiv = document.createElement("div");
    cardDiv.className = "card";
    cardDiv.draggable = true;
    cardDiv.dataset.index = index;
    cardDiv.textContent = card;

    // Click-based selection: highlight selected card
    cardDiv.addEventListener("click", () => {
      const previouslySelected = document.querySelector(".card.selected");
      if (previouslySelected) previouslySelected.classList.remove("selected");
      cardDiv.classList.add("selected");
      selectedCard = index;
    });

    // Drag events for drag and drop
    cardDiv.addEventListener("dragstart", (e) => {
      e.dataTransfer.setData("text/plain", index);
    });

    handContainer.appendChild(cardDiv);
  });
}

// Play a card: remove it from hand and add it to the play area
function playCard(cardIndex) {
  const card = playerHand[cardIndex];
  if (!card) return;
  playerHand.splice(cardIndex, 1);
  renderHand();

  const playArea = document.getElementById("play-area");
  const playedCard = document.createElement("div");
  playedCard.className = "played-card";
  playedCard.textContent = card;
  playArea.appendChild(playedCard);

  // Reset selection
  selectedCard = null;
  const selectedElem = document.querySelector(".card.selected");
  if (selectedElem) selectedElem.classList.remove("selected");
}

// Set up the play area to accept clicks and drops
function setupPlayArea() {
  const playArea = document.getElementById("play-area");

  // Click: if a card is selected, play it when clicking the play area
  playArea.addEventListener("click", () => {
    if (selectedCard !== null) {
      playCard(selectedCard);
    }
  });

  // Drag and drop events
  playArea.addEventListener("dragover", (e) => {
    e.preventDefault();
  });
  playArea.addEventListener("drop", (e) => {
    e.preventDefault();
    const cardIndex = e.dataTransfer.getData("text/plain");
    playCard(parseInt(cardIndex));
  });
}

// --- Event Listeners for Game Lobby and Draw Button ---

// Create Game button: generates a game ID, writes initial data to Firebase, and starts the game UI
document.getElementById("create-game").addEventListener("click", () => {
  const gameId = generateGameId();
  const gameRef = ref(database, 'mtg/games/' + gameId);
  set(gameRef, {
    players: {},
    status: 'waiting'
  })
    .then(() => {
      console.log("Game created with ID:", gameId);
      document.getElementById("game-lobby").style.display = "none";
      document.getElementById("game-board").style.display = "block";
      initializeGame();
      setupPlayArea();
    })
    .catch((error) => {
      console.error("Error creating game:", error);
    });
});

// Join Game button (simplified for demonstration)
document.getElementById("join-game").addEventListener("click", () => {
  const gameCode = document.getElementById("game-code").value.trim().toUpperCase();
  if (!gameCode) return alert("Please enter a valid game code.");
  console.log("Attempting to join game:", gameCode);
  document.getElementById("game-lobby").style.display = "none";
  document.getElementById("game-board").style.display = "block";
  initializeGame();
  setupPlayArea();
});

// Draw Card button
document.getElementById("draw-card").addEventListener("click", () => {
  drawCard();
});

// Example Scryfall integration to fetch card details (for future enhancement)
function fetchCard(cardName) {
  fetch(`https://api.scryfall.com/cards/named?exact=${encodeURIComponent(cardName)}`)
    .then(response => response.json())
    .then(data => {
      console.log("Fetched card data:", data);
      // Additional card detail updates can be handled here
    })
    .catch(error => console.error("Error fetching card data:", error));
}
fetchCard("Lightning Bolt");
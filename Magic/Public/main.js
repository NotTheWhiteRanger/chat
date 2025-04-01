// main.js
// Import Firebase modules using ES modules (v9 modular style)
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.1/firebase-app.js";
import { getDatabase, ref, set } from "https://www.gstatic.com/firebasejs/9.22.1/firebase-database.js";

// Updated Firebase configuration (from your index.html)
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

// Simulated deck: an array of card names (in a full implementation, you might fetch details from Scryfall)
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

// The player's hand will be an array of card names
let playerHand = [];

// A variable to keep track of the currently selected card (for click-based play)
let selectedCard = null;

// Utility to generate a random game ID
function generateGameId() {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

// Initialize game: set up the player's hand and render it
function initializeGame() {
  // Draw 7 cards from the deck (simple random draw without removal for demo purposes)
  for (let i = 0; i < 7; i++) {
    drawCard();
  }
  renderHand();
}

// Draw a card from the deck
function drawCard() {
  // For simplicity, draw a random card from the deck array
  const randomIndex = Math.floor(Math.random() * deck.length);
  const card = deck[randomIndex];
  playerHand.push(card);
  renderHand();
}

// Render the player's hand in the #hand-cards container
function renderHand() {
  const handContainer = document.getElementById("hand-cards");
  handContainer.innerHTML = "";
  playerHand.forEach((card, index) => {
    const cardDiv = document.createElement("div");
    cardDiv.className = "card";
    cardDiv.draggable = true;
    cardDiv.dataset.index = index;
    cardDiv.textContent = card;

    // For click-based selection
    cardDiv.addEventListener("click", (e) => {
      // Remove highlight from any previously selected card
      const previouslySelected = document.querySelector(".card.selected");
      if (previouslySelected) previouslySelected.classList.remove("selected");
      // Mark this card as selected
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

// Handler for playing a card (removes from hand and adds to play area)
function playCard(cardIndex) {
  const card = playerHand[cardIndex];
  if (!card) return;
  // Remove card from hand
  playerHand.splice(cardIndex, 1);
  renderHand();

  // Display the played card in the play area
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

  // For click-based playing: if a card is selected, clicking play area plays it.
  playArea.addEventListener("click", (e) => {
    if (selectedCard !== null) {
      playCard(selectedCard);
    }
  });

  // For drag and drop: allow dropping a card into the play area
  playArea.addEventListener("dragover", (e) => {
    e.preventDefault(); // Necessary to allow a drop
  });

  playArea.addEventListener("drop", (e) => {
    e.preventDefault();
    const cardIndex = e.dataTransfer.getData("text/plain");
    playCard(parseInt(cardIndex));
  });
}

// --- Event Listeners for Lobby and Draw Button ---

// Create game event handler
document.getElementById("create-game").addEventListener("click", () => {
  const gameId = generateGameId();
  const gameRef = ref(database, 'games/' + gameId);
  set(gameRef, {
    players: {},
    status: 'waiting'
  }).then(() => {
    console.log("Game created with ID:", gameId);
    // Update UI: Hide lobby, show game board
    document.getElementById("game-lobby").style.display = "none";
    document.getElementById("game-board").style.display = "block";
    // Initialize the game for this player (draw starting hand, etc.)
    initializeGame();
    setupPlayArea();
  }).catch((error) => {
    console.error("Error creating game:", error);
  });
});

// Join game event handler (simplified)
document.getElementById("join-game").addEventListener("click", () => {
  const gameCode = document.getElementById("game-code").value.trim().toUpperCase();
  if (!gameCode) return alert("Please enter a valid game code.");
  console.log("Attempting to join game:", gameCode);
  // Add your logic to join an existing game via Firebase here.
  // For now, simulate by initializing the game.
  document.getElementById("game-lobby").style.display = "none";
  document.getElementById("game-board").style.display = "block";
  initializeGame();
  setupPlayArea();
});

// Draw Card button handler
document.getElementById("draw-card").addEventListener("click", () => {
  drawCard();
});

// --- Scryfall API Integration ---
// Function to fetch card data from Scryfall by card name
function fetchCard(cardName) {
  fetch(`https://api.scryfall.com/cards/named?exact=${encodeURIComponent(cardName)}`)
    .then(response => response.json())
    .then(data => {
      console.log("Fetched card data:", data);
      // You could update the card element with image or more info here
    })
    .catch(error => console.error("Error fetching card data:", error));
}

// Example usage: Fetch data for "Lightning Bolt"
fetchCard("Lightning Bolt");
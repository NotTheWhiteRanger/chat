// main.js

// Wait until the DOM is fully loaded
document.addEventListener("DOMContentLoaded", () => {
  console.log("DOM content loaded. Initializing MTG game.");

  // Import Firebase modules using ES modules (v9 modular style)
  import("https://www.gstatic.com/firebasejs/9.22.1/firebase-app.js").then(({ initializeApp }) => {
    import("https://www.gstatic.com/firebasejs/9.22.1/firebase-database.js").then(({ getDatabase, ref, set }) => {
      
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
      console.log("Firebase initialized.");

      // --- Simulated Deck and Hand Management ---
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
      let playerHand = [];
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
        if (!handContainer) {
          console.error("Hand cards container not found!");
          return;
        }
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
            console.log("Card selected:", card);
          });

          // Drag events for drag and drop
          cardDiv.addEventListener("dragstart", (e) => {
            e.dataTransfer.setData("text/plain", index);
          });

          handContainer.appendChild(cardDiv);
        });
      }

      // Fetch card data from Scryfall
      function fetchCardData(cardName) {
        return fetch(`https://api.scryfall.com/cards/named?exact=${encodeURIComponent(cardName)}`)
          .then(response => response.json())
          .catch(error => {
            console.error("Error fetching card data:", error);
            return null;
          });
      }

      // Play a card: remove it from hand and add it to the play area
      function playCard(cardIndex) {
        const card = playerHand[cardIndex];
        if (!card) return;
        playerHand.splice(cardIndex, 1);
        renderHand();

        const playArea = document.getElementById("play-area");
        if (!playArea) {
          console.error("Play area not found!");
          return;
        }
        const playedCard = document.createElement("div");
        playedCard.className = "played-card";
        // Use Scryfall API to get card details and display an image if available
        fetchCardData(card).then(data => {
          if (data && data.image_uris && data.image_uris.normal) {
            const img = document.createElement("img");
            img.src = data.image_uris.normal;
            img.alt = card;
            img.style.maxWidth = "100px"; // Adjust the size as needed
            playedCard.innerHTML = ""; // Clear text
            playedCard.appendChild(img);
          } else {
            playedCard.textContent = card;
          }
        });

        playArea.appendChild(playedCard);

        // Reset selection
        selectedCard = null;
        const selectedElem = document.querySelector(".card.selected");
        if (selectedElem) selectedElem.classList.remove("selected");
        console.log("Card played:", card);
      }

      // Set up the play area to accept clicks and drops
      function setupPlayArea() {
        const playArea = document.getElementById("play-area");
        if (!playArea) {
          console.error("Play area not found!");
          return;
        }

        playArea.addEventListener("click", () => {
          if (selectedCard !== null) {
            playCard(selectedCard);
          } else {
            console.log("No card selected to play.");
          }
        });

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

      const createGameBtn = document.getElementById("create-game");
      if (!createGameBtn) {
        console.error("Create Game button not found!");
      } else {
        console.log("Create Game button found.");
      }

      createGameBtn.addEventListener("click", () => {
        console.log("Create Game button pressed.");
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

            // Display the room code overlay
            const roomCodeElem = document.getElementById("room-code");
            if (!roomCodeElem) {
              console.error("Room code element not found!");
            } else {
              roomCodeElem.textContent = "Room Code: " + gameId;
              roomCodeElem.style.display = "block";
              console.log("Room code set to:", roomCodeElem.textContent);
            }

            initializeGame();
            setupPlayArea();
          })
          .catch((error) => {
            console.error("Error creating game:", error);
          });
      });

      const joinGameBtn = document.getElementById("join-game");
      joinGameBtn.addEventListener("click", () => {
        const gameCode = document.getElementById("game-code").value.trim().toUpperCase();
        if (!gameCode) {
          alert("Please enter a valid game code.");
          return;
        }
        console.log("Attempting to join game:", gameCode);
        document.getElementById("game-lobby").style.display = "none";
        document.getElementById("game-board").style.display = "block";

        // Optionally, display the room code overlay even for joined games:
        const roomCodeElem = document.getElementById("room-code");
        if (roomCodeElem) {
          roomCodeElem.textContent = "Room Code: " + gameCode;
          roomCodeElem.style.display = "block";
          console.log("Room code set to:", roomCodeElem.textContent);
        } else {
          console.error("Room code element not found on join!");
        }

        initializeGame();
        setupPlayArea();
      });

      const drawCardBtn = document.getElementById("draw-card");
      drawCardBtn.addEventListener("click", () => {
        drawCard();
        console.log("Draw Card button pressed.");
      });

      // Optional: Initial Scryfall test call (can be removed if not needed)
      fetchCardData("Lightning Bolt").then(data => {
        console.log("Test fetch for Lightning Bolt:", data);
      });

    }); // End of firebase-database import
  }); // End of firebase-app import
});

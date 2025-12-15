document.getElementById("generate").addEventListener("click", async () => {
  const status = document.getElementById("status");
  status.textContent = "Loading...";

  try {
    const response = await fetch("https://api.adviceslip.com/advice");
    const data = await response.json();
    document.getElementById("post").value = data.slip.advice;
    status.textContent = "Success";
  } catch (e) {
    status.textContent = "Error fetching quote";
    console.error("Error fetching quote", e.message);
  }
});

document.getElementById("save").addEventListener("click", async () => {
  const postContent = document.getElementById("post").value;
  const status = document.getElementById("status");

  if (!postContent) {
    status.textContent = "No post to save!";
    return;
  }

  status.textContent = "Saving post...";
  try {
    await new Promise((resolve, reject) => {
      setTimeout(resolve, 1500);
    }); // Simulate network timeout
    status.textContent = "Poast saved!";
    document.getElementById("post").value = "";
    return;
  } catch (e) {
    status.textContent = "Error saving post";
    console.error("Error saving post", e.message);
    return;
  }
});

let socket;

function connect() {
  const socket = new WebSocket("wss://api.whitebit.com/ws");

  document.getElementById("currency_status").textContent = "🟡 Connecting...";
  document.getElementById("currency_status").className = "connecting";

  socket.onopen = () => {
    console.log("Connected to Whitebit API");

    document.getElementById("currency_status").textContent = "🟢 Connected!";
    document.getElementById("currency_status").className = "connected";

    const message = {
      id: 1,
      method: "depth_subscribe",
      params: ["BTC_USDT", 1, "0"],
    };

    socket.send(JSON.stringify(message));
  };

  socket.onmessage = (event) => {
    const data = JSON.parse(event.data);

    if (data.method === "depth_update") {
      const price = data.params?.[1]?.bids?.[0]?.[0];

      if (price) {
        const priceDiff =
          parseFloat(
            document.getElementById("price").textContent.substring(1)
          ) - price;

        const trend = priceDiff > 0 ? "↑" : "↓";
        const trendStyle = priceDiff > 0 ? "connected" : "disconnected";
        document.getElementById("trend").textContent = trend;
        document.getElementById("trend").className = trendStyle;
        document.getElementById("price").textContent = `$${price}`;
      }
    }
  };

  socket.onclose = (event) => {
    console.log("Disconnected from Whitebit API", event);
    document.getElementById("currency_status").textContent = "🔴 Disconnected";
    document.getElementById("currency_status").className = "disconnected";

    setTimeout(() => connect(), 3000); // Reconnect after 3 seconds if disconnected
  };

  socket.onerror = (error) => {
    console.error("WebSocket error:", error);
    document.getElementById("currency_status").textContent = "🔴 Disconnected";
    document.getElementById("currency_status").className = "disconnected";
  };
}

connect();

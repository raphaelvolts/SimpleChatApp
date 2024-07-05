const urlParts = document.URL.split("/");
const roomName = urlParts.at(-1);
const socket = new WebSocket(`ws://localhost:3000/chat/${roomName}`);
let username = prompt("Enter your username. (no spaces)");

socket.onopen = (evt) => {
  console.log("WebSocket Opened!");
  const data = { type: "join", name: username };
  socket.send(JSON.stringify(data));
};

socket.onmessage = (evt) => {
  console.log("New Message recieved", evt);
  let msg = JSON.parse(evt.data);
  if (msg.type === "note") {
    if (msg.name === "error") {
      alert(msg.text);
      setTimeout(() => {
        return reload();
      }, 2000);
    }
    const item = document.createElement("li");
    const text = document.createElement("i");
    text.textContent = msg.text;
    item.appendChild(text);
    document.querySelector("#messages").appendChild(item);
  } else if (msg.type === "chat") {
    const item = document.createElement("li");
    item.innerHTML = `<b>${msg.name}:</b> ${msg.text}`;
    document.querySelector("#messages").appendChild(item);
  }
};

socket.onerror = (evt) => {
  console.log("Something went wrong!");
  console.log(evt);
};

socket.close = (evt) => {
  console.log("WEB SOCKET HAS BEEN CLOSED");
};

document.querySelector("#msg-form").addEventListener("submit", (evt) => {
  evt.preventDefault();
  const input = document.querySelector("#messageInput");
  const payload = JSON.stringify({ type: "chat", text: input.value });
  socket.send(payload);
  input.value = "";
});

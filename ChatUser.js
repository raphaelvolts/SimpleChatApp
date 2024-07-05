const Room = require("./Room");

class ChatUser {
  constructor(send, roomName) {
    this._send = send;
    this.room = Room.get(roomName);
    this.name = null;
  }

  send(data) {
    try {
      this._send(data);
    } catch {}
  }

  handleJoin(name) {
    const isUsernameAvl = this.isUsernameAvl(name);
    if (isUsernameAvl) {
      this.name = name;
      this.room.join(this);
      this.room.broadcast({
        type: "note",
        text: `${this.name} joined ${this.room.name}`
      });
    } else {
      const rand1 = Math.floor(Math.random() * 10);
      const rand2 = Math.floor(Math.random() * 100);
      this.name = `${name}-${rand1}-${rand2}`;
      this.room.join(this);
      this.room.broadcast({
        type: "note",
        text: `User by the ID ${name} is already in ${this.room.name}. Username set to ${this.name}`
      });
    }
  }

  handleChat(text) {
    this.room.broadcast({
      name: this.name,
      type: "chat",
      text: text
    });
  }

  handlePrivateChat(recepient, text) {
    const member = this.room.getMember(recepient);
    member.send(
      JSON.stringify({
        name: this.name,
        type: "priv-chat",
        text: text
      })
    );
  }

  handleMessage(jsonData) {
    let msg = JSON.parse(jsonData);
    if (msg.type === "join") this.handleJoin(msg.name);
    else if (msg.type === "chat") this.handleChat(msg.text);
    else if (msg.type === "get-members") this.handleGetMembers();
    else if (msg.type === "change-username")
      this.handleChangeUsername(msg.text);
    else if (msg.type === "priv-chat")
      this.handlePrivateChat(msg.recepient, msg.text);
    else throw new Error(`bad message: ${msg.text}`);
  }

  handleClose() {
    this.room.leave(this);
    this.room.broadcast({
      type: "note",
      text: `${this.name} has left ${this.room.name}`
    });
  }

  handleGetMembers() {
    const members = this.room.getMembers();
    const memberNames = [];
    for (let member of members) {
      memberNames.push(member.name);
    }
    this.send(
      JSON.stringify({
        name: "In room",
        type: "chat",
        text: memberNames.join(", ")
      })
    );
  }

  changeUsename(username) {
    this.name = username;
  }

  handleChangeUsername(username) {
    const isUsernameAvl = this.isUsernameAvl(username);
    if (isUsernameAvl) {
      const currentName = this.name;
      this.handleChangeUsername(username);
      const updatedName = this.name;

      this.room.broadcast({
        name: "server",
        type: "chat",
        text: `The username for ${currentName} has changed to ${updatedName}`
      });
    } else {
      this.room.broadcast({
        name: "server",
        type: "chat",
        text: `${this.name}, username cannot be changed as user under ${username} username already exists`
      });
    }
  }
  isUsernameAvl(username) {
    const members = this.room.getMembers();
    let isAvailable = true;
    for (let member of members) {
      if (member.name === username) isAvailable = false;
    }

    return isAvailable;
  }
}

module.exports = ChatUser;

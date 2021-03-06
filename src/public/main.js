const socket = io();

const inboxPeople = document.querySelector(".inbox__people");
const inputField = document.querySelector(".message_form__input");
const messageForm = document.querySelector(".message_form");
const messageBox = document.querySelector(".messages__history");
const fallback = document.querySelector(".fallback");
const nickInput = document.querySelector(".nick_input");

let nickName = "";
let usersOnline = [];

const newUserConnected = (user) => {
  nickName = prompt(
    "Informe como vc quer se indentificar, caso nao deseje aperte ENTER:"
  );

  if (!nickName || nickName == "") {
    nickName = user || `User${Math.floor(Math.random() * 1000000)}`;
  } else {
    console.log(nickName);
    nickName = nickName.slice() + `${Math.floor(Math.random() * 100)}`;
  }

  socket.emit("new user", nickName);
  addToUsersBox(nickName);
};

const addToUsersBox = (nickName) => {
  if (!!document.querySelector(`.${nickName}-userlist`)) {
    return;
  }
  const userBox = `
    <div class="chat_ib ${nickName}-userlist">
      <h5>${nickName}</h5>
    </div>
  `;
  inboxPeople.innerHTML += userBox;
};

// new user is created so we generate nickname and emit event

const addNewMessage = ({ user, message }) => {
  const time = new Date();
  const formattedTime = time.toLocaleString("pt-PT", {
    hour: "numeric",
    minute: "numeric",
  });

  const receivedMsg = `
  <div class="incoming__message">
    <div class="received__message">
      <span class="message__author">${user}</span>
      <div class="message__info">
        <p>${message}</p>
        <span class="time_date">${formattedTime}</span>
      </div>
    </div>
  </div>`;

  const myMsg = `
  <div class="outgoing__message">
    <div class="sent__message">
      <p>${message}</p>
      <div class="message__info">
        <span class="time_date">${formattedTime}</span>
      </div>
    </div>
  </div>`;

  messageBox.innerHTML += user === nickName ? myMsg : receivedMsg;

  scroll();
};

function scroll() {
  messageBox.scrollBy(0, messageBox.getBoundingClientRect().height);
}

newUserConnected();

messageForm.addEventListener("submit", (e) => {
  e.preventDefault();
  if (!inputField.value) {
    return;
  }

  socket.emit("chat message", {
    message: inputField.value,
    nick: nickName,
  });

  inputField.value = "";
});

inputField.addEventListener("keydown", () => {
  socket.emit("typing", {
    isTyping: inputField.value.length > 0,
    nick: nickName,
  });
});


socket.on("new user", function (data) {
  data.map((user) => addToUsersBox(user));
});

socket.on("user disconnected", function (nickName) {
  document.querySelector(`.${nickName}-userlist`).remove();
});

socket.on("chat message", function (data) {
  addNewMessage({ user: data.nick, message: data.message });
});


socket.on("typing", function (data) {
  const { isTyping, nick } = data;

  endAndStartTimer(() => {fallback.innerHTML = ""})

  fallback.innerHTML = `<p>${nick} esta digitando...</p>`;
});

var timer;
function endAndStartTimer(shouldDo) {
  window.clearTimeout(timer);
  timer = window.setTimeout(shouldDo ,1000); 
}

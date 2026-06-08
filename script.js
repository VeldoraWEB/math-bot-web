let step = "idle";       
let userName = "";
let storedNumbers = [];
let isWaitingForResponse = false;

const messagesContainer = document.getElementById("messagesArea");
const messageInput = document.getElementById("messageInput");
const sendBtn = document.getElementById("sendButton");

function scrollToBottom() {
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

function addMessage(text, isUser) {
    const messageDiv = document.createElement("div");
    messageDiv.className = `message-row ${isUser ? 'message-user' : 'message-bot'}`;
    const avatarDiv = document.createElement("div");
    avatarDiv.className = "avatar";
    const img = document.createElement("img");
    img.src = isUser ? "user_avatar.png" : "bot_avatar.png";
    img.alt = isUser ? "User avatar" : "Bot avatar";
    img.style.width = "100%";
    img.style.height = "100%";
    img.style.objectFit = "cover";
    img.style.borderRadius = "50%";
    avatarDiv.appendChild(img);

    const bubbleDiv = document.createElement("div");
    bubbleDiv.className = "bubble";
    bubbleDiv.innerText = text;

    messageDiv.appendChild(avatarDiv);
    messageDiv.appendChild(bubbleDiv);
    messagesContainer.appendChild(messageDiv);
    scrollToBottom();
    return messageDiv;
}

let typingIndicatorElement = null;
function removeTypingIndicator() {
    if (typingIndicatorElement && typingIndicatorElement.parentNode) {
        typingIndicatorElement.remove();
        typingIndicatorElement = null;
    }
}

function showTypingIndicator() {
    removeTypingIndicator();
    const indicatorRow = document.createElement("div");
    indicatorRow.className = "message-row message-bot";
    const avatarDiv = document.createElement("div");
    avatarDiv.className = "avatar";
    const img = document.createElement("img");
    img.src = "bot_avatar.png";
    img.alt = "Bot avatar";
    img.style.width = "100%";
    img.style.height = "100%";
    img.style.objectFit = "cover";
    img.style.borderRadius = "50%";
    avatarDiv.appendChild(img);
    const bubbleDiv = document.createElement("div");
    bubbleDiv.className = "typing-bubble";
    bubbleDiv.innerHTML = `<span class="dot"></span><span class="dot"></span><span class="dot"></span>`;
    indicatorRow.appendChild(avatarDiv);
    indicatorRow.appendChild(bubbleDiv);
    messagesContainer.appendChild(indicatorRow);
    typingIndicatorElement = indicatorRow;
    scrollToBottom();
}

function sendBotResponse(responseText) {
    removeTypingIndicator();
    addMessage(responseText, false);
    isWaitingForResponse = false;
    toggleSendButton();
    scrollToBottom();
}

function parseNumbersFromString(str) {
    const matches = str.match(/-?\d+(?:\.\d+)?/g);
    if (!matches) return [];
    return matches.map(Number);
}

function getBotReply(userMessage) {
    const trimmed = userMessage.trim();
    if (trimmed === "") return null;

    if (trimmed.toLowerCase() === "/stop") {
        step = "idle";
        userName = "";
        storedNumbers = [];
        return "Всего доброго, если хочешь поговорить пиши /start";
    }
    
    if (trimmed.toLowerCase() === "/start") {
        step = "await_name";
        userName = "";
        storedNumbers = [];
        return "Меня зовут Math-Bot, а как зовут тебя? /name: (твоё имя), обязательно с :";
    }
    
    if (step === "await_name") {
        const lowerMsg = trimmed.toLowerCase();
        if (lowerMsg.startsWith("/name:")) {
            let namePart = trimmed.substring(6).trim();
            if (namePart.length === 0) {
                return "Без имени бот не сможет продолжить работу =( (введи пожалуйста)";
            }
            userName = namePart;
            step = "await_numbers";
            return `Приветствую ${userName}! Я бот для счёта чисел. Введи числа, которые нужно посчитать, в формате /n: или /number: 7 9 134 (можно через пробел, запятую или точку с запятой), необязательно 3 числа`;
        } else {
            return "Введи /name: (твоё имя) или /start чтобы начать заново";
        }
    }
    
    if (step === "await_numbers") {
        const lowerMsg = trimmed.toLowerCase();
        if (lowerMsg.startsWith("/number:") || lowerMsg.startsWith("/n:")) {
            let numbersStr;
            if (lowerMsg.startsWith("/number:")) {
                numbersStr = trimmed.substring(8).trim();
            } else {
                numbersStr = trimmed.substring(3).trim();
            }
            const nums = parseNumbersFromString(numbersStr);
            if (nums.length === 0) {
                return "Скорее всего ты неправильно ввёл числа. Используй формат: /number: 7 9 134 или /n: 7 9 134";
            }
            storedNumbers = nums;
            step = "await_operation";
            return `Числа приняты: ${storedNumbers.join(', ')}. Теперь введи действие: + , - , * , /`;
        } else if (trimmed.toLowerCase() === "/start") {
            step = "await_name";
            return "Привет, меня зовут Math-Bot, а как зовут тебя? /name: (твоё имя), обязательно с :";
        } else {
            return "Пожалуйста, укажи числа в формате /number: 7 9 134 или /n: 7 9 134";
        }
    }

    if (step === "await_operation") {
        const op = trimmed.trim();
        if (op === "+" || op === "-" || op === "*" || op === "/") {
            if (!storedNumbers.length) {
                step = "await_numbers";
                return "Ошибка: числа не найдены. Введи /number: ... заново";
            }
            let result;
            let first = storedNumbers[0];
            if (storedNumbers.length === 1) {
                if (op === "+") result = first;
                else if (op === "-") result = -first;
                else if (op === "*") result = first * first;
                else if (op === "/") {
                    if (first === 0) return "Деление на ноль читерство! Пасхалка)";
                    result = first / first;
                }
            } else {
                let accumulator = first;
                for (let i = 1; i < storedNumbers.length; i++) {
                    if (op === "+") accumulator += storedNumbers[i];
                    else if (op === "-") accumulator -= storedNumbers[i];
                    else if (op === "*") accumulator *= storedNumbers[i];
                    else if (op === "/") {
                        if (storedNumbers[i] === 0) return "Деление на ноль читерство! Пасхалка)";
                        accumulator /= storedNumbers[i];
                    }
                }
                result = accumulator;
            }
            const resultStr = Number.isInteger(result) ? result : result.toFixed(6);
            const calculation = `${storedNumbers.join(' ' + op + ' ')} = ${resultStr}`;
            step = "await_numbers";
            storedNumbers = [];
            return `${userName}, твой результат: ${calculation}\n\nТеперь можешь ввести новые числа через /n: ... или /stop для выхода, /start для сброса имени.`;
        } else if (trimmed.toLowerCase() === "/start") {
            step = "await_name";
            storedNumbers = [];
            return "Начинаем заново! Как к тебе обращаться вновь? /name: твоё имя";
        } else {
            return "Необходимо ввести действие: + (сложение), - (вычитание), * (умножение), / (деление)";
        }
    }
    
    if (step === "idle") {
        return "Без команды /start бот не начнёт работу =)";
    }
    return "Введи другую команду";
}

function toggleSendButton() {
    const hasText = messageInput.value.trim().length > 0;
    if (hasText && !isWaitingForResponse) {
        sendBtn.disabled = false;
        sendBtn.classList.add("active");
    } else {
        sendBtn.disabled = true;
        sendBtn.classList.remove("active");
    }
}

async function handleSendMessage() {
    if (isWaitingForResponse) return;
    const rawMessage = messageInput.value;
    if (!rawMessage.trim()) return;
    const userMsg = rawMessage.trim();
    addMessage(userMsg, true);
    messageInput.value = "";
    messageInput.style.height = "auto";
    isWaitingForResponse = true;
    toggleSendButton();
    showTypingIndicator();
    setTimeout(() => {
        let botReply = getBotReply(userMsg);
        if (!botReply) botReply = "Произошла ошибка, попробуй /start";
        sendBotResponse(botReply);
    }, 600);
}

function onInputChange() {
    toggleSendButton();
    messageInput.style.height = "auto";
    if (messageInput.scrollHeight > 100) {
        messageInput.style.height = "100px";
        messageInput.style.overflowY = "auto";
    } else {
        messageInput.style.overflowY = "hidden";
    }
}

function onKeyPress(e) {
    if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        if (!sendBtn.disabled && !isWaitingForResponse) {
            handleSendMessage();
        }
    }
}

function initChat() {
    addMessage("Привет, введи команду /start для начала общения", false);
    scrollToBottom();
    messageInput.addEventListener("input", onInputChange);
    messageInput.addEventListener("keydown", onKeyPress);
    sendBtn.addEventListener("click", handleSendMessage);
    toggleSendButton();
}

initChat();
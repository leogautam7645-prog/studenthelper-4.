// Find the parts of the webpage StudentHelper needs.
const chat = document.getElementById("chat");
const form = document.getElementById("chat-form");
const input = document.getElementById("user-input");


// Add a message to the chat.
function addMessage(message, sender) {
  const messageElement = document.createElement("div");

  messageElement.classList.add("message");

  if (sender === "user") {
    messageElement.classList.add("user-message");
  } else {
    messageElement.classList.add("bot-message");
  }

  messageElement.textContent = message;
  chat.appendChild(messageElement);

  // Automatically scroll to the newest message.
  chat.scrollTop = chat.scrollHeight;
}


// Put a subject question into the input box.
function chooseSubject(subject) {
  input.value = "Help me learn " + subject + "!";
  input.focus();
}


function calculateMath(expression) {
  const tokens = expression.match(/\d+(?:\.\d+)?|[()+\-*/^]/g);

  if (!tokens || tokens.join("") !== expression.replace(/\s/g, "")) {
    return null;
  }

  let position = 0;

  function primary() {
    const token = tokens[position];

    if (token === "(") {
      position++;
      const value = addSubtract();

      if (tokens[position] !== ")") {
        throw new Error("Missing closing parenthesis");
      }

      position++;
      return value;
    }

    if (!token || !/^\d+(\.\d+)?$/.test(token)) {
      throw new Error("Invalid number");
    }

    position++;
    return Number(token);
  }

  function power() {
    const base = primary();

    if (tokens[position] === "^") {
      position++;
      return base ** unary();
    }

    return base;
  }

  function unary() {
    if (tokens[position] === "-") {
      position++;
      return -unary();
    }

    if (tokens[position] === "+") {
      position++;
      return unary();
    }

    return power();
  }

  function multiplyDivide() {
    let value = unary();

    while (tokens[position] === "*" || tokens[position] === "/") {
      const operator = tokens[position++];

      if (operator === "*") {
        value *= unary();
      } else {
        const next = unary();

        if (next === 0) {
          throw new Error("Cannot divide by zero");
        }

        value /= next;
      }
    }

    return value;
  }

  function addSubtract() {
    let value = multiplyDivide();

    while (tokens[position] === "+" || tokens[position] === "-") {
      const operator = tokens[position++];

      if (operator === "+") {
        value += multiplyDivide();
      } else {
        value -= multiplyDivide();
      }
    }

    return value;
  }

  try {
    const result = addSubtract();

    if (position !== tokens.length || !Number.isFinite(result)) {
      return null;
    }

    return result;
  } catch {
    return null;
  }
}

// Decide what answer StudentHelper should give.
function getAnswer(question) {
  const q = question.toLowerCase();

  // Recognize and solve basic math expressions.
  const mathMatch = question.match(/\d[\d\s()+\-*/^.]*/);

  if (mathMatch && /[+\-*/^]/.test(mathMatch[0])) {
    const expression = mathMatch[0].trim();
    const answer = calculateMath(expression);

    if (answer !== null) {
      return "Let's solve this step by step!\n\n" +
        "Problem: " + expression + "\n\n" +
        "Remember: Exponents are calculated before addition.\n\n" +
        "Answer: " + answer + "\n\n" +
        "You can send me another math problem to practice!";
    }

    return "I couldn't understand that math expression. Check the numbers and operators and try again.";
  }

  // Greetings
  if (q.includes("hello") || q.includes("hi") || q.includes("hey")) {
    return "Hello! What subject would you like help with today?";
  }

  // Math
  if (
    q.includes("math") ||
    q.includes("equation") ||
    q.includes("solve") ||
    q.includes("fraction") ||
    q.includes("slope") ||
    q.includes("pythagorean")
  ) {
    if (q.includes("pythagorean")) {
      return "The Pythagorean Theorem helps you find a missing side of a right triangle. Its formula is a² + b² = c². The letter c represents the hypotenuse, which is the longest side. For example, if the shorter sides are 3 and 4, then 3² + 4² = 9 + 16 = 25, so the hypotenuse is 5.";
    }

    if (q.includes("fraction")) {
      return "A fraction represents part of a whole. The top number is the numerator, and the bottom number is the denominator. For example, 1/2 means one out of two equal parts. What fraction problem would you like to work on?";
    }

    if (q.includes("slope")) {
      return "Slope tells you how steep a line is. You can calculate it using: slope = change in y ÷ change in x. Another way to write this is (y₂ - y₁) / (x₂ - x₁). Would you like to try an example?";
    }

    return "Let's work on math together! First, identify what the question is asking. Then we can list the information we know and solve it one step at a time. Send me the exact math problem so I can help explain it.";
  }

  // Science
  if (
    q.includes("science") ||
    q.includes("cell") ||
    q.includes("atom") ||
    q.includes("force") ||
    q.includes("energy") ||
    q.includes("gravity") ||
    q.includes("photosynthesis")
  ) {
    if (q.includes("photosynthesis")) {
      return "Photosynthesis is the process plants use to make their own food. Plants use sunlight, water, and carbon dioxide to produce glucose (a type of sugar) and oxygen.";
    }

    if (q.includes("gravity")) {
      return "Gravity is a force that attracts objects toward each other. Earth's gravity pulls objects toward the ground and helps keep the Moon in orbit around Earth.";
    }

    if (q.includes("atom")) {
      return "An atom is a tiny building block of matter. It contains protons and neutrons in the nucleus, with electrons around the nucleus.";
    }

    if (q.includes("cell")) {
      return "A cell is the basic unit of life. Cells carry out important jobs that help living things survive. Plant and animal cells have some parts in common, but plant cells also have a cell wall and chloroplasts.";
    }

    return "Let's explore science! Science helps us understand how the world works. Tell me the exact topic or question you are studying, and I'll help explain it.";
  }

  // English
  if (
    q.includes("english") ||
    q.includes("grammar") ||
    q.includes("metaphor") ||
    q.includes("simile") ||
    q.includes("noun") ||
    q.includes("verb") ||
    q.includes("theme")
  ) {
    if (q.includes("simile")) {
      return "A simile compares two things using the words 'like' or 'as'. Example: 'The classroom was as quiet as a library.'";
    }

    if (q.includes("metaphor")) {
      return "A metaphor compares two things without using 'like' or 'as'. Example: 'The classroom was a zoo.' This means the classroom was very noisy or chaotic.";
    }

    if (q.includes("noun")) {
      return "A noun is a word that names a person, place, thing, or idea. Examples include teacher, school, book, and happiness.";
    }

    if (q.includes("verb")) {
      return "A verb is a word that shows an action or a state of being. Examples include run, jump, think, is, and are.";
    }

    if (q.includes("theme")) {
      return "The theme is the main message or lesson of a story. For example, a story about a character learning to be honest might have the theme that honesty is important.";
    }

    return "Let's work on English! I can help explain grammar, reading, writing, and literary devices. Send me the sentence, passage, or question you are working on.";
  }

  // Social Studies
  if (
    q.includes("social studies") ||
    q.includes("history") ||
    q.includes("constitution") ||
    q.includes("government") ||
    q.includes("revolution") ||
    q.includes("democracy")
  ) {
    if (q.includes("constitution")) {
      return "The United States Constitution is the document that establishes the structure of the U.S. government and explains its powers. It also protects important rights and freedoms.";
    }

    if (q.includes("democracy")) {
      return "A democracy is a type of government in which people have a role in making decisions, often by voting for leaders or on issues.";
    }

    if (q.includes("revolution")) {
      return "A revolution is a major change in a government or society. The American Revolution was the conflict in which the thirteen colonies fought for independence from Great Britain.";
    }

    return "Let's study history and government! Tell me the exact event, person, document, or concept you are learning about, and I'll help explain it.";
  }

  // Help with a general school question.
  if (q.includes("help me learn")) {
    return "Great choice! Send me a specific question or topic from that subject. I'll help break it down into smaller steps.";
  }

  // If StudentHelper does not recognize the question.
  return "I want to help you with that! I don't have a specific answer ready for this question yet. Try adding the subject or sending the exact question from your assignment. I'll do my best to guide you.";
}


// Handle a question when the student presses Send.
function sendMessage(question) {
  const cleanedQuestion = question.trim();

  if (cleanedQuestion === "") {
    return;
  }

  addMessage(cleanedQuestion, "user");

  input.value = "";

  const answer = getAnswer(cleanedQuestion);

  // Add a short delay before the answer appears.
  window.setTimeout(function () {
    addMessage(answer, "bot");
  }, 400);
}


// Listen for the chat form being submitted.
form.addEventListener("submit", function (event) {
  event.preventDefault();
  sendMessage(input.value);
});


// Make every subject button work.
const subjectButtons = document.querySelectorAll("[data-subject]");

subjectButtons.forEach(function (button) {
  button.addEventListener("click", function () {
    const subject = button.getAttribute("data-subject");
    chooseSubject(subject);
  });
});

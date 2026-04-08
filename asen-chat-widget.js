{
  /* <script>
window.AsenChatConfig = {
  apiUrl: "LAMBDA_URL", // Replace with your API endpoint
  siteName: "Asen Marketing",
  title: "Chat with SITE_NAME",
  launcherLabel: "Chat",
  welcomeMessage: "Hi! Ask us about our services, websites, SEO, or how to get started.",
  placeholder: "Type your question...",
  servicesUrl: "https://asenmarketing.com/services",
  contactUrl: "https://asenmarketing.com/contact",
  primaryColor: "#111111",
  accentColor: "#ffffff",
  position: "right",
  zIndex: 999999,
  maxWidth: "380px"
};
</script>
<script src="https://asenmarketing.github.io/asen-chat-widget.js" defer></script> */
}

(function () {
  if (window.AsenChatWidgetLoaded) return;
  window.AsenChatWidgetLoaded = true;

  var config = Object.assign(
    {
      apiUrl: "",
      siteName: "Website Assistant",
      title: "Chat",
      launcherLabel: "Chat",
      welcomeMessage: "Hi! How can I help?",
      placeholder: "Ask a question...",
      servicesUrl: "",
      contactUrl: "",
      primaryColor: "#111111",
      accentColor: "#ffffff",
      position: "right",
      zIndex: 999999,
      maxWidth: "380px",
    },
    window.AsenChatConfig || {},
  );

  if (!config.apiUrl) {
    console.warn("Asen Chat Widget: Missing apiUrl in window.AsenChatConfig");
    return;
  }

  var state = {
    isOpen: false,
    isSending: false,
    sessionId: null,
  };

  var style = document.createElement("style");
  style.innerHTML = `
    .asen-chat-widget {
      --asen-chat-primary: ${config.primaryColor};
      --asen-chat-accent: ${config.accentColor};
      --asen-chat-bg: #ffffff;
      --asen-chat-text: #1f2937;
      --asen-chat-muted: #6b7280;
      --asen-chat-border: #e5e7eb;
      --asen-chat-user-bg: var(--asen-chat-primary);
      --asen-chat-user-text: var(--asen-chat-accent);
      --asen-chat-bot-bg: #f3f4f6;
      --asen-chat-bot-text: #111827;
      --asen-chat-shadow: 0 12px 30px rgba(0,0,0,.16);
      --asen-chat-radius: 16px;

      font-family: var(--asen-chat-font);
      position: fixed;
      bottom: 20px;
      ${config.position === "left" ? "left: 20px;" : "right: 20px;"}
      z-index: ${config.zIndex};
      color: var(--asen-chat-text);
    }

    .asen-chat-widget *,
    .asen-chat-widget *::before,
    .asen-chat-widget *::after {
      box-sizing: border-box;
    }

    .asen-chat-launcher {
      appearance: none;
      border: 0;
      border-radius: 999px;
      background: var(--asen-chat-primary);
      color: var(--asen-chat-accent);
      padding: 14px 18px;
      font: inherit;
      font-weight: 600;
      cursor: pointer;
      box-shadow: var(--asen-chat-shadow);
      transition: transform .15s ease, opacity .15s ease;
    }

    .asen-chat-launcher:hover {
      transform: translateY(-1px);
    }

    .asen-chat-panel {
      width: min(calc(100vw - 32px), ${config.maxWidth});
      height: min(620px, calc(100vh - 100px));
      background: var(--asen-chat-bg);
      border: 1px solid var(--asen-chat-border);
      border-radius: var(--asen-chat-radius);
      box-shadow: var(--asen-chat-shadow);
      display: none;
      overflow: hidden;
    }

    .asen-chat-widget.is-open .asen-chat-panel {
      display: flex;
      flex-direction: column;
      margin-bottom: 12px;
    }

    .asen-chat-widget.is-open .asen-chat-launcher {
      display: none;
    }

    .asen-chat-header {
      background: var(--asen-chat-primary);
      color: var(--asen-chat-accent);
      padding: 14px 16px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
    }

    .asen-chat-header-title {
      margin: 0;
      font-size: 20px;
      font-weight: 700;
      line-height: 1.2;
    }

    .asen-chat-header-subtitle {
      margin: 4px 0 0;
      font-size: 16px;
      opacity: .9;
    }

    .asen-chat-close {
      appearance: none;
      background: transparent;
      border: 0;
      color: inherit;
      cursor: pointer;
      font: inherit;
      font-size: 26px;
      line-height: 1;
      padding: 0;
    }

    .asen-chat-messages {
      flex: 1;
      overflow-y: auto;
      padding: 16px;
      background: #fff;
    }

    .asen-chat-message-row {
      display: flex;
      margin-bottom: 14px;
    }

    .asen-chat-message-row.is-user {
      justify-content: flex-end;
    }

    .asen-chat-message {
      max-width: 85%;
      border-radius: 16px;
      padding: 12px 14px;
      font-size: 18px;
      line-height: 1.5;
      white-space: pre-wrap;
      word-break: break-word;
    }

    .asen-chat-message a:not(.asen-chat-link) {
      color: var(--asen-chat-accent);
      text-decoration: underline;
    }

    .asen-chat-message-row.is-user .asen-chat-message {
      background: var(--asen-chat-user-bg);
      color: var(--asen-chat-user-text);
      border-bottom-right-radius: 4px;
    }

    .asen-chat-message-row.is-bot .asen-chat-message {
      background: var(--asen-chat-bot-bg);
      color: var(--asen-chat-bot-text);
      border-bottom-left-radius: 4px;
    }

    .asen-chat-links {
      margin-top: 10px;
      display: flex;
      flex-wrap: wrap;
      gap: 3px;
    }

    .asen-chat-link {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      text-decoration: none;
      border: 1px solid var(--asen-chat-border);
      background: #fff;
      color: var(--asen-chat-accent);
      padding: 8px 10px;
      border-radius: 999px;
      font-size: 16px;
      font-weight: 600;
    }

    .asen-chat-link:hover {
      color: var(--asen-chat-accent);
    }

    .asen-chat-form {
      border-top: 1px solid var(--asen-chat-border);
      padding: 12px;
      background: #fff;
    }

    .asen-chat-input-wrap {
      display: flex;
      gap: 8px;
    }

    .asen-chat-input {
      width: 100%;
      min-width: 0;
      border: 1px solid var(--asen-chat-border);
      border-radius: 12px;
      padding: 0.5rem;
      font: inherit;
      font-size: 16px;
      color: var(--asen-chat-text);
      background: #fff;
    }

    .asen-chat-input:focus {
      outline: none;
      border-color: var(--asen-chat-primary);
      box-shadow: 0 0 0 3px rgba(0,0,0,.08);
    }

    body button[type="submit"].asen-chat-send {
      appearance: none;
      border: 0;
      border-radius: 12px;
      background: var(--asen-chat-primary);
      color: var(--asen-chat-text);
      padding: 0.5rem;
      font: inherit;
      font-weight: 700;
      font-size: 16px;
      cursor: pointer;
      white-space: nowrap;
    }

    .asen-chat-send[disabled] {
      opacity: .6;
      cursor: not-allowed;
    }

    .asen-chat-footer {
      margin-top: 8px;
      font-size: 11px;
      color: var(--asen-chat-muted);
    }

    .asen-chat-typing {
      display: inline-flex;
      align-items: center;
      gap: 4px;
    }

    .asen-chat-typing-dot {
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background: currentColor;
      opacity: .35;
      animation: asenChatPulse 1.2s infinite ease-in-out;
    }

    .asen-chat-typing-dot:nth-child(2) { animation-delay: .15s; }
    .asen-chat-typing-dot:nth-child(3) { animation-delay: .3s; }

    @keyframes asenChatPulse {
      0%, 80%, 100% { transform: scale(.8); opacity: .35; }
      40% { transform: scale(1); opacity: .85; }
    }

    @media (max-width: 640px) {
      .asen-chat-widget {
        left: 12px !important;
        right: 12px !important;
        bottom: 12px;
      }

      .asen-chat-panel {
        width: 100%;
        height: min(72vh, 620px);
      }

      .asen-chat-launcher {
        width: 100%;
        justify-content: center;
      }
    }
  `;
  document.head.appendChild(style);

  var root = document.createElement("div");
  root.className = "asen-chat-widget";
  root.innerHTML = `
    <div class="asen-chat-panel" aria-label="Chat window">
      <div class="asen-chat-header">
        <div>
          <div class="asen-chat-header-title">${escapeHtml(config.title)}</div>
          <div class="asen-chat-header-subtitle">${escapeHtml(config.siteName)}</div>
        </div>
        <button class="asen-chat-close" type="button" aria-label="Close chat">&times;</button>
      </div>

      <div class="asen-chat-messages" aria-live="polite"></div>

      <form class="asen-chat-form">
        <div class="asen-chat-input-wrap">
          <input class="asen-chat-input" type="text" placeholder="${escapeHtml(config.placeholder)}" />
          <button class="asen-chat-send" type="submit">Send</button>
        </div>
        <div class="asen-chat-footer">Answers are AI-assisted and based on available site information.</div>
      </form>
    </div>

    <button class="asen-chat-launcher" type="button">${escapeHtml(config.launcherLabel)}</button>
  `;
  document.body.appendChild(root);

  var launcher = root.querySelector(".asen-chat-launcher");
  var panel = root.querySelector(".asen-chat-panel");
  var closeBtn = root.querySelector(".asen-chat-close");
  var messagesEl = root.querySelector(".asen-chat-messages");
  var form = root.querySelector(".asen-chat-form");
  var input = root.querySelector(".asen-chat-input");
  var sendBtn = root.querySelector(".asen-chat-send");

  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function linkify(text) {
    return escapeHtml(text).replace(
      /(https?:\/\/[^\s<]+)/g,
      '<a href="$1" target="_blank" rel="noopener noreferrer">$1</a>',
    );
  }

  function openChat() {
    state.isOpen = true;
    root.classList.add("is-open");
    if (!messagesEl.dataset.initialized) {
      addBotMessage(config.welcomeMessage, buildWelcomeLinks());
      messagesEl.dataset.initialized = "true";
    }
    setTimeout(function () {
      input.focus();
      messagesEl.scrollTop = messagesEl.scrollHeight;
    }, 30);
  }

  function closeChat() {
    state.isOpen = false;
    root.classList.remove("is-open");
  }

  function setSending(isSending) {
    state.isSending = isSending;
    sendBtn.disabled = isSending;
    input.disabled = isSending;
  }

  function buildWelcomeLinks() {
    var links = [];
    if (config.servicesUrl)
      links.push({ label: "Explore Services", url: config.servicesUrl });
    if (config.contactUrl)
      links.push({ label: "Contact Us", url: config.contactUrl });
    return links;
  }

  function addMessage(role, html, links) {
    var row = document.createElement("div");
    row.className = "asen-chat-message-row is-" + role;

    var bubble = document.createElement("div");
    bubble.className = "asen-chat-message";
    bubble.innerHTML = html;

    if (Array.isArray(links) && links.length) {
      var linksWrap = document.createElement("div");
      linksWrap.className = "asen-chat-links";

      links.forEach(function (link) {
        if (!link || !link.url) return;
        var a = document.createElement("a");
        a.className = "asen-chat-link";
        a.href = link.url;
        a.target = "_blank";
        a.rel = "noopener noreferrer";
        a.textContent = link.label || "Learn more";
        linksWrap.appendChild(a);
      });

      bubble.appendChild(linksWrap);
    }

    row.appendChild(bubble);
    messagesEl.appendChild(row);
    messagesEl.scrollTop = messagesEl.scrollHeight;
    return row;
  }

  function addUserMessage(text) {
    return addMessage("user", linkify(text));
  }

  function addBotMessage(text, links) {
    return addMessage("bot", linkify(text), links);
  }

  function addTyping() {
    var row = document.createElement("div");
    row.className = "asen-chat-message-row is-bot asen-chat-typing-row";
    row.innerHTML = `
      <div class="asen-chat-message">
        <span class="asen-chat-typing">
          <span class="asen-chat-typing-dot"></span>
          <span class="asen-chat-typing-dot"></span>
          <span class="asen-chat-typing-dot"></span>
        </span>
      </div>
    `;
    messagesEl.appendChild(row);
    messagesEl.scrollTop = messagesEl.scrollHeight;
    return row;
  }

  async function sendMessage(message) {
    if (!message || state.isSending) return;

    addUserMessage(message);
    input.value = "";
    setSending(true);

    var typingEl = addTyping();

    try {
      var res = await fetch(config.apiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: message,
          sessionId: state.sessionId,
        }),
      });

      var data = await res.json().catch(function () {
        return {};
      });

      if (!res.ok) {
        throw new Error(data.error || "Something went wrong.");
      }

      if (typingEl && typingEl.parentNode)
        typingEl.parentNode.removeChild(typingEl);

      state.sessionId = data.sessionId || state.sessionId;

      addBotMessage(
        data.answer || "Sorry — I wasn’t able to generate a response.",
        Array.isArray(data.links) ? data.links : [],
      );
    } catch (err) {
      if (typingEl && typingEl.parentNode)
        typingEl.parentNode.removeChild(typingEl);

      addBotMessage(
        "Sorry — I’m having trouble right now. Please try again, or contact the team directly at " +
          (config.contactUrl || "#") +
          ".",
        buildWelcomeLinks(),
      );
      console.error("Asen Chat Widget error:", err);
    } finally {
      setSending(false);
      input.focus();
    }
  }

  launcher.addEventListener("click", openChat);
  closeBtn.addEventListener("click", closeChat);

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var message = (input.value || "").trim();
    if (!message) return;
    sendMessage(message);
  });
})();

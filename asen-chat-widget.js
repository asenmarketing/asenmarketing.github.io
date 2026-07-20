{
  /* <script>
window.AsenChatConfig = {
  apiUrl: "LAMBDA_URL", // Replace with your API endpoint
  title: "Chat with SITE_NAME",
  subtitle: "Asen Marketing",
  welcomeMessage: "Hi! Ask us about our services, websites, SEO, or how to get started.",
  launcherLabel: "Chat",
  placeholder: "Type your question...",
  servicesUrl: "https://asenmarketing.com/services",
  contactUrl: "https://asenmarketing.com/contact",
  primaryColor: "#111111",
  accentColor: "#ffffff",
  position: "right",
  zIndex: 999999,
  maxWidth: "380px",
  useLinks: true,
  footerLink: "https://asenmarketing.com/ai-chat-disclaimer.pdf",
  starterTopics: [
  {
    label: "Services",
    value: "Can you tell me about Asen's services?"
  },
  {
    label: "Websites",
    value: "I’m interested in a new website."
  },
  {
    label: "Marketing Questions",
    value: "I have a marketing question."
  },
  {
    label: "Asen Marketing",
    value: "Can you tell me more about Asen Marketing?"
  },
  {
    label: "Other",
    value: "I need help with something else."
  }
],
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
      title: "Chat",
      subtitle: "Website Assistant",
      welcomeMessage: "Hi! How can I help?",
      launcherLabel: "Chat",
      launcherIcon: "https://asenmarketing.github.io/ask-asen.webp",
      launcherExpandDelay: 3000,
      footerLogo: "https://asenmarketing.github.io/compass-logo.svg",
      placeholder: "Ask a question...",
      servicesUrl: "",
      contactUrl: "",
      primaryColor: "#111111",
      accentColor: "#ffffff",
      headerColor: "#1e2b3a",
      position: "right",
      zIndex: 999999,
      maxWidth: "380px",
      useLinks: false,
      starterTopics: [],
      persistSession: true,
      footerLink: "",
      storageKey: "asenChatSession",
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
      --asen-chat-header-bg: ${config.headerColor};
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
      border-radius: 16px;
      background: var(--asen-chat-primary);
      color: var(--asen-chat-accent);
      padding: 0.5rem;
      font: inherit;
      font-size: 14px;
      font-weight: 500;
      cursor: pointer;
      box-shadow: var(--asen-chat-shadow);
      display: inline-flex;
      align-items: center;
      overflow: hidden;
      margin-left: auto;
      transition: background .15s ease, color .15s ease;
      gap: 0.5rem;
    }

    .asen-chat-launcher-icon {
      flex: 0 0 auto;
      width: 70px;
      height: 70px;
      padding: 0;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .asen-chat-launcher-icon img {
      width: 100%;
      height: 100%;
      display: block;
      object-fit: contain;
    }

    .asen-chat-launcher-icon i {
      font-size: 40px;
    }

    .asen-chat-launcher-label {
      max-width: 0;
      opacity: 0;
      white-space: nowrap;
      overflow: hidden;
      padding-right: 0;
      font-size: 16px;
      transition: max-width .45s ease, opacity .35s ease, padding-right .45s ease;
    }

    .asen-chat-launcher.is-expanded .asen-chat-launcher-label {
      max-width: 220px;
      opacity: 1;
      padding-right: 20px;
    }

    .asen-chat-launcher:hover {
      background: var(--asen-chat-accent);
      color: var(--asen-chat-primary);
    }

    .asen-chat-panel {
      width: min(calc(50vw - 32px), ${config.maxWidth});
      height: min(70vh, 700px);
      background: var(--asen-chat-bg);
      border: none;
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
      background: var(--asen-chat-header-bg);
      color: #fff;
      padding: 20px 20px 18px;
      display: block;
      text-align: left;
      position: relative;
    }

    .asen-chat-header-title {
      margin: 0;
      font-size: 11px;
      font-weight: 600;
      line-height: 1.2;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      opacity: 0.55;
    }

    .asen-chat-header-subtitle {
      margin: 6px 0 0;
      font-size: 21px;
      font-weight: 700;
      opacity: 1;
    }

    .asen-chat-header-subtitle i {
      font-size: 18px;
      margin-left: 6px;
      color: var(--asen-chat-accent);
      opacity: 1;
    }

    .asen-chat-header-welcome {
      margin: 10px 0 0;
      font-size: 11px;
      font-weight: 400;
      line-height: 1.5;
      opacity: 0.75;
      max-width: 380px;
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
      position: absolute;
      top: 0.5rem;
      right: 1rem;
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
      height: fit-content;
    }

    .asen-chat-message-row.is-user {
      justify-content: flex-end;
    }

    .asen-chat-message {
      max-width: 85%;
      border-radius: 16px;
      padding: 12px 14px;
      font-size: 13px;
      font-weight: 600;
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
      flex-direction: column;
      flex-wrap: wrap;
      gap: 3px;
    }

    .asen-chat-link {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
      text-decoration: none;
      border: 1px solid var(--asen-chat-border);
      background: #fff;
      color: var(--asen-chat-accent);
      padding: 8px 10px;
      border-radius: 16px;
      font-size: 11px;
      font-weight: 400;
      width: 100%;
    }

    .asen-chat-link:hover {
      color: #fff;
      background: var(--asen-chat-accent);
    }

    .asen-chat-form {
      border-top: 1px solid var(--asen-chat-border);
      padding: 12px;
      background: #fff;
    }

    .asen-chat-input-wrap {
      display: flex;
      align-items: flex-end;
      gap: 8px;
      border: 1px solid var(--asen-chat-border);
      border-radius: 16px;
      background: #fff;
      padding: 10px 10px 10px 10px;
    height: 100%;
    max-height: 84px;
    }

    .asen-chat-input-wrap:focus-within {
      border-color: var(--asen-chat-primary);
      box-shadow: 0 0 0 3px rgba(0,0,0,.08);
    }

.asen-chat-input {
  width: 100%;
  min-width: 0;
  border: 0;
  border-radius: 0;
  font: inherit;
  font-size: 11px;
  color: var(--asen-chat-text);
  background: transparent;
  resize: none;
  overflow-y: auto;
  line-height: 1.5;
  min-height: 59px;
  max-height: 59px;
  display: block;
  padding-left: 8px;
}

    .asen-chat-input:focus {
      outline: none;
    }

    body button[type="submit"].asen-chat-send {
      appearance: none;
      border: 0;
      border-radius: 14px;
      background: var(--asen-chat-accent);
      color: #fff;
      padding: 0.5rem 1.4rem;
      font: inherit;
      font-weight: 600;
      font-size: 11px !important;
      cursor: pointer;
      white-space: nowrap;
      flex-shrink: 0;
      transition: opacity .15s ease;
      height: 100%;
    }

    body button[type="submit"].asen-chat-send:hover {
      opacity: 0.9;
    }

    .asen-chat-send[disabled] {
      opacity: .6;
      cursor: not-allowed;
    }

    .asen-chat-footer {
      margin-top: 8px;
      font-size: 11px;
      color: var(--asen-chat-muted);
      text-align: center;
    }

    .asen-chat-footer a {
    color: var(--asen-chat-muted);
    }

    .asen-chat-powered {
      font-size: 12px;
      color: var(--asen-chat-muted);
      margin-bottom: 4px;
    }

    .asen-chat-compass {
      font-weight: 700;
      color: var(--asen-chat-text);
    }

    .asen-chat-compass i {
      color: var(--asen-chat-accent);
      margin-right: 4px;
    }

    .asen-chat-compass-logo {
      height: 15px;
      width: auto;
      vertical-align: -3px;
      display: inline-block;
    }

    .asen-chat-disclaimer {
      font-size: 11px;
      color: var(--asen-chat-muted);
    }

    .asen-chat-footer a {
      color: var(--asen-chat-accent);
      text-decoration: underline;
    }

    .asen-chat-typing {
      display: flex;
      align-items: center;
      justify-content: center;
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

    .asen-chat-quick-replies {
      margin-top: 10px;
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
    }

    .asen-chat-quick-reply {
      border: 1px solid var(--asen-chat-border);
      background: #fff;
      color: var(--asen-chat-accent);
      border-radius: 8px;
      padding: 6px 12px;
      font: inherit;
      font-size: 11px;
      cursor: pointer;
      width: 100%;
      font-weight: 400;
      text-align: left;
    }
    
    .asen-chat-quick-reply:hover {
      color: #fff;
      background: var(--asen-chat-accent);
    }

    .asen-chat-typing-row .asen-chat-message {
      line-height: 0;
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
      }

      .asen-chat-launcher {
        width: 100%;
        justify-content: center;
      }

      .asen-chat-launcher-label {
        max-width: 220px;
        opacity: 1;
        padding-right: 12px;
      }

      .asen-chat-quick-reply {
      font-size: 14px;
        padding: 6px 8px;
      }

      .asen-chat-message {
      font-size: 16px;
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
          <div class="asen-chat-header-subtitle">${escapeHtml(config.subtitle)}<i class="fa-solid fa-sparkles"></i></div>
          <div class="asen-chat-header-welcome">${escapeHtml(config.welcomeMessage || "")}</div>
        </div>
        <button class="asen-chat-close" type="button" aria-label="Close chat">&minus;</button>
      </div>

      <div class="asen-chat-messages" aria-live="polite"></div>

      <form class="asen-chat-form">
        <div class="asen-chat-input-wrap">

          <textarea class="asen-chat-input" rows="1" placeholder="${escapeHtml(config.placeholder)}"></textarea>
          <button class="asen-chat-send" type="submit">Send</button>
        </div>
        <div class="asen-chat-footer">
          <div class="asen-chat-powered">Powered by ${
            config.footerLogo
              ? `<img class="asen-chat-compass-logo" src="${escapeHtml(config.footerLogo)}" alt="Compass" />`
              : `<span class="asen-chat-compass"><i class="fa-solid fa-sparkles"></i>Compass</span>`
          } from Asen</div>
          <div class="asen-chat-disclaimer">Our digital assistant's answers can be inaccurate. <a href="${escapeHtml(config.footerLink || "#")}" target="_blank" rel="noopener noreferrer">Read more here.</a></div>
        </div>
      </form>
    </div>

    <button class="asen-chat-launcher" type="button">
      <span class="asen-chat-launcher-icon">${
        config.launcherIcon
          ? `<img src="${escapeHtml(config.launcherIcon)}" alt="" aria-hidden="true" />`
          : '<i class="fa-solid fa-sparkles"></i>'
      }</span>
      <span class="asen-chat-launcher-label">${escapeHtml(config.launcherLabel)}</span>
    </button>
  `;
  document.body.appendChild(root);

  var launcher = root.querySelector(".asen-chat-launcher");

  if (config.launcherLabel) {
    var expandDelay = Number(config.launcherExpandDelay);
    if (!isFinite(expandDelay) || expandDelay < 0) expandDelay = 3000;
    setTimeout(function () {
      launcher.classList.add("is-expanded");
    }, expandDelay);
  }

  var panel = root.querySelector(".asen-chat-panel");
  var closeBtn = root.querySelector(".asen-chat-close");
  var messagesEl = root.querySelector(".asen-chat-messages");
  var form = root.querySelector(".asen-chat-form");
  var input = root.querySelector(".asen-chat-input");
  var sendBtn = root.querySelector(".asen-chat-send");

  function autoResizeInput() {
    input.style.height = "auto";
    input.style.height = Math.min(input.scrollHeight, 120) + "px";
  }
  input.addEventListener("input", autoResizeInput);

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
      messagesEl.dataset.initialized = "true";

      if (!chatMessages.length) {
        showStarterTopics();
      }
    }

    saveChatSession();

    setTimeout(function () {
      input.focus();
      messagesEl.scrollTop = messagesEl.scrollHeight;
    }, 30);
  }

  function closeChat() {
    state.isOpen = false;
    root.classList.remove("is-open");
    saveChatSession();
  }

  function setSending(isSending) {
    state.isSending = isSending;
    sendBtn.disabled = isSending;
    input.disabled = isSending;
  }

  function clearQuickReplies() {
    var quickReplyGroups = root.querySelectorAll(".asen-chat-quick-replies");
    quickReplyGroups.forEach(function (group) {
      group.remove();
    });

    chatMessages.forEach(function (msg) {
      if (msg && msg.quickReplies) {
        msg.quickReplies = [];
      }
    });

    saveChatSession();
  }

  function getStarterTopics() {
    if (!Array.isArray(config.starterTopics)) return [];

    return config.starterTopics
      .filter(function (topic) {
        return topic && topic.label;
      })
      .map(function (topic) {
        return {
          label: topic.label,
          value: topic.value || topic.label,
        };
      });
  }

  function showStarterTopics() {
    var starterTopics = getStarterTopics();
    if (!starterTopics.length) return;

    addBotMessage("What can I help you with today?", [], starterTopics);
  }

  function buildWelcomeLinks() {
    if (config.useLinks === false) return [];
    var links = [];
    if (config.servicesUrl)
      links.push({ label: "Explore Services", url: config.servicesUrl });
    if (config.contactUrl)
      links.push({ label: "Contact Us", url: config.contactUrl });
    return links;
  }

  function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  function isValidPhone(phone) {
    const digits = phone.replace(/\D/g, "");
    return digits.length >= 10 && digits.length <= 15;
  }

  function addMessage(role, html, links, quickReplies) {
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

    if (Array.isArray(quickReplies) && quickReplies.length) {
      var quickWrap = document.createElement("div");
      quickWrap.className = "asen-chat-quick-replies";

      quickReplies.forEach(function (reply) {
        var btn = document.createElement("button");
        btn.type = "button";
        btn.className = "asen-chat-quick-reply";
        btn.textContent = reply.label;
        btn.addEventListener("click", function () {
          clearQuickReplies();
          sendMessage(reply.value || reply.label);
        });
        quickWrap.appendChild(btn);
      });

      bubble.appendChild(quickWrap);
    }

    row.appendChild(bubble);
    messagesEl.appendChild(row);
    messagesEl.scrollTop = messagesEl.scrollHeight;
    return row;
  }

  var chatMessages = [];

  var leadContext = {
    name: null,
    businessName: null,
    website: null,
    email: null,
    phone: null,
    marketingNeeds: [],
    servicesInterestedIn: [],
    goals: null,
    budget: null,
    timeline: null,
    additionalInfo: [],
  };

  function getStorageKey() {
    return config.storageKey || "asenChatSession";
  }

  function saveChatSession() {
    if (!config.persistSession) return;

    try {
      var payload = {
        isOpen: state.isOpen,
        sessionId: state.sessionId,
        chatMessages: chatMessages,
        leadContext: leadContext,
        initialized: messagesEl.dataset.initialized === "true",
        savedAt: Date.now(),
      };

      sessionStorage.setItem(getStorageKey(), JSON.stringify(payload));
    } catch (err) {
      console.warn("Asen Chat Widget: could not save session", err);
    }
  }

  function restoreChatSession() {
    if (!config.persistSession) return;

    try {
      var raw = sessionStorage.getItem(getStorageKey());
      if (!raw) return;

      var payload = JSON.parse(raw);

      if (!payload || !Array.isArray(payload.chatMessages)) return;

      state.sessionId = payload.sessionId || null;
      leadContext = Object.assign({}, leadContext, payload.leadContext || {});
      chatMessages = payload.chatMessages || [];

      messagesEl.innerHTML = "";

      chatMessages.forEach(function (msg) {
        if (!msg || !msg.role || !msg.content) return;

        addMessage(
          msg.role === "user" ? "user" : "bot",
          linkify(msg.content),
          msg.links || [],
          msg.quickReplies || [],
        );
      });

      if (payload.initialized && chatMessages.length) {
        messagesEl.dataset.initialized = "true";
      } else {
        delete messagesEl.dataset.initialized;
      }

      if (payload.isOpen) {
        state.isOpen = true;
        root.classList.add("is-open");
      }
    } catch (err) {
      console.warn("Asen Chat Widget: could not restore session", err);
    }
  }

  function addUserMessage(text) {
    chatMessages.push({ role: "user", content: text });
    var row = addMessage("user", linkify(text));
    saveChatSession();
    return row;
  }

  function addBotMessage(text, links, quickReplies) {
    chatMessages.push({
      role: "assistant",
      content: text,
      links: Array.isArray(links) ? links : [],
      quickReplies: Array.isArray(quickReplies) ? quickReplies : [],
    });

    var row = addMessage("bot", linkify(text), links, quickReplies);
    saveChatSession();
    return row;
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

    clearQuickReplies();

    addUserMessage(message);
    input.value = "";
    autoResizeInput();
    setSending(true);

    var typingEl = addTyping();

    try {
      var res = await fetch(config.apiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: message,
          messages: chatMessages.slice(-10),
          leadContext,
        }),
      });

      var data = await res.json().catch(function () {
        return {};
      });

      if (typingEl && typingEl.parentNode) {
        typingEl.parentNode.removeChild(typingEl);
      }

      if (!res.ok) {
        console.error("Asen Chat API error:", {
          status: res.status,
          response: data,
        });

        if (res.status === 429 && data.answer) {
          addBotMessage(
            data.answer,
            Array.isArray(data.links) && config.useLinks ? data.links : [],
            [],
          );
          return;
        }

        throw new Error(data.error || "Something went wrong.");
      }

      if (data.leadContext) {
        leadContext = Object.assign({}, leadContext, data.leadContext);

        saveChatSession();

        if (leadContext.email && !isValidEmail(leadContext.email)) {
          addMessage(
            "bot",
            "That email doesn’t look quite right — can you double check it?",
          );
          return;
        }

        if (leadContext.phone && !isValidPhone(leadContext.phone)) {
          addMessage(
            "bot",
            "Can you share a valid phone number? Just the digits is fine.",
          );
          return;
        }
      }

      state.sessionId = data.sessionId || state.sessionId;

      saveChatSession();

      addBotMessage(
        data.answer || "Sorry — I wasn’t able to generate a response.",
        Array.isArray(data.links) && config.useLinks ? data.links : [],
        Array.isArray(data.quickReplies) ? data.quickReplies : [],
      );

      if (data.closeChat) {
        console.log("Nonsensical response received, closing chat:", data);
        setTimeout(function () {
          closeChat();
        }, 2500);
      }
    } catch (err) {
      if (typingEl && typingEl.parentNode)
        typingEl.parentNode.removeChild(typingEl);

      addBotMessage(
        "Sorry — I’m having trouble right now. Please try again, or contact the team directly at " +
          (config.contactUrl || "#") +
          ".",
        buildWelcomeLinks(),
      );
      console.error("Asen Chat Widget error:", err.message, err);
    } finally {
      setSending(false);
      input.focus();
    }
  }

  restoreChatSession();

  launcher.addEventListener("click", openChat);
  closeBtn.addEventListener("click", closeChat);

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var message = (input.value || "").trim();
    if (!message) return;
    sendMessage(message);
  });

  input.addEventListener("keydown", function (e) {
    if (e.key !== "Enter") return;

    if (e.shiftKey) {
      return; // allow line break
    }

    e.preventDefault();

    var message = (input.value || "").trim();
    if (!message) return;

    sendMessage(message);
  });
})();

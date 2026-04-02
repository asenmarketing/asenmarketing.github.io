(function () {
  if (window.AsenChatWidgetLoaded) return;
  window.AsenChatWidgetLoaded = true;

  function initAsenChatWidget() {
    var config = Object.assign({
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
      maxWidth: "380px"
    }, window.AsenChatConfig || {});

    if (!config.apiUrl) {
      console.warn("Asen Chat Widget: Missing apiUrl in window.AsenChatConfig");
      return;
    }

    if (!document.body) {
      console.warn("Asen Chat Widget: document.body not available yet");
      return;
    }

    var state = {
      isOpen: false,
      isSending: false,
      sessionId: null
    };

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
        '<a href="$1" target="_blank" rel="noopener noreferrer">$1</a>'
      );
    }

    var style = document.createElement("style");
    style.innerHTML = `
      /* your existing widget CSS here */
    `;
    document.head.appendChild(style);

    var root = document.createElement("div");
    root.className = "asen-chat-widget";
    root.innerHTML = `
      <!-- your existing widget HTML here -->
    `;
    document.body.appendChild(root);

    var launcher = root.querySelector(".asen-chat-launcher");
    var closeBtn = root.querySelector(".asen-chat-close");
    var messagesEl = root.querySelector(".asen-chat-messages");
    var form = root.querySelector(".asen-chat-form");
    var input = root.querySelector(".asen-chat-input");
    var sendBtn = root.querySelector(".asen-chat-send");

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
      if (config.servicesUrl) links.push({ label: "Explore Services", url: config.servicesUrl });
      if (config.contactUrl) links.push({ label: "Contact Us", url: config.contactUrl });
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
            sessionId: state.sessionId
          })
        });

        var data = await res.json().catch(function () { return {}; });

        if (!res.ok) {
          throw new Error(data.error || "Something went wrong.");
        }

        if (typingEl && typingEl.parentNode) typingEl.parentNode.removeChild(typingEl);

        state.sessionId = data.sessionId || state.sessionId;

        addBotMessage(
          data.answer || "Sorry — I wasn’t able to generate a response.",
          Array.isArray(data.links) ? data.links : []
        );
      } catch (err) {
        if (typingEl && typingEl.parentNode) typingEl.parentNode.removeChild(typingEl);

        addBotMessage(
          "Sorry — I’m having trouble right now. Please try again, or contact the team directly at " +
          (config.contactUrl || "#") + ".",
          buildWelcomeLinks()
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
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initAsenChatWidget);
  } else {
    initAsenChatWidget();
  }
})();
let originalContent = ""; // Backup for original content

// Fetch and display current font size when popup loads
document.addEventListener("DOMContentLoaded", () => {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    chrome.scripting.executeScript({
      target: { tabId: tabs[0].id },
      func: () => getComputedStyle(document.body).fontSize
    }, (results) => {
      if (results && results.length > 0) {
        document.getElementById("fontSize").value = parseInt(results[0].result);
      }
    });
  });
});

// Sync color picker with manual hex input fields
const syncColorInputs = (pickerId, hexId) => {
  const picker = document.getElementById(pickerId);
  const hexInput = document.getElementById(hexId);

  picker.addEventListener("input", () => hexInput.value = picker.value);
  hexInput.addEventListener("input", () => {
    if (/^#[0-9A-Fa-f]{6}$/.test(hexInput.value)) picker.value = hexInput.value;
  });
};

syncColorInputs("textColor", "textHex");
syncColorInputs("bgColor", "bgHex");

// Apply changes to all text elements
document.getElementById("applyChanges").addEventListener("click", () => {
  const textColor = document.getElementById("textHex").value || document.getElementById("textColor").value;
  const bgColor = document.getElementById("bgHex").value || document.getElementById("bgColor").value;
  const fontSize = document.getElementById("fontSize").value;
  const fontFamily = document.getElementById("fontFamily").value;

  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    chrome.scripting.executeScript({
      target: { tabId: tabs[0].id },
      func: (textColor, bgColor, fontSize, fontFamily) => {
        document.body.style.backgroundColor = bgColor;
        document.body.style.color = textColor;
        document.body.style.fontFamily = fontFamily;
        document.body.style.fontSize = fontSize + "px";

        document.querySelectorAll("p, h1, h2, h3, h4, h5, h6, span, div").forEach(el => {
          el.style.color = textColor;
          el.style.fontFamily = fontFamily;
          el.style.fontSize = fontSize + "px";
        });
      },
      args: [textColor, bgColor, fontSize, fontFamily]
    });
  });
});

// Remove clutter functionality with styles
document.getElementById("removeClutter").addEventListener("click", () => {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    chrome.scripting.executeScript({
      target: { tabId: tabs[0].id },
      func: () => {
        window._originalContent = document.body.innerHTML; // Backup original content

        const content =
          document.querySelector("article") ||
          document.querySelector("main") ||
          Array.from(document.body.children).reduce((largest, el) => {
            return el.textContent.length > (largest?.textContent.length || 0) ? el : largest;
          }, null);

        if (content) {
          document.body.innerHTML = "";
          document.body.appendChild(content.cloneNode(true));
        }

        // Add immersive reader styles
        const immersiveStyle = document.createElement("style");
        immersiveStyle.textContent = `
          body {
            background-color: #fdfaf0;
            color: #333333;
            font-family: Georgia, 'Times New Roman', serif;
            font-size: 20px;
            line-height: 1.8;
            text-align: center;
            margin: 0;
            padding: 20px;
          }
          * {
            margin: 0 auto;
            max-width: 800px;
          }
          img {
            display: block;
            max-width: 100%;
            height: auto;
            margin: 20px auto;
          }
          p, h1, h2, h3, h4, h5, h6 {
            margin-bottom: 20px;
            text-align: left;
          }
        `;
        document.head.appendChild(immersiveStyle);
      }
    });
  });
});

// Reset button restores the original content
document.getElementById("resetChanges").addEventListener("click", () => {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    chrome.scripting.executeScript({
      target: { tabId: tabs[0].id },
      func: () => {
        if (window._originalContent) {
          document.body.innerHTML = window._originalContent;
          window._originalContent = ""; // Clear the backup
        } else {
          location.reload(); // Fallback reload
        }
      }
    });
  });
});
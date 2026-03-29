document.addEventListener("DOMContentLoaded", loadHighlights);

function loadHighlights() {
  chrome.storage.local.get(["highlights"], (result) => {
    const list = document.getElementById("list");
    list.innerHTML = "";

    (result.highlights || []).forEach((item, index) => {
      const div = document.createElement("div");
      div.className = "item";

      div.innerHTML = `
        <p>${item.text}</p>
        <button data-index="${index}">Delete</button>
        <button data-sum="${index}">Summarize</button>
      `;

      list.appendChild(div);
    });

    attachEvents();
  });
}

function attachEvents() {
  document.querySelectorAll("button[data-index]").forEach(btn => {
    btn.onclick = deleteHighlight;
  });

  document.querySelectorAll("button[data-sum]").forEach(btn => {
    btn.onclick = summarizeHighlight;
  });
}

function deleteHighlight(e) {
  const index = e.target.dataset.index;

  chrome.storage.local.get(["highlights"], (result) => {
    const highlights = result.highlights || [];
    highlights.splice(index, 1);

    chrome.storage.local.set({ highlights }, loadHighlights);
  });
}

async function summarizeHighlight(e) {
  const index = e.target.dataset.sum;

  chrome.storage.local.get(["highlights"], async (result) => {
    const text = result.highlights[index].text;

    const summary = await fetchSummary(text);

    alert(summary);
  });
}

async function fetchSummary(text) {
  try {
    const response = await fetch("http://localhost:3000/summarize", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ text })
    });

    const data = await response.json();
    return data.summary;

  } catch (err) {
    console.error(err);
    return "Error generating summary";
  }
}
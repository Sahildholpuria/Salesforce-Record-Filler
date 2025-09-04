async function runScript(mode) {
  let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  chrome.scripting.executeScript({
    target: { tabId: tab.id },
    func: fillSalesforceFields,
    args: [mode] // pass mode ("all" or "empty")
  });
}

document.getElementById("fillAll").addEventListener("click", () => runScript("all"));
document.getElementById("fillEmpty").addEventListener("click", () => runScript("empty"));

// We inject the same fill function from content.js but now inside popup.js
function fillSalesforceFields(mode) {
  function randomItem(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
  }

  function randomName() {
    const first = ["Amit", "Neha", "Rahul", "Priya", "Sahil", "Anita", "Rohit", "Divya", "Arjun", "Sneha"];
    const last = ["Sharma", "Verma", "Gupta", "Singh", "Kumar", "Patel", "Yadav", "Mehta", "Joshi", "Kapoor"];
    return randomItem(first) + " " + randomItem(last);
  }

  function randomEmail() {
    const domains = ["gmail.com", "yahoo.com", "outlook.com", "test.com"];
    return (
      randomItem(["amit", "neha", "rahul", "sahil", "divya", "arjun"]) +
      Math.floor(Math.random() * 1000) +
      "@" +
      randomItem(domains)
    );
  }

  function randomPhone() {
    return "+91 " + (9000000000 + Math.floor(Math.random() * 1000000000));
  }

  function randomWebsite() {
    const sites = ["example.com", "testsite.org", "mydemo.in", "dummy.co"];
    return "https://www." + randomItem(sites);
  }

  function randomAddress() {
    const streets = ["MG Road", "Station Road", "Civil Lines", "Mall Road", "Ring Road"];
    return Math.floor(Math.random() * 200) + ", " + randomItem(streets) + ", Jaipur";
  }

  function randomText() {
    const words = ["Salesforce", "Testing", "Automation", "QA", "Cloud", "Dummy", "Data", "Sandbox", "Lightning"];
    return randomItem(words) + " " + randomItem(words) + " " + randomItem(words);
  }

  function randomDate() {
    let today = new Date();
    today.setDate(today.getDate() - Math.floor(Math.random() * 30));
    return today.toISOString().split("T")[0];
  }

  function randomNumber(min = 1, max = 9999) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  let inputs = document.querySelectorAll("input, textarea, select");

  inputs.forEach(input => {
    let type = input.type || input.tagName.toLowerCase();
    if (input.disabled || input.readOnly) return;

    // Skip already filled fields if mode = "empty"
    if (mode === "empty" && input.value && type !== "checkbox" && type !== "select-one") {
      return;
    }

    let val = "";
    let fieldName = (input.name || input.id || "").toLowerCase();

    if (fieldName.includes("name")) {
      val = randomName();
    } else if (fieldName.includes("email")) {
      val = randomEmail();
    } else if (fieldName.includes("phone") || fieldName.includes("mobile")) {
      val = randomPhone();
    } else if (fieldName.includes("website") || fieldName.includes("url")) {
      val = randomWebsite();
    } else if (fieldName.includes("address")) {
      val = randomAddress();
    } else {
      switch (type) {
        case "text":
          val = randomText();
          break;
        case "number":
          val = randomNumber();
          break;
        case "date":
          val = randomDate();
          break;
        case "email":
          val = randomEmail();
          break;
        case "checkbox":
          input.checked = Math.random() > 0.5;
          break;
        case "select-one":
          if (input.options.length > 1) {
            input.selectedIndex =
              Math.floor(Math.random() * (input.options.length - 1)) + 1;
          }
          break;
        case "textarea":
          val = randomText() + " " + randomText();
          break;
        default:
          val = randomText();
          break;
      }
    }

    if (val && type !== "checkbox" && type !== "select-one") {
      input.value = val;
    }

    // Trigger events so Salesforce detects changes
    input.dispatchEvent(new Event("input", { bubbles: true }));
    input.dispatchEvent(new Event("change", { bubbles: true }));
  });
}

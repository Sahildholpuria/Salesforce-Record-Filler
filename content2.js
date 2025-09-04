/**
 * @file content.js
 * @description This script injects into a Salesforce page to fill form fields with dummy data.
 */

(function() {
    // --- Helper Functions for Data Generation ---

    const FIRST_NAMES = ["John", "Jane", "Alex", "Emily", "Chris", "Katie", "Michael", "Sarah", "David", "Laura"];
    const LAST_NAMES = ["Smith", "Doe", "Johnson", "Williams", "Brown", "Jones", "Miller", "Davis", "Rodriguez", "Martinez"];
    const DOMAINS = ["example.com", "test.org", "demo.net", "corp.io", "web.com"];
    const LOREM_WORDS = "lorem ipsum dolor sit amet consectetur adipiscing elit sed do eiusmod tempor incididunt ut labore et dolore magna aliqua ut enim ad minim veniam quis".split(" ");

    const getRandomElement = (arr) => arr[Math.floor(Math.random() * arr.length)];
    const generateRandomName = () => `${getRandomElement(FIRST_NAMES)} ${getRandomElement(LAST_NAMES)}`;
    const generateRandomEmail = () => `${getRandomElement(FIRST_NAMES).toLowerCase()}.${getRandomElement(LAST_NAMES).toLowerCase()}${Math.floor(Math.random() * 100)}@${getRandomElement(DOMAINS)}`;
    const generateRandomPhoneNumber = () => `(${Math.floor(200 + Math.random() * 799)}) ${Math.floor(200 + Math.random() * 799)}-${String(Math.floor(1000 + Math.random() * 9000))}`;
    const generateRandomNumber = (min = 1, max = 1000) => Math.floor(Math.random() * (max - min + 1)) + min;
    const generateRandomText = (wordCount = 10) => {
        let text = Array.from({ length: wordCount }, () => getRandomElement(LOREM_WORDS)).join(" ");
        return text.charAt(0).toUpperCase() + text.slice(1) + ".";
    };
    const getCurrentDate = (format = 'yyyy-mm-dd') => {
        const d = new Date();
        const yyyy = d.getFullYear();
        const mm = String(d.getMonth() + 1).padStart(2, '0');
        const dd = String(d.getDate()).padStart(2, '0');
        return `${yyyy}-${mm}-${dd}`;
    };
    const getCurrentDateTime = () => new Date().toISOString().slice(0, 16);

    /**
     * Fills a single form field with appropriate dummy data.
     * @param {HTMLElement} element - The form field element to fill.
     */
    function fillField(element) {
        if (element.dataset.sfFillerFilled) return; // Avoid re-filling

        let valueToSet;
        const type = (element.type || 'text').toLowerCase();
        const tagName = element.tagName.toLowerCase();
        const label = (element.ariaLabel || element.placeholder || '').toLowerCase();

        if (tagName === 'textarea') {
            valueToSet = generateRandomText(40);
        } else if (tagName === 'select') {
            const options = Array.from(element.querySelectorAll('option'));
            const validOptions = options.filter(opt => opt.value && !opt.disabled);
            if (validOptions.length > 0) {
                const randomOption = getRandomElement(validOptions);
                valueToSet = randomOption.value;
            }
        } else if (type === 'checkbox') {
            element.checked = Math.random() > 0.5;
        } else if (type === 'date') {
            valueToSet = getCurrentDate();
        } else if (type === 'datetime-local') {
            valueToSet = getCurrentDateTime();
        } else if (type === 'number' || label.includes('quantity') || label.includes('amount')) {
            valueToSet = generateRandomNumber();
        } else if (type === 'email' || label.includes('email')) {
            valueToSet = generateRandomEmail();
        } else if (type === 'tel' || label.includes('phone') || label.includes('mobile') || label.includes('fax')) {
            valueToSet = generateRandomPhoneNumber();
        } else if (type === 'text' || type === 'password' || type === 'url') {
            if (label.includes('name')) valueToSet = generateRandomName();
            else if (label.includes('company') || label.includes('account')) valueToSet = `${getRandomElement(LAST_NAMES)} Industries`;
            else if (label.includes('city')) valueToSet = "San Francisco";
            else if (label.includes('state')) valueToSet = "CA";
            else if (label.includes('zip') || label.includes('postal')) valueToSet = "94105";
            else if (label.includes('subject') || label.includes('title')) valueToSet = generateRandomText(5);
            else valueToSet = generateRandomText(3);
        }

        if (valueToSet !== undefined) {
            element.value = valueToSet;
        }

        // Programmatically dispatch events to ensure frameworks like LWC/Aura detect the change
        element.dispatchEvent(new Event('input', { bubbles: true, cancelable: true }));
        element.dispatchEvent(new Event('change', { bubbles: true, cancelable: true }));
        element.dispatchEvent(new Event('blur', { bubbles: true, cancelable: true }));

        element.dataset.sfFillerFilled = 'true';
    }

    // --- Main Execution ---

    const fields = document.querySelectorAll(
        'input:not([type="hidden"]):not([disabled]):not([readonly]), textarea:not([disabled]):not([readonly]), select:not([disabled]):not([readonly])'
    );

    let filledCount = 0;
    fields.forEach(field => {
        // A simple check to see if the element is visible on the screen
        if (field.offsetParent !== null) {
            fillField(field);
            filledCount++;
        }
    });

    console.log(`[Salesforce Data Filler] Successfully filled ${filledCount} fields.`);
})();

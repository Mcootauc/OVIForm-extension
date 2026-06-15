# OVIForm Autofill Extension

## What This Extension Does

OVIForm is a Chrome extension that autofills new client and patient intake forms in **IDEXX Neo** — a cloud-based veterinary practice management system. Veterinary staff can paste raw client/pet data (copied from another system, email, or document) into the extension popup, click a button, and have all form fields filled in automatically.

## Why It Exists

Entering new client and pet information into IDEXX Neo manually is repetitive and error-prone. This extension eliminates that data-entry work by parsing pasted text and mapping each field to the correct input on the Neo form.

## How It Works

### User Flow
1. User opens an IDEXX Neo new client/patient form in the browser.
2. User clicks the extension icon to open the popup.
3. User pastes client and pet info in `Label: Value` format into the textarea.
4. User clicks **Fill Form** — the extension fills all matching fields on the page.

### Input Format
The popup expects plain text where each line is `Label: Value`, e.g.:
```
First Name: Jane
Last Name: Doe
Email: jane@example.com
Phone: 555-123-4567
Address: 123 Main St
City: Columbus
State: OH
Zip Code: 43210
Name: Buddy
Species: Canine
Breed: Labrador Retriever
Sex: Male
Spayed/Neutered: Yes
Age: 3 years 2 months
Color: Black
Microchip: 123456789012345
Secondary First Name: John
Secondary Last Name: Doe
Secondary Phone: 555-987-6543
```

### Parsing Logic (`popup.js`)
- `parseFormText()` splits each line on `:`, normalizes the label to `snake_case`, and builds a key/value object.
- `mapGender()` converts `Sex` + `Spayed/Neutered` into the IDEXX Neo `gender_id` value (1=Neutered Male, 2=Male, 4=Spayed Female, 5=Female, 8=Unknown).
- `parseAge()` splits a freeform age string (e.g. "3 years 2 months") into separate `age_y`, `age_m`, `age_d` fields that Neo expects.
- Country is hardcoded to `United States`.

### Injection (`fillFormOnPage`)
`chrome.scripting.executeScript` injects `fillFormOnPage` into the active tab. This function:
- Fills client info fields by `id` (e.g. `txtFirstname`, `txtEmail`) for the **new client** form.
- Also fills legacy field names (`getElementsByName`) for the **update client** form.
- Fills pet fields: name, microchip, color, sex, age year/month/day.
- Opens the **species** Select2 dropdown using simulated `mousedown` events, then finds and clicks the matching option.
- Waits (polls every 500ms) for the **breed** dropdown to become enabled after species selection, then types the breed name into the Select2 search field and selects the first matching result.

All DOM interactions use `dispatchEvent(new Event('input', { bubbles: true }))` so that the React/Vue/Angular-backed inputs in IDEXX Neo register the change.

## File Structure

| File | Purpose |
|------|---------|
| `manifest.json` | Extension metadata, permissions, icons |
| `popup.html` | Extension popup UI (textarea + button) |
| `popup.js` | All parsing and injection logic |
| `styles.css` | Popup styling |
| `public/` | Extension icons (16×16, 32×32, 48×48, 192×192) |

## Permissions

- **`activeTab`** — read the current tab's ID to target script injection.
- **`scripting`** — inject `fillFormOnPage` into the active tab's page context.
- **`host_permissions: ["<all_urls>"]`** — IDEXX Neo can be served from customer-specific subdomains; the extension must be allowed to inject on any URL.

## Key Technical Details

- Manifest V3 extension.
- No background service worker — all logic runs in the popup.
- No remote code — all JS is bundled locally.
- Species/breed use Select2 dropdowns which require simulated mouse events rather than direct value assignment.
- Breed selection polls until species selection is complete (Neo disables breed until a species is chosen).

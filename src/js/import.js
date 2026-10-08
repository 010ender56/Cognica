import {
  loadTheme,
  createImageUploader,
  fileToBase64,
  createSetTemplate,
  initState,
  getState,
  saveFullState,
  updateState,
  generateNavbar,
} from "./lib.js";

const nav = generateNavbar();
document.body.prepend(nav);

let state;

async function initApp() {
  state = await getState();
  if (state) {
    loadTheme(state.userPrefs.theme);
  }
}

await initApp();

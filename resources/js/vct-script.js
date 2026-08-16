const CURRENT_VERSION = "1.1.0"; // current version
const UPDATE_JSON_URL =
  "https://raw.githubusercontent.com/theUssa1n/SplitSecond-VehicleColors-Tool/main/version.json"; // update info from GitHub
let currentUpdateData = null;
let closeBtn;

let updatePopup,
  updatePopupClose,
  updateVersionEl,
  updateChangesEl,
  updateLaterBtn,
  updateDownloadBtn;

function showUpdatePopup(updateData) {
  currentUpdateData = updateData;
  updateVersionEl.textContent = updateData.version;
  updateChangesEl.textContent =
    updateData.changes || "Click Download Now to get the latest version.";
  backdrop.classList.add("active");
  updatePopup.classList.add("active");
}

function hideUpdatePopup() {
  backdrop.classList.remove("active");
  updatePopup.classList.remove("active");
  currentUpdateData = null;
}

async function checkForUpdates(manualCheck = true) {
  const checkBtn = document.getElementById("checkUpdateBtn");
  const badge = document.getElementById("updateBadge");
  const originalHTML = checkBtn.innerHTML;

  checkBtn.classList.add("loading");
  checkBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
  checkBtn.disabled = true;

  try {
    const response = await fetch(`${UPDATE_JSON_URL}?t=${Date.now()}`);
    if (!response.ok) throw new Error("Failed to fetch update info");

    const updateData = await response.json();

    if (isNewerVersion(updateData.version, CURRENT_VERSION)) {
      badge.classList.add("show");
      toastManager.show(
        `New version available: ${updateData.version}!`,
        "info",
      );

      showUpdatePopup(updateData);
    } else if (manualCheck) {
      toastManager.show("You're using the latest version!", "success");
    }
  } catch (error) {
    if (manualCheck) {
      toastManager.show(
        `Couldn't check for updates. Error: ${error.message}`,
        "warning",
      );
    }
  } finally {
    checkBtn.innerHTML = originalHTML;
    checkBtn.disabled = false;
    checkBtn.classList.remove("loading");
  }
}

function isNewerVersion(newVer, currentVer) {
  const newParts = newVer.split(".").map(Number);
  const currParts = currentVer.split(".").map(Number);

  for (let i = 0; i < Math.max(newParts.length, currParts.length); i++) {
    const newP = newParts[i] || 0;
    const currP = currParts[i] || 0;
    if (newP > currP) return true;
    if (newP < currP) return false;
  }
  return false;
}

window.addEventListener("load", () => {
  updatePopup = document.querySelector(".update-popup");
  updatePopupClose = document.getElementById("updatePopupClose");
  updateVersionEl = document.getElementById("updateVersion");
  updateChangesEl = document.getElementById("updateChanges");
  updateLaterBtn = document.getElementById("updateLaterBtn");
  updateDownloadBtn = document.getElementById("updateDownloadBtn");
  closeBtn = document.querySelectorAll(
    ".guide-popup .close-btn, .vehicles-popup .close-btn, .library-popup .close-btn, .update-popup .close-btn",
  );

  closeBtn.forEach((e) => {
    e.addEventListener("click", () => {
      const popup = e.closest(
        ".guide-popup, .vehicles-popup, .library-popup, .update-popup",
      );
      if (popup === updatePopup) {
        hideUpdatePopup();
      } else {
        showPopup(popup, false);
      }
    });
  });

  updateLaterBtn.addEventListener("click", hideUpdatePopup);
  updateDownloadBtn.addEventListener("click", () => {
    if (currentUpdateData) {
      window.open(currentUpdateData.downloadUrl, "_blank");
      hideUpdatePopup();
    }
  });

  checkForUpdates(false);
});

class ToastManager {
  constructor() {
    ((this.queue = []),
      (this.active = []),
      (this.maxVisible = 3),
      (this.container = this.createContainer()),
      (this.position = "bottom-center"),
      this.updatePosition());
  }
  createContainer() {
    let e = document.querySelector(".toast-container");
    return (
      e ||
        ((e = document.createElement("div")),
        (e.className = "toast-container"),
        e.setAttribute("aria-live", "polite"),
        e.setAttribute("role", "region"),
        e.setAttribute("aria-label", "Notifications"),
        document.body.appendChild(e)),
      e
    );
  }
  updatePosition() {
    this.container.className = `toast-container ${this.position}`;
  }
  setPosition(e) {
    [
      "bottom-center",
      "bottom-left",
      "top-center",
      "top-right",
      "bottom-right",
    ].includes(e) && ((this.position = e), this.updatePosition());
  }
  show(e, a = "info", t = null) {
    const o = {
      message: e,
      type: a,
      duration: t || this.getDefaultDuration(a),
      id: Date.now() + Math.random(),
    };
    ("error" === a ? this.queue.unshift(o) : this.queue.push(o),
      this.processQueue());
  }
  getDefaultDuration(e) {
    return { success: 2500, info: 3e3, warning: 4e3, error: 6e3 }[e] || 3e3;
  }
  processQueue() {
    if (this.active.length >= this.maxVisible || 0 === this.queue.length)
      return;
    const e = this.queue.shift(),
      a = this.createToastElement(e);
    (this.container.appendChild(a),
      this.active.push(e),
      requestAnimationFrame(() => a.classList.add("show")),
      (e.timeout = setTimeout(() => this.dismiss(e.id), e.duration)),
      setTimeout(() => this.processQueue(), 100));
  }
  createToastElement(e) {
    const a = document.createElement("div");
    ((a.className = `toast-item ${e.type}`),
      a.setAttribute("role", "alert"),
      a.setAttribute("aria-live", "assertive"),
      (a.dataset.id = e.id));
    return (
      (a.innerHTML = `\n      <i class="fas ${
        {
          success: "fa-check-circle",
          error: "fa-exclamation-circle",
          warning: "fa-exclamation-triangle",
          info: "fa-info-circle",
        }[e.type]
      } toast-icon"></i>\n      <span class="toast-message">${
        e.message
      }</span>\n      <button class="toast-close" aria-label="Close notification">\n        <i class="fas fa-times"></i>\n      </button>\n    `),
      (a.querySelector(".toast-close").onclick = (a) => {
        (a.stopPropagation(), this.dismiss(e.id));
      }),
      a
    );
  }
  dismiss(e) {
    const a = this.active.findIndex((a) => a.id === e);
    if (-1 === a) return;
    const t = this.active[a];
    clearTimeout(t.timeout);
    const o = this.container.querySelector(`[data-id="${e}"]`);
    (o &&
      (o.classList.remove("show"),
      o.classList.add("hide"),
      o.addEventListener(
        "transitionend",
        () => {
          o.parentNode && o.remove();
        },
        { once: !0 },
      )),
      this.active.splice(a, 1),
      setTimeout(() => this.processQueue(), 350));
  }
  clearAll() {
    ((this.queue = []), this.active.forEach((e) => this.dismiss(e.id)));
  }
}
const toastManager = new ToastManager();
function escapeRegex(e) {
  return e.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
toastManager.setPosition("top-right");
const fileInput = document.getElementById("file-upload"),
  fileInputWrapper = document.querySelector(".file-input-wrapper"),
  carSelect = document.getElementById("car-select"),
  sizeSelect = document.getElementById("size-select"),
  syncBtn = document.getElementById("sync-btn"),
  maxSizeBtn = document.getElementById("max-size-btn"),
  colorsContainer = document.getElementById("colors-grid"),
  saveBtn = document.getElementById("save-btn"),
  themeToggle = document.querySelector(".theme-toggle"),
  guideBtn = document.getElementById("guideBtn"),
  vehiclesBtn = document.getElementById("vehiclesBtn"),
  libraryBtn = document.getElementById("libraryBtn"),
  guidePopup = document.querySelector(".guide-popup"),
  vehiclesPopup = document.querySelector(".vehicles-popup"),
  libraryPopup = document.querySelector(".library-popup"),
  vehicleSearch = document.getElementById("vehicle-search"),
  vehicleList = document.getElementById("vehicle-list"),
  libraryList = document.getElementById("library-list"),
  copyVehicleBtn = document.getElementById("copy-vehicle-btn"),
  pasteVehicleBtn = document.getElementById("paste-vehicle-btn"),
  randomAllBtn = document.getElementById("random-all-btn"),
  prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches,
  savedTheme = localStorage.getItem("theme"),
  isDark = "dark" === savedTheme || (!savedTheme && prefersDark);
setTheme(isDark);
const backdrop = document.querySelector(".backdrop");
let carColors = {},
  originalText = "",
  isSyncEnabled = !1,
  modifiedVehicles = new Set(),
  paletteClipboard = null,
  vehicleClipboard = null,
  library = JSON.parse(localStorage.getItem("colorLibrary") || "[]"),
  proColorPicker = null,
  proColorPickerState = {
    isOpen: !1,
    pointerMode: null,
    dragPanel: !1,
    dragOffsetX: 0,
    dragOffsetY: 0,
    targetInput: null,
    sourceHex: "#ffffff",
    h: 0,
    s: 0,
    v: 1,
  };
const vehiclePairs = {
  Musclecar_17: "Placeholder_09",
  Placeholder_09: "Musclecar_17",
  Musclecar_18: "Placeholder_10",
  Placeholder_10: "Musclecar_18",
  Musclecar_19: "Placeholder_08",
  Placeholder_08: "Musclecar_19",
  Truck_09: "Placeholder_11",
  Placeholder_11: "Truck_09",
  Unique_23: "Placeholder_07",
  Placeholder_07: "Unique_23",
  Unique_22: "Placeholder_06",
  Placeholder_06: "Unique_22",
  Unique_21: "Placeholder_05",
  Placeholder_05: "Unique_21",
  Supercar_20: "Placeholder_04",
  Placeholder_04: "Supercar_20",
  Supercar_19: "Placeholder_03",
  Placeholder_03: "Supercar_19",
  Supercar_18: "Placeholder_02",
  Placeholder_02: "Supercar_18",
  Supercar_17: "Placeholder_01",
  Placeholder_01: "Supercar_17",
};
const debounce = (e, a) => {
  let t;
  return (...o) => {
    clearTimeout(t);
    t = setTimeout(() => e(...o), a);
  };
};
const rgbToHex = (e, a, t) =>
  `#${[e, a, t]
    .map((e) =>
      Math.round(255 * e)
        .toString(16)
        .padStart(2, "0"),
    )
    .join("")}`;
const hexToRgb = (e) =>
  [1, 3, 5].map((a) => parseInt(e.slice(a, a + 2), 16) / 255);
const mixColors = (e, a) => [
  (e[0] + a[0]) / 2,
  (e[1] + a[1]) / 2,
  (e[2] + a[2]) / 2,
];
let previewFrame = null;
function updatePreview(e, a) {
  const t = rgbToHex(...a.lacquer),
    o = a.flake,
    r = a.paint,
    s = mixColors(o, r),
    i = rgbToHex(...s),
    l = e.querySelector(".preview").children;
  ((l[0].style.background = t),
    (l[1].style.background = `radial-gradient(circle, ${i}, ${t})`),
    previewFrame ||
      (previewFrame = requestAnimationFrame(() => {
        previewFrame = null;
      })));
}
function reorderColors(e, a, t) {
  if (!carColors[e]) return !1;
  const [o] = carColors[e].colors.splice(a, 1);
  return (
    !!o &&
    (carColors[e].colors.splice(t, 0, o),
    carColors[e].colors.forEach((e, a) => {
      ((e.index = String(a).padStart(2, "0")), (e.originalIndex = e.index));
    }),
    !0)
  );
}
function deepCopyEntry(e) {
  return {
    index: e.index,
    originalIndex: e.originalIndex ?? e.index,
    paint: [...e.paint],
    lacquer: [...e.lacquer],
    flake: [...e.flake],
    originalColors: {
      paint: [...e.originalColors.paint],
      lacquer: [...e.originalColors.lacquer],
      flake: [...e.originalColors.flake],
    },
    originalLines: { ...e.originalLines },
    originalValues: { ...e.originalValues },
  };
}
function copyPaletteValues(e) {
  return {
    paint: [...e.paint],
    lacquer: [...e.lacquer],
    flake: [...e.flake],
  };
}
function clamp(e, a, t) {
  return Math.min(t, Math.max(a, e));
}
function hexToRgb255(e) {
  const a = e.replace("#", "");
  return /^[\da-fA-F]{6}$/.test(a)
    ? [
        parseInt(a.slice(0, 2), 16),
        parseInt(a.slice(2, 4), 16),
        parseInt(a.slice(4, 6), 16),
      ]
    : null;
}
function rgb255ToHex(e, a, t) {
  return `#${[e, a, t]
    .map((e) =>
      Math.round(clamp(e, 0, 255))
        .toString(16)
        .padStart(2, "0"),
    )
    .join("")}`;
}
function rgb255ToHsv(e, a, t) {
  const o = e / 255,
    r = a / 255,
    s = t / 255,
    i = Math.max(o, r, s),
    l = Math.min(o, r, s),
    n = i - l;
  let c = 0;
  return (
    0 !== n &&
      (i === o
        ? (c = 60 * (((r - s) / n) % 6))
        : i === r
          ? (c = 60 * ((s - o) / n + 2))
          : (c = 60 * ((o - r) / n + 4))),
    c < 0 && (c += 360),
    [c, 0 === i ? 0 : n / i, i]
  );
}
function hsvToRgb255(e, a, t) {
  const o = t * a,
    r = o * (1 - Math.abs(((e / 60) % 2) - 1)),
    s = t - o;
  let i = 0,
    l = 0,
    n = 0;
  return (
    e >= 0 && e < 60
      ? ((i = o), (l = r), (n = 0))
      : e >= 60 && e < 120
        ? ((i = r), (l = o), (n = 0))
        : e >= 120 && e < 180
          ? ((i = 0), (l = o), (n = r))
          : e >= 180 && e < 240
            ? ((i = 0), (l = r), (n = o))
            : e >= 240 && e < 300
              ? ((i = r), (l = 0), (n = o))
              : ((i = o), (l = 0), (n = r)),
    [
      Math.round(255 * (i + s)),
      Math.round(255 * (l + s)),
      Math.round(255 * (n + s)),
    ]
  );
}
function applySlotColorChange(e, a, t, o, r = null, s = !0) {
  if (!carColors[e] || a >= carColors[e].colors.length) return;
  const i = hexToRgb(o);
  if (i.some((e) => isNaN(e))) return;
  ((carColors[e].colors[a][t] = i), modifiedVehicles.add(e));
  const l = r || colorsContainer.querySelector(`.color-set[data-index="${a}"]`);
  (l && (setSlotColorUI(l, t, o), updatePreview(l, carColors[e].colors[a])),
    syncPartner(e, s, s));
}
function setSlotColorUI(e, a, t) {
  const o = e.querySelector(`.color-native-input[data-type="${a}"]`),
    r = e.querySelector(`.color-trigger[data-type="${a}"]`);
  (o && (o.value = t), r && (r.style.background = t));
}
function createProColorPicker() {
  const e = document.createElement("div");
  ((e.className = "pro-color-picker"),
    (e.innerHTML = `\n    <div class="pro-picker-titlebar">\n      <span>Color Picker</span>\n    </div>\n    <div class="pro-picker-content">\n      <div class="pro-picker-main">\n        <div class="pro-picker-sv" aria-label="Saturation and brightness selector">\n          <div class="pro-picker-sv-cursor"></div>\n        </div>\n        <div class="pro-picker-hue" aria-label="Hue selector">\n          <div class="pro-picker-hue-cursor"></div>\n        </div>\n      </div>\n      <div class="pro-picker-side">\n        <div class="pro-picker-preview">\n          <div>\n            <span>New</span>\n            <div class="pro-picker-new"></div>\n          </div>\n          <div>\n            <span>Current</span>\n            <div class="pro-picker-current"></div>\n          </div>\n        </div>\n        <div class="pro-picker-rgb">\n          <label>R<input type="number" min="0" max="255" class="picker-r" /></label>\n          <label>G<input type="number" min="0" max="255" class="picker-g" /></label>\n          <label>B<input type="number" min="0" max="255" class="picker-b" /></label>\n        </div>\n        <label class="pro-picker-hex-label">HEX\n          <input type="text" maxlength="7" class="picker-hex" />\n        </label>\n        <button type="button" class="pro-picker-eyedropper" title="Eyedropper"><i class="fas fa-eye-dropper"></i></button>\n      </div>\n    </div>\n  `),
    document.body.appendChild(e));
  const a = {
    root: e,
    titlebar: e.querySelector(".pro-picker-titlebar"),
    sv: e.querySelector(".pro-picker-sv"),
    svCursor: e.querySelector(".pro-picker-sv-cursor"),
    hue: e.querySelector(".pro-picker-hue"),
    hueCursor: e.querySelector(".pro-picker-hue-cursor"),
    newSwatch: e.querySelector(".pro-picker-new"),
    currentSwatch: e.querySelector(".pro-picker-current"),
    rInput: e.querySelector(".picker-r"),
    gInput: e.querySelector(".picker-g"),
    bInput: e.querySelector(".picker-b"),
    hexInput: e.querySelector(".picker-hex"),
    eyedropperBtn: e.querySelector(".pro-picker-eyedropper"),
  };
  return (
    a.eyedropperBtn.addEventListener("click", async () => {
      if (!window.EyeDropper) {
        toastManager.show(
          "Eyedropper not supported in your browser.",
          "warning",
        );
        return;
      }
      const eyeDropper = new EyeDropper();
      try {
        const result = await eyeDropper.open();
        const color = result.sRGBHex;
        const rgb = hexToRgb255(color);
        if (rgb) {
          const [r, g, b] = rgb;
          const [h, s, v] = rgb255ToHsv(r, g, b);
          proColorPickerState.h = h;
          proColorPickerState.s = s;
          proColorPickerState.v = v;
          renderProColorPicker(true, true);
        }
      } catch (e) {}
    }),
    a.titlebar.addEventListener("pointerdown", (e) => {
      (e.preventDefault(), startProPickerPanelDrag(e));
    }),
    a.sv.addEventListener("pointerdown", (e) => {
      (e.preventDefault(), startProPickerDrag("sv", e));
    }),
    a.hue.addEventListener("pointerdown", (e) => {
      (e.preventDefault(), startProPickerDrag("hue", e));
    }),
    [a.rInput, a.gInput, a.bInput].forEach((e) => {
      e.addEventListener("input", () => {
        const t = clamp(parseInt(a.rInput.value) || 0, 0, 255),
          o = clamp(parseInt(a.gInput.value) || 0, 0, 255),
          r = clamp(parseInt(a.bInput.value) || 0, 0, 255),
          [s, i, l] = rgb255ToHsv(t, o, r);
        ((proColorPickerState.h = s),
          (proColorPickerState.s = i),
          (proColorPickerState.v = l),
          renderProColorPicker(!0, !1));
      });
    }),
    a.hexInput.addEventListener("input", () => {
      let e = a.hexInput.value.trim();
      e.startsWith("#") || (e = `#${e}`);
      const t = hexToRgb255(e);
      if (!t) return;
      const [o, r, s] = t,
        [i, l, n] = rgb255ToHsv(o, r, s);
      ((proColorPickerState.h = i),
        (proColorPickerState.s = l),
        (proColorPickerState.v = n),
        renderProColorPicker(!0, !1));
    }),
    a
  );
}
function positionProColorPicker(e, a) {
  if (!proColorPicker) return;
  const t = window.innerWidth,
    o = window.innerHeight,
    r = proColorPicker.root.offsetWidth || 420,
    s = proColorPicker.root.offsetHeight || 300,
    i = clamp(e + 14, 12, t - r - 12),
    l = clamp(a + 14, 12, o - s - 12);
  ((proColorPicker.root.style.left = `${i}px`),
    (proColorPicker.root.style.top = `${l}px`));
}
function renderProColorPicker(e = !1, a = !1) {
  if (!proColorPicker) return;
  const t = clamp(proColorPickerState.h, 0, 360),
    o = clamp(proColorPickerState.s, 0, 1),
    r = clamp(proColorPickerState.v, 0, 1),
    [s, i, l] = hsvToRgb255(t, o, r),
    n = rgb255ToHex(s, i, l),
    [c, d, u] = hsvToRgb255(t, 1, 1);
  ((proColorPickerState.h = t),
    (proColorPickerState.s = o),
    (proColorPickerState.v = r),
    (proColorPicker.sv.style.background = `linear-gradient(to top, #000, transparent), linear-gradient(to right, #fff, ${rgb255ToHex(c, d, u)})`),
    (proColorPicker.svCursor.style.left = `${100 * o}%`),
    (proColorPicker.svCursor.style.top = `${100 * (1 - r)}%`),
    (proColorPicker.hueCursor.style.top = `${(t / 360) * 100}%`),
    (proColorPicker.newSwatch.style.background = n),
    (proColorPicker.currentSwatch.style.background =
      proColorPickerState.sourceHex),
    (proColorPicker.rInput.value = s),
    (proColorPicker.gInput.value = i),
    (proColorPicker.bInput.value = l),
    (proColorPicker.hexInput.value = n.toUpperCase()));
  if (e && proColorPickerState.targetInput) {
    const e = proColorPickerState.targetInput,
      t = parseInt(e.dataset.index),
      o = e.dataset.type,
      r = carSelect.value,
      s = e.closest(".color-set");
    ((e.value = n), applySlotColorChange(r, t, o, n, s, a));
  }
}
function updateProPickerFromPointer(e, a, t) {
  if (!proColorPicker) return;
  if ("sv" === e) {
    const e = proColorPicker.sv.getBoundingClientRect(),
      o = clamp((a - e.left) / e.width, 0, 1),
      r = clamp((t - e.top) / e.height, 0, 1);
    ((proColorPickerState.s = o), (proColorPickerState.v = 1 - r));
  } else if ("hue" === e) {
    const e = proColorPicker.hue.getBoundingClientRect(),
      o = clamp((t - e.top) / e.height, 0, 1);
    proColorPickerState.h = 360 * o;
  }
  renderProColorPicker(!0, !1);
}
function stopProPickerDrag() {
  (document.removeEventListener("pointermove", handleProPickerPointerMove),
    (proColorPickerState.pointerMode = null));
}
function stopProPickerPanelDrag() {
  (document.removeEventListener("pointermove", handleProPickerPanelMove),
    (proColorPickerState.dragPanel = !1));
}
function handleProPickerPanelMove(e) {
  if (!proColorPicker || !proColorPickerState.dragPanel) return;
  const a = window.innerWidth,
    t = window.innerHeight,
    o = proColorPicker.root.offsetWidth || 420,
    r = proColorPicker.root.offsetHeight || 300,
    s = clamp(e.clientX - proColorPickerState.dragOffsetX, 12, a - o - 12),
    i = clamp(e.clientY - proColorPickerState.dragOffsetY, 12, t - r - 12);
  ((proColorPicker.root.style.left = `${s}px`),
    (proColorPicker.root.style.top = `${i}px`));
}
function startProPickerPanelDrag(e) {
  if (!proColorPicker) return;
  const a = proColorPicker.root.getBoundingClientRect();
  ((proColorPickerState.dragPanel = !0),
    (proColorPickerState.dragOffsetX = e.clientX - a.left),
    (proColorPickerState.dragOffsetY = e.clientY - a.top),
    document.addEventListener("pointermove", handleProPickerPanelMove),
    document.addEventListener(
      "pointerup",
      () => {
        stopProPickerPanelDrag();
      },
      { once: !0 },
    ));
}
function handleProPickerPointerMove(e) {
  proColorPickerState.pointerMode &&
    updateProPickerFromPointer(
      proColorPickerState.pointerMode,
      e.clientX,
      e.clientY,
    );
}
function startProPickerDrag(e, a) {
  ((proColorPickerState.pointerMode = e),
    updateProPickerFromPointer(e, a.clientX, a.clientY),
    document.addEventListener("pointermove", handleProPickerPointerMove),
    document.addEventListener(
      "pointerup",
      () => {
        (proColorPickerState.targetInput && renderProColorPicker(!0, !0),
          stopProPickerDrag());
      },
      { once: !0 },
    ));
}
function openProColorPicker(e, a, t) {
  if (!e) return;
  proColorPicker || (proColorPicker = createProColorPicker());
  const o = hexToRgb255(e.value) || [255, 255, 255],
    [r, s, i] = rgb255ToHsv(o[0], o[1], o[2]);
  ((proColorPickerState.isOpen = !0),
    (proColorPickerState.targetInput = e),
    (proColorPickerState.sourceHex = e.value),
    (proColorPickerState.h = r),
    (proColorPickerState.s = s),
    (proColorPickerState.v = i),
    proColorPicker.root.classList.add("active"),
    positionProColorPicker(a, t),
    renderProColorPicker(!1, !1));
}
function closeProColorPicker(e = !1) {
  proColorPicker &&
    (proColorPicker.root.classList.remove("active"),
    e && proColorPickerState.targetInput && renderProColorPicker(!0, !0),
    stopProPickerDrag(),
    stopProPickerPanelDrag(),
    (proColorPickerState.isOpen = !1),
    (proColorPickerState.targetInput = null));
}

function updateLibrary() {
  localStorage.setItem("colorLibrary", JSON.stringify(library));
  renderLibrary();
}

function renderLibrary() {
  if (!libraryList) return;
  if (library.length === 0) {
    libraryList.innerHTML =
      '<div class="empty-library">Your library is empty. Save a palette from a vehicle slot!</div>';
    return;
  }

  libraryList.innerHTML = library
    .map((item, index) => {
      const paintHex = rgbToHex(...item.paint);
      const lacquerHex = rgbToHex(...item.lacquer);
      const flakeHex = rgbToHex(...item.flake);
      const previewMix = mixColors(item.flake, item.paint);
      const mixHex = rgbToHex(...previewMix);

      return `
          <div class="library-item">
            <div class="library-item-preview">
              <div style="background: ${lacquerHex}; width: 100%; height: 100%; position: absolute;"></div>
              <div style="background: radial-gradient(circle, ${mixHex}, ${lacquerHex}); width: 100%; height: 100%; position: absolute;"></div>
            </div>
            <div class="library-item-name" title="${item.name}">${item.name}</div>
            <div class="library-item-actions">
              <button class="library-item-btn apply-preset-btn" data-index="${index}" title="Apply to current selection">Apply</button>
              <button class="library-item-btn delete-preset-btn" data-index="${index}" title="Delete" style="background: var(--error); color: white;">×</button>
            </div>
          </div>
        `;
    })
    .join("");

  libraryList.querySelectorAll(".apply-preset-btn").forEach((btn) => {
    btn.onclick = (e) => {
      e.stopPropagation();
      const index = parseInt(btn.dataset.index);
      const car = carSelect.value;
      if (!car) {
        toastManager.show("Select a car first!", "warning");
        return;
      }
      toastManager.show("Select a slot to apply", "info");
      paletteClipboard = { ...library[index], sourceVehicle: "Library" };
      showColors(car);
      showPopup(libraryPopup, false);
    };
  });

  libraryList.querySelectorAll(".delete-preset-btn").forEach((btn) => {
    btn.onclick = (e) => {
      e.stopPropagation();
      const index = parseInt(btn.dataset.index);
      library.splice(index, 1);
      updateLibrary();
    };
  });
}

function generateSmartPalette() {
  const style = Math.random();
  let hue = Math.random() * 360;
  let sFlake, vFlake, sPaint, vPaint, sLacquer, vLacquer;
  let huePaint = hue;

  if (style < 0.2) {
    sFlake = Math.random() * 0.05;
    vFlake = 0.05 + Math.random() * 0.9;
    sPaint = sFlake;
    vPaint = vFlake > 0.5 ? vFlake - 0.15 : vFlake + 0.15;
    sLacquer = 0;
    vLacquer = Math.min(1, vFlake + 0.1);
  } else if (style < 0.4) {
    sFlake = 0.3 + Math.random() * 0.4;
    vFlake = 0.6 + Math.random() * 0.3;
    huePaint = (hue + 20) % 360;
    sPaint = sFlake + 0.2;
    vPaint = vFlake - 0.2;
    sLacquer = sFlake;
    vLacquer = 1;
  } else if (style < 0.6) {
    sFlake = 0.7 + Math.random() * 0.3;
    vFlake = 0.2 + Math.random() * 0.3;
    sPaint = sFlake - 0.2;
    vPaint = vFlake + 0.3;
    sLacquer = 1;
    vLacquer = vFlake + 0.1;
  } else if (style < 0.8) {
    sFlake = 0.8 + Math.random() * 0.2;
    vFlake = 0.7 + Math.random() * 0.3;
    sPaint = sFlake;
    vPaint = vFlake - 0.2;
    sLacquer = sFlake;
    vLacquer = vFlake;
  } else {
    sFlake = 0.4 + Math.random() * 0.3;
    vFlake = 0.3 + Math.random() * 0.4;
    sPaint = sFlake + 0.1;
    vPaint = vFlake - 0.1;
    sLacquer = 0.1;
  }

  const clamp = (val) => Math.min(1, Math.max(0, val));

  const flake = hsvToRgb255(hue, clamp(sFlake), clamp(vFlake)).map(
    (v) => v / 255,
  );
  const paint = hsvToRgb255(huePaint, clamp(sPaint), clamp(vPaint)).map(
    (v) => v / 255,
  );
  const lacquer = hsvToRgb255(hue, clamp(sLacquer), clamp(vLacquer)).map(
    (v) => v / 255,
  );

  return { paint, lacquer, flake };
}

function applySmartRandomToSlot(car, index, container) {
  if (!carColors[car] || index >= carColors[car].colors.length) return;
  const palette = generateSmartPalette();
  const slot = carColors[car].colors[index];

  slot.paint = palette.paint;
  slot.lacquer = palette.lacquer;
  slot.flake = palette.flake;

  modifiedVehicles.add(car);

  if (container) {
    setSlotColorUI(container, "paint", rgbToHex(...slot.paint));
    setSlotColorUI(container, "lacquer", rgbToHex(...slot.lacquer));
    setSlotColorUI(container, "flake", rgbToHex(...slot.flake));
    updatePreview(container, slot);
  }
  syncPartner(car);
}

function syncPartner(e, a = !0, t = !0) {
  const o = vehiclePairs[e];
  o &&
    carColors[o] &&
    isSyncEnabled &&
    a &&
    ((carColors[o].size = carColors[e].size),
    (carColors[o].colors = carColors[e].colors.map(deepCopyEntry)),
    modifiedVehicles.add(o),
    carSelect.value === o && showColors(o));
}
function filterVehicles(e) {
  vehicleList.querySelectorAll("li").forEach((a) => {
    const t = a.textContent.toLowerCase();
    a.style.display = t.includes(e.toLowerCase()) ? "" : "none";
  });
}
vehicleSearch.addEventListener(
  "input",
  debounce((e) => {
    filterVehicles(e.target.value);
  }, 300),
);
let scrollBtn = document.createElement("button");
function parseFile(e) {
  if (e.length > 1e7) throw new Error("File is too large to process.");
  if ("string" != typeof e || "" === e.trim())
    throw new Error("Empty or invalid file content.");
  if (!e.includes("/Vehicles/ColorPalettes/"))
    throw new Error(
      "Invalid file format: Missing /Vehicles/ColorPalettes/ section.",
    );
  const a = [
      ...e.matchAll(
        /\/Vehicles\/ColorPalettes\/([\w]+)\/(\d+):([\s\S]*?)(?=(\/Vehicles\/ColorPalettes\/|$))/gi,
      ),
    ],
    t = {};
  let o = 0,
    r = 0;
  const s = [
      ...e.matchAll(
        /\/Vehicles\/ColorPalettes\/([\w]+):\s*(?:Size\s*=\s*(\d+))?/gi,
      ),
    ],
    i = {};
  for (const [, e, a] of s) i[e] = a ? parseInt(a) : 9;
  for (const [, e, s, l] of a) {
    (r++, t[e] || (t[e] = { size: i[e] || 9, colors: [] }));
    const a = (e) =>
        l.match(new RegExp(`('${e}'\\s*=\\s*([\\d.]+)\\s*\\([^)]+\\))`, "i")),
      n = ["Paint Color_r", "Paint Color_g", "Paint Color_b"].map(a),
      c = ["Lacquer Color_r", "Lacquer Color_g", "Lacquer Color_b"].map(a),
      d = ["Flake Color_r", "Flake Color_g", "Flake Color_b"].map(a);
    if ([...n, ...c, ...d].some((e) => !e)) {
      (console.warn(`Invalid entry for ${e}/${s}: Missing color data.`), o++);
      continue;
    }
    const u = {
      originalIndex: s,
      index: s.padStart(2, "0"),
      paint: n.map((e) => parseFloat(e[2])),
      lacquer: c.map((e) => parseFloat(e[2])),
      flake: d.map((e) => parseFloat(e[2])),
      originalColors: {
        paint: n.map((e) => parseFloat(e[2])),
        lacquer: c.map((e) => parseFloat(e[2])),
        flake: d.map((e) => parseFloat(e[2])),
      },
      originalLines: {
        paint_r: n[0][1],
        paint_g: n[1][1],
        paint_b: n[2][1],
        lacquer_r: c[0][1],
        lacquer_g: c[1][1],
        lacquer_b: c[2][1],
        flake_r: d[0][1],
        flake_g: d[1][1],
        flake_b: d[2][1],
      },
      originalValues: {
        paint_r: n[0][2],
        paint_g: n[1][2],
        paint_b: n[2][2],
        lacquer_r: c[0][2],
        lacquer_g: c[1][2],
        lacquer_b: c[2][2],
        flake_r: d[0][2],
        flake_g: d[1][2],
        flake_b: d[2][2],
      },
    };
    [...u.paint, ...u.lacquer, ...u.flake].some(
      (e) => isNaN(e) || e < 0 || e > 1,
    )
      ? (console.warn(`Invalid RGB values for ${e}/${s}: Must be 0-1.`), o++)
      : t[e].colors.push(u);
  }
  if (0 === r) throw new Error("No vehicle color palettes found.");
  return (o > 0 && console.warn(`Skipped ${o} invalid entries.`), t);
}
function handleFileSelect(e) {
  if (!e) return void toastManager.show("No file selected!", "error");
  const a = new FileReader();
  ((a.onerror = () => {
    (toastManager.show("Failed to read file! Please try again.", "error"),
      (saveBtn.disabled = !1));
  }),
    (a.onload = (e) => {
      originalText = e.target.result;
      try {
        ((carColors = parseFile(originalText)), modifiedVehicles.clear());
        const e = Object.keys(carColors);
        if (0 === e.length)
          return (
            (colorsContainer.innerHTML =
              '<div class="error">No valid vehicles found! Check file format and RGB values (0-1).</div>'),
            (carSelect.innerHTML = '<option value="">Select a car</option>'),
            (sizeSelect.value = ""),
            (sizeSelect.disabled = !0),
            (syncBtn.disabled = !0),
            (maxSizeBtn.disabled = !0),
            (saveBtn.disabled = !0),
            void toastManager.show("No valid vehicles found!", "error")
          );
        ((carSelect.innerHTML =
          '<option value="">Select a car</option>' +
          e.map((e) => `<option value="${e}">${e}</option>`).join("")),
          (colorsContainer.innerHTML = ""),
          (sizeSelect.value = ""),
          (sizeSelect.disabled = !0),
          (syncBtn.disabled = !0),
          (maxSizeBtn.disabled = !0),
          (saveBtn.disabled = !0),
          toastManager.show("File loaded successfully!", "success"));
      } catch (e) {
        ((colorsContainer.innerHTML = `<div class="error">Error parsing file: ${e.message}</div>`),
          (carSelect.innerHTML = '<option value="">Select a car</option>'),
          (sizeSelect.value = ""),
          (sizeSelect.disabled = !0),
          (syncBtn.disabled = !0),
          (maxSizeBtn.disabled = !0),
          (saveBtn.disabled = !0),
          toastManager.show(`Error: ${e.message}`, "error"));
      }
    }),
    a.readAsText(e));
}
function showColors(e) {
  if (
    ((colorsContainer.innerHTML = ""),
    (sizeSelect.disabled = !e || !carColors[e]),
    (syncBtn.disabled = !e || !vehiclePairs[e]),
    (maxSizeBtn.disabled = !carColors || 0 === Object.keys(carColors).length),
    !e || !carColors[e])
  )
    return void (sizeSelect.value = "");
  const a = carColors[e]?.size || 9;
  sizeSelect.value = a;
  const t = carColors[e].colors
    .sort((e, a) => parseInt(e.index) - parseInt(a.index))
    .slice(0, a);
  if (0 === t.length)
    return (
      (colorsContainer.innerHTML = `<div class="error">No colors available for ${e} within Size limit (${a}).</div>`),
      void (saveBtn.disabled = !0)
    );
  (t.forEach((e, a) => {
    const t = rgbToHex(...e.paint),
      o = rgbToHex(...e.lacquer),
      r = rgbToHex(...e.flake),
      s = document.createElement("div");
    ((s.className = "color-set"),
      (s.dataset.index = a),
      (s.innerHTML = `\n      <div class="color-set-header">\n        <strong>Color #${
        e.index
      }</strong>\n        <div style="display: flex; gap: 0.5rem; align-items: center;">\n          <button class="random-slot-btn" data-index="${a}" title="Smart Randomize Slot" style="background:none; border:none; color:inherit; cursor:pointer; padding: 0.2rem; font-size: 0.9rem; opacity: 0.7; transition: opacity 0.2s;"><i class="fas fa-dice"></i></button>\n          <i class="fas fa-grip-vertical drag-handle" title="Drag to move"></i>\n        </div>\n      </div>\n      <div class="slot-actions">\n        <button class="slot-action-btn copy-slot-btn" data-index="${a}" aria-label="Copy full palette ${
        e.index
      }">\n          <i class="fas fa-copy"></i> Copy\n        </button>\n        <button class="slot-action-btn paste-slot-btn" data-index="${a}" ${
        paletteClipboard ? "" : "disabled"
      } aria-label="Paste full palette into ${
        e.index
      }">\n          <i class="fas fa-paste"></i> Paste\n        </button>\n      </div>\n      <div class="slot-actions" style="margin-top: -0.3rem;">\n        <button class="slot-action-btn save-library-btn" data-index="${a}" aria-label="Save to Library">\n          <i class="fas fa-plus"></i> Library\n        </button>\n      </div>\n      <div class="color-row">\n        <button type="button" class="color-trigger" data-index="${a}" data-type="paint" style="background:${t}" aria-label="Paint color ${
        e.index
      }"></button>\n        <input type="color" class="color-native-input" data-index="${a}" data-type="paint" value="${t}" tabindex="-1" aria-hidden="true">\n        <span>Paint</span>\n        <button class="reset-btn" data-index="${a}" data-type="paint" aria-label="Reset paint color"><i class="fas fa-undo-alt"></i></button>\n      </div>\n      <div class="color-row">\n        <button type="button" class="color-trigger" data-index="${a}" data-type="lacquer" style="background:${o}" aria-label="Lacquer color ${
        e.index
      }"></button>\n        <input type="color" class="color-native-input" data-index="${a}" data-type="lacquer" value="${o}" tabindex="-1" aria-hidden="true">\n        <span>Lacquer</span>\n        <button class="reset-btn" data-index="${a}" data-type="lacquer" aria-label="Reset lacquer color"><i class="fas fa-undo-alt"></i></button>\n      </div>\n      <div class="color-row">\n        <button type="button" class="color-trigger" data-index="${a}" data-type="flake" style="background:${r}" aria-label="Flake color ${
        e.index
      }"></button>\n        <input type="color" class="color-native-input" data-index="${a}" data-type="flake" value="${r}" tabindex="-1" aria-hidden="true">\n        <span>Flake</span>\n        <button class="reset-btn" data-index="${a}" data-type="flake" aria-label="Reset flake color"><i class="fas fa-undo-alt"></i></button>\n      </div>\n      <div class="preview">\n        <div></div>\n        <div></div>\n      </div>\n    `),
      colorsContainer.appendChild(s),
      updatePreview(s, e));
  }),
    (saveBtn.disabled = !1));
  const o = colorsContainer.querySelectorAll(".color-set");
  o.forEach((e) => {
    const a = e.querySelector(".drag-handle");
    ((a.draggable = !0),
      a.addEventListener("dragstart", (a) => {
        (e.classList.add("dragging"),
          a.dataTransfer.setData("text/plain", e.dataset.index),
          colorsContainer.classList.add("drag-active"));
      }),
      a.addEventListener("dragend", () => {
        (e.classList.remove("dragging"),
          colorsContainer.classList.remove("drag-active"),
          o.forEach((e) => e.classList.remove("drag-over")));
      }),
      e.addEventListener("dragover", (a) => {
        (a.preventDefault(), e.classList.add("drag-over"));
      }),
      e.addEventListener("dragleave", () => {
        e.classList.remove("drag-over");
      }),
      e.addEventListener("drop", (a) => {
        (a.preventDefault(), e.classList.remove("drag-over"));
        const t = parseInt(a.dataTransfer.getData("text/plain")),
          o = parseInt(e.dataset.index),
          r = carSelect.value;
        isNaN(t) ||
          isNaN(o) ||
          t === o ||
          (reorderColors(r, t, o)
            ? (modifiedVehicles.add(r),
              (colorsContainer.innerHTML = ""),
              showColors(r),
              syncPartner(r))
            : toastManager.show("Error: Invalid drag operation!", "error"));
      }));
  });
}
function setTheme(e) {
  document.body.classList.toggle("dark", e);
  const a = themeToggle.querySelector("i");
  e
    ? (a.classList.remove("fa-sun"), a.classList.add("fa-moon"))
    : (a.classList.remove("fa-moon"), a.classList.add("fa-sun"));
}
function showPopup(e, a) {
  (e.classList.toggle("active", a), backdrop.classList.toggle("active", a));
}
((scrollBtn.innerHTML = '<i class="fas fa-chevron-up"></i>'),
  (scrollBtn.className = "scroll-top-btn"),
  (scrollBtn.title = "Back to top"),
  (scrollBtn.onclick = () => window.scrollTo({ top: 0, behavior: "smooth" })),
  document.body.appendChild(scrollBtn),
  window.addEventListener(
    "scroll",
    () => {
      scrollBtn.style.display = window.scrollY > 750 ? "block" : "none";
    },
    { passive: !0 },
  ),
  fileInput.addEventListener("change", (e) =>
    handleFileSelect(e.target.files[0]),
  ),
  fileInputWrapper.addEventListener("dragover", (e) => {
    (e.preventDefault(), fileInputWrapper.classList.add("dragover"));
  }),
  fileInputWrapper.addEventListener("dragleave", (e) => {
    (e.preventDefault(), fileInputWrapper.classList.remove("dragover"));
  }),
  fileInputWrapper.addEventListener("drop", (e) => {
    (e.preventDefault(),
      fileInputWrapper.classList.remove("dragover"),
      handleFileSelect(e.dataTransfer.files[0]));
  }),
  colorsContainer.addEventListener(
    "input",
    debounce((e) => {
      if (e.target.matches('input[type="color"]')) {
        const a = parseInt(e.target.dataset.index),
          t = e.target.dataset.type,
          o = e.target.value,
          l = carSelect.value;
        applySlotColorChange(l, a, t, o, e.target.closest(".color-set"));
      }
    }, 100),
  ),
  colorsContainer.addEventListener("click", (e) => {
    const randomSlotBtn = e.target.closest(".random-slot-btn");
    if (randomSlotBtn) {
      const index = parseInt(randomSlotBtn.dataset.index);
      const car = carSelect.value;
      const container = randomSlotBtn.closest(".color-set");
      applySmartRandomToSlot(car, index, container);
      return;
    }
    const a = e.target.closest(".copy-slot-btn");
    if (a) {
      const e = parseInt(a.dataset.index),
        t = carSelect.value;
      if (!carColors[t] || e >= carColors[t].colors.length) return;
      const o = carColors[t].colors[e];
      ((paletteClipboard = {
        sourceVehicle: t,
        sourceIndex: o.index,
        ...copyPaletteValues(o),
      }),
        showColors(t));
      return;
    }
    const libraryBtn = e.target.closest(".save-library-btn");
    if (libraryBtn) {
      const e = parseInt(libraryBtn.dataset.index),
        t = carSelect.value;
      if (!carColors[t] || e >= carColors[t].colors.length) return;
      const o = carColors[t].colors[e];
      const name = prompt("Enter a name for this preset:", `${t} - ${o.index}`);
      if (name) {
        library.push({
          name: name,
          ...copyPaletteValues(o),
        });
        updateLibrary();
        toastManager.show("Saved to library", "success");
      }
      return;
    }
    const t = e.target.closest(".paste-slot-btn");
    if (t) {
      if (!paletteClipboard)
        return void toastManager.show("Copy a slot first!", "warning");
      const e = parseInt(t.dataset.index),
        a = carSelect.value;
      if (!carColors[a] || e >= carColors[a].colors.length) return;
      const o = carColors[a].colors[e],
        r = t.closest(".color-set");
      ((o.paint = [...paletteClipboard.paint]),
        (o.lacquer = [...paletteClipboard.lacquer]),
        (o.flake = [...paletteClipboard.flake]),
        modifiedVehicles.add(a));
      const s = r.querySelector('input.color-native-input[data-type="paint"]'),
        i = r.querySelector('input.color-native-input[data-type="lacquer"]'),
        l = r.querySelector('input.color-native-input[data-type="flake"]');
      ((s.value = rgbToHex(...o.paint)),
        (i.value = rgbToHex(...o.lacquer)),
        (l.value = rgbToHex(...o.flake)),
        setSlotColorUI(r, "paint", s.value),
        setSlotColorUI(r, "lacquer", i.value),
        setSlotColorUI(r, "flake", l.value),
        updatePreview(r, o),
        syncPartner(a));
      return;
    }
    if (e.target.matches(".reset-btn") || e.target.closest(".reset-btn")) {
      const a = e.target.closest(".reset-btn"),
        t = parseInt(a.dataset.index),
        o = a.dataset.type,
        r = carSelect.value;
      if (!carColors[r] || t >= carColors[r].colors.length) return;
      const s = carColors[r].colors[t],
        i = a.closest(".color-set"),
        l = i.querySelector(`input.color-native-input[data-type="${o}"]`),
        n = s.originalColors[o];
      ((l.value = rgbToHex(...n)),
        setSlotColorUI(i, o, l.value),
        (s[o] = [...n]),
        modifiedVehicles.add(r),
        updatePreview(i, s),
        syncPartner(r));
    }
  }),
  carSelect.addEventListener("change", (e) => {
    const a = e.target.value;
    (showColors(a),
      (syncBtn.disabled = !a || !vehiclePairs[a]),
      (copyVehicleBtn.disabled = !a || !carColors[a]),
      (randomAllBtn.disabled = !a || !carColors[a]),
      (pasteVehicleBtn.disabled = !a || !carColors[a] || !vehicleClipboard),
      (maxSizeBtn.disabled = !carColors || 0 === Object.keys(carColors).length),
      vehiclePairs[a] ||
        ((isSyncEnabled = !1), syncBtn.classList.remove("active")));
  }),
  randomAllBtn.addEventListener("click", () => {
    const car = carSelect.value;
    if (!car || !carColors[car]) return;
    if (confirm(`Randomize all colors for ${car}?`)) {
      const sets = colorsContainer.querySelectorAll(".color-set");
      sets.forEach((set, i) => {
        applySmartRandomToSlot(car, i, set);
      });
    }
  }),
  copyVehicleBtn.addEventListener("click", () => {
    const car = carSelect.value;
    if (!car || !carColors[car]) return;
    vehicleClipboard = {
      size: carColors[car].size,
      colors: carColors[car].colors.map(deepCopyEntry),
    };
    pasteVehicleBtn.disabled = false;
  }),
  pasteVehicleBtn.addEventListener("click", () => {
    const car = carSelect.value;
    if (!car || !carColors[car] || !vehicleClipboard) return;
    if (
      confirm(
        `Paste all palettes into ${car}? This will overwrite current colors.`,
      )
    ) {
      carColors[car].size = vehicleClipboard.size;
      carColors[car].colors = vehicleClipboard.colors.map(deepCopyEntry);
      modifiedVehicles.add(car);
      showColors(car);
      syncPartner(car);
    }
  }),
  document
    .getElementById("clear-library-btn")
    .addEventListener("click", (e) => {
      e.stopPropagation();
      if (confirm("Clear all saved presets from your library?")) {
        library = [];
        updateLibrary();
      }
    }),
  sizeSelect.addEventListener("change", (e) => {
    const a = carSelect.value;
    if (!a || !carColors[a]) return;
    const t = parseInt(e.target.value);
    !isNaN(t) && t >= 1 && t <= 9
      ? ((carColors[a].size = t),
        modifiedVehicles.add(a),
        showColors(a),
        syncPartner(a))
      : "" !== e.target.value &&
        toastManager.show("Invalid size selected!", "error");
  }),
  syncBtn.addEventListener("click", () => {
    ((isSyncEnabled = !isSyncEnabled),
      syncBtn.classList.toggle("active", isSyncEnabled),
      isSyncEnabled && syncPartner(carSelect.value));
  }),
  maxSizeBtn.addEventListener("click", () => {
    if (
      confirm(
        "Do you want to set palette size to 9 for all vehicles? This will update all vehicles and refresh the current view if a vehicle is selected.",
      )
    ) {
      const e = Object.keys(carColors).length;
      Object.keys(carColors).forEach((e) => {
        ((carColors[e].size = 9), modifiedVehicles.add(e));
      });
      const a = carSelect.value;
      a && carColors[a] && showColors(a);
    }
  }),
  saveBtn.addEventListener("click", () => {
    if (saveBtn.disabled) return;
    ((saveBtn.disabled = !0),
      saveBtn.classList.add("saving"),
      (saveBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Saving...'));
    let e = originalText;
    if (!e)
      return (
        toastManager.show("Error: No file content to save!", "error"),
        saveBtn.classList.remove("saving"),
        void (saveBtn.disabled = !1)
      );
    try {
      console.time("SaveProcess");
      for (const a of modifiedVehicles) {
        if (!carColors[a]) continue;
        const t = escapeRegex(a);
        for (const o of carColors[a].colors) {
          const r = o.originalIndex || o.index,
            l = parseInt(r, 10),
            n = Number.isFinite(l) ? `0*${l}` : escapeRegex(r),
            s = new RegExp(
              `/Vehicles/ColorPalettes/${t}/${n}:[\\s\\S]*?(?=(/Vehicles/ColorPalettes/|$))`,
              "i",
            ),
            i = e.match(s);
          if (!i)
            return (
              toastManager.show(
                `Error: Could not find color block for ${a}/${r}!`,
                "error",
              ),
              saveBtn.classList.remove("saving"),
              (saveBtn.disabled = !1),
              void console.timeEnd("SaveProcess")
            );
          let c = i[0];
          const d = [
            {
              key: "Paint Color_r",
              value: o.paint[0],
              original: o.originalValues.paint_r,
              originalLine: o.originalLines.paint_r,
            },
            {
              key: "Paint Color_g",
              value: o.paint[1],
              original: o.originalValues.paint_g,
              originalLine: o.originalLines.paint_g,
            },
            {
              key: "Paint Color_b",
              value: o.paint[2],
              original: o.originalValues.paint_b,
              originalLine: o.originalLines.paint_b,
            },
            {
              key: "Lacquer Color_r",
              value: o.lacquer[0],
              original: o.originalValues.lacquer_r,
              originalLine: o.originalLines.lacquer_r,
            },
            {
              key: "Lacquer Color_g",
              value: o.lacquer[1],
              original: o.originalValues.lacquer_g,
              originalLine: o.originalLines.lacquer_g,
            },
            {
              key: "Lacquer Color_b",
              value: o.lacquer[2],
              original: o.originalValues.lacquer_b,
              originalLine: o.originalLines.lacquer_b,
            },
            {
              key: "Flake Color_r",
              value: o.flake[0],
              original: o.originalValues.flake_r,
              originalLine: o.originalLines.flake_r,
            },
            {
              key: "Flake Color_g",
              value: o.flake[1],
              original: o.originalValues.flake_g,
              originalLine: o.originalLines.flake_g,
            },
            {
              key: "Flake Color_b",
              value: o.flake[2],
              original: o.originalValues.flake_b,
              originalLine: o.originalLines.flake_b,
            },
          ];
          for (const { key: e, value: a, original: t, originalLine: o } of d) {
            const r = t.includes(".") ? t.split(".")[1].length : 0,
              s = r > 0 ? a.toFixed(r) : a.toString(),
              i = new RegExp(`'${e}'\\s*=\\s*[\\d.]+\\s*\\([^)]+\\)`, "i"),
              l = o.replace(t, s);
            c = c.replace(i, l);
          }
          e = e.replace(i[0], c);
        }
        const o = new RegExp(
            `(/Vehicles/ColorPalettes/${t}:\\s*(?:\\r?\\n\\s*)*?)(?:\\r?\\n\\s*Size\\s*=\\s*\\d+\\s*\\(1, 9\\);)?(\\r?\\n|$)`,
            "i",
          ),
          r = e.match(o),
          s = `\n\tSize = ${carColors[a].size} (1, 9);`;
        if (r) e = e.replace(r[0], `${r[1]}${s}${r[2] || ""}`);
        else {
          const o = new RegExp(
              `/Vehicles/ColorPalettes/${t}/\\d+:[\\s\\S]*?(?=(/Vehicles/ColorPalettes/|$))`,
              "i",
            ),
            r = e.match(o);
          r
            ? (e = e.replace(
                r[0],
                `/Vehicles/ColorPalettes/${a}:${s}\n${r[0]}`,
              ))
            : ((e += `\n\n/Vehicles/ColorPalettes/${a}:${s}\n`),
              toastManager.show(
                `Warning: Appended header for ${a}`,
                "warning",
              ));
        }
      }
      e = e.replace(/\r\n/g, "\n").replace(/\n/g, "\r\n");
      const a = new Blob([e], { type: "text/plain;charset=utf-8" }),
        t = URL.createObjectURL(a),
        o = document.createElement("a");
      ((o.href = t),
        (o.download = "VehicleColors.params"),
        o.click(),
        URL.revokeObjectURL(t),
        modifiedVehicles.clear(),
        console.timeEnd("SaveProcess"),
        toastManager.show("File saved successfully!", "success"));
    } catch (e) {
      (console.error("Error saving file:", e),
        toastManager.show(`Error saving file: ${e.message}`, "error"));
    } finally {
      setTimeout(() => {
        (saveBtn.classList.remove("saving"),
          (saveBtn.disabled = !1),
          (saveBtn.innerHTML = '<i class="fas fa-save"></i> Save Changes'));
      }, 1e3);
    }
  }),
  themeToggle.addEventListener("click", () => {
    const e = !document.body.classList.contains("dark");
    (setTheme(e), localStorage.setItem("theme", e ? "dark" : "light"));
  }),
  document.getElementById("checkUpdateBtn").addEventListener("click", () => {
    checkForUpdates();
  }),
  guideBtn.addEventListener("click", () =>
    showPopup(guidePopup, !guidePopup.classList.contains("active")),
  ),
  vehiclesBtn.addEventListener("click", () =>
    showPopup(vehiclesPopup, !vehiclesPopup.classList.contains("active")),
  ),
  libraryBtn.addEventListener("click", () => {
    renderLibrary();
    showPopup(libraryPopup, !libraryPopup.classList.contains("active"));
  }),
  document.addEventListener("click", (e) => {
    guideBtn.contains(e.target) ||
      vehiclesBtn.contains(e.target) ||
      libraryBtn.contains(e.target) ||
      (document.getElementById("checkUpdateBtn") &&
        document.getElementById("checkUpdateBtn").contains(e.target)) ||
      guidePopup.contains(e.target) ||
      vehiclesPopup.contains(e.target) ||
      libraryPopup.contains(e.target) ||
      (updatePopup && updatePopup.contains(e.target)) ||
      (showPopup(guidePopup, !1),
      showPopup(vehiclesPopup, !1),
      showPopup(libraryPopup, !1),
      updatePopup &&
        updatePopup.classList.contains("active") &&
        hideUpdatePopup());
  }));
colorsContainer.addEventListener("pointerdown", (e) => {
  const a = e.target.closest(".color-trigger");
  if (!a) return;
  e.preventDefault();
  const t = a.closest(".color-row"),
    o = t.querySelector(".color-native-input");
  if (!o) return;
  openProColorPicker(o, e.clientX, e.clientY);
});
colorsContainer.addEventListener("keydown", (e) => {
  if (!e.target.matches(".color-trigger")) return;
  if ("Enter" !== e.key && " " !== e.key) return;
  e.preventDefault();
  const a = e.target.getBoundingClientRect(),
    t = e.target.closest(".color-row"),
    o = t.querySelector(".color-native-input");
  if (!o) return;
  openProColorPicker(o, a.right, a.top);
});
document.addEventListener("pointerdown", (e) => {
  proColorPickerState.isOpen &&
    proColorPicker &&
    !proColorPicker.root.contains(e.target) &&
    !e.target.closest(".color-trigger") &&
    closeProColorPicker(!0);
});
document.addEventListener("keydown", (e) => {
  "Escape" === e.key && proColorPickerState.isOpen && closeProColorPicker(!1);
});
window.addEventListener("resize", () => closeProColorPicker(!0));
const resetAllBtn = document.querySelector(".reset-all-btn");
resetAllBtn &&
  (resetAllBtn.onclick = () => {
    const e = carSelect.value;
    e &&
      carColors[e] &&
      (carColors[e].colors.forEach((e) => {
        ["paint", "lacquer", "flake"].forEach((a) => {
          e[a] = [...e.originalColors[a]];
        });
      }),
      modifiedVehicles.add(e),
      showColors(e),
      syncPartner(e));
  });

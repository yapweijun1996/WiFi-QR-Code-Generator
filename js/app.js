document.addEventListener("DOMContentLoaded", () => {
	// DOM elements
	const form = document.getElementById("wifi-form");
	const ssidInput = document.getElementById("ssid");
	const passwordInput = document.getElementById("password");
	const encryptionSelect = document.getElementById("encryption");
	const qrCodeContainer = document.getElementById("qrCode");
	const qrResult = document.getElementById("qrResult");
	const savedSection = document.getElementById("savedSection");
	const savedList = document.getElementById("savedList");
	const clearAllBtn = document.getElementById("clearAll");
	const toastEl = document.getElementById("toast");
	const togglePwBtn = document.getElementById("togglePassword");

	// --- Toast ---
	let toastTimer;
	function showToast(message) {
		clearTimeout(toastTimer);
		toastEl.textContent = message;
		toastEl.classList.add("show");
		toastTimer = setTimeout(() => toastEl.classList.remove("show"), 2000);
	}

	// --- Password visibility toggle ---
	togglePwBtn.addEventListener("click", () => {
		const isPassword = passwordInput.type === "password";
		passwordInput.type = isPassword ? "text" : "password";
		togglePwBtn.querySelector("svg").style.stroke = isPassword ? "var(--primary)" : "#888";
	});

	// --- Encryption toggle ---
	encryptionSelect.addEventListener("change", () => {
		const noPassword = encryptionSelect.value === "nopass";
		passwordInput.disabled = noPassword;
		passwordInput.required = !noPassword;
		if (noPassword) {
			passwordInput.value = "";
			passwordInput.type = "password";
			togglePwBtn.querySelector("svg").style.stroke = "#888";
		}
	});

	// --- WiFi string helpers ---
	function escapeWifiString(str) {
		return str.replace(/[\\;,:"]/g, "\\$&");
	}

	function buildWifiString(ssid, password, encryption) {
		return `WIFI:S:${escapeWifiString(ssid)};T:${encryption};P:${escapeWifiString(password)};;`;
	}

	// --- QR Code generation ---
	function generateQRCode(ssid, password, encryption) {
		qrCodeContainer.innerHTML = "";
		qrResult.style.display = "";

		new QRCode(qrCodeContainer, {
			text: buildWifiString(ssid, password, encryption),
			width: 256,
			height: 256,
			colorDark: "#000000",
			colorLight: "#ffffff",
			correctLevel: QRCode.CorrectLevel.H,
		});

		setTimeout(() => {
			const canvas = qrCodeContainer.querySelector("canvas");
			if (!canvas) return;

			// Download button outside qrCode border
			const existing = qrResult.querySelector(".btn-download");
			if (existing) existing.remove();

			const downloadBtn = document.createElement("a");
			downloadBtn.href = canvas.toDataURL("image/png");
			downloadBtn.download = `wifi-${ssid}.png`;
			downloadBtn.textContent = "Download QR Code";
			downloadBtn.className = "btn btn-download";
			qrResult.appendChild(downloadBtn);
		}, 50);

		// Scroll to result
		setTimeout(() => {
			qrResult.scrollIntoView({ behavior: "smooth", block: "center" });
		}, 100);
	}

	// --- Form submit ---
	form.addEventListener("submit", (e) => {
		e.preventDefault();

		const ssid = ssidInput.value.trim();
		const password = passwordInput.value;
		const encryption = encryptionSelect.value;

		if (!ssid) return;

		generateQRCode(ssid, password, encryption);

		WifiDB.save({ ssid, password, encryption }).then(() => {
			showToast("Saved to history");
			loadSavedNetworks();
		});
	});

	// --- Saved networks ---
	function loadSavedNetworks() {
		WifiDB.getAll().then((networks) => {
			if (networks.length === 0) {
				savedSection.style.display = "none";
				return;
			}

			savedSection.style.display = "";
			savedList.innerHTML = "";

			networks.reverse().forEach((net) => {
				const li = document.createElement("li");
				li.className = "saved-item";

				const date = new Date(net.createdAt).toLocaleDateString();

				li.innerHTML = `
					<div class="saved-item-info" data-id="${net.id}">
						<div class="saved-item-ssid">${escapeHTML(net.ssid)}</div>
						<div class="saved-item-meta">${net.encryption} &middot; ${date}</div>
					</div>
					<div class="saved-item-actions">
						<button class="btn btn-delete" data-delete="${net.id}">Remove</button>
					</div>
				`;

				li.querySelector(".saved-item-info").addEventListener("click", () => {
					ssidInput.value = net.ssid;
					passwordInput.value = net.password;
					encryptionSelect.value = net.encryption;
					encryptionSelect.dispatchEvent(new Event("change"));
					generateQRCode(net.ssid, net.password, net.encryption);
				});

				li.querySelector("[data-delete]").addEventListener("click", () => {
					WifiDB.remove(net.id).then(() => {
						showToast("Removed");
						loadSavedNetworks();
					});
				});

				savedList.appendChild(li);
			});
		});
	}

	function escapeHTML(str) {
		const div = document.createElement("div");
		div.textContent = str;
		return div.innerHTML;
	}

	clearAllBtn.addEventListener("click", () => {
		if (!confirm("Delete all saved networks?")) return;
		WifiDB.clear().then(() => {
			showToast("History cleared");
			loadSavedNetworks();
		});
	});

	// Load saved on startup
	loadSavedNetworks();

	// --- PWA: Service Worker ---
	if ("serviceWorker" in navigator) {
		navigator.serviceWorker.register("./sw.js");
	}

	// --- PWA: Install prompt ---
	let deferredPrompt;
	const installBanner = document.getElementById("installBanner");
	const installBtn = document.getElementById("installBtn");

	window.addEventListener("beforeinstallprompt", (e) => {
		e.preventDefault();
		deferredPrompt = e;
		installBanner.style.display = "flex";
	});

	installBtn.addEventListener("click", () => {
		if (!deferredPrompt) return;
		deferredPrompt.prompt();
		deferredPrompt.userChoice.then(() => {
			deferredPrompt = null;
			installBanner.style.display = "none";
		});
	});

	window.addEventListener("appinstalled", () => {
		installBanner.style.display = "none";
		showToast("App installed!");
	});
});

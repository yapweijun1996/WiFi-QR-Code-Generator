const WifiDB = (() => {
	const DB_NAME = "WifiQRCodeDB";
	const DB_VERSION = 1;
	const STORE_NAME = "networks";

	function open() {
		return new Promise((resolve, reject) => {
			const request = indexedDB.open(DB_NAME, DB_VERSION);

			request.onupgradeneeded = (e) => {
				const db = e.target.result;
				if (!db.objectStoreNames.contains(STORE_NAME)) {
					const store = db.createObjectStore(STORE_NAME, {
						keyPath: "id",
						autoIncrement: true,
					});
					store.createIndex("ssid", "ssid", { unique: false });
					store.createIndex("createdAt", "createdAt", { unique: false });
				}
			};

			request.onsuccess = (e) => resolve(e.target.result);
			request.onerror = (e) => reject(e.target.error);
		});
	}

	function tx(mode, callback) {
		return open().then((db) => {
			return new Promise((resolve, reject) => {
				const transaction = db.transaction(STORE_NAME, mode);
				const store = transaction.objectStore(STORE_NAME);
				const result = callback(store);

				transaction.oncomplete = () => resolve(result.result ?? result);
				transaction.onerror = (e) => reject(e.target.error);

				if (result instanceof IDBRequest) {
					result.onsuccess = () => (result.result_ = result.result);
				}
			});
		});
	}

	return {
		save(network) {
			return open().then((db) => {
				return new Promise((resolve, reject) => {
					const transaction = db.transaction(STORE_NAME, "readwrite");
					const store = transaction.objectStore(STORE_NAME);
					const index = store.index("ssid");
					const lookup = index.getAll(network.ssid);

					lookup.onsuccess = () => {
						const existing = lookup.result[0];
						if (existing) {
							existing.password = network.password;
							existing.encryption = network.encryption;
							existing.createdAt = Date.now();
							store.put(existing);
						} else {
							network.createdAt = Date.now();
							store.add(network);
						}
					};

					transaction.oncomplete = () => resolve();
					transaction.onerror = (e) => reject(e.target.error);
				});
			});
		},

		getAll() {
			return open().then((db) => {
				return new Promise((resolve, reject) => {
					const transaction = db.transaction(STORE_NAME, "readonly");
					const store = transaction.objectStore(STORE_NAME);
					const request = store.getAll();
					request.onsuccess = () => resolve(request.result);
					request.onerror = (e) => reject(e.target.error);
				});
			});
		},

		remove(id) {
			return tx("readwrite", (store) => store.delete(id));
		},

		clear() {
			return tx("readwrite", (store) => store.clear());
		},
	};
})();

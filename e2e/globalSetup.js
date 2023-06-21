import path from "path";
import { spawn } from "child_process";
import kill from "tree-kill";
import { MongoClient } from "mongodb";
import url from "url";
import qs from "querystring";
import mongoGlobalSetup from "@shelf/jest-mongodb/lib/setup.js";

import config from "../config.js";

import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const port = process.env.PORT || 8888;
const baseUrl = process.env.REMOTE_URL || `http://127.0.0.1:${port}`;

const __e2e = {
    port,
    baseUrl,
    adminUserCredentials: {
        email: config.adminEmail,
        password: config.adminPassword,
    },
    adminToken: null,
    testUserCredentials: {
        email: "test@test.test",
        password: "123456",
    },
    testUserToken: null,
    childProcessPid: null,
    accessToken: null,
};

const fetch = (url, opts = {}) =>
    import("node-fetch").then(({ default: fetch }) =>
        fetch(`${baseUrl}${url}`, {
            ...opts,
            headers: {
                "content-type": "application/json",
                ...opts.headers,
            },
            ...(opts.body && typeof opts.body !== "string" ? { body: JSON.stringify(opts.body) } : {}),
        })
    );

const fetchWithAuth =
    (body) =>
    (url, opts = {}) => {
        Object.assign(__e2e, { accessToken: null });

        if (!__e2e.accessToken) {
            // Si no hay un token y el token de usuario de prueba no está disponible, obtener el token de autenticación
            return fetch("/login", {
                method: "POST",
                body,
            })
                .then((resp) => {
                    if (resp.status !== 200) {
                        return new Error(`Error: Could not authenticate as admin user - response ${resp.status}`);
                    }
                    return resp.json();
                })
                .then(({ accessToken }) => {
                    // Almacenar el token obtenido en __e2e para su reutilización
                    Object.assign(__e2e, { accessToken });
                    return fetch(url, {
                        ...opts,
                        headers: {
                            ...opts.headers,
                            authorization: `Bearer ${accessToken}`,
                        },
                    });
                });
        } else {
            // Utilizar el token existente si está disponible
            return fetch(url, {
                ...opts,
                headers: {
                    ...opts.headers,
                    authorization: `Bearer ${__e2e.accessToken}`,
                },
            });
        }
    };

const fetchAsAdmin = (url, opts) => fetchWithAuth(__e2e.adminUserCredentials)(url, opts);
const fetchAsTestUser = (url, opts) => fetchWithAuth(__e2e.testUserCredentials)(url, opts);

const createTestUser = () =>
    fetchAsAdmin("/users", {
        method: "POST",
        body: __e2e.testUserCredentials,
    })
        .then((resp) => {
            if (resp.status !== 200) {
                throw new Error(`Error: Could notdd create test user - response ${resp.status}`);
            }
            return fetch("/login", { method: "POST", body: __e2e.testUserCredentials });
        })
        .then((resp) => {
            if (resp.status !== 200) {
                throw new Error(`Error: Could not authenticate test user - response ${resp.status}`);
            }
            return resp.json();
        })
        .then(({ token }) => Object.assign(__e2e, { testUserToken: token }));

const checkAdminCredentials = () =>
    fetch("/login", {
        method: "POST",
        body: __e2e.adminUserCredentials,
    })
        .then((resp) => {
            if (resp.status !== 200) {
                throw new Error(`Error: Could not authenticate as admin user - response ${resp.status}`);
            }

            return resp.json();
        })
        .then(({ token }) => Object.assign(__e2e, { adminToken: token }));

const waitForServerToBeReady = (retries = 10) =>
    new Promise((resolve, reject) => {
        if (!retries) {
            return reject(new Error("Server took too long to start"));
        }

        setTimeout(() => {
            fetch("/")
                .then((resp) => (resp.status !== 200 ? reject(new Error(`GET / responded with ${resp.status}`)) : resolve()))
                .catch(() => waitForServerToBeReady(retries - 1).then(resolve, reject));
        }, 1000);
    });

export default () =>
    new Promise((resolve, reject) => {
        if (process.env.REMOTE_URL) {
            console.info(`Running tests on remote server ${process.env.REMOTE_URL}`);
            return resolve();
        }

        mongoGlobalSetup({ rootDir: __dirname })
            .then(async () => {
                console.info("\n Starting local server...");

                const child = spawn(/^win/.test(process.platform) ? "npm.cmd" : "npm", ["start", port], {
                    cwd: path.resolve(__dirname, "../"),
                    stdio: ["ignore", "pipe", "pipe"],
                    env: { PATH: process.env.PATH, MONGO_URL: process.env.MONGO_URL },
                });

                Object.assign(__e2e, { childProcessPid: child.pid });

                child.stdout.on("data", (chunk) => {
                    console.info(`\x1b[34m${chunk.toString()}\x1b[0m`);
                });

                child.stderr.on("data", (chunk) => {
                    const str = chunk.toString();
                    if (/DeprecationWarning/.test(str)) {
                        return;
                    }
                    console.error("child::stderr", str);
                });

                process.on("uncaughtException", (err) => {
                    console.error("UncaughtException!");
                    console.error(err);
                    kill(child.pid, "SIGKILL", () => process.exit(1));
                });

                waitForServerToBeReady()
                    .then(checkAdminCredentials)
                    .then(createTestUser)
                    .then(resolve)
                    .catch((err) => {
                        console.log("there was an error");
                        kill(child.pid, "SIGKILL", () => reject(err));
                    });
            })
            .catch((error) => console.log(error));
    });

// Export globals - ugly... :-(
global.__e2e = __e2e;

// Export stuff to be used in tests!
process.baseUrl = baseUrl;
process.fetch = fetch;
process.fetchWithAuth = fetchWithAuth;
process.fetchAsAdmin = fetchAsAdmin;
process.fetchAsTestUser = fetchAsTestUser;
process.config = config;
process.url = url;
process.qs = qs;
process.adminUserCredentials = __e2e.adminUserCredentials;

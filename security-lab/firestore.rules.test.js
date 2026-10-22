const { readFileSync } = require("node:fs");
const { join } = require("node:path");
const {
  initializeTestEnvironment,
  assertSucceeds,
  assertFails
} = require("@firebase/rules-unit-testing");
const { doc, getDoc, setDoc, deleteDoc, serverTimestamp } = require("firebase/firestore");

const PROJECT_ID = "demo-towerv1-security-lab";
let testEnv;

function validBoard(overrides = {}) {
  return {
    uid: "alice",
    username: "Alice",
    highestWave: 10,
    wave: 8,
    damage: 120,
    prestiges: 0,
    activeSkin: "default_cyber",
    updatedAt: serverTimestamp(),
    ...overrides
  };
}

before(async () => {
  testEnv = await initializeTestEnvironment({
    projectId: PROJECT_ID,
    firestore: {
      host: "127.0.0.1",
      port: 8085,
      rules: readFileSync(join(__dirname, "firestore.rules"), "utf8")
    }
  });
});

after(async () => {
  await testEnv.cleanup();
});

beforeEach(async () => {
  await testEnv.clearFirestore();
});

test("unauthenticated user cannot write a user save", async () => {
  const db = testEnv.unauthenticatedContext().firestore();
  await assertFails(setDoc(doc(db, "users/alice"), {
    username: "Alice", saveData: "{}", highestWave: 1, updatedAt: Date.now()
  }));
});

test("owner can write a bounded user document", async () => {
  const db = testEnv.authenticatedContext("alice").firestore();
  await assertSucceeds(setDoc(doc(db, "users/alice"), {
    username: "Alice", saveData: "{}", highestWave: 1, updatedAt: Date.now()
  }));
});

test("one user cannot write another user's save", async () => {
  const db = testEnv.authenticatedContext("alice").firestore();
  await assertFails(setDoc(doc(db, "users/bob"), {
    username: "Bob", saveData: "{}", highestWave: 1, updatedAt: Date.now()
  }));
});

test("owner can create a valid leaderboard row", async () => {
  const db = testEnv.authenticatedContext("alice").firestore();
  await assertSucceeds(setDoc(doc(db, "leaderboard/alice"), validBoard()));
});

test("leaderboard update inside the 20-second interval is rejected", async () => {
  const db = testEnv.authenticatedContext("alice").firestore();
  await assertSucceeds(setDoc(doc(db, "leaderboard/alice"), validBoard()));
  await assertFails(setDoc(doc(db, "leaderboard/alice"), validBoard({
    highestWave: 11, wave: 9, updatedAt: serverTimestamp()
  })));
});

test("KNOWN GAP: delete-and-recreate bypasses the leaderboard update interval", async () => {
  const db = testEnv.authenticatedContext("alice").firestore();
  await assertSucceeds(setDoc(doc(db, "leaderboard/alice"), validBoard()));
  await assertSucceeds(deleteDoc(doc(db, "leaderboard/alice")));
  // This currently succeeds because resource == null makes withinRateLimit() true.
  // This test documents existing behavior; it is not a claim that the behavior is secure.
  await assertSucceeds(setDoc(doc(db, "leaderboard/alice"), validBoard({
    highestWave: 5000, wave: 5000, damage: 999999999, activeSkin: "not-validated-owned-skin"
  })));
});

test("leaderboard reads are public by design", async () => {
  const db = testEnv.unauthenticatedContext().firestore();
  await testEnv.withSecurityRulesDisabled(async context => {
    await setDoc(doc(context.firestore(), "leaderboard/alice"), {
      uid: "alice", username: "Alice", highestWave: 10, wave: 8, damage: 120,
      prestiges: 0, activeSkin: "default_cyber", updatedAt: new Date()
    });
  });
  await assertSucceeds(getDoc(doc(db, "leaderboard/alice")));
});

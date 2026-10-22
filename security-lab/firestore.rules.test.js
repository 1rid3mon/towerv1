const { readFileSync } = require("node:fs");
const { join } = require("node:path");
const { before, after, beforeEach, test } = require("node:test");
const {
  initializeTestEnvironment,
  assertSucceeds,
  assertFails
} = require("@firebase/rules-unit-testing");
const { doc, getDoc, setDoc, deleteDoc, writeBatch, serverTimestamp } = require("firebase/firestore");

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

async function writeBoard(db, overrides = {}) {
  const batch = writeBatch(db);
  const board = validBoard(overrides);
  batch.set(doc(db, "leaderboardRateLimits/alice"), {
    uid: "alice", updatedAt: serverTimestamp(), highestWave: board.highestWave
  }, { merge: true });
  batch.set(doc(db, "leaderboard/alice"), board, { merge: true });
  return batch.commit();
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
  if (testEnv) await testEnv.cleanup();
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
  await assertSucceeds(writeBoard(db));
});

test("leaderboard update inside the 20-second interval is rejected", async () => {
  const db = testEnv.authenticatedContext("alice").firestore();
  await assertSucceeds(writeBoard(db));
  await assertFails(writeBoard(db, { highestWave: 11, wave: 9 }));
});

test("rate-limit records cannot be created or updated without a matching leaderboard write", async () => {
  const db = testEnv.authenticatedContext("alice").firestore();

  // A client must not be able to create the persistent limiter independently.
  await assertFails(setDoc(doc(db, "leaderboardRateLimits/alice"), {
    uid: "alice", highestWave: 10, updatedAt: serverTimestamp()
  }));

  // Seed an existing, expired pair so a direct limiter update is not rejected
  // merely because of the 20-second cooldown; it must fail due to missing atomic board update.
  await testEnv.withSecurityRulesDisabled(async context => {
    const adminDb = context.firestore();
    const oldTime = new Date(Date.now() - 60000);
    await setDoc(doc(adminDb, "leaderboard/alice"), {
      uid: "alice", username: "Alice", highestWave: 10, wave: 8,
      damage: 120, prestiges: 0, activeSkin: "default_cyber", updatedAt: oldTime
    });
    await setDoc(doc(adminDb, "leaderboardRateLimits/alice"), {
      uid: "alice", highestWave: 10, updatedAt: oldTime
    });
  });

  await assertFails(setDoc(doc(db, "leaderboardRateLimits/alice"), {
    uid: "alice", highestWave: 11, updatedAt: serverTimestamp()
  }));
});

test("leaderboard deletion remains available, but persistent rate-limit state blocks immediate recreation", async () => {
  const db = testEnv.authenticatedContext("alice").firestore();
  await assertSucceeds(writeBoard(db));
  await assertSucceeds(deleteDoc(doc(db, "leaderboard/alice")));
  // Deletion does not remove leaderboardRateLimits/alice; recreating the row immediately is rejected.
  await assertFails(writeBoard(db, { highestWave: 5000, wave: 5000, damage: 999999999 }));
  // Even after the normal wait, the persisted highest wave prevents an unlimited jump after deletion.
  await testEnv.withSecurityRulesDisabled(async context => {
    await setDoc(doc(context.firestore(), "leaderboardRateLimits/alice"), {
      uid: "alice", updatedAt: new Date(Date.now() - 60000), highestWave: 10
    });
  });
  await assertFails(writeBoard(db, { highestWave: 5000, wave: 5000, damage: 999999999 }));
});


test("owner can still delete their own user save (compatibility guard)", async () => {
  const db = testEnv.authenticatedContext("alice").firestore();
  await assertSucceeds(setDoc(doc(db, "users/alice"), {
    username: "Alice", saveData: "{}", highestWave: 1, updatedAt: Date.now()
  }));
  await assertSucceeds(deleteDoc(doc(db, "users/alice")));
});

test("KNOWN LIMITATION: leaderboard schema still accepts extreme damage and an unowned skin ID", async () => {
  const db = testEnv.authenticatedContext("alice").firestore();
  // Deliberately demonstrates what the current client-writable schema cannot prove.
  // Do not interpret this passing test as protection against score manipulation.
  await assertSucceeds(writeBoard(db, {
    highestWave: 5000, wave: 5000, damage: 999999999,
    activeSkin: "skin-the-player-may-not-own"
  }));
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

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
      rules: readFileSync(join(__dirname, "..", "firestore.rules"), "utf8")
    }
  });
});

after(async () => {
  if (testEnv) await testEnv.cleanup();
});

beforeEach(async () => {
  await testEnv.clearFirestore();
});


test("username registry allows the first owner but blocks another user claiming the same normalized key", async () => {
  const alice = testEnv.authenticatedContext("alice").firestore();
  const bob = testEnv.authenticatedContext("bob").firestore();
  await assertSucceeds(setDoc(doc(alice, "usernameRegistry/kerem"), {
    uid: "alice", username: "kerem", updatedAt: Date.now()
  }));
  await assertFails(setDoc(doc(bob, "usernameRegistry/kerem"), {
    uid: "bob", username: "kerem", updatedAt: Date.now()
  }));
});

test("username registry only lets its owner update or release a reserved name", async () => {
  const alice = testEnv.authenticatedContext("alice").firestore();
  const bob = testEnv.authenticatedContext("bob").firestore();
  await assertSucceeds(setDoc(doc(alice, "usernameRegistry/kerem"), {
    uid: "alice", username: "kerem", updatedAt: Date.now()
  }));
  await assertFails(setDoc(doc(bob, "usernameRegistry/kerem"), {
    uid: "bob", username: "Kerem2", updatedAt: Date.now()
  }));
  await assertFails(deleteDoc(doc(bob, "usernameRegistry/kerem")));
  await assertSucceeds(deleteDoc(doc(alice, "usernameRegistry/kerem")));
});


// Regression guard: the rules must bind the normalized key and stored value.
test("username registry rejects a value that does not match its normalized document key", async () => {
  const alice = testEnv.authenticatedContext("alice").firestore();
  await assertFails(setDoc(doc(alice, "usernameRegistry/kerem"), {
    uid: "alice", username: "different-name", updatedAt: Date.now()
  }));
});

test("username registry rejects uppercase or malformed document keys", async () => {
  const alice = testEnv.authenticatedContext("alice").firestore();
  await assertFails(setDoc(doc(alice, "usernameRegistry/Kerem"), {
    uid: "alice", username: "kerem", updatedAt: Date.now()
  }));
  await assertFails(setDoc(doc(alice, "usernameRegistry/ab"), {
    uid: "alice", username: "ab", updatedAt: Date.now()
  }));
});


test("username registry owner can refresh their own existing reservation", async () => {
  const alice = testEnv.authenticatedContext("alice").firestore();
  await assertSucceeds(setDoc(doc(alice, "usernameRegistry/kerem"), {
    uid: "alice", username: "kerem", updatedAt: Date.now()
  }));
  await assertSucceeds(setDoc(doc(alice, "usernameRegistry/kerem"), {
    uid: "alice", username: "kerem", updatedAt: Date.now() + 1
  }));
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

function validStoryProgress(overrides = {}) {
  return {
    introSeen: false, chapter: 1,
    mission1Complete: false, mission2Complete: false, mission3Complete: false,
    mission4Complete: false, mission5Complete: false, mission6Complete: false,
    mission7Complete: false, mission8Complete: false, mission9Complete: false,
    mission10Complete: false, mission11Complete: false, mission12Complete: false,
    mission13Complete: false, mission14Complete: false, mission15Complete: false,
    mission16Complete: false, mission17Complete: false, mission18Complete: false,
    mission19Complete: false, mission20Complete: false, mission21Complete: false,
    voiceChoice: null, pulseTutorialComplete: false, companionForm: "basic",
    repairChoiceCount: 0, routeChoice: null, powerChoice: null, callSignChoice: null, updatedAt: Date.now(),
    ...overrides
  };
}

test("story progress accepts Chapter 03 missions 19–21 and chapter 3", async () => {
  const alice = testEnv.authenticatedContext("alice").firestore();
  await assertSucceeds(setDoc(doc(alice, "storyProgress/alice"), validStoryProgress({ mission18Complete: true, mission19Complete: true, mission20Complete: true, mission21Complete: true, chapter: 3 })));
  await assertFails(setDoc(doc(alice, "storyProgress/alice"), validStoryProgress({ chapter: 4 })));
});

test("story finale schema accepts optional new fields without requiring old clients to send them", async () => {
  const alice = testEnv.authenticatedContext("alice").firestore();
  await assertSucceeds(setDoc(doc(alice, "storyProgress/alice"), validStoryProgress()));
  await assertSucceeds(setDoc(doc(alice, "storyProgress/alice"), validStoryProgress({ mission22Complete:true, mission23Complete:true, mission24Complete:true, mission25Complete:true, mission26Complete:true, mission27Complete:true, companionForm:'tower', stabilityChoice:'preserve', chapter:3 })));
  await assertFails(setDoc(doc(alice, "storyProgress/alice"), validStoryProgress({ mission27Complete:'true' })));
  await assertFails(setDoc(doc(alice, "storyProgress/alice"), validStoryProgress({ stabilityChoice:'erase' })));
});

test("story progress owner can create a valid cloud save", async () => {
  const alice = testEnv.authenticatedContext("alice").firestore();
  await assertSucceeds(setDoc(doc(alice, "storyProgress/alice"), validStoryProgress({ mission1Complete: true })));
});

test("story progress accepts the new Mission 15 completion flag", async () => {
  const alice = testEnv.authenticatedContext("alice").firestore();
  await assertSucceeds(setDoc(doc(alice, "storyProgress/alice"), validStoryProgress({ mission14Complete: true, mission15Complete: true, chapter: 2 })));
});

test("story progress accepts Chapter 02 missions 16–18 and the persisted call-sign choice", async () => {
  const alice = testEnv.authenticatedContext("alice").firestore();
  await assertSucceeds(setDoc(doc(alice, "storyProgress/alice"), validStoryProgress({
    mission15Complete: true, mission16Complete: true, mission17Complete: true,
    mission18Complete: true, callSignChoice: "echo", chapter: 2
  })));
  await assertFails(setDoc(doc(alice, "storyProgress/alice"), validStoryProgress({
    mission16Complete: true, callSignChoice: "admin"
  })));
});

test("story progress cannot be read or changed by another account", async () => {
  const alice = testEnv.authenticatedContext("alice").firestore();
  const bob = testEnv.authenticatedContext("bob").firestore();
  await assertSucceeds(setDoc(doc(alice, "storyProgress/alice"), validStoryProgress()));
  await assertFails(getDoc(doc(bob, "storyProgress/alice")));
  await assertFails(setDoc(doc(bob, "storyProgress/alice"), validStoryProgress({ mission14Complete: true })));
});

test("story progress rejects malformed choices, extra fields, and invalid mission flags", async () => {
  const alice = testEnv.authenticatedContext("alice").firestore();
  await assertFails(setDoc(doc(alice, "storyProgress/alice"), validStoryProgress({ voiceChoice: "admin" })));
  await assertFails(setDoc(doc(alice, "storyProgress/alice"), validStoryProgress({ mission14Complete: "true" })));
  await assertFails(setDoc(doc(alice, "storyProgress/alice"), validStoryProgress({ injected: "unexpected" })));
});

test("unauthenticated users cannot read or write story progress", async () => {
  const db = testEnv.unauthenticatedContext().firestore();
  await assertFails(getDoc(doc(db, "storyProgress/alice")));
  await assertFails(setDoc(doc(db, "storyProgress/alice"), validStoryProgress()));
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

test("leaderboard writes without the paired rate-limit record are rejected", async () => {
  const db = testEnv.authenticatedContext("alice").firestore();
  await assertFails(setDoc(doc(db, "leaderboard/alice"), validBoard()));
});

test("a batch with mismatched highestWave values is rejected", async () => {
  const db = testEnv.authenticatedContext("alice").firestore();
  const batch = writeBatch(db);
  batch.set(doc(db, "leaderboardRateLimits/alice"), {
    uid: "alice", highestWave: 10, updatedAt: serverTimestamp()
  });
  batch.set(doc(db, "leaderboard/alice"), validBoard({ highestWave: 11, wave: 9 }));
  await assertFails(batch.commit());
});

test("client cannot delete the persistent rate-limit record", async () => {
  const db = testEnv.authenticatedContext("alice").firestore();
  await testEnv.withSecurityRulesDisabled(async context => {
    await setDoc(doc(context.firestore(), "leaderboardRateLimits/alice"), {
      uid: "alice", highestWave: 10, updatedAt: new Date(Date.now() - 60000)
    });
  });
  await assertFails(deleteDoc(doc(db, "leaderboardRateLimits/alice")));
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

test("user save payload above the 200000-character limit is rejected", async () => {
  const db = testEnv.authenticatedContext("alice").firestore();
  await assertFails(setDoc(doc(db, "users/alice"), {
    username: "Alice", saveData: "x".repeat(200001), highestWave: 1, updatedAt: Date.now()
  }));
});

test("user document rejects a highestWave above the configured maximum", async () => {
  const db = testEnv.authenticatedContext("alice").firestore();
  await assertFails(setDoc(doc(db, "users/alice"), {
    username: "Alice", saveData: "{}", highestWave: 5001, updatedAt: Date.now()
  }));
});

test("user document rejects an oversized username", async () => {
  const db = testEnv.authenticatedContext("alice").firestore();
  await assertFails(setDoc(doc(db, "users/alice"), {
    username: "A".repeat(61), saveData: "{}", highestWave: 1, updatedAt: Date.now()
  }));
});


test("leaderboard rejects a wave above highestWave", async () => {
  const db = testEnv.authenticatedContext("alice").firestore();
  await assertFails(writeBoard(db, { highestWave: 10, wave: 11 }));
});

test("leaderboard rejects negative damage and invalid numeric prestige values", async () => {
  const db = testEnv.authenticatedContext("alice").firestore();
  await assertFails(writeBoard(db, { damage: -1 }));
  await assertFails(writeBoard(db, { prestiges: -1 }));
  await assertFails(writeBoard(db, { prestiges: 100001 }));
});

test("leaderboard rejects a mismatched uid and oversized username", async () => {
  const db = testEnv.authenticatedContext("alice").firestore();
  await assertFails(writeBoard(db, { uid: "bob" }));
  await assertFails(writeBoard(db, { username: "A".repeat(21) }));
});

test("leaderboard rejects a wave jump above the per-write limit", async () => {
  const db = testEnv.authenticatedContext("alice").firestore();
  await assertSucceeds(writeBoard(db, { highestWave: 10, wave: 8 }));
  // Emulator test time is advanced by a rules-disabled seed so the cooldown does not mask the jump check.
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
  // The configured per-write ceiling is 100, so 111 is 101 above the seeded high-water mark of 10.
  await assertFails(writeBoard(db, { highestWave: 111, wave: 111 }));
});

test("leaderboard rejects unknown oversized documents and non-string skin IDs", async () => {
  const db = testEnv.authenticatedContext("alice").firestore();
  await assertFails(writeBoard(db, { activeSkin: 123 }));
  await assertFails(writeBoard(db, {
    extraA: 1, extraB: 2, extraC: 3, extraD: 4, extraE: 5, extraF: 6,
    extraG: 7, extraH: 8, extraI: 9, extraJ: 10, extraK: 11, extraL: 12,
    extraM: 13, extraN: 14, extraO: 15
  }));
});


test("user save cannot be read or deleted by another authenticated user", async () => {
  const alice = testEnv.authenticatedContext("alice").firestore();
  const bob = testEnv.authenticatedContext("bob").firestore();
  await testEnv.withSecurityRulesDisabled(async context => {
    await setDoc(doc(context.firestore(), "users/alice"), {
      username: "Alice", saveData: "{}", highestWave: 1, updatedAt: Date.now()
    });
  });
  await assertFails(getDoc(doc(bob, "users/alice")));
  await assertFails(deleteDoc(doc(bob, "users/alice")));
  await assertSucceeds(getDoc(doc(alice, "users/alice")));
});

test("user save rejects a non-numeric highestWave and oversized save payload", async () => {
  const db = testEnv.authenticatedContext("alice").firestore();
  await assertFails(setDoc(doc(db, "users/alice"), {
    username: "Alice", saveData: "{}", highestWave: "500", updatedAt: Date.now()
  }));
  await assertFails(setDoc(doc(db, "users/alice"), {
    username: "Alice", saveData: "x".repeat(200001), highestWave: 1, updatedAt: Date.now()
  }));
});

test("leaderboard rejects a negative wave, negative prestige, and non-numeric damage", async () => {
  const db = testEnv.authenticatedContext("alice").firestore();
  await assertFails(writeBoard(db, { wave: -1, highestWave: 10 }));
  await assertFails(writeBoard(db, { prestiges: -1 }));
  await assertFails(writeBoard(db, { damage: "999" }));
});

test("leaderboard and rate-limit documents cannot be deleted by another user", async () => {
  const alice = testEnv.authenticatedContext("alice").firestore();
  const bob = testEnv.authenticatedContext("bob").firestore();
  await assertSucceeds(writeBoard(alice));
  await assertFails(deleteDoc(doc(bob, "leaderboard/alice")));
  await assertFails(deleteDoc(doc(bob, "leaderboardRateLimits/alice")));
});

test("friend requests can be sent and accepted only by the recipient", async () => {
  const alice = testEnv.authenticatedContext("alice").firestore();
  const bob = testEnv.authenticatedContext("bob").firestore();
  await testEnv.withSecurityRulesDisabled(async context => {
    const admin = context.firestore();
    await setDoc(doc(admin, "usernameRegistry/alice"), { uid: "alice", username: "alice", updatedAt: Date.now() });
    await setDoc(doc(admin, "usernameRegistry/bob"), { uid: "bob", username: "bob", updatedAt: Date.now() });
  });
  const request = {
    fromUid: "alice", toUid: "bob", fromUsername: "alice", toUsername: "bob",
    status: "pending", createdAt: serverTimestamp(), updatedAt: serverTimestamp()
  };
  await assertSucceeds(setDoc(doc(alice, "friendRequests/alice_bob"), request));
  await assertSucceeds(getDoc(doc(bob, "friendRequests/alice_bob")));
  await assertFails(getDoc(doc(testEnv.authenticatedContext("mallory").firestore(), "friendRequests/alice_bob")));
  await assertFails(setDoc(doc(bob, "friendRequests/bob_alice"), {
    fromUid: "bob", toUid: "alice", fromUsername: "bob", toUsername: "alice",
    status: "pending", createdAt: serverTimestamp(), updatedAt: serverTimestamp()
  }));
  const { updateDoc } = require("firebase/firestore");
  await assertFails(updateDoc(doc(alice, "friendRequests/alice_bob"), {
    status: "accepted", updatedAt: serverTimestamp()
  }));
  await assertSucceeds(updateDoc(doc(bob, "friendRequests/alice_bob"), {
    status: "accepted", updatedAt: serverTimestamp()
  }));
});


test("friend requests can only be created by the sender and read by participants", async () => {
  await testEnv.withSecurityRulesDisabled(async context => {
    const db = context.firestore();
    await setDoc(doc(db, "usernameRegistry/alice"), { uid: "alice", username: "alice", updatedAt: Date.now() });
    await setDoc(doc(db, "usernameRegistry/bob"), { uid: "bob", username: "bob", updatedAt: Date.now() });
  });
  const alice = testEnv.authenticatedContext("alice").firestore();
  const bob = testEnv.authenticatedContext("bob").firestore();
  const mallory = testEnv.authenticatedContext("mallory").firestore();
  const request = {
    fromUid: "alice", toUid: "bob", fromUsername: "alice", toUsername: "bob",
    status: "pending", createdAt: serverTimestamp(), updatedAt: serverTimestamp()
  };
  await assertSucceeds(setDoc(doc(alice, "friendRequests/alice_bob"), request));
  await assertSucceeds(getDoc(doc(bob, "friendRequests/alice_bob")));
  await assertFails(getDoc(doc(mallory, "friendRequests/alice_bob")));
  await assertFails(setDoc(doc(mallory, "friendRequests/mallory_bob"), {
    ...request, fromUid: "mallory", fromUsername: "mallory"
  }));
});

test("friend requests reject forged identities and unauthorized status changes", async () => {
  await testEnv.withSecurityRulesDisabled(async context => {
    const db = context.firestore();
    await setDoc(doc(db, "usernameRegistry/alice"), { uid: "alice", username: "alice", updatedAt: Date.now() });
    await setDoc(doc(db, "usernameRegistry/bob"), { uid: "bob", username: "bob", updatedAt: Date.now() });
  });
  const alice = testEnv.authenticatedContext("alice").firestore();
  const bob = testEnv.authenticatedContext("bob").firestore();
  await assertFails(setDoc(doc(alice, "friendRequests/alice_bob"), {
    fromUid: "alice", toUid: "bob", fromUsername: "mallory", toUsername: "bob",
    status: "pending", createdAt: serverTimestamp(), updatedAt: serverTimestamp()
  }));
  await assertSucceeds(setDoc(doc(alice, "friendRequests/alice_bob"), {
    fromUid: "alice", toUid: "bob", fromUsername: "alice", toUsername: "bob",
    status: "pending", createdAt: serverTimestamp(), updatedAt: serverTimestamp()
  }));
  await assertFails(setDoc(doc(alice, "friendRequests/alice_bob"), {
    fromUid: "alice", toUid: "bob", fromUsername: "alice", toUsername: "bob",
    status: "accepted", createdAt: serverTimestamp(), updatedAt: serverTimestamp()
  }));
  // A valid recipient response preserves the original creation timestamp; only updatedAt changes.
  const originalRequest = await getDoc(doc(alice, "friendRequests/alice_bob"));
  const originalCreatedAt = originalRequest.data().createdAt;
  await assertSucceeds(setDoc(doc(bob, "friendRequests/alice_bob"), {
    fromUid: "alice", toUid: "bob", fromUsername: "alice", toUsername: "bob",
    status: "accepted", createdAt: originalCreatedAt, updatedAt: serverTimestamp()
  }));
});


test("friend requests reject self-requests, duplicate pending requests, and reverse pending requests", async () => {
  const alice = testEnv.authenticatedContext("alice").firestore();
  const bob = testEnv.authenticatedContext("bob").firestore();
  await testEnv.withSecurityRulesDisabled(async context => {
    const admin = context.firestore();
    await setDoc(doc(admin, "usernameRegistry/alice"), { uid: "alice", username: "alice", updatedAt: Date.now() });
    await setDoc(doc(admin, "usernameRegistry/bob"), { uid: "bob", username: "bob", updatedAt: Date.now() });
  });
  const request = {
    fromUid: "alice", toUid: "bob", fromUsername: "alice", toUsername: "bob",
    status: "pending", createdAt: serverTimestamp(), updatedAt: serverTimestamp()
  };
  await assertFails(setDoc(doc(alice, "friendRequests/alice_alice"), {
    ...request, toUid: "alice", toUsername: "alice"
  }));
  await assertSucceeds(setDoc(doc(alice, "friendRequests/alice_bob"), request));
  await assertFails(setDoc(doc(alice, "friendRequests/alice_bob"), request));
  await assertFails(setDoc(doc(bob, "friendRequests/bob_alice"), {
    fromUid: "bob", toUid: "alice", fromUsername: "bob", toUsername: "alice",
    status: "pending", createdAt: serverTimestamp(), updatedAt: serverTimestamp()
  }));
});

test("either participant can remove an accepted friendship, but outsiders cannot", async () => {
  const alice = testEnv.authenticatedContext("alice").firestore();
  const bob = testEnv.authenticatedContext("bob").firestore();
  const mallory = testEnv.authenticatedContext("mallory").firestore();
  await testEnv.withSecurityRulesDisabled(async context => {
    const admin = context.firestore();
    await setDoc(doc(admin, "usernameRegistry/alice"), { uid: "alice", username: "alice", updatedAt: Date.now() });
    await setDoc(doc(admin, "usernameRegistry/bob"), { uid: "bob", username: "bob", updatedAt: Date.now() });
    await setDoc(doc(admin, "friendRequests/alice_bob"), {
      fromUid: "alice", toUid: "bob", fromUsername: "alice", toUsername: "bob",
      status: "accepted", createdAt: new Date(), updatedAt: new Date()
    });
  });
  await assertFails(deleteDoc(doc(mallory, "friendRequests/alice_bob")));
  await assertSucceeds(deleteDoc(doc(bob, "friendRequests/alice_bob")));
});

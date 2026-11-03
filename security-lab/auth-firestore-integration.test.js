const { test } = require('node:test');
const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const { join } = require('node:path');
const { randomUUID } = require('node:crypto');
const { initializeTestEnvironment } = require('@firebase/rules-unit-testing');
const { initializeApp, deleteApp } = require('firebase/app');
const { getAuth, connectAuthEmulator, createUserWithEmailAndPassword,
    signInWithEmailAndPassword, signOut, inMemoryPersistence, setPersistence } = require('firebase/auth');
const { getFirestore, connectFirestoreEmulator, doc, setDoc, getDocFromServer } = require('firebase/firestore');

// Separate demo namespace prevents the parallel rules suite's clearFirestore()
// calls from deleting this test's synthetic saves. Never use a real project ID.
const projectId = 'demo-towerv1-auth-integration';

test('emulated Auth tokens enforce Firestore ownership and restore saves on a second client', async () => {
    const apps = [];
    const env = await initializeTestEnvironment({
        projectId,
        firestore: { host: '127.0.0.1', port: 8085,
            rules: readFileSync(join(__dirname, '..', 'firestore.rules'), 'utf8') }
    });
    async function client() {
        const app = initializeApp({ projectId, apiKey: 'demo-api-key' }, randomUUID());
        apps.push(app);
        const auth = getAuth(app);
        connectAuthEmulator(auth, 'http://127.0.0.1:9099', { disableWarnings: true });
        await setPersistence(auth, inMemoryPersistence);
        const db = getFirestore(app);
        connectFirestoreEmulator(db, '127.0.0.1', 8085);
        return { auth, db };
    }
    try {
        const alice = await client();
        const bob = await client();
        const secondDevice = await client();
        const email = `${randomUUID()}@example.test`;
        const password = 'emulator-only-password';
        const { user } = await createUserWithEmailAndPassword(alice.auth, email, password);
        await createUserWithEmailAndPassword(bob.auth, `${randomUUID()}@example.test`, password);
        const save = { username: 'Alice', saveData: JSON.stringify({ wave: 8 }),
            highestWave: 8, updatedAt: Date.now() };
        await setDoc(doc(alice.db, 'users', user.uid), save);
        await signInWithEmailAndPassword(secondDevice.auth, email, password);
        assert.equal(secondDevice.auth.currentUser.uid, user.uid);
        assert.deepEqual((await getDocFromServer(doc(secondDevice.db, 'users', user.uid))).data(), save);
        const denied = error => error.code === 'permission-denied';
        await assert.rejects(getDocFromServer(doc(bob.db, 'users', user.uid)), denied);
        await assert.rejects(setDoc(doc(bob.db, 'users', user.uid), save), denied);
        await signOut(secondDevice.auth);
        await assert.rejects(getDocFromServer(doc(secondDevice.db, 'users', user.uid)), denied);
        assert.deepEqual((await getDocFromServer(doc(alice.db, 'users', user.uid))).data(), save);
    } finally {
        await Promise.all(apps.map(deleteApp));
        await env.cleanup();
    }
});

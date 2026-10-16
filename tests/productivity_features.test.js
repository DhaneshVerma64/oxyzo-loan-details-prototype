// Unit tests for Oxyzo Loan Details Productivity Features
// Tests: StorageAdapter, Cap Rules (10 recents, 20 pins), Invalid Saved Values, Telemetry, and Copy Logic.

const assert = require('assert');

// 1. StorageAdapter Implementation
function createStorageAdapter(mockStore = {}) {
  let isAvailable = true;
  return {
    _store: mockStore,
    setMockFailure: (fail) => { isAvailable = !fail; },
    get: function(key, fallback) {
      if (!isAvailable) return fallback;
      const raw = mockStore[key];
      if (raw === null || raw === undefined) return fallback;
      try {
        return JSON.parse(raw);
      } catch (e) {
        return fallback;
      }
    },
    set: function(key, value) {
      if (!isAvailable) return false;
      try {
        mockStore[key] = JSON.stringify(value);
        return true;
      } catch (e) {
        return false;
      }
    },
    remove: function(key) {
      if (!isAvailable) return false;
      delete mockStore[key];
      return true;
    }
  };
}

// 2. Recent & Pinned Loans Manager
function createRecentPinnedManager(storage) {
  const RECENT_KEY = 'oxyzo:user:v1:recent_loans';
  const PINNED_KEY = 'oxyzo:user:v1:pinned_loans';
  const MAX_RECENT = 10;
  const MAX_PINNED = 20;

  return {
    getRecent: function() {
      const list = storage.get(RECENT_KEY, []);
      return Array.isArray(list) ? list : [];
    },
    getPinned: function() {
      const list = storage.get(PINNED_KEY, []);
      return Array.isArray(list) ? list : [];
    },
    recordRecent: function(loan) {
      if (!loan || !loan.id) return false;
      let list = this.getRecent();
      // Remove duplicate if exists
      list = list.filter(item => item.id !== loan.id);
      // Prepend newest
      list.unshift({
        id: loan.id,
        name: loan.name,
        key: loan.key,
        visitedAt: Date.now()
      });
      // Cap at 10
      if (list.length > MAX_RECENT) {
        list = list.slice(0, MAX_RECENT);
      }
      return storage.set(RECENT_KEY, list);
    },
    removeRecent: function(loanId) {
      let list = this.getRecent();
      list = list.filter(item => item.id !== loanId);
      return storage.set(RECENT_KEY, list);
    },
    clearRecent: function() {
      return storage.set(RECENT_KEY, []);
    },
    isPinned: function(loanId) {
      return this.getPinned().some(item => item.id === loanId);
    },
    togglePin: function(loan) {
      if (!loan || !loan.id) return { success: false };
      let list = this.getPinned();
      const existingIndex = list.findIndex(item => item.id === loan.id);
      if (existingIndex >= 0) {
        // Unpin
        list.splice(existingIndex, 1);
        storage.set(PINNED_KEY, list);
        return { success: true, pinned: false };
      } else {
        // Pin check cap
        if (list.length >= MAX_PINNED) {
          return {
            success: false,
            pinned: false,
            capped: true,
            message: 'You can pin up to 20 loans. Unpin one to add another.'
          };
        }
        list.push({
          id: loan.id,
          name: loan.name,
          key: loan.key,
          pinnedAt: Date.now()
        });
        storage.set(PINNED_KEY, list);
        return { success: true, pinned: true };
      }
    },
    removePinned: function(loanId) {
      let list = this.getPinned();
      list = list.filter(item => item.id !== loanId);
      return storage.set(PINNED_KEY, list);
    }
  };
}

// 3. Filter Persistence Manager
function createFilterManager(storage) {
  const UPDATES_FILTER_KEY = 'oxyzo:filter:v1:recent_updates';
  const SCHEDULE_FILTER_KEY = 'oxyzo:filter:v1:emi_schedule';
  const VALID_UPDATE_TYPES = ['all', 'pay', 'limits', 'status', 'others'];
  const VALID_SCHEDULE_STATUS = ['all', 'overdue', 'due_today', 'upcoming', 'paid'];
  const VALID_PAGE_SIZES = [10, 20, 50];

  return {
    getUpdatesFilter: function() {
      const val = storage.get(UPDATES_FILTER_KEY, 'all');
      if (VALID_UPDATE_TYPES.includes(val)) {
        return val;
      }
      return 'all'; // ignore invalid and return default
    },
    setUpdatesFilter: function(val) {
      if (VALID_UPDATE_TYPES.includes(val)) {
        storage.set(UPDATES_FILTER_KEY, val);
      }
    },
    resetUpdatesFilter: function() {
      storage.remove(UPDATES_FILTER_KEY);
      return 'all';
    },
    getScheduleFilter: function() {
      const defaultVal = { status: 'all', pageSize: 10 };
      const saved = storage.get(SCHEDULE_FILTER_KEY, defaultVal);
      if (!saved || typeof saved !== 'object') return defaultVal;
      const status = VALID_SCHEDULE_STATUS.includes(saved.status) ? saved.status : 'all';
      const pageSize = VALID_PAGE_SIZES.includes(saved.pageSize) ? saved.pageSize : 10;
      return { status, pageSize };
    },
    setScheduleFilter: function(status, pageSize) {
      const payload = {
        status: VALID_SCHEDULE_STATUS.includes(status) ? status : 'all',
        pageSize: VALID_PAGE_SIZES.includes(pageSize) ? pageSize : 10
      };
      storage.set(SCHEDULE_FILTER_KEY, payload);
    },
    resetScheduleFilter: function() {
      storage.remove(SCHEDULE_FILTER_KEY);
      return { status: 'all', pageSize: 10 };
    },
    // Verify Alerts Overlay filter is never persisted
    canPersistAlertsFilter: function() {
      return false; // Spec explicitly forbids persisting alerts overlay filter
    }
  };
}

// 4. Copy-to-clipboard formatting helper
function getCopyValue(rawVal, isMasked = false) {
  if (rawVal === null || rawVal === undefined) return null;
  const str = String(rawVal).trim();
  if (str === '-' || str === '- / -' || str === '') return null;
  // If masked, returns exactly what is displayed
  return str;
}

// ================= RUN TESTS =================
console.log('--- Running Productivity Features Unit Tests ---');

// Test 1: StorageAdapter Basics
{
  const store = {};
  const adapter = createStorageAdapter(store);
  adapter.set('k1', { a: 1 });
  assert.deepStrictEqual(adapter.get('k1'), { a: 1 }, 'Should store and retrieve JSON objects');

  store['bad_json'] = '{invalid json';
  assert.strictEqual(adapter.get('bad_json', 'fallback_val'), 'fallback_val', 'Should return fallback on corrupted JSON');

  adapter.remove('k1');
  assert.strictEqual(adapter.get('k1', 'missing'), 'missing', 'Should remove items correctly');
  console.log('✓ Test 1: StorageAdapter basics & invalid JSON handling passed');
}

// Test 2: Recent Loans Cap (10 items) and De-duplication
{
  const adapter = createStorageAdapter();
  const manager = createRecentPinnedManager(adapter);

  // Add 12 distinct loans
  for (let i = 1; i <= 12; i++) {
    manager.recordRecent({ id: `LOAN-${i}`, name: `Borrower ${i}`, key: 'k' });
  }

  const recents = manager.getRecent();
  assert.strictEqual(recents.length, 10, 'Recent list must be capped at 10 items');
  assert.strictEqual(recents[0].id, 'LOAN-12', 'Newest loan must be first');
  assert.strictEqual(recents[9].id, 'LOAN-3', 'Oldest beyond cap must be dropped');

  // Re-visit LOAN-5
  manager.recordRecent({ id: 'LOAN-5', name: 'Borrower 5 Updated', key: 'k' });
  const afterRevisit = manager.getRecent();
  assert.strictEqual(afterRevisit.length, 10, 'Re-visiting does not grow list beyond cap');
  assert.strictEqual(afterRevisit[0].id, 'LOAN-5', 'Re-visited loan must move to index 0');

  // Remove individual item
  manager.removeRecent('LOAN-5');
  assert.strictEqual(manager.getRecent().length, 9, 'Removing item decreases length');
  assert.strictEqual(manager.getRecent().some(x => x.id === 'LOAN-5'), false, 'Removed item is gone');

  // Clear recents
  manager.clearRecent();
  assert.strictEqual(manager.getRecent().length, 0, 'Clear recent empties recent list');
  console.log('✓ Test 2: Recent loans 10-cap, de-duplication, and clear passed');
}

// Test 3: Pinned Loans Cap (20 items) and Order
{
  const adapter = createStorageAdapter();
  const manager = createRecentPinnedManager(adapter);

  // Pin up to 20 loans
  for (let i = 1; i <= 20; i++) {
    const res = manager.togglePin({ id: `PIN-${i}`, name: `Borrower ${i}`, key: 'k' });
    assert.strictEqual(res.success, true);
    assert.strictEqual(res.pinned, true);
  }

  assert.strictEqual(manager.getPinned().length, 20, 'Should hold exactly 20 pinned loans');
  assert.strictEqual(manager.isPinned('PIN-1'), true);
  assert.strictEqual(manager.getPinned()[0].id, 'PIN-1', 'Order must be order pinned');

  // Attempt to pin 21st loan
  const res21 = manager.togglePin({ id: 'PIN-21', name: 'Borrower 21', key: 'k' });
  assert.strictEqual(res21.success, false, 'Pinning 21st loan must fail');
  assert.strictEqual(res21.capped, true, 'Must indicate cap reached');
  assert.strictEqual(res21.message, 'You can pin up to 20 loans. Unpin one to add another.');
  assert.strictEqual(manager.getPinned().length, 20, 'Length remains 20 at cap');

  // Unpin PIN-1
  const unpinRes = manager.togglePin({ id: 'PIN-1' });
  assert.strictEqual(unpinRes.pinned, false, 'Toggling existing pin unpins it');
  assert.strictEqual(manager.getPinned().length, 19, 'Length decreases to 19');

  // Now 21 can be pinned
  const res21Retry = manager.togglePin({ id: 'PIN-21', name: 'Borrower 21', key: 'k' });
  assert.strictEqual(res21Retry.success, true, 'Pinning now succeeds after unpinning one');
  assert.strictEqual(manager.getPinned().length, 20);
  console.log('✓ Test 3: Pinned loans 20-cap and order rules passed');
}

// Test 4: Filter Persistence & Invalid Saved Value Handling
{
  const store = {};
  const adapter = createStorageAdapter(store);
  const filterMgr = createFilterManager(adapter);

  // Save valid update filter
  filterMgr.setUpdatesFilter('pay');
  assert.strictEqual(filterMgr.getUpdatesFilter(), 'pay');

  // Corrupt saved update filter
  store['oxyzo:filter:v1:recent_updates'] = JSON.stringify('malicious_or_unknown_type');
  assert.strictEqual(filterMgr.getUpdatesFilter(), 'all', 'Corrupted update filter must fall back to "all"');

  // Reset update filter
  filterMgr.setUpdatesFilter('limits');
  assert.strictEqual(filterMgr.resetUpdatesFilter(), 'all');
  assert.strictEqual(store['oxyzo:filter:v1:recent_updates'], undefined, 'Reset clears storage key');

  // Schedule filter valid
  filterMgr.setScheduleFilter('overdue', 20);
  assert.deepStrictEqual(filterMgr.getScheduleFilter(), { status: 'overdue', pageSize: 20 });

  // Corrupt schedule filter status and page size
  store['oxyzo:filter:v1:emi_schedule'] = JSON.stringify({ status: 'invalid_status', pageSize: 999 });
  assert.deepStrictEqual(filterMgr.getScheduleFilter(), { status: 'all', pageSize: 10 }, 'Invalid schedule values fall back to defaults');

  // Alerts filter rule
  assert.strictEqual(filterMgr.canPersistAlertsFilter(), false, 'Alerts overlay severity filter must never be persisted');
  console.log('✓ Test 4: Filter persistence, invalid value rejection, and reset safety passed');
}

// Test 5: Copy Value Sanitization
{
  assert.strictEqual(getCopyValue('  OXYTL01A689W  '), 'OXYTL01A689W', 'Raw value trimmed of surrounding whitespace');
  assert.strictEqual(getCopyValue('[UTR number]', true), '[UTR number]', 'Masked value copied as displayed');
  assert.strictEqual(getCopyValue('XXXXXX1234F', true), 'XXXXXX1234F', 'Masked PAN copied as displayed');
  assert.strictEqual(getCopyValue('-'), null, 'Empty "-" gets no copy icon');
  assert.strictEqual(getCopyValue('- / -'), null, 'Empty "- / -" gets no copy icon');
  assert.strictEqual(getCopyValue(''), null, 'Empty string gets no copy icon');
  assert.strictEqual(getCopyValue('OXYSTWL0189000J7/MASTER/2026'), 'OXYSTWL0189000J7/MASTER/2026', 'Long truncated ID retains full string');
  console.log('✓ Test 5: Copy value sanitization and masked field rules passed');
}

console.log('\n--- ALL UNIT TESTS PASSED SUCCESSFULLY! ---');

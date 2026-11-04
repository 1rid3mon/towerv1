/* V16 Station Navigation: bounded shortest-path routing for tap-to-walk.
   Pure coordinates only. No saves, combat or network writes. */
(function (root) {
'use strict';
if (root.TowerStationNavigationV16) return;

function findPath(grid, origin, target, passable) {
    if (!Array.isArray(grid) || !grid.length || grid.length > 64) return null;
    if (grid.some(row => typeof row !== 'string' || row.length > 64)) return null;
    const valid = p => p && Number.isInteger(p.x) && Number.isInteger(p.y)
        && p.y >= 0 && p.y < grid.length && p.x >= 0 && p.x < grid[p.y].length
        && grid[p.y][p.x] !== '#';
    if (!valid(origin) || !valid(target)) return null;
    const key = (x, y) => x + ',' + y;
    const startKey = key(origin.x, origin.y), endKey = key(target.x, target.y);
    if (startKey === endKey) return [];
    const queue = [{ x: origin.x, y: origin.y }], seen = new Set([startKey]);
    const parent = new Map();
    const offsets = [[0, -1], [1, 0], [0, 1], [-1, 0]];
    for (let index = 0; index < queue.length && index < 4096; index++) {
        const current = queue[index];
        for (const [dx, dy] of offsets) {
            const point = { x: current.x + dx, y: current.y + dy };
            if (!valid(point)) continue;
            if (typeof passable === 'function' && !passable(grid[point.y][point.x], point.x, point.y)) continue;
            const id = key(point.x, point.y);
            if (seen.has(id)) continue;
            seen.add(id);
            parent.set(id, key(current.x, current.y));
            if (id === endKey) {
                const result = [];
                let cursor = endKey;
                while (cursor !== startKey) {
                    const [x, y] = cursor.split(',').map(Number);
                    result.push({ x, y });
                    cursor = parent.get(cursor);
                }
                return result.reverse();
            }
            queue.push(point);
        }
    }
    return null;
}

root.TowerStationNavigationV16 = Object.freeze({ findPath });
})(typeof window !== 'undefined' ? window : globalThis);

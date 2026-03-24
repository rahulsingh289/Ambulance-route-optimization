/**
 * Binary Search on sorted hospital array by name (alphabetical).
 * Array must be sorted before calling this.
 * @param {Array} hospitals - sorted array of hospital objects
 * @param {string} target - hospital name to search
 * @returns {Object|null} - found hospital or null
 */
function binarySearchByName(hospitals, target) {
    let low = 0;
    let high = hospitals.length - 1;
    const key = target.toLowerCase();

    while (low <= high) {
        const mid = Math.floor((low + high) / 2);
        const midName = hospitals[mid].name.toLowerCase();

        if (midName === key) return hospitals[mid];
        else if (midName < key) low = mid + 1;
        else high = mid - 1;
    }
    return null;
}

/**
 * Haversine formula — calculates distance (km) between two lat/lng points.
 */
function haversineDistance(lat1, lon1, lat2, lon2) {
    const R = 6371;
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
        Math.sin(dLat / 2) ** 2 +
        Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

/**
 * Merge Sort — sorts hospitals array by distance_km ascending.
 * Used for route ranking as per project requirements.
 * @param {Array} arr - array of hospital objects with distance_km field
 * @returns {Array} - sorted array
 */
function mergeSortByDistance(arr) {
    if (arr.length <= 1) return arr;
    const mid = Math.floor(arr.length / 2);
    const left = mergeSortByDistance(arr.slice(0, mid));
    const right = mergeSortByDistance(arr.slice(mid));
    return merge(left, right);
}

function merge(left, right) {
    const result = [];
    let i = 0, j = 0;
    while (i < left.length && j < right.length) {
        if (left[i].distance_km <= right[j].distance_km) result.push(left[i++]);
        else result.push(right[j++]);
    }
    return result.concat(left.slice(i)).concat(right.slice(j));
}

module.exports = { binarySearchByName, haversineDistance, mergeSortByDistance };

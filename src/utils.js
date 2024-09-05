export function roundValues(obj) {
    if (typeof obj === 'object' && obj !== null) {
        if (Array.isArray(obj)) {
            return obj.map(item => roundValues(item));
        } else {
            let roundedObj = {};
            for (let key in obj) {
                if (obj.hasOwnProperty(key)) {
                    roundedObj[key] = roundValues(obj[key]);
                }
            }
            return roundedObj;
        }
    } else if (typeof obj === 'number') {
        return Math.round(obj);
    }
    return obj;
}
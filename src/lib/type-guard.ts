export const requireNonNull = <T>(t: T | null): T => {
    if (!t)
        throw new Error('Missing element')
    return t;
}

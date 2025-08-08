const genUUIDv4 = () => {
  // RFC4122 version 4 compliant
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

export const getOrCreateVisitorId = (): string => {
  try {
    const key = 'visitor_id';
    const existing = localStorage.getItem(key);
    if (existing) return existing;

    const id = (typeof crypto !== 'undefined' && 'randomUUID' in crypto)
      ? crypto.randomUUID()
      : genUUIDv4();

    localStorage.setItem(key, id);
    return id;
  } catch {
    return genUUIDv4();
  }
};

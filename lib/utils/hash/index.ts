const table = new WeakMap<any, string>();

const isDate = (date: any): date is Date => date.constructor === Date;

export const hash = (valueToHash: any): string => {
  const saveHashAndReturn = (hashedVal: string) => {
    table.set(valueToHash, hashedVal);

    return hashedVal;
  };

  if (table.has(valueToHash)) return table.get(valueToHash) as string;

  if (['symbol', 'number', 'string'].includes(typeof valueToHash) || !valueToHash)
    return String(valueToHash);
  if (isDate(valueToHash)) return valueToHash.toISOString();
  if (Array.isArray(valueToHash)) return saveHashAndReturn(valueToHash.map(hash).join(','));

  // Object
  const keys = Reflect.ownKeys(valueToHash).sort();

  const hashedObjArr: string[] = keys.map((key) => {
    const value = valueToHash[key];

    return `${String(key)}:${hash(value)}`;
  });

  return saveHashAndReturn(`#${hashedObjArr.join(',')}`);
};

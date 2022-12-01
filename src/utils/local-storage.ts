function getVersion() : string {
    return process.env.REACT_APP_VERCEL_GIT_COMMIT_SHA || 'local';
  }
  export interface LocalStorageEntry {
    item: any;
    version: string;
    expires: number;
  }
  
  export function setLocalStorageItem(key: string, item: any, ttlSeconds: number) {
    try {
      const storageItem = {
        item,
        version: getVersion(),
        expires: ttlSeconds > 0 ? Date.now() + ttlSeconds * 1000 : -1
      };
      localStorage.setItem(key, JSON.stringify(storageItem));
    } catch (error) {
      console.error('[localStorage.setItem] error.message => ', error.message);
    }
  }
  
  export function getLocalStorageItem(key: string) {
    let ret = undefined;
    const localStorageEntryRaw = localStorage.getItem(key);
    if (localStorageEntryRaw) {
      const localStorageEntry: LocalStorageEntry = JSON.parse(localStorageEntryRaw);
      if ((localStorageEntry.expires === -1 || Date.now() < localStorageEntry.expires) && localStorageEntry.version === getVersion()) {
        ret = localStorageEntry.item;
      }
    }
    return ret;
  }
  
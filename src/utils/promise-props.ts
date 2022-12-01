export async function promiseProps<T>(obj: { [K in keyof T]: Promise<T[K]> | T[K] }): Promise<T> {
    const ret: any = {};
    await Promise.all(Object.entries(obj)
      .map(async ([key, value]) => {
        ret[key] = await value;
      }));
    return ret;
  }  
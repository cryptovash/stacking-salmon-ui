export function chunkify<T>(values: T[], chunkSize: number) {
    const chunks = Array.from(
      // give it however many slots are needed - in our case 8
      // 1-7 with 10 items, and 8th slot will have 6
      { length: Math.ceil(values.length / chunkSize) },
      // this is a map function that will fill up our slots
      (_, i) => {
        // make a slice of 100 items
        const start = chunkSize * i;
        // slice our the piece of the array we need
        return values.slice(start, start + chunkSize);
      }
    );
    return chunks;
  }  
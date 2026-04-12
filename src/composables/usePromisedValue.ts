import { ref, watch } from "vue";

/** 
 * Allows you to ref/promise pair, that resolves the promise when the ref is set to a non-null value. 
 * Useful for waiting for something to be initialized in a composable, without having to expose the ref itself. 
 */
export function usePromisedValue() {
  const value = ref(false);
  
  let resolver: ((value: boolean) => void) | null = null;
  let rejector: ((error: Error) => void) | null = null;
  const promise = new Promise<boolean>((resolve, reject) => {
    resolver = resolve;
    rejector = reject;
  });

  watch(value, (newValue) => {
    if (newValue !== null && resolver) {
      resolver(newValue);
    } else if (newValue === null && rejector) {
      rejector(new Error("Value was reset to null"));
    }
  }, { immediate: true });

  return { value: value, promise };
}
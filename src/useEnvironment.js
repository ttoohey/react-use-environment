import { useMemo } from "react";
import useFetch from "fetch-suspense";

function useEnvironment(options = {}) {
  const { linkId, suspense } = {
    linkId: "environment",
    suspense: true,
    ...options
  };
  const href = useMemo(() => {
    const { href } = document.getElementById(linkId);
    return href;
  }, []);
  try {
    const env = useFetch(href);
    if (suspense) {
      return env;
    } else {
      return [env, false, null];
    }
  } catch (e) {
    if (e instanceof Promise) {
      if (suspense) {
        throw e;
      } else {
        return [null, true, null];
      }
    }
    return [null, false, e];
  }
}

export default useEnvironment;

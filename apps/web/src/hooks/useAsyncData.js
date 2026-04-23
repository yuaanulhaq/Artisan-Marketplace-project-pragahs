import { useEffect, useEffectEvent, useState } from "react";

export const useAsyncData = (loader, dependencies = [], initialValue = null) => {
  const [data, setData] = useState(initialValue);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useEffectEvent(async () => {
    setLoading(true);
    setError("");

    try {
      const result = await loader();
      setData(result);
    } catch (loadError) {
      setError(loadError.message || "Unable to load data.");
    } finally {
      setLoading(false);
    }
  });

  useEffect(() => {
    load();
  }, dependencies);

  return {
    data,
    setData,
    loading,
    error,
    reload: load
  };
};


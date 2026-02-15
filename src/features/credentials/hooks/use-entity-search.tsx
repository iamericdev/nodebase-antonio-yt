import { PAGINATION } from "@/config/constants";
import { useEffect, useState } from "react";

interface UseEntitySearchProps<T extends { search: string; page: number }> {
  params: T;
  setParams: (params: T) => void;
  debounceMs?: number;
}

export const useEntitySearch = ({
  params,
  setParams,
  debounceMs = 500,
}: UseEntitySearchProps<{ search: string; page: number }>) => {
  const [localSearch, setLocalSearch] = useState(params.search);

  useEffect(() => {
    if (localSearch === "" && params.search !== "") {
      setParams({ ...params, search: "", page: PAGINATION.DEFAULT_PAGE });
      return;
    }
    const timeout = setTimeout(() => {
      if (localSearch === params.search) return;
      setParams({
        ...params,
        search: localSearch,
        page: PAGINATION.DEFAULT_PAGE,
      });
    }, debounceMs);
    return () => clearTimeout(timeout);
  }, [localSearch, setParams, debounceMs]);

  useEffect(() => {
    setLocalSearch(params.search);
  }, [params.search]);

  return {
    searchValue: localSearch,
    onSearchChange: setLocalSearch,
  };
};

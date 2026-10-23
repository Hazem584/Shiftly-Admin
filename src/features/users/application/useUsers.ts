import { useCallback, useState } from "react";
import { useAdminRepository } from "../../../app/ServicesProvider";
import { useResource } from "../../../shared/hooks/useResource";
export function useUsers(refresh: number, compact: boolean) {
  const repo = useAdminRepository();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const state = useResource(
    useCallback(
      (signal) => {
        return repo.users(
          { page, pageSize: compact ? 5 : 20, search, status },
          signal,
        );
      },
      [repo, page, search, status, compact],
    ),
    true,
    refresh,
  );
  return {
    ...state,
    page,
    setPage,
    status,
    filter: (value: string) => {
      setStatus(value);
      setPage(1);
    },
    search: (value: string) => {
      setSearch(value.trim());
      setPage(1);
    },
  };
}

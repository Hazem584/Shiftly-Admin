import { useCallback, useState } from "react";
import { useAdminRepository } from "../../../app/ServicesProvider";
import { useResource } from "../../../shared/hooks/useResource";
export function useWorkspaces(refresh: number) {
  const repo = useAdminRepository();
  const [page, setPage] = useState(1);
  const state = useResource(
    useCallback((signal) => repo.workspaces(page, signal), [repo, page]),
    true,
    refresh,
  );
  return { ...state, page, setPage };
}

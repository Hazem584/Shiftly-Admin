import { useCallback } from "react";
import { useAdminRepository } from "../../../app/ServicesProvider";
import { useResource } from "../../../shared/hooks/useResource";
export function useOverview(refresh: number) {
  const repo = useAdminRepository();
  return useResource(
    useCallback((signal) => repo.overview(signal), [repo]),
    true,
    refresh,
  );
}

import { createContext, useContext, type ReactNode } from "react";
import type { AdminRepository } from "../core/domain/admin-repository";
import { adminRepository } from "../core/data/admin-api-repository";
const Context = createContext<AdminRepository>(adminRepository);
export function ServicesProvider({
  children,
  repository = adminRepository,
}: {
  children: ReactNode;
  repository?: AdminRepository;
}) {
  return <Context.Provider value={repository}>{children}</Context.Provider>;
}
export const useAdminRepository = () => useContext(Context);

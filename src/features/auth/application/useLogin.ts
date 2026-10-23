import { useState, type FormEvent } from "react";
import { supabase } from "../../../core/auth/supabase-client";
export function useLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [failed, setFailed] = useState(false);
  async function submit(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setFailed(false);
    try {
      const result = await supabase!.auth.signInWithPassword({
        email,
        password,
      });
      if (result.error) throw result.error;
    } catch {
      setFailed(true);
    } finally {
      setBusy(false);
    }
  }
  return { email, setEmail, password, setPassword, busy, failed, submit };
}

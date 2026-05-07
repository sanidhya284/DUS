import { useMutation } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useAuthStore } from "@/store/auth.store";
import { useRouter } from "next/navigation";

interface LoginInput { email: string; password: string }
interface RegisterInput { email: string; password: string }

interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

function decodeUser(token: string) {
  const payload = JSON.parse(atob(token.split(".")[1]));
  return { id: payload.sub as string, email: payload.email as string, plan: payload.plan as "free" | "pro" };
}

export function useLogin() {
  const setAuth = useAuthStore((s) => s.setAuth);
  const router = useRouter();

  return useMutation({
    mutationFn: async (input: LoginInput) => {
      const { data } = await api.post<{ data: AuthTokens }>("/auth/login", input);
      return data.data;
    },
    onSuccess: (tokens) => {
      const user = decodeUser(tokens.accessToken);
      setAuth(user, tokens.accessToken, tokens.refreshToken);
      router.push("/dashboard");
    },
  });
}

export function useRegister() {
  const router = useRouter();

  return useMutation({
    mutationFn: async (input: RegisterInput) => {
      const { data } = await api.post("/auth/register", input);
      return data.data;
    },
    onSuccess: () => {
      router.push("/login");
    },
  });
}

export function useLogout() {
  const clearAuth = useAuthStore((s) => s.clearAuth);
  const router = useRouter();

  return () => {
    clearAuth();
    router.push("/");
  };
}

import { Navigate } from "react-router-dom";

import { getToken } from "@/utils/localstorage.ts";

type Props = {
  children: React.ReactNode;
};

export default function Auth({ children }: Props) {
  const token = getToken();

  if (!token) {
    return <Navigate to="/auth/login" />;
  }

  return children;
}

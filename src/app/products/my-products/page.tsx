import { cookies } from "next/headers";
import { verifyToken } from "@/lib/jwt";
import MyProductsUI from "./MyProductsUI";

export const metadata = {
  title: "My Products",
};

export default async function MyProductsPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  const isUnauthorized = !token || !verifyToken(token);

  return <MyProductsUI unauthorized={isUnauthorized} />;
}

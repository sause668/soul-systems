import { redirect } from "next/navigation";
import StockView from "@/app/(user-site)/stock/_components/StockView";
import { verifySession } from "@/app/lib/session";
import { getStockList } from "@/lib/stock/stock-list";

export default async function StockPage() {
  const session = await verifySession();
  if (!session) {
    redirect("/login");
  }
  if (session.userRole !== "ADMIN") {
    redirect("/dashboard");
  }

  const rows = await getStockList();

  return <StockView rows={rows} />;
}

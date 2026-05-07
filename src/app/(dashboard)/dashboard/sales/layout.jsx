import { isSales } from "@/lib/middleware";
import { redirect } from "next/navigation";

export default async function SalesLayout({ children }) {
    const check = await isSales();
    
    if (!check.success) {
        redirect("/dashboard");
    }

    return <>{children}</>;
}

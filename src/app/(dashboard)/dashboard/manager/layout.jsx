import { isManager } from "@/lib/middleware";
import { redirect } from "next/navigation";

export default async function ManagerLayout({ children }) {
    const check = await isManager();
    
    if (!check.success) {
        redirect("/dashboard");
    }

    return <>{children}</>;
}

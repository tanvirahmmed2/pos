import { isAdmin } from "@/lib/middleware";
import { redirect } from "next/navigation";

export default async function AdminLayout({ children }) {
    const check = await isAdmin();
    
    if (!check.success) {
        redirect("/dashboard");
    }

    return <>{children}</>;
}

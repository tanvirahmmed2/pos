import { isUserLogin } from "@/lib/middleware";
import { NextResponse } from "next/server";

export async function GET() {
    try {
        const auth = await isUserLogin()
        if (!auth.success) {
            return NextResponse.json({
                success: false, message: auth.message
            }, { status: 401 })
        }

        return NextResponse.json({
            success: true, message: 'authentication successful', payload: auth.payload
        }, { status: 200 })

    } catch (error) {
        return NextResponse.json({
            success: false, message: error.message
        }, { status: 500 })
    }
}
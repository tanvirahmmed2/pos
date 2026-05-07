import { NextResponse } from "next/server";



export async function GET() {
    try {
        return NextResponse.json({
            success:true, message:'server is running'
        },{status:200})
    } catch (error) {
        return NextResponse.json({
            success:false, message:error.mesasge
        },{status:500})
        
    }
    
}
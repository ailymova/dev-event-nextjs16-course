import { Event } from "@/database";
import connectToDatabase from "@/lib/mongodb";
import { NextRequest, NextResponse } from "next/server";
import {v2 as cloudinary} from "cloudinary";

export async function POST(req : NextRequest) {
    try {
        await connectToDatabase();

        const formData = await req.formData();

        let event;

        try {
            event = Object.fromEntries(formData.entries())
        } catch (e) {
            return NextResponse.json({ message: 'Invalid form data' }, { status: 400 });
        }

        const file = formData.get('image');
        if (!(file instanceof File)) {
            return NextResponse.json({ message: 'Image is required' }, { status: 400 });
        }

        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        const uploadResult = await new Promise((resolve, reject) => {
            cloudinary.uploader.upload_stream(
                { resource_type: 'image', folder: 'events' },
                (error, result) => {
                    if (error) reject(error);
                    
                    resolve(result);
                }).end(buffer);
        });

        event.image = (uploadResult as {secure_url: string}).secure_url;

        const createdEvent = await Event.create(event);

        return NextResponse.json({event: createdEvent,  message: 'Event created successfully' }, { status: 201 });
    } catch (e) {
        console.error(e);
        return NextResponse.json({ message: 'Event Creation Failed', error: e instanceof Error ? e.message : 'Unknown Error'}, { status: 500 });
    }
}

export async function GET() {
    try {
        await connectToDatabase();

        const events = await Event.find().sort({ createdAt: -1 });

        return NextResponse.json({message: 'Event list fetched successfully', events}, { status: 200 });
    } catch (e) {
        return NextResponse.json({ message: 'Event fetching f', error: e}, { status: 500 });
    }
}
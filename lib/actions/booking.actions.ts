'use server'

import { Booking } from "@/database";
import connectToDatabase from "../mongodb";

export const createBooking = async ({eventId, slug, email} : {eventId: string, slug: string, email: string}) => {
    try {
        await connectToDatabase();
        const booking = (await Booking.create({eventId, slug,  email})).lean();

        return { success: true, booking }
    } catch (e) {
        console.log('Create booking failed', e);
        return { success: false, error: e}
    }
}
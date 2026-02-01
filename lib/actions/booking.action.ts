
'use server'


import connectDB from "../mongodb";
import { Booking } from "@/database";



export const createBooking =async ({eventId , slug , email } : {email : string , slug : string , eventId : string})=>{

    try {

        await connectDB();

        const booking = await Booking.create({eventId , slug , email});

        return {success : true};

        


        
    } catch (e) {

        console.error('Create booking faild' , e);
        return {success : false , error : e}
        
    }



}


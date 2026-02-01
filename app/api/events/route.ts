import connectDB from "@/lib/mongodb";
import {v2 as coludinary} from 'cloudinary';
// import { error } from "console";
import { NextRequest, NextResponse } from "next/server";
import Event from '@/database/event.model';

export async function POST(req : NextRequest){

    try {

        await connectDB();
        
        const formData = await req.formData();

        let event;

        try {
            event = Object.fromEntries(formData.entries());
        } catch (e) {
            return NextResponse.json({
                message : "Invalid JSON data format" ,
            }, { status : 400})
        }

        const file = formData.get('image') as File ;

        if (!file) return NextResponse.json({message : "Image file is required" } , {status : 400});


         let tags = JSON.parse(formData.get('tags') as string);
         let agenda = JSON.parse(formData.get('agenda') as string);

        const arrayBuffer = await file.arrayBuffer();

        const buffer = Buffer.from(arrayBuffer);
        const uploadResult = await new Promise((resolve , reject ) => {
            
            coludinary.uploader.upload_stream({resource_type : 'image' , folder : 'devEvent'} ,
                (error , result) =>{
                    if (error) return reject(error);
                    resolve(result);
                }
            ).end(buffer);

        })  

        event.image = (uploadResult as {secure_url : string} ).secure_url ;

        const createdEvent = await Event.create({
            ...event ,
            tags : tags ,
            agenda : agenda
        });

        return NextResponse.json({
            message : "Event created successfully ." ,
            event : createdEvent
        } , {status : 201})
        
    } catch (e) {

        console.error(e)

        return NextResponse.json({
            message : "Event Creation Faild" ,
            error : e  instanceof Error ? e.message : 'unkown' 
        } ,{ status : 400})
        
    }

}

export async function GET() {

    try {

        await connectDB();

        const events = await Event.find().sort({cretedAt : -1});


        return NextResponse.json({events})


        
    } catch (error) {

        return NextResponse.json({message : 'Event fetching faild ' , error : error} , {status : 500});
        
    }
    
}
import EventCard from "@/components/EventCard"
import ExploreBtn from "@/components/ExploreBtn"
import { IEvent } from "@/database/event.model";
import { events } from "@/lib/constans"
import { cacheLife } from "next/cache";
// 


// const events = [
//     {image : '/images/event1.png' , title : "Event 1"} ,
//     {image : '/images/event2.png' , title : "Event 2"} ,
    
// ]


const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

const Page = async () => {

const response = await fetch(`${BASE_URL}/api/events`);
    const {events} = await response.json();


    return (


<section>
    <h1 className="text-center">The Hub for Every Dev <br /> Event You Can't Miss</h1>
    <p className="text-center mt-5">Hackathons , Meetups , and Conferences , All in one Place</p>

    <ExploreBtn />

    <div className="mt-20 space-y-7">
        <h3>Featured Event's</h3>

        <ul className="events">
            {  events.map((event : IEvent)=>(
                <li key={event.title}>
                    <EventCard {...event} /> 
                </li>
            ))}
        </ul>
    </div>
</section>





    )
}

export default Page

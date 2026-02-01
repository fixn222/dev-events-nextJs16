import EventCard from "@/components/EventCard"
import ExploreBtn from "@/components/ExploreBtn"
import { IEvent } from "@/database/event.model";
// import { events } from "@/lib/constans"
import { cacheLife } from "next/cache";
import { notFound } from "next/navigation";
// 


// const events = [
//     {image : '/images/event1.png' , title : "Event 1"} ,
//     {image : '/images/event2.png' , title : "Event 2"} ,

// ]


const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

const Page = async () => {

    'use cache';
    cacheLife('hours');
    let events = {};


    try {

        const request = await fetch(`${BASE_URL}/api/events`, {
            next: { revalidate: 60 }
        });

        if (!request.ok) {

            if (request.status === 404) {

                return notFound();

            }

            throw new Error(`failed to fetch Events : ${request.statusText}`);


        }

        const response = await request.json();

        events = response.events

        // console.log(events)

        if (!events) return notFound();





    } catch (error) {
        console.error("error fetching event", error);

        return notFound();

    }



    return (


        <section>
            <h1 className="text-center">The Hub for Every Dev <br /> Event You Can't Miss</h1>
            <p className="text-center mt-5">Hackathons , Meetups , and Conferences , All in one Place</p>
            <ExploreBtn />

            <div className="mt-20 space-y-7">
                <h3>Featured Event's</h3>

                <ul className="events" >
                    {events.map((event: IEvent) => (
                        <li key={event.title} className="list-none">
                            <EventCard {...event} />
                        </li>
                    ))}
                </ul>
            </div>
        </section>





    )
}

export default Page

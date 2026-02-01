"use client"
import { createBooking } from '@/lib/actions/booking.action';
import { useState } from 'react'



const BookEvents = ({eventId , slug} : {eventId : string , slug : string} ) => {
    const [email, setEmail] = useState('');
    const [submitted, setSubmited] = useState(false);

    const handleSubmit = async (e : React.FormEvent) =>{

        e.preventDefault();
       
        const { success , error } = await createBooking({eventId , slug , email});

        if (success) {

            setSubmited(true);

            console.log(success);
            
        }else{
            console.error("Booking creation failfd" , error);
        }
       
       
    }

    return (
        <div id="book-event">
            {submitted ? (
                <p className="text-sm">Thank you for siging up !</p>
            ) : (
                <form onSubmit={handleSubmit}>
                    <div>
                        <label htmlFor="email" >Email Address</label>
                        <input type="email"
                            value={email}
                            id="email"
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>
                    <button type="submit" className="button-submint">Submit</button>

                </form>
            )}
        </div>

    )
}

export default BookEvents
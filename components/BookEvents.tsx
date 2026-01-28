"use client"
import { useState } from 'react'



const BookEvents = () => {
    const [email, setEmail] = useState('');
    const [submitted, setSubmited] = useState(false);

    const handleSubmit = (e : React.FormEvent) =>{
        e.preventDefault();

        setTimeout(()=>{
            setSubmited(true);
        }, 1000)
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
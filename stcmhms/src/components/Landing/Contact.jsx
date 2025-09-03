import React from 'react'
import './LandingCss/Contact.css'
import msg from '../../assets/msg-icon.png'
import mail from '../../assets/mail-icon.png'
import phone from '../../assets/phone-icon.png'
import loc from '../../assets/location-icon.png'
import arrow from '../../assets/white-arrow.png'

const Contact = () => {
  const [result, setResult] = React.useState("");

  const onSubmit = async (event) => {
    event.preventDefault();
    setResult("Sending....");
    const formData = new FormData(event.target);

    formData.append("access_key", "f1bdc74f-b896-4d15-a9c0-6137d06ff35b");

    const response = await fetch("https://api.web3forms.com/submit", {
      method: "POST",
      body: formData
    });

    const data = await response.json();

    if (data.success) {
      setResult("Email Sent Succesfully, Thankyou for improving our System!.");
      event.target.reset();
    } else {
      console.log("Error", data);
      setResult(data.message);
    }
  };

  return (
    <div className='contact'>
        <div className="contact-col">
            <h3>Send us a message <img src={msg} alt="" /></h3>
                <p> We'd love to hear from you!, Whether you have questions, suggestions, or feedback, feel free to reach out. Your input helps us grow and improve. Don't hesitate to contact us, we're here to listen and assist in any way we can.
                </p>
                <ul>
                    <li><img src={mail} alt="" />portgasron22@gmail.com</li>
                    <li><img src={phone} alt="" />+63 963 215 3082</li>
                    <li><img src={loc} alt="" />Kap. Ponso St. Poblacion II Bauan Batangas 4201 Bauan Calabarzon <br/>Region 4A, Philippines</li>
                </ul>
        </div>
        <div className="contact-col">
            <form onSubmit={onSubmit}>
                <label>Your Name</label>
                <input type='name' name='name' placeholder='Enter your name' required/>
                <label>Phone Number</label>
                <input type='tel' name='phone' placeholder='Enter your contact number' required/>
                <label>Write your message here</label>
                <textarea name='message' rows='6' required> </textarea>
                <button type='submit' className='btn btnx'>Submit now <img src={arrow} alt=''/></button>
            </form>
            <span>{result}</span>
        </div>
    </div>
  )
}

export default Contact

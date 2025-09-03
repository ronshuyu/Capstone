import './LandingCss/Why.css'
import why1 from '../../assets/proactive.png'
import why2 from '../../assets/secure.png'
import why3 from '../../assets/insightful.png'
import icon1 from '../../assets/secured.gif'
import icon2 from '../../assets/proactive.gif'
import icon3 from '../../assets/insight.gif'

const Why = () => {
  return (

   <div className='whys'>
      <div className='why'>
         <img src={why1} alt='' />
         <div className='caption'>
            <img src={icon2} alt=''/>
               <p>Proactivity</p> 
         </div>
      </div>
      <div className='why'>
         <img src={why2} alt='' />
         <div className='caption'>
            <img src={icon1} alt=''/>
               <p>Security</p>
         </div>
      </div>
      <div className='why'>
         <img src={why3} alt='' />
         <div className='caption'>
            <img src={icon3} alt=''/>
               <p>Insight</p>
         </div>
      </div>
      </div>

  )
}

export default Why

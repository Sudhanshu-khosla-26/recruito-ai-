import React from 'react'
import PreviousHMinterviewsList from './_components/PreviousHMinterviewsList' 
import Managers from './_components/Managers'

 
function Dashboard() {
    return (
        <div>
            {/* <WelcomeContainer /> */}
            <h2 className='my-3 font-bold text-xl'>Create HM Interivew</h2>
            <Managers />

            <PreviousHMinterviewsList />

        </div>
    )
}
 
export default Dashboard

"use client"
import React, { useState } from 'react'

function InterviewLayout({ children }) {
    return (
        <div className='bg-secondary'>
            {/* <InterviewHeader /> */}
            {children}
        </div>
    )
}

export default InterviewLayout
import React from 'react'
import Avatar from 'react-avatar';

const Client = ({username}) => {
  return (
    <div className='flex items-center mb-3'>

        <Avatar name={username.toString() } size={50} round="14px" 
        className='mr-3 p-4'
        />

        <span className='mx-2 p-2 text-xl'>{username.toString()}</span>
      
    </div>
  )
}

export default Client

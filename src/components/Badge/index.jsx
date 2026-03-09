import React from 'react'

const Badge = (props) => {
  return (
    <span
      className={`inline-flex items-center justify-center gap-1 py-1 px-4 rounded-full text-[11px] capitalize text-white 
      ${props.status === 'Processing'
        ? 'bg-yellow-500'
        : props.status === 'Completed'
        ? 'bg-green-500'
        : 'bg-red-500'
      }`}
    >
      {props.status}
    </span>
  )
}

export default Badge

import React from 'react'

export const metadata={
    title:'Brand | Dashboard',
    description:'Brand Page'
}

const layout = ({children}) => {
  return (
    <div className='w-full'>
      {children}
    </div>
  )
}

export default layout

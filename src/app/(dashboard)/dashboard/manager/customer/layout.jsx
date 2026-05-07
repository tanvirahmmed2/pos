import React from 'react'

export const metadata={
    title:'Customer | Dashboard',
    description:'Customer Page'
}

const layout = ({children}) => {
  return (
    <div className='w-full'>
      {children}
    </div>
  )
}

export default layout

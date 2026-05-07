import React from 'react'

export const metadata={
    title:'Role Management | Dashboard',
    description:'Role Management Page'
}

const layout = ({children}) => {
  return (
    <div className='w-full'>
      {children}
    </div>
  )
}

export default layout

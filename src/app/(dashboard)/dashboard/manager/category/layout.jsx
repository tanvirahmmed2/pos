import React from 'react'

export const metadata={
    title:'Category | Dashboard',
    description:'Category Page'
}

const layout = ({children}) => {
  return (
    <div className='w-full'>
      {children}
    </div>
  )
}

export default layout

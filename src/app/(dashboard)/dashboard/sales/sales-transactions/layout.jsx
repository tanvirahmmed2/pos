import React from 'react'

export const metadata={
    title:'New Product | Dashboard',
    description:'New Product Page'
}

const layout = ({children}) => {
  return (
    <div className='w-full'>
      {children}
    </div>
  )
}

export default layout

import Header from '@/components/Header'
import Mobilenavigation from '@/components/Mobilenavigation'
import Sidebar from '@/components/Sidebar'
import { getCurrentUser } from '@/lib/actions/user.action'
import { redirect } from 'next/navigation'
import React from 'react'
import { Toaster } from "@/components/ui/toaster"


const Layout = async ({children}: {children: React.ReactNode}) => {
    const currentUser = await getCurrentUser()
    console.log(currentUser)
     if(!currentUser) redirect("/sign-in")
  return (
    <main className='flex h-screen'>
        <Sidebar {...currentUser}/>

        <section className='flex h-full flex-col flex-1 h-full'>
            <Mobilenavigation {...currentUser}/>
            <Header {...currentUser} />
            <div className="main-content">
                {children}
            </div>
        </section>

        <Toaster/>
    </main>
  )
}

export default Layout
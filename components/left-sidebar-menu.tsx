import React from 'react'

import { currentProfile } from '@/lib/current-profile'

import LeftSidebarMenuItemsList from './left-sidebar-menu-items-list'
import { ProfileDrawer } from './profil-drawer-server'

const LeftSidebarMenu: React.FC = async () => {
  const profile = await currentProfile()

  return (
    <div className="flex h-full flex-col rounded-[25px] border bg-white/5 xl:w-[255px]">
      <div className="flex w-full flex-1 flex-col ">
        {profile && <ProfileDrawer />}

        <LeftSidebarMenuItemsList />
      </div>
      <div className="flex items-center justify-center border-t border-[#53acff28] p-5">
        <img className="mx-auto w-[140px]" src="/logo-text.png" alt="Biples" />
      </div>
    </div>
  )
}

export default LeftSidebarMenu

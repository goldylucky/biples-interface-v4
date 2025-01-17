import { ServerSidebar } from '../server/server-sidebar'

interface ChatHeaderProps {
  serverId: string
  name: string
  type: 'channel' | 'conversation'
  imageUrl?: string
}

export const ChatHeader = ({
  serverId,
  name,
  type,
  imageUrl,
}: ChatHeaderProps) => {
  return (
    <div className="text-md relative flex h-auto w-full items-center px-3 py-2 font-semibold">
      {/*
<MobileToggle serverId={serverId} />
      {type === "channel" && (
        <Hash className="w-5 h-5 mr-2 text-zinc-500 dark:text-zinc-400" />
      )}
      {type === "conversation" && (
        <UserAvatar 
          src={imageUrl}
          className="w-8 h-8 mr-2 md:h-8 md:w-8"
        />
      )}
      <p className="font-semibold text-black text-md dark:text-white">
        {name}
      </p>
      <div className="flex items-center ml-auto">
        {type === "conversation" && (
          <ChatVideoButton />
        )}
        <SocketIndicator />
      </div>
        */}
      <div className="flex-1">
        <ServerSidebar serverId={serverId} />
      </div>
    </div>
  )
}

'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import type { Member, Profile } from '@prisma/client'
import { MemberRole } from '@prisma/client'
import axios from 'axios'
import { Edit, FileIcon, ShieldAlert, ShieldCheck, Trash } from 'lucide-react'
import Image from 'next/image'
import { useParams, useRouter } from 'next/navigation'
import qs from 'query-string'
import { useEffect, useState } from 'react'
// import { ContextMenu, MenuItem, ContextMenuTrigger } from "react-contextmenu";
import { useForm } from 'react-hook-form'
import * as z from 'zod'

import { ActionTooltip } from '@/components/action-tooltip'
import { Button } from '@/components/ui/button'
import { Form, FormControl, FormField, FormItem } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { UserAvatar } from '@/components/user-avatar'
import { useModal } from '@/hooks/use-modal-store'
import { cn } from '@/lib/utils'

interface ChatItemProps {
  id: string
  content: string
  member: Member & {
    profile: Profile
  }
  timestamp: string
  fileUrl: string | null
  deleted: boolean
  currentMember: Member
  isUpdated: boolean
  socketUrl: string
  socketQuery: Record<string, string>
}

const roleIconMap = {
  GUEST: null,
  MODERATOR: <ShieldCheck className="ml-2 h-4 w-4 text-indigo-500" />,
  ADMIN: <ShieldAlert className="ml-2 h-4 w-4 text-rose-500" />,
}

const formSchema = z.object({
  content: z.string().min(1),
})

export const ChatItem = ({
  id,
  content,
  member,
  timestamp,
  fileUrl,
  deleted,
  currentMember,
  isUpdated,
  socketUrl,
  socketQuery,
}: ChatItemProps) => {
  const [isEditing, setIsEditing] = useState(false)
  const { onOpen } = useModal()
  const params = useParams()
  const router = useRouter()

  const onMemberClick = () => {
    if (member.id === currentMember.id) {
      return
    }

    router.push(`/servers/${params?.serverId}/conversations/${member.id}`)
  }

  useEffect(() => {
    const handleKeyDown = (event: any) => {
      if (event.key === 'Escape' || event.keyCode === 27) {
        setIsEditing(false)
      }
    }

    window.addEventListener('keydown', handleKeyDown)

    return () => window.removeEventListener('keyDown', handleKeyDown)
  }, [])

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      content: content,
    },
  })

  const isLoading = form.formState.isSubmitting

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      const url = qs.stringifyUrl({
        url: `${socketUrl}/${id}`,
        query: socketQuery,
      })

      await axios.patch(url, values)

      form.reset()
      setIsEditing(false)
    } catch (error) {
      console.log(error)
    }
  }

  useEffect(() => {
    form.reset({
      content: content,
    })
  }, [content])

  const fileType = fileUrl?.split('.').pop()

  const isAdmin = currentMember.role === MemberRole.ADMIN
  const isModerator = currentMember.role === MemberRole.MODERATOR
  const isOwner = currentMember.id === member.id
  const canDeleteMessage = !deleted && (isAdmin || isModerator || isOwner)
  const canEditMessage = !deleted && isOwner && !fileUrl
  const isPDF = fileType === 'pdf' && fileUrl
  const isImage = !isPDF && fileUrl

  function handleClick() {
    console.log('clicked')
  }

  return (
    <>
      {/* <ContextMenuTrigger id="replyer"> */}
      <div className="group relative flex w-full items-center p-4 transition hover:bg-black/5">
        <div className="group flex w-full items-start gap-x-2">
          <div
            onClick={onMemberClick}
            className="cursor-pointer transition hover:drop-shadow-md"
          >
            <UserAvatar src={member.profile.imageUrl} />
          </div>
          <div className="flex w-full flex-col">
            <div className="flex items-center gap-x-2">
              <div className="flex items-center">
                <p
                  onClick={onMemberClick}
                  className="cursor-pointer text-sm font-semibold hover:underline"
                >
                  {member.profile.name}
                </p>
                <ActionTooltip label={member.role}>
                  {roleIconMap[member.role]}
                </ActionTooltip>
              </div>
              <span className="text-xs text-[#334B61]">{timestamp}</span>
            </div>
            {isImage && (
              <a
                href={fileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="relative mt-2 flex aspect-square h-48 w-48 items-center overflow-hidden rounded-md border bg-secondary"
              >
                <Image
                  src={fileUrl}
                  alt={content}
                  fill
                  className="object-cover"
                />
              </a>
            )}
            {isPDF && (
              <div className="relative mt-2 flex items-center rounded-md bg-background/10 p-2">
                <FileIcon className="h-10 w-10 fill-indigo-200 stroke-indigo-400" />
                <a
                  href={fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ml-2 text-sm text-indigo-500 hover:underline dark:text-indigo-400"
                >
                  PDF File
                </a>
              </div>
            )}
            {!fileUrl && !isEditing && (
              <p
                className={cn(
                  'text-sm text-zinc-600 dark:text-zinc-300',
                  deleted &&
                    'mt-1 text-xs italic text-zinc-500 dark:text-zinc-400',
                )}
              >
                {content}
                {isUpdated && !deleted && (
                  <span className="mx-2 text-[10px] text-zinc-500 dark:text-zinc-400">
                    (edited)
                  </span>
                )}
              </p>
            )}
            {!fileUrl && isEditing && (
              <Form {...form}>
                <form
                  className="flex w-full items-center gap-x-2 pt-2"
                  onSubmit={form.handleSubmit(onSubmit)}
                >
                  <FormField
                    control={form.control}
                    name="content"
                    render={({ field }) => (
                      <FormItem className="flex-1">
                        <FormControl>
                          <div className="relative w-full">
                            <Input
                              disabled={isLoading}
                              className="border-0 border-none bg-zinc-200/90 p-2 text-zinc-600 focus-visible:ring-0 focus-visible:ring-offset-0 dark:bg-zinc-700/75 dark:text-zinc-200"
                              placeholder="Edited message"
                              {...field}
                            />
                          </div>
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <Button disabled={isLoading} size="sm" variant="primary">
                    Save
                  </Button>
                </form>
                <span className="mt-1 text-[10px] text-zinc-400">
                  Press escape to cancel, enter to save
                </span>
              </Form>
            )}
          </div>
        </div>
        {canDeleteMessage && (
          <div className="absolute -top-0 right-5 hidden items-center gap-x-2 rounded-sm border bg-white p-1 group-hover:flex dark:bg-zinc-800">
            {canEditMessage && (
              <ActionTooltip label="Edit">
                <Edit
                  onClick={() => setIsEditing(true)}
                  className="ml-auto h-4 w-4 cursor-pointer text-zinc-500 transition hover:text-zinc-600 dark:hover:text-zinc-300"
                />
              </ActionTooltip>
            )}
            <ActionTooltip label="Delete">
              <Trash
                onClick={() =>
                  onOpen('deleteMessage', {
                    apiUrl: `${socketUrl}/${id}`,
                    query: socketQuery,
                  })
                }
                className="ml-auto h-4 w-4 cursor-pointer text-zinc-500 transition hover:text-zinc-600 dark:hover:text-zinc-300"
              />
            </ActionTooltip>
          </div>
        )}
      </div>
      {/* </ContextMenuTrigger> */}
      {/* <ContextMenu id="replyer">
        <div className="z-50 flex flex-col p-3 rounded-lg bg-white/5">
          <div onClick={() => handleClick()}>ContextMenu Item 1</div>
          <div onClick={() => handleClick()}>ContextMenu Item 2</div>
          <MenuItem divider />
          <div onClick={() => handleClick()}>ContextMenu Item 3</div>
        </div>
      </ContextMenu> */}
    </>
  )
}

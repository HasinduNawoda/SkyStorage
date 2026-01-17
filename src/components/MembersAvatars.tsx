import { Avatar, AvatarGroup } from "@chakra-ui/react"
import { useState, useRef, useEffect } from "react"

const colorPalette = ["red", "blue", "green", "yellow", "purple", "orange"]

const pickPalette = (email: string) =>
  colorPalette[email.charCodeAt(0) % colorPalette.length]

const MAX = 4

const MembersAvatars = ({ emails }: { emails: string[] }) => {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }

    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [])

  const visible = emails.slice(0, MAX)

  return (
    <div ref={ref} className="relative">
      <div
        onClick={() => setOpen(prev => !prev)}
        className="cursor-pointer justify-center items-center flex"
      >
        <AvatarGroup gap="0" spaceX="-3" size="sm">
          {visible.map((email, i) => (
            <Avatar.Root key={i} colorPalette={pickPalette(email)}>
              <Avatar.Fallback name={email} />
            </Avatar.Root>
          ))}

          {emails.length > MAX && (
            <Avatar.Root>
              <Avatar.Fallback name={`+${emails.length - MAX}`} />
            </Avatar.Root>
          )}
        </AvatarGroup>
      </div>

      {open && (
        <div className="absolute z-50 mt-2 w-max rounded-md border cursor-default bg-neutral-800 p-3 shadow-lg">
          {emails.map((email, i) => (
            <div key={i} className="text-sm text-white">
              {email}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default MembersAvatars

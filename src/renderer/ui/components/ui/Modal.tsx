//Libs
import React, { useEffect, useRef } from "react"

//Imports
import { cn } from "@/Lib/utils/utils"
import { Button } from "./Button"

//Types
type ModalProps = {
  isOpen: boolean
  onClose: () => void
  title: string
  children: React.ReactNode
  className?: string
}

//Main
export const Modal = ({ isOpen, onClose, title, children, className }: ModalProps) => {
  const modalRef = useRef<HTMLDivElement>(null)

  useEffect(function () {
    function handleEscape(e: KeyboardEvent) {
      if (e.key === "Escape") onClose()
    }

    if (isOpen) {
      document.addEventListener("keydown", handleEscape)
      document.body.style.overflow = "hidden"
    }

    return function () {
      document.removeEventListener("keydown", handleEscape)
      document.body.style.overflow = "unset"
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  function handleBackdropClick(e: React.MouseEvent) {
    if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
      onClose()
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200"
      onClick={handleBackdropClick}
    >
      <div
        ref={modalRef}
        className={cn(
          "w-full max-w-lg bg-zinc-900 border border-zinc-800 rounded-xl shadow-2xl animate-in zoom-in-95 duration-200 overflow-hidden flex flex-col max-h-[85vh]",
          className
        )}
      >
        <div className="flex items-center justify-between p-4 border-b border-zinc-800 bg-zinc-900/50">
          <h2 className="text-xl font-semibold text-zinc-100">{title}</h2>
          <Button variant="ghost" onClick={onClose} className="h-8 w-8 hover:bg-zinc-800 text-zinc-600">
            X
          </Button>
        </div>
        <div className="p-6 overflow-y-auto">
          {children}
        </div>
      </div>
    </div>
  )
}

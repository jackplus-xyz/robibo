import { OPENAI_API_URL } from "@/constants"
import cssText from "data-text:~style.css"
import { motion } from "framer-motion"
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  CopyIcon,
  GlobeIcon,
  NotebookPenIcon
} from "lucide-react"
import type { PlasmoCSConfig } from "plasmo"
import { useEffect, useState } from "react"

export const config: PlasmoCSConfig = {
  matches: ["https://www.youtube.com/watch*"],
  all_frames: true
}

export interface PopupMessage {
  title: string
  message: string
}

let API_TOKEN = ""
let SELECTED_LANGUAGE = ""

chrome.storage.sync.get(
  ["githubCopilotToken", "selectedLanguage"],
  (result) => {
    API_TOKEN = result.githubCopilotToken || ""
    SELECTED_LANGUAGE = result.selectedLanguage || ""
  }
)

export const getStyle = () => {
  const style = document.createElement("style")
  style.textContent = cssText
  return style
}

export const getShadowHostId = () => "plasmo-robibo"

const FloatMenu = () => {
  const [isOpen, setIsOpen] = useState(true)
  const [isPopup, setIsPopup] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [popupMessage, setPopupMessage] = useState({ title: "", message: "" })

  const buttonClass =
    "p-2 hover:bg-slate-200 hover:scale-105 rounded-2xl disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"

  const popupVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
    fadeout: { opacity: 0, y: 20, transition: { duration: 0.5 } }
  }

  const toggleMenu = () => setIsOpen(!isOpen)

  const togglePopup = (message: PopupMessage) => {
    setPopupMessage(message)
    setIsPopup(true)
    setTimeout(() => {
      setIsPopup(false)
    }, 3000)
  }

  const handleCopyClick = async () => {
    try {
      setIsLoading(true)
      const message = await copyTranscriptToClipboard()
      setIsLoading(false)
      togglePopup(message)
    } catch (error) {
      console.error("Error copying transcript:", error)
      setIsLoading(false)
      togglePopup({ title: "Error", message: error.message })
    }
  }

  return (
    <div
      className={`fixed bottom-16 right-12 flex min-h-[40px] min-w-[40px] flex-col items-center justify-center rounded-2xl bg-slate-100 p-4 text-2xl shadow-md transition duration-300 ease-in-out ${
        isOpen
          ? "min-w-[400px]"
          : "min-w-[40px] bg-opacity-5 hover:bg-opacity-100"
      }`}>
      {isPopup && (
        <motion.div
          initial="hidden"
          animate={isPopup ? "visible" : "fadeout"}
          variants={popupVariants}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className="absolute bottom-full right-0 mb-4 flex min-h-[100px]  min-w-[200px] flex-col items-start justify-center rounded-2xl bg-slate-100 p-8 text-2xl shadow-lg">
          <div className="text-2xl font-bold">{popupMessage.title}</div>
          <div className="text-xl">{popupMessage.message}</div>
        </motion.div>
      )}
      <div className="flex items-center justify-center space-x-4">
        {isOpen ? (
          <>
            <button
              onClick={toggleMenu}
              className={buttonClass}
              disabled={isLoading}>
              <ChevronRightIcon />
            </button>
            {/* <button */}
            {/*   onClick={toggleMenu} */}
            {/*   className={buttonClass} */}
            {/*   disabled={isLoading}> */}
            {/*   <NotebookPenIcon /> */}
            {/* </button> */}
            {/* <button */}
            {/*   onClick={toggleMenu} */}
            {/*   className={buttonClass} */}
            {/*   disabled={isLoading}> */}
            {/*   <GlobeIcon /> */}
            {/* </button> */}
            <button
              onClick={handleCopyClick}
              className={buttonClass}
              disabled={isLoading}>
              <CopyIcon />
            </button>
            {isLoading && (
              <div className="flex h-10 w-10 items-center justify-center">
                <svg
                  className="h-full w-full animate-spin text-primary"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24">
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              </div>
            )}
          </>
        ) : (
          <button
            onClick={toggleMenu}
            className={`${buttonClass} hover:bg-transparent`}>
            <ChevronLeftIcon />
          </button>
        )}
      </div>
    </div>
  )
}

export default FloatMenu

async function getTranscript(
  retries = 3,
  minTimeout = 1000,
  maxTimeout = 2000
) {
  const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

  try {
    const expandDescriptionButton = document.querySelector(
      "#expand"
    ) as HTMLButtonElement
    if (expandDescriptionButton) expandDescriptionButton.click()

    await wait(
      Math.floor(Math.random() * (maxTimeout - minTimeout + 1)) + minTimeout
    )

    const expandTranscriptButton = document.querySelector(
      "#primary-button button"
    ) as HTMLButtonElement
    if (expandTranscriptButton) expandTranscriptButton.click()

    await wait(
      Math.floor(Math.random() * (maxTimeout - minTimeout + 1)) + minTimeout
    )

    const transcriptSegments = document.querySelectorAll(
      "ytd-transcript-segment-renderer"
    )
    if (!transcriptSegments.length) {
      if (retries > 0) {
        return await getTranscript(retries - 1, minTimeout, maxTimeout)
      } else {
        throw new Error("No transcript segments found after multiple retries.")
      }
    }

    const transcriptText = Array.from(transcriptSegments)
      .map((segment) =>
        segment.querySelector(".segment-text").textContent.trim()
      )
      .join(" ")
      .replace(/\s+/g, " ")
      .replace(/&/g, "&amp;")
      .replace(/"/g, "&quot;")

    return transcriptText
  } catch (error) {
    console.error("Error retrieving transcript:", error)
    throw error
  }
}

async function copyTranscriptToClipboard() {
  try {
    const transcriptText = await getTranscript()
    const permissionStatus = await navigator.permissions.query({
      name: "clipboard-write" as PermissionName
    })

    if (
      permissionStatus.state !== "granted" &&
      permissionStatus.state !== "prompt"
    ) {
      throw new Error("Clipboard permission denied.")
    }

    window.focus()
    await navigator.clipboard.writeText(transcriptText)

    return { title: "Success", message: "Transcript copied to clipboard." }
  } catch (err) {
    console.error("Could not copy transcript: ", err)
    throw err
  }
}

async function summarizeTranscript(language = "en") {
  try {
    const transcriptText = await getTranscript()

    if (!API_TOKEN) {
      throw new Error("API token not found.")
    }

    const response = await fetch(`${OPENAI_API_URL}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${API_TOKEN}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        messages: []
      })
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()
    const summary = data.choices[0].message.content.trim()
    const summaryTitle = summary.split("\n")[0].replace(/#/g, "").trim()
    const summaryText = summary.split("\n").slice(1).join("\n").trim()
    const summaryHtml = await markdownToHtml(summaryText)

    return { title: summaryTitle, message: summaryHtml }
  } catch (error) {
    console.error("Error summarizing transcript:", error)
  }
}

async function markdownToHtml(markdown) {
  try {
    const response = await fetch("https://api.github.com/markdown", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        text: markdown
      })
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const html = await response.text()
    return html
  } catch (error) {
    console.error("Error converting markdown to HTML:", error)
    return markdown // return the original markdown text if conversion fails
  }
}

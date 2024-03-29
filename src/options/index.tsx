import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select"

import "@/style.css"

import { Separator } from "@/components/ui/separator"
import { BotIcon, EyeIcon, EyeOffIcon } from "lucide-react"
import { useEffect, useState, type ChangeEvent } from "react"

const LANGUAGE_OPTIONS = [
  { value: "en", label: "English" },
  { value: "es", label: "Spanish" },
  { value: "fr", label: "French" },
  { value: "de", label: "German" },
  { value: "zh-tw", label: "Traditional Chinese" }
]

const OPEN_API_TOKEN_KEY = "openaiApiToken"
const SELECTED_LANGUAGE_KEY = "selectedLanguage"

function OptionsIndex() {
  const [token, setToken] = useState("")
  const [language, setLanguage] = useState("en")
  const [showToken, setShowToken] = useState(false)
  const [placeholder, setPlaceholder] = useState("Enter token")
  const [isSettingsSaved, setIsSettingsSaved] = useState(false)
  const [isTranslate, setIsTranslate] = useState(false)

  useEffect(() => {
    chrome.storage.sync.get(
      [OPEN_API_TOKEN_KEY, SELECTED_LANGUAGE_KEY],
      (result) => {
        if (result[OPEN_API_TOKEN_KEY]) {
          setToken(result[OPEN_API_TOKEN_KEY])
        }

        if (result[SELECTED_LANGUAGE_KEY]) {
          setLanguage(result[SELECTED_LANGUAGE_KEY])
        } else {
          setLanguage("en")
          chrome.storage.sync.set({
            [SELECTED_LANGUAGE_KEY]: "en"
          })
        }
      }
    )
  }, [])

  const handleTokenChange = (e: ChangeEvent<HTMLInputElement>) => {
    setToken(e.target.value)
  }

  const toggleTokenVisibility = () => {
    setShowToken(!showToken)
  }

  const handleInputClick = () => {
    if (!showToken) {
      setShowToken(true)
      setToken("")
      setPlaceholder("")
    }
  }

  const saveSettings = (newToken = token, newLanguage = language) => {
    chrome.storage.sync.set(
      {
        [OPEN_API_TOKEN_KEY]: newToken,
        [SELECTED_LANGUAGE_KEY]: newLanguage
      },
      () => {
        setIsSettingsSaved(true)
        setTimeout(() => {
          setIsSettingsSaved(false)
        }, 3000)
      }
    )
  }

  const resetSettings = () => {
    saveSettings("", "en")
    setShowToken(false)
    setPlaceholder("Enter token")
  }

  return (
    <div className="relative flex h-screen items-center justify-center bg-gradient-to-b from-slate-200 to-slate-100 font-sans antialiased">
      <Card className="min-w-[400px] shadow-md">
        <CardHeader>
          <CardTitle>
            <div className="flex items-center">
              <BotIcon className="mr-2 h-8 w-8" />
              Robibo
            </div>
          </CardTitle>
          <CardDescription>
            Your AI assistant to copy and summarize Youtube video transcript.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mt-4 text-base font-bold">Token</div>
          <div className="text-sm">Your OpenAI API token</div>
          <div className="my-4 flex items-center">
            <Input
              onChange={handleTokenChange}
              value={showToken ? token : "***************"}
              type={showToken ? "text" : "password"}
              placeholder={placeholder}
              onClick={handleInputClick}
            />
            <div className="mx-2" onClick={toggleTokenVisibility}>
              {showToken ? (
                <EyeOffIcon className="h-6 w-6 text-gray-500" />
              ) : (
                <EyeIcon className="h-6 w-6 text-gray-500" />
              )}
            </div>
          </div>
          <div className="flex flex-col items-start justify-center space-y-4">
            <div className="mt-4 text-base font-bold">Options</div>
            <span className="flex items-center justify-center text-sm">
              <Checkbox
                checked={isTranslate}
                onCheckedChange={(checked) => setIsTranslate(checked === true)}
                className="mr-2"
              />
              Translate the summary(by default, it will be in English.)
            </span>
            {isTranslate && (
              <div className="flex flex-col space-y-2">
                <div className="text-sm">
                  The language to translate the text to:
                </div>
                <Select value={language} onValueChange={setLanguage}>
                  <SelectTrigger className="min-w-[180px]">
                    <SelectValue placeholder="Language" />
                  </SelectTrigger>
                  <SelectContent>
                    {LANGUAGE_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
        </CardContent>
        <CardFooter>
          <div className="flex w-full flex-col items-center justify-center">
            {isSettingsSaved && (
              <div className="mb-4 text-sm text-green-500">
                Settings saved successfully!
              </div>
            )}
            <div className="flex justify-center">
              <Button className="mr-4" onClick={() => saveSettings()}>
                Save Settings
              </Button>
              <Button onClick={resetSettings} variant="outline">
                Reset Settings
              </Button>
            </div>
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}

export default OptionsIndex

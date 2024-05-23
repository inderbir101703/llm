import { createReadStream } from "fs";
import OpenAI from "openai";
import { Models } from "openai/resources";
const openAi=new OpenAI({apiKey:process.env.OPENAI_API_KEY})

async function createTranscription() {
    const response= await openAi.audio.transcriptions.create({
        file:createReadStream('m4a.m4a'),
        model:'whisper-1',
        language:'en'
    })
    console.log(response)
    
}
async function translate() {
    const response=await openAi.audio.translations.create({
        file:createReadStream('french.mp3'),
        model:'whisper-1'
    })
    console.log(response)
}
translate()